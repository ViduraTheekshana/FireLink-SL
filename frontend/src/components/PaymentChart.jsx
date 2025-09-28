import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const PaymentChart = ({ applications }) => {
  const paid = applications.filter((a) => a.payment).length;
  const unpaid = applications.length - paid;

  const data = [
    { name: "Paid", value: paid },
    { name: "Unpaid", value: unpaid },
  ];

  const COLORS = ["#28a745", "#dc3545"];

  return (
    <PieChart width={300} height={250}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
      >
        {data.map((entry, index) => (
          <Cell key={index} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default PaymentChart;
