import React, { useEffect, useState } from "react";
import ApplicationsTable from "./ApplicationsTable";
import PaymentChart from "./PaymentChart";
import officerService from "../../services/officerService";

const PreventionOfficerDashboard = () => {
  const [applications, setApplications] = useState([]);

  // Fetch applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await officerService.getApplications();
        setApplications(data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    fetchApplications();
  }, []);

  // Update local state after payment assignment
  const handlePaymentUpdate = (id, payment) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === id ? { ...app, payment } : app))
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prevention Officer Dashboard</h1>

      {/* Table of applications */}
      <ApplicationsTable
        applications={applications}
        onPaymentUpdate={handlePaymentUpdate}
      />

      {/* Chart showing payment stats */}
      <PaymentChart applications={applications} />
    </div>
  );
};

export default PreventionOfficerDashboard;
