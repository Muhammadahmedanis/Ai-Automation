import {
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock,
  Globe,
  MapPin,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../api/axios";

function Accounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const param = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/lead/GetAllLeads");

        if (response.data.success) {
          const updatedLeads = response.data.leads.map((lead) => ({
            ...lead,
            status: lead.Status || "Not yet contacted",
            provider: lead.Email?.includes("@gmail.com")
              ? "Google"
              : lead.Email?.includes("@outlook.com")
              ? "Microsoft"
              : lead.Email?.includes("@yahoo.com")
              ? "Yahoo"
              : "Other",
          }));

          setPeople(updatedLeads);

          if (param.name) {
            const filtered = updatedLeads.filter(
              (lead) =>
                lead.Company &&
                lead.Company.toLowerCase() === param.name.toLowerCase()
            );
            setFilteredPeople(filtered);
          } else {
            setFilteredPeople(updatedLeads);
          }
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
        setError("Failed to load contacts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [param.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#16C47F]"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#16C47F]/20 to-transparent animate-pulse"></div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Loading your contacts
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    We're fetching your contact data and preparing everything
                    for you
                  </p>
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-[#16C47F] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#16C47F] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#16C47F] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-10 h-10 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 max-w-md">
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-[#16C47F] to-[#14b36f] hover:from-[#14b36f] hover:to-[#12a05f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16C47F] transition-all duration-300 transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayPeople = filteredPeople.filter(
    (person) =>
      person.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.Company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.Title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Contacts
              </h1>
              <p className="text-gray-600">
                Manage and organize your contact database
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Live Data
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b bg-gradient-to-r from-white via-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:border-transparent focus:bg-white sm:text-sm transition-all duration-300 shadow-sm"
                    placeholder="Search by name, email, company, or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>
                    Total:{" "}
                    <span className="font-bold text-gray-900">
                      {displayPeople.length}
                    </span>
                  </span>
                </div>
                <button className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-[#16C47F] to-[#14b36f] text-white text-sm font-medium rounded-xl hover:from-[#14b36f] hover:to-[#12a05f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16C47F] transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Contact
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="space-y-4 p-6">
              {displayPeople.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center shadow-lg">
                      <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xl font-semibold text-gray-900">
                        {param.name
                          ? `No contacts found for ${param.name}`
                          : "No contacts found"}
                      </div>
                      <div className="text-sm text-gray-500 max-w-sm">
                        Try adjusting your search criteria or add new contacts
                        to get started
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                displayPeople.map((person, index) => (
                  <div
                    key={person.id || index}
                    className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#16C47F]/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 cursor-pointer w-5 h-5 text-[#16C47F] focus:ring-[#16C47F] focus:ring-2"
                          />
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {person.Name}
                          </h3>
                        </div>
                        <a
                          href={`mailto:${person.Email}`}
                          className="text-[#16C47F] hover:text-[#14b36f] font-medium transition-colors duration-150 flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {person.Email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        {person.status === "Verified" ? (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-3 py-2 shadow-sm">
                            <CircleCheck size={16} className="text-green-600" />
                            <span className="text-green-700 font-medium text-sm">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full px-3 py-2 shadow-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <span className="text-gray-500 uppercase tracking-wide text-xs font-semibold">
                          Company
                        </span>
                        <div className="text-gray-900 font-medium">
                          {person.Company || "Not specified"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500 uppercase tracking-wide text-xs font-semibold">
                          Title
                        </span>
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200">
                            {person.Title || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                            Provider:
                          </span>
                          <div className="flex items-center gap-2">
                            {person.provider === "Google" && (
                              <FcGoogle size={18} />
                            )}
                            {person.provider === "Microsoft" && (
                              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                M
                              </div>
                            )}
                            {person.provider === "Yahoo" && (
                              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                Y
                              </div>
                            )}
                            {person.provider === "Other" && (
                              <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                ?
                              </div>
                            )}
                            <span className="text-sm text-gray-700 font-medium">
                              {person.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 cursor-pointer w-5 h-5 text-[#16C47F] focus:ring-[#16C47F] focus:ring-2"
                        checked={selectAll}
                        onChange={(e) => setSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800 uppercase tracking-wider text-sm">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        EMAIL
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800 uppercase tracking-wider text-sm">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        CONTACT
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800 uppercase tracking-wider text-sm hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        COMPANY
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800 uppercase tracking-wider text-sm hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
                          />
                        </svg>
                        TITLE
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800 uppercase tracking-wider text-sm hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v4a2 2 0 01-2 2"
                          />
                        </svg>
                        PROVIDER
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left font-bold text-gray-800 uppercase tracking-wider text-sm">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        STATUS
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {displayPeople.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-500 py-16"
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center shadow-lg">
                            <Search className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <div className="text-xl font-semibold text-gray-900">
                              {param.name
                                ? `No contacts found for ${param.name}`
                                : "No contacts found"}
                            </div>
                            <div className="text-sm text-gray-500 max-w-md">
                              Try adjusting your search criteria or add new
                              contacts to get started
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayPeople.map((person, index) => (
                      <tr
                        key={person.id || index}
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group"
                      >
                        <td className="px-6 py-5">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 cursor-pointer w-5 h-5 text-[#16C47F] focus:ring-[#16C47F] focus:ring-2"
                          />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-1">
                            <a
                              href={`mailto:${person.Email}`}
                              className="text-[#16C47F] hover:text-[#14b36f] font-semibold transition-colors duration-150 flex items-center gap-2 group-hover:underline"
                            >
                              <svg
                                className="w-4 h-4 opacity-60"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {person.Email}
                            </a>
                            <div className="sm:hidden text-xs text-gray-500 font-medium">
                              {person.Name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden sm:table-cell">
                          <div className="flex flex-col space-y-1">
                            <div className="font-semibold text-gray-900 text-base">
                              {person.Name}
                            </div>
                            <div className="text-sm text-gray-500 md:hidden font-medium">
                              {person.Company || "Not specified"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-600 hidden md:table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm"></div>
                            <span className="font-medium">
                              {person.Company || "Not specified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-600 hidden lg:table-cell">
                          <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200 shadow-sm">
                            {person.Title || "Not specified"}
                          </span>
                        </td>
                        <td className="px-6 py-5 hidden sm:table-cell">
                          <div className="flex items-center gap-3">
                            {person.provider === "Google" && (
                              <FcGoogle size={22} />
                            )}
                            {person.provider === "Microsoft" && (
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                M
                              </div>
                            )}
                            {person.provider === "Yahoo" && (
                              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                Y
                              </div>
                            )}
                            {person.provider === "Other" && (
                              <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                ?
                              </div>
                            )}
                            <span className="text-sm text-gray-700 font-medium">
                              {person.provider}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {person.status === "Verified" ? (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 shadow-sm">
                                <CircleCheck
                                  size={18}
                                  className="text-green-600"
                                />
                                <span className="text-green-700 font-semibold text-sm">
                                  Verified
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600 font-medium">
                                  Pending
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accounts;
