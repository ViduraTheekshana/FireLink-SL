import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Import custom hooks and services
import usePreventionApplications from "../../hooks/usePreventionApplications";

// Import components
import NotificationSystem from "../../components/PreventionManagement/ui/NotificationSystem";
import TabNavigation from "../../components/PreventionManagement/ui/TabNavigation";
import StatisticsOverview from "../../components/PreventionManagement/ui/StatisticsOverview";
import DocumentReviewTable from "../../components/PreventionManagement/tables/DocumentReviewTable";
import PaymentAssignmentTable from "../../components/PreventionManagement/tables/PaymentAssignmentTable";
import InspectionTrackingTable from "../../components/PreventionManagement/tables/InspectionTrackingTable";
import RejectedDocumentsTable from "../../components/PreventionManagement/tables/RejectedDocumentsTable";
import ApplicationDetailsModal from "../../components/PreventionManagement/modals/ApplicationDetailsModal";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PreventionOfficerDashboard = () => {
	// Custom hook for managing applications and API calls
	const {
		applications,
		loading,
		error,
		notifications,
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
		removeNotification,
	} = usePreventionApplications();

	// Local state
	const [activeTab, setActiveTab] = useState("review");
	const [selectedApplication, setSelectedApplication] = useState(null);

	// Handle view application details
	const handleViewDetails = (application) => {
		setSelectedApplication(application);
	};

	// Handle export to Excel
	const handleExportToExcel = () => {
		// Simple CSV export
		const csvContent = applications
			.map(
				(app) =>
					`${app.fullName},${app.nic},${app.serviceType},${app.status},${
						app.payment || ""
					}`
			)
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `prevention_applications_${
			new Date().toISOString().split("T")[0]
		}.csv`;
		a.click();
	};

	// Styles
	const containerStyle = {
		backgroundColor: "#f8fafc",
		minHeight: "100vh",
		fontFamily: "system-ui, -apple-system, sans-serif",
	};

	const headerStyle = {
		background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
		color: "white",
		padding: "24px",
		marginBottom: "24px",
	};

	const headerContentStyle = {
		maxWidth: "1200px",
		margin: "0 auto",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "16px",
	};

	const titleStyle = {
		fontSize: "28px",
		fontWeight: "700",
		margin: 0,
	};

	const subtitleStyle = {
		fontSize: "16px",
		opacity: 0.9,
		margin: "4px 0 0 0",
	};

	const headerButtonsStyle = {
		display: "flex",
		gap: "12px",
	};

	const buttonStyle = {
		padding: "10px 20px",
		borderRadius: "8px",
		border: "none",
		fontSize: "14px",
		fontWeight: "500",
		cursor: "pointer",
		transition: "all 0.2s ease",
	};

	const primaryButtonStyle = {
		...buttonStyle,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		color: "white",
		backdropFilter: "blur(10px)",
	};

	const contentStyle = {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "0 24px",
	};

	const errorAlertStyle = {
		backgroundColor: "#fef2f2",
		border: "1px solid #fecaca",
		color: "#dc2626",
		padding: "16px",
		borderRadius: "8px",
		marginBottom: "24px",
	};

	const loadingStyle = {
		textAlign: "center",
		padding: "60px",
		color: "#6b7280",
		fontSize: "18px",
	};

	const spacerStyle = {
		height: "32px",
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
						<div style={{ fontSize: "48px", marginBottom: "16px" }}>🔄</div>
						Loading applications...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div style={containerStyle}>
			{/* Notifications */}
			<NotificationSystem
				notifications={notifications}
				onRemoveNotification={removeNotification}
			/>

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
							onMouseOver={(e) =>
								(e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)")
							}
							onMouseOut={(e) =>
								(e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
							}
						>
							📊 Export Report
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
						<small>
							Some features may not work properly. Please check if the backend
							server is running.
						</small>
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
				{activeTab === "review" && (
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
							onAddInspectionNotes={addInspectionNotes}
							onMarkAsInspected={markAsInspected}
							onDelete={deleteApplication}
							onViewDetails={handleViewDetails}
							loading={loading}
						/>
					</>
				)}

				{activeTab === "rejected" && (
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
