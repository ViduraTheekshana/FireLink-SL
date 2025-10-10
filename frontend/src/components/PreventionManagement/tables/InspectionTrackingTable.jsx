import React, { useState, useMemo } from 'react';

const InspectionTrackingTable = ({ 
  applications, 
  onAddInspectionNotes,
  onMarkAsInspected,
  onDelete,
  onViewDetails,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingNotes, setEditingNotes] = useState(null);
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Filter payment assigned applications
  const paymentAssignedApplications = useMemo(() => {
    return applications.filter(app => app.status === 'Payment Assigned' && app.payment);
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = paymentAssignedApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.nic?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.serviceType?.toLowerCase().includes(searchLower) ||
        app.inspectionNotes?.toLowerCase().includes(searchLower)
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
  }, [paymentAssignedApplications, searchTerm, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle save inspection notes
  const handleSaveInspectionNotes = async (id) => {
    if (!inspectionNotes.trim()) {
      alert('Please enter inspection notes');
      return;
    }

    await onAddInspectionNotes(id, inspectionNotes);
    setEditingNotes(null);
    setInspectionNotes('');
  };

  // Handle mark as inspected
  const handleMarkAsInspected = async (id, notes) => {
    const finalNotes = notes || prompt('Enter final inspection notes (optional):') || '';
    await onMarkAsInspected(id, finalNotes);
  };

  // Get days since payment assigned
  const getDaysSincePayment = (approvedAt) => {
    if (!approvedAt) return 'N/A';
    const days = Math.floor((new Date() - new Date(approvedAt)) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get priority color based on urgency and days
  const getPriorityColor = (urgencyLevel, daysSincePayment) => {
    if (urgencyLevel === 'Critical' || daysSincePayment > 14) return '#dc2626';
    if (urgencyLevel === 'High' || daysSincePayment > 7) return '#ea580c';
    return '#059669';
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
    verticalAlign: 'top',
  };

  const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
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

  const notesInputStyle = {
    width: '100%',
    minHeight: '60px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    resize: 'vertical',
  };

  const notesDisplayStyle = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '8px',
    fontSize: '13px',
    maxWidth: '200px',
    maxHeight: '80px',
    overflow: 'auto',
  };

  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <h3 style={tableTitleStyle}>Inspection Tracking - Loading...</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Inspection Tracking - Payment Assigned Applications ({filteredAndSortedApplications.length})
      </h3>
      
      {/* Search */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search applications for inspection..."
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
              <th style={thStyle} onClick={() => handleSort('payment')}>
                Payment {sortField === 'payment' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('urgencyLevel')}>
                Priority {sortField === 'urgencyLevel' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle}>Days Since Payment</th>
              <th style={thStyle}>Inspection Notes</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApplications.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No applications ready for inspection found.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedApplications.map((app) => {
                const daysSincePayment = getDaysSincePayment(app.approvedAt);
                const priorityColor = getPriorityColor(app.urgencyLevel, daysSincePayment);
                
                return (
                  <tr key={app._id}>
                    <td style={tdStyle}>{app.fullName}</td>
                    <td style={tdStyle}>{app.nic}</td>
                    <td style={tdStyle}>{app.serviceType || 'Fire Prevention Certificate'}</td>
                    <td style={tdStyle}>
                      <span style={{ color: '#059669', fontWeight: '500' }}>
                        Rs. {app.payment}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: priorityColor, fontWeight: '500' }}>
                        {app.urgencyLevel || 'Normal'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: priorityColor, fontWeight: '500' }}>
                        {daysSincePayment} days
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {editingNotes === app._id ? (
                        <div>
                          <textarea
                            value={inspectionNotes}
                            onChange={(e) => setInspectionNotes(e.target.value)}
                            placeholder="Enter inspection notes..."
                            style={notesInputStyle}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <button
                              onClick={() => handleSaveInspectionNotes(app._id)}
                              style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingNotes(null);
                                setInspectionNotes('');
                              }}
                              style={{ ...buttonStyle, backgroundColor: '#6b7280', color: 'white' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={notesDisplayStyle}>
                          {app.inspectionNotes || 'No notes added'}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle}>{app.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => onViewDetails && onViewDetails(app)}
                        style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(app._id);
                          setInspectionNotes(app.inspectionNotes || '');
                        }}
                        style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white' }}
                      >
                        Add Notes
                      </button>
                      <button
                        onClick={() => handleMarkAsInspected(app._id, app.inspectionNotes)}
                        style={{ ...buttonStyle, backgroundColor: '#10b981', color: 'white' }}
                      >
                        Mark Inspected
                      </button>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Priority Legend */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        fontSize: '13px',
        color: '#6b7280'
      }}>
        <strong>Priority Legend:</strong> 
        <span style={{ color: '#dc2626', marginLeft: '8px' }}>● Critical/Overdue (14+ days)</span>
        <span style={{ color: '#ea580c', marginLeft: '12px' }}>● High Priority/Due Soon (7+ days)</span>
        <span style={{ color: '#059669', marginLeft: '12px' }}>● Normal Priority</span>
      </div>
    </div>
  );
};

export default InspectionTrackingTable;