import { useState } from "react";
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
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import LiveFeed from "../components/LiveFeed";
import TaskList from "../components/TaskList";
import StatsChart from "../components/StartChart";
import TopPeople from "../components/ToPeople";
import { RiEditCircleLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import widget from "../assets/widget.png";

export default function DashboardPage() {
  const [selectedView, setSelectedView] = useState("month");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for first modal
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false); // State for second modal

  return (
    <div className="pl-2 sm:pl-4 md:pl-[20px] bg-[rgb(251,251,251)] min-h-screen">
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-2 sm:p-4 md:p-6 max-w-full">
          <div className="mb-4 sm:mb-6 flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Evening, Beetoo 👋🏻
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-semibold">
                Track your activities, leads, analytics, and more
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[rgb(21,163,149)] rounded-full px-3 sm:px-4 py-2 text-white cursor-pointer text-sm sm:text-base whitespace-nowrap"
            >
              <Ratio className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add widget</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 top-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
              <div className="relative bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Add Widget
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      type="search"
                      id="default-search"
                      className="block w-full px-4 outline-none py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm text-gray-900 border border-green-400 rounded-full bg-gray-50"
                      placeholder="Search Mockups, Logos..."
                    />
                  </div>
                </div>
                <div className="h-[60vh] sm:h-[70vh] overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      {
                        icon: (
                          <ChartSpline className="text-teal-600" size={18} />
                        ),
                        title: "Stats",
                      },
                      {
                        icon: <Bell className="text-orange-400" size={18} />,
                        title: "Live Feed",
                      },
                      {
                        icon: (
                          <ClipboardList
                            className="text-purple-500"
                            size={18}
                          />
                        ),
                        title: "Tasks",
                      },
                      {
                        icon: (
                          <UsersRound className="text-blue-400" size={18} />
                        ),
                        title: "Top People",
                      },
                    ].map((widgetItem, index) => (
                      <div
                        key={index}
                        className="border-none p-2 sm:p-3 rounded-md shadow-md bg-white"
                      >
                        <div className="bg-gray-200 p-2 sm:p-3 rounded-md">
                          <img
                            src={widget}
                            className="w-full h-32 sm:h-40 bg-white border-none rounded-md object-cover"
                            alt="Widget"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-gray-700">
                          {widgetItem.icon}
                          <span className="font-medium text-sm sm:text-base">
                            {widgetItem.title}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
                          Lorem ipsum dolor sit amet consectetur, adipisicing
                          elit.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 p-2 sm:p-4 md:p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon="mail"
              label="Active emails"
              value="12"
              iconColor="text-[#6ca1f7]"
              bgColor="bg-[#ecf3fe]"
            />
            <MetricCard
              icon="users"
              label="People Reached"
              value="1,264"
              iconColor="text-[#fcbd75]"
              bgColor="bg-[#fff3e6]"
            />
            <MetricCard
              icon="calendar"
              label="Meetings Booked"
              value="156"
              iconColor="text-[#34a853]"
              bgColor="bg-[#ebf6ee]"
            />
            <MetricCard
              icon="briefcase"
              label="Opportunities"
              value="156"
              iconColor="text-[#ae70ff]"
              bgColor="bg-[#f5edff]"
            />
          </div>

          <div className="grid gap-3 sm:gap-4 p-2 sm:p-4 md:p-6 grid-cols-1 lg:grid-cols-3">
            <div className="p-4 sm:p-6 border-none rounded-lg shadow-md bg-white">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">
                Live feed
              </h3>
              <LiveFeed />
            </div>

            <div className="p-4 sm:p-6 border-none rounded-lg shadow-md bg-white">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base">Stats</h3>
                <Link to="/analytics">
                  <MoveUpRight className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>

              <div className="w-fit mx-auto rounded-full bg-gray-200 p-1 mb-4">
                <button
                  className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full cursor-pointer transition-all duration-300 ${
                    selectedView === "month"
                      ? "bg-gray-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                  onClick={() => setSelectedView("month")}
                >
                  Monthly
                </button>
                <button
                  className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full cursor-pointer transition-all duration-300 ${
                    selectedView === "week"
                      ? "bg-gray-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                  onClick={() => setSelectedView("week")}
                >
                  Weekly
                </button>
              </div>
              <StatsChart />
            </div>

            <div className="p-3 sm:p-4 md:p-6 border-none rounded-lg shadow-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h3 className="font-semibold text-sm sm:text-base">Tasks</h3>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                    5 New
                  </span>
                </div>
                <Plus
                  className="bg-gray-300 rounded-lg p-1 cursor-pointer h-6 w-6 sm:h-7 sm:w-7"
                  onClick={() => setIsPlusModalOpen(true)}
                />
              </div>
              <div className="min-h-[300px] sm:min-h-[400px]">
                <TaskList />
              </div>
            </div>
          </div>

          {isPlusModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#1d1c1c96] bg-opacity-50 z-50 p-4">
              <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-lg sm:text-xl font-semibold">Add Task</h3>
                  <button
                    onClick={() => setIsPlusModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div>
                  <form className="space-y-4">
                    <div>
                      <div className="flex gap-1 items-center mb-3">
                        <RiEditCircleLine size={20} className="text-gray-400" />
                        <label className="block text-sm font-medium">
                          Task Title
                        </label>
                      </div>
                      <input
                        type="text"
                        className="mt-1 block w-full p-2 sm:p-3 cursor-pointer border border-gray-300 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <div className="flex gap-1 items-center mb-3">
                        <FileText size={20} className="text-gray-400" />
                        <label className="block text-sm font-medium">
                          Description
                        </label>
                      </div>
                      <textarea
                        rows="3"
                        className="mt-1 block w-full p-2 sm:p-3 cursor-pointer border border-gray-300 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm sm:text-base resize-none"
                      ></textarea>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-1/2">
                        <div className="flex gap-1 items-center mb-3">
                          <Calendar size={20} className="text-gray-400" />
                          <label className="block text-sm font-medium">
                            Date
                          </label>
                        </div>
                        <input
                          type="date"
                          className="mt-1 block cursor-pointer w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm sm:text-base"
                        />
                      </div>
                      <div className="w-full sm:w-1/2">
                        <div className="flex gap-1 items-center mb-3">
                          <Clock3 size={20} className="text-gray-400" />
                          <label className="block text-sm font-medium">
                            Time
                          </label>
                        </div>
                        <input
                          type="time"
                          className="mt-1 block cursor-pointer w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Assign to Person
                      </label>
                      <input
                        type="text"
                        className="mt-1 block cursor-pointer w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
                      <button
                        onClick={() => setIsPlusModalOpen(false)}
                        type="button"
                        className="w-full sm:w-auto text-gray-900 cursor-pointer bg-white border border-gray-300 font-medium rounded-full text-sm px-5 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsPlusModalOpen(false)}
                        type="button"
                        className="w-full sm:w-auto text-white cursor-pointer flex gap-2 items-center justify-center bg-[rgb(21,163,149)] hover:bg-[rgb(18,140,128)] focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 transition-colors"
                      >
                        <FileText size={16} />
                        Save Task
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 sm:mt-4 md:mt-6 border-none rounded-lg shadow-md bg-white">
            <TopPeople />
          </div>
        </main>
      </div>
    </div>
  );
}
