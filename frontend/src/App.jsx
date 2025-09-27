import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginFireStaff from "./pages/UserManagement/StaffLogin";
import CivilianLogin from "./pages/CivilianDashboard/civilianLogin";
import SupplierLogin from "./pages/SupplyManagement/Login/supplierLogin";
import DynamicDashboard from "./pages/Dashboard/Dashboard";
import AddFireStaff from "./pages/UserManagement/AddUsers";
import OfficerProfile from "./pages/UserManagement/1stClassOfficerprofile";
import UserDetails from "./pages/UserManagement/StaffDetails";

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
        <Route path="/firstaff" element={<AddFireStaff />} />
        <Route path="/officer/:id" element={<OfficerProfile />} />
        <Route path="/userdetails" element={<UserDetails />} />
        
        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={
              <DynamicDashboard />
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
              <InventoryList />
          }
        />
        <Route
          path="/inventory/add"
          element={
              <InventoryForm />
          }
        />
        <Route
          path="/inventory/vehicles"
          element={
              <VehicleList />
          }
        />
        <Route
          path="/inventory/vehicles/add"
          element={
              <VehicleForm />
          }
        />
        <Route
          path="/inventory/vehicles/:id"
          element={
              <VehicleDetail />
          }
        />
        <Route
          path="/inventory/vehicles/edit/:id"
          element={
              <VehicleForm />
          }
        />
        <Route
          path="/inventory/edit/:id"
          element={
              <InventoryForm />
          }
        />
        <Route
          path="/inventory/vehicle-items"
          element={
              <VehicleItemsPage />
          }
        />
        <Route
          path="/inventory/vehicle-items/vehicle/:vehicleId"
          element={
              <VehicleItemsPage />
          }
        />
        <Route
          path="/inventory/:id/reorder"
          element={
              <ReorderPage />
          }
        />
        <Route
          path="/inventory/reorders"
          element={
              <ReordersList />
          }
        />
        <Route
          path="/inventory/reorders/list"
          element={
              <ReordersList />
          }
        />
        <Route
          path="/inventory/logs"
          element={
              <InventoryLogs />
          }
        />
        <Route
          path="/inventory/:id"
          element={
              <InventoryDetail />
          }
        />

        {/* Shift Management routes */}
        <Route
          path="/shifts"
          element={
              <ShiftDashboard />
          }
        />
        <Route
          path="/shifts/create"
          element={
              <CreateShift />
          }
        />
        <Route
          path="/shifts/my-shifts"
          element={
              <MyShifts />
          }
        />
        <Route
          path="/shifts/change-requests"
          element={
              <ChangeRequests />
          }
        />
        <Route
          path="/shifts/messages"
          element={
              <Messages />
          }
        />

        {/* Supplier routes */}
        <Route
          path="/suppliers"
          element={
              <SupplierManagement />
          }
        />
        <Route
          path="/supply-requests"
          element={
              <SupplyRequests />
          }
        />
        <Route
          path="/supplier/supply-requests"
          element={
              <SupplyRequestForSupplier />
          }
        />
        <Route
          path="/supplier/bids"
          element={
              <Bids />
          }
        />
        <Route
          path="/supplier/bids/new/:requestId?"
          element={
              <Bids />
          }
        />
        <Route
          path="/supplier/profile"
          element={
              <SupplierProfile />
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

