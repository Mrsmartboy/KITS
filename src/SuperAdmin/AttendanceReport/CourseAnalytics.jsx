import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  { name: "Core Java", value: 35, color: "#0088FE" },
  { name: "Python", value: 30, color: "#00C49F" },
  { name: "Frontend", value: 25, color: "#FFBB28" },
  { name: "Flask", value: 20, color: "#FF8042" },
  { name: "Soft Skills", value: 15, color: "#8884D8" },
  { name: "Advanced Java", value: 10, color: "#82CA9D" },
];

const CourseAnalytics = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Course Distribution</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CourseAnalytics;
