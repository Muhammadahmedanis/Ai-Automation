import { useState, useEffect } from "react";
import {
  Bell,
  ChartSpline,
  ClipboardList,
  MoveUpRight,
  Plus,
  Ratio,
  Search,
  UsersRound,
  X,
  Calendar,
  Clock3,
  FileText,
  TrendingUp,
  Activity,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import LiveFeed from "../components/LiveFeed";
import TaskList from "../components/TaskList";
import StatsChart from "../components/StartChart";
import TopPeople from "../components/ToPeople";
import { RiEditCircleLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import widget from "../assets/widget.png";
import { useAnalyticsQuery } from "../reactQuery/hooks/useAnalyticsQuery";

export default function DashboardPage() {
  const [selectedView, setSelectedView] = useState("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch dashboard summary data
  const { dashboardSummary, isDashboardLoading, dashboardError } =
    useAnalyticsQuery();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="pl-2 sm:pl-4 md:pl-[20px] bg-gradient-to-br from-[rgb(251,251,251)] to-[rgb(245,250,255)] min-h-screen">
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-2 sm:p-4 md:p-6 max-w-full">
          {/* Enhanced Header Section */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live Dashboard</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {getGreeting()}, Beetoo 👋🏻
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Track your activities, leads, analytics, and more •{" "}
                {currentTime.toLocaleDateString()}
              </p>
              <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    +12% this week
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    24 active campaigns
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-teal-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#16C47F] hover:bg-[#FF9D23] rounded-full px-4 sm:px-6 py-2.5 text-white cursor-pointer text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Ratio className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline font-medium">Add widget</span>
                {/* <span className="sm:hidden font-medium">Add</span> */}
              </button>
            </div>
          </div>

          {/* Enhanced Add Widget Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 top-0 flex items-center justify-center bg-[#3231318f] bg-opacity-60 z-50 p-4 backdrop-blur-sm">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Add Widget
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a widget to add to your dashboard
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 mt-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Search className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                      type="search"
                      className="block w-full px-4 outline-none py-3 pl-12 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Search widgets..."
                    />
                  </div>
                </div>

                <div className="h-[60vh] overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      {
                        icon: (
                          <ChartSpline className="text-teal-600" size={24} />
                        ),
                        title: "Analytics Dashboard",
                        description:
                          "Comprehensive analytics with charts and metrics",
                        category: "Analytics",
                      },
                      {
                        icon: <Bell className="text-orange-500" size={24} />,
                        title: "Live Activity Feed",
                        description: "Real-time updates on user interactions",
                        category: "Notifications",
                      },
                      {
                        icon: (
                          <ClipboardList
                            className="text-purple-600"
                            size={24}
                          />
                        ),
                        title: "Task Manager",
                        description: "Organize and track your daily tasks",
                        category: "Productivity",
                      },
                      {
                        icon: (
                          <UsersRound className="text-blue-500" size={24} />
                        ),
                        title: "Top Performers",
                        description: "Track your best leads and contacts",
                        category: "CRM",
                      },
                      {
                        icon: <Target className="text-green-600" size={24} />,
                        title: "Goal Tracker",
                        description: "Monitor your progress towards targets",
                        category: "Goals",
                      },
                      {
                        icon: <Activity className="text-red-500" size={24} />,
                        title: "System Monitor",
                        description: "Track system performance and health",
                        category: "Monitoring",
                      },
                    ].map((widgetItem, index) => (
                      <div
                        key={index}
                        className="group border border-gray-200 p-5 rounded-xl shadow-sm bg-white hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      >
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl mb-4 group-hover:from-green-50 group-hover:to-blue-50 transition-all duration-300">
                          <img
                            src={widget}
                            className="w-full h-32 sm:h-36 bg-white border border-gray-200 rounded-lg object-cover"
                            alt="Widget Preview"
                          />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          {widgetItem.icon}
                          <div>
                            <h4 className="font-semibold text-gray-800 group-hover:text-gray-900">
                              {widgetItem.title}
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {widgetItem.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {widgetItem.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Metrics Section */}
          <div className="mb-6 sm:mb-8 grid gap-4 sm:gap-6 p-2 sm:p-4 md:p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {isDashboardLoading ? (
              // Loading state for metrics
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 border rounded-xl shadow-lg bg-white"
                >
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                </div>
              ))
            ) : dashboardError ? (
              // Error state for metrics
              <div className="col-span-full p-4 sm:p-6 border border-red-200 rounded-xl shadow-lg bg-red-50">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Failed to load metrics
                  </span>
                </div>
              </div>
            ) : (
              // Success state with actual data
              <>
                <MetricCard
                  icon="mail"
                  label="Active emails"
                  value={
                    dashboardSummary?.Details?.ActiveEmails?.toString() || "0"
                  }
                  iconColor="text-[#6ca1f7]"
                  bgColor="bg-[#ecf3fe]"
                  trend="+8%"
                  trendDirection="up"
                />
                <MetricCard
                  icon="users"
                  label="People Reached"
                  value={
                    dashboardSummary?.Details?.PeopleReached?.toLocaleString() ||
                    "0"
                  }
                  iconColor="text-[#fcbd75]"
                  bgColor="bg-[#fff3e6]"
                  trend="+12%"
                  trendDirection="up"
                />
                <MetricCard
                  icon="calendar"
                  label="Conversions"
                  value={
                    dashboardSummary?.Details?.Conversions?.toString() || "0"
                  }
                  iconColor="text-[#34a853]"
                  bgColor="bg-[#ebf6ee]"
                  trend="+24%"
                  trendDirection="up"
                />
                <MetricCard
                  icon="briefcase"
                  label="Opportunities"
                  value={
                    dashboardSummary?.Details?.Opportunities?.toString() || "0"
                  }
                  iconColor="text-[#ae70ff]"
                  bgColor="bg-[#f5edff]"
                  trend="+15%"
                  trendDirection="up"
                />
              </>
            )}
          </div>

          {/* Enhanced Dashboard Grid */}
          <div className="grid gap-4 sm:gap-6 p-2 sm:p-4 md:p-6 grid-cols-1 lg:grid-cols-3">
            {/* Live Feed Section */}
            <div className="p-4 sm:p-6 border-none rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base sm:text-lg text-gray-800">
                  Live Feed
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Real-time</span>
                </div>
              </div>
              <LiveFeed />
            </div>

            {/* Stats Section */}
            <div className="p-4 sm:p-6 border-none rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-base sm:text-lg text-gray-800">
                  Analytics Overview
                </h3>
                <Link
                  to="/analytics"
                  className="group flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 transition-colors"
                >
                  <span>View All</span>
                  <MoveUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="w-fit mx-auto rounded-xl bg-gray-100 p-1 mb-6">
                <button
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-all duration-300 font-medium ${
                    selectedView === "month"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedView("month")}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-all duration-300 font-medium ${
                    selectedView === "week"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedView("week")}
                >
                  Weekly
                </button>
              </div>
              <StatsChart />
            </div>

            {/* Tasks Section */}
            <div className="p-4 sm:p-5 md:p-6 border-none rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800">
                    Tasks
                  </h3>
                  <span className="rounded-full bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 text-xs text-orange-700 font-semibold border border-orange-200">
                    5 New
                  </span>
                </div>
                <button
                  onClick={() => setIsPlusModalOpen(true)}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-teal-100 hover:to-teal-200 rounded-xl p-2 cursor-pointer transition-all duration-300 hover:scale-110 group"
                >
                  <Plus className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
                </button>
              </div>
              <div className="min-h-[300px] sm:min-h-[400px] overflow-y-auto">
                <TaskList />
              </div>
            </div>
          </div>

          {/* Enhanced Add Task Modal */}
          {isPlusModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#3231318f] bg-opacity-60 z-50 p-4 backdrop-blur-sm">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-[600px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Create New Task
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add a new task to your workflow
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPlusModalOpen(false)}
                    className="text-gray-400 curaor-pointer hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form className="space-y-6 mt-6">
                  <div>
                    <div className="flex gap-2 items-center mb-3">
                      <RiEditCircleLine size={20} className="text-teal-600" />
                      <label className="block text-sm font-semibold text-gray-700">
                        Task Title
                      </label>
                    </div>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:bg-[#f8fffe] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <div className="flex gap-2 items-center mb-3">
                      <FileText size={20} className="text-teal-600" />
                      <label className="block text-sm font-semibold text-gray-700">
                        Description
                      </label>
                    </div>
                    <textarea
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:bg-[#f8fffe] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm resize-none"
                      placeholder="Describe the task in detail..."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex gap-2 items-center mb-3">
                        <Calendar size={20} className="text-teal-600" />
                        <label className="block text-sm font-semibold text-gray-700">
                          Due Date
                        </label>
                      </div>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:bg-[#f8fffe] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex gap-2 items-center mb-3">
                        <Clock3 size={20} className="text-teal-600" />
                        <label className="block text-sm font-semibold text-gray-700">
                          Time
                        </label>
                      </div>
                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:bg-[#f8fffe] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Priority Level
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-xl focus:bg-[#f8fffe] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm">
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Assign to Person
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:bg-[#f8fffe] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                        placeholder="Enter assignee name..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsPlusModalOpen(false)}
                      type="button"
                      className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 font-medium rounded-xl text-sm hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsPlusModalOpen(false)}
                      type="button"
                      className="w-full sm:w-auto px-6 py-3 text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none font-medium rounded-xl text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <FileText size={16} />
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Enhanced Top People Section */}
          <div className="mt-6 sm:mt-8 border-none rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <TopPeople />
          </div>
        </main>
      </div>
    </div>
  );
}
