import React, { useState } from "react";
import axios from "axios";

// CSS for dropdown options
const dropdownCSS = `
  .modern-select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    font-size: 14px;
    box-sizing: border-box;
    background-color: white;
    transition: all 0.3s ease;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
    color: #374151;
    font-weight: 500;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .modern-select:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .modern-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .modern-select option {
    padding: 12px 16px;
    background-color: white;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    border: none;
    margin: 0;
  }

  .modern-select option:hover {
    background-color: #f8fafc !important;
    color: #1f2937 !important;
    font-weight: 600 !important;
  }

  .modern-select option:checked {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 600 !important;
  }

  .modern-select option:focus {
    background-color: #eff6ff !important;
    color: #1e40af !important;
    outline: none;
  }

  /* Enhanced styling for better visual hierarchy */
  .modern-select optgroup {
    font-weight: bold;
    color: #6b7280;
    background-color: #f9fafb;
    padding: 8px 16px;
  }

  /* Custom scrollbar for dropdown (WebKit browsers) */
  .modern-select::-webkit-scrollbar {
    width: 8px;
  }

  .modern-select::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .modern-select::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .modern-select::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

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
    photo: null,
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Phone number validation (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits";
    }
    
    // Date validation (no past dates)
    if (formData.preferredDate && formData.preferredDate < getTodayDate()) {
      newErrors.preferredDate = "Please select today's date or a future date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    // For phone number, only allow digits and limit to 10
    if (name === "contactNumber") {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setMessage("Please fix the errors below before submitting.");
      return;
    }

    const data = new FormData();
    for (let key in formData) {
      if (key === "photo" && formData.photo) {
        data.append("photo", formData.photo);
      } else if (
        key !== "photo" &&
        formData[key] !== "" &&
        formData[key] !== undefined &&
        formData[key] !== null
      ) {
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
        photo: null,
      });
    } catch (error) {
      setMessage(
        "Error submitting application: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Inline styles
  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#1E2A38",
    backgroundImage: `url('/images/fire-truck-bg.jpg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    backgroundRepeat: "no-repeat",
    padding: "20px 0",
    fontFamily: "Arial, sans-serif",
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "rgba(30, 42, 56, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    boxShadow: "0px 8px 25px rgba(0,0,0,0.4)",
    border: "1px solid rgba(51, 65, 85, 0.5)",
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "white",
    fontSize: "28px",
    fontWeight: "bold",
  };

  const inputContainer = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "white",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
  };

  const errorInputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #ef4444",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
  };

  const errorTextStyle = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "bold",
  };

  const dateInputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "15px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
  };

  const errorDateInputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "15px",
    border: "2px solid #ef4444",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor: "#C62828",
    color: "white",
    padding: "14px 20px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    fontSize: "18px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(198, 40, 40, 0.3)",
  };

  const buttonHoverStyle = {
    backgroundColor: "#B71C1C",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(198, 40, 40, 0.4)",
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px",
    paddingRight: "40px",
    color: "#374151",
    fontWeight: "500",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  };

  const selectFocusStyle = {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transform: "translateY(-1px)",
  };

  const selectHoverStyle = {
    borderColor: "#d1d5db",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transform: "translateY(-1px)",
  };

  const selectWithOptionsStyle = {
    ...selectStyle,
    background: `white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center/16px`,
  };

  const optionStyle = {
    padding: "12px 16px",
    backgroundColor: "white",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const optionHoverStyle = {
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    fontWeight: "600",
  };

  const optionSelectedStyle = {
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: "600",
  };

  const messageStyle = {
    textAlign: "center",
    fontWeight: "bold",
    color: "black",
    backgroundColor: "#FFFACD",
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #f0e68c",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };


  return (
    <div style={pageStyle}>
      {/* Inject CSS for dropdown styling */}
      <style>{dropdownCSS}</style>
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
            placeholder="Enter 10-digit phone number"
            maxLength="10"
            required
            style={errors.contactNumber ? errorInputStyle : inputStyle}
          />
          {errors.contactNumber && <div style={errorTextStyle}>{errors.contactNumber}</div>}
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
            className="modern-select"
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
            className="modern-select"
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
            className="modern-select"
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
            min={getTodayDate()}
            style={errors.preferredDate ? errorDateInputStyle : dateInputStyle}
          />
          {errors.preferredDate && <div style={errorTextStyle}>{errors.preferredDate}</div>}
        </div>
        <div style={inputContainer}>
          <label style={labelStyle}>Additional Notes:</label>
          <input
            type="text"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={inputContainer}>
          <label style={labelStyle} htmlFor="photo">
            Upload Document
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            onChange={handleFileChange}
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
      </div>
  );
};

export default PreventionCertificateForm;
