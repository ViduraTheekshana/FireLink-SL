// Components/DynamicDashboard.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OfficerProfile from "../UserManagement/1stClassOfficerprofile";
import StaffManagementTable from "../UserManagement/StaffManagementTable";

const DynamicDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get user from state or localStorage
  const user =
    location.state?.user || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      // Redirect to login if no user found
      navigate("/staff-login");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // or a loader
  }

  // Render based on position
  switch (user.position) {
    case "1stclass officer":
      return <OfficerProfile id={user._id} />;

    case "fighter":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Firefighter Dashboard</h1>
          <p>Welcome {user.name}, this is your firefighter dashboard.</p>
        </div>
      );

    case "financeManager":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Finance Manager Dashboard</h1>
          <p>Manage reports, budgets, and financial records here.</p>
        </div>
      );

    case "inventoryManager":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Inventory Manager Dashboard</h1>
          <p>Track equipment and stock levels.</p>
        </div>
      );

    case "recordmanager":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Record Manager Dashboard</h1>
          <p>Manage fire incident records and reports.</p>
        </div>
      );

    case "preventionManager":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Prevention Manager Dashboard</h1>
          <p>Oversee fire safety and prevention measures.</p>
        </div>
      );

    case "trainingsessionmanager":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Training Session Manager</h1>
          <p>Schedule and monitor training sessions.</p>
        </div>
      );

    case "suppliermanager":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Supplier Manager Dashboard</h1>
          <p>Handle supplier details and contracts.</p>
        </div>
      );

    case "teamcaptain":
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Team Captain Dashboard</h1>
          <p>Lead your team and assign responsibilities.</p>
        </div>
      );

    default:
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Staff Dashboard</h1>
          <p>
            Welcome {user.name || "Staff Member"}, here is your general dashboard.
          </p>
        </div>
      );
  }
};

export default DynamicDashboard;
