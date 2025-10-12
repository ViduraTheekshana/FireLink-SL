import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { toast, Toaster } from 'sonner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Import custom hooks and services
import usePreventionApplications from '../../hooks/usePreventionApplications';

// Import components
import TabNavigation from '../../components/PreventionManagement/ui/TabNavigation';
import StatisticsOverview from '../../components/PreventionManagement/ui/StatisticsOverview';
import DocumentReviewTable from '../../components/PreventionManagement/tables/DocumentReviewTable';
import PaymentAssignmentTable from '../../components/PreventionManagement/tables/PaymentAssignmentTable';
import InspectionTrackingTable from '../../components/PreventionManagement/tables/InspectionTrackingTable';
import RejectedDocumentsTable from '../../components/PreventionManagement/tables/RejectedDocumentsTable';
import ApplicationDetailsModal from '../../components/PreventionManagement/modals/ApplicationDetailsModal';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PreventionOfficerDashboard = () => {
  // Custom hook for managing applications and API calls
    React.useEffect(() => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }, []);
  const {
    applications,
    loading,
    error,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    paymentAssignedApplications,
    approveApplication,
    rejectApplication,
    deleteApplication,
    assignPayment,
    addInspectionNotes,
    markAsInspected,
    reactivateApplication,
  } = usePreventionApplications();

  // Local state
  const [activeTab, setActiveTab] = useState('review');
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Table state for search and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle view application details
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  // Handle export to Excel
  // Handle export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    let currentY = 20;

    // Helper function to add table
    const addTable = (title, data, columns, startY, customColWidths = null) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title, 15, startY);

      const tableStartY = startY + 10;
      const rowHeight = 8;
      // Default column widths
      let colWidths = [35, 25, 40, 30, 25, 35];
      if (customColWidths) colWidths = customColWidths;

      // Table headers
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      let totalWidth = colWidths.reduce((a, b) => a + b, 0);
      doc.setDrawColor(0, 0, 0); // Black border
      doc.setLineWidth(0.2); // Thin border
      doc.rect(15, tableStartY, totalWidth, rowHeight); // Header background

      let currentX = 15;
      columns.forEach((col, index) => {
        doc.text(col, currentX + 2, tableStartY + 5);
        currentX += colWidths[index];
      });

      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let rowY = tableStartY + rowHeight;

      data.forEach((row, rowIndex) => {
        if (rowY > 270) { // Check if new page needed
          doc.addPage();
          rowY = 20;
          // Repeat header on new page
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);
          doc.rect(15, rowY, totalWidth, rowHeight);
          currentX = 15;
          columns.forEach((col, index) => {
            doc.text(col, currentX + 2, rowY + 5);
            currentX += colWidths[index];
          });
          rowY += rowHeight;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }

        // Draw row border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.rect(15, rowY, totalWidth, rowHeight);

        // Add row data
        currentX = 15;
        row.forEach((cell, cellIndex) => {
          const cellText = cell || '';
          doc.text(cellText.toString().substring(0, 30), currentX + 2, rowY + 5); // Allow more chars per cell
          currentX += colWidths[cellIndex];
        });

        rowY += rowHeight;
      });

      return rowY + 10; // Return next Y position
    };

    // Title and header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28); // Bigger font size
  doc.setTextColor(201, 0, 0); // Red color
  doc.text('FireLink SL', 105, currentY, { align: 'center' });
  // Draw red underline
  const titleWidth = doc.getTextWidth('FireLink SL');
  const titleX = 105 - titleWidth / 2;
  doc.setDrawColor(201, 0, 0);
  doc.setLineWidth(2);
  doc.line(titleX, currentY + 3, titleX + titleWidth, currentY + 3);
  doc.setTextColor(0, 0, 0); // Reset to black for rest of PDF
    doc.setFontSize(14);
    doc.text('Official Application Report', 105, currentY + 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, currentY + 25);

    // Summary statistics
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const paymentAssigned = applications.filter(app => app.payment).length;
    const inspected = applications.filter(app => app.status === 'inspected').length;

    currentY += 35;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Applications: ${total} | Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected} | Payment Assigned: ${paymentAssigned} | Inspected: ${inspected}`, 15, currentY);

    currentY += 15;

    // Match exactly what the dashboard tables show - same columns, same data
    
    // 1. Document Review Table (Pending Applications)
    const documentReviewApps = applications.filter(app => app.status === 'Pending');
    const reviewData = documentReviewApps.map(app => [
      app.fullName || '',
      app.nic || '',
      app.serviceType || 'Fire Prevention Certificate',
      app.constructionType || '',
      app.urgencyLevel || 'Normal',
      app.status || ''
    ]);
  const reviewColWidths = [32, 28, 32, 32, 28, 28];
    currentY = addTable('Document Review Table', reviewData, 
      ['Full Name', 'NIC', 'Service Type', 'Construction Type', 'Urgency', 'Status'], currentY, reviewColWidths);

    // 2. Payment Assignment Table (Status === 'Approved') - NO Payment column
    const paymentAssignmentApps = applications.filter(app => app.status === 'Approved');
    const paymentAssignData = paymentAssignmentApps.map(app => [
      app.fullName || '',
      app.nic || '',
      app.serviceType || 'Fire Prevention Certificate',
      app.constructionType || '',
      app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : 'N/A',
      app.status || ''
    ]);
  const paymentColWidths = [32, 28, 32, 32, 32, 28];
    currentY = addTable('Payment Assignment Table', paymentAssignData, 
      ['Full Name', 'NIC', 'Service Type', 'Construction Type', 'Approved Date', 'Status'], currentY, paymentColWidths);

    // 3. Inspection Tracking Table (Status === 'Payment Assigned' AND has payment) - Only specified columns
    const inspectionTrackingApps = applications.filter(app => 
      app.status === 'Payment Assigned' && app.payment
    );
    // Helper to calculate days since payment
    const getDaysSincePayment = (approvedAt) => {
      if (!approvedAt) return 'N/A';
      const days = Math.floor((new Date() - new Date(approvedAt)) / (1000 * 60 * 60 * 24));
      return days.toString();
    };
    const trackingData = inspectionTrackingApps.map(app => [
      app.fullName || '',
      app.contactNumber || '',
      app.serviceType || 'Fire Prevention Certificate',
      app.payment ? `Rs. ${app.payment}` : '',
      app.urgencyLevel || 'Normal',
      getDaysSincePayment(app.approvedAt) + ' days'
    ]);
    // Wider columns for Inspection Tracking Table
  const inspectionColWidths = [30, 26, 30, 26, 26, 40];
    currentY = addTable('Inspection Tracking Table', trackingData,
      ['Full Name', 'Contact Number', 'Service Type', 'Payment', 'Priority', 'Days Since Payment'], currentY, inspectionColWidths);

    // 4. Inspected Documents Table (Status === 'Inspected')
    const inspectedApps = applications.filter(app => app.status === 'Inspected');
    const inspectedData = inspectedApps.map(app => [
      app.fullName || '',
      app.nic || '',
      app.serviceType || 'Fire Prevention Certificate',
      app.status || '',
      app.inspectionDate
        ? new Date(app.inspectionDate).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : 'N/A'
    ]);
    const inspectedColWidths = [40, 32, 40, 32, 40];
    currentY = addTable('Inspected Documents Table', inspectedData, 
      ['Full Name', 'NIC', 'Service Type', 'Status', 'Inspected Date'], currentY, inspectedColWidths);

    // 5. Rejected Applications Table (Status === 'Rejected')
    const rejectedApps = applications.filter(app => app.status === 'Rejected');
    const rejectedData = rejectedApps.map(app => [
      app.fullName || '',
      app.nic || '',
      app.serviceType || 'Fire Prevention Certificate',
      app.status || '',
      app.rejectionReason || '',
      app.rejectedAt
        ? new Date(app.rejectedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : 'N/A'
    ]);
  const rejectedColWidths = [32, 28, 32, 28, 40, 32];
    currentY = addTable('Rejected Applications Table', rejectedData, 
      ['Full Name', 'NIC', 'Service Type', 'Status', 'Reason', 'Date'], currentY, rejectedColWidths);

    // Footer
    doc.setFontSize(9);
    doc.text('Generated by FireLink SL', 15, 285);

    // Save PDF
    doc.save(`FireSafetyReport_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Organized PDF report generated with all sections!');
  };
  const handleExportToExcel = () => {
    // Simple CSV export
    const csvContent = applications.map(app => 
      `${app.fullName},${app.nic},${app.serviceType},${app.status},${app.payment || ''}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prevention_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Styles
  const containerStyle = {
    backgroundColor: '#354759',
    minHeight: '100vh',
    fontFamily: 'Public Sans, Arial, sans-serif',
  };

  const headerStyle = {
  background: 'linear-gradient(135deg, #C90000 0%, #C90000 100%)',
    color: 'white',
    padding: '24px',
    marginBottom: '24px',
      fontFamily: 'Public Sans, Arial, sans-serif',
  };

  const headerContentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
      fontFamily: 'Public Sans, Arial, sans-serif',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
      fontFamily: 'Public Sans, Arial, sans-serif',
  };

  const subtitleStyle = {
    fontSize: '16px',
    opacity: 0.9,
    margin: '4px 0 0 0',
      fontFamily: 'Public Sans, Arial, sans-serif',
  };

  const headerButtonsStyle = {
    display: 'flex',
    gap: '12px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    backdropFilter: 'blur(10px)',
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const errorAlertStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontSize: '18px',
  };

  const spacerStyle = {
    height: '32px',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerContentStyle}>
            <div>
              <h1 style={titleStyle}>Prevention Officer Dashboard</h1>
              <p style={subtitleStyle}>Fire Safety Prevention Department</p>
            </div>
          </div>
        </div>
        <div style={contentStyle}>
          <div style={loadingStyle}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
            Loading applications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Sonner Toast Messages */}
      <Toaster position="top-center" expand={false} richColors />

      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <div>
            <h1 style={titleStyle}>Prevention Officer Dashboard</h1>
            <p style={subtitleStyle}>Fire Safety Prevention Department</p>
          </div>
          <div style={headerButtonsStyle}>
            <button
              onClick={handleExportToExcel}
              style={primaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Export Report
            </button>
            <button
              onClick={handleExportToPDF}
              style={primaryButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={contentStyle}>
        {/* Error Alert */}
        {error && (
          <div style={errorAlertStyle}>
            <strong>⚠️ Connection Error:</strong> {error}
            <br />
            <small>Some features may not work properly. Please check if the backend server is running.</small>
          </div>
        )}

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingApplications.length}
          rejectedCount={rejectedApplications.length}
        />

        {/* Tab Content */}
        {activeTab === 'review' && (
          <>
            {/* Statistics Overview */}
            <StatisticsOverview applications={applications} />

            {/* Document Review Table */}
            <DocumentReviewTable
              applications={applications}
              onApprove={approveApplication}
              onReject={rejectApplication}
              onDelete={deleteApplication}
              onViewDetails={handleViewDetails}
              loading={loading}
            />

            <div style={spacerStyle} />

            {/* Payment Assignment Table */}
            <PaymentAssignmentTable
              applications={applications}
              onAssignPayment={assignPayment}
              onDelete={deleteApplication}
              onViewDetails={handleViewDetails}
              loading={loading}
            />

            <div style={spacerStyle} />

            {/* Inspection Tracking Table */}
            <InspectionTrackingTable
              applications={applications}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortField={sortField}
              setSortField={setSortField}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              onAddInspectionNotes={addInspectionNotes}
              onMarkAsInspected={markAsInspected}
              onDeleteApplication={deleteApplication}
              onViewDetails={handleViewDetails}
            />
          </>
        )}

        {activeTab === 'rejected' && (
          <RejectedDocumentsTable
            applications={applications}
            onReactivate={reactivateApplication}
            onDelete={deleteApplication}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={approveApplication}
          onReject={rejectApplication}
          onDelete={deleteApplication}
        />
      )}
    </div>
  );
};

export default PreventionOfficerDashboard;