import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PreventionOfficerDashboard = () => {
  console.log("PreventionOfficerDashboard component rendering...");
  
  // Add CSS animations to the document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInSlideUp {
        0% {
          opacity: 0;
          transform: translateY(30px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes smoothUnderline {
        0% {
          width: 0;
        }
        100% {
          width: 100%;
        }
      }
      
      /* Brand Color Variables */
      :root {
        --fire-red: #C62828;
        --navy-blue: #1E2A38;
        --bright-orange: #FF9800;
        --warning-yellow: #FBC02D;
        --success-green: #2E7D32;
        --light-gray: #F5F5F5;
      }
      
      .nav-link {
        position: relative;
        transition: all 0.3s ease;
        color: white;
      }
      
      .nav-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--bright-orange);
        transition: width 0.3s ease;
      }
      
      .nav-link:hover::after {
        width: 100%;
      }
      
      .nav-link:hover {
        color: var(--bright-orange);
      }
      
      .smooth-hover {
        transition: all 0.2s ease;
        transform: translateY(0);
      }
      
      .smooth-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        filter: brightness(1.05);
      }
      
      .approve-btn:hover {
        background-color: var(--success-green) !important;
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3) !important;
      }
      
      .reject-btn:hover {
        background-color: #B71C1C !important;
        box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3) !important;
      }
      
      .reactivate-btn:hover {
        background-color: #E65100 !important;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3) !important;
      }

      /* Standard button hover effects */
      .btn-primary:hover {
        background-color: #1d4ed8 !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
        transform: translateY(-1px);
        filter: brightness(1.05);
        transition: all 0.2s ease;
      }

      .btn-success:hover {
        background-color: var(--success-green) !important;
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3) !important;
        transform: translateY(-1px);
        filter: brightness(1.05);
        transition: all 0.2s ease;
      }

      .btn-danger:hover {
        background-color: #B71C1C !important;
        box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3) !important;
        transform: translateY(-1px);
        filter: brightness(1.05);
        transition: all 0.2s ease;
      }

      .btn-secondary:hover {
        background-color: #4b5563 !important;
        box-shadow: 0 4px 12px rgba(75, 85, 99, 0.3) !important;
        transform: translateY(-1px);
        filter: brightness(1.05);
        transition: all 0.2s ease;
      }
      
      .table-row {
        transition: background-color 0.2s ease;
      }
      
      .table-row:hover {
        background-color: #f8fafc !important;
      }
      
      /* Status Colors */
      .status-critical { color: var(--fire-red); font-weight: 600; }
      .status-warning { color: var(--warning-yellow); font-weight: 600; }
      .status-pending { color: var(--warning-yellow); font-weight: 600; }
      .status-normal { color: var(--success-green); font-weight: 600; }
      .status-approved { color: var(--success-green); font-weight: 600; }
      
      /* Navigation Bar Styles */
      .nav-bar {
        background: linear-gradient(135deg, var(--navy-blue) 0%, #2C3E50 100%);
        box-shadow: 0 2px 10px rgba(30, 42, 56, 0.3);
      }
      
      /* Alert Styles */
      .alert-critical {
        background-color: rgba(198, 40, 40, 0.1);
        border-left: 4px solid var(--fire-red);
        color: var(--fire-red);
      }
      
      .alert-warning {
        background-color: rgba(251, 192, 45, 0.1);
        border-left: 4px solid var(--warning-yellow);
        color: #F57F17;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [applications, setApplications] = useState([]);
  
  // Helper function to save applications to localStorage
  const saveApplicationsToLocalStorage = (apps) => {
    console.log("=== SAVING TO LOCALSTORAGE ===");
    console.log("Applications to save:", apps.length);
    apps.forEach(app => {
      console.log(`Saving App ${app._id} (${app.fullName}): ${app.status}`);
    });
    localStorage.setItem('preventionOfficerApplications', JSON.stringify(apps));
    console.log("Successfully saved to localStorage");
    
    // Verify it was saved correctly
    const verification = localStorage.getItem('preventionOfficerApplications');
    if (verification) {
      const parsed = JSON.parse(verification);
      console.log("Verification: localStorage now contains", parsed.length, "applications");
    }
  };
  
  // Helper function to clear localStorage (for development/testing)
  const clearApplicationsFromLocalStorage = () => {
    console.log("Clearing applications from localStorage");
    localStorage.removeItem('preventionOfficerApplications');
    window.location.reload(); // Reload to get fresh mock data
  };
  
  // Make clearApplicationsFromLocalStorage available globally for testing
  if (typeof window !== 'undefined') {
    window.clearApplicationsData = clearApplicationsFromLocalStorage;
  }
  
  // Custom setApplications that also saves to localStorage
  const updateApplications = (updater) => {
    setApplications(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      console.log("=== UPDATING APPLICATIONS ===");
      console.log("Previous applications count:", prev.length);
      console.log("Updated applications count:", updated.length);
      saveApplicationsToLocalStorage(updated);
      return updated;
    });
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("review"); // review, rejected
  const [applicationToReject, setApplicationToReject] = useState(null);
  
  // Inspection tracking states
  const [inspectionModal, setInspectionModal] = useState(null);
  const [inspectionNotes, setInspectionNotes] = useState("");
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");

  // Separate filtered data for each table
  const pendingApplications = React.useMemo(() => {
    return applications.filter(app => app.status === 'Pending');
  }, [applications]);

  const approvedApplications = React.useMemo(() => {
    return applications.filter(app => app.status === 'Approved');
  }, [applications]);

  const rejectedApplications = React.useMemo(() => {
    const rejected = applications.filter(app => app.status === 'Rejected');
    console.log("rejectedApplications updated:", rejected);
    console.log("Total applications:", applications.length);
    console.log("Applications with status 'Rejected':", rejected.length);
    return rejected;
  }, [applications]);

  const paymentAssignedApplications = React.useMemo(() => {
    return applications.filter(app => app.status === 'Payment Assigned' || (app.status === 'Approved' && app.payment));
  }, [applications]);

  const inspectionTrackingApplications = React.useMemo(() => {
    return applications.filter(app => app.status === 'Payment Assigned' && app.payment);
  }, [applications]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log("=== INITIALIZATION START ===");
        console.log("Attempting to fetch applications from API...");
        const res = await axios.get("http://localhost:5000/api/prevention-officer/applications");
        console.log("API Response:", res.data);
        setApplications(res.data);
        setError(null);
        // Save to localStorage for persistence
        localStorage.setItem('preventionOfficerApplications', JSON.stringify(res.data));
        console.log("API data saved to localStorage");
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
        
        // First, try to load from localStorage
        console.log("=== API FAILED, CHECKING LOCALSTORAGE ===");
        const savedApplications = localStorage.getItem('preventionOfficerApplications');
        console.log("Raw localStorage data:", savedApplications);
        
        if (savedApplications) {
          try {
            console.log("Loading applications from localStorage");
            const parsedApplications = JSON.parse(savedApplications);
            console.log("Parsed applications from localStorage:", parsedApplications);
            console.log("Number of applications loaded:", parsedApplications.length);
            
            // Log the status of each application
            parsedApplications.forEach(app => {
              console.log(`App ${app._id} (${app.fullName}): ${app.status}`);
            });
            
            setApplications(parsedApplications);
            console.log("Successfully loaded from localStorage");
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError);
            console.log("Falling back to initial mock data due to parse error");
            loadInitialMockData();
          }
        } else {
          console.log("No localStorage data found, using initial mock data");
          loadInitialMockData();
        }
      } finally {
        setLoading(false);
      }
    };

    const loadInitialMockData = () => {
      console.log("=== LOADING INITIAL MOCK DATA ===");
      const initialMockData = [
        {
          _id: "1",
          fullName: "John Doe",
          nic: "123456789V",
          status: "Pending",
          payment: null,
          address: "123 Main Street, Colombo",
          contactNumber: "0771234567",
          email: "john.doe@email.com",
          serviceType: "Fire Prevention Certificate",
          constructionType: "Residential",
          urgencyLevel: "Normal"
        },
        {
          _id: "2", 
          fullName: "Jane Smith",
          nic: "987654321V",
          status: "Approved",
          payment: null,
          address: "456 Oak Avenue, Kandy",
          contactNumber: "0779876543",
          email: "jane.smith@email.com",
          serviceType: "Fire Prevention Certificate",
          constructionType: "Commercial",
          urgencyLevel: "High"
        },
        {
          _id: "3",
          fullName: "Bob Johnson",
          nic: "555666777V",
          status: "Approved",
          payment: 1500,
          address: "789 Pine Road, Galle",
          contactNumber: "0775551234",
          email: "bob.johnson@email.com",
          serviceType: "Fire Safety Inspection",
          constructionType: "Industrial",
          urgencyLevel: "Normal"
        },
        {
          _id: "4",
          fullName: "Alice Brown",
          nic: "111222333V",
          status: "Payment Assigned",
          payment: 2000,
          address: "321 Cedar Lane, Matara",
          contactNumber: "0771112233",
          email: "alice.brown@email.com",
          serviceType: "Fire Prevention Certificate",
          constructionType: "Commercial",
          urgencyLevel: "Normal"
        },
        {
          _id: "5",
          fullName: "Mike Wilson",
          nic: "444555666V",
          status: "Pending",
          payment: null,
          address: "654 Elm Street, Negombo",
          contactNumber: "0774445566",
          email: "mike.wilson@email.com",
          serviceType: "Emergency Fire Safety",
          constructionType: "Residential",
          urgencyLevel: "High"
        },
        {
          _id: "6",
          fullName: "Sarah Davis",
          nic: "777888999V",
          status: "Rejected",
          payment: null,
          address: "987 Willow Drive, Jaffna",
          contactNumber: "0777889900",
          email: "sarah.davis@email.com",
          serviceType: "Fire Prevention Certificate",
          constructionType: "Residential",
          urgencyLevel: "Normal",
          rejectionReason: "Incomplete documentation - missing building plans"
        },
        {
          _id: "7",
          fullName: "David Martinez",
          nic: "333444555V",
          status: "Rejected",
          payment: null,
          address: "159 Maple Court, Anuradhapura",
          contactNumber: "0773334455",
          email: "david.martinez@email.com",
          serviceType: "Fire Safety Inspection",
          constructionType: "Commercial",
          urgencyLevel: "Normal",
          rejectionReason: "Building does not meet fire safety standards"
        }
      ];
      
      console.log("Initial mock data created, number of applications:", initialMockData.length);
      initialMockData.forEach(app => {
        console.log(`Mock App ${app._id} (${app.fullName}): ${app.status}`);
      });
      
      setApplications(initialMockData);
      // Save initial data to localStorage
      localStorage.setItem('preventionOfficerApplications', JSON.stringify(initialMockData));
      console.log("Initial mock data saved to localStorage");
    };

    fetchApplications();
  }, []);

  // Filter and sort applications
  const filteredAndSortedApplications = React.useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.address && app.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      
      const matchesPayment = paymentFilter === "All" || 
        (paymentFilter === "Assigned" && app.payment) ||
        (paymentFilter === "Not Assigned" && !app.payment);
      
      return matchesSearch && matchesStatus && matchesPayment;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, searchTerm, statusFilter, paymentFilter, sortField, sortDirection]);

  const handleApproveApplication = async (id) => {
    console.log("handleApproveApplication called with:", id);
    console.log("Applications before approval:", applications);
    
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/status`, {
        status: 'Approved',
      });
      
      updateApplications(prev => {
        const updated = prev.map(app =>
          app._id === id ? { 
            ...app, 
            status: 'Approved',
            approvedAt: new Date().toISOString()
          } : app
        );
        console.log("Applications after approval:", updated);
        return updated;
      });
      
      showNotification("Application approved successfully!", "success");
    } catch (err) {
      console.error("Error approving application:", err);
      // Since API is down, we'll still update the local state
      updateApplications(prev => {
        const updated = prev.map(app =>
          app._id === id ? { 
            ...app, 
            status: 'Approved',
            approvedAt: new Date().toISOString()
          } : app
        );
        console.log("Applications after local approval (API failed):", updated);
        return updated;
      });
      
      showNotification("Application approved successfully (local update)!", "success");
    }
  };

  const handleRejectApplication = async (id, rejectionReason = "") => {
    console.log("handleRejectApplication called with:", { id, rejectionReason });
    console.log("Applications before rejection:", applications);
    
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/status`, {
        status: 'Rejected',
        rejectionReason: rejectionReason || "Application rejected by prevention officer"
      });
      
      
      updateApplications(prev => {
        const updated = prev.map(app =>
          app._id === id ? { 
            ...app, 
            status: 'Rejected',
            rejectionReason: rejectionReason || "Application rejected by prevention officer",
            rejectedAt: new Date().toISOString()
          } : app
        );
        console.log("Applications after rejection:", updated);
        return updated;
      });
      
      showNotification("Application rejected successfully!", "success");
      
      // Automatically switch to rejected documents tab to show the result
      setTimeout(() => {
        console.log("Switching to rejected tab");
        setActiveTab("rejected");
      }, 500);
    } catch (err) {
      console.error("Error rejecting application:", err);
      // Since API is down, we'll still update the local state
      updateApplications(prev => {
        const updated = prev.map(app =>
          app._id === id ? { 
            ...app, 
            status: 'Rejected',
            rejectionReason: rejectionReason || "Application rejected by prevention officer",
            rejectedAt: new Date().toISOString()
          } : app
        );
        console.log("Applications after local rejection (API failed):", updated);
        return updated;
      });
      showNotification("Application rejected successfully (local update)!", "success");
      
      // Automatically switch to rejected documents tab to show the result
      setTimeout(() => {
        console.log("Switching to rejected tab (API failed case)");
        setActiveTab("rejected");
      }, 500);
    }
  };

  const handleAssignPayment = async (id, amount) => {
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/payment`, {
        payment: amount,
      });
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/status`, {
        status: 'Payment Assigned',
      });
      setApplications(prev =>
        prev.map(app =>
          app._id === id ? { ...app, payment: amount, status: 'Payment Assigned' } : app
        )
      );
      showNotification(`Payment of Rs. ${amount} assigned successfully!`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to assign payment", "error");
    }
  };

  // Alias for payment assignment table
  const handleAssignPaymentToApp = handleAssignPayment;

  const handleMarkInspected = async (id, notes = "") => {
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/status`, {
        status: 'Inspected',
        inspectionNotes: notes,
      });
      setApplications(prev =>
        prev.map(app =>
          app._id === id ? { ...app, status: 'Inspected', inspectionNotes: notes } : app
        )
      );
      showNotification("Application marked as inspected!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to mark as inspected", "error");
    }
  };

  // New inspection tracking functions
  const handleAddInspectionNotes = async (id, notes) => {
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/inspection-notes`, {
        inspectionNotes: notes
      });
      setApplications(prev =>
        prev.map(app =>
          app._id === id 
            ? { ...app, inspectionNotes: notes } 
            : app
        )
      );
      showNotification("Inspection notes updated successfully", "success");
      setInspectionModal(null);
      setInspectionNotes("");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update inspection notes", "error");
    }
  };

  const handleMarkAsInspected = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/status`, {
        status: 'Inspected'
      });
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/inspect`, {
        inspectionDate: new Date().toISOString()
      });
      setApplications(prev =>
        prev.map(app =>
          app._id === id 
            ? { ...app, status: 'Inspected', inspectionDate: new Date().toISOString() } 
            : app
        )
      );
      showNotification("Application marked as inspected successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to mark as inspected", "error");
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/prevention-officer/applications/${id}`);
      setApplications(prev => prev.filter(app => app._id !== id));
      setShowDeleteConfirm(null);
      showNotification("Application deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete application", "error");
    }
  };

  const handleEditSave = async (updatedApp) => {
    try {
      await axios.put(`http://localhost:5000/api/prevention-officer/applications/${updatedApp._id}`, updatedApp);
      setApplications(prev =>
        prev.map(app =>
          app._id === updatedApp._id ? updatedApp : app
        )
      );
      setEditingApplication(null);
      showNotification("Application updated successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update application", "error");
    }
  };

  const handleBatchAction = async (action) => {
    try {
      const promises = selectedApplications.map(id => {
        switch (action) {
          case 'assignPayment':
            return axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/payment`, { payment: 1000 });
          case 'markInspected':
            return axios.put(`http://localhost:5000/api/prevention-officer/applications/${id}/status`, { status: 'Inspected' });
          case 'delete':
            return axios.delete(`http://localhost:5000/api/prevention-officer/applications/${id}`);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      
      if (action === 'delete') {
        setApplications(prev => prev.filter(app => !selectedApplications.includes(app._id)));
      } else {
        const updates = {};
        if (action === 'assignPayment') updates.payment = 1000;
        if (action === 'markInspected') updates.status = 'Inspected';
        
        setApplications(prev =>
          prev.map(app =>
            selectedApplications.includes(app._id) ? { ...app, ...updates } : app
          )
        );
      }
      
      setSelectedApplications([]);
      showNotification(`Batch ${action} completed successfully`, "success");
    } catch (err) {
      console.error(err);
      showNotification(`Failed to complete batch ${action}`, "error");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredAndSortedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredAndSortedApplications.map(app => app._id));
    }
  };

  const handleRowSelect = (id) => {
    setSelectedApplications(prev =>
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const showNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const exportToExcel = () => {
    // Mock implementation - in real app, use libraries like xlsx or react-csv
    const csvContent = [
      ["Full Name", "NIC", "Status", "Payment"],
      ...filteredAndSortedApplications.map(app => [
        app.fullName,
        app.nic,
        app.status,
        app.payment || "Not Assigned"
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prevention_applications.csv';
    link.click();
    showNotification("Data exported successfully", "success");
  };

  const printTable = () => {
    window.print();
    showNotification("Print dialog opened", "info");
  };

  const getRowColor = (app) => {
    if (app.status === 'Completed' || app.status === 'Inspected') return '#f0f9ff'; // Light blue
    if (app.status === 'Approved') return '#f0fdf4'; // Light green
    if (app.status === 'Rejected') return '#fef2f2'; // Light red
    if (!app.payment) return '#fffbeb'; // Light yellow for no payment
    return 'white';
  };

  // Chart Data
  const paidCount = applications.filter(app => app.payment !== null).length;
  const unpaidCount = applications.length - paidCount;

  const chartData = {
    labels: ["Paid", "Unpaid"],
    datasets: [
      {
        data: [paidCount, unpaidCount],
        backgroundColor: ["#4CAF50", "#C62828"],
      },
    ],
  };

  // Edit Modal Component
  const EditModal = ({ application, onSave, onClose }) => {
    const [formData, setFormData] = useState({
      fullName: application.fullName || '',
      nic: application.nic || '',
      address: application.address || '',
      contactNumber: application.contactNumber || '',
      email: application.email || '',
      status: application.status || 'Pending',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...application, ...formData });
    };

    return (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: "20px", color: "#1c1e21" }}>Edit Application</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Full Name</label>
              <input
                style={searchInputStyle}
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>NIC</label>
              <input
                style={searchInputStyle}
                type="text"
                value={formData.nic}
                onChange={(e) => setFormData({...formData, nic: e.target.value})}
                required
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Address</label>
              <input
                style={searchInputStyle}
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Contact Number</label>
              <input
                style={searchInputStyle}
                type="text"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Email</label>
              <input
                style={searchInputStyle}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Status</label>
              <select
                style={filterSelectStyle}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Inspected">Inspected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ ...secondaryButtonStyle, padding: "10px 20px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ ...actionButtonStyle, padding: "10px 20px" }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ applicationName, onConfirm, onCancel }) => (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={{...modalStyle, maxWidth: "400px"}} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: "16px", color: "#dc2626" }}>Confirm Delete</h3>
        <p style={{ marginBottom: "20px", color: "#6b7280" }}>
          Are you sure you want to delete the application for <strong>{applicationName}</strong>? 
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ ...secondaryButtonStyle, padding: "10px 20px" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ ...dangerBatchButtonStyle, padding: "10px 20px" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Rejection Modal
  const RejectionModal = ({ application, onConfirm, onCancel }) => {
    const [localRejectionReason, setLocalRejectionReason] = useState("");
    
    // Safety check
    if (!application) {
      console.error("RejectionModal: No application provided");
      return null;
    }
    
    return (
      <div style={modalOverlayStyle} onClick={onCancel}>
        <div style={{...modalStyle, maxWidth: "500px"}} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: "20px", color: "#dc2626", fontSize: "20px", fontWeight: "600" }}>
            Reject Application
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <p style={{ marginBottom: "16px", color: "#6b7280" }}>
              <strong>Applicant:</strong> {application.fullName || 'Unknown'} ({application.nic || 'N/A'})
            </p>
            <p style={{ marginBottom: "20px", color: "#6b7280" }}>
              Are you sure you want to reject this application? Please provide a reason for rejection.
            </p>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
              Rejection Reason *
            </label>
            <textarea
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical"
              }}
              placeholder="Please specify the reason for rejecting this application..."
              value={localRejectionReason}
              onChange={(e) => setLocalRejectionReason(e.target.value)}
            />
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={onCancel}
              className="btn-secondary"
              style={{ ...secondaryButtonStyle, padding: "10px 20px" }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (localRejectionReason.trim()) {
                  onConfirm(localRejectionReason);
                  setLocalRejectionReason("");
                }
              }}
              style={{ 
                ...dangerBatchButtonStyle, 
                padding: "10px 20px",
                opacity: localRejectionReason.trim() ? 1 : 0.5,
                cursor: localRejectionReason.trim() ? "pointer" : "not-allowed"
              }}
              disabled={!localRejectionReason.trim()}
            >
              Reject Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Document Review Table Component
  const DocumentReviewTable = () => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSortField, setLocalSortField] = useState('fullName');
    const [localSortDirection, setLocalSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewDetailsApp, setViewDetailsApp] = useState(null);

    // Filter pending applications based on local search
    const filteredPendingApplications = React.useMemo(() => {
      let filtered = pendingApplications.filter(app => {
        const matchesSearch = localSearchTerm === "" || 
          app.fullName.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          app.nic.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          (app.address && app.address.toLowerCase().includes(localSearchTerm.toLowerCase()));
        return matchesSearch;
      });

      // Sort applications
      filtered.sort((a, b) => {
        let aValue = a[localSortField];
        let bValue = b[localSortField];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return localSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return localSortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    }, [pendingApplications, localSearchTerm, localSortField, localSortDirection]);

    const handleLocalSort = (field) => {
      if (localSortField === field) {
        setLocalSortDirection(localSortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setLocalSortField(field);
        setLocalSortDirection('asc');
      }
    };

    const handleSelectRow = (id) => {
      setSelectedRows(prev => 
        prev.includes(id) 
          ? prev.filter(rowId => rowId !== id)
          : [...prev, id]
      );
    };

    const handleSelectAll = () => {
      setSelectedRows(
        selectedRows.length === filteredPendingApplications.length 
          ? [] 
          : filteredPendingApplications.map(app => app._id)
      );
    };

    const handleBatchApprove = () => {
      selectedRows.forEach(id => handleApproveApplication(id));
      setSelectedRows([]);
    };

    const handleBatchReject = () => {
      if (selectedRows.length > 0) {
        // For batch reject, use a generic reason
        const genericReason = "Batch rejection by prevention officer";
        selectedRows.forEach(id => handleRejectApplication(id, genericReason));
        setSelectedRows([]);
      }
    };

    // View Details Modal
    const ViewDetailsModal = ({ app, onClose }) => (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={{...modalStyle, maxWidth: "600px"}} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: "20px", color: "#1f2937", fontSize: "20px", fontWeight: "600" }}>
            Application Details
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Full Name
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.fullName}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                NIC Number
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.nic}
              </p>
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Address
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.address || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Contact Number
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.contactNumber || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Email
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.email || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Service Type
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.serviceType || 'Fire Prevention Certificate'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Construction Type
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.constructionType || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Urgency Level
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.urgencyLevel || 'Normal'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Application Date
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Not available'}
              </p>
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Additional Notes
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px", minHeight: "60px" }}>
                {app.additionalNotes || 'No additional notes provided'}
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                handleRejectApplication(app._id);
                onClose();
              }}
              style={{ ...dangerBatchButtonStyle, padding: "10px 20px" }}
            >
              Reject
            </button>
            <button
              onClick={() => {
                handleApproveApplication(app._id);
                onClose();
              }}
              style={{ ...successBatchButtonStyle, padding: "10px 20px" }}
            >
              Approve
            </button>
            <button
              onClick={onClose}
              style={{ ...secondaryButtonStyle, padding: "10px 20px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <h3 style={tableTitleStyle}>Document Review - Pending Applications ({filteredPendingApplications.length})</h3>
        
        {/* Search Bar */}
        <div style={{...searchBarStyle, marginBottom: "16px"}}>
          <input
            style={searchInputStyle}
            type="text"
            placeholder="Search by name, NIC, or address..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          <button 
            className="btn-primary"
            style={primaryBatchButtonStyle}
            onClick={() => setLocalSearchTerm("")}
          >
            Clear Search
          </button>
        </div>

        {/* Batch Actions */}
        {selectedRows.length > 0 && (
          <div style={{...batchActionsStyle, marginBottom: "16px"}}>
            <div>
              <span style={{ fontWeight: "500", marginRight: "16px" }}>
                {selectedRows.length} selected
              </span>
              <button 
                className="btn-success"
                style={successBatchButtonStyle}
                onClick={handleBatchApprove}
              >
                Batch Approve
              </button>
              <button 
                className="btn-danger"
                style={dangerBatchButtonStyle}
                onClick={handleBatchReject}
              >
                Batch Reject
              </button>
            </div>
          </div>
        )}
        
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredPendingApplications.length && filteredPendingApplications.length > 0}
                    onChange={handleSelectAll}
                    style={{ marginRight: "8px" }}
                  />
                  Select
                </th>
                <th style={thStyle}>
                  Applicant Name
                </th>
                <th style={thStyle}>
                  NIC
                </th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Document Details</th>
                <th style={thStyle}>
                  Status
                </th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingApplications.map((app, index) => (
                <tr 
                  key={app._id} 
                  className="table-row"
                  style={{ 
                    backgroundColor: selectedRows.includes(app._id) 
                      ? '#eff6ff' 
                      : "white"
                  }}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(app._id)}
                      onChange={() => handleSelectRow(app._id)}
                    />
                  </td>
                  <td style={tdStyle}>{app.fullName}</td>
                  <td style={tdStyle}>{app.nic}</td>
                  <td style={tdStyle}>{app.address || 'Not provided'}</td>
                  <td style={tdStyle}>
                    <div>
                      <div><strong>Service:</strong> {app.serviceType || 'Fire Prevention'}</div>
                      <div><strong>Type:</strong> {app.constructionType || 'Not specified'}</div>
                      <div><strong>Urgency:</strong> {app.urgencyLevel || 'Normal'}</div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {getStatusBadge(app.status)}
                  </td>
                  <td style={tdStyle}>
                    <div style={actionButtonsStyle}>
                      <button
                        className="smooth-hover approve-btn btn-success"
                        style={{...successBatchButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => handleApproveApplication(app._id)}
                        title="Approve Application"
                      >
                        Approve
                      </button>
                      <button
                        className="smooth-hover reject-btn btn-danger"
                        style={{...dangerBatchButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => {
                          console.log("Reject button clicked!");
                          console.log("Application to reject:", app);
                          setApplicationToReject(app);
                          console.log("Application state set");
                        }}
                        title="Reject Application"
                      >
                        Reject
                      </button>
                      <button
                        style={{...editButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => setViewDetailsApp(app)}
                        title="View Details"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPendingApplications.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#6b7280",
              backgroundColor: "white"
            }}>
              No pending applications found matching your search.
            </div>
          )}
        </div>

        {/* Display count */}
        {filteredPendingApplications.length > 0 && (
          <div style={{ 
            marginTop: "16px", 
            fontSize: "14px", 
            color: "#6b7280",
            textAlign: "center"
          }}>
            Showing {filteredPendingApplications.length} of {pendingApplications.length} pending applications
            {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
          </div>
        )}

        {/* View Details Modal */}
        {viewDetailsApp && (
          <ViewDetailsModal 
            app={viewDetailsApp} 
            onClose={() => setViewDetailsApp(null)} 
          />
        )}
      </div>
    );
  };

  // Payment Assignment Table Component
  const PaymentAssignmentTable = () => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSortField, setLocalSortField] = useState('fullName');
    const [localSortDirection, setLocalSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState([]);
    const [paymentModal, setPaymentModal] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(1000); // Start from Rs.1000
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

    // Filter approved applications based on local search and payment status
    const filteredApprovedApplications = React.useMemo(() => {
      let filtered = approvedApplications.filter(app => {
        const matchesSearch = localSearchTerm === "" || 
          app.fullName.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          app.nic.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          (app.address && app.address.toLowerCase().includes(localSearchTerm.toLowerCase()));
        
        const matchesPaymentStatus = paymentStatusFilter === "All" ||
          (paymentStatusFilter === "Assigned" && app.payment) ||
          (paymentStatusFilter === "Not Assigned" && !app.payment);
        
        return matchesSearch && matchesPaymentStatus;
      });

      // Sort applications
      filtered.sort((a, b) => {
        let aValue = a[localSortField];
        let bValue = b[localSortField];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return localSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return localSortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    }, [approvedApplications, localSearchTerm, localSortField, localSortDirection, paymentStatusFilter]);

    const handleLocalSort = (field) => {
      if (localSortField === field) {
        setLocalSortDirection(localSortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setLocalSortField(field);
        setLocalSortDirection('asc');
      }
    };

    const handleSelectRow = (id) => {
      setSelectedRows(prev => 
        prev.includes(id) 
          ? prev.filter(rowId => rowId !== id)
          : [...prev, id]
      );
    };

    const handleSelectAll = () => {
      setSelectedRows(
        selectedRows.length === filteredApprovedApplications.length 
          ? [] 
          : filteredApprovedApplications.map(app => app._id)
      );
    };

    const handleAssignPayment = async (appId, amount) => {
      try {
        console.log(`Assigning payment of Rs. ${amount} to application ${appId}`);
        await handleAssignPaymentToApp(appId, amount);
        setPaymentModal(null);
        setPaymentAmount(1000); // Reset to minimum amount
      } catch (error) {
        console.error('Error assigning payment:', error);
      }
    };

    const handleBatchAssignPayment = () => {
      if (paymentAmount && selectedRows.length > 0) {
        selectedRows.forEach(id => handleAssignPayment(id, paymentAmount));
        setSelectedRows([]);
        setPaymentAmount(1000); // Reset to minimum amount
      }
    };

    const handleMarkPaymentAssigned = async (appId) => {
      try {
        console.log(`Marking payment as assigned for application ${appId}`);
        await axios.put(`http://localhost:5000/api/prevention-officer/applications/${appId}/status`, {
          status: 'Payment Assigned'
        });
        setApplications(prev =>
          prev.map(app =>
            app._id === appId ? { ...app, status: 'Payment Assigned' } : app
          )
        );
      } catch (error) {
        console.error('Error marking payment assigned:', error);
      }
    };

    // Payment Assignment Modal
    const PaymentModal = ({ app, onClose }) => (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={{...modalStyle, maxWidth: "500px"}} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: "20px", color: "#1f2937", fontSize: "20px", fontWeight: "600" }}>
            Assign Payment Amount
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <p style={{ marginBottom: "16px", color: "#6b7280" }}>
              <strong>Applicant:</strong> {app.fullName} ({app.nic})
            </p>
            <p style={{ marginBottom: "16px", color: "#6b7280" }}>
              <strong>Service:</strong> {app.serviceType || 'Fire Prevention Certificate'}
            </p>
            <p style={{ marginBottom: "20px", color: "#6b7280" }}>
              <strong>Construction Type:</strong> {app.constructionType || 'Not specified'}
            </p>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
              Payment Amount (Rs.)
            </label>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              border: "1px solid #d1d5db", 
              borderRadius: "6px",
              overflow: "hidden"
            }}>
              <button
                type="button"
                onClick={() => {
                  const currentAmount = Number(paymentAmount) || 1000;
                  setPaymentAmount(Math.max(1000, currentAmount - 500));
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#6b7280",
                  borderRight: "1px solid #d1d5db",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
              >
                -
              </button>
              <input
                style={{
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  fontSize: "16px",
                  padding: "12px 20px",
                  flex: 1,
                  minWidth: "120px",
                  backgroundColor: "white",
                  color: "#000000"
                }}
                type="number"
                value={paymentAmount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Allow user to type freely, including empty field
                  setPaymentAmount(newValue);
                }}
                onBlur={(e) => {
                  // Enforce minimum when user stops editing
                  const value = Number(e.target.value);
                  if (isNaN(value) || value < 1000) {
                    setPaymentAmount(1000);
                  } else {
                    setPaymentAmount(value);
                  }
                }}
                min="1000"
                step="1"
                placeholder="1000"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => {
                  const currentAmount = Number(paymentAmount) || 1000;
                  setPaymentAmount(currentAmount + 500);
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#6b7280",
                  borderLeft: "1px solid #d1d5db",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
              >
                +
              </button>
            </div>
            <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
              Minimum: Rs.1,000 | Increment: Rs.500
            </small>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{ ...secondaryButtonStyle, padding: "10px 20px" }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleAssignPayment(app._id, paymentAmount)}
              style={{ 
                ...primaryBatchButtonStyle, 
                padding: "10px 20px"
              }}
            >
              Assign Payment
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <h3 style={tableTitleStyle}>Payment Assignment - Approved Applications ({filteredApprovedApplications.length})</h3>
        
        {/* Search Bar and Filters */}
        <div style={{...searchBarStyle, marginBottom: "16px"}}>
          <input
            style={searchInputStyle}
            type="text"
            placeholder="Search by name, NIC, or address..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          <select
            style={filterSelectStyle}
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="All">All Payment Status</option>
            <option value="Assigned">Payment Assigned</option>
            <option value="Not Assigned">Payment Not Assigned</option>
          </select>
          <button 
            style={primaryBatchButtonStyle}
            onClick={() => {
              setLocalSearchTerm("");
              setPaymentStatusFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Batch Actions */}
        {selectedRows.length > 0 && (
          <div style={{...batchActionsStyle, marginBottom: "16px"}}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontWeight: "500" }}>
                {selectedRows.length} selected
              </span>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                border: "1px solid #d1d5db", 
                borderRadius: "6px",
                overflow: "hidden"
              }}>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(Math.max(1000, paymentAmount - 500))}
                  style={{
                    padding: "8px 12px",
                    border: "none",
                    backgroundColor: "#f3f4f6",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#6b7280"
                  }}
                >
                  -
                </button>
                <input
                  style={{ 
                    border: "none", 
                    outline: "none", 
                    textAlign: "center", 
                    width: "100px", 
                    padding: "8px",
                    fontSize: "14px"
                  }}
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                  min="1000"
                  step="500"
                />
                <button
                  type="button"
                  onClick={() => setPaymentAmount(paymentAmount + 500)}
                  style={{
                    padding: "8px 12px",
                    border: "none",
                    backgroundColor: "#f3f4f6",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#6b7280"
                  }}
                >
                  +
                </button>
              </div>
              <button 
                style={primaryBatchButtonStyle}
                onClick={handleBatchAssignPayment}
              >
                Batch Assign Payment
              </button>
            </div>
          </div>
        )}
        
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredApprovedApplications.length && filteredApprovedApplications.length > 0}
                    onChange={handleSelectAll}
                    style={{ marginRight: "8px" }}
                  />
                  Select
                </th>
                <th style={thStyle}>
                  Applicant Name
                </th>
                <th style={thStyle}>
                  NIC
                </th>
                <th style={thStyle}>
                  Status
                </th>
                <th style={thStyle}>
                  Payment Amount
                </th>
                <th style={thStyle}>Payment Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovedApplications.map((app, index) => (
                <tr 
                  key={app._id} 
                  className="table-row"
                  style={{ 
                    backgroundColor: selectedRows.includes(app._id) 
                      ? '#eff6ff' 
                      : "white"
                  }}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(app._id)}
                      onChange={() => handleSelectRow(app._id)}
                    />
                  </td>
                  <td style={tdStyle}>{app.fullName}</td>
                  <td style={tdStyle}>{app.nic}</td>
                  <td style={tdStyle}>
                    {getStatusBadge(app.status)}
                  </td>
                  <td style={tdStyle}>
                    <span style={app.payment ? paymentStyle : noPaymentStyle}>
                      {app.payment ? `Rs. ${app.payment.toLocaleString()}` : "Not Assigned"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      ...statusStyle,
                      backgroundColor: app.payment ? '#dcfce7' : '#fee2e2',
                      color: app.payment ? '#166534' : '#dc2626'
                    }}>
                      {app.payment ? 'Assigned' : 'Not Assigned'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={actionButtonsStyle}>
                      {app.status !== 'Payment Assigned' ? (
                        <button
                          className="btn-primary"
                          style={{...primaryBatchButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                          onClick={() => {
                            console.log('Opening payment modal');
                            setPaymentAmount(1000); // Reset to default amount
                            setPaymentModal(app);
                          }}
                          title="Assign Payment Amount"
                        >
                          Assign Payment
                        </button>
                      ) : (
                        <button
                          style={{
                            ...successBatchButtonStyle, 
                            fontSize: "12px", 
                            padding: "6px 12px",
                            opacity: 0.5,
                            cursor: 'not-allowed'
                          }}
                          disabled={true}
                          title="Payment Already Assigned"
                        >
                          Payment Assigned
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredApprovedApplications.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#6b7280",
              backgroundColor: "white"
            }}>
              No approved applications found matching your search.
            </div>
          )}
        </div>

        {/* Display count */}
        {filteredApprovedApplications.length > 0 && (
          <div style={{ 
            marginTop: "16px", 
            fontSize: "14px", 
            color: "#6b7280",
            textAlign: "center"
          }}>
            Showing {filteredApprovedApplications.length} of {approvedApplications.length} approved applications
            {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
          </div>
        )}

        {/* Payment Assignment Modal */}
        {paymentModal && (
          <PaymentModal 
            app={paymentModal} 
            onClose={() => {
              setPaymentModal(null);
              setPaymentAmount('');
            }} 
          />
        )}
      </div>
    );
  };

  // Rejected Documents Table Component
  const RejectedDocumentsTable = () => {
    console.log("RejectedDocumentsTable rendering, rejectedApplications:", rejectedApplications);
    
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSortField, setLocalSortField] = useState('fullName');
    const [localSortDirection, setLocalSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewDetailsApp, setViewDetailsApp] = useState(null);

    // Filter rejected applications based on local search
    const filteredRejectedApplications = React.useMemo(() => {
      let filtered = rejectedApplications.filter(app => {
        const matchesSearch = localSearchTerm === "" || 
          app.fullName.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          app.nic.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          (app.address && app.address.toLowerCase().includes(localSearchTerm.toLowerCase()));
        return matchesSearch;
      });

      // Sort applications
      filtered.sort((a, b) => {
        let aValue = a[localSortField];
        let bValue = b[localSortField];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return localSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return localSortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    }, [rejectedApplications, localSearchTerm, localSortField, localSortDirection]);

    const handleLocalSort = (field) => {
      if (localSortField === field) {
        setLocalSortDirection(localSortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setLocalSortField(field);
        setLocalSortDirection('asc');
      }
    };

    const handleSelectRow = (id) => {
      setSelectedRows(prev => 
        prev.includes(id) 
          ? prev.filter(rowId => rowId !== id)
          : [...prev, id]
      );
    };

    const handleSelectAll = () => {
      setSelectedRows(
        selectedRows.length === filteredRejectedApplications.length 
          ? [] 
          : filteredRejectedApplications.map(app => app._id)
      );
    };

    const handleReactivateApplication = async (appId) => {
      console.log(`Reactivating application ${appId}`);
      console.log("Applications before reactivation:", applications);
      
      try {
        await axios.put(`http://localhost:5000/api/prevention-officer/applications/${appId}/reactivate`);
        
        updateApplications(prev => {
          const updated = prev.map(app =>
            app._id === appId ? { 
              ...app, 
              status: 'Pending',
              rejectionReason: null,
              rejectedAt: null
            } : app
          );
          console.log("Applications after reactivation (API success):", updated);
          return updated;
        });
        
        showNotification("Application reactivated and moved back to pending!", "success");
        
        // Automatically switch to document review tab to show the reactivated application
        setTimeout(() => {
          console.log("Switching to document review tab after reactivation");
          setActiveTab("review");
        }, 500);
        
      } catch (error) {
        console.error('Error reactivating application (API failed):', error);
        
        // Since API is down, we'll still update the local state
        updateApplications(prev => {
          const updated = prev.map(app =>
            app._id === appId ? { 
              ...app, 
              status: 'Pending',
              rejectionReason: undefined,
              rejectedAt: undefined
            } : app
          );
          console.log("Applications after reactivation (API failed, local update):", updated);
          return updated;
        });
        
        showNotification("Application reactivated successfully (local update)!", "success");
        
        // Automatically switch to document review tab
        setTimeout(() => {
          console.log("Switching to document review tab after reactivation (API failed case)");
          setActiveTab("review");
        }, 500);
      }
    };

    const handleBatchReactivate = () => {
      console.log(`Batch reactivating ${selectedRows.length} applications:`, selectedRows);
      
      selectedRows.forEach(id => handleReactivateApplication(id));
      setSelectedRows([]);
      
      showNotification(`Batch reactivating ${selectedRows.length} applications...`, "success");
    };

    // Handle Delete Application
    const handleDeleteApplication = async (id) => {
      console.log("handleDeleteApplication called with:", id);
      
      if (!window.confirm("Are you sure you want to permanently delete this application? This action cannot be undone.")) {
        return;
      }

      try {
        console.log('Attempting to delete application via API:', id);
        
        const response = await fetch(`http://localhost:5000/api/prevention-certificates/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('Application deleted successfully via API');
          
          // Remove from local state
          setApplications(prevApplications => {
            const updated = prevApplications.filter(app => app._id !== id);
            console.log("Applications after deletion (API success):", updated);
            return updated;
          });
          
          showNotification("Application deleted successfully!", "success");
        } else {
          throw new Error('Failed to delete application');
        }
      } catch (error) {
        console.error('Error deleting application (API call failed):', error);
        
        // Still update locally if API fails
        setApplications(prevApplications => {
          const updated = prevApplications.filter(app => app._id !== id);
          console.log("Applications after deletion (API failed, local update):", updated);
          return updated;
        });
        
        showNotification("Application deleted successfully (local update)!", "success");
      }
    };

    // View Details Modal for Rejected Applications
    const ViewDetailsModal = ({ app, onClose }) => (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={{...modalStyle, maxWidth: "600px"}} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: "20px", color: "#dc2626", fontSize: "20px", fontWeight: "600" }}>
            Rejected Application Details
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Full Name
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.fullName}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                NIC Number
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.nic}
              </p>
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Address
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.address || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Contact Number
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.contactNumber || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Email
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.email || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Service Type
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.serviceType || 'Fire Prevention Certificate'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Construction Type
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.constructionType || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Urgency Level
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.urgencyLevel || 'Normal'}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Status
              </label>
              <p style={{ 
                margin: "0", 
                padding: "8px", 
                backgroundColor: "#fee2e2", 
                borderRadius: "4px",
                color: "#dc2626",
                fontWeight: "500"
              }}>
                {app.status}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                Rejection Date
              </label>
              <p style={{ margin: "0", padding: "8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
                {app.rejectedAt ? new Date(app.rejectedAt).toLocaleDateString() : 'Not available'}
              </p>
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#dc2626" }}>
                Rejection Reason
              </label>
              <p style={{ 
                margin: "0", 
                padding: "12px", 
                backgroundColor: "#fee2e2", 
                borderRadius: "4px",
                border: "1px solid #fecaca",
                color: "#991b1b",
                minHeight: "80px",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                lineHeight: "1.5",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box"
              }}>
                {app.rejectionReason || 'No reason provided'}
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                handleReactivateApplication(app._id);
                onClose();
              }}
              style={{ ...primaryBatchButtonStyle, padding: "10px 20px" }}
            >
              Reactivate
            </button>
            <button
              onClick={onClose}
              style={{ ...secondaryButtonStyle, padding: "10px 20px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <h3 style={tableTitleStyle}>Rejected Documents ({filteredRejectedApplications.length})</h3>
        
        {/* Search Bar */}
        <div style={{...searchBarStyle, marginBottom: "16px"}}>
          <input
            style={searchInputStyle}
            type="text"
            placeholder="Search rejected applications..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          <button 
            className="btn-primary"
            style={primaryBatchButtonStyle}
            onClick={() => setLocalSearchTerm("")}
          >
            Clear Search
          </button>
        </div>

        {/* Batch Actions */}
        {selectedRows.length > 0 && (
          <div style={{...batchActionsStyle, marginBottom: "16px"}}>
            <div>
              <span style={{ fontWeight: "500", marginRight: "16px" }}>
                {selectedRows.length} selected
              </span>
              <button 
                style={primaryBatchButtonStyle}
                onClick={handleBatchReactivate}
              >
                Batch Reactivate
              </button>
            </div>
          </div>
        )}
        
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredRejectedApplications.length && filteredRejectedApplications.length > 0}
                    onChange={handleSelectAll}
                    style={{ marginRight: "8px" }}
                  />
                  Select
                </th>
                <th style={thStyle}>
                  Applicant Name
                </th>
                <th style={thStyle}>
                  NIC
                </th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Rejection Reason</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRejectedApplications.map((app, index) => (
                <tr 
                  key={app._id} 
                  className="table-row"
                  style={modernRowStyle(selectedRows.includes(app._id) 
                    ? '#fef2f2' 
                    : "white")}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(app._id)}
                      onChange={() => handleSelectRow(app._id)}
                    />
                  </td>
                  <td style={tdStyle}>{app.fullName}</td>
                  <td style={tdStyle}>{app.nic}</td>
                  <td style={tdStyle}>{app.address || 'Not provided'}</td>
                  <td style={tdStyle}>
                    <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {app.rejectionReason || 'No reason provided'}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {getStatusBadge(app.status)}
                  </td>
                  <td style={tdStyle}>
                    <div style={actionButtonsStyle}>
                      <button
                        className="smooth-hover reactivate-btn"
                        style={{...primaryBatchButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => handleReactivateApplication(app._id)}
                        title="Reactivate Application"
                      >
                        Reactivate
                      </button>
                      <button
                        className="smooth-hover btn-danger"
                        style={{...dangerBatchButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => handleDeleteApplication(app._id)}
                        title="Delete Application"
                      >
                        Delete
                      </button>
                      <button
                        style={{...editButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => setViewDetailsApp(app)}
                        title="View Details"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRejectedApplications.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#6b7280",
              backgroundColor: "white"
            }}>
              No rejected applications found.
            </div>
          )}
        </div>

        {/* Display count */}
        {filteredRejectedApplications.length > 0 && (
          <div style={{ 
            marginTop: "16px", 
            fontSize: "14px", 
            color: "#6b7280",
            textAlign: "center"
          }}>
            Showing {filteredRejectedApplications.length} of {rejectedApplications.length} rejected applications
            {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
          </div>
        )}

        {/* View Details Modal */}
        {viewDetailsApp && (
          <ViewDetailsModal 
            app={viewDetailsApp} 
            onClose={() => setViewDetailsApp(null)} 
          />
        )}
      </div>
    );
  };

  // Inspection Tracking Table Component
  const InspectionTrackingTable = () => (
    <div>
      <h3 style={tableTitleStyle}>Inspection Tracking - Payment Assigned Applications ({inspectionTrackingApplications.length})</h3>
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Applicant Name</th>
            <th style={thStyle}>NIC</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Inspection Notes</th>
            <th style={thStyle}>Inspection Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inspectionTrackingApplications.map((app, index) => (
            <tr 
              key={app._id} 
              className="table-row"
              style={{ backgroundColor: "white" }}
            >
              <td style={tdStyle}>{app.fullName}</td>
              <td style={tdStyle}>{app.nic}</td>
              <td style={tdStyle}>
                {getStatusBadge(app.status)}
              </td>
              <td style={tdStyle}>
                <span style={{ 
                  fontSize: "12px", 
                  color: app.inspectionNotes ? "#374151" : "#9ca3af",
                  fontStyle: app.inspectionNotes ? "normal" : "italic"
                }}>
                  {app.inspectionNotes || "No notes added"}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "500",
                  backgroundColor: app.status === 'Inspected' ? '#f0fdf4' : '#fef3c7',
                  color: app.status === 'Inspected' ? '#15803d' : '#d97706',
                  border: `1px solid ${app.status === 'Inspected' ? '#bbf7d0' : '#fed7aa'}`
                }}>
                  {app.status === 'Inspected' ? 'Completed' : 'Pending'}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={actionButtonsStyle}>
                  {app.status !== 'Inspected' ? (
                    <>
                      <button
                        style={{...successBatchButtonStyle, fontSize: "12px", padding: "6px 12px", marginRight: "8px"}}
                        onClick={() => handleMarkAsInspected(app._id)}
                        title="Mark as Inspected"
                      >
                        Mark Inspected
                      </button>
                      <button
                        style={{...primaryBatchButtonStyle, fontSize: "12px", padding: "6px 12px"}}
                        onClick={() => {
                          setInspectionModal(app);
                          setInspectionNotes(app.inspectionNotes || "");
                        }}
                        title="Add Notes"
                      >
                        Add Notes
                      </button>
                    </>
                  ) : (
                    <button
                      style={{
                        ...primaryBatchButtonStyle, 
                        fontSize: "12px", 
                        padding: "6px 12px",
                        backgroundColor: "#f3f4f6",
                        color: "#6b7280",
                        cursor: "default"
                      }}
                      disabled
                      title="Inspection Completed"
                    >
                      Completed
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {inspectionTrackingApplications.length === 0 && (
            <tr>
              <td colSpan="6" style={{...tdStyle, textAlign: "center", fontStyle: "italic", color: "#6b7280"}}>
                No applications pending inspection
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Inspection Notes Modal */}
      {inspectionModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>
              Add Inspection Notes - {inspectionModal.fullName}
            </h3>
            <textarea
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="Enter inspection notes..."
              style={{
                width: "100%",
                height: "120px",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                marginBottom: "16px"
              }}
            />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setInspectionModal(null);
                  setInspectionNotes("");
                }}
                style={{
                  ...secondaryButtonStyle,
                  padding: "8px 16px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddInspectionNotes(inspectionModal._id, inspectionNotes)}
                style={{
                  ...primaryBatchButtonStyle,
                  padding: "8px 16px"
                }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#6b7280",
        backgroundColor: "#f8fafc"
      }}>
        <div>
          <p>Loading applications...</p>
          <p style={{ fontSize: "14px", marginTop: "10px" }}>
            If this takes too long, there might be a backend connection issue.
          </p>
        </div>
      </div>
    );
  }

  // Inline styles for modern design with profile layout
  const containerStyle = {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  };

  const coverPhotoStyle = {
    width: "100%",
    height: "320px",
    backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    borderRadius: "0 0 8px 8px",
  };

  const profileSectionStyle = {
    backgroundColor: "white",
    padding: "0",
    position: "relative",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderRadius: "0 0 8px 8px",
  };

  const profileInfoStyle = {
    padding: "20px 40px",
    display: "flex",
    alignItems: "flex-end",
    position: "relative",
    marginTop: "-80px",
  };

  const avatarStyle = {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    border: "6px solid white",
    backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    marginRight: "20px",
  };

  const profileTextStyle = {
    flex: 1,
    paddingBottom: "20px",
  };

  const nameStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1c1e21",
    margin: "0 0 4px 0",
  };

  const roleStyle = {
    fontSize: "16px",
    color: "#65676b",
    margin: "0",
  };

  const buttonsContainerStyle = {
    paddingBottom: "20px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  };

  const actionButtonStyle = {
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const secondaryButtonStyle = {
    backgroundColor: "#e4e6ea",
    color: "#1c1e21",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const mainContentStyle = {
    padding: "20px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
    marginTop: "30px",
    padding: "0 4px",
  };

  // New styles for enhanced functionality
  const searchBarStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    alignItems: "center",
  };

  const searchInputStyle = {
    flex: "1",
    minWidth: "250px",
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  };

  const filterSelectStyle = {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    minWidth: "120px",
  };

  const batchActionsStyle = {
    backgroundColor: "white",
    padding: "16px 20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  };

  const batchButtonStyle = {
    padding: "8px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginRight: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  };

  const primaryBatchButtonStyle = {
    ...batchButtonStyle,
    backgroundColor: "#2563eb",
    color: "white",
    border: "1px solid #2563eb",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  };

  const dangerBatchButtonStyle = {
    ...batchButtonStyle,
    backgroundColor: "#dc2626",
    color: "white",
    border: "1px solid #dc2626",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  };

  const successBatchButtonStyle = {
    ...batchButtonStyle,
    backgroundColor: "#16a34a",
    color: "white",
    border: "1px solid #16a34a",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  };

  // Modern row styling function
  const modernRowStyle = (backgroundColor) => ({
    backgroundColor,
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s ease-in-out",
    cursor: "pointer"
  });

  // Status Badge Component Function
  const getStatusBadge = (status) => {
    const statusStyles = {
      'Pending': {
        backgroundColor: 'rgba(249, 168, 37, 0.1)',
        color: '#F9A825',
        borderColor: '#F9A825'
      },
      'Approved': {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        color: '#2196F3',
        borderColor: '#2196F3'
      },
      'Rejected': {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        borderColor: '#fecaca'
      },
      'Payment Assigned': {
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        color: '#9C27B0',
        borderColor: '#9C27B0'
      },
      'Completed': {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        color: '#4CAF50',
        borderColor: '#4CAF50'
      },
      'Inspected': {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        color: '#4CAF50',
        borderColor: '#4CAF50'
      }
    };

    const style = statusStyles[status] || {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      borderColor: '#d1d5db'
    };

    return (
      <span style={{
        ...style,
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        border: `1px solid ${style.borderColor}`,
        textTransform: 'capitalize'
      }}>
        {style.icon} {status}
      </span>
    );
  };

  // Handle row hover effects - simplified
  const handleRowHover = (event, isHovered) => {
    // Let CSS handle the hover effects instead of JavaScript
    // This prevents conflicts and provides smoother transitions
  };

  const notificationContainerStyle = {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 1000,
    maxWidth: "350px",
  };

  const notificationStyle = {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
  };

  const actionButtonsStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  };

  const smallButtonStyle = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const editButtonStyle = {
    ...smallButtonStyle,
    backgroundColor: "#3b82f6",
    color: "white",
  };

  const deleteButtonStyle = {
    ...smallButtonStyle,
    backgroundColor: "#ef4444",
    color: "white",
  };

  const inspectButtonStyle = {
    ...smallButtonStyle,
    backgroundColor: "#8b5cf6",
    color: "white",
  };

  const disabledButtonStyle = {
    ...smallButtonStyle,
    backgroundColor: "#9ca3af",
    color: "#6b7280",
    cursor: "not-allowed",
    opacity: 0.5,
  };

  const thStyle = {
    backgroundColor: "#c74a14",
    color: "#FFFFFF",
    padding: "16px 20px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #2E4B70",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const sortableHeaderStyle = {
    ...thStyle,
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  };

  const sortIndicatorStyle = {
    marginLeft: "8px",
    fontSize: "12px",
    opacity: 0.7,
  };

  // Tab styles
  const tabContainerStyle = {
    display: "flex",
    backgroundColor: "#132B44",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(30, 42, 56, 0.1)",
    marginBottom: "24px",
    overflow: "hidden",
    border: "1px solid #2E4B70",
  };

  const tabStyle = {
    flex: 1,
    padding: "16px 20px",
    border: "none",
    backgroundColor: "#132B44",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    borderBottom: "3px solid transparent",
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#1C3A63",
    color: "#FFFFFF",
    fontWeight: "600",
    borderBottom: "3px solid #FF9800",
  };

  const tableTitleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "24px",
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const tableContainerStyle = {
    backgroundColor: "#132B44",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    marginBottom: "32px",
    border: "1px solid #2E4B70",
    animation: "fadeInSlideUp 0.6s ease-out",
    transition: "all 0.3s ease",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    fontSize: "14px",
    backgroundColor: "white",
    margin: "0",
  };

  const tdStyle = {
    padding: "16px 20px",
    borderBottom: "1px solid #2E4B70",
    color: "#FFFFFF",
    backgroundColor: "#132B44",
    fontSize: "14px",
    transition: "all 0.2s ease",
  };

  // Table row styles for modern design
  const getRowStyle = (isSelected, index) => ({
    backgroundColor: isSelected 
      ? '#1C3A63' 
      : "#132B44",
    transition: "all 0.2s ease",
    cursor: "pointer",
    borderBottom: "1px solid #2E4B70",
  });

  const tableRowStyle = {
    transition: "background-color 0.2s ease",
  };

  const buttonStyle = {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    transform: "translateY(0)",
  };

  const statusStyle = {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#fef3c7",
    color: "#d97706",
    textAlign: "center",
    display: "inline-block",
  };

  const paymentStyle = {
    fontWeight: "500",
    color: "#059669",
  };

  const noPaymentStyle = {
    fontWeight: "500",
    color: "#dc2626",
    fontStyle: "italic",
  };

  const chartContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "30px",
  };

  const chartBoxStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "20px",
    width: "400px",
  };

  const statsBoxStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "20px",
    flex: 1,
  };

  const statItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  };

  const statLabelStyle = {
    color: "#6b7280",
    fontSize: "14px",
  };

  const statValueStyle = {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
  };

  const loadingStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#6b7280",
  };

  return (
    <div style={{...containerStyle, backgroundColor: '#1C3A63', minHeight: '100vh'}}>
      {/* Notifications */}
      <div style={notificationContainerStyle}>
        {notifications.map(notification => (
          <div key={notification.id} style={{
            ...notificationStyle,
            borderLeft: `4px solid ${
              notification.type === 'success' ? '#10b981' : 
              notification.type === 'error' ? '#ef4444' : '#3b82f6'
            }`
          }}>
            <div>
              <div style={{ fontWeight: "500", marginBottom: "2px" }}>{notification.message}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{notification.timestamp}</div>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              style={{ 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                color: "#9ca3af",
                fontSize: "16px" 
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Cover Photo */}
      <div style={coverPhotoStyle}></div>
      
      {/* Profile Section */}
      <div style={profileSectionStyle}>
        <div style={profileInfoStyle}>
          <div style={avatarStyle}></div>
          <div style={profileTextStyle}>
            <h1 style={nameStyle}>Prevention Manager 01</h1>
            <p style={roleStyle}>Fire Safety Prevention Department</p>
          </div>
          <div style={buttonsContainerStyle}>
            <button 
              style={actionButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = "#166fe5"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#1877f2"}
            >
              View Applications
            </button>
            <button 
              style={secondaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = "#d8dadf"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#e4e6ea"}
              onClick={() => exportToExcel()}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            <strong>API Connection Error:</strong> {error}
            <br />
            <small>Showing mock data for demonstration. Please check if backend server is running on port 5000.</small>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={tabContainerStyle}>
          <button
            className="nav-link"
            style={activeTab === 'review' ? activeTabStyle : tabStyle}
            onClick={() => {
              console.log('Switching to review tab');
              setActiveTab('review');
            }}
          >
            Document Review ({pendingApplications.length})
          </button>
          <button
            className="nav-link"
            style={activeTab === 'rejected' ? activeTabStyle : tabStyle}
            onClick={() => {
              console.log('Switching to rejected tab');
              setActiveTab('rejected');
            }}
          >
            Rejected Documents ({rejectedApplications.length})
          </button>
        </div>

        {/* Active Table Based on Selected Tab */}
        {activeTab === 'review' && (
          <>
            {/* Statistics Overview - Only show on Document Review tab */}
            <h2 style={sectionTitleStyle}>Workflow Statistics</h2>
            <div style={chartContainerStyle}>
              <div style={statsBoxStyle}>
                <h3 style={{ color: "#1f2937", marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
                  Workflow Overview
                </h3>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Total Applications</span>
                  <span style={statValueStyle}>{applications.length}</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Pending Review</span>
                  <span style={{ ...statValueStyle, color: "#d97706" }}>{pendingApplications.length}</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Approved (Awaiting Payment)</span>
                  <span style={{ ...statValueStyle, color: "#1e40af" }}>{approvedApplications.length}</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Payment Assigned</span>
                  <span style={{ ...statValueStyle, color: "#8b5cf6" }}>{paymentAssignedApplications.length}</span>
                </div>
                <div style={{ ...statItemStyle, borderBottom: "none" }}>
                  <span style={statLabelStyle}>Completion Rate</span>
                  <span style={statValueStyle}>
                    {applications.length > 0 ? Math.round((applications.filter(app => app.status === 'Inspected').length / applications.length) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div style={chartBoxStyle}>
                <h3 style={{ color: "#1f2937", marginBottom: "16px", fontSize: "18px", fontWeight: "600", textAlign: "center" }}>
                  Application Status Distribution
                </h3>
                <Pie data={{
                  labels: ["Pending", "Approved", "Payment Assigned", "Inspected"],
                  datasets: [{
                    data: [
                      pendingApplications.length,
                      approvedApplications.length,
                      paymentAssignedApplications.length,
                      applications.filter(app => app.status === 'Inspected').length
                    ],
                    backgroundColor: ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"],
                  }],
                }} />
              </div>
            </div>
            
            <DocumentReviewTable />
            
            {/* Spacing between tables */}
            <div style={{ height: "40px" }}></div>
            
            {/* Payment Assignment Table */}
            <PaymentAssignmentTable />
            
            {/* Spacing between tables */}
            <div style={{ height: "40px" }}></div>
            
            {/* Inspection Tracking Table */}
            <InspectionTrackingTable />
          </>
        )}
        {activeTab === 'rejected' && (
          <>
            {console.log("Rendering RejectedDocumentsTable, rejectedApplications:", rejectedApplications)}
            <RejectedDocumentsTable />
          </>
        )}
      </div>

      {/* Modals */}
      {editingApplication && (
        <EditModal
          application={editingApplication}
          onSave={handleEditSave}
          onClose={() => setEditingApplication(null)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          applicationName={showDeleteConfirm.fullName}
          onConfirm={() => handleDeleteApplication(showDeleteConfirm._id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {/* Rejection Modal */}
      {applicationToReject && (
        <>
          {console.log("Rendering RejectionModal for:", applicationToReject)}
          <RejectionModal 
            application={applicationToReject}
            onConfirm={(reason) => {
              console.log("Confirming rejection with reason:", reason);
              handleRejectApplication(applicationToReject._id, reason);
              setApplicationToReject(null);
            }}
            onCancel={() => {
              console.log("Canceling rejection");
              setApplicationToReject(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default PreventionOfficerDashboard;
