import React, { useState, useMemo } from 'react';

const DocumentReviewTable = ({ 
  applications, 
  onApprove, 
  onReject, 
  onDelete,
  onViewDetails,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedApplications, setSelectedApplications] = useState([]);

  // Filter pending applications
  const pendingApplications = useMemo(() => {
    return applications.filter(app => app.status === 'Pending');
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = pendingApplications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(searchLower) ||
        app.nic?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.address?.toLowerCase().includes(searchLower) ||
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
  }, [pendingApplications, searchTerm, sortField, sortDirection]);

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

  // Batch approve
  const handleBatchApprove = async () => {
    if (selectedApplications.length === 0) return;
    
    const promises = selectedApplications.map(id => onApprove(id));
    await Promise.all(promises);
    setSelectedApplications([]);
  };

  // Batch reject
  const handleBatchReject = async () => {
    if (selectedApplications.length === 0) return;
    
    const reason = prompt('Enter rejection reason for selected applications:');
    if (!reason) return;

    const promises = selectedApplications.map(id => onReject(id, reason));
    await Promise.all(promises);
    setSelectedApplications([]);
  };

  // Table styles
  const tableContainerStyle = {
    backgroundColor: 'white',
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

  const approveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#10b981',
    color: 'white',
  };

  const rejectButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
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
    backgroundColor: '#fbbf24',
    color: '#92400e',
  };

  const actionButtonStyle = {
    ...buttonStyle,
    padding: '6px 12px',
    fontSize: '12px',
    marginRight: '4px',
  };

  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <h3 style={tableTitleStyle}>Document Review - Loading...</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <h3 style={tableTitleStyle}>
        Document Review - Pending Applications ({filteredAndSortedApplications.length})
      </h3>
      
      {/* Search and Batch Actions */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search applications..."
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
              onClick={handleBatchApprove}
              style={approveButtonStyle}
            >
              Approve Selected
            </button>
            <button
              onClick={handleBatchReject}
              style={rejectButtonStyle}
            >
              Reject Selected
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
              <th style={thStyle} onClick={() => handleSort('constructionType')}>
                Construction Type {sortField === 'constructionType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle} onClick={() => handleSort('urgencyLevel')}>
                Urgency {sortField === 'urgencyLevel' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApplications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  {searchTerm ? 'No applications match your search.' : 'No pending applications found.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedApplications.map((app) => (
                <tr key={app._id} style={{ backgroundColor: selectedApplications.includes(app._id) ? '#f0f9ff' : 'transparent' }}>
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
                  <td style={tdStyle}>{app.constructionType}</td>
                  <td style={tdStyle}>
                    <span style={{
                      color: app.urgencyLevel === 'Critical' ? '#dc2626' : 
                             app.urgencyLevel === 'High' ? '#ea580c' : '#059669'
                    }}>
                      {app.urgencyLevel || 'Normal'}
                    </span>
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
                      onClick={() => onApprove(app._id)}
                      style={{ ...actionButtonStyle, backgroundColor: '#10b981', color: 'white' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(app._id, prompt('Enter rejection reason:'))}
                      style={{ ...actionButtonStyle, backgroundColor: '#ef4444', color: 'white' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${app.fullName}'s application? This will permanently remove it from the database.`)) {
                          onDelete(app._id);
                        }
                      }}
                      style={{ ...actionButtonStyle, backgroundColor: '#6b7280', color: 'white' }}
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
    </div>
  );
};

export default DocumentReviewTable;