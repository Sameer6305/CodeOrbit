import { create } from "zustand";
import { supabase } from "../lib/supabase";

// ─── Retry helper ────────────────────────────────────────────────────────────
const MAX_AUTH_RETRIES = 3;
const BASE_AUTH_DELAY_MS = 600;

/**
 * Retries an async Supabase auth call with exponential backoff.
 * Only retries on network / server errors, never on credential errors
 * (e.g. wrong password – code "invalid_credentials").
 */
async function withAuthRetry(fn) {
  const NON_RETRYABLE = new Set([
    "invalid_credentials",
    "email_not_confirmed",
    "user_not_found",
    "over_email_send_rate_limit",
  ]);

  let lastResult = null;

  for (let attempt = 0; attempt <= MAX_AUTH_RETRIES; attempt++) {
    try {
      const result = await fn();
      lastResult = result;

      // Success or a user-facing error we must NOT silently retry
      if (!result.error || NON_RETRYABLE.has(result.error.code)) {
        return result;
      }

      if (attempt < MAX_AUTH_RETRIES) {
        const delay = BASE_AUTH_DELAY_MS * 2 ** attempt;
        console.warn(
          `[CodeOrbit] Auth attempt ${attempt + 1} failed (${result.error.message}). Retrying in ${delay}ms…`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    } catch (networkErr) {
      // "Failed to fetch" and other hard network errors throw instead of
      // returning { error }. Treat them as retryable transient failures.
      console.warn(
        `[CodeOrbit] Auth attempt ${attempt + 1} threw a network error: ${networkErr.message}`
      );
      lastResult = {
        data: { user: null, session: null },
        error: {
          message: networkErr.message.includes("fetch")
            ? "Unable to reach the server. Please check your connection and try again."
            : networkErr.message,
          code: "network_error",
        },
      };

      if (attempt < MAX_AUTH_RETRIES) {
        const delay = BASE_AUTH_DELAY_MS * 2 ** attempt;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  return lastResult;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  loadUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, loading: false });
    } catch (error) {
      console.error("[CodeOrbit] Error loading user:", error);
      set({ user: null, loading: false });
    }
  },

  /** Email/password sign-in with automatic retry on transient failures. */
  login: async (email, password) => {
    return withAuthRetry(() =>
      supabase.auth.signInWithPassword({ email, password })
    );
  },

  /** Email/password sign-up with automatic retry on transient failures. */
  signup: async (email, password, metadata = {}) => {
    return withAuthRetry(() =>
      supabase.auth.signUp({ email, password, options: { data: metadata } })
    );
  },

  /** OAuth redirect – no retry needed (user triggers it manually). */
  loginWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
