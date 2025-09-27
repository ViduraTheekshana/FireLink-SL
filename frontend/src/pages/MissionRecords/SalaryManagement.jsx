import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SalaryManagement.css";
import { salaryService } from "../../services/salaryService";
import axios from "axios";

const initialForm = {
	employeeName: "",
	totalWorkingDays: 30,
	daysPresent: 0,
	daysAbsent: 0,
	basicSalary: 0,
	perDaySalary: 0,
	otHours: 0,
	finalSalary: 0,
};

const SalaryManagement = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState(initialForm);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [userId, setUserId] = useState("");
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);

	const perHourRate = useMemo(() => {
		const perDay = Number(form.perDaySalary) || 0;
		return perDay / 8;
	}, [form.perDaySalary]);

	useEffect(() => {
		const totalDays = Math.max(0, Number(form.totalWorkingDays) || 0);
		const present = Math.max(0, Math.min(Number(form.daysPresent) || 0, totalDays));
		const absent = Math.max(0, Number(form.daysAbsent) || 0);
		const basic = Math.max(0, Number(form.basicSalary) || 0);
		const calculatedPerDay = totalDays > 0 ? basic / totalDays : 0;
		const otHrs = Math.max(0, Number(form.otHours) || 0);
		const finalSal = calculatedPerDay * present + perHourRate * otHrs;
		setForm((prev) => ({
			...prev,
			perDaySalary: Number.isFinite(calculatedPerDay) ? Number(calculatedPerDay.toFixed(2)) : 0,
			finalSalary: Number.isFinite(finalSal) ? Number(finalSal.toFixed(2)) : 0,
			daysPresent: present,
			daysAbsent: absent,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.totalWorkingDays, form.daysPresent, form.daysAbsent, form.basicSalary, form.otHours]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setError("");
				const token = localStorage.getItem("fire_access_token");
				const res = await axios.get("http://localhost:5000/users", {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
					withCredentials: true,
				});
				const data = res.data?.users || res.data?.data || [];
				setUsers(Array.isArray(data) ? data : []);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to load users");
			}
		};
		fetchUsers();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: name === "employeeName" ? value : value === "" ? "" : Number(value),
		}));
	};

	const onSelectUser = (e) => {
		const id = e.target.value;
		setUserId(id);
		const user = users.find((u) => (u._id || u.id) === id) || null;
		setSelectedUser(user);
		if (user?.name) {
			setForm((prev) => ({ ...prev, employeeName: user.name }));
		} else if (user?.gmail) {
			setForm((prev) => ({ ...prev, employeeName: user.gmail }));
		}
	};

	const resetForm = () => {
		setError("");
		setForm(initialForm);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			setError("");
			if (!form.employeeName.trim()) {
				throw new Error("Employee name is required");
			}
			if (!form.totalWorkingDays || form.totalWorkingDays <= 0) {
				throw new Error("Total working days must be greater than 0");
			}
			if (form.daysPresent > form.totalWorkingDays) {
				throw new Error("Days present cannot exceed total working days");
			}
			const payload = {
				employeeName: form.employeeName,
				totalWorkingDays: form.totalWorkingDays,
				daysPresent: form.daysPresent,
				daysAbsent: form.daysAbsent,
				title: "salary",
				basicSalary: form.basicSalary,
				perDaySalary: form.perDaySalary,
				otHours: form.otHours,
				finalSalary: form.finalSalary,
			};
			await salaryService.create(payload);
			alert("Salary saved successfully!");
			resetForm();
		} catch (err) {
			setError(err.message || "Failed to save salary");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="salary-container">
			<div className="salary-header">
				<h1 className="title">Salary Management</h1>
				<p className="subtitle">Calculate and manage monthly salaries.</p>
			</div>

			<div className="actions">
				<button className="btn btn-secondary" onClick={() => navigate("/mission-records")}>Go to Mission Records</button>
			</div>

			<div className="card">
				<div className="card-header">Salary Details</div>
				<div className="card-body">
					{error && <div className="alert alert-error">{error}</div>}
					<form onSubmit={handleSubmit} className="form-grid">
						<div className="form-group" style={{ gridColumn: "span 2 / span 2" }}>
							<label>Select User (from database)</label>
							<select value={userId} onChange={onSelectUser}>
								<option value="">-- Select User --</option>
								{users.map((u) => (
									<option key={u._id || u.id} value={u._id || u.id}>
										{u.name || u.gmail || (u.staffId ? `Staff ${u.staffId}` : "Unnamed")}
									</option>
								))}
							</select>
						</div>
						<div className="form-group">
							<label>Employee Name</label>
							<input name="employeeName" value={form.employeeName} onChange={handleChange} placeholder="Enter name" />
						</div>

						<div className="form-group">
							<label>Total working days in month</label>
							<input type="number" min={0} name="totalWorkingDays" value={form.totalWorkingDays} onChange={handleChange} />
						</div>
						<div className="form-group">
							<label>Days present</label>
							<input type="number" min={0} name="daysPresent" value={form.daysPresent} onChange={handleChange} />
						</div>
						<div className="form-group">
							<label>Days absent</label>
							<input type="number" min={0} name="daysAbsent" value={form.daysAbsent} onChange={handleChange} />
						</div>

						<div className="section-title">Salary</div>
						<div className="form-group">
							<label>Basic salary</label>
							<input type="number" min={0} name="basicSalary" value={form.basicSalary} onChange={handleChange} />
						</div>
						<div className="form-group">
							<label>Per day salary</label>
							<input type="number" name="perDaySalary" value={form.perDaySalary} readOnly />
						</div>
						<div className="form-group">
							<label>OT hours</label>
							<input type="number" min={0} name="otHours" value={form.otHours} onChange={handleChange} />
							<div className="hint">OT rate uses per-hour = per-day / 8</div>
						</div>
						<div className="form-group">
							<label>Final salary</label>
							<input type="number" name="finalSalary" value={form.finalSalary} readOnly />
						</div>

						<div className="form-actions">
							<button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
							<button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
						</div>
					</form>
				</div>
			</div>

			{/* Display details after submit */}
			{!submitting && selectedUser && (
				<div className="card" style={{ marginTop: 16 }}>
					<div className="card-header">Submitted Details</div>
					<div className="card-body">
						<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
							<div><strong>Employee:</strong> {selectedUser.name || selectedUser.gmail || "N/A"}</div>
							<div><strong>Total Days:</strong> {form.totalWorkingDays}</div>
							<div><strong>Present:</strong> {form.daysPresent}</div>
							<div><strong>Absent:</strong> {form.daysAbsent}</div>
							<div><strong>Basic Salary:</strong> {form.basicSalary}</div>
							<div><strong>Per Day:</strong> {form.perDaySalary}</div>
							<div><strong>OT Hours:</strong> {form.otHours}</div>
							<div><strong>Final Salary:</strong> {form.finalSalary}</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SalaryManagement;


