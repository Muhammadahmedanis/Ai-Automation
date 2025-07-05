import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useAnalyticsQuery } from "../reactQuery/hooks/useAnalyticsQuery";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";

function StatsChart({ selectedView = "month" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const {
    statsMonthly,
    isStatsMonthlyLoading,
    statsMonthlyError,
    statsWeekly,
    isStatsWeeklyLoading,
    statsWeeklyError,
  } = useAnalyticsQuery();

  // Determine which data to use based on selectedView
  const isLoading =
    selectedView === "month" ? isStatsMonthlyLoading : isStatsWeeklyLoading;
  const error = selectedView === "month" ? statsMonthlyError : statsWeeklyError;
  const statsData = selectedView === "month" ? statsMonthly : statsWeekly;

  // Transform API data to chart format
  const data = statsData?.Details
    ? [
        {
          name: "Conversions",
          value: Number(statsData.Details.Conversions) || 0,
          color: "#7a858b",
        },
        {
          name: "Emails sent",
          value: Number(statsData.Details.EmailsSent) || 0,
          color: "#4285f4",
        },
        {
          name: "Replied",
          value: Number(statsData.Details.Replied) || 0,
          color: "#fb8805",
        },
        {
          name: "Clicked",
          value: Number(statsData.Details.Clicked) || 0,
          color: "#1baf6b",
        },
        {
          name: "Opened",
          value: Number(statsData.Details.Opened) || 0,
          color: "#9747ff",
        },
        {
          name: "Opportunities",
          value: Number(statsData.Details.Opportunities) || 0,
          color: "#fbbc05",
        },
      ]
    : [];

  const centerStats = {
    totalReplies: Number(statsData?.Details?.Replied) || 0,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-48 sm:h-56 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500 font-medium">
              Loading {selectedView === "month" ? "monthly" : "weekly"} stats...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-300"></div>
                  <div className="w-8 h-6 bg-gray-300 rounded"></div>
                </div>
                <div className="w-16 h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-48 sm:h-56 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Failed to load {selectedView === "month" ? "monthly" : "weekly"}{" "}
                stats
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Please check your connection and try again
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data.length || centerStats.totalInteractions === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-48 sm:h-56 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-full bg-gray-100">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                No {selectedView === "month" ? "monthly" : "weekly"} data
                available
              </p>
              <p className="text-xs text-gray-500">
                Data will appear here once you start your campaigns
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success indicator */}
      {statsData?.success && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">
              {selectedView === "month" ? "Monthly" : "Weekly"} data updated
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {centerStats.totalInteractions.toLocaleString()} total interactions
          </span>
        </div>
      )}

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
