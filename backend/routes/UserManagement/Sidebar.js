// Components/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserIcon, Settings, LogOut, Flame } from "lucide-react";

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  // Main menu items
  const menuItems = [
    { id: "profile", label: "Profile", icon: <UserIcon size={20} />, path: "/profile" },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  // Bottom menu
  const bottomMenuItems = [
    { id: "logout", label: "Logout", icon: <LogOut size={20} />, action: onLogout },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full hidden md:flex">
      <div className="p-4 flex items-center gap-3">
        <Flame className="h-8 w-8 text-red-500" />
        <span className="text-xl font-bold">FireDept MS</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs uppercase text-gray-400 font-semibold">
          Main
        </div>
        <nav className="mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                location.pathname.startsWith(item.path)
                  ? "bg-red-700 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-700 py-2 mt-auto">
        {bottomMenuItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
            onClick={item.action}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
