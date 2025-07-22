import React, { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  User,
  HelpCircle,
  Settings,
  LogOut,
  Plus,
  X,
  Briefcase,
  Menu,
  Sparkles,
} from "lucide-react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { QueryClient } from "@tanstack/react-query";
import { useWorkspaceQuery } from "../reactQuery/hooks/useWorkspaceQuery";

const Navbar = () => {
  const notifications = [
    {
      name: "Benjiman Cooper",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "CEO @Meta .Inc",
      title: "Re: Meeting with lead",
      time: "5s ago",
      type: "Clicked",
      bg: "bg-[#33beff]",
      color: "text-[#ff336b]",
    },
    {
      name: "Casper",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "Sales Manager @Meta .Inc",
      title: "Re: Meeting with lead",
      time: "9s ago",
      type: "Hot lead",
      bg: "bg-[#33ffca]",
      color: "text-[#ff336b]",
    },
    {
      name: "John",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "Sales Manager @Meta .Inc",
      title: "Re: Meeting with lead",
      time: "Yesterday",
      type: "Unread",
      bg: "bg-[#7dff33]",
      color: "text-[#ff336b]",
    },
    {
      name: "Naism",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "Sales Manager @Meta .Inc",
      title: "Re: Meeting with lead",
      time: "1 hour ago",
      type: "Opened",
      color: "text-[#ff336b]",
      bg: "bg-[#e6ff33]",
    },
  ];
  const [workspaceName, setWorkspaceName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For toggling the menu on mobile

  const { createWorkspaceMutation, allWorkspace, switchWorkspaceMutation } =
    useWorkspaceQuery();
  const [selectedId, setSelectedId] = useState(null);
  const handleCreateWorkspace = () => {
    createWorkspaceMutation.mutate({ WorkspaceName: workspaceName });
    setIsModalOpen(false);
    setWorkspaceName("");
  };

  // console.log(allWorkspace);
  useEffect(() => {
    const id = JSON.parse(localStorage.getItem("user"));
    setSelectedId(id?.data?.CurrentWorkspaceId);
    // console.log(id?.data?.CurrentWorkspaceId);
  }, []);

  const handleSwitchWorkspace = (id) => {
    console.log({ WorkspaceId: id });
    setSelectedId(id);
    switchWorkspaceMutation.mutate({ WorkspaceId: id });
    const storedData = JSON.parse(localStorage.getItem("user")) || {};
    storedData.data.CurrentWorkspaceId = id;
    localStorage.setItem("user", JSON.stringify(storedData));
  };

  const location = useLocation();
  const pathSegements = location.pathname.split("/").filter(Boolean);
  const lastSegements = pathSegements[pathSegements.length - 1];
  const formattedName = lastSegements
    ?.replace(/-/g, " ")
    ?.split(" ")
    .map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1))
    ?.join(" ");

  const filteredNotifications =
    selectedFilter === "All"
      ? notifications
      : notifications.filter(
          (notification) => notification.type === selectedFilter
        );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    // QueryClient?.removeQueries(["userInfo"]);
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
    setIsOrgOpen(false);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // CSV file handler
  const handleCSVFile = (e) => {
    setCsvError("");
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setCsvError("Error parsing CSV file.");
          setCsvData(null);
          setCsvPreview([]);
        } else {
          // Validation: require at least one of Name, Email, Phone columns
          const requiredCols = ["Name", "Email", "Phone"];
          const headers = results.meta.fields || [];
          const hasRequiredCol = requiredCols.some((col) =>
            headers.includes(col)
          );
          if (!hasRequiredCol) {
            setCsvError(
              "CSV must contain at least one of: Name, Email, or Phone columns."
            );
            setCsvData(null);
            setCsvPreview([]);
            return;
          }
          // Validation: at least one row with a non-empty value for one of these fields
          const validLeads = results.data.filter((row) =>
            requiredCols.some((col) => (row[col] || "").trim() !== "")
          );
          if (validLeads.length === 0) {
            setCsvError("No valid leads found in the uploaded file.");
            setCsvData(null);
            setCsvPreview([]);
            return;
          }
          setCsvData(validLeads);
          setCsvPreview(validLeads.slice(0, 5));
        }
      },
      error: () => setCsvError("Error reading CSV file."),
    });
  };

  // Send CSV data to backend
  const handleCSVImport = async () => {
    if (!csvData || !csvData.length) return;
    setCsvUploading(true);
    setCsvError("");
    try {
      const response = await axiosInstance.post("/lead/import-csv", {
        leads: csvData,
      });
      setImportModal(null);
      setCsvData(null);
      setCsvPreview([]);
      setCsvUploading(false);
      toast.success("Leads imported successfully!");
    } catch (err) {
      setCsvError(err?.response?.data?.message || "Failed to import leads.");
      setCsvUploading(false);
    }
  };

  // Google Sheets handler
  const handleGoogleSheetFile = (e) => {
    setCsvError("");
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setCsvError("Error parsing Google Sheets file.");
          setCsvData(null);
          setCsvPreview([]);
        } else {
          setCsvData(results.data);
          setCsvPreview(results.data.slice(0, 5));
        }
      },
      error: () => setCsvError("Error reading Google Sheets file."),
    });
  };

  // HubSpot fetch handler
  const handleHubspotFetch = async () => {
    setCsvError("");
    setHubspotLoading(true);
    try {
      // HubSpot API: https://api.hubapi.com/crm/v3/objects/contacts
      const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${hubspotApiKey}` },
      });
      if (!response.ok)
        throw new Error("Failed to fetch from HubSpot. Check your API key.");
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results))
        throw new Error("Unexpected HubSpot response.");
      // Map to our lead format
      const leads = data.results.map((c) => ({
        Name: `${c.properties.firstname || ""} ${
          c.properties.lastname || ""
        }`.trim(),
        Email: c.properties.email || "",
        Phone: c.properties.phone || "",
        Company: c.properties.company || "",
      }));
      setCsvData(leads);
      setCsvPreview(leads.slice(0, 5));
      setHubspotLoading(false);
    } catch (err) {
      setCsvError("Failed to fetch or parse HubSpot contacts.");
      setHubspotLoading(false);
    }
  };

  return (
    <>
      <nav className="border-b border-gray-200 bg-white w-full">
        <div className="max-w-9xl mx-auto px-2 ml-12 md:ml-16 sm:px-3 lg:px-8 pt-5 pb-1">
          <div className="flex items-center justify-between h-10">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <span className="text-xl font-bold">
                {" "}
                {formattedName || "Dashboard"}{" "}
              </span>
            </div>
            <div className="hidden md:flex">
              <ul className="flex gap-5 pb-0">
                <Link
                  to="/"
                  className={`pb-3 ${
                    location.pathname === "/"
                      ? "border-b-2 border-green-500"
                      : ""
                  }`}
                >
                  <li
                    className={`${
                      location.pathname === "/" ? "text-green-500" : ""
                    }`}
                  >
                    Home
                  </li>
                </Link>
                <Link
                  to="/crm"
                  className={`pb-3 flex items-center ${
                    location.pathname === "/crm"
                      ? "border-b-2 border-green-500"
                      : ""
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                  <li
                    className={`${
                      location.pathname === "/crm" ? "text-green-500" : ""
                    }`}
                  >
                    AI CRM
                  </li>
                </Link>
                <Link
                  to="/campaigns"
                  className={`pb-3 ${
                    location.pathname === "/campaigns"
                      ? "border-b-2 border-green-500"
                      : ""
                  }`}
                >
                  <li
                    className={`${
                      location.pathname === "/campaigns" ? "text-green-500" : ""
                    }`}
                  >
                    Campaigns
                  </li>
                </Link>
              </ul>
            </div>

            <div className="flex items-center md:space-x-2 gap-1">
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 md:p-2 border border-gray-300 text-gray-600 bg-gray-200 rounded-full cursor-pointer"
                >
                  <Menu size={22} />
                </button>
              </div>

              {/* Notification Dropdown */}
              <div className="relative dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    setIsNotificationOpen(!isNotificationOpen);
                  }}
                  className="p-1 md:p-1.5 border border-gray-300 text-gray-600 bg-gray-200 rounded-full cursor-pointer flex gap-1 items-center"
                >
                  <Bell size={22} />
                </button>

                {isNotificationOpen && (
                  <div className="absolute -left-50 mt-4 bg-white shadow-lg w-80 rounded-lg px-1 py-3 z-10">
                    <div className="flex gap-2 items-center p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAllDropdowns();
                          setIsNotificationOpen(!isNotificationOpen);
                        }}
                        className="p-1 border border-gray-300 text-gray-600 bg-gray-200 rounded-full cursor-pointer flex gap-1 items-center"
                      >
                        <X size={16} />
                      </button>
                      <span>Notifications</span>
                    </div>

                    {/* Filter Options */}
                    <ul className="flex gap-3 p-2 text-[15px] font-semibold cursor-pointer">
                      {["All", "Unread", "Opened", "Clicked", "Hot lead"].map(
                        (filter) => (
                          <li
                            key={filter}
                            className={
                              selectedFilter === filter ? "text-blue-500" : ""
                            }
                            onClick={() => setSelectedFilter(filter)}
                          >
                            {filter}
                          </li>
                        )
                      )}
                    </ul>

                    {/* Filtered Notifications */}
                    {filteredNotifications.map((val, index) => (
                      <div key={index} className="flex gap-3 px-3 mt-5">
                        <img
                          src={val.img}
                          className="w-9 h-9 rounded-full object-cover"
                          alt=""
                        />
                        <div>
                          <div className="flex text-[15px] gap-2 items-center">
                            <h2>{val.name}</h2>
                            <p className="text-gray-400">{val.designation}</p>
                          </div>
                          <p>{val.title}</p>
                          <div className="flex items-center gap-1">
                            <p
                              className={`${val.bg} px-1.5 py-0.5 ${val.color} rounded-full text-[13px] inline-flex items-center`}
                            >
                              {val.type}
                            </p>
                            <p>{val.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show message if no notifications */}
                    {filteredNotifications.length === 0 && (
                      <p className="text-center text-gray-500 mt-3">
                        No notifications found
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="p-1 md:p-1.5 border cursor-pointer border-gray-300 text-gray-600 bg-gray-200 rounded-full flex gap-1 items-center"
                >
                  <User size={22} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-1 z-10 border-none">
                    <span className="flex justify-between items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                      <Link to="/settings">Settings</Link>
                      <Settings className="w-4 h-4 mr-2 text-gray-400" />
                    </span>
                    <hr className="text-gray-300" />
                    <span className="flex items-center justify-between px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                      <Link to="/support">Help Center</Link>
                      <HelpCircle className="w-4 h-4 mr-2 text-gray-400" />
                    </span>
                    <hr className="text-gray-300" />
                    {JSON.parse(localStorage?.getItem("user"))?.data ? (
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex justify-between cursor-pointer items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                        <LogOut className="w-4 h-4 mr-2" />
                      </button>
                    ) : (
                      <button className="w-full text-left flex justify-between cursor-pointer items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <Link to="/login">Signin</Link>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Organization Dropdown */}
              <div className="relative dropdown flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    setIsOrgOpen(!isOrgOpen);
                  }}
                  className="px-3 py-1.5 border border-gray-300 cursor-pointer text-gray-700 bg-white rounded-lg flex gap-2 items-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                    {(() => {
                      // Find current workspace name
                      const currentWorkspace = [
                        ...(allWorkspace?.OwnedWorkspaces || []),
                        ...(allWorkspace?.MemberWorkspaces || []),
                      ].find((workspace) => workspace?.id === selectedId);

                      return (
                        currentWorkspace?.WorkspaceName || "Select Workspace"
                      );
                    })()}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOrgOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOrgOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Switch Workspace
                      </h3>
                    </div>

                    {/* Owned Workspaces */}
                    {allWorkspace?.OwnedWorkspaces?.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Owned by you
                          </span>
                        </div>
                        {allWorkspace.OwnedWorkspaces.map((val) => (
                          <label
                            key={val?.id}
                            htmlFor={`workspace-${val?.id}`}
                            className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                              selectedId === val?.id
                                ? "bg-green-50 border border-green-200"
                                : "border border-transparent"
                            }`}
                          >
                            <input
                              onChange={() => handleSwitchWorkspace(val?.id)}
                              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2"
                              type="radio"
                              name="workspace"
                              id={`workspace-${val?.id}`}
                              checked={selectedId === val?.id}
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    selectedId === val?.id
                                      ? "text-green-800"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {val?.WorkspaceName}
                                </span>
                                {selectedId === val?.id && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                Owner
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Member Workspaces */}
                    {allWorkspace?.MemberWorkspaces?.length > 0 && (
                      <div className="p-2 border-t border-gray-100">
                        <div className="px-2 py-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Member of
                          </span>
                        </div>
                        {allWorkspace.MemberWorkspaces.map((val) => (
                          <label
                            key={val?.id}
                            htmlFor={`workspace-member-${val?.id}`}
                            className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                              selectedId === val?.id
                                ? "bg-blue-50 border border-blue-200"
                                : "border border-transparent"
                            }`}
                          >
                            <input
                              onChange={() => handleSwitchWorkspace(val?.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                              type="radio"
                              name="workspace"
                              id={`workspace-member-${val?.id}`}
                              checked={selectedId === val?.id}
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    selectedId === val?.id
                                      ? "text-blue-800"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {val?.WorkspaceName}
                                </span>
                                {selectedId === val?.id && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Active
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                Member
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {!allWorkspace?.OwnedWorkspaces?.length &&
                      !allWorkspace?.MemberWorkspaces?.length && (
                        <div className="p-6 text-center">
                          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 mb-4">
                            No workspaces found
                          </p>
                        </div>
                      )}

                    {/* Create Workspace Button */}
                    <div className="border-t border-gray-200 p-2">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full px-3 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-center rounded-md transition-colors duration-200 border border-dashed border-gray-300 hover:border-gray-400"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          Create New Workspace
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isModalOpen && (
              <div className="fixed bottom-20 inset-0 flex items-center z-40 justify-center bg-black/50 min-h-screen">
                <div className="bg-white md:w-96 w-[80%] z-[150] p-6 rounded-lg shadow-lg modal">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      Create New Workspace
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 cursor-pointer hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full p-2 mt-1 border rounded-md focus:outline-none border-gray-300"
                      placeholder="Ali's Workspace 2"
                    />
                  </div>

                  <div className="mt-6 flex justify-between gap-1">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 hover:bg-[#FF9D23] hover:text-white cursor-pointer border border-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateWorkspace}
                      className="px-4 py-2 bg-[#16C47F] hover:bg-[#FF9D23] text-white rounded-md cursor-pointer flex items-center text-sm whitespace-nowrap"
                    >
                      <Briefcase className="w-4 h-4 mr-2 md:block hidden" />
                      Create Workspace
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 absolute top-16 right-30 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border-none">
            <ul className="flex flex-col gap-2 p-4 justify-center items-center ">
              <Link to="/">
                <li>Home</li>
              </Link>
              <Link to="/crm">
                <li>AI CRM</li>
              </Link>
              <Link to="/campaigns">
                <li>Campaigns</li>
              </Link>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
