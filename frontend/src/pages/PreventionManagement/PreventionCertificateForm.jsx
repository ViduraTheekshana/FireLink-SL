import React, { useState } from "react";
import axios from "axios";

const PreventionCertificateForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    address: "",
    contactNumber: "",
    email: "",
    constructionType: "Building",
    serviceType: "Fire Prevention",
    urgencyLevel: "Normal",
    preferredDate: "",
    additionalNotes: "",
    documents: [],
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, documents: [...e.target.files] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (let key in formData) {
      if (key === "documents") {
        formData.documents.forEach((file) => data.append("documents", file));
      } else if (formData[key] !== "" && formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post("http://localhost:5000/api/prevention/certificates/apply", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Application submitted successfully!");
      setFormData({
        fullName: "",
        nic: "",
        address: "",
        contactNumber: "",
        email: "",
        constructionType: "Building",
        serviceType: "Fire Prevention",
        urgencyLevel: "Normal",
        preferredDate: "",
        additionalNotes: "",
        documents: [],
      });
    } catch (error) {
      setMessage(
        "Error submitting application: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Inline styles
  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
    fontFamily: "Arial, sans-serif",
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "#0288D1",
  };

  const inputContainer = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    backgroundColor: "#FFC107",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    fontSize: "16px",
  };

  const buttonHoverStyle = {
    backgroundColor: "#FFB300",
  };

  const messageStyle = {
    textAlign: "center",
    fontWeight: "bold",
    color: message.includes("Error") ? "red" : "green",
    marginBottom: "15px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Prevention Certificate Application</h2>
      {message && <p style={messageStyle}>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Personal Info */}
        <div style={inputContainer}>
          <label style={labelStyle}>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>NIC:</label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Contact Number:</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Service Details */}
        <div style={inputContainer}>
          <label style={labelStyle}>Construction Type:</label>
          <select
            name="constructionType"
            value={formData.constructionType}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Building">Building</option>
            <option value="Renovation">Renovation</option>
            <option value="Demolition">Demolition</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Type of Service:</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Fire Prevention">Fire Prevention</option>
            <option value="Safety Audit">Safety Audit</option>
            <option value="Inspection">Inspection</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Urgency Level:</label>
          <select
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Preferred Inspection Date:</label>
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={inputContainer}>
          <label style={labelStyle}>Additional Notes:</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            style={{ ...inputStyle, height: "80px" }}
          ></textarea>
        </div>

        {/* File Upload */}
        <div style={inputContainer}>
          <label style={labelStyle}>Documents:</label>
          <input
            type="file"
            name="documents"
            onChange={handleFileChange}
            multiple
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default PreventionCertificateForm;
