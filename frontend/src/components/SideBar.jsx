import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, ClipboardList, LogOut, Flame } from "lucide-react";
import { useAuth } from "../context/auth";
import Loader from "./Loader";

const Sidebar = () => {
	const { hasRole, logout, loading } = useAuth();
	const location = useLocation();

	let menuItems = [];
	let bottomMenuItems = [];

	const logoutHandler = (e) => {
		e.preventDefault();
		logout();
	};

	if (hasRole("supply_manager")) {
		menuItems = [
			{
				id: "suppliers",
				label: "Suppliers",
				icon: <Users size={20} />,
			},
			{
				id: "supply-requests",
				label: "Supply Requests",
				icon: <ClipboardList size={20} />,
			},
		];
	}
	bottomMenuItems = [
		{
			id: "logout",
			label: "Logout",
			icon: <LogOut size={20} />,
		},
	];

	if (loading) return <Loader />;

	return (
		<div className="w-64 bg-gray-900 text-white flex flex-col h-full hidden md:block">
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
							to={`/${item.id}`}
							className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
								location.pathname === `/${item.id}`
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
						onClick={item.id === "logout" ? logoutHandler : undefined}
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
