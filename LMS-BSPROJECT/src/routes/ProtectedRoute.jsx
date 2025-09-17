// // src/routes/ProtectedRoute.jsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../../src/Providers/AuthProvider";

// export default function ProtectedRoute() {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" replace />;
// }
