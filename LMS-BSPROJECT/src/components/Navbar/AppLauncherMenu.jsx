// components/Navbar/AppLauncherMenu.jsx
import { CgMenuGridR } from "react-icons/cg";
import { Link } from "react-router-dom";
import { GraduationCap, Home, BookOpen, Calendar } from "lucide-react";

export default function AppLauncherMenu({
  gridRef,
  openGrid,
  setOpenGrid,
  setOpenNoti,
  setOpenMsg,
  setOpenUser,
}) {
  return (
    <div className="relative ml-2" ref={gridRef}>
      <button
        type="button"
        aria-label="Open app menu"
        onClick={() => {
          setOpenGrid((v) => !v);
          // close others to avoid overlap
          setOpenNoti(false);
          setOpenMsg(false);
          setOpenUser(false);
        }}
        className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        <CgMenuGridR className="w-6 h-6 text-gray-600" />
      </button>

      {openGrid && (
        <div className="absolute left-0 top-10 w-64 bg-white border border-gray-200 rounded-xl shadow-lg">
          {/* Subtle elevation and rounded look to match the screenshot */}
          <ul className="py-2">
            <li>
              <Link
                to="https://lms.elearning23.com/my/courses.php"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <GraduationCap className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">My courses</span>
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <Home className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">Site home</span>
              </Link>
            </li>
            <li>
              <Link
                to="https://lms.elearning23.com/course/"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <BookOpen className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">All courses</span>
              </Link>
            </li>
            <li>
              <Link
                to="/calendar"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setOpenGrid(false)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <Calendar className="w-4 h-4 text-gray-700" />
                </span>
                <span className="text-sm font-medium">Calendar</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
