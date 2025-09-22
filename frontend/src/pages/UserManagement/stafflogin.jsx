// Components/StaffLogin.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserAlt, FaLock } from "react-icons/fa";

const URL = "http://localhost:5000/users/stafflogin";

function StaffLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ staffId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(URL, formData);
      const data = res.data;

      if (data.status === "ok") {
        alert(`Login successful! Welcome ${data.user.name}`);
        // Role-based redirection
        const routes = {
          "1stclass officer": `/officer/${data.user.staffId}`,
          fighter: "/firefighter-dashboard",
          finanaceManager: "/finance-dashboard",
          inventoryManager: "/inventory-dashboard",
          recordmanager: "/record-dashboard",
          preventionManager: "/prevention-dashboard",
          trainingsessionmanager: "/training-dashboard",
          suplliermanager: "/supplier-dashboard",
          teamcaptain: "/team-dashboard",
        };

        navigate(routes[data.user.position] || "/staff-dashboard", {
          state: { user: data.user },
        });
      } else {
        setError(data.err || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2A38] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-4xl font-bold text-[#C62828] mb-2 text-center">
          Fire Staff Login
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your credentials to access the staff dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="staffId"
              placeholder="Staff ID"
              value={formData.staffId}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-[#FF9800] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer & Links */}
        <div className="mt-6 text-center text-gray-500 text-sm space-y-2">
          <p>
            Forgot your password?{" "}
            <span className="text-[#C62828] cursor-pointer hover:underline">
              Reset here
            </span>
          </p>

          <p>
            <Link
              to="/civilian-login"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Login as a Civilian
            </Link>
          </p>

          <p>
            <Link
              to="/supplier-login"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Login as a Supplier
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default StaffLogin;
