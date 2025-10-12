import React from 'react';

const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  pendingCount = 0, 
  rejectedCount = 0 
}) => {
  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  };

  const getTabStyle = (tabName) => {
    const baseStyle = {
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '500',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      position: 'relative',
      minWidth: '180px',
      justifyContent: 'flex-start',
      borderRadius: '8px 8px 0 0',
      marginBottom: '-1px',
    };

    const isActive = activeTab === tabName;

    return {
      ...baseStyle,
      backgroundColor: isActive ? '#f8fafc' : 'transparent',
      color: isActive ? '#1f2937' : '#6b7280',
      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
      fontWeight: isActive ? '600' : '500',
    };
  };

  const badgeStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inactiveBadgeStyle = {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    borderRadius: '50%',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={tabContainerStyle}>
      <button
        style={getTabStyle('review')}
        onClick={() => onTabChange('review')}
        onMouseOver={(e) => {
          if (activeTab !== 'review') {
            e.target.style.backgroundColor = '#f1f5f9';
            e.target.style.color = '#374151';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'review') {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }
        }}
      >
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
            e.target.style.backgroundColor = '#f1f5f9';
            e.target.style.color = '#374151';
          }
        }}
        onMouseOut={(e) => {
          if (activeTab !== 'rejected') {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }
        }}
      >
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