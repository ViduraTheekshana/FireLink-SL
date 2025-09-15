import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./context/auth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/UserManagement/Login";
import Profile from "./pages/UserManagement/Profile";
import UserManagement from "./pages/UserManagement/UserManagement";
import Dashboard from "./pages/Dashboard/Dashboard";
import MissionRecords from "./pages/MissionRecords/MissionRecords";
import InventoryList from "./pages/Inventory/InventoryList";
import InventoryForm from "./pages/Inventory/InventoryForm";
import InventoryDetail from "./pages/Inventory/InventoryDetail";
import VehicleList from "./pages/Inventory/VehicleList";
import VehicleForm from "./pages/Inventory/VehicleForm";
import VehicleDetail from "./pages/Inventory/VehicleDetail";
import VehicleItemsPage from "./pages/Inventory/VehicleItemsPage";
import ReorderPage from "./pages/Inventory/ReorderPage";
import ReordersList from "./pages/Inventory/ReordersList";
import InventoryLogs from "./pages/Inventory/InventoryLogs";
import ShiftDashboard from "./pages/ShiftManagement/ShiftDashboard";
import CreateShift from "./pages/ShiftManagement/CreateShift";
import MyShifts from "./pages/ShiftManagement/MyShifts";
import ChangeRequests from "./pages/ShiftManagement/ChangeRequests";
import Messages from "./pages/ShiftManagement/Messages";
import CivilianLogin from "./pages/UserManagement/CivilianLogin";
import CivilianDashboard from "./pages/CivilianDashboard/CivilianDashboard";
import SupplierLogin from "./pages/SupplyManagement/Login/supplierLogin";
import { SupplierAuthProvider } from "./context/supplierAuth";
import Loader from "./components/Loader";
import SupplierManagement from "./pages/SupplyManagement/SupplierManagement";
import SupplyRequests from "./pages/SupplyManagement/SupplyRequests";
import SupplyRequestForSupplier from "./pages/SupplyManagement/supplyRequestForSupplier";
import ProtectedSupplierRoute from "./components/protectedSupplierRoute";

// Main App component
function AppContent() {
	const { loading, isAuthenticated } = useAuth();

	if (loading) {
		return <Loader />;
	}

	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				{/* {isAuthenticated && <Navbar />} */}
				<main>
					<Routes>
						{/* Public routes */}
						<Route
							path="/login"
							element={
								isAuthenticated ? (
									<Navigate to="/dashboard" replace />
								) : (
									<Login />
								)
							}
						/>

						<Route
							path="/civilian-login"
							element={
								isAuthenticated ? (
									<Navigate to="/civilian-dashboard" replace />
								) : (
									<CivilianLogin />
								)
							}
						/>

						<Route
							path="/civilian-dashboard"
							element={
								<ProtectedRoute>
									<CivilianDashboard />
								</ProtectedRoute>
							}
						/>

						{/* Protected routes */}
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/user-management"
							element={
								<ProtectedRoute>
									<UserManagement />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/mission-records"
							element={
								<ProtectedRoute>
									<MissionRecords />
								</ProtectedRoute>
							}
						/>

						{/* Redirect root to dashboard if authenticated, otherwise to login */}
						<Route
							path="/"
							element={
								isAuthenticated ? (
									<Navigate to="/dashboard" replace />
								) : (
									<Navigate to="/login" replace />
								)
							}
						/>

						{/* Inventory Routes */}
						<Route
							path="/inventory"
							element={
								<ProtectedRoute>
									<InventoryList />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/add"
							element={
								<ProtectedRoute>
									<InventoryForm />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/vehicles"
							element={
								<ProtectedRoute>
									<VehicleList />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/vehicles/add"
							element={
								<ProtectedRoute>
									<VehicleForm />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/vehicles/:id"
							element={
								<ProtectedRoute>
									<VehicleDetail />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/edit/:id"
							element={
								<ProtectedRoute>
									<InventoryForm />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/vehicle-items"
							element={
								<ProtectedRoute>
									<VehicleItemsPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/:id/reorder"
							element={
								<ProtectedRoute>
									<ReorderPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/reorders"
							element={
								<ProtectedRoute>
									<ReordersList />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/inventory/reorders/list"
							element={
								<ProtectedRoute>
									<ReordersList />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/inventory/logs"
							element={
								<ProtectedRoute>
									<InventoryLogs />
								</ProtectedRoute>
							}
						/>

						{/* General inventory route - must be last */}
						<Route
							path="/inventory/:id"
							element={
								<ProtectedRoute>
									<InventoryDetail />
								</ProtectedRoute>
							}
						/>

						{/* Shift Management Routes */}
						<Route
							path="/shifts"
							element={
								<ProtectedRoute>
									<ShiftDashboard />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/shifts/create"
							element={
								<ProtectedRoute>
									<CreateShift />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/shifts/my-shifts"
							element={
								<ProtectedRoute>
									<MyShifts />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/shifts/change-requests"
							element={
								<ProtectedRoute>
									<ChangeRequests />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/shifts/messages"
							element={
								<ProtectedRoute>
									<Messages />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/suppliers"
							element={
								<ProtectedRoute>
									<SupplierManagement />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/supply-requests"
							element={
								<ProtectedRoute>
									<SupplyRequests />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/supplier/supply-requests"
							element={
								<ProtectedSupplierRoute>
									<SupplyRequestForSupplier />
								</ProtectedSupplierRoute>
							}
						/>

						<Route path="/supplier-login" element={<SupplierLogin />} />

						{/* Catch all route - must be last */}
						<Route
							path="*"
							element={
								isAuthenticated ? (
									<Navigate to="/dashboard" replace />
								) : (
									<Navigate to="/login" replace />
								)
							}
						/>
					</Routes>
				</main>
			</div>
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
				transition={Bounce}
			/>
		</Router>
	);
}

// Root App component with AuthProvider
function App() {
	return (
		<AuthProvider>
			<SupplierAuthProvider>
				<AppContent />
			</SupplierAuthProvider>
		</AuthProvider>
	);
}

export default App;
