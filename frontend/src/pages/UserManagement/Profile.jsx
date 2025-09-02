import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, getCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Get user's roles for field permissions
  const getUserRoles = () => {
    return user?.roles?.map(role => role.name) || [];
  };

  // Check if user can edit specific fields based on role
  const canEditField = (fieldName) => {
    const userRoles = getUserRoles();
    
    // Admin and CFO can edit everything
    if (userRoles.includes('admin') || userRoles.includes('cfo')) {
      return true;
    }

    // Define role-based permissions
    const rolePermissions = {
      admin: ['name', 'email', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'employeeId', 'rank', 'position', 'username', 'notificationPreferences', 'theme'],
      cfo: ['name', 'email', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'employeeId', 'rank', 'position', 'username', 'notificationPreferences', 'theme'],
      '1st_class_officer': ['name', 'email', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'username', 'notificationPreferences', 'theme'],
      officer: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'notificationPreferences', 'theme'],
      captain: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'notificationPreferences', 'theme'],
      lieutenant: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'notificationPreferences', 'theme'],
      finance_manager: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'notificationPreferences', 'theme'],
      inventory_manager: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'notificationPreferences', 'theme'],
      record_manager: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'notificationPreferences', 'theme'],
      prevention_manager: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'notificationPreferences', 'theme'],
      training_session_manager: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'notificationPreferences', 'theme'],
      incident_commander: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'notificationPreferences', 'theme'],
      driver_engineer: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'notificationPreferences', 'theme'],
      fighter: ['name', 'phoneNumber', 'address', 'emergencyContact', 'personalInfo', 'certifications', 'notificationPreferences', 'theme']
    };

    // Check if any of user's roles allow editing this field
    for (const role of userRoles) {
      if (rolePermissions[role] && rolePermissions[role].includes(fieldName)) {
        return true;
      }
    }

    return false;
  };

  // Get field permission message
  const getFieldPermissionMessage = (fieldName) => {
    if (canEditField(fieldName)) {
      return null;
    }
    
    const userRoles = getUserRoles();
    if (userRoles.includes('1st_class_officer')) {
      return "Contact admin to modify this field";
    }
    return "This field cannot be modified";
  };
  
  // Comprehensive profile form state
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: '',
    profilePicture: null,
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
    },
    emergencyContact: {
      name: '',
      phoneNumber: '',
      email: ''
    },
    personalInfo: {
      dateOfBirth: '',
      gender: 'prefer_not_to_say',
    },

    // Professional Information
    employeeId: '',
    rank: '',
    position: '',
    certifications: [],

    // Account Settings
    username: '',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    },
    theme: 'light',

    // Duty & Availability
    currentShift: 'off-duty',
    assignedUnit: '',
    availabilityStatus: 'available'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // New certification form state
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: ''
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        profilePicture: user.profilePicture || null,
        phoneNumber: user.phoneNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
        },
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relationship: user.emergencyContact?.relationship || '',
          phoneNumber: user.emergencyContact?.phoneNumber || '',
          email: user.emergencyContact?.email || ''
        },
        personalInfo: {
          dateOfBirth: user.personalInfo?.dateOfBirth ? new Date(user.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
          gender: user.personalInfo?.gender || 'prefer_not_to_say',
        },
        employeeId: user.employeeId || '',
        rank: user.rank || '',
        position: user.position || '',
        certifications: user.certifications || [],
        username: user.username || '',
        notificationPreferences: {
          email: user.notificationPreferences?.email ?? true,
          sms: user.notificationPreferences?.sms ?? false,
          push: user.notificationPreferences?.push ?? true
        },
        theme: user.theme || 'light',
        currentShift: user.currentShift || 'off-duty',
        assignedUnit: user.assignedUnit || '',
        availabilityStatus: user.availabilityStatus || 'available'
      });
    }
  }, [user]);

  // Handle profile form input changes
  const handleProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle password form input changes
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  // Add new certification
  const handleAddCertification = () => {
    if (!newCertification.name || !newCertification.issuingAuthority || !newCertification.issueDate) {
      toast.error('Please fill in all required certification fields');
      return;
    }

    setProfileData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...newCertification, status: 'active' }]
    }));

    setNewCertification({
      name: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      certificateNumber: ''
    });
  };

  // Remove certification
  const handleRemoveCertification = (index) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Handle certification change
  const handleCertificationChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data to send
      const dataToSend = { ...profileData };
      
      // Remove profile picture from data if it's a File object
      if (dataToSend.profilePicture instanceof File) {
        delete dataToSend.profilePicture;
      }

      // Send as JSON if no file upload, otherwise as FormData
      let response;
      if (profileData.profilePicture instanceof File) {
        const formData = new FormData();
        formData.append('profilePicture', profileData.profilePicture);
        formData.append('data', JSON.stringify(dataToSend));
        
        response = await api.put('/api/v1/auth/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.put('/api/v1/auth/profile', dataToSend);
      }
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        await getCurrentUser();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.put('/api/v1/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }



  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-sm text-gray-500">Role: {user?.roles?.map(role => role.displayName || role.name).join(', ')}</span>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showPasswordForm ? 'Hide Password Change' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Profile Form */}
        <div className="p-6">
                    <form onSubmit={handleProfileUpdate} className="space-y-8">
            {/* Profile Picture */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  {profileData.profilePicture ? (
                    <img 
                      src={profileData.profilePicture instanceof File ? URL.createObjectURL(profileData.profilePicture) : profileData.profilePicture} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No Photo</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    disabled={!canEditField('name')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('name') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                  {getFieldPermissionMessage('name') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('name')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                    disabled={!canEditField('phoneNumber')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('phoneNumber') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {getFieldPermissionMessage('phoneNumber') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('phoneNumber')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.personalInfo.dateOfBirth}
                    onChange={(e) => handleProfileChange('personalInfo.dateOfBirth', e.target.value)}
                    disabled={!canEditField('personalInfo')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('personalInfo') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={profileData.personalInfo.gender}
                    onChange={(e) => handleProfileChange('personalInfo.gender', e.target.value)}
                    disabled={!canEditField('personalInfo')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('personalInfo') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={profileData.employeeId}
                    onChange={(e) => handleProfileChange('employeeId', e.target.value)}
                    disabled={!canEditField('employeeId')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('employeeId') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {getFieldPermissionMessage('employeeId') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('employeeId')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rank</label>
                  <input
                    type="text"
                    value={profileData.rank}
                    onChange={(e) => handleProfileChange('rank', e.target.value)}
                    disabled={!canEditField('rank')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('rank') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {getFieldPermissionMessage('rank') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('rank')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => handleProfileChange('position', e.target.value)}
                    disabled={!canEditField('position')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('position') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {getFieldPermissionMessage('position') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('position')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    disabled={!canEditField('username')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('username') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {getFieldPermissionMessage('username') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('username')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Duty & Availability */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Duty & Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Shift</label>
                  <select
                    value={profileData.currentShift}
                    onChange={(e) => handleProfileChange('currentShift', e.target.value)}
                    disabled={!canEditField('currentShift')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('currentShift') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="off-duty">Off-duty</option>
                    <option value="on-call">On Call</option>
                  </select>
                  {getFieldPermissionMessage('currentShift') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('currentShift')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Unit</label>
                  <input
                    type="text"
                    value={profileData.assignedUnit}
                    onChange={(e) => handleProfileChange('assignedUnit', e.target.value)}
                    disabled={!canEditField('assignedUnit')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('assignedUnit') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                  {getFieldPermissionMessage('assignedUnit') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('assignedUnit')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability Status</label>
                  <select
                    value={profileData.availabilityStatus}
                    onChange={(e) => handleProfileChange('availabilityStatus', e.target.value)}
                    disabled={!canEditField('availabilityStatus')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('availabilityStatus') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="on-leave">On Leave</option>
                    <option value="training">In Training</option>
                  </select>
                  {getFieldPermissionMessage('availabilityStatus') && (
                    <p className="text-xs text-gray-500 mt-1">{getFieldPermissionMessage('availabilityStatus')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={profileData.address.street}
                    onChange={(e) => handleProfileChange('address.street', e.target.value)}
                    disabled={!canEditField('address')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('address') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={profileData.address.city}
                    onChange={(e) => handleProfileChange('address.city', e.target.value)}
                    disabled={!canEditField('address')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('address') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={profileData.address.state}
                    onChange={(e) => handleProfileChange('address.state', e.target.value)}
                    disabled={!canEditField('address')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('address') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    value={profileData.emergencyContact.name}
                    onChange={(e) => handleProfileChange('emergencyContact.name', e.target.value)}
                    disabled={!canEditField('emergencyContact')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('emergencyContact') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    value={profileData.emergencyContact.relationship}
                    onChange={(e) => handleProfileChange('emergencyContact.relationship', e.target.value)}
                    disabled={!canEditField('emergencyContact')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('emergencyContact') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.emergencyContact.phoneNumber}
                    onChange={(e) => handleProfileChange('emergencyContact.phoneNumber', e.target.value)}
                    disabled={!canEditField('emergencyContact')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('emergencyContact') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profileData.emergencyContact.email}
                    onChange={(e) => handleProfileChange('emergencyContact.email', e.target.value)}
                    disabled={!canEditField('emergencyContact')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('emergencyContact') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <select
                    value={profileData.theme}
                    onChange={(e) => handleProfileChange('theme', e.target.value)}
                    disabled={!canEditField('theme')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('theme') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                  <select
                    value={profileData.notificationPreferences.email ? 'true' : 'false'}
                    onChange={(e) => handleProfileChange('notificationPreferences.email', e.target.value === 'true')}
                    disabled={!canEditField('notificationPreferences')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('notificationPreferences') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                  <select
                    value={profileData.notificationPreferences.sms ? 'true' : 'false'}
                    onChange={(e) => handleProfileChange('notificationPreferences.sms', e.target.value === 'true')}
                    disabled={!canEditField('notificationPreferences')}
                    className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !canEditField('notificationPreferences') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications & Training</h3>
              <div className="space-y-4">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                          disabled={!canEditField('certifications')}
                          className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !canEditField('certifications') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Issuing Authority</label>
                        <input
                          type="text"
                          value={cert.issuingAuthority}
                          onChange={(e) => handleCertificationChange(index, 'issuingAuthority', e.target.value)}
                          disabled={!canEditField('certifications')}
                          className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !canEditField('certifications') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                        <input
                          type="date"
                          value={cert.issueDate}
                          onChange={(e) => handleCertificationChange(index, 'issueDate', e.target.value)}
                          disabled={!canEditField('certifications')}
                          className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !canEditField('certifications') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => handleCertificationChange(index, 'expiryDate', e.target.value)}
                          disabled={!canEditField('certifications')}
                          className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !canEditField('certifications') ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>
                    {canEditField('certifications') && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Certification
                      </button>
                    )}
                  </div>
                ))}
                {canEditField('certifications') && (
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Certification
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
