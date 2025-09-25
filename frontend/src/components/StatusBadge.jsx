import React from "react";

const StatusBadge = ({ status }) => {
	const getStatusStyles = () => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "under-review":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};
	const getStatusLabel = () => {
		return status
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};
	return (
		<span
			className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
		>
			{getStatusLabel()}
		</span>
	);
};

export default StatusBadge;
