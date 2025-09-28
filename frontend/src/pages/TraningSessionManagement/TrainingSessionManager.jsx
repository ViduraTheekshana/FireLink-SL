import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiUser,
  FiShield,
  FiHash,
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiPlus,
  FiList,
  FiLogOut,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiAward,
  FiSettings,
  FiSend,
} from "react-icons/fi";

const InputField = ({
  label,
  name,
  value,
  handleInputChange,
  type = "text",
  icon,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      {icon} {label} *
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleInputChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const TextAreaField = ({ label, name, value, handleInputChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} *
    </label>
    <textarea
      name={name}
      value={value}
      onChange={handleInputChange}
      rows={4}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const TrainingSessionManager = () => {
  const location = useLocation();
  const user = location.state?.user;
  const [activeTab, setActiveTab] = useState("profile");
  const [staffMembers, setStaffMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ add this
  const [attendanceData, setAttendanceData] = useState({}); // store attendance per session
  const [selectedNumber, setSelectedNumber] = useState(""); // mobile number for sending report

  // For mobile number input for WhatsApp
  const [mobileNumber, setMobileNumber] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    teamMembers: [],
    createdBy: user?.staffId || "",
    newStaffId: "",
  });
  const printRef = useRef();

  useEffect(() => {
    if (activeTab === "create") fetchStaffMembers();
    else if (activeTab === "sessions") fetchSessions();
  }, [activeTab]);

  const fetchStaffMembers = async () => {
    try {
      const res = await fetch("http://localhost:5000/sessions/staff-members");
      const data = await res.json();
      if (data.users) setStaffMembers(data.users);
    } catch (err) {
      console.error("Error fetching staff members:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("http://localhost:5000/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const fetchAttendance = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:5000/attendance/${sessionId}`);
      const data = await res.json();
      if (data.status === "ok") {
        setAttendanceData((prev) => ({
          ...prev,
          [sessionId]: data.attendance, // THIS IS THE KEY
        }));
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };


  const handleSendReport = (mobileNumber, session) => {
    if (!mobileNumber) {
      alert("Please enter a mobile number");
      return;
    }

    const message =
      `Attendance report for session "${session.title}" (ID: ${session._id}):\n` +
      (attendanceData[session._id]?.length > 0
        ? attendanceData[session._id]
          .map((a) => `${a.staffName} (${a.staffId})`)
          .join("\n")
        : "No attendance yet.");

    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${mobileNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(WhatsAppUrl, "_blank");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamMemberChange = (staffId) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(staffId)
        ? prev.teamMembers.filter((id) => id !== staffId)
        : [...prev.teamMembers, staffId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          teamMembers: formData.teamMembers,
        }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        alert("Training session created successfully!");
        setFormData({
          title: "",
          description: "",
          date: "",
          venue: "",
          teamMembers: [],
          newStaffId: "",
          createdBy: user.staffId,
        });
        setActiveTab("sessions");
        fetchSessions();
      } else alert("Error creating session: " + data.err);
    } catch (err) {
      console.error(err);
      alert("Failed to create training session");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await fetch(`http://localhost:5000/sessions/${id}`, {
          method: "DELETE",
        });
        setSessions((prev) => prev.filter((session) => session._id !== id));
        alert("Session deleted successfully");
      } catch (err) {
        console.error(err);
        alert("Failed to delete session");
      }
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e2a38]">
        <div className="text-lg text-red-400">
          No user data found. Please login again.
        </div>
      </div>
    );

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2a38] to-[#2d3e50] py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#c62828] to-[#d32f2f] text-white px-8 py-12 relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-[#c62828] shadow-lg border-4 border-white absolute -top-14">
              {initials}
            </div>
            <div className="mt-16 text-center">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-lg text-red-100 mt-2 flex items-center justify-center">
                <FiAward className="mr-2" /> {user.position}
              </p>
              <p className="text-sm text-red-200 mt-1 flex items-center justify-center">
                <FiHash className="mr-1" /> Staff ID: {user.staffId}
              </p>
            </div>
            <Link
              to="/staff-login"
              className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition backdrop-blur-sm"
            >
              <FiLogOut /> Logout
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 border-b overflow-x-auto">
            {["profile", "create", "sessions", "attendance"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition flex items-center whitespace-nowrap ${activeTab === tab
                    ? "bg-white border-t-2 border-[#c62828] text-[#c62828] shadow-sm"
                    : "text-gray-600 hover:text-[#c62828]"
                  }`}
              >
                {tab === "profile" ? (
                  <>
                    <FiUser className="mr-2" /> Profile
                  </>
                ) : tab === "create" ? (
                  <>
                    <FiPlus className="mr-2" /> Create Session
                  </>
                ) : tab === "attendance" ? (
                  <>
                    <FiCheckCircle className="mr-2" /> Attendance
                  </>
                ) : (
                  <>
                    <FiList className="mr-2" /> View Sessions
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <FiHash />,
                  label: "Staff ID",
                  value: user.staffId,
                  bg: "blue",
                },
                {
                  icon: <FiMail />,
                  label: "Email",
                  value: user.gmail,
                  bg: "blue",
                },
                {
                  icon: <FiShield />,
                  label: "Position",
                  value: user.position,
                  bg: "blue",
                },
                {
                  icon: <FiCheckCircle />,
                  label: "Status",
                  value: user.status,
                  bg: user.status === "Active" ? "green" : "red",
                },
              ].map((info, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br from-${info.bg}-50 to-${info.bg}-100 p-5 rounded-xl border border-${info.bg}-200 flex items-center`}
                >
                  <div className={`bg-${info.bg}-100 p-3 rounded-full mr-4`}>
                    {info.icon}
                  </div>
                  <div>
                    <p className={`text-sm text-${info.bg}-700 font-medium`}>
                      {info.label}
                    </p>
                    <p className={`text-lg font-semibold text-${info.bg}-900`}>
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <FiList className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">No sessions created yet.</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-4 px-4 py-2 bg-[#c62828] text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Create Your First Session
                  </button>
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session._id} className="border border-gray-300 rounded-xl p-5">
                    <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Session ID: {session._id}</p>

                    <button
                      onClick={() => fetchAttendance(session._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-2 hover:bg-blue-700 transition text-sm"
                    >
                      Load Attendance
                    </button>

                    {attendanceData[session._id]?.length > 0 ? (
                      <div className="space-y-1">
                        {attendanceData[session._id].map((att, idx) => (
                          <div key={idx} className="flex justify-between items-center px-3 py-1 bg-gray-100 rounded">
                            <span>{att.name} ({att.staffId})</span>
                            <span>{new Date(att.attendedAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No attendance yet.</p>
                    )}

                    {/* WhatsApp report */}
                    <div className="mt-3 flex gap-2 items-center">
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={selectedNumber}
                        onChange={(e) => setSelectedNumber(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition flex-1"
                      />
                      <button
                        onClick={() => handleSendReport(selectedNumber, session)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                      >
                        <FiSend className="mr-2" /> Send Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}


          {activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Session Title"
                name="title"
                value={formData.title}
                handleInputChange={handleInputChange}
              />
              <TextAreaField
                label="Description"
                name="description"
                value={formData.description}
                handleInputChange={handleInputChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
  label="Date & Time"
  name="date"
  value={formData.date}
  handleInputChange={handleInputChange}
  type="datetime-local"
  icon={<FiCalendar className="mr-2 text-[#c62828]" />}
  min={(() => {
    const now = new Date();
    const localDateTime =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + "T" +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0");
    return localDateTime;
  })()}
/>

                <InputField
                  label="Venue"
                  name="venue"
                  value={formData.venue}
                  handleInputChange={handleInputChange}
                  icon={<FiMapPin className="mr-2 text-[#c62828]" />}
                />
              </div>

              {/* Manual Participant Input */}
              <div>
                {/* Dropdown for selecting staff */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiUsers className="mr-2 text-[#c62828]" /> Select Team Members *
                  </label>
                  <select
                    value={formData.selectedDropdownId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (
                        selectedId &&
                        !formData.teamMembers.includes(selectedId)
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          teamMembers: [...prev.teamMembers, selectedId],
                          selectedDropdownId: "",
                        }));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">-- Select staff --</option>
                    {staffMembers
                      .filter(
                        (staff) =>
                          staff.position === "fighter" || staff.position === "team captain"
                      )
                      .map((staff) => (
                        <option key={staff.staffId} value={staff.staffId}>
                          {staff.name} ({staff.staffId})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Manual input */}
                <div className="mb-4">

                  <div className="flex gap-2 mb-2">

                  </div>
                </div>

                {/* Display selected team members */}
                {formData.teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.teamMembers.map((id, index) => {
                      const staff = staffMembers.find((s) => s.staffId === id);
                      const displayName = staff ? `${staff.name} (${staff.staffId})` : id;
                      return (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {displayName}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                teamMembers: prev.teamMembers.filter(
                                  (tid) => tid !== id
                                ),
                              }))
                            }
                            className="text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>


              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
                >
                  <FiArrowLeft className="mr-2" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.teamMembers.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-[#c62828] to-[#d32f2f] text-white rounded-lg hover:from-[#b71c1c] hover:to-[#c62828] disabled:opacity-50 transition flex items-center shadow-md"
                >
                  {loading ? (
                    <>
                      <FiSettings className="animate-spin mr-2" /> Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" /> Create Session
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <FiList className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">No sessions created yet.</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-4 px-4 py-2 bg-[#c62828] text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Create Your First Session
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition text-sm"
                    >
                      Print / Download PDF
                    </button>
                  </div>
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    ref={printRef}
                  >
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="border border-gray-700 rounded-xl p-5 hover:shadow-md transition bg-gray-800 text-white group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg text-white group-hover:text-[#c62828] transition">
                            {session.title}
                          </h4>
                          <span className="bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded">
                            {session.teamMembers.length} participants
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">
                          {session.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-400 mb-1">
                          <FiCalendar className="mr-2" />
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mb-1">
                          <FiClock className="mr-2" />
                          {new Date(session.date).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <FiMapPin className="mr-2" />
                          {session.venue}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {session.teamMembers.map((member, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-xs"
                            >
                              {member}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                          <span className="text-xs text-gray-400">
                            Created by: {session.createdBy}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              className="p-2 text-gray-400 hover:text-blue-500 transition"
                              onClick={() =>
                                navigate(`/update-session/${session._id}`)
                              }
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session._id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingSessionManager;
