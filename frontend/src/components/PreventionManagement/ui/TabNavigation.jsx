import React from 'react';

const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  pendingCount = 0, 
  rejectedCount = 0 
}) => {
  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '24px',
    backgroundColor: 'white',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  };

  const getTabStyle = (tabName) => {
    const baseStyle = {
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '500',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      position: 'relative',
      minWidth: '160px',
      justifyContent: 'center',
    };

    const isActive = activeTab === tabName;

    return {
      ...baseStyle,
      backgroundColor: isActive ? '#1e40af' : 'white',
      color: isActive ? 'white' : '#6b7280',
      borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    };
  };

  const badgeStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
  };

  const inactiveBadgeStyle = {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
  };

  return (
    <div style={tabContainerStyle}>
      <button
        style={getTabStyle('review')}
        onClick={() => onTabChange('review')}
        onMouseOver={(e) => {
          if (activeTab !== 'review') {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.color = '#1e40af';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'review') {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#6b7280';
          }
        }}
      >
        <span>📋</span>
        Document Review
        {pendingCount > 0 && (
          <span style={activeTab === 'review' ? badgeStyle : inactiveBadgeStyle}>
            {pendingCount}
          </span>
        )}
      </button>

      <button
        style={getTabStyle('rejected')}
        onClick={() => onTabChange('rejected')}
        onMouseOver={(e) => {
          if (activeTab !== 'rejected') {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.color = '#dc2626';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'rejected') {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#6b7280';
          }
        }}
      >
        <span>❌</span>
        Rejected Documents
        {rejectedCount > 0 && (
          <span style={activeTab === 'rejected' ? badgeStyle : inactiveBadgeStyle}>
            {rejectedCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default TabNavigation;