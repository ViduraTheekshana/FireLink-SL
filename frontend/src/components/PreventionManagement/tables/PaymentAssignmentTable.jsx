import React, { useState, useMemo } from 'react';

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

  // Filter approved applications
  const approvedApplications = useMemo(() => {
    return applications.filter(app => app.status === 'Approved');
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = approvedApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.nic?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.serviceType?.toLowerCase().includes(searchLower)
      );
    });

    // Sort applications
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [approvedApplications, searchTerm, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
        Payment Assignment - Approved Applications ({filteredAndSortedApplications.length})
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
              <th style={thStyle} onClick={() => handleSort('fullName')}>
                Full Name {sortField === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('nic')}>
                NIC {sortField === 'nic' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('serviceType')}>
                Service Type {sortField === 'serviceType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('constructionType')}>
                Construction Type {sortField === 'constructionType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('approvedAt')}>
                Approved Date {sortField === 'approvedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApplications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No approved applications found.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedApplications.map((app) => (
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
                    {editingPayment === app._id ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '4px', fontSize: '14px' }}>Rs.</span>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder={getSuggestedPayment(app.serviceType, app.constructionType).toString()}
                          style={paymentInputStyle}
                        />
                        <button
                          onClick={() => handleAssignPayment(app._id)}
                          style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPayment(null);
                            setPaymentAmount('');
                          }}
                          style={{ ...buttonStyle, backgroundColor: '#6b7280', color: 'white' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {app.payment ? (
                          <span style={{ color: '#059669', fontWeight: '500' }}>
                            Rs. {app.payment}
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280' }}>Not assigned</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => onViewDetails && onViewDetails(app)}
                      style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                    >
                      View
                    </button>
                    {!app.payment && (
                      <button
                        onClick={() => {
                          setEditingPayment(app._id);
                          setPaymentAmount(getSuggestedPayment(app.serviceType, app.constructionType).toString());
                        }}
                        style={{ ...buttonStyle, backgroundColor: '#8b5cf6', color: 'white' }}
                      >
                        Assign Payment
                      </button>
                    )}
                    {app.payment && (
                      <button
                        onClick={() => {
                          setEditingPayment(app._id);
                          setPaymentAmount(app.payment.toString());
                        }}
                        style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white' }}
                      >
                        Edit Payment
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${app.fullName}'s application? This will permanently remove it from the database.`)) {
                          onDelete(app._id);
                        }
                      }}
                      style={{ ...buttonStyle, backgroundColor: '#ef4444', color: 'white' }}
                    >
                      Delete
                    </button>
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
    </div>
  );
};

export default PaymentAssignmentTable;