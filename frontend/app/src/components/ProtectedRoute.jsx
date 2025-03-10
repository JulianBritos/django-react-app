import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole"); // Asumiendo que al hacer login guardás el rol en el localStorage

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Si hay un rol requerido (ej: Admin) y el rol no coincide, redirige al home o página 403
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
