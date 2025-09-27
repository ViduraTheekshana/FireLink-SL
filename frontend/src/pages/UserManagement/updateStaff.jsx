// Components/UpdateUser.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiCalendar, FiPhone, FiMapPin, 
  FiBriefcase, FiActivity, FiLock, FiEye, FiEyeOff,
  FiArrowLeft, FiSave
} from 'react-icons/fi';
import Navbar from '../UserManagement/Sidebar';


function UpdateUser() {

  
  const [inputs, setInputs] = useState({});
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user"))); // logged-in user

  const token = localStorage.getItem("token"); // JWT from login

  useEffect(() => {
    if (!token) {
      navigate("/staff-login");
      return;
    }

    const fetchHandler = async() => {
     try {
      const token = localStorage.getItem("token"); // or "user" depending on your storage
      const response = await axios.get(`http://localhost:5000/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInputs(response.data.user);
    }catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to fetch user data. Make sure you are logged in.");
      }
    };
    fetchHandler();
  }, [id, navigate, token]);

  const sendRequest = async() => {
    try {
      await axios.put(`http://localhost:5000/users/${id}`, {
        name: String(inputs.name),
        gmail: String(inputs.gmail),
        age: Number(inputs.age),
        address: String(inputs.address),
        phone: String(inputs.phone),
        position: String(inputs.position),
        status: String(inputs.status),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const updatePassword = async() => {
    if (passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword) {
      try {
        await axios.put(`http://localhost:5000/users/${id}/password`, {
          password: passwordData.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPasswordError('');
        alert('Password updated successfully!');
      } catch (error) {
        console.error("Error updating password:", error);
        setPasswordError('Failed to update password');
      }
    }
  };

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (passwordError) setPasswordError('');
  };

  const validatePasswords = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest().then(() => navigate(`/userdetails/${id}`));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePasswords()) updatePassword();
  };
const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/staff-login");
  };
  return (
    <div className="min-h-screen bg-[#1e2a38] py-8 px-4">
      
      <div className="max-w-3xl mx-auto">
        
        <button 
          onClick={() => navigate(`/userdetails/${id}`)}
          className="flex items-center text-white mb-6 hover:text-gray-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to User Details
        </button>

        {/* Update User Info */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-[#c62828] text-white p-6">

            <h1 className="text-3xl font-bold text-center">Update User Information</h1>
          </div>

          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiUser className="mr-2" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={inputs.name || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiMail className="mr-2" /> Email
                </label>
                <input
                  type="email"
                  name="gmail"
                  value={inputs.gmail || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiCalendar className="mr-2" /> Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={inputs.age || ''}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiPhone className="mr-2" /> Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={inputs.phone || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiBriefcase className="mr-2" /> Position
                </label>
                <select
                  name="position"
                  value={inputs.position || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Position</option>
                  <option value="1stclass officer">1st Class Officer</option>
                  <option value="financeManager">Finance Manager</option>
                  <option value="firefighter">Firefighter</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiActivity className="mr-2" /> Status
                </label>
                <select
                  name="status"
                  value={inputs.status || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiMapPin className="mr-2" /> Address
                </label>
                <textarea
                  name="address"
                  value={inputs.address || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#c62828] focus:border-transparent outline-none transition"
                  required
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition flex items-center"
                onClick={() => navigate(`/dashboard`)}
              >
                <FiArrowLeft className="mr-2" /> Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#c62828] text-white rounded-lg shadow hover:bg-red-800 transition flex items-center"
              >
                <FiSave className="mr-2" /> Update User
              </button>
            </div>
          </form>
        </div>

        {/* Password Update */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          <div className="bg-[#2c3e50] text-white p-6">
            <h2 className="text-2xl font-bold text-center flex items-center justify-center">
              <FiLock className="mr-2" /> Update Password
            </h2>
          </div>

          <form className="p-6 md:p-8" onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-gray-600 mb-4">
                  Leave these fields blank if you don't want to change the password.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiLock className="mr-2" /> New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#2c3e50] focus:border-transparent outline-none transition pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                  <FiLock className="mr-2" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-50 p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#2c3e50] focus:border-transparent outline-none transition pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-[#2c3e50] text-white rounded-lg shadow hover:bg-[#1a2530] transition flex items-center"
                disabled={!passwordData.newPassword && !passwordData.confirmPassword}
              >
                <FiLock className="mr-2" /> Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUser;
