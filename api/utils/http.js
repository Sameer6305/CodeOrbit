function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ensureMethod(req, res, method = "GET") {
  if (req.method !== method) {
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}

export function sendError(res, status, message, details) {
  const body = { error: message };
  if (details) body.details = details;
  return res.status(status).json(body);
}

export function createLogger(route) {
  const base = { route };

  return {
    info(message, meta = {}) {
      console.log(JSON.stringify({ level: "info", message, ...base, ...meta }));
    },
    warn(message, meta = {}) {
      console.warn(JSON.stringify({ level: "warn", message, ...base, ...meta }));
    },
    error(message, meta = {}) {
      console.error(JSON.stringify({ level: "error", message, ...base, ...meta }));
    },
  };
}

export function extractBearerToken(req) {
  const authHeader = req.headers?.authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export async function requireAuthenticatedUser(req, res, supabase, expectedUserId) {
  const token = extractBearerToken(req);
  if (!token) {
    sendError(res, 401, "Missing bearer token");
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    sendError(res, 401, "Invalid auth token");
    return null;
  }

  if (expectedUserId && data.user.id !== String(expectedUserId)) {
    sendError(res, 403, "Forbidden: user mismatch");
    return null;
  }

  return data.user;
}

export async function withRetry(fn, options = {}) {
  const retries = Number.isInteger(options.retries) ? options.retries : 1;
  const baseDelayMs = Number.isInteger(options.baseDelayMs) ? options.baseDelayMs : 250;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const status = error?.response?.status;
      const retryable = !status || status >= 500 || status === 429;
      if (!retryable || attempt === retries) {
        break;
      }

      await delay(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError;
}

export function applyCors(req, res) {
  const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN;
  const requestOrigin = req.headers?.origin;

  if (allowedOrigin && requestOrigin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
