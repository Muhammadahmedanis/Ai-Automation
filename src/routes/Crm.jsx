import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MapPin,
  Globe,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  CircleCheck,
  Clock,
  DollarSign,
  Users,
  FileText,
  Handshake,
  CheckCircle,
  XCircle,
  PhoneCall,
  Video,
  CalendarDays,
  Trash2,
  Upload,
  Sheet,
  Link2,
  Database,
  Cloud,
} from "lucide-react";
import { axiosInstance } from "../api/axios";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Menu } from "@headlessui/react";
import { Link, useSearchParams } from "react-router-dom";
import { useCampaignQuery } from "../reactQuery/hooks/useCampaignQuery";
import Papa from "papaparse";

import Inbox from "./Inbox";
import LeadView from "./LeadView";
import Chatbot from "../components/Chatbot";

export default function Crm() {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [people, setPeople] = useState([]);
  const [opportunities, setOpportunities] = useState({
    Discovery: [],
    Evaluation: [],
    Proposal: [],
    Negotiation: [],
    Commit: [],
    Closed: [],
  });
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Accounts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState("Oldest first");
  const [selectAll, setSelectAll] = useState(false);
  const [draggedLead, setDraggedLead] = useState(null);
  const [opportunityStatus, setOpportunityStatus] = useState("All statuses");
  const [events, setEvents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const { campaignsObject, isCampaignsLoading, createCampaignMutation } =
    useCampaignQuery();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [titleFilter, setTitleFilter] = useState("");

  // Import Leads states
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [importModal, setImportModal] = useState(null); // 'csv', 'sheets', 'hubspot', etc.
  const [csvData, setCsvData] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [csvUploading, setCsvUploading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [hubspotApiKey, setHubspotApiKey] = useState("");
  const [hubspotLoading, setHubspotLoading] = useState(false);
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "Accounts",
        "People",
        "Opportunities",
        "Calls",
        "Meetings",
        "Inbox",
        "Lead View",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const sortOptions = [
    { value: "Newest first", label: "Newest first" },
    { value: "Oldest first", label: "Oldest first" },
    { value: "Name A - Z", label: "Name A - Z" },
    { value: "Name Z - A", label: "Name Z - A" },
  ];

  const statusConfig = {
    Discovery: {
      color: "bg-blue-100",
      textColor: "text-blue-700",
      icon: Users,
    },
    Evaluation: {
      color: "bg-yellow-100",
      textColor: "text-yellow-700",
      icon: FileText,
    },
    Proposal: {
      color: "bg-purple-100",
      textColor: "text-purple-700",
      icon: DollarSign,
    },
    Negotiation: {
      color: "bg-orange-100",
      textColor: "text-orange-700",
      icon: Handshake,
    },
    Commit: {
      color: "bg-green-100",
      textColor: "text-green-700",
      icon: CheckCircle,
    },
    Closed: { color: "bg-gray-100", textColor: "text-gray-700", icon: XCircle },
  };

  // Fetch leads and group them by company
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        console.log("Attempting to fetch leads...");
        const response = await axiosInstance.get("/lead/GetAllLeads");
        console.log("API Response:", response);

        if (response.data.success) {
          console.log("Leads data:", response.data.leads);
          // Deduplicate leads by email (case-insensitive) or id
          const uniqueLeadsMap = {};
          const uniqueLeads = [];
          for (const lead of response.data.leads) {
            const key = lead.Email ? lead.Email.toLowerCase() : lead.id;
            if (!uniqueLeadsMap[key]) {
              uniqueLeadsMap[key] = true;
              uniqueLeads.push(lead);
            }
          }
          // Group leads by company for Accounts tab
          const groupedLeads = response.data.leads.reduce((acc, lead) => {
            const companyName = lead.Company || "Unassigned";
            if (!acc[companyName]) {
              acc[companyName] = {
                id: companyName,
                name: companyName,
                logo: null,
                logoBackground: "bg-gray-100",
                location: lead.Location || "Not specified",
                website: lead.Website || "Not specified",
                leads: [],
              };
            }
            acc[companyName].leads.push(lead);
            return acc;
          }, {});

          // Convert to array and sort for Accounts tab
          const accountsArray = Object.values(groupedLeads).map((company) => ({
            ...company,
            contacts: company.leads.length,
            contactAvatars: (company.leads || []).slice(0, 3).map((lead) =>
              (lead.Name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            ),
          }));

          // Set people data for People tab
          setPeople(
            response.data.leads.map((lead) => ({
              ...lead,
              status: lead.Status || "Not yet contacted",
              provider: lead.Email?.includes("@gmail.com")
                ? "Google"
                : lead.Email?.includes("@outlook.com")
                ? "Microsoft"
                : lead.Email?.includes("@yahoo.com")
                ? "Yahoo"
                : "Other",
            }))
          );

          // Group leads by status for Opportunities tab
          const opportunitiesByStatus = uniqueLeads.reduce(
            (acc, lead) => {
              const status = lead.Status || "Discovery";
              if (!acc[status]) {
                acc[status] = [];
              }
              acc[status].push(lead);
              return acc;
            },
            {
              Discovery: [],
              Evaluation: [],
              Proposal: [],
              Negotiation: [],
              Commit: [],
              Closed: [],
            }
          );

          setOpportunities(opportunitiesByStatus);
          console.log("Processed accounts:", accountsArray);
          setAccounts(accountsArray);
        }
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
        });

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          toast.error(
            error.response.data?.message ||
              `Error ${error.response.status}: Failed to fetch leads`
          );
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("No response from server. Please check your connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error("Error setting up request: " + error.message);
        }
      }
    };

    fetchLeads();
  }, []);

  // Fetch calls data (from /calls endpoint)
  useEffect(() => {
    const fetchCallsData = async () => {
      try {
        const response = await axiosInstance.get("/calls");
        if (
          !response.data ||
          !response.data.success ||
          !Array.isArray(response.data.calls)
        ) {
          toast.error(response.data?.message || "Failed to fetch calls");
          setCalls([]);
          return;
        }
        setCalls(response.data.calls);
      } catch (error) {
        console.error("Error fetching calls:", error);
        toast.error("Failed to fetch calls");
        setCalls([]);
      }
    };
    fetchCallsData();
  }, []);

  // Fetch meetings data (from /meetings endpoint)
  useEffect(() => {
    const fetchMeetingsData = async () => {
      try {
        const response = await axiosInstance.get("/meetings");
        if (
          !response.data ||
          !response.data.success ||
          !Array.isArray(response.data.meetings)
        ) {
          toast.error(response.data?.message || "Failed to fetch meetings");
          setMeetings([]);
          return;
        }
        setMeetings(response.data.meetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Failed to fetch meetings");
      }
    };
    fetchMeetingsData();
  }, []);

  const toggleCompanyExpand = (companyId) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyId]: !prev[companyId],
    }));
  };

  const handleSortChange = (sort) => {
    setSortOrder(sort);
    setShowSortDropdown(false);

    const sortedAccounts = [...accounts];
    switch (sort) {
      case "Newest first":
        sortedAccounts.sort(
          (a, b) =>
            new Date(b.leads[0]?.createdAt) - new Date(a.leads[0]?.createdAt)
        );
        break;
      case "Oldest first":
        sortedAccounts.sort(
          (a, b) =>
            new Date(a.leads[0]?.createdAt) - new Date(b.leads[0]?.createdAt)
        );
        break;
      case "Name A - Z":
        sortedAccounts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name Z - A":
        sortedAccounts.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    setAccounts(sortedAccounts);
  };

  const handleDragStart = (lead, status) => {
    setDraggedLead({ ...lead, sourceStatus: status });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStatus) => {
    if (!draggedLead || draggedLead.sourceStatus === targetStatus) {
      setDraggedLead(null);
      return;
    }

    try {
      // Update the lead's status in the backend
      const response = await axiosInstance.post(
        `/lead/UpdateLead/${draggedLead.id}`,
        {
          Status: targetStatus,
        }
      );

      if (response.data.success) {
        // Update local state
        setOpportunities((prev) => {
          const newState = { ...prev };
          // Remove from source status
          newState[draggedLead.sourceStatus] = newState[
            draggedLead.sourceStatus
          ].filter((lead) => lead.id !== draggedLead.id);
          // Add to target status
          newState[targetStatus] = [
            ...newState[targetStatus],
            { ...draggedLead, Status: targetStatus },
          ];
          return newState;
        });

        toast.success("Lead status updated successfully");
      } else {
        toast.error("Failed to update lead status");
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }

    setDraggedLead(null);
  };

  // Filter helpers
  const meetingEvents = events.filter(
    (ev) =>
      ev.Meeting_Link ||
      (ev.Task_Title && ev.Task_Title.toLowerCase().includes("meeting"))
  );
  const callEvents = events.filter(
    (ev) =>
      (ev.Task_Title && ev.Task_Title.toLowerCase().includes("call")) ||
      (ev.Description && ev.Description.toLowerCase().includes("call"))
  );
  // Before rendering People table, define visiblePeople
  const visiblePeople = Array.isArray(people)
    ? people.filter(
        (person) =>
          person?.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person?.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person?.Company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person?.Title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Update getAllVisibleLeadIds to use visiblePeople in People tab
  const getAllVisibleLeadIds = () => {
    if (activeTab === "Accounts") {
      return accounts
        .filter(
          (account) =>
            account?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (Array.isArray(account.leads) &&
              account.leads.some(
                (lead) =>
                  lead?.Name?.toLowerCase().includes(
                    searchQuery.toLowerCase()
                  ) ||
                  lead?.Email?.toLowerCase().includes(searchQuery.toLowerCase())
              ))
        )
        .flatMap((account) => account.leads.map((lead) => lead.id));
    } else if (activeTab === "People") {
      return visiblePeople.map((person) => person.id);
    }
    return [];
  };

  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(getAllVisibleLeadIds());
    } else {
      setSelectedLeads([]);
    }
  };

  // Individual select handler
  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Delete handler (no confirm here)
  const handleDeleteSelected = async () => {
    console.log("Deleting", selectedLeads);
    if (selectedLeads.length === 0) return;
    let notFoundCount = 0;
    let deletedCount = 0;
    await Promise.all(
      selectedLeads.map(async (id) => {
        try {
          await axiosInstance.delete(`/lead/DeleteLead/${id}`);
          deletedCount++;
        } catch (err) {
          if (err?.response?.status === 404) {
            notFoundCount++;
          } else {
            toast.error(
              "Failed to delete a lead: " +
                (err?.response?.data?.message || err.message)
            );
          }
        }
      })
    );
    setSelectedLeads([]);
    await fetchLeads();
    if (deletedCount > 0 && notFoundCount === 0) {
      toast.success("Selected lead(s) deleted");
    } else if (deletedCount > 0 && notFoundCount > 0) {
      toast.success(
        `Some leads deleted, but ${notFoundCount} were not found (already removed or not in your workspace).`
      );
    } else if (notFoundCount > 0) {
      toast.error(`No leads deleted. ${notFoundCount} were not found.`);
    }
    setShowDeleteModal(false);
  };

  // Import Leads handler functions
  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        showImportDropdown &&
        !e.target.closest(".import-dropdown") &&
        !e.target.closest(".import-btn")
      ) {
        setShowImportDropdown(false);
      }
    };
    if (showImportDropdown) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showImportDropdown]);

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
        } else {
          setCsvData(results.data);
          setCsvPreview(results.data.slice(0, 5));
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
      // Refresh the leads data
      fetchLeads();
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
        throw new Error("Failed to fetch contacts from HubSpot");
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results))
        throw new Error("Invalid response from HubSpot");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Relationship Management
          </h1>
          <p className="text-gray-600">
            Manage your accounts, people, and opportunities
          </p>
        </div>
        {/* Chatbot */}
        <Chatbot />

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8 bg-white rounded-t-lg shadow-sm">
          <nav className="flex flex-wrap">
            {["Accounts", "People", "Opportunities", "Calls", "Meetings"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab
                      ? "border-[#16C47F] text-[#16C47F] bg-[#16C47F]/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Search and Filters */}
        {(activeTab === "Accounts" ||
          activeTab === "People" ||
          activeTab === "Opportunities" ||
          activeTab === "Calls" ||
          activeTab === "Meetings") && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16C47F]/20 focus:border-[#16C47F] focus:bg-white transition-all duration-200 sm:text-sm"
                  placeholder={
                    activeTab === "Accounts"
                      ? "Search companies..."
                      : activeTab === "People"
                      ? "Search people..."
                      : activeTab === "Opportunities"
                      ? "Search opportunities..."
                      : activeTab === "Calls"
                      ? "Search calls..."
                      : "Search meetings..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {activeTab === "Accounts" && (
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="px-4 py-3 border border-gray-200 cursor-pointer text-gray-600 rounded-xl flex gap-2 items-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-600">{sortOrder}</span>
                      <ChevronDown className="text-gray-400 h-4 w-4" />
                    </button>
                    {showSortDropdown && (
                      <div className="absolute z-10 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100">
                        <div className="py-2">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(activeTab === "Calls" || activeTab === "Meetings") && (
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                      {sortOrder}
                      <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                    </Menu.Button>
                    <Menu.Items className="absolute z-10 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100">
                      <div className="py-2">
                        {sortOptions.map((option) => (
                          <Menu.Item key={option.value}>
                            {({ active }) => (
                              <button
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                  active ? "bg-gray-50" : ""
                                }`}
                                onClick={() => handleSortChange(option.value)}
                              >
                                {option.label}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Menu>
                )}

                {/* Import Leads Button and Dropdown */}
                <div className="relative flex items-center gap-2">
                  <button
                    className="px-4 py-3 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl shadow border-2 border-green-700 import-btn transition-all duration-200"
                    onClick={() => setShowImportDropdown((v) => !v)}
                  >
                    <Upload className="inline-block w-4 h-4 mr-2" /> Import
                    Leads
                  </button>
                  {showImportDropdown && (
                    <div className="import-dropdown absolute right-0 top-full mt-2 min-w-[220px] max-w-[320px] w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 animate-fade-in transition-all duration-150">
                      <div className="px-4 pt-2 pb-1 font-semibold text-gray-700 text-base border-b border-gray-100">
                        Import Leads From
                      </div>
                      <button
                        className="flex flex-col items-start w-full px-4 py-2 hover:bg-green-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group"
                        onClick={() => {
                          setImportModal("csv");
                          setShowImportDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-green-600" />{" "}
                          CSV File
                        </div>
                        <span className="text-xs text-gray-400 ml-7 group-hover:text-green-700">
                          Upload a CSV file
                        </span>
                      </button>
                      <button
                        className="flex flex-col items-start w-full px-4 py-2 hover:bg-green-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group"
                        onClick={() => {
                          setImportModal("sheets");
                          setShowImportDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <Sheet className="w-5 h-5 mr-2 text-green-600" />{" "}
                          Google Sheets
                        </div>
                        <span className="text-xs text-gray-400 ml-7 group-hover:text-green-700">
                          Import from a Google Sheets file
                        </span>
                      </button>
                      <div className="my-2 border-t border-gray-200"></div>
                      <button
                        className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group"
                        onClick={() => {
                          setImportModal("hubspot");
                          setShowImportDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <Link2 className="w-5 h-5 mr-2 text-blue-600" />{" "}
                          HubSpot
                        </div>
                        <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">
                          Connect your HubSpot account
                        </span>
                      </button>
                      <button
                        className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group"
                        onClick={() => {
                          toast("Coming soon!");
                          setShowImportDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <Database className="w-5 h-5 mr-2 text-blue-600" />{" "}
                          Pipedrive
                        </div>
                        <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">
                          Connect your Pipedrive account
                        </span>
                      </button>
                      <button
                        className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group"
                        onClick={() => {
                          toast("Coming soon!");
                          setShowImportDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <Cloud className="w-5 h-5 mr-2 text-blue-600" />{" "}
                          Salesforce
                        </div>
                        <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">
                          Connect your Salesforce account
                        </span>
                      </button>
                      <button
                        className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group"
                        onClick={() => {
                          toast("Coming soon!");
                          setShowImportDropdown(false);
                        }}
                      >
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" /> Zoho
                        </div>
                        <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">
                          Connect your Zoho account
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-[#16C47F] hover:bg-[#14B86F] focus:outline-none focus:ring-2 focus:ring-[#16C47F]/20 transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Grid */}
        {activeTab === "Accounts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts
              .filter(
                (account) =>
                  account.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  account.leads.some(
                    (lead) =>
                      lead.Name.toLowerCase().includes(
                        searchQuery.toLowerCase()
                      ) ||
                      lead.Email?.toLowerCase().includes(
                        searchQuery.toLowerCase()
                      )
                  )
              )
              .map((account) => (
                <Link
                  key={account.id}
                  to={`/Accounts/${account?.name}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-[#16C47F]/20 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`${account.logoBackground} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm`}
                          >
                            {account.logo ? (
                              <img
                                src={account.logo}
                                alt={account.name}
                                className="w-8 h-8"
                              />
                            ) : (
                              <span className="text-xl font-bold">
                                {account.name[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-[#16C47F] transition-colors">
                              {account.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {account.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCompanyExpand(account.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {expandedCompanies[account.id] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {account.contactAvatars.map((avatar, index) => (
                              <div
                                key={index}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white shadow-sm ${
                                  index % 3 === 0
                                    ? "bg-[#16C47F]"
                                    : index % 3 === 1
                                    ? "bg-[#FF9D23]"
                                    : "bg-blue-500"
                                }`}
                              >
                                {avatar}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {account.contacts} Contact
                            {account.contacts !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {account.website !== "Not specified" && (
                          <a
                            href={
                              account.website.startsWith("http")
                                ? account.website
                                : `https://${account.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#16C47F] hover:text-[#14B86F] flex items-center gap-1 text-sm font-medium transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                            Visit
                          </a>
                        )}
                      </div>

                      {expandedCompanies[account.id] && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <div className="space-y-3">
                            {account.leads.map((lead) => (
                              <div
                                key={lead.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Checkbox for individual lead */}
                                  <input
                                    type="checkbox"
                                    checked={selectedLeads.includes(lead.id)}
                                    onChange={() => handleSelectLead(lead.id)}
                                    className="rounded border-muted cursor-pointer mr-2 checked:bg-green-500 checked:border-green-500 focus:ring-green-500"
                                  />
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16C47F] to-[#FF9D23] flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {lead.Name.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {lead.Name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {lead.Title}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {lead.Email && (
                                    <a
                                      href={`mailto:${lead.Email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[#16C47F] hover:text-[#14B86F] text-sm font-medium transition-colors"
                                    >
                                      {lead.Email}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {/* People Table */}
        {activeTab === "People" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr className="border-b border-gray-200">
                    <th className="whitespace-nowrap px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#16C47F] focus:ring-[#16C47F] cursor-pointer"
                        checked={selectAll}
                        onChange={(e) => setSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CONTACT
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      COMPANY
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      TITLE
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      PROVIDER
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {people
                    .filter(
                      (person) =>
                        person.Name?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        person.Email?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        person.Company?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        person.Title?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        )
                    )
                    .map((person) => (
                      <tr
                        key={person.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#16C47F] focus:ring-[#16C47F] cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`mailto:${person.Email}`}
                            className="text-gray-700 hover:text-[#16C47F] transition-colors font-medium"
                          >
                            {person.Email}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16C47F] to-[#FF9D23] flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {person.Name.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {person.Name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {person.Company || "Not specified"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {person.Title || "Not specified"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {person.provider === "Google" && (
                              <FcGoogle size={20} />
                            )}
                            <span className="text-gray-700">
                              {person.provider}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {person.status === "Verified" ? (
                            <div className="inline-flex items-center gap-1 bg-[#16C47F]/10 rounded-full px-3 py-1">
                              <CircleCheck
                                size={16}
                                className="text-[#16C47F]"
                              />
                              <span className="text-[#16C47F] text-sm font-medium">
                                Verified
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Not contacted
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Opportunities Kanban Board */}
        {activeTab === "Opportunities" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16C47F]/20 focus:border-[#16C47F] transition-all duration-200 sm:text-sm"
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                      {opportunityStatus}
                      <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                    </Menu.Button>
                    <Menu.Items className="absolute z-10 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100">
                      <div className="py-2">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                active ? "bg-gray-50" : ""
                              }`}
                              onClick={() =>
                                setOpportunityStatus("All statuses")
                              }
                            >
                              All statuses
                            </button>
                          )}
                        </Menu.Item>
                        {Object.keys(statusConfig).map((status) => (
                          <Menu.Item key={status}>
                            {({ active }) => (
                              <button
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                  active ? "bg-gray-50" : ""
                                }`}
                                onClick={() => setOpportunityStatus(status)}
                              >
                                {status}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Menu>
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                      {sortOrder}
                      <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                    </Menu.Button>
                    <Menu.Items className="absolute z-10 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100">
                      <div className="py-2">
                        {sortOptions.map((option) => (
                          <Menu.Item key={option.value}>
                            {({ active }) => (
                              <button
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                  active ? "bg-gray-50" : ""
                                }`}
                                onClick={() => handleSortChange(option.value)}
                              >
                                {option.label}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Menu>
                  <button className="bg-gradient-to-r from-[#16C47F] to-[#FF9D23] text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:from-[#14B86F] hover:to-[#E8891F] transition-all duration-200">
                    Call with AI
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#16C47F] focus:ring-[#16C47F] cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Expected Close
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actual Close
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {people
                    .filter(
                      (lead) =>
                        (opportunityStatus === "All statuses" ||
                          lead.Status === opportunityStatus) &&
                        (lead.Name?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                          lead.Company?.toLowerCase().includes(
                            searchQuery.toLowerCase()
                          ) ||
                          lead.Email?.toLowerCase().includes(
                            searchQuery.toLowerCase()
                          ))
                    )
                    .map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#16C47F] focus:ring-[#16C47F] cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {lead.Company || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16C47F] to-[#FF9D23] flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {lead.Name.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <span className="text-[#16C47F] font-medium cursor-pointer hover:text-[#14B86F]">
                              {lead.Name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {lead.Amount ? `$${lead.Amount}` : "-"}
                        </td>
                        <td className="px-6 py-4 text-[#16C47F] font-medium">
                          {lead.Owner || "Beeto Leru"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {lead.Source || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {lead.ExpectedClosingDate
                            ? new Date(
                                lead.ExpectedClosingDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {lead.ActualClosingDate
                            ? new Date(
                                lead.ActualClosingDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {lead.LastInteraction
                            ? new Date(lead.LastInteraction).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {lead.Status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calls Table */}
        {activeTab === "Calls" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Call Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calls
                    .filter(
                      (call) =>
                        call.Lead?.Name?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        call.PhoneNumber?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        call.Notes?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        )
                    )
                    .map((call) => (
                      <tr
                        key={call.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#16C47F]/10 flex items-center justify-center">
                              <PhoneCall className="h-4 w-4 text-[#16C47F]" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {call.Lead ? call.Lead.Name : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {call.CallDate
                            ? new Date(call.CallDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {call.CallDuration ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[#16C47F]/10 text-[#16C47F]">
                              {call.CallDuration} min
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-mono">
                          {call.PhoneNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                          {call.Notes || "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meetings Table */}
        {activeTab === "Meetings" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Host
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Meeting Link
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meetings
                    .filter(
                      (meeting) =>
                        meeting.Topic?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        meeting.Lead?.Name?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        meeting.User?.Name?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        ) ||
                        meeting.Notes?.toLowerCase().includes(
                          searchQuery.toLowerCase()
                        )
                    )
                    .map((meeting) => (
                      <tr
                        key={meeting.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FF9D23]/10 flex items-center justify-center">
                              <CalendarDays className="h-4 w-4 text-[#FF9D23]" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {meeting.Topic}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {meeting.MeetingDate
                            ? new Date(meeting.MeetingDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {meeting.MeetingTime ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[#FF9D23]/10 text-[#FF9D23]">
                              {meeting.MeetingTime}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {meeting.Lead ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#16C47F] to-[#FF9D23] flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {meeting.Lead.Name.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <span className="text-gray-900">
                                {meeting.Lead.Name}
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {meeting.User ? meeting.User.Name : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {meeting.Meeting_Link ? (
                            <a
                              href={meeting.Meeting_Link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#16C47F] text-white hover:bg-[#14B86F] transition-colors"
                            >
                              Join Meeting
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                          {meeting.Notes || "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Inbox Tab */}
        {activeTab === "Inbox" && (
          <div className="bg-white rounded-lg shadow">
            <Inbox />
          </div>
        )}

        {/* Lead View Tab */}
        {activeTab === "Lead View" && (
          <div className="bg-white rounded-lg shadow">
            <LeadView />
          </div>
        )}
        {/* Other tabs content */}
        {!["Accounts", "People", "Opportunities", "Calls", "Meetings"].includes(
          activeTab
        ) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-500">
                {activeTab} tab content will be implemented soon
              </p>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4 text-red-600">
                Are you sure you want to delete?
              </h2>
              <p className="mb-4 text-gray-700">
                This will permanently delete {selectedLeads.length} Lead(s).
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteSelected}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modals */}
      {importModal === "csv" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setImportModal(null);
                setCsvData(null);
                setCsvPreview([]);
                setCsvError("");
              }}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Import from CSV</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVFile}
              className="mb-2"
            />
            {csvError && (
              <div className="text-red-500 text-sm mb-2">{csvError}</div>
            )}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">
                  Preview (first 5 rows):
                </div>
                <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                  {JSON.stringify(csvPreview, null, 2)}
                </pre>
              </div>
            )}
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleCSVImport}
              disabled={!csvData || csvUploading || !!csvError}
            >
              {csvUploading ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      )}
      {importModal === "sheets" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setImportModal(null);
                setCsvData(null);
                setCsvPreview([]);
                setCsvError("");
              }}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">
              Import from Google Sheets
            </h2>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleGoogleSheetFile}
              className="mb-2"
            />
            {csvError && (
              <div className="text-red-500 text-sm mb-2">{csvError}</div>
            )}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">
                  Preview (first 5 rows):
                </div>
                <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                  {JSON.stringify(csvPreview, null, 2)}
                </pre>
              </div>
            )}
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleCSVImport}
              disabled={!csvData || csvUploading}
            >
              {csvUploading ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      )}
      {importModal === "hubspot" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setImportModal(null);
                setCsvData(null);
                setCsvPreview([]);
                setCsvError("");
                setHubspotApiKey("");
              }}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Import from HubSpot</h2>
            {!hubspotLoading && !csvData && (
              <div className="mb-4">
                <p className="mb-2">
                  To import leads from HubSpot, you must connect your HubSpot
                  account.
                </p>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  onClick={() => {
                    window.location.href = "http://localhost:4000/auth/hubspot";
                  }}
                >
                  Connect to HubSpot
                </button>
              </div>
            )}
            {hubspotLoading && (
              <div className="mb-2 text-gray-500">
                Loading leads from HubSpot...
              </div>
            )}
            {csvError && (
              <div className="text-red-500 text-sm mb-2">{csvError}</div>
            )}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">
                  Preview (first 5 rows):
                </div>
                <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                  {JSON.stringify(csvPreview, null, 2)}
                </pre>
              </div>
            )}
            {csvData && (
              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={handleCSVImport}
                disabled={!csvData || csvUploading}
              >
                {csvUploading ? "Importing..." : "Import"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
