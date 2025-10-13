import React from "react";
import { HeroSection } from "../../components/Location/HeroSection";
import { StationList } from "../../components/Location/StationList";
import { MapSection } from "../../components/Location/MapSection";
export function LocationsPage() {
	const stations = [
		{
			id: 1,
			name: "CMC Fire Service Department",
			address: "T. B. Jayah Mawatha, Colombo 010",
			phone: "0112 422 222",
			coordinates: [6.923217, 79.862289],
		},
		{
			id: 2,
			name: "Negombo Fire and Rescue",
			address: "11500, Negambo Rd, Negombo",
			phone: "0312 224 063",
			coordinates: [7.20778, 79.8411],
		},
		{
			id: 3,
			name: "Kotte Fire Brigade",
			address: "181/A Nanayakkara Mawatha, Sri Jayawardenepura Kotte",
			phone: "0112 879 444",
			coordinates: [6.90215, 79.90915],
		},
		{
			id: 4,
			name: "Kandy Fire Brigade",
			address: "William Gopallawa Mawatha, Kandy",
			phone: "0812 204 844",
			coordinates: [7.29057, 80.6367],
		},
		{
			id: 5,
			name: "Gampaha Fire Service Department",
			address: "Pokuna Rd, Gampaha",
			phone: "0332 224 444",
			coordinates: [7.09478, 79.99508],
		},
		{
			id: 6,
			name: "Kalutara Fire Brigade",
			address: "HXP6+8JJ, Kalutara",
			phone: "0342 228 080",
			coordinates: [6.58586, 79.96154],
		},
		{
			id: 7,
			name: "Matara Fire & Rescue",
			address: "Municipal Council, 81000 Matara",
			phone: "0412 236 000",
			coordinates: [5.94948, 80.54465],
		},
		{
			id: 8,
			name: "Polonnaruwa Fire Brigade",
			address: "1st Canal Road, Polonnaruwa",
			phone: "0272 224 477",
			coordinates: [7.93319, 81.00106],
		},
		{
			id: 9,
			name: "Anuradhapura Fire Brigade",
			address: "8CG5+G43, Anuradhapura",
			phone: "0252 227 799",
			coordinates: [8.31136, 80.40365],
		},
		{
			id: 10,
			name: "Jaffna Fire Brigade",
			address: "AB20, Jaffna",
			phone: "0212 222 275",
			coordinates: [9.67387, 80.03329],
		},
		{
			id: 11,
			name: "Moratuwa Fire & Rescue",
			address: "Pieris Mawatha, Moratuwa",
			phone: "0112 645 454",
			coordinates: [6.77354, 79.88129],
		},
		{
			id: 12,
			name: "Bandarawela Fire & Rescue",
			address: "Bandarawela Municipal Council, Bandarawela",
			phone: "0573 131 313",
			coordinates: [6.82783, 80.99262],
		},
		{
			id: 13,
			name: "Badulla Fire Brigade",
			address: "King's Street, Badulla",
			phone: "0553 590 131",
			coordinates: [6.9895, 81.05505],
		},
		{
			id: 14,
			name: "Kurunegala Fire & Rescue",
			address: "Municipal Council, Kurunegala",
			phone: "0372 222 270",
			coordinates: [7.48183, 80.36135],
		},
		{
			id: 15,
			name: "Nuwara Eliya Fire & Rescue",
			address: "Nuwara Eliya-Uda Pussellawa Rd, Nuwara Eliya",
			phone: "0522 222 121",
			coordinates: [6.94972, 80.7891],
		},
		{
			id: 16,
			name: "Ampara Fire & Rescue",
			address: "Urban Council, Ampara",
			phone: "0632 223 997",
			coordinates: [7.2835, 81.67459],
		},
		{
			id: 17,
			name: "Trincomalee Fire & Rescue",
			address: "Main St, Trincomalee",
			phone: "0262 222 100",
			coordinates: [8.57113, 81.23213],
		},
		{
			id: 18,
			name: "Ratnapura Fire Brigade",
			address: "Sripada Mawatha, Ratnapura",
			phone: "0452 226 811",
			coordinates: [6.67866, 80.40315],
		},
		{
			id: 19,
			name: "Horana Fire & Rescue Unit",
			address: "Pola para, Horana",
			phone: "0342 267 555",
			coordinates: [6.71446, 80.06229],
		},
		{
			id: 20,
			name: "Chilaw Fire & Rescue",
			address: "Kurunegala, Chilaw - Wariyapola Rd, Chilaw",
			phone: "0322 220 055",
			coordinates: [7.57583, 79.79561],
		},
		{
			id: 21,
			name: "Kilinochchi Fire Service Division",
			address: "Kandy Rd, Kilinochchi",
			phone: "0212 283 333",
			coordinates: [9.39318, 80.40699],
		},
		{
			id: 22,
			name: "Mawanella Fire Service Division",
			address: "7F23+457, Mawanella",
			phone: "0354 927 828",
			coordinates: [7.25418, 80.44212],
		},
		{
			id: 23,
			name: "Dehiwala–Mount Lavinia Fire Station",
			address: "Galle Road, Dehiwala",
			phone: "0112 737 700",
			coordinates: [6.84059, 79.87838],
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<HeroSection />
			<StationList stations={stations} />
			<MapSection stations={stations} />
		</div>
	);
}
