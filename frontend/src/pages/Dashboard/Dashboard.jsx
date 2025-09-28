// Components/DynamicDashboard.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../pages/UserManagement/Sidebar";
import TrainingSession from "../TraningSessionManagement/TrainingSessionManager";
import OfficerProfile from "../UserManagement/1stClassOfficerprofile";
import InventoryManagerDashboard from "../Inventory/InventoryManagerDashboard";

import MissionRecords from "../MissionRecords/MissionRecords"

const DynamicDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.user || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/staff-login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const renderContent = () => {
    switch (user.position.toLowerCase()) {
      case "1stclass officer":
    return <OfficerProfile officerId={user._id} />;

      case "fighter":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Firefighter Dashboard</h1>
            <p>Welcome {user.name}, this is your firefighter dashboard.</p>
          </div>
        );

      case "financemanager":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Finance Manager Dashboard</h1>
            <p>Manage reports, budgets, and financial records here.</p>
          </div>
        );

      case "inventorymanager":
        return <InventoryManagerDashboard />;

      case "recordmanager":
        return <MissionRecords/>;

      case "preventionmanager":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Prevention Manager Dashboard</h1>
            <p>Oversee fire safety and prevention measures.</p>
          </div>
        );

      case "trainingsessionmanager":
        return <TrainingSession user={user} />;

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

  return (
    <div className="flex h-screen max-w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 min-w-0 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default DynamicDashboard;
