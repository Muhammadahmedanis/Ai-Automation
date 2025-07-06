import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar1,
  CircleCheckBig,
  AlertCircle,
  Loader2,
} from "lucide-react";
import SideDrawer from "../components/SideDrawer";
import Modal from "../components/Modal";
import { useGoogleCalendarQuery } from "../reactQuery/hooks/useCalenderQuery";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Calendar() {
  const {
    authData,
    authLoading,
    authError,
    getAllEventsQuery,
    createEventMutation,
    getSingleEventQuery,
    updateEventMutation,
    deleteEventMutation,
  } = useGoogleCalendarQuery();

  const navigate = useNavigate();
  const [modelOpen, setmodelOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedView, setSelectedView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleModal = () => {
    setmodelOpen(!modelOpen);
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (selectedView === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (selectedView === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStartAndEndDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let startDate, endDate;

    if (selectedView === "month") {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else if (selectedView === "week") {
      const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
      startDate = new Date(year, month, firstDayOfWeek);
      endDate = new Date(year, month, firstDayOfWeek + 6);
    }

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    return { formattedStartDate, formattedEndDate };
  };

  const { formattedStartDate, formattedEndDate } = getStartAndEndDates();

  const {
    data: allEvents,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = getAllEventsQuery({
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  });

  useEffect(() => {
    if (allEvents?.tasks) {
      setEvents(allEvents.tasks);
    }
  }, [allEvents]);

  const handleDayClick = (dayData) => {
    // Handle both object and number cases for backward compatibility
    const clickedDate =
      dayData.fullDate ||
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        typeof dayData === "number" ? dayData : dayData.date
      );

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === clickedDate.toDateString();
    });
    setSelectedDayEvents(dayEvents);
    setmodelOpen(true);
  };

  const handleOpenSideDrawer = (event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!authData?.success) {
        navigate("/settings?tab=integrations&from=calendar");
        toast.error(
          "You need to connect to Google Calendar to use this feature."
        );
      }
    }
  }, [authLoading, authData, authError]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];

    if (selectedView === "week") {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());

      for (let i = 0; i < 7; i++) {
        const thisDate = new Date(weekStart);
        thisDate.setDate(weekStart.getDate() + i);

        const isCurrentMonth = thisDate.getMonth() === month;
        const day = thisDate.getDate();
        const dayMonth = thisDate.getMonth();
        const dayYear = thisDate.getFullYear();

        const eventList = events
          .filter((event) => {
            const eventDate = new Date(event.eventDate);
            return (
              eventDate.getDate() === day &&
              eventDate.getMonth() === dayMonth &&
              eventDate.getFullYear() === dayYear
            );
          })
          .map((event) => event.Task_Title);

        days.push({
          date: day,
          fullDate: new Date(thisDate),
          isCurrentMonth,
          events: eventList,
        });
      }
    } else {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startingDayIndex = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      const previousMonth = new Date(year, month, 0);
      const daysInPreviousMonth = previousMonth.getDate();

      // Previous month days
      for (let i = startingDayIndex - 1; i >= 0; i--) {
        const date = daysInPreviousMonth - i;
        const fullDate = new Date(year, month - 1, date);
        days.push({
          date,
          fullDate,
          isCurrentMonth: false,
          events: [],
        });
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = new Date(year, month, i);
        const eventList = events
          .filter((event) => {
            const eventDate = new Date(event.eventDate);
            return eventDate.getDate() === i && eventDate.getMonth() === month;
          })
          .map((event) => event.Task_Title);

        days.push({
          date: i,
          fullDate,
          isCurrentMonth: true,
          events: eventList,
        });
      }

      // Next month days to fill the grid
      const remainingDays = 42 - days.length; // 6 rows × 7 days
      for (let i = 1; i <= remainingDays; i++) {
        const fullDate = new Date(year, month + 1, i);
        days.push({
          date: i,
          fullDate,
          isCurrentMonth: false,
          events: [],
        });
      }
    }

    return days;
  };

  // Loading state
  if (authLoading || isEventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#16C47F]" />
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isEventsError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-gray-700 font-medium">Failed to load calendar</p>
          <p className="text-gray-500 text-sm mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#16C47F] rounded-lg">
                  <Calendar1 className="h-6 w-6 text-[#16C47F]" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {currentDate.getFullYear()}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Manage your reminders, events, and meetings
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedView === "month"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedView("month")}
                >
                  Month
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedView === "week"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedView("week")}
                >
                  Week
                </button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="Previous period"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  Today
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="Next period"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* New Event Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2  bg-[#16C47F] hover:bg-[#FF9D23] text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Event</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {daysOfWeek.map((day) => (
              <div key={day} className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 hidden sm:inline">
                  {day}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 sm:hidden">
                  {day.slice(0, 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {generateCalendarDays().map((day, index) => {
              const isCurrentDay = isToday(day.fullDate);
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleDayClick(day);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${day.date} ${currentDate.toLocaleString(
                    "default",
                    { month: "long" }
                  )} ${currentDate.getFullYear()}${
                    day.events.length > 0
                      ? `, ${day.events.length} event${
                          day.events.length > 1 ? "s" : ""
                        }`
                      : ""
                  }`}
                  className={`min-h-[80px] sm:min-h-[120px] p-2 sm:p-3 border-r border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:ring-inset ${
                    !day.isCurrentMonth ? "bg-gray-50/50" : "bg-white"
                  } ${isCurrentDay ? "bg-text-[#16C47F] border-[#16C47F]" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        !day.isCurrentMonth
                          ? "text-gray-400"
                          : isCurrentDay
                          ? "text-text-[#16C47F] bg-text-[#16C47F] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {day.date}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {day.events.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="text-xs px-2 py-1 bg-[#16C47F] text-[#16C47F] rounded-md font-medium flex items-center gap-1 truncate"
                      >
                        <CircleCheckBig className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{event}</span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Drawer and Modal */}
      <SideDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        data={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />
      <Modal
        modelOpen={modelOpen}
        setmodelOpen={setmodelOpen}
        selectedDayEvents={selectedDayEvents}
        openSideDrawerWithEvent={handleOpenSideDrawer}
      />
    </div>
  );
}

export default Calendar;
