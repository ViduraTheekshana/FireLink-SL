import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from "../UserManagement/Sidebar"; // adjust path if needed

const ShiftScheduler = () => {
  const [schedules, setSchedules] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    date: '', vehicle: '', shiftType: '', members: [], notes: ''
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [errors, setErrors] = useState({});

  const vehicleOptions = ["Engine 1", "Engine 2", "Ladder 1", "Rescue 1", "Tanker 1", "Command 1"];
  const shiftTypeOptions = ["Day Shift (08:00-20:00)", "Night Shift (20:00-08:00)", "24-Hour Shift"];




  useEffect(() => {
    fetchSchedules();
    fetchMembers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('http://localhost:5000/shift-schedules');
      setSchedules(res.data.schedules);
    } catch (err) { console.error(err); }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/shift-schedules/members/all');
      setMembers(res.data.users);
    } catch (err) { console.error(err); }
  };
const isFormValid = () => {
  const newErrors = {};

  // Required field validation
  if (!formData.date) newErrors.date = 'Date is required';
  else {
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;
  }

  if (!formData.vehicle) newErrors.vehicle = 'Vehicle selection is required';
  if (!formData.shiftType) newErrors.shiftType = 'Shift type is required';

  // Team composition validation
  if (formData.members.length === 0) {
    newErrors.members = 'At least one member must be assigned';
  } else {
    const teamError = validateTeamComposition(formData.members);
    if (teamError) newErrors.members = teamError;
  }

  // Availability validation
  const availabilityErrors = checkAvailability();
  Object.assign(newErrors, availabilityErrors);

  return Object.keys(newErrors).length === 0;
};


  // Validate date - cannot select past dates
  const validateDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);

    if (selectedDate < today) {
      return "Cannot schedule shifts for past dates";
    }
    return null;
  };

  // Validate team composition - must have at least one team captain
  const validateTeamComposition = (memberIds) => {
    if (memberIds.length === 0) return null;

    const selectedMembers = members.filter(m => memberIds.includes(m._id));
    const hasTeamCaptain = selectedMembers.some(m =>
      m.position.toLowerCase().includes('captain') ||
      m.position.toLowerCase().includes('chief') ||
      m.position.toLowerCase().includes('officer')
    );

    if (!hasTeamCaptain) {
      return "Team must include at least one Captain, Chief, or Officer";
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Special validation for date
    if (name === 'date' && value) {
      const dateError = validateDate(value);
      if (dateError) {
        setErrors(prev => ({ ...prev, date: dateError }));
      }
    }
  };

  const handleMemberSelect = (id) => {
    if (formData.members.length >= 8) {
      setErrors(prev => ({ ...prev, members: 'Maximum 8 members per vehicle' }));
      return;
    }

    if (!formData.members.includes(id)) {
      const newMembers = [...formData.members, id];
      setFormData(prev => ({ ...prev, members: newMembers }));

      // Validate team composition
      const teamError = validateTeamComposition(newMembers);
      setErrors(prev => ({ ...prev, members: teamError || '' }));
    }
  };

  const removeMember = (id) => {
    const newMembers = formData.members.filter(m => m !== id);
    setFormData(prev => ({ ...prev, members: newMembers }));

    // Revalidate team composition after removal
    const teamError = validateTeamComposition(newMembers);
    setErrors(prev => ({ ...prev, members: teamError || '' }));
  };

  
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.date) newErrors.date = 'Date is required';
    else {
      const dateError = validateDate(formData.date);
      if (dateError) newErrors.date = dateError;
    }

    if (!formData.vehicle) newErrors.vehicle = 'Vehicle selection is required';
    if (!formData.shiftType) newErrors.shiftType = 'Shift type is required';

    // Team composition validation
    if (formData.members.length === 0) {
      newErrors.members = 'At least one member must be assigned';
    } else {
      const teamError = validateTeamComposition(formData.members);
      if (teamError) newErrors.members = teamError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };





  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingSchedule) {
        await axios.put(`http://localhost:5000/shift-schedules/${editingSchedule._id}`, formData);
        alert('Schedule updated successfully');
      } else {
        await axios.post('http://localhost:5000/shift-schedules', {
          ...formData,
          createdBy: '64fa...'
        });
        alert('Schedule created successfully');
      }
      resetForm();
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving schedule');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ date: '', vehicle: '', shiftType: '', members: [], notes: '' });
    setEditingSchedule(null);
    setErrors({});
  };

  const editSchedule = (schedule) => {
    setFormData({
      date: schedule.date.split('T')[0],
      vehicle: schedule.vehicle,
      shiftType: schedule.shiftType,
      members: schedule.members.map(m => m._id),
      notes: schedule.notes || ''
    });
    setEditingSchedule(schedule);
    setErrors({});
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await axios.delete(`http://localhost:5000/shift-schedules/${id}`);
      alert('Schedule deleted successfully');
      fetchSchedules();
    } catch (err) {
      alert('Error deleting schedule');
      console.error(err);
    }
  };

  const getMemberName = (id) => members.find(m => m._id === id)?.name || 'Unknown';
  const getMemberPosition = (id) => members.find(m => m._id === id)?.position || '';

  const isLeadershipRole = (position) => {
    return position && (
      position.toLowerCase().includes('captain') ||
      position.toLowerCase().includes('chief') ||
      position.toLowerCase().includes('officer') ||
      position.toLowerCase().includes('supervisor')
    );
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const checkAvailability = () => {
  const selectedDate = formData.date;
  const selectedVehicle = formData.vehicle;
  const selectedMembers = formData.members;

  let availabilityErrors = {};

  // Vehicle conflict
  const vehicleConflict = schedules.some(
    s => s.date.split('T')[0] === selectedDate &&
         s.vehicle === selectedVehicle &&
         (!editingSchedule || s._id !== editingSchedule._id)
  );
  if (vehicleConflict) availabilityErrors.vehicle = "This vehicle is already assigned on the selected date.";

  // Member conflicts
  const memberConflicts = schedules
    .filter(s => s.date.split('T')[0] === selectedDate && (!editingSchedule || s._id !== editingSchedule._id))
    .flatMap(s => s.members.map(m => m._id));
  const overlappingMembers = selectedMembers.filter(m => memberConflicts.includes(m));
  if (overlappingMembers.length > 0) {
    availabilityErrors.members = `These members are already assigned on this date: ${overlappingMembers.map(id => getMemberName(id)).join(', ')}`;
  }

  return availabilityErrors;
};

// search bar

const [searchDate, setSearchDate] = useState('');

const filteredSchedules = searchDate 
  ? schedules.filter(s => s.date.split('T')[0] === searchDate)
  : schedules;



  // download pdf 
  const [downloadStartDate, setDownloadStartDate] = useState('');
  const [downloadEndDate, setDownloadEndDate] = useState('');

  const downloadSchedules = async () => {
    if (!downloadStartDate || !downloadEndDate) {
      alert("Please select both start and end dates");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/shift-schedules/download", {
        params: { startDate: downloadStartDate, endDate: downloadEndDate },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shift_schedules.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.message || "no schedules found for selected date range");
      console.error(err);
    }
  };


  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#1e2a38] py-8 px-4">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Fire Vehicle Shift Scheduler</h1>
              <p className="text-gray-600 mt-2">Schedule shifts for fire vehicles with up to 8 members per vehicle</p>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Requirements:</strong> Cannot schedule past dates • Team must include at least one Captain/Chief/Officer • Maximum 8 members per vehicle
                </p>
              </div>
            </div>
            <Link
              to="/officer-profile"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold"
            >
              Back to Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              {editingSchedule ? 'Edit Shift Schedule' : 'Create New Shift Schedule'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getTodayDate()}
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fire Vehicle *
                </label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.vehicle ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select vehicle</option>
                  {vehicleOptions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {errors.vehicle && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>
                )}
              </div>

              {/* Shift Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Type *
                </label>
                <select
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.shiftType ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select shift</option>
                  {shiftTypeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.shiftType && (
                  <p className="text-red-500 text-sm mt-1">{errors.shiftType}</p>
                )}
              </div>

              {/* Members Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Members ({formData.members.length}/8) *
                </label>

                {/* Selected Members Display */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.members.map(id => {
                    const position = getMemberPosition(id);
                    const isLeader = isLeadershipRole(position);
                    return (
                      <span key={id} className={`px-3 py-1 rounded-full text-sm flex items-center ${isLeader ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-red-100 text-red-800'
                        }`}>
                        {getMemberName(id)}
                        {isLeader && (
                          <span className="ml-1 text-xs bg-blue-200 px-1 rounded">Lead</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMember(id)}
                          className="ml-2 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Members Dropdown */}
                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleMemberSelect(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select member to add...</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.staffId}) - {m.position}
                      {isLeadershipRole(m.position) ? ' ⭐' : ''}
                    </option>
                  ))}
                </select>

                {errors.members ? (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.members}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    ⭐ indicates leadership roles. Team must include at least one Captain, Chief, or Officer.
                  </p>
                )}
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Additional notes or special instructions..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold"
                >
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

       {/* Schedule List */}
<div className="bg-white rounded-xl shadow-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Schedule List</h3>

  {/* 🔎 Search + Download Controls */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4">
    
    {/* Search by Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Search by Date</label>
      <div className="flex gap-2">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border p-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={() => setSearchDate("")}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition duration-300 text-sm"
        >
          Clear
        </button>
      </div>
    </div>

    {/* Download Block */}
    <div className="bg-gray-50 rounded-lg shadow p-4">
      <h2 className="text-md font-semibold text-gray-800 mb-2">Download Shift Schedules</h2>
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex flex-col gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">Start Date</label>
    <input
      type="date"
      value={downloadStartDate}
      onChange={(e) => setDownloadStartDate(e.target.value)}
      className="border p-2 rounded-lg"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">End Date</label>
    <input
      type="date"
      value={downloadEndDate}
      onChange={(e) => setDownloadEndDate(e.target.value)}
      className="border p-2 rounded-lg"
    />
  </div>
</div>

        <button
          onClick={downloadSchedules}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Download
        </button>
      </div>
    </div>
  </div>

  {/* Schedule List Rendering */}
  {filteredSchedules.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="mt-2">No schedules found</p>
    </div>
  ) : (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {filteredSchedules.map((s) => {
        const hasTeamCaptain = s.members.some((m) =>
          isLeadershipRole(m.position)
        );

        return (
          <div
            key={s._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {s.vehicle} - {s.shiftType}
                </h3>
                <p className="text-gray-600 text-sm">{formatDate(s.date)}</p>
                {!hasTeamCaptain && (
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">
                    ⚠️ Missing Team Leader
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editSchedule(s)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSchedule(s._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Assigned Members:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {s.members.map((member) => (
                  <span
                    key={member._id}
                    className={`px-2 py-1 rounded text-xs ${
                      isLeadershipRole(member.position)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {member.name} ({member.staffId})
                    {isLeadershipRole(member.position) && " ⭐"}
                  </span>
                ))}
              </div>
            </div>

            {s.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Notes:</strong> {s.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>

        </div>
      </div>
    </div>
  );
};

export default ShiftScheduler;