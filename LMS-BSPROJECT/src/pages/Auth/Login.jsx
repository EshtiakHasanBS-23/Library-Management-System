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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  /*const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/token", {
        username,
        password,
      });

      // Save JWT token
      localStorage.setItem("token", res.data.access_token);

      // Redirect to homepage
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid username or password");
    }
  };*/
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await axios.post("http://localhost:8000/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("token", res.data.access_token);
    navigate("/");
  } catch (err) {
    console.error("Login failed:", err);
    alert("Invalid username or password");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
