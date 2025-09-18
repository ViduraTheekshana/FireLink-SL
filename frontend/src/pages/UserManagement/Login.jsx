import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUserAlt, FaLock } from "react-icons/fa";

function DemoCredentials() {
  return (
    <div className="mt-4 text-sm text-gray-500">
      <p><strong>Demo Staff ID:</strong> S123</p>
      <p><strong>Password:</strong> 123456</p>
    </div>
  );
}

function StaffLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    staffId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/v1/auth/login", formData);
      const data = res.data;

      if (data.status === "ok") {
        alert(`Login successful! Welcome ${data.user.name}`);

        if (data.user.position === "1stclass officer") {
          try {
            const userRes = await axios.get(
              `http://localhost:5006/users/staff/${data.user.staffId}`
            );
            navigate(`/officer/${userRes.data.user._id}`);
          } catch (err) {
            console.error("Error fetching user details:", err);
            alert("Login successful but could not load profile. Redirecting to dashboard.");
            navigate("/firefighter-dashboard", { state: { user: data.user } });
          }
        } else {
          switch (data.user.position) {
            case "fighter":
              navigate("/firefighter-dashboard", { state: { user: data.user } });
              break;
            case "finanaceManager":
              navigate("/finance-dashboard", { state: { user: data.user } });
              break;
            case "inventoryManager":
              navigate("/inventory-dashboard", { state: { user: data.user } });
              break;
            case "recordmanager":
              navigate("/record-dashboard", { state: { user: data.user } });
              break;
            case "preventionManager":
              navigate("/prevention-dashboard", { state: { user: data.user } });
              break;
            case "trainingsessionmanager":
              navigate("/training-dashboard", { state: { user: data.user } });
              break;
            case "suplliermanager":
              navigate("/supplier-dashboard", { state: { user: data.user } });
              break;
            case "teamcaptain":
              navigate("/team-dashboard", { state: { user: data.user } });
              break;
            default:
              navigate("/staff-dashboard", { state: { user: data.user } });
          }
        }
      } else {
        alert("Login failed: " + (data.err || "Invalid credentials"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Fire Handling System
          </h2>
          <p className="text-gray-300">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Staff ID */}
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

            {/* Password */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-[#FF9800] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Demo Credentials */}
          <DemoCredentials />
        </div>

        {/* Links */}
        <div className="text-center">
          <Link
            to="/civilian-login"
            className="text-blue-300 hover:text-white text-sm underline transition-colors"
          >
            Login as a Civilian
          </Link>
          <br />
          <Link
            to="/supplier-login"
            className="text-blue-300 hover:text-white text-sm underline transition-colors"
          >
            Login as a Supplier
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-300 text-sm">
          <p>© 2024 Fire Department. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
