import { useContext } from "react";
import { UserContext } from "../../context/UserContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { user } = useContext(UserContext);

  if (!user) {
    // Not signed in → throw an error
    throw new Error("Unauthorized: You must be signed in to access this page");
  }

  else if (adminOnly && !user.is_admin) {
    // Admin-only page but user is not admin → throw error
    throw new Error("Access Denied: Admins only");
  }

  else if (userOnly && user.is_admin) {
    // User-only page but user is admin → throw error
    throw new Error("Access Denied: Users only");
  }
  return children;
}