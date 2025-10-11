import React, { useEffect, useState } from "react";
import { getInspectedDocuments } from "../../services/preventionCertificateAPI";
import Sidebar from "../UserManagement/Sidebar";

const InspectedDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      // For testing purposes, set a mock prevention manager user
      const mockUser = {
        name: "arindu",
        staffId: "PRE61949",
        position: "preventionmanager"
      };
      setUser(mockUser);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getInspectedDocuments();
        console.log("API Result:", result); // Debug log
        if (result && result.success) {
          setDocuments(result.data || []);
        } else {
          // For now, show empty state instead of error
          setDocuments([]);
          console.warn("API returned unsuccessful result:", result);
        }
      } catch (err) {
        console.error("Error fetching inspected documents:", err);
        setDocuments([]);
        setError("Unable to connect to server. Please ensure the backend is running.");
      }
      setLoading(false);
    }
    
    // No sample data - use real data from API
    
    fetchData();
  }, []);

  // Styling to match Prevention Officer Dashboard tables
  const containerStyle = {
    flex: 1,
    padding: '20px',
    backgroundColor: '#354759',
    minHeight: '100vh',
    fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
  };

  const cardStyle = {
    backgroundColor: '#CED6DF',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '20px',
  };

  const headerStyle = {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#CED6DF',
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  };

  const searchContainerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#CED6DF',
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Public Sans, system-ui, -apple-system, sans-serif',
  };

  const tableContainerStyle = {
    overflowX: 'auto',
    maxHeight: '600px',
    overflowY: 'auto',
  };

  const tableStyle = {
    width: '100%',
    minWidth: '1200px',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    backgroundColor: '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const tdStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: 'white',
  };

  const noDataStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280',
    fontSize: '16px',
  };

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#10b981',
    color: 'white',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {user && <Sidebar user={user} />}
      
      {/* Main Content */}
      <div style={containerStyle}>
        {/* Header Card */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h2 style={titleStyle}>Inspected Documents</h2>
          </div>
          
          {/* Search Section */}
        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Search applications by ID, name, or contact number..."
            style={searchInputStyle}
          />
        </div>

        {/* Table Section */}
        <div style={tableContainerStyle}>
          {loading ? (
            <div style={loadingStyle}>
              <div>Loading inspected documents...</div>
            </div>
          ) : error ? (
            <div style={noDataStyle}>
              <div>Error: {error}</div>
            </div>
          ) : documents.length === 0 ? (
            <div style={noDataStyle}>
              <div>No inspected documents found</div>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#94a3b8' }}>
                Applications marked as inspected will appear here
              </p>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Application ID</th>
                  <th style={thStyle}>Applicant Name</th>
                  <th style={thStyle}>Contact Number</th>
                  <th style={thStyle}>Service Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Inspection Notes</th>
                  <th style={thStyle}>Inspected Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc._id || index}>
                    <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b' }}>
                      {doc.applicationId || 'N/A'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: '500' }}>
                      {doc.fullName || 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      {doc.contactNumber || 'N/A'}
                    </td>
                    <td style={tdStyle}>
                      {doc.serviceType || 'Fire Prevention'}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle}>
                        Inspected
                      </span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.inspectionNotes || 'No notes provided'}
                    </td>
                    <td style={tdStyle}>
                      {doc.inspectionDate 
                        ? new Date(doc.inspectionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'
                      }
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#f9fafb',
                            color: '#374151',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* End Table Container */}
      </div>
      {/* End Card */}
    </div>
    {/* End Main Content */}
  </div>
);
};

export default InspectedDocuments;
