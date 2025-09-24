import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const StaffManagementTable = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]); // ✅ filtered list
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const componentRef = useRef(); // ✅ Reference for print

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/users");
        // Filter out 1st class officers
        const filteredStaff = response.data.users.filter(
          (user) => user.position !== "1stclass officer"
        );
        setStaff(filteredStaff);
        setFilteredStaff(filteredStaff); // ✅ initialize filtered list
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch staff data"+err.message);
        setLoading(false);
        console.error(err);
      }
    };

    fetchStaffData();
  }, []);

  // ✅ Search by staffId
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter((member) =>
        member.staffId?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await axios.delete(`http://localhost:5000/users/${id}`);
        const updatedStaff = staff.filter((member) => member._id !== id);
        setStaff(updatedStaff);
        setFilteredStaff(updatedStaff); // ✅ update filtered too
        alert("Staff member deleted successfully");
      } catch (err) {
        console.error(
          "Error deleting staff member:",
          err.response ? err.response.data : err.message
        );
        alert("Failed to delete staff member");
      }
    }
  };

  // ✅ Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredStaff(staff);
  };

  // ✅ Print / Save as PDF function
  const handlePrintAlternative = () => {
    const printContents = componentRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-blue-600">Loading staff data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Print-specific CSS */}
      <style>
        {`@media print {
            .no-print { display: none !important; }
          }`}
      </style>

      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>

        {/* ✅ Search input */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by Staff ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="px-3 py-2 bg-gray-300 rounded-md text-sm"
            >
              Clear
            </button>
          )}
          <button
            onClick={handlePrintAlternative}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition text-sm"
          >
            Print / Download PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto" ref={componentRef}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.map((member) => (
              <tr key={member._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.staffId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.gmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        member.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : member.status === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {member.status || "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                  <Link
                    to={`/userdetails/${member._id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="px-3 py-1 bg-red-700 text-white rounded-md shadow hover:bg-red-800 transition flex items-center text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No staff members found</p>
        </div>
      )}
    </div>
  );
};

export default StaffManagementTable;
