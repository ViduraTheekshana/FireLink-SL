// Components/StaffLogin.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserAlt, FaLock } from "react-icons/fa";

const URL = "http://localhost:5000/users/stafflogin";

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
      const res = await axios.post(URL, formData);
      const data = res.data;

      if (data.status === "ok") {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("fire_access_token", data.token);
        }
        alert(`Login successful! Welcome ${data.user.name}`);
        navigate("/dashboard", { state: { user: data.user } });
      }
    else {
        alert("Login failed: " + (data.err || "Invalid credentials"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error"+err);
    }

    setLoading(false);
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

        {/* Optional Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Forgot your password?{" "}
          <span className="text-[#C62828] cursor-pointer hover:underline">
            Reset here
          </span>
        </div>

        {/* Links to Supplier & Civilian Login */}
        <div className="mt-6 text-center space-y-2">
          <p>
            <Link
              to="/supplier-login"
              className="text-blue-600 hover:underline"
            >
              Supplier Login
            </Link>
          </p>
          <p>
            <Link
              to="/civilian-login"
              className="text-green-600 hover:underline"
            >
              Civilian Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
