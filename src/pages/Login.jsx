import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { pingDatabase } from "../lib/supabase";
import {
  subscribeDbHealth,
  warmupDatabase,
  resetDbHealth,
} from "../lib/dbHealthMonitor";
import { Mail, Lock, Chrome, Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbStatus, setDbStatus] = useState("idle");

  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  // Subscribe to database health monitor for live connection status
  useEffect(() => {
    const unsubscribe = subscribeDbHealth(setDbStatus);
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } = await login(email, password);
      if (loginError) {
        setError(loginError.message);
        return;
      }
      if (data?.user) {
        await useAuthStore.getState().loadUser();
        navigate("/dashboard");
      }
    } catch (networkErr) {
      console.error("[CodeOrbit] Login network error:", networkErr);
      setError(
        networkErr.message.includes("fetch")
          ? "Unable to reach the server. The database may be waking up — please wait a moment and try again."
          : networkErr.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error: oauthError } = await loginWithGoogle();
      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (networkErr) {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to CodeOrbit
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your coding journey across platforms
          </p>
        </div>

        {/* ── Database connection status banner ─────────────────────── */}
        {dbStatus === "warming" && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm px-4 py-2.5 rounded-lg mb-4">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>Connecting to database&hellip; you can still fill in the form.</span>
          </div>
        )}

        {dbStatus === "open" && (
          <div className="flex items-center justify-between gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm px-4 py-2.5 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Database is slow to respond. Sign-in will auto-retry.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                resetDbHealth();
                warmupDatabase(pingDatabase).catch(() => {});
              }}
              className="font-semibold underline underline-offset-2 hover:no-underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {dbStatus === "ready" && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-sm px-4 py-2.5 rounded-lg mb-4">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>Database connected.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? dbStatus === "warming"
                ? "Waking database & signing in…"
                : "Signing in…"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
