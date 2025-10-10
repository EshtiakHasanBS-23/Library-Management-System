// // src/pages/Auth/Login.jsx
// import { useState } from "react";
// import { useAuth } from "../../Providers/AuthProvider";
// import Navbar from "../../components/Navbar/Navbar";
// import Footer from "../../components/Footer/Footer";

// export default function Login() {
//   const { login } = useAuth();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     // TODO: call your real API here; on success do login();
//     setTimeout(() => {
//       login(); // navigates to "/"
//     }, 600);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Navbar />
//       <main className="flex-1">
//         <div className="max-w-md mx-auto p-6">
//           <h1 className="text-2xl font-semibold mb-4">Login</h1>
//           <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl border">
//             <input
//               type="email"
//               placeholder="Email"
//               className="w-full border rounded-lg px-3 py-2"
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               className="w-full border rounded-lg px-3 py-2"
//               required
//             />
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-lg px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-70"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }
// 


import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";
import axios from "axios";
import { User, Lock } from "lucide-react";
 
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
 
      const res = await axios.post("http://localhost:8000/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
 
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      const userRes = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
 
      localStorage.setItem("user", JSON.stringify(userRes.data));
      setUser(userRes.data);
      if (userRes.data.username === "admin" || userRes.data.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid username or password");
    }
  };
 
  return (
          <div className="min-h-screen flex">
                {/* Left Section - Login Form */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col">
          <div className="px-8 py-6">
          <div className="flex items-center gap-3">
          <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxzpiVrE0pato_ORYPxjARD0lhz9eCrfXSlg&s"
                        alt="Brain Station 23"
                        className="h-10 w-auto"
                      />
          <span className="text-xl font-bold text-cyan-500">BRAIN STATION 23</span>
          </div>
          </div>
          
                  <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
          <h1 className="text-3xl font-normal text-gray-800 mb-8">Log in</h1>
          
                      {/* Microsoft Login Button */}
          <button
                        type="button"
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded flex items-center justify-center gap-3 mb-6 transition-colors"
          >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor">
          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
          <rect x="11" y="1" width="9" height="9" fill="#00a4ef"/>
          <rect x="1" y="11" width="9" height="9" fill="#7fba00"/>
          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span>Continue with Microsoft</span>
          </button>
          
                      <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
                      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
          <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Username"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              required
                            />
          </div>
          </div>
          
                        <div>
          <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Password"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              required
                            />
          </div>
          </div>
          
                        <div className="text-left">
          <a href="#" className="text-sm text-cyan-500 hover:text-cyan-600">
                            Forgotten your username or password?
          </a>
          </div>
          
                        <button
                          type="submit"
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-4 rounded font-medium transition-colors"
          >
                          Log in
          </button>
          </form>
          
                      <div className="mt-8 text-sm text-gray-600">
          <p>Cookies must be enabled in your browser. <a href="#" className="text-cyan-500 hover:text-cyan-600">Cookies notice</a>.</p>
          </div>
          </div>
          </div>
          
                  <div className="px-8 py-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
                      Copyright (c) Brainstation 23 LMS - 2025. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
          <a href="#" className="hover:text-cyan-500">Data retention summary</a>
          <a href="#" className="hover:text-cyan-500">Get the mobile app</a>
          </div>
          </div>
          </div>
          
                {/* Right Section - Background Image */}
          <div
                  className="hidden lg:block lg:w-1/2 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://lms.elearning23.com/pluginfile.php/1/theme_mb2nl/loginbgimage/1759833157/brain-station-23-picnic-2022.jpg`
                  }}
          ></div>
          </div>
  );
}
