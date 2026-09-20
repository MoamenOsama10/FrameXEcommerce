import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "Admin") {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}