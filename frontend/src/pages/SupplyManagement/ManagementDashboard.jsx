import React, { useState } from "react";
import { Sidebar } from "../../components/SideBar";
import { Header } from "../../components/Header";
import { SupplierManagement } from "./SupplierManagement";
import { SupplyRequests } from "./SupplyRequests";
export function ManagementDashboard() {
	const [activeTab, setActiveTab] = useState("suppliers");
	const [searchQuery, setSearchQuery] = useState("");
	return (

	);
}
