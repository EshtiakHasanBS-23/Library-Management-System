// components/UserSidebar/UserLayout.jsx
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

export default function UserLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <UserSidebar />
      <main className="flex-1 p-6 space-y-6">
        <Outlet />
      </main>
    </div>
  );
}
