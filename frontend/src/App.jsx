import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginFireStaff from "./pages/UserManagement/StaffLogin";
import CivilianLogin from "./pages/CivilianDashboard/civilianLogin";
import SupplierLogin from "./pages/SupplyManagement/Login/supplierLogin";
import DynamicDashboard from "./pages/Dashboard/Dashboard";

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

import SupplierManagement from "./pages/SupplyManagement/SupplierManagement";
import SupplyRequests from "./pages/SupplyManagement/SupplyRequests";
import SupplyRequestForSupplier from "./pages/SupplyManagement/supplyRequestForSupplier";
import Bids from "./pages/SupplyManagement/Bids";
import SupplierProfile from "./pages/SupplyManagement/SupplierProfile";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedSupplierRoute from "./components/protectedSupplierRoute";

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const supplier = JSON.parse(localStorage.getItem("supplier")); // example for supplier login

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginFireStaff />} />
        <Route path="/staff-login" element={<LoginFireStaff />} />
        <Route path="/civilian-login" element={<CivilianLogin />} />
        <Route path="/supplier-login" element={<SupplierLogin />} />

        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <DynamicDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mission-records"
          element={
            <ProtectedRoute user={user}>
              <MissionRecords />
            </ProtectedRoute>
          }
        />

        {/* Inventory routes */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute user={user}>
              <InventoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/add"
          element={
            <ProtectedRoute user={user}>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/vehicles"
          element={
            <ProtectedRoute user={user}>
              <VehicleList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/vehicles/add"
          element={
            <ProtectedRoute user={user}>
              <VehicleForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/vehicles/:id"
          element={
            <ProtectedRoute user={user}>
              <VehicleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/edit/:id"
          element={
            <ProtectedRoute user={user}>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/vehicle-items"
          element={
            <ProtectedRoute user={user}>
              <VehicleItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:id/reorder"
          element={
            <ProtectedRoute user={user}>
              <ReorderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/reorders"
          element={
            <ProtectedRoute user={user}>
              <ReordersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/reorders/list"
          element={
            <ProtectedRoute user={user}>
              <ReordersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/logs"
          element={
            <ProtectedRoute user={user}>
              <InventoryLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:id"
          element={
            <ProtectedRoute user={user}>
              <InventoryDetail />
            </ProtectedRoute>
          }
        />

        {/* Shift Management routes */}
        <Route
          path="/shifts"
          element={
            <ProtectedRoute user={user}>
              <ShiftDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shifts/create"
          element={
            <ProtectedRoute user={user}>
              <CreateShift />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shifts/my-shifts"
          element={
            <ProtectedRoute user={user}>
              <MyShifts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shifts/change-requests"
          element={
            <ProtectedRoute user={user}>
              <ChangeRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shifts/messages"
          element={
            <ProtectedRoute user={user}>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Supplier routes */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute user={user}>
              <SupplierManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supply-requests"
          element={
            <ProtectedRoute user={user}>
              <SupplyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/supply-requests"
          element={
            <ProtectedSupplierRoute user={supplier}>
              <SupplyRequestForSupplier />
            </ProtectedSupplierRoute>
          }
        />
        <Route
          path="/supplier/bids"
          element={
            <ProtectedSupplierRoute user={supplier}>
              <Bids />
            </ProtectedSupplierRoute>
          }
        />
        <Route
          path="/supplier/bids/new/:requestId?"
          element={
            <ProtectedSupplierRoute user={supplier}>
              <Bids />
            </ProtectedSupplierRoute>
          }
        />
        <Route
          path="/supplier/profile"
          element={
            <ProtectedSupplierRoute user={supplier}>
              <SupplierProfile />
            </ProtectedSupplierRoute>
          }
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
