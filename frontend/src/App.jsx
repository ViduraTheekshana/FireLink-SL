import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Management
//import AddFireStaff from "./pages/UserManagement/AddUsers.jsx"; 
import LoginFireStaff from "./pages/UserManagement/StaffLogin.jsx";
import OfficerProfile from "./pages/UserManagement/1stClassOfficerprofile.jsx";
//import UserDetails from "./pages/UserManagement/StaffDetails.jsx";
//import UpdateUser from "./pages/UserManagement/updateStaff.jsx";
//import TrainingSessionManager from "./pages/UserManagement/TrainingSessionManager.jsx";
//import UpdateSession from "./pages/UserManagement/UpdateSession.jsx";
//import ViewSessions from "./pages/UserManagement/AllSessionsDetails.jsx"; 
//import AttendanceForm from "./pages/UserManagement/AttendanceForm.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth & Staff */}
        <Route path="/" element={<LoginFireStaff />} />
        <Route path="/login" element={<LoginFireStaff />} />
        <Route path="/officer/:id" element={<OfficerProfile/>} />

        {/* Training sessions */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
