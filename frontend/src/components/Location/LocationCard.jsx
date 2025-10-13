import React from "react";
import { MapPinIcon, PhoneIcon } from "lucide-react";

export function LocationCard({ station }) {
	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
			<div className="p-6 flex flex-col h-full">
				<h3 className="text-[#C62828] text-xl font-bold mb-3">
					{station.name}
				</h3>
				<div className="flex items-start mb-2 text-gray-700">
					<MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0 text-[#C62828]" />
					<span>{station.address}</span>
				</div>
				<div className="flex items-center text-gray-600 mt-auto">
					<PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0 text-[#C62828]" />
					<span>{station.phone}</span>
				</div>
			</div>
			<div className="bg-[#1E2A38] text-white py-2 px-4 text-center hover:bg-[#FF9800] transition-colors duration-300 cursor-pointer">
				View Details
			</div>
		</div>
	);
}
