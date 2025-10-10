


// // components/Layout/Layout.jsx
// import { Outlet, useLocation, Link } from "react-router-dom";
// import Navbar from "../Navbar/Navbar";
// import Footer from "../Footer/Footer";
// import Newsletter from "../Newsletter/Newsletter";
// import Sidebar from "../Sidebar/Sidebar";

// export default function Layout() {
//   const location = useLocation();
//   const isBookDetailsPage = location.pathname.startsWith("/book/");
//   const isHomePage = location.pathname === "/";

//   // If you want a dynamic title, swap this with your own logic:
//   const pageTitle = "Dashboard";

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       {/* Fixed Navbar */}
//       <Navbar />

//       {/* Spacer for fixed navbar height */}
//       <div className="pt-16">
//         {/* ===== Blue Header ===== */}
//         <div className="relative overflow-hidden bg-[#05b3f3] py-10 h-28 sm:h-32">
//           <svg
//             className="absolute bottom-0 left-0 w-full h-full"
//             viewBox="0 0 1440 150"
//             preserveAspectRatio="none"
//           >
//             <polygon
//               fill="#42A5F5"
//               fillOpacity="0.5"
//               points="0,80 300,40 600,70 900,30 1200,60 1440,20 1440,0 0,0"
//             />
//           </svg>
//           <svg
//             className="absolute bottom-0 left-0 w-full h-full"
//             viewBox="0 0 1440 150"
//             preserveAspectRatio="none"
//           >
//             <polygon
//               fill="#42A5F5"
//               fillOpacity="0.5"
//               points="0,110 250,60 500,100 800,50 1100,90 1440,40 1440,0 0,0"
//             />
//           </svg>

//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between z-10 relative">
//             <h1 className="text-white text-2xl sm:text-3xl font-semibold">
//               Dashboard
//             </h1>
//             <button className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md text-sm sm:text-base transition-colors duration-200">
//               Customise this page
//             </button>
//           </div>
//         </div>

//         {/* ===== New Breadcrumb with links ===== */}
//         <div className="bg-gray-100 border-b border-gray-200">
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <nav className="flex items-center py-2 text-sm" aria-label="Breadcrumb">
//               <ol className="inline-flex items-center space-x-1 sm:space-x-2">
//                 <li>
//                   <Link
//                     to="/dashboard"
//                     className="text-gray-600 hover:text-sky-600 hover:underline transition-colors"
//                   >
//                     Dashboard
//                   </Link>
//                 </li>
//                 <li>
//                   <span className="text-gray-400">/</span>
//                 </li>
//                 <li>
//                   <Link
//                     to="/"
//                     className="text-gray-600 hover:text-sky-600 hover:underline transition-colors"
//                   >
//                     Site Page
//                   </Link>
//                 </li>
//                 <li>
//                   <span className="text-gray-400">/</span>
//                 </li>
//                 <li>
//                   <Link
//                     to="/all-genres"
//                     className="font-medium text-gray-900 hover:text-sky-600 hover:underline transition-colors"
//                   >
//                     My Library
//                   </Link>
//                 </li>
//               </ol>
//             </nav>
//           </div>
//         </div>

//         {/* ===== Main Content (unchanged) ===== */}
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex flex-col md:flex-row gap-6">
//             {isBookDetailsPage && (
//               <aside className="w-full md:w-64 lg:w-72 flex-none">
//                 <Sidebar />
//               </aside>
//             )}
//             <main className="flex-1 min-w-0">
//               <Outlet />
//             </main>
//           </div>
//         </div>
//       </div>

//       {/* Newsletter only on home page */}
//       {isHomePage && <Newsletter />}
//       <Footer />
//     </div>
//   );
// }



import { Outlet, useLocation, Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import Newsletter from "../Newsletter/Newsletter";
import Sidebar from "../Sidebar/Sidebar";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext.jsx";

export default function Layout() {
  const location = useLocation();
  const isBookDetailsPage = location.pathname.startsWith("/book/");
  const isHomePage = location.pathname === "/";
 
  // If you want a dynamic title, swap this with your own logic:
  const pageTitle = "Dashboard";
  const { user } = useContext(UserContext);
  console.log(user);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Spacer for fixed navbar height */}
      <div className="pt-16">
        {/* ===== Blue Header ===== */}
        <div className="relative overflow-hidden bg-[#05b3f3] py-10 h-28 sm:h-32">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
          >
            <polygon
              fill="#42A5F5"
              fillOpacity="0.5"
              points="0,80 300,40 600,70 900,30 1200,60 1440,20 1440,0 0,0"
            />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
          >
            <polygon
              fill="#42A5F5"
              fillOpacity="0.5"
              points="0,110 250,60 500,100 800,50 1100,90 1440,40 1440,0 0,0"
            />
          </svg>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between z-10 relative">
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">
              Dashboard
            </h1>
            <button className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md text-sm sm:text-base transition-colors duration-200">
              Customise this page
            </button>
          </div>
        </div>

        {/* ===== New Breadcrumb with links ===== */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center py-2 text-sm" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 sm:space-x-2">
                <li>
                      <Link
                        to={user?.username === "admin" ? "/dashboard" : "/user"}
                        className="text-gray-600 hover:text-sky-600 hover:underline transition-colors"
                      >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-sky-600 hover:underline transition-colors"
                  >
                    Site Page
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <Link
                    to="/all-genres"
                    className="font-medium text-gray-900 hover:text-sky-600 hover:underline transition-colors"
                  >
                    My Library
                  </Link>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* ===== Main Content (unchanged) ===== */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {isBookDetailsPage && (
              <aside className="w-full md:w-64 lg:w-72 flex-none">
                <Sidebar />
              </aside>
            )}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Newsletter only on home page */}
      {isHomePage && <Newsletter />}
      <Footer />
    </div>
  );
}

/* ===========================
   ADDED: LayoutScaffold
   - Same chrome as above, but renders `children` instead of <Outlet />
   - Lets any standalone page (like BookDetails.jsx) opt in to Layout UI
   =========================== */
export function LayoutScaffold({
  children,
  isBookDetailsPage = false,
  isHomePage = false,
  pageTitle = "Dashboard",
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="relative overflow-hidden bg-[#05b3f3] py-10 h-28 sm:h-32">
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 150" preserveAspectRatio="none">
            <polygon fill="#42A5F5" fillOpacity="0.5" points="0,80 300,40 600,70 900,30 1200,60 1440,20 1440,0 0,0" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 150" preserveAspectRatio="none">
            <polygon fill="#42A5F5" fillOpacity="0.5" points="0,110 250,60 500,100 800,50 1100,90 1440,40 1440,0 0,0" />
          </svg>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between z-10 relative">
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">{pageTitle}</h1>
            <button className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md text-sm sm:text-base transition-colors duration-200">
              Customise this page
            </button>
          </div>
        </div>

        <div className="bg-gray-100 border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center py-2 text-sm" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 sm:space-x-2">
                <li><Link to="/dashboard" className="text-gray-600 hover:text-sky-600 hover:underline transition-colors">Dashboard</Link></li>
                <li><span className="text-gray-400">/</span></li>
                <li><Link to="/" className="text-gray-600 hover:text-sky-600 hover:underline transition-colors">Site Page</Link></li>
                <li><span className="text-gray-400">/</span></li>
                <li><Link to="/all-genres" className="font-medium text-gray-900 hover:text-sky-600 hover:underline transition-colors">My Library</Link></li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {isBookDetailsPage && (
              <aside className="w-full md:w-64 lg:w-72 flex-none">
                <Sidebar />
              </aside>
            )}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>

      {isHomePage && <Newsletter />}
      <Footer />
    </div>
  );
}
