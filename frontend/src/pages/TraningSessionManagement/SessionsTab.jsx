import React, { useRef } from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SessionsTab = ({ sessions, handleDeleteSession, handlePrint }) => {
  const navigate = useNavigate();
  const printRef = useRef();

  return (
    <div>
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No sessions created yet.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition text-sm">
              Print / Download PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={printRef}>
            {sessions.map(session => (
              <div key={session._id} className="border border-gray-700 rounded-xl p-5 hover:shadow-md transition bg-gray-800 text-white group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg text-white group-hover:text-[#c62828] transition">{session.title}</h4>
                  <span className="bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded">{session.teamMembers.length} participants</span>
                </div>
                <p className="text-gray-300 mb-2">{session.description}</p>
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <FiCalendar className="mr-2" />{new Date(session.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <FiClock className="mr-2" />{new Date(session.date).toLocaleTimeString()}
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <FiMapPin className="mr-2" />{session.venue}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-400">Created by: {session.createdBy}</span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition" onClick={() => navigate(`/update-session/${session._id}`)}><FiEdit2 /></button>
                    <button onClick={() => handleDeleteSession(session._id)} className="p-2 text-gray-400 hover:text-red-500 transition"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SessionsTab;
