import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useWorkspaceQuery } from "../reactQuery/hooks/useWorkspaceQuery";
import { formatDistanceToNow } from "date-fns";
import { Flame, Clock, Mail, MousePointer, Eye, User } from "lucide-react";

function LiveFeed() {
  const [feedItems, setFeedItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const socketRef = useRef(null);
  const { currentWorkspace } = useWorkspaceQuery();
  const workspaceId = currentWorkspace?.Workspace?.id;

  useEffect(() => {
    if (!workspaceId) return;
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;
    socket.emit("joinWorkspace", workspaceId);
    socket.on("sendgrid_event", (payload, callback) => {
      const newFeedItem = {
        ...payload,
        id: Date.now(),
        isNew: true,
      };
      setFeedItems((prev) => [newFeedItem, ...prev]);
      setVisibleItems((prev) => [newFeedItem.id, ...prev]);
      if (callback) callback();
    });
    return () => {
      socket.disconnect();
    };
  }, [workspaceId]);

  useEffect(() => {
    feedItems.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => [...prev, item.id]);
      }, index * 150);
    });
  }, [feedItems]);

  const getActionIcon = (event) => {
    switch (event?.toLowerCase()) {
      case "click":
      case "clicked":
        return <MousePointer className="h-4 w-4" />;
      case "open":
      case "opened":
        return <Eye className="h-4 w-4" />;
      case "delivered":
        return <Mail className="h-4 w-4" />;
      case "bounce":
      case "dropped":
        return <Flame className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getEventStyles = (event) => {
    switch (event?.toLowerCase()) {
      case "click":
      case "clicked":
        return {
          color: "text-purple-500",
          bg: "bg-[#f5edff]",
          status: "Clicked",
        };
      case "open":
      case "opened":
        return {
          color: "text-green-500",
          bg: "bg-[#ebf6ee]",
          status: "Opened",
        };
      case "delivered":
        return {
          color: "text-blue-500",
          bg: "bg-[#e6f3ff]",
          status: "Delivered",
        };
      case "bounce":
        return {
          color: "text-red-500",
          bg: "bg-[#fee6e6]",
          status: "Bounced",
        };
      case "dropped":
        return {
          color: "text-gray-500",
          bg: "bg-[#f0f0f0]",
          status: "Dropped",
        };
      default:
        return {
          color: "text-orange-500",
          bg: "bg-[#fff3e6]",
          status: event || "Activity",
        };
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {feedItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No email activity yet. Waiting for updates...</p>
        </div>
      ) : (
        feedItems.map((item) => {
          const eventStyles = getEventStyles(item.event);
          return (
            <div
              key={item.id}
              className={`transition-all duration-500 transform ${
                visibleItems.includes(item.id)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              } ${item.isNew ? "" : ""}`}
            >
              <div className="md:p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-300 cursor-pointer group space-y-3">
                {/* Upper part: User icon, name, and email */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0 border-2 border-white shadow-md bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate text-gray-800 group-hover:text-gray-900">
                      {item.receiverName || "Unknown User"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.receiverEmail}
                    </div>
                    {item.subject && (
                      <div className="text-xs sm:text-sm text-gray-700 line-clamp-2 font-medium mt-1">
                        Re: {item.subject}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower part: Action and time */}
                <div className="flex items-center justify-between">
                  <div
                    className={`${eventStyles.bg} rounded-full flex gap-2 p-2 sm:p-2.5 items-center w-fit shadow-sm border border-white/50`}
                  >
                    <div className={`hidden sm:block ${eventStyles.color}`}>
                      {getActionIcon(item.event)}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {eventStyles.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {item.timestamp
                        ? formatDistanceToNow(new Date(item.timestamp), {
                            addSuffix: true,
                          })
                        : "Just now"}
                    </span>
                  </div>
                </div>
              </div>
              <hr className="border-gray-200 mt-3 sm:mt-4 border-dashed" />
            </div>
          );
        })
      )}
    </div>
  );
}

export default LiveFeed;
