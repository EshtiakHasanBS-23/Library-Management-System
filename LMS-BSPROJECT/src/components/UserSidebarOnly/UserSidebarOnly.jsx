import UserSidebar from "../UserSidebar/UserSidebar";

export default function UserSidebarOnly({ active }) {
  // blank right side — no center content by design
  return (
    <div className="min-h-screen flex bg-gray-100">
      <UserSidebar active={active} />
      <main className="flex-1" />
    </div>
  );
}
