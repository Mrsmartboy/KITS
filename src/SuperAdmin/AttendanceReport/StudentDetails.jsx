import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const StudentDetails = ({ student }) => {
  if (!student) return null;

  // Mock attendance history data for the selected student
  const attendanceHistory = [
    { month: "Jan", status: "Present" },
    { month: "Feb", status: "Present" },
    { month: "Mar", status: "Absent" },
    { month: "Apr", status: "Present" },
    { month: "May", status: "Late" },
    { month: "Jun", status: "Present" },
  ];

  // Mock weekly attendance data
  const weeklyAttendance = [
    { week: "Week 1", present: 4, absent: 1 },
    { week: "Week 2", present: 5, absent: 0 },
    { week: "Week 3", present: 3, absent: 2 },
    { week: "Week 4", present: 4, absent: 1 },
  ];

  const attendanceStats = {
    present: attendanceHistory.filter((h) => h.status === "Present").length,
    absent: attendanceHistory.filter((h) => h.status === "Absent").length,
    late: attendanceHistory.filter((h) => h.status === "Late").length,
  };

  const pieData = [
    { name: "Present", value: attendanceStats.present, color: "#10B981" },
    { name: "Absent", value: attendanceStats.absent, color: "#EF4444" },
    { name: "Late", value: attendanceStats.late, color: "#F59E0B" },
  ];

  const lineData = attendanceHistory.map((record) => ({
    month: record.month,
    value: record.status === "Present" ? 100 : record.status === "Late" ? 50 : 0,
  }));

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
        <p className="text-gray-500">Student ID: {student.id}</p>
        <p className="text-gray-500">Course: {student.course}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Attendance Distribution</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Attendance Trend</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4">Weekly Attendance</h4>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAttendance}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10B981" name="Present Days" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2">Remarks</h4>
        <p className="text-gray-700">{student.remarks}</p>
      </div>
    </div>
  );
};

export default StudentDetails;
