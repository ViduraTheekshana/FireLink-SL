import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ProcurementPdfDocument } from "./ProcurementPdfDocument";

export function ProcurementReport() {
	const [requests, setRequests] = React.useState([
		// your processed mock data or API response
		{
			id: "a0a1",
			category: "Electronics",
			deliveredDate: "2025-09-01",
			supplierName: "Tech Solutions Inc.",
			price: 150000,
		},
		{
			id: "a0a2",
			category: "Office Supplies",
			deliveredDate: "2025-09-15",
			supplierName: "Paper & More",
			price: 15500,
		},
	]);

	return (
		<button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
			<PDFDownloadLink
				document={<ProcurementPdfDocument requests={requests} />}
				fileName={`procurement-report-${
					new Date().toISOString().split("T")[0]
				}.pdf`}
			>
				{({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
			</PDFDownloadLink>
		</button>
	);
}
