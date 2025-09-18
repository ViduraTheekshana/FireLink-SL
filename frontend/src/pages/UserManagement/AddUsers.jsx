import React, { useMemo, useState } from "react";
import { FaUser, FaPhone, FaBirthdayCake, FaEnvelope, FaBriefcase, FaFlag, FaMapMarkerAlt, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const URL = "http://localhost:5006/UserReg";

function AddFireStaff() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gmail: "",
    position: "",
    status: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validators = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => /^\d{7,15}$/.test(String(v)),
    age: (v) => Number(v) >= 18 && Number(v) <= 70,
    gmail: (v) => /^(?:[a-zA-Z0-9_\-.+])+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(v),
    position: (v) => v && v.length > 0,
    status: (v) => ["active", "inactive", "suspended", "retired"].includes(v),
    address: (v) => v.trim().length >= 5,
    password: (v) => String(v).length >= 6
  };

  const isValid = useMemo(() => {
    const nextErrors = {};
    Object.keys(formData).forEach((k) => {
      if (!validators[k](formData[k])) nextErrors[k] = true;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const positions = [
    "1stclass officer",
    "finanaceManager",
    "inventoryManager",
    "recordmanager",
    "preventionManager",
    "trainingsessionmanager",
    "suplliermanager",
    "teamcaptain",
    "fighter",
  ];

  const statuses = ["active", "inactive", "suspended", "retired"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await axios.post(URL, formData);
      if (res.data.status === "ok") {
        alert("Staff added successfully!");
        setFormData({
          name: "",
          phone: "",
          age: "",
          gmail: "",
          position: "",
          status: "",
          address: "",
          password: "",
        });
        navigate("/stafflogin");
      } else alert("Error adding staff");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1E2A38] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border-t-8 border-[#C62828]">
        <h2 className="text-3xl font-bold text-[#C62828] mb-8 text-center">
          Add Fire Department Staff
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              required
            />
            {errors.name && <span className="text-red-600 text-sm">Name must be at least 2 characters</span>}
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              required
            />
            {errors.phone && <span className="text-red-600 text-sm">Enter a valid phone number (7-15 digits)</span>}
          </div>

          {/* Age */}
          <div className="relative">
            <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              required
            />
            {errors.age && <span className="text-red-600 text-sm">Age must be between 18 and 70</span>}
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="gmail"
              placeholder="Email"
              value={formData.gmail}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              required
            />
            {errors.gmail && <span className="text-red-600 text-sm">Enter a valid email</span>}
          </div>

          {/* Position */}
          <div className="relative">
            <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800] appearance-none"
              required
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            {errors.position && <span className="text-red-600 text-sm">Select a position</span>}
          </div>

          {/* Status */}
          <div className="relative">
            <FaFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800] appearance-none"
              required
            >
              <option value="">Select Status</option>
              {statuses.map((stat) => (
                <option key={stat} value={stat}>
                  {stat}
                </option>
              ))}
            </select>
            {errors.status && <span className="text-red-600 text-sm">Select a status</span>}
          </div>

          {/* Address */}
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full pl-10 pt-3 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              rows={3}
              required
            />
            {errors.address && <span className="text-red-600 text-sm">Address must be at least 5 characters</span>}
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              required
            />
            {errors.password && <span className="text-red-600 text-sm">Password must be at least 6 characters</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full p-3 bg-[#FF9800] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            {loading ? "Adding..." : "Add Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddFireStaff;
