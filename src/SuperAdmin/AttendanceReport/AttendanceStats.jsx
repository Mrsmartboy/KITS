import React from "react";
import { Users, BookOpen, Clock, AlertCircle } from "lucide-react";

const AttendanceStats = () => {
  const stats = [
    {
      title: "Total Students",
      value: "150",
      icon: Users,
      change: "+12.5%",
      changeType: "positive",
      bgGradient: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Courses",
      value: "6",
      icon: BookOpen,
      change: "0%",
      changeType: "neutral",
      bgGradient: "from-green-50 to-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Average Attendance",
      value: "85%",
      icon: Clock,
      change: "+5.2%",
      changeType: "positive",
      bgGradient: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Absence Rate",
      value: "15%",
      icon: AlertCircle,
      change: "-2.3%",
      changeType: "negative",
      bgGradient: "from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="flex justify-center py-8 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full px-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 bg-gradient-to-br ${stat.bgGradient}`}
          >
            <div className="flex items-center">
              <div
                className={`p-4 rounded-lg bg-white/80 ${stat.iconColor}`}
              >
                <stat.icon className="h-10 w-10" />
              </div>
              <div className="ml-4">
                <p className="text-sm md:text-base font-medium text-gray-600">
                  {stat.title}
                </p>
                <div className="flex items-baseline mt-2">
                  <p className="text-xl md:text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <span
                    className={`ml-2 text-sm md:text-base font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceStats;
