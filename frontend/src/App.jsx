import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddFireStaff from "./pages/UserManagement/AddUsers"; 
import LoginFireStaff from "./pages/UserManagement/StaffLogin";
import OfficerProfile from "./pages/UserManagement/1stClassOfficerprofile";
import UserDetails from "./pages/UserManagement/StaffDetails";


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


      
      </Routes>
    </BrowserRouter>
  );
}

export default App;

