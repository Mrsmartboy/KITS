import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", attendance: 88, absences: 12 },
  { month: "Feb", attendance: 85, absences: 15 },
  { month: "Mar", attendance: 90, absences: 10 },
  { month: "Apr", attendance: 87, absences: 13 },
  { month: "May", attendance: 92, absences: 8 },
  { month: "Jun", attendance: 89, absences: 11 },
];

const AttendanceTrends = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Attendance Trends</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#0088FE"
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="absences"
              stroke="#FF8042"
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceTrends;
