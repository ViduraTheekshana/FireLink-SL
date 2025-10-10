import React from 'react';
import { Pie } from 'react-chartjs-2';

const StatisticsOverview = ({ applications }) => {
  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending').length,
    approved: applications.filter(app => app.status === 'Approved').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
    paymentAssigned: applications.filter(app => app.status === 'Payment Assigned').length,
    inspected: applications.filter(app => app.status === 'Inspected').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.inspected / stats.total) * 100) : 0;

  // Chart data
  const chartData = {
    labels: ['Pending', 'Approved', 'Payment Assigned', 'Inspected', 'Rejected'],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.paymentAssigned, stats.inspected, stats.rejected],
        backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          fontSize: 12,
        },
      },
    },
  };

  // Styles
  const containerStyle = {
    marginBottom: '32px',
  };

  const sectionTitleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px',
  };

  const chartContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  };

  const statsBoxStyle = {
    backgroundColor: '#CED6DF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const chartBoxStyle = {
    backgroundColor: '#CED6DF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  };

  const statsHeaderStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px',
  };

  const statItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#6b7280',
  };

  const statValueStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  };

  const chartContainerInnerStyle = {
    height: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const getStatValueColor = (type) => {
    const colors = {
      pending: '#d97706',
      approved: '#1e40af',
      paymentAssigned: '#8b5cf6',
      inspected: '#059669',
      rejected: '#dc2626',
      total: '#1f2937',
    };
    return colors[type] || colors.total;
  };

  return (
    <div style={containerStyle}>
      <h2 style={sectionTitleStyle}>Workflow Statistics</h2>
      <div style={chartContainerStyle}>
        {/* Chart Box - Now on the left */}
        <div style={chartBoxStyle}>
          <div style={statsHeaderStyle}>Application Status Distribution</div>
          <div style={chartContainerInnerStyle}>
            {stats.total > 0 ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <div>No data available</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Statistics Box - Now on the right */}
        <div style={statsBoxStyle}>
          <div style={statsHeaderStyle}>Workflow Overview</div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Total Applications</span>
            <span style={statValueStyle}>{stats.total}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Pending Review</span>
            <span style={{ ...statValueStyle, color: getStatValueColor('pending') }}>
              {stats.pending}
            </span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Approved (Awaiting Payment)</span>
            <span style={{ ...statValueStyle, color: getStatValueColor('approved') }}>
              {stats.approved}
            </span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Payment Assigned</span>
            <span style={{ ...statValueStyle, color: getStatValueColor('paymentAssigned') }}>
              {stats.paymentAssigned}
            </span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Inspected</span>
            <span style={{ ...statValueStyle, color: getStatValueColor('inspected') }}>
              {stats.inspected}
            </span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Rejected</span>
            <span style={{ ...statValueStyle, color: getStatValueColor('rejected') }}>
              {stats.rejected}
            </span>
          </div>
          <div style={{ ...statItemStyle, borderBottom: 'none', marginTop: '12px' }}>
            <span style={{ ...statLabelStyle, fontWeight: '600' }}>Completion Rate</span>
            <span style={{ ...statValueStyle, color: '#059669' }}>
              {completionRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsOverview;