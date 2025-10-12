import React, { useState, useMemo, useEffect } from 'react';

const PaymentAssignmentTable = ({ 
  applications, 
  onAssignPayment,
  onDelete,
  onViewDetails,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppForPayment, setSelectedAppForPayment] = useState(null);

  // Load Google Material Icons
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        // Ignore if already removed
      }
    };
  }, []);

  // Filter approved applications
  const approvedApplications = useMemo(() => {
    return applications.filter(app => app.status === 'Approved');
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return approvedApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.nic?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.serviceType?.toLowerCase().includes(searchLower)
      );
    });
  }, [approvedApplications, searchTerm]);

  // Handle assign payment
  const handleAssignPayment = async (id) => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    await onAssignPayment(id, parseFloat(paymentAmount));
    setEditingPayment(null);
    setPaymentAmount('');
  };

  // Handle assign payment from modal
  const handleAssignPaymentFromModal = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    await onAssignPayment(selectedAppForPayment._id, parseFloat(paymentAmount));
    setShowPaymentModal(false);
    setSelectedAppForPayment(null);
    setPaymentAmount('');
  };

  // Get suggested payment amount based on service type
  const getSuggestedPayment = (serviceType, constructionType) => {
    const baseAmounts = {
      'Fire Prevention': 1500,
      'Safety Audit': 2000,
      'Inspection': 1200,
      'Fire Prevention Certificate': 1500,
      'Other': 1000,
    };

    const typeMultipliers = {
      'Commercial': 1.5,
      'Industrial': 2.0,
      'Residential': 1.0,
      'Building': 1.2,
    };

    const baseAmount = baseAmounts[serviceType] || baseAmounts['Other'];
    const multiplier = typeMultipliers[constructionType] || 1.0;
    
    return Math.round(baseAmount * multiplier);
  };

  // Table styles
  const tableContainerStyle = {
    backgroundColor: '#CED6DF',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '20px',
  };

  const tableTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e5e7eb',
    margin: 0,
  };

  const searchContainerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
    color: '#374151',
  };

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  };

  const buttonStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '4px',
  };

  const iconButtonStyle = {
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    minHeight: '32px',
  };

  const paymentInputStyle = {
    width: '100px',
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    marginRight: '8px',
  };

  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <h3 style={tableTitleStyle}>Payment Assignment - Loading...</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Payment Assignment - Approved Applications ({filteredApplications.length})
      </h3>
      
      {/* Search */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search approved applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>
                Full Name
              </th>
              <th style={thStyle}>
                NIC
              </th>
              <th style={thStyle}>
                Service Type
              </th>
              <th style={thStyle}>
                Construction Type
              </th>
              <th style={thStyle}>
                Approved Date
              </th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No approved applications found.'}
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app._id}>
                  <td style={tdStyle}>{app.fullName}</td>
                  <td style={tdStyle}>{app.nic}</td>
                  <td style={tdStyle}>{app.serviceType || 'Fire Prevention Certificate'}</td>
                  <td style={tdStyle}>{app.constructionType}</td>
                  <td style={tdStyle}>
                    {app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle}>{app.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {app.payment ? (
                        <span style={{ color: '#059669', fontWeight: '500' }}>
                          Rs. {app.payment}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Not assigned</span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {/* View Icon Button */}
                    <button
                      onClick={() => onViewDetails && onViewDetails(app)}
                      style={{ ...iconButtonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                      title="View Details"
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>visibility</span>
                    </button>
                    
                    {/* Delete Icon Button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${app.fullName}'s application? This will permanently remove it from the database.`)) {
                          onDelete(app._id);
                        }
                      }}
                      style={{ ...iconButtonStyle, backgroundColor: '#ef4444', color: 'white' }}
                      title="Delete"
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                    
                    {/* Assign Payment Icon Button (for unassigned payments) */}
                    {!app.payment && (
                      <button
                        onClick={() => {
                          setSelectedAppForPayment(app);
                          setPaymentAmount(getSuggestedPayment(app.serviceType, app.constructionType).toString());
                          setShowPaymentModal(true);
                        }}
                        style={{ ...iconButtonStyle, backgroundColor: '#8b5cf6', color: 'white' }}
                        title="Assign Payment"
                      >
                        <span className="material-icons" style={{ fontSize: '16px' }}>payments</span>
                      </button>
                    )}
                    
                    {/* Edit Payment Icon Button (for assigned payments) */}
                    {app.payment && (
                      <button
                        onClick={() => {
                          setSelectedAppForPayment(app);
                          setPaymentAmount(app.payment.toString());
                          setShowPaymentModal(true);
                        }}
                        style={{ ...iconButtonStyle, backgroundColor: '#f59e0b', color: 'white' }}
                        title="Edit Payment"
                      >
                        <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Guidelines */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        fontSize: '13px',
        color: '#6b7280'
      }}>
        <strong>Payment Guidelines:</strong> Fire Prevention: Rs. 1,500 | Safety Audit: Rs. 2,000 | Inspection: Rs. 1,200 
        | Commercial +50% | Industrial +100%
      </div>
      {/* Payment Modal */}
      {showPaymentModal && selectedAppForPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
              }}>
                {selectedAppForPayment.payment ? 'Edit Payment' : 'Assign Payment'} - {selectedAppForPayment.fullName}
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAppForPayment(null);
                  setPaymentAmount('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
              }}>
                <div>
                  <strong>Service Type:</strong>
                  <div>{selectedAppForPayment.serviceType || 'Fire Prevention Certificate'}</div>
                </div>
                <div>
                  <strong>Construction Type:</strong>
                  <div>{selectedAppForPayment.constructionType || 'Building'}</div>
                </div>
                <div>
                  <strong>Suggested Amount:</strong>
                  <div style={{ color: '#059669', fontWeight: '500' }}>
                    Rs. {getSuggestedPayment(selectedAppForPayment.serviceType, selectedAppForPayment.constructionType)}
                  </div>
                </div>
                <div>
                  <strong>Current Payment:</strong>
                  <div style={{ color: selectedAppForPayment.payment ? '#059669' : '#6b7280' }}>
                    {selectedAppForPayment.payment ? `Rs. ${selectedAppForPayment.payment}` : 'Not assigned'}
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Payment Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={getSuggestedPayment(selectedAppForPayment.serviceType, selectedAppForPayment.constructionType).toString()}
                  min="0"
                  step="500"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                }}>
                  Suggested amount: Rs. {getSuggestedPayment(selectedAppForPayment.serviceType, selectedAppForPayment.constructionType)}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
            }}>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAppForPayment(null);
                  setPaymentAmount('');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPaymentFromModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedAppForPayment.payment ? '#f59e0b' : '#8b5cf6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {selectedAppForPayment.payment ? 'Update Payment' : 'Assign Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAssignmentTable;