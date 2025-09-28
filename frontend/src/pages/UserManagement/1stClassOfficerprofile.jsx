import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import StaffManagementTable from "./StaffManagementTable";

const OfficerProfile = ({ officerId }) => {
  const { id: paramId } = useParams();
  const id = officerId || paramId;
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No officer ID provided");
      setLoading(false);
      return;
    }

    const fetchOfficerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        // If your backend runs on port 5000
        const response = await axios.get(`http://localhost:5000/users/${id}`, {
          headers,
          withCredentials: true, // if backend uses cookies
        });

        setOfficer(response.data.user);
        setLoading(false);
      } catch (err) {
        console.error("Officer nmmmfetch error:", err.response || err);
        // Show backend message if available
        const message = err.response?.data?.message || "Failed to fetch officer data";
        setError(message);
        setLoading(false);
      }
    };

    fetchOfficerData();
  }, [id]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e2a38]">
        <div className="text-xl text-blue-400">Loading officer data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e2a38]">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  if (!officer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e2a38]">
        <div className="text-xl text-red-400">Officer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e2a38] py-8 px-4">
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 relative">
          <div className="absolute top-4 right-4">
            <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
              {officer.status || "Active"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              {/* Profile Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17
                     20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7
                     20H2v-2a3 3 0 015.356-1.857M7
                     20v-2c0-.656.126-1.283.356-1.857m0
                     0a5.002 5.002 0 019.288
                     0M15 7a3 3 0 11-6 0 3 3
                     0 016 0zm6 3a2 2 0 11-4 0
                     2 2 0 014 0zM7 10a2 2 0
                     11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">First Class Officer Profile</h1>
              <p className="mt-1 text-red-100">Fire Department Staff Details</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff ID */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Identification
              </h2>
              <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                <span className="font-medium text-gray-700 mr-3">Staff ID:</span>
                <span className="text-blue-800 font-mono bg-blue-100 px-3 py-1 rounded">
                  {officer.staffId || officer._id}
                </span>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Personal Information
              </h2>
              <p><b>Full Name:</b> {officer.name || "N/A"}</p>
              <p><b>Age:</b> {officer.age || "N/A"}</p>
              <p><b>Phone:</b> {officer.phone || "N/A"}</p>
            </div>

            {/* Professional Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Professional Information
              </h2>
              <p><b>Email:</b> {officer.gmail || "N/A"}</p>
              <p><b>Position:</b> {officer.position || "N/A"}</p>
              <p><b>Status:</b> {officer.status || "N/A"}</p>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Address
              </h2>
              <p>{officer.address || "N/A"}</p>
            </div>
          </div>

          
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/stafflogin" className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition">
              Back to Login
            </Link>
            <Link to="/shiftschedule" className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition">
              Make Shift
            </Link>
            <Link to={`/update-user/${officer._id}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              Edit Profile
            </Link>
            <Link to="/firstaff" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
              Add Staff Members
            </Link>
          </div>
        </div>
      </div>

      {/* Staff Management Table */}
     
    </div>
  );
};

export default OfficerProfile;
