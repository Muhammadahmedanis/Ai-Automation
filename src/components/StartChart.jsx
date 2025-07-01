import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function StatsChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const data = [
    { name: "No's. Dialed", value: 200, color: "#7a858b" },
    { name: "Emails sent", value: 1200, color: "#4285f4" },
    { name: "Replied", value: 520, color: "#fb8805" },
    { name: "Calls Clicked", value: 30, color: "#1baf6b" },
    { name: "Opened", value: 600, color: "#9747ff" },
    { name: "Opportunities", value: 10, color: "#fbbc05" },
  ];

  const centerStats = {
    totalReplies: 2,
    totalInteractions: data.reduce((sum, item) => sum + item.value, 0),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span
              className="font-semibold"
              style={{ color: data.payload.color }}
            >
              {data.value.toLocaleString()}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        className={`relative transition-all duration-500 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
                onMouseEnter={onPieEnter}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? "#fff" : "none"}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{
                      transform:
                        activeIndex === index ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "center",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center Content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">
            {centerStats.totalReplies}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium">
            Replies
          </div>
          <div className="text-xs text-gray-400 mt-1">
            of {centerStats.totalInteractions.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
              activeIndex === index
                ? "border-gray-300 bg-gray-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="text-lg sm:text-2xl font-bold text-gray-800">
                  {item.value.toLocaleString()}
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600 text-center leading-tight font-medium">
                {item.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsChart;
