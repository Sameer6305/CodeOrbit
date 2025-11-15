import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (user === null) return <Navigate to="/login" replace />;
  return children;
}
