/**
 * Database Health Monitor
 *
 * Implements a Circuit Breaker + Exponential Backoff with Jitter pattern
 * to proactively warm up the Supabase connection and gracefully handle
 * database cold-starts (common on free-tier hosted databases).
 *
 * Circuit Breaker States:
 *   CLOSED   → DB is healthy; all requests flow through normally.
 *   WARMING  → Actively retrying connection after a cold start.
 *   OPEN     → Too many consecutive failures; requests are blocked to
 *              avoid hammering an unresponsive DB.
 *   HALF_OPEN→ Cooldown expired; sending a probe request to check recovery.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_WARMUP_RETRIES = 5;
const BASE_DELAY_MS = 800;          // initial backoff delay
const MAX_DELAY_MS = 12_000;        // cap at 12 s
const CIRCUIT_COOLDOWN_MS = 30_000; // reopen circuit after 30 s

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {'idle' | 'warming' | 'ready' | 'open' | 'half_open'} */
let _status = "idle";
let _lastError = null;
let _circuitOpenedAt = null;
let _warmupPromise = null;

/** @type {Set<(status: string) => void>} */
const _listeners = new Set();

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Exponential backoff with full jitter.
 * Prevents "thundering herd" by randomising the retry interval.
 * Formula: random(0, min(cap, base * 2^attempt))
 *
 * @param {number} attempt – zero-indexed retry attempt
 * @returns {number} milliseconds to wait
 */
function jitteredBackoff(attempt) {
  const ceiling = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  return Math.floor(Math.random() * ceiling);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Pub/Sub ──────────────────────────────────────────────────────────────────

/**
 * Subscribe to DB status changes.
 * The callback is invoked immediately with the current status,
 * then again on every transition.
 *
 * @param {(status: string) => void} listener
 * @returns {() => void} unsubscribe function
 */
export function subscribeDbHealth(listener) {
  _listeners.add(listener);
  listener(_status); // emit current state immediately
  return () => _listeners.delete(listener);
}

export function getDbStatus() {
  return _status;
}

export function getLastDbError() {
  return _lastError;
}

function _emit(status) {
  _status = status;
  _listeners.forEach((fn) => fn(status));
}

// ─── Circuit Breaker Logic ────────────────────────────────────────────────────

function _isCircuitOpen() {
  if (_status !== "open") return false;

  // Auto-transition to HALF_OPEN after the cooldown expires
  if (Date.now() - _circuitOpenedAt >= CIRCUIT_COOLDOWN_MS) {
    _emit("half_open");
    return false;
  }

  return true;
}

function _tripCircuit(error) {
  _lastError = error;
  _circuitOpenedAt = Date.now();
  _emit("open");
  console.warn("[CodeOrbit] DB circuit OPEN – backing off for", CIRCUIT_COOLDOWN_MS / 1000, "s");
}

// ─── Core: Warmup with Retry ──────────────────────────────────────────────────

/**
 * Proactively warms up the database connection.
 * Idempotent – calling it multiple times returns the same promise
 * while a warmup is in progress.
 *
 * @param {() => Promise<void>} pingFn – lightweight DB probe function
 * @returns {Promise<void>}
 */
export function warmupDatabase(pingFn) {
  // Already healthy – nothing to do
  if (_status === "ready") return Promise.resolve();

  // Circuit is open – don't spam the DB
  if (_isCircuitOpen()) {
    return Promise.reject(new Error("Circuit open – database unavailable"));
  }

  // Deduplicate concurrent warmup calls
  if (_warmupPromise) return _warmupPromise;

  _warmupPromise = _runWarmup(pingFn).finally(() => {
    _warmupPromise = null;
  });

  return _warmupPromise;
}

async function _runWarmup(pingFn) {
  _emit("warming");
  _lastError = null;

  for (let attempt = 0; attempt <= MAX_WARMUP_RETRIES; attempt++) {
    try {
      await pingFn();
      _emit("ready");
      _lastError = null;
      console.info("[CodeOrbit] DB connection ready" + (attempt > 0 ? ` (attempt ${attempt + 1})` : ""));
      return;
    } catch (err) {
      _lastError = err;
      console.warn(
        `[CodeOrbit] DB warmup attempt ${attempt + 1}/${MAX_WARMUP_RETRIES + 1} failed:`,
        err?.message ?? err
      );

      if (attempt < MAX_WARMUP_RETRIES) {
        const delay = jitteredBackoff(attempt);
        console.info(`[CodeOrbit] Retrying in ${(delay / 1000).toFixed(1)}s…`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted → trip the circuit breaker
  _tripCircuit(_lastError);
  throw _lastError;
}

// ─── Reset (useful for testing / manual retry) ────────────────────────────────

/**
 * Resets the health monitor back to its initial idle state.
 * Call this if you want to allow a fresh warmup attempt after an OPEN circuit.
 */
export function resetDbHealth() {
  _status = "idle";
  _lastError = null;
  _circuitOpenedAt = null;
  _warmupPromise = null;
  _listeners.forEach((fn) => fn(_status));
}
