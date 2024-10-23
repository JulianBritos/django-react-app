import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" />;
  }

  // Si hay token, mostrar el componente hijo
  return children;
}

export default ProtectedRoute;
