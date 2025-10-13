import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";

// Optional: register a clean sans-serif font (If using custom fonts, ensure the path is correct)
Font.register({
	family: "Helvetica",
	src: "https://fonts.gstatic.com/s/helvetica/v6/ARIAL.TTF",
});

// Define styles
const styles = StyleSheet.create({
	page: {
		padding: 30,
		fontFamily: "Helvetica",
		fontSize: 10,
		lineHeight: 1.5,
		backgroundColor: "#f8f8f8",
	},
	// --- Header Section Styles (Two-Column Layout) ---
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingBottom: 10,
		// FIX: Added 'pt' unit
		borderBottomWidth: "2pt",
		borderBottomColor: "#D90429", // Red accent color
		marginBottom: 15,
	},
	companyInfo: {
		width: "65%",
	},
	companyTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#D90429", // FireLink SL
	},
	contactText: {
		fontSize: 8,
		color: "#555",
		marginTop: 2,
	},
	generatedInfo: {
		width: "35%",
		textAlign: "right",
	},
	generatedText: {
		fontSize: 8,
		color: "#555",
		marginTop: 4,
	},
	// --- Body Styles ---
	title: {
		fontSize: 20,
		textAlign: "center",
		fontWeight: "bold",
		marginBottom: 15,
	},
	// --- Table Styles ---
	table: {
		display: "table",
		width: "auto",
		borderStyle: "solid",
		// FIX: Added 'pt' unit
		borderWidth: "1pt",
		borderColor: "#ccc",
		borderCollapse: "collapse",
		marginBottom: 10,
	},
	tableRow: {
		flexDirection: "row",
		// FIX: Added 'pt' unit
		borderTopWidth: "1pt",
		borderTopColor: "#ccc",
	},
	tableHeader: {
		backgroundColor: "#EF4444",
		color: "#fff",
		borderTopWidth: 0,
	},
	tableCell: {
		width: "20%",
		padding: 6,
		borderStyle: "solid",
		borderColor: "#ccc",
		// FIX: Added 'pt' unit
		borderRightWidth: "1pt",
		borderBottomWidth: 0,
		fontWeight: "normal",
		textAlign: "left",
	},
	tableCellHeader: {
		fontWeight: "bold",
		textAlign: "left",
	},
	tableCellAmount: {
		textAlign: "right",
	},
	// --- Footer Styles ---
	totalContainer: {
		marginTop: 10,
		alignSelf: "flex-end",
		padding: 8,
		backgroundColor: "#fff",
		// FIX: Added 'pt' unit
		borderWidth: "1pt",
		borderColor: "#D90429",
		borderRadius: 3,
	},
	totalText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#D90429",
	},
	signatureBlock: {
		marginTop: 50,
		alignSelf: "flex-end",
		width: 150,
		// FIX: Added 'pt' unit
		borderTopWidth: "1pt",
		borderTopColor: "#000",
		paddingTop: 5,
		textAlign: "left",
	},
	pageFooter: {
		position: "absolute",
		bottom: 15,
		left: 30,
		right: 30,
		textAlign: "center",
		fontSize: 8,
		color: "#888",
	},
});

// Helper function for date formatting
const formatDate = (date) => {
	try {
		return new Date(date).toLocaleDateString("en-GB");
	} catch {
		return date;
	}
};

// PDF Component
export const ExpensePdfDocument = ({ expenses = [] }) => {
	const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
	const generatedDate = formatDate(new Date());

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* --- Header Section (Two-Column) --- */}
				{/* Ensure all text here is ONLY within <Text> components */}
				<View style={styles.headerContainer} fixed>
					<View style={styles.companyInfo}>
						<Text style={styles.companyTitle}>FireLink SL</Text>
						<Text style={styles.contactText}>
							Main Fire Station (Head Quarters), T.B. Jaya Mawatha
						</Text>
						<Text style={styles.contactText}>Colombo 10, Sri Lanka.</Text>
						<Text style={styles.contactText}>Contact: (+94) 11-1234567</Text>
					</View>
					<View style={styles.generatedInfo}>
						<Text style={styles.generatedText}>
							Generated on: {generatedDate}
						</Text>
					</View>
				</View>

				{/* --- Title --- */}
				<Text style={styles.title}>EXPENSES</Text>

				{/* --- Table --- */}
				<View style={styles.table}>
					{/* Table Header */}
					<View style={[styles.tableRow, styles.tableHeader]} fixed>
						<Text style={[styles.tableCell, styles.tableCellHeader]}>ID</Text>
						<Text style={[styles.tableCell, styles.tableCellHeader]}>Date</Text>
						<Text style={[styles.tableCell, styles.tableCellHeader]}>Type</Text>
						<Text style={[styles.tableCell, styles.tableCellHeader]}>
							Description
						</Text>
						<Text
							style={[
								styles.tableCell,
								styles.tableCellHeader,
								styles.tableCellAmount,
							]}
						>
							Amount
						</Text>
					</View>

					{/* Expense Rows */}
					{expenses.map((expense, index) => (
						<View key={index} style={styles.tableRow} wrap={false}>
							{/* FIX: Using 'id' property, which is standard for transaction IDs */}
							<Text style={styles.tableCell}>{expense.id}</Text>
							<Text style={styles.tableCell}>{formatDate(expense.date)}</Text>
							<Text style={styles.tableCell}>{expense.type}</Text>
							<Text style={styles.tableCell}>{expense.description}</Text>
							<Text style={[styles.tableCell, styles.tableCellAmount]}>
								LKR{" "}
								{expense.amount?.toLocaleString("en-IN", {
									minimumFractionDigits: 2,
								})}
							</Text>
						</View>
					))}
				</View>

				{/* --- Total --- */}
				<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
					<View style={styles.totalContainer}>
						<Text style={styles.totalText}>
							Total (LKR): LKR{" "}
							{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
						</Text>
					</View>
				</View>

				{/* --- Signature --- */}
				<View style={styles.signatureBlock}>
					<Text>Signature:</Text>
				</View>

				{/* --- Page Footer --- */}
				<Text
					style={styles.pageFooter}
					render={({ pageNumber, totalPages }) =>
						`Page ${pageNumber} of ${totalPages} | Generated by FireLink SL`
					}
					fixed
				/>
			</Page>
		</Document>
	);
};

export default ExpensePdfDocument;
