import React, { useState, useMemo } from 'react';

const RejectedDocumentsTable = ({ 
  applications, 
  onReactivate,
  onDelete,
  onViewDetails,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [selectedAppForReactivation, setSelectedAppForReactivation] = useState(null);

  // Filter rejected applications
  const rejectedApplications = useMemo(() => {
    return applications.filter(app => app.status === 'Rejected');
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = rejectedApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.nic?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.rejectionReason?.toLowerCase().includes(searchLower) ||
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
  }, [rejectedApplications, searchTerm, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApplications(filteredAndSortedApplications.map(app => app._id));
    } else {
      setSelectedApplications([]);
    }
  };

  // Handle individual selection
  const handleSelectApplication = (id) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  // Batch reactivate
  const handleBatchReactivate = async () => {
    if (selectedApplications.length === 0) return;
    
    if (window.confirm(`Are you sure you want to reactivate ${selectedApplications.length} rejected applications? They will be moved back to pending status.`)) {
      const promises = selectedApplications.map(id => onReactivate(id));
      await Promise.all(promises);
      setSelectedApplications([]);
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedApplications.length === 0) return;
    
    if (window.confirm(`Are you sure you want to permanently delete ${selectedApplications.length} applications? This action cannot be undone.`)) {
      const promises = selectedApplications.map(id => onDelete(id));
      await Promise.all(promises);
      setSelectedApplications([]);
    }
  };

  // Handle reactivation from modal
  const handleReactivateFromModal = async () => {
    await onReactivate(selectedAppForReactivation._id);
    setShowReactivationModal(false);
    setSelectedAppForReactivation(null);
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
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const searchInputStyle = {
    flex: 1,
    minWidth: '250px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const batchActionStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const reactivateButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f59e0b',
    color: 'white',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white',
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
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  };

  const actionButtonStyle = {
    ...buttonStyle,
    padding: '6px 12px',
    fontSize: '12px',
    marginRight: '4px',
  };

  const rejectionReasonStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '8px',
    fontSize: '13px',
    color: '#dc2626',
    maxWidth: '200px',
  };

  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <h3 style={tableTitleStyle}>Rejected Documents - Loading...</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Rejected Documents ({filteredAndSortedApplications.length})
      </h3>
      
      {/* Search and Batch Actions */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search rejected applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        
        {selectedApplications.length > 0 && (
          <div style={batchActionStyle}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {selectedApplications.length} selected
            </span>
            <button
              onClick={handleBatchReactivate}
              style={reactivateButtonStyle}
            >
              Reactivate Selected
            </button>
            <button
              onClick={handleBatchDelete}
              style={deleteButtonStyle}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>
                <input
                  type="checkbox"
                  checked={selectedApplications.length === filteredAndSortedApplications.length && filteredAndSortedApplications.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th style={thStyle} onClick={() => handleSort('fullName')}>
                Full Name {sortField === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('nic')}>
                NIC {sortField === 'nic' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('serviceType')}>
                Service Type {sortField === 'serviceType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('rejectedAt')}>
                Rejected Date {sortField === 'rejectedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle}>Rejection Reason</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApplications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No rejected applications found.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedApplications.map((app) => (
                <tr key={app._id} style={{ backgroundColor: selectedApplications.includes(app._id) ? '#fef2f2' : 'transparent' }}>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(app._id)}
                      onChange={() => handleSelectApplication(app._id)}
                    />
                  </td>
                  <td style={tdStyle}>{app.fullName}</td>
                  <td style={tdStyle}>{app.nic}</td>
                  <td style={tdStyle}>{app.serviceType || 'Fire Prevention Certificate'}</td>
                  <td style={tdStyle}>
                    {app.rejectedAt ? new Date(app.rejectedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={tdStyle}>
                    <div style={rejectionReasonStyle}>
                      {app.rejectionReason || 'No reason provided'}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle}>{app.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => onViewDetails && onViewDetails(app)}
                      style={{ ...actionButtonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppForReactivation(app);
                        setShowReactivationModal(true);
                      }}
                      style={{ ...actionButtonStyle, backgroundColor: '#f59e0b', color: 'white' }}
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete ${app.fullName}'s application? This action cannot be undone.`)) {
                          onDelete(app._id);
                        }
                      }}
                      style={{ ...actionButtonStyle, backgroundColor: '#ef4444', color: 'white' }}
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

      {/* Help Text */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: '#fef2f2', 
        borderTop: '1px solid #e5e7eb',
        fontSize: '13px',
        color: '#dc2626'
      }}>
        <strong>Note:</strong> Reactivated applications will be moved back to pending status for review. 
        Deleted applications will be permanently removed from the database.
      </div>

      {/* Reactivation Modal */}
      {showReactivationModal && selectedAppForReactivation && (
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
                Reactivate Application - {selectedAppForReactivation.fullName}
              </h3>
              <button
                onClick={() => {
                  setShowReactivationModal(false);
                  setSelectedAppForReactivation(null);
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
                backgroundColor: '#fff7ed',
                borderRadius: '8px',
                border: '1px solid #fed7aa',
              }}>
                <div>
                  <strong>Service Type:</strong>
                  <div>{selectedAppForReactivation.serviceType || 'Fire Prevention Certificate'}</div>
                </div>
                <div>
                  <strong>NIC:</strong>
                  <div>{selectedAppForReactivation.nic}</div>
                </div>
                <div>
                  <strong>Rejected Date:</strong>
                  <div>{selectedAppForReactivation.rejectedAt ? new Date(selectedAppForReactivation.rejectedAt).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <strong>Current Status:</strong>
                  <div style={{ color: '#dc2626', fontWeight: '500' }}>
                    {selectedAppForReactivation.status}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#166534',
                  marginBottom: '12px',
                }}>
                  Are you sure you want to reactivate this application?
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#166534',
                }}>
                  This application will be moved back to pending status for review.
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '24px',
            }}>
              <button
                onClick={() => {
                  setShowReactivationModal(false);
                  setSelectedAppForReactivation(null);
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '80px',
                }}
              >
                No
              </button>
              <button
                onClick={handleReactivateFromModal}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '80px',
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedDocumentsTable;