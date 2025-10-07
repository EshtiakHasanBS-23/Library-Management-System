// // src/components/Sidebar.jsx
// import { NavLink, Link } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   BookOpen,
//   HelpCircle,
//   Settings,
//   LogOut,
//   Layers,
//   SlidersHorizontal,
// } from "lucide-react";

// const itemClass = ({ isActive }) =>
//   isActive
//     ? "flex items-center gap-2 text-sky-600 font-medium"
//     : "flex items-center gap-2 text-gray-700 hover:text-sky-500 transition-colors";

// export default function Sidebar() {
//   return (
//     <aside className="w-64 bg-white shadow-md px-4 py-6 flex flex-col justify-between">
//       <div>
//         <h2 className="text-xl font-bold mb-6">Library</h2>
//         <ul className="space-y-3">
//           <li>
//             <NavLink to="/dashboard" className={itemClass}>
//               <LayoutDashboard size={18} /> Dashboard
//             </NavLink>
//           </li>

//           <li>
//             <NavLink to="/manage-books" className={itemClass}>
//               <BookOpen size={18} /> Manage Books
//             </NavLink>
//           </li>

//           <li>
//             <NavLink to="/manage-category" className={itemClass}>
//               <Layers size={18} /> Manage Category
//             </NavLink>
//           </li>

//           {/* Keep route names exactly as you already use them */}
//           {/* <li>
//             <NavLink to="/fill-up-form" className={itemClass}>
//               <BookOpen size={18} /> Fill Up Form
//             </NavLink>
//           </li> */}
//           <li>
//             <NavLink to="/manage-feature" className={itemClass}>
//               <SlidersHorizontal size={18} /> Manage Feature
//             </NavLink>
//           </li>

//           <li>
//             <NavLink to="/user" className={itemClass}>
//               <Users size={18} /> Member
//             </NavLink>
//           </li>

//           {/* <li>
//             <NavLink to="/check-out" className={itemClass}>
//               <BookOpen size={18} /> Check-out Books
//             </NavLink>
//           </li> */}

//           <li>
//             <NavLink to="/setting" className={itemClass}>
//               <Settings size={18} /> Setting
//             </NavLink>
//           </li>
//         </ul>
//       </div>

//       <div>
//         <Link
//           to="/"
//           className="flex items-center gap-2 text-red-600 font-medium hover:underline underline-offset-4"
//         >
//           <LogOut size={18} /> Logout
//         </Link>
//       </div>
//     </aside>
//   );
// }


// src/components/Sidebar.jsx
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  Settings,
  LogOut,
  Layers,
  SlidersHorizontal,
  CheckCircle,
  HandHeart,   // ✅ new icon
} from "lucide-react";

const itemClass = ({ isActive }) =>
  isActive
    ? "flex items-center gap-2 text-sky-600 font-medium"
    : "flex items-center gap-2 text-gray-700 hover:text-sky-500 transition-colors";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md px-4 py-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">Library</h2>
        <ul className="space-y-3">
          <li>
            <NavLink to="/dashboard" className={itemClass}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
          </li>

          {/* ✅ New Donation Request link */}
          <li>
            <NavLink to="/donation-request" className={itemClass}>
              <HandHeart size={18} /> Donation Request
            </NavLink>
          </li>

          <li>
            <NavLink to="/manage-books" className={itemClass}>
              <BookOpen size={18} /> Manage Books
            </NavLink>
          </li>

          <li>
            <NavLink to="/manage-category" className={itemClass}>
              <Layers size={18} /> Manage Category
            </NavLink>
          </li>

          <li>
            <NavLink to="/manage-feature" className={itemClass}>
              <SlidersHorizontal size={18} /> Manage Feature
            </NavLink>
          </li>

          <li>
            <NavLink to="/user" className={itemClass}>
              <Users size={18} /> Member
            </NavLink>
          </li>

          <li>
            <NavLink to="/all-history" className={itemClass}>
              <CheckCircle size={18} /> History
            </NavLink>
          </li>

          <li>
            <NavLink to="/setting" className={itemClass}>
              <Settings size={18} /> Settings
            </NavLink>
          </li>
        </ul>
      </div>

      {/* <div>
        <Link
          to="/"
          className="flex items-center gap-2 text-red-600 font-medium hover:underline underline-offset-4"
        >
          <LogOut size={18} /> Logout
        </Link>
      </div> */}
    </aside>
  );
}
