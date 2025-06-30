import React, { useState } from "react";
import {
  Phone,
  Mail,
  Calendar,
  Plus,
  Clock,
  CheckSquare,
  Square,
  ChevronDown,
  FileText,
  CircleCheck,
  ChevronUp,
  NotebookPen,
  ChevronRight,
  MessageSquareText, 
  ClipboardList, 
  StickyNote,
  X
} from "lucide-react";

export default function MailboxSlider({ sliderOpen, setSliderOpen }) {
  const pipelineStages = [
    { name: "Discovery", active: false },
    { name: "Evaluation", active: true },
    { name: "Proposal", active: false },
    { name: "Negotiation", active: false },
    { name: "Commit", active: false },
    { name: "Closed", active: false },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "Set up demo for Client",
      description: "Could you send me an overview of your solutions...",
      date: "2/12/2025",
      time: "2:35 PM",
      completed: false,
    },
    {
      id: 2,
      title: "Respond to Initial Inquiry",
      description: "Could you send me an overview of your solutions...",
      date: "2/12/2025",
      time: "2:35 PM",
      completed: false,
    },
  ];

  const pastActivities = [
    {
      id: 1,
      title: "Call about sales",
      description: "Could you send me an overview of your solutions...",
      date: "2/12/2025",
      time: "2:35 PM",
      type: "call",
      color: "border-l-yellow-400",
    },
    {
      id: 2,
      title: "Meeting Follow-up",
      description: "Reply to Alex Carter with details on ta...",
      date: "2/12/2025",
      time: "2:35 PM",
      type: "email",
      color: "border-l-purple-400",
    },
    {
      id: 3,
      title: "Re: Request for Overview of Your Solutions",
      description: "Could you send me an overview of your solutions...",
      date: "2/12/2025",
      time: "2:35 PM",
      type: "email",
      color: "border-l-purple-400",
    },
    {
      id: 4,
      title: "Task: Respond to Initial Inquiry",
      description: "Reply to Alex Carter with details on ta...",
      date: "3/2/2025",
      time: "5:00 AM",
      type: "task",
      color: "border-l-green-400",
    },
  ];

  const stats = [
    { label: "Calls Logged", value: "5" },
    { label: "Emails sent", value: "12" },
    { label: "Opened", value: "4" },
    { label: "Clicked", value: "8" },
    { label: "Replied", value: "2" },
    { label: "Opportunities", value: "0" },
  ];


  const tabOptions = [
  { label: "All Activity", value: "all" },
  { label: "Emails", value: "email" },
  { label: "Calls", value: "call" },
  { label: "SMS", value: "sms" },
  { label: "Tasks", value: "task" },
  { label: "Notes", value: "note" },
];

const iconMap = {
  call: <Phone className="w-4 h-4 text-yellow-600 mt-1" />,
  email: <Mail className="w-4 h-4 text-purple-600 mt-1" />,
  task: <ClipboardList className="w-4 h-4 text-green-600 mt-1" />,
  sms: <MessageSquareText className="w-4 h-4 text-blue-600 mt-1" />,
  note: <StickyNote className="w-4 h-4 text-orange-600 mt-1" />,
};

const [activeTab, setActiveTab] = useState("all");

const [showMore, setShowMore] = useState(false);

// Filtered past activities based on selected tab
const filteredActivities = activeTab === "all"
  ? pastActivities
  : pastActivities.filter((activity) => activity.type === activeTab);

  return (
    <div
      className={`fixed top-0 right-0 h-full max-w-[1200px] bg-white shadow-2xl z-[100] transition-transform duration-300 ease-in-out overflow-y-auto border-l border-gray-200 rounded-l-xl
      ${sliderOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">People / Michael Regan</h2>
          <button
            onClick={() => setSliderOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer">
                <X size={19} />
          </button>
        </div>

        {/* Pipeline Header */}
        <div className="bg-white rounded-lg mb-6 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-600">
            <div className="flex flex-wrap gap-1 items-center">
              {pipelineStages.map((stage, index) => (
                <React.Fragment key={stage.name}>
                  <div
                    className={`px-6 py-3 rounded-lg border border-gray-300 text-xs font-medium ${
                      stage.active
                        ? "bg-orange-200 text-orange-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stage.name}
                  </div>
                  {index < pipelineStages.length - 1 && (
                    <span className="text-gray-300"><ChevronRight /></span>
                  )}
                </React.Fragment>
              ))}
              <div className="px-3 py-3 rounded-full flex gap-1 items-center border border-gray-300 bg-teal-500 text-white text-xs font-medium">
                <CircleCheck size={15} /> Mark status as completed 
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6 col-span-1">
            <div className="bg-gray-500 text-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-xl font-semibold">
                  MR
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Michael Regan</h3>
                  <p className="text-sm text-gray-200">
                    Meta Inc.
                    <span className="ml-2 px-2 py-0.5 bg-gray-400 text-xs rounded-full">
                      Lead
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex text-xs items-center gap-2">
                  <Clock size={16} /> 12:24 AM EST
                </div>
                <div className="flex text-xs items-center gap-2">
                  <Calendar size={16} /> Last contacted 1/12/2025 by Philip O.
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 bg-white shadow-sm">
              <h4 className="font-semibold text-lg text-black">Quick Actions</h4>
              <div className="grid grid-cols-3 gap-3">
                {[{ Icon: Phone, label: "Call" }, { Icon: Mail, label: "Email" }, { Icon: Calendar, label: "Meeting" }, {Icon: NotebookPen , label: 'New Task'}].map(({ Icon, label }, i) => (
                  <button key={i} className="flex flex-col items-center justify-center p-3 ">
                    <Icon className="w-12 h-12 text-teal-600 mb-1 p-3 rounded-full bg-green-50" />
                    <span className="text-xs font-medium text-black">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="shadow-sm p-2">
              <h4 className="font-semibold mb-3 text-black ">Stats</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-6 col-span-2">
            <div className="border-b border-gray-200 mb-4">
                <div className="flex gap-2 overflow-x-auto">
                    {tabOptions.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-2 text-sm font-medium cursor-pointer transition-all
                        ${activeTab === tab.value
                            ? "bg-white  border-b-2 border-teal-600 text-teal-600"
                            : "text-gray-500 hover:text-black"}`}
                    >
                        {tab.label}
                    </button>
                    ))}
                </div>
                {/* Past Activities */}
            <div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold mb-3 text-black">Upcoming Tasks</h3>
                <div className="flex items-center gap-1">
                <button className="flex items-center gap-2 cursor-pointer text-gray-600 px-4 py-1.5 border border-gray-300 rounded-full">
                    <Phone size={15} /> Call
                </button>
                <button className="flex items-center gap-2 cursor-pointer text-gray-600 px-4 py-1.5 border border-gray-300 rounded-full">
                    <NotebookPen size={15} /> Add notes   
                </button>
                </div>
            </div>
            {/* Activities */}
            <div className="space-y-4">
                {filteredActivities.length > 0 ? (
                filteredActivities.map((a) => (
                    <div
                    key={a.id}
                    className={`bg-white rounded p-4 shadow-sm border-l-4 ${a.color}`}
                    >
                    <div className="flex justify-between">
                        <div className="flex gap-3">
                        {iconMap[a.type]}
                        <div>
                            <h4 className="font-medium text-sm">{a.title}</h4>
                            <p className="text-sm text-gray-600">{a.description}</p>
                        </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                        <div>{a.date}</div>
                        <div>{a.time}</div>
                        </div>
                    </div>
                    </div>
                ))
                ) : (
                <p className="text-sm text-gray-500">No activities found.</p>
                )}
            </div>
            </div>
            
            </div>

            {/* Past Activities */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Past Activities</h3>
              <div className="space-y-4">
                {pastActivities.map((a) => (
                  <div key={a.id} className={`bg-white rounded p-4 shadow-sm border-l-4 ${a.color}`}>
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        {a.type === "call" && <Phone className="w-4 h-4 text-yellow-600 mt-1" />}
                        {a.type === "email" && <Mail className="w-4 h-4 text-purple-600 mt-1" />}
                        {a.type === "task" && <CheckSquare className="w-4 h-4 text-green-600 mt-1" />}
                        <div>
                          <h4 className="font-medium text-sm">{a.title}</h4>
                          <p className="text-sm text-gray-600">{a.description}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{a.date}</div>
                        <div>{a.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Person Details */}
        <div className="space-y-4 h-fit shadow-md bg-white rounded-lg p-4">
      <h3 className="w-fit text-lg font-semibold text-black">Person Details</h3>

      <div className="text-sm space-y-4">
        <div>
          <label className="text-gray-600 font-medium">Company name</label>
          <p className="text-gray-400">St Johns Ambulance NY</p>
        </div>
        <hr className="text-gray-300" />

        <div>
          <label className="text-gray-600 font-medium">Email</label>
          <p className="text-gray-400">reganr@stjohns.edu</p>
        </div>
        <hr className="text-gray-300" />

        <div>
          <label className="text-gray-600 font-medium">Phone</label>
          <p className="text-gray-400">+12345678910</p>
        </div>
        <hr className="text-gray-300" />

        {/* Conditionally shown extra details */}
        {showMore && (
          <>
            <div>
              <label className="text-gray-600 font-medium">Website</label>
              <p className="text-gray-400">www.stjohnsambulance.org</p>
            </div>
            <hr className="text-gray-300" />

            <div>
              <label className="text-gray-600 font-medium">Location</label>
              <p className="text-gray-400">New York, USA</p>
            </div>
            <hr className="text-gray-300" />

            <div>
              <label className="text-gray-600 font-medium">Employees</label>
              <p className="text-gray-400">250+</p>
            </div>
            <hr className="text-gray-300" />
          </>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-teal-600 cursor-pointer hover:text-teal-700 p-2 mx-auto flex items-center"
        >
          {showMore ? "View less" : "View more"}
          {showMore ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
}
