import { useState, useEffect } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import {
  Clock,
  AlertCircle,
  User,
  CalendarDays,
  Briefcase,
  Users,
  Megaphone,
  BarChart3,
  Target,
  ClipboardList,
} from "lucide-react";

function TaskList() {
  const [tasks, setTasks] = useState([
    {
      id: 0,
      title: "Respond to Initial Inquiry",
      description: "Reply to Alex Carter with details on ta...",
      time: "9:00 PM",
      assignee: "John Doe",
      priority: "high",
      status: "upcoming",
      category: "sales",
    },
    {
      id: 1,
      title: "Schedule Meeting",
      description: "Confirm a meeting with Alex Carter fo...",
      time: "12 Mar 2025",
      assignee: "Jane Smith",
      priority: "medium",
      status: "completed",
      category: "meeting",
    },
    {
      id: 2,
      title: "Follow up Email Campaign",
      description: "Send follow-up emails to potential leads...",
      time: "15 Mar 2025",
      assignee: "Mike Johnson",
      priority: "low",
      status: "upcoming",
      category: "marketing",
    },
    {
      id: 3,
      title: "Prepare Sales Report",
      description: "Compile monthly sales data and analytics...",
      time: "18 Mar 2025",
      assignee: "Sarah Wilson",
      priority: "high",
      status: "upcoming",
      category: "analytics",
    },
    {
      id: 4,
      title: "Client Onboarding Call",
      description: "Welcome new client and setup their account...",
      time: "20 Mar 2025",
      assignee: "Tom Brown",
      priority: "medium",
      status: "upcoming",
      category: "onboarding",
    },
  ]);

  const [completedTasks, setCompletedTasks] = useState({});
  const [visibleTasks, setVisibleTasks] = useState([]);

  useEffect(() => {
    // Animate tasks appearing
    tasks.forEach((task, index) => {
      setTimeout(() => {
        setVisibleTasks((prev) => [...prev, task.id]);
      }, index * 100);
    });
  }, []);

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getPriorityColor = (priority) => {
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getCategoryIcon = (category) => {
    const iconProps = { className: "h-4 w-4 text-orange-500" };
    switch (category) {
      case "sales":
        return <Briefcase {...iconProps} />;
      case "meeting":
        return <Users {...iconProps} />;
      case "marketing":
        return <Megaphone {...iconProps} />;
      case "analytics":
        return <BarChart3 {...iconProps} />;
      case "onboarding":
        return <Target {...iconProps} />;
      default:
        return <ClipboardList {...iconProps} />;
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {tasks.map((task, i) => (
        <div
          key={task.id}
          className={`flex items-start gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:cursor-pointer p-3 rounded-lg border border-transparent hover:border-green-200 hover:shadow-md transition-all duration-300 transform ${
            visibleTasks.includes(task.id)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          } ${completedTasks[task.id] ? "opacity-75" : ""}`}
        >
          <button
            onClick={() => toggleTaskCompletion(task.id)}
            className="rounded text-gray-400 flex-shrink-0 mt-1 transition-all duration-200 hover:scale-110"
          >
            {completedTasks[task.id] ? (
              <MdCheckBox className="h-5 w-5 text-green-600 cursor-pointer" />
            ) : (
              <MdCheckBoxOutlineBlank className="h-5 w-5 text-gray-400 cursor-pointer hover:text-green-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                {getCategoryIcon(task.category)}
                <span
                  className={`text-sm sm:text-base font-semibold truncate ${
                    completedTasks[task.id]
                      ? "line-through text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  {task.title}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-2 py-1 text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                  {task.status === "completed" ? "✓ Completed" : "⏳ Upcoming"}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium border ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority === "high" && (
                    <AlertCircle className="inline h-3 w-3 mr-1 text-gray-500" />
                  )}
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}{" "}
                  Priority
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="h-3 w-3" />
                  <span>{task.time}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{task.assignee}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
