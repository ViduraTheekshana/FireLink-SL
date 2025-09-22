import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddFireStaff from "./pages/UserManagement/AddUsers"; 
import LoginFireStaff from "./pages/UserManagement/stafflogin";
import OfficerProfile from "./pages/UserManagement/1stClassOfficerprofile";
import UserDetails from "./pages/UserManagement/StaffDetails";
import CivilianLogin from "./pages/CivilianManagement/CivilianLogin";
import CivilianDashboard from "./pages/CivilianManagement/CivilianDashboard"; 
import SupplierLogin from "./pages/SupplyManagement/Login/supplierLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth & Staff */}
        <Route path="/" element={<LoginFireStaff />} />
        <Route path="/staff-login" element={<LoginFireStaff />} />
        <Route path="/firstaff" element={<AddFireStaff />} />
        <Route path="/officer/:id" element={<OfficerProfile />} />
        <Route path="/userdetails" element={<UserDetails />} />
        <Route path="/userdetails/:id" element={<UserDetails />} />

          <Route path="/civilian-login" element={<CivilianLogin/>} /> 
         <Route path="/supplier-login" element={<SupplierLogin />} /> 
           <Route path="/civilian-dashboard" element={<CivilianDashboard />} /> 

      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
