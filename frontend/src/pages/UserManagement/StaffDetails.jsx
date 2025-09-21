// Components/UserDetails.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiActivity,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const componentRef = useRef(); // Reference for printing
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/users/${id}`);
        setUser(response.data.user);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user data");
        setLoading(false);
        console.error(err);
      }
    };
    if (id) fetchUserData();
    else setLoading(false);
  }, [id]);

  const handlePrint = () => {
    const printContents = componentRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    document.title = id; // Set filename to id
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-blue-600">Loading user data...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">User not found</div>
        <Link to="/" className="ml-4 text-blue-600 hover:underline">
          Go Back
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#1e2a38] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Print button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition text-sm"
          >
            Print / Download PDF
          </button>
        </div>

        {/* Printable Content */}
        <div ref={componentRef}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#c62828] text-white p-6 relative">
              <div className="absolute top-4 right-4">
                <span className="bg-yellow-400 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {user.status || "Active"}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">User Details</h1>
                  <p className="mt-1 text-red-100">
                    Fire Department Staff Information
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Identification */}
                <div className="col-span-2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#c62828]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a1 1 0 00-1 1v1h2V3a1 1 0 00-1-1z" />
                      <path d="M4 4h12v12H4z" />
                    </svg>
                    Identification
                  </h2>
                  <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a1 1 0 00-1 1v2h2V3a1 1 0 00-1-1z" />
                      <path d="M4 6h12v10H4z" />
                    </svg>
                    <span className="font-medium text-gray-700 mr-3">
                      Staff ID:
                    </span>
                    <span className="text-blue-800 font-mono bg-blue-100 px-3 py-1 rounded">
                      {user.staffId || user._id}
                    </span>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#c62828]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6z" />
                      <path d="M4 16a6 6 0 0112 0H4z" />
                    </svg>
                    Personal Information
                  </h2>

                  <div className="mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a3 3 0 100 6 3 3 0 000-6z" />
                      <path d="M4 16a6 6 0 0112 0H4z" />
                    </svg>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Full Name
                      </span>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                        {user.name || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                      <path d="M10 6v4l3 3" />
                    </svg>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Age
                      </span>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                        {user.age || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06L4.8 9.7a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Phone Number
                      </span>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                        {user.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#c62828]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3h16v4H2z" />
                      <path d="M2 8h16v10H2z" />
                    </svg>
                    Professional Information
                  </h2>

                  <div className="mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3h16v4H2z" />
                      <path d="M2 8h16v10H2z" />
                    </svg>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Email
                      </span>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                        {user.gmail || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1H6z" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Position
                      </span>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                        {user.position || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                      <path d="M13.707 8.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">
                        Status
                      </span>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                        {user.status || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="col-span-2 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mr-2 mt-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">
                      Address
                    </h2>
                    <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                      {user.address || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>

          <Link
            to={`/update-user/${user._id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center"
          >
            Edit Profile
          </Link>
          {user.position === "1stclass officer" && (
            <Link
              to={`/officer/${user._id}`}
              className="px-6 py-3 bg-[#c62828] text-white rounded-lg shadow hover:bg-red-800 transition flex items-center"
            >
              View Officer Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
