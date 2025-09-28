import React, { useState } from "react";
import officerService from "../../services/officerService";

const ApplicationsTable = ({ applications, onPaymentUpdate }) => {
  const [paymentInputs, setPaymentInputs] = useState({});

  const handleInputChange = (id, value) => {
    setPaymentInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handlePaymentSubmit = async (id) => {
    const payment = paymentInputs[id];
    if (!payment) return;

    try {
      await officerService.assignPayment(id, payment);
      onPaymentUpdate(id, payment);
      setPaymentInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Error assigning payment:", err);
    }
  };

  return (
    <table className="w-full border-collapse border border-gray-300 my-4">
      <thead>
        <tr>
          <th className="border p-2">Name</th>
          <th className="border p-2">Contact</th>
          <th className="border p-2">Building</th>
          <th className="border p-2">Inspection Date</th>
          <th className="border p-2">Payment</th>
          <th className="border p-2">Assign Payment</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app._id}>
            <td className="border p-2">{app.name}</td>
            <td className="border p-2">{app.contactNumber}</td>
            <td className="border p-2">{app.buildingDetails}</td>
            <td className="border p-2">{app.inspectionDate}</td>
            <td className="border p-2">{app.payment || "Not assigned"}</td>
            <td className="border p-2">
              <input
                type="number"
                placeholder="Payment"
                className="border p-1 mr-2"
                value={paymentInputs[app._id] || ""}
                onChange={(e) => handleInputChange(app._id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePaymentSubmit(app._id);
                }}
              />
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => handlePaymentSubmit(app._id)}
              >
                Assign
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApplicationsTable;
