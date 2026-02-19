import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log clearly instead of crashing the whole app
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[CodeOrbit] ⚠️  Missing Supabase environment variables.\n" +
    "  → VITE_SUPABASE_URL:",
    supabaseUrl ? "✓ set" : "✗ MISSING",
    "\n  → VITE_SUPABASE_ANON_KEY:",
    supabaseKey ? "✓ set" : "✗ MISSING",
    "\n  Fix: Add them in Vercel → Settings → Environment Variables, then Redeploy."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { "x-client-info": "codeorbit/1.0" },
    },
    db: {
      schema: "public",
    },
  }
);

/** Whether the Supabase env vars are actually configured */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Lightweight database probe used by the health monitor.
 * Issues a minimal query that succeeds even when the profiles table is empty.
 */
export async function pingDatabase() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { error } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .maybeSingle();

  // PGRST116 = "no rows" — table is empty but the connection is healthy
  if (error && error.code !== "PGRST116") {
    throw new Error(`DB ping failed: ${error.message}`);
  }
}
