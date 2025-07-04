import { useState } from "react";
import { useAnalyticsQuery } from "../reactQuery/hooks/useAnalyticsQuery";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Share2, ChevronDown, Zap, Eye, Hand, CircleCheck, CircleDollarSign, Play, Pause, Calendar1 } from "lucide-react";



const listItems = [
  { name: "All Statuses", icon: "⚡" },
  { name: "Play", icon: <Play size={20} className="text-blue-400" /> },
  { name: "Paused", icon: <Pause size={20} className="text-orange-400" /> },
  { name: "Completed", icon: <CircleCheck size={20} className="text-green-400" /> }
];


function Analytics() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("week");
  
  const { AnalyticsMonthly, AnalyticsQuaterly, AnalyticsYearly } = useAnalyticsQuery()

  const box = [
    { amount: `${Math.round( AnalyticsYearly?.Statistics?.OpenRate) || Math.round(AnalyticsQuaterly?.Statistics?.OpenRate) || Math.round(AnalyticsMonthly?.Statistics?.OpenRate) || 0 }%`, icon: <Eye size={24} className="text-purple-500" />, text: "Open rate", bg: "bg-purple-100" },
    { amount: `${AnalyticsYearly?.Statistics?.ClickRate || AnalyticsYearly?.Statistics?.ClickRate || AnalyticsYearly?.Statistics?.ClickRate || 0 }%`, icon: <Hand size={24} className="text-pink-500" />, text: "Click rate", bg: "bg-pink-100" },
    { amount: AnalyticsYearly?.Statistics?.SequenceStarted || AnalyticsMonthly?.Statistics?.SequenceStarted || AnalyticsQuaterly?.Statistics?.SequenceStarted || 0, icon: <Zap size={24} className="text-blue-500" />, text: "Sequence started", bg: "bg-blue-100" },
    { amount: AnalyticsYearly?.Statistics?.Opportunities || AnalyticsMonthly?.Statistics?.Opportunities || AnalyticsQuaterly?.Statistics?.Opportunities || 0, icon: <CircleDollarSign size={24} className="text-red-500" />, text: "Opportunities", bg: "bg-red-100" },
    { amount: AnalyticsYearly?.Statistics?.Conversions || AnalyticsMonthly?.Statistics?.Conversions || AnalyticsQuaterly?.Statistics?.Conversions || 0, icon: <CircleDollarSign size={24} className="text-yellow-500" />, text: "Conversion", bg: "bg-yellow-100" },
  ];

    const monthMap = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const yearlyChartData = AnalyticsYearly?.Statistics?.Graph?.map((item) => ({
      name: monthMap[item.Month-1],
      sent: item?.Delivered,
      opens: item?.Opens,
      clicks: item?.Clicks,
    })) || []


    const quarterMap = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"];
    const quarterlyChartData = AnalyticsQuaterly?.Statistics?.Graph.map((item) => ({
      name: quarterMap[item.Quarter-1],
      sent: item?.Delivered,
      opens: item?.Opens,
      clicks: item?.Clicks,
    })) || []


    const monthlyData = AnalyticsMonthly?.Statistics?.Graph || [];
    const getWeeklyGroupedData = () => {
      const weeks = [[], [], [], [], []]; // 5 weeks max
      monthlyData.forEach((item) => {
        const weekIndex = Math.floor((item.Date - 1) / 7);
        if (weekIndex < weeks.length) weeks[weekIndex].push(item);
      });

      const monthName = new Date().toLocaleString("default", { month: "short" }); // E.g., "Jul"

      return weeks.map((week, index) => {
        if (week.length === 0) return null;

        const startDate = week[0].Date;
        const endDate = week[week.length - 1].Date;
        const name = `${monthName} ${startDate}–${endDate}`;

        const sent = week.reduce((sum, i) => sum + i.Delivered, 0);
        const opens = week.reduce((sum, i) => sum + i.Opens, 0);
        const clicks = week.reduce((sum, i) => sum + i.Clicks, 0);

        return { name, sent, opens, clicks };
      }).filter(Boolean);
    };



    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen sm:px-8 md:px-16 lg:px-32 ">
            {/* Filter Buttons */}
            <div className="flex justify-center md:justify-between items-center gap-4">
                <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                <button
                  className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-all duration-300 font-medium ${
                    selectedView === "week"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedView("week")}>
                  Weekly <Calendar1 />
                </button>
                <button
                  className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-all duration-300 font-medium ${
                    selectedView === "year"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedView("year")}
                >
                  Yearly <Calendar1 />
                </button>
                 <button
                  className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-all duration-300 font-medium ${
                    selectedView === "quarter"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedView("quarter")}
                >
                  Quarterly <Calendar1 />
                </button>
              </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button className="flex items-center gap-2 text-gray-600 border border-gray-300 py-2 px-4 rounded-full md:text-md text-sm">
                        <Share2 className="md:h-4 md:w-4 w-3 h-3" />
                        Share
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-full flex gap-1 items-center text-sm md:text-md"
                        >
                            All Statuses <ChevronDown className="md:h-auto h-5" />
                        </button>
                        {isOpen && (
                            <div className="absolute z-10 mt-2 bg-white shadow-md w-44 rounded-lg">
                                <ul className="py-2 text-sm text-gray-700">
                                    {listItems.map((val, index) => (
                                        <li key={index} className="px-4 py-2 flex gap-2 items-center hover:bg-gray-100">
                                            {val.icon} {val.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {box.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg px-4 py-6 flex items-center gap-3 bg-white">
                        <div className={`p-3 rounded-full ${item.bg}`}>{item.icon}</div>
                        <div>
                            <div className="text-2xl font-bold">{item.amount}</div>
                            <div className="text-sm text-gray-500">{item.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
          <div className="bg-white shadow-xl rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Campaign Performance</h2>

            <div className="h-[320px] md:h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    selectedView === "week" ? 
                    getWeeklyGroupedData() : 
                    selectedView === "quarter" ? 
                    quarterlyChartData : 
                    yearlyChartData
                  }
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="0" stroke="#cbd5e1" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fontSize: 13 }}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    interval={0}
                    tickCount={8}
                    stroke="#94a3b8"
                    tick={{ fontSize: 13 }}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
                      padding: "10px 12px",
                    }}
                    labelStyle={{ fontWeight: 600 }}
                    itemStyle={{ fontSize: 13 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ top: 0, right: 0, fontSize: "13px" }}
                  />

                  {/* Chart Lines */}
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#ec4899"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="#f87171"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    );
}

export default Analytics;