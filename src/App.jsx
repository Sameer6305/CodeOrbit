import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { useThemeStore } from "./store/theme";
import { pingDatabase } from "./lib/supabase";
import { warmupDatabase } from "./lib/dbHealthMonitor";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Benchmark from "./pages/Benchmark";
import Contests from "./pages/Contests";
import Settings from "./pages/Settings";

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // Proactively warm up the database connection so it's ready before
    // the user submits the login form (handles Supabase free-tier cold starts).
    warmupDatabase(pingDatabase).catch(() => {
      // Errors are captured inside the monitor; no uncaught rejection here.
    });

    // Load user on app start
    loadUser();

    // Initialize theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, [loadUser, setTheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes with layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/benchmark"
          element={
            <ProtectedRoute>
              <Layout>
                <Benchmark />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests"
          element={
            <ProtectedRoute>
              <Layout>
                <Contests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
