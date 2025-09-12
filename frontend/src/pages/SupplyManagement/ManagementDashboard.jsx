import React, { useState } from "react";
import { Sidebar } from "../../components/SideBar";
import { Header } from "../../components/Header";
import { SupplierManagement } from "./SupplierManagement";
// import { SupplierRequests } from "./Requests/SupplierRequests";
// import { InventoryRequests } from "./Requests/InventoryRequests";
// import { StaffRequests } from "./Requests/StaffRequests";
export function ManagementDashboard() {
	const [activeTab, setActiveTab] = useState("suppliers");
	const [searchQuery, setSearchQuery] = useState("");
	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<div className="flex flex-col flex-1 overflow-hidden">
				<Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					{activeTab === "suppliers" && (
						<SupplierManagement searchQuery={searchQuery} />
					)}
					{activeTab === "supplierRequests" && (
						<SupplierRequests searchQuery={searchQuery} />
					)}
					{activeTab === "inventoryRequests" && (
						<InventoryRequests searchQuery={searchQuery} />
					)}
					{activeTab === "staffRequests" && (
						<StaffRequests searchQuery={searchQuery} />
					)}
				</main>
			</div>
		</div>
	);
}
