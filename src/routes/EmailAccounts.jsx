import React, { useState, useEffect } from "react";
import { FaEllipsisH, FaFilter, FaChevronDown } from "react-icons/fa";
import { FaBackward } from "react-icons/fa";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEmailAccountQuery } from "../reactQuery/hooks/useEmailAccountsQuery";
import {
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  CircleCheckBig,
  Pause,
  Play,
  Plus,
  ShieldX,
  SquarePen,
  Zap,
} from "lucide-react";

// OAuth Callback Component
const OAuthCallback = () => {
  const [status, setStatus] = useState("Processing...");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get all URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const error = params.get("error");
        const provider = params.get("provider") || "microsoft"; // Default to microsoft if not specified

        // Get Google-specific parameters if provider is Google
        // make all the letters of provider small
        const lowerCaseProvider = provider.toLowerCase();
        let callbackUrl;
        console.log(lowerCaseProvider);
        if (lowerCaseProvider === "google") {
          const scope = params.get("scope");
          const authuser = params.get("authuser");
          const prompt = params.get("prompt");
          callbackUrl = `https://quick-pipe-backend.vercel.app/EmailAccount/google/callback?code=${code}&scope=${scope}&authuser=${authuser}&prompt=${prompt}`;
        } else {
          // Microsoft callback only needs the code
          callbackUrl = `https://quick-pipe-backend.vercel.app/EmailAccount/microsoft/callback?code=${code}`;
        }

        if (error) {
          setStatus(`Error: ${error}`);
          return;
        }

        if (!code) {
          setStatus("No authorization code received");
          return;
        }

        // Get token from localStorage
        const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");
        if (!token) {
          setStatus("No authentication token found");
          return;
        }
        console.log("Making callback request to:", callbackUrl);

        // Send the request to your backend
        const response = await axios.get(callbackUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Callback response:", response.data);

        if (response.data.success) {
          setStatus("Successfully connected!");
          // Close this window and notify the opener
          window.opener.postMessage(
            {
              type: "OAUTH_SUCCESS",
              data: response.data,
              provider: provider,
            },
            window.opener.origin
          );
          setTimeout(() => window.close(), 2000);
        } else {
          setStatus("Failed to connect: " + response.data.message);
        }
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("Error: " + (error.response?.data?.message || error.message));
      }
    };

    handleCallback();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          Connecting Your Account
        </h2>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15A395] mx-auto mb-4"></div>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
};

const EmailAccounts = () => {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAccountsPage, setShowAccountsPage] = useState(false);
  const [authWindow, setAuthWindow] = useState(null);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const listItems = [
    { name: "All Statuses", icon: "⚡" },
    { name: "Active", icon: <Play size={20} className="text-blue-400" /> },
    { name: "Draft", icon: <SquarePen size={20} className="text-gray-600" /> },
    { name: "Paused", icon: <Pause size={20} className="text-orange-400" /> },
    { name: "Error", icon: <ShieldX size={20} className="text-red-600" /> },
    {
      name: "Completed",
      icon: <CircleCheck size={20} className="text-green-400" />,
    },
  ];

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState("Oldest first");
  const [campaigns, setCampaigns] = useState([]);
  const sortOptions = [
    { value: "Newest first", label: "Newest first" },
    { value: "Oldest first", label: "Oldest first" },
    { value: "Name A - Z", label: "Name A - Z" },
    { value: "Name Z - A", label: "Name Z - A" },
  ];

  const handleSortChange = (sort) => {
    setSortOrder(sort);
    setShowSortDropdown(false);
    const sortedCampaigns = [...campaigns];

    if (sort === "Newest first") {
      sortedCampaigns.sort((a, b) => b.id - a.id);
    } else if (sort === "Oldest first") {
      sortedCampaigns.sort((a, b) => a.id - b.id);
    } else if (sort === "Name A - Z") {
      sortedCampaigns.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "Name Z - A") {
      sortedCampaigns.sort((a, b) => b.name.localeCompare(a.name));
    }
    setCampaigns(sortedCampaigns);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Get email accounts data from the query
  const { emailAccountsObject, isEmailAccountsLoading, emailAccountsError } =
    useEmailAccountQuery();

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(
        emailAccountsObject?.emailAccounts?.map((account) => account.id) || []
      );
    }
    setSelectAll(!selectAll);
  };

  // Function to validate OAuth URL
  const validateOAuthUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const missingParams = [];
      if (!params.get("client_id")) missingParams.push("client_id");
      if (
        !params.get("redirect_uri") ||
        params.get("redirect_uri").includes("undefined")
      ) {
        missingParams.push("redirect_uri");
      }
      if (!params.get("scope")) missingParams.push("scope");
      if (!params.get("response_type")) missingParams.push("response_type");

      if (missingParams.length > 0) {
        throw new Error(
          `Missing or invalid parameters: ${missingParams.join(", ")}`
        );
      }

      return true;
    } catch (error) {
      console.error("URL validation error:", error);
      return false;
    }
  };

  // Function to handle Google OAuth
  const handleGoogleAuth = async () => {
    try {
      setError(null);
      // Get token from localStorage
      const tokenData = localStorage.getItem("Token")?.replace(/^"|"$/g, "");
      console.log("Token from localStorage:", tokenData);

      if (!tokenData) {
        setError("No authentication token found");
        console.error("No authentication token found");
        return;
      }

      const token = tokenData;
      console.log("Extracted token:", token);

      // Get the Google OAuth URL from your backend
      console.log("Making request to backend...");
      const response = await axios.get(
        "https://quick-pipe-backend.vercel.app/EmailAccount/ReadyGmailAccount",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Full backend response:", response);
      console.log("Response data:", response.data);
      console.log("Auth URL from backend:", response.data.url);

      if (response.data.success) {
        const authUrl = response.data.url;

        // Validate the URL before opening
        if (!validateOAuthUrl(authUrl)) {
          setError("Invalid OAuth configuration. Please contact support.");
          console.error("Invalid OAuth URL:", authUrl);
          return;
        }

        console.log("Opening Google auth URL:", authUrl);
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          authUrl,
          "Google Auth",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for the success message from the callback page
        const handleMessage = (event) => {
          if (event.data.type === "OAUTH_SUCCESS") {
            console.log("OAuth successful:", event.data);
            // Update your UI or refresh data here
            authWindow.close();
          }
        };

        window.addEventListener("message", handleMessage);

        // Add event listener for window close
        const checkWindow = setInterval(() => {
          if (authWindow.closed) {
            console.log("Auth window was closed");
            clearInterval(checkWindow);
            window.removeEventListener("message", handleMessage);
            // You might want to refresh the page or update the UI here
          }
        }, 1000);
      } else {
        setError(response.data.message || "Failed to get Google auth URL");
        console.error("Failed to get Google auth URL:", response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      setError(errorMessage);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
  };

  // Function to handle Microsoft OAuth
  const handleMicrosoftAuth = async () => {
    try {
      setError(null);
      // Get token from localStorage
      const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");
      console.log("Token from localStorage:", token);

      if (!token) {
        setError("No authentication token found");
        console.error("No authentication token found");
        return;
      }

      console.log("Extracted token:", token);

      // Get the Microsoft OAuth URL from your backend
      console.log("Making request to backend...");
      const response = await axios.get(
        "https://quick-pipe-backend.vercel.app/EmailAccount/ReadyMicrosoftAccount",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Full backend response:", response);
      console.log("Response data:", response.data);
      console.log("Auth URL from backend:", response.data.url);

      if (response.data.success) {
        const authUrl = response.data.url;

        // Validate the URL before opening
        if (!authUrl) {
          setError("Invalid OAuth configuration. Please contact support.");
          console.error("Invalid OAuth URL:", authUrl);
          return;
        }

        console.log("Opening Microsoft auth URL:", authUrl);
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        let authWindow = null;
        try {
          authWindow = window.open(
            authUrl,
            "Microsoft Auth",
            `width=${width},height=${height},left=${left},top=${top}`
          );

          if (!authWindow) {
            throw new Error(
              "Popup window was blocked. Please allow popups for this site."
            );
          }

          // Listen for the success message from the callback page
          const handleMessage = (event) => {
            if (
              event.data.type === "OAUTH_SUCCESS" &&
              event.data.provider === "microsoft"
            ) {
              console.log("Microsoft OAuth successful:", event.data);
              // Update your UI or refresh data here
              if (authWindow) {
                authWindow.close();
              }
            }
          };

          window.addEventListener("message", handleMessage);

          // Add event listener for window close
          const checkWindow = setInterval(() => {
            if (authWindow && authWindow.closed) {
              console.log("Auth window was closed");
              clearInterval(checkWindow);
              window.removeEventListener("message", handleMessage);
              // You might want to refresh the page or update the UI here
            }
          }, 1000);
        } catch (windowError) {
          console.error("Error opening auth window:", windowError);
          setError(
            windowError.message ||
              "Failed to open authentication window. Please allow popups for this site."
          );
        }
      } else {
        setError(response.data.message || "Failed to get Microsoft auth URL");
        console.error(
          "Failed to get Microsoft auth URL:",
          response.data.message
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      setError(errorMessage);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
  };

    const AccountsSelectionPage = () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setShowAccountsPage(false)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
            >
              <ChevronLeft size={20} className="mr-2" />
              <span className="font-medium">Back to Email Accounts</span>
            </button>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Email Setup
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the option that best fits your needs to get started with email automation
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* First Card - Ready-to-send accounts */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#15A395]/30 overflow-hidden">
              {/* Card Header with Icon */}
              <div className="bg-[#16C47F] p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Zap size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Ready-to-send accounts
                </h3>
                <p className="text-white/90 text-sm">
                  Instant setup with premium domains
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <Link to="/email-domain" className="block mb-6">
                  <button className="w-full bg-[#16C47F] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Get Started Now
                  </button>
                </Link>

                <div className="space-y-4">
                  {[
                    "Ready-to-use accounts & domains",
                    "Launch your outreach immediately", 
                    "Expand your campaigns seamlessly",
                    "Enhanced email deliverability",
                    "Premium US-based IP accounts"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <CircleCheckBig size={14} className="text -[#16C47F]" />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Second Card - Google/Gmail Setup */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden">
              {/* Card Header with Icon */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Hassle-free email setup
                </h3>
                <p className="text-white/90 text-sm">
                  Connect your existing Gmail account
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <button
                  onClick={handleGoogleAuth}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg mb-6 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect Gmail / Google Suite
                </button>

                <div className="space-y-4">
                  {[
                    "Accounts set up for you",
                    "Pick your domain & account names",
                    "Seamless auto-reconnect",
                    "Cut costs & boost efficiency",
                    "Premium US-based IP accounts"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <CircleCheckBig size={14} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Third Card - Microsoft Setup */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-300 overflow-hidden">
              {/* Card Header with Icon */}
              <div className="bg-[#FF9D23] p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Microsoft Office 365
                </h3>
                <p className="text-white/90 text-sm">
                  Connect your Outlook account
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <button
                  onClick={handleMicrosoftAuth}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-orange-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg mb-4 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5 text-[#FF9D23]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                  </svg>
                  Connect Microsoft Office 365
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    "Connect any IMAP or SMTP email provider",
                    "Sync up replies in the Multibox"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                        <CircleCheckBig size={14} className="text-orange-600" />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );

  return (
    <>
      {showAccountsPage ? (
        <AccountsSelectionPage />
      ) : (
        <div className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 xl:px-32 pt-4 sm:pt-6 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search email accounts..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15A395] focus:border-transparent transition-all duration-200 text-gray-700"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <div className="relative">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#15A395] focus:border-transparent transition-all duration-200"
                    >
                      <Zap size={16} className="mr-2 text-gray-500" />
                      <span className="text-sm font-medium">All Statuses</span>
                      <ChevronDown size={16} className="ml-2 text-gray-400" />
                    </button>
                    {isOpen && (
                      <div className="absolute z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <ul className="py-2">
                          {listItems.map((val, index) => (
                            <li
                              key={index}
                              className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            >
                              {val.icon}
                              <span className="text-sm text-gray-700">
                                {val.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#15A395] focus:border-transparent transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSortDropdown(!showSortDropdown);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <span className="text-sm font-medium">{sortOrder}</span>
                      <ChevronDown size={16} className="ml-2 text-gray-400" />
                    </button>

                    {showSortDropdown && (
                      <div
                        className="absolute z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
                        onClick={handleDropdownClick}
                      >
                        <div className="py-2">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                sortOrder === option.value
                                  ? "text-[#15A395] font-medium bg-green-50"
                                  : "text-gray-700"
                              }`}
                              onClick={() => handleSortChange(option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add New Button */}
                  <button
                    className="inline-flex items-center px-4 py-2.5  text-white rounded-lg bg-[#16C47F] hover:bg-[#FF9D23] cursor-pointer transition-all duration-200 font-medium"
                    onClick={() => setShowAccountsPage(true)}>
                      <Plus size={16} />
                    Add New
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-[#15A395] border-gray-300 rounded focus:ring-[#15A395]"
                          />
                          Email Address
                        </div>
                      </th>
                      <th className="text-center py-4 px-3 text-sm font-semibold text-gray-700">
                        Emails Sent
                      </th>
                      <th className="text-center py-4 px-3 text-sm font-semibold text-gray-700">
                        Warmup Emails
                      </th>
                      <th className="text-center py-4 px-3 text-sm font-semibold text-gray-700">
                        Health Score
                      </th>
                      <th className="w-12 py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isEmailAccountsLoading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-12 text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15A395] mb-3"></div>
                            Loading email accounts...
                          </div>
                        </td>
                      </tr>
                    ) : emailAccountsError ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-12 text-red-500"
                        >
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Error loading email accounts
                          </div>
                        </td>
                      </tr>
                    ) : (
                      emailAccountsObject?.emailAccounts?.map((account) => (
                        <tr
                          key={account.id}
                          className={`transition-all duration-200 cursor-pointer ${
                            selected.includes(account.id)
                              ? "bg-green-50 border-l-4 border-l-[#15A395]"
                              : "hover:bg-gray-50"
                          }`}
                          // onClick={() => toggleSelect(account.id)}
                          >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={selected.includes(account.id)}
                                onChange={() => { toggleSelect(account.id) }}
                                className="w-4 h-4 text-[#15A395] cursor-pointer border-gray-300 rounded focus:ring-[#15A395]"
                              />
                              <div
                                className={`w-7 h-7 flex items-center justify-center rounded-full text-white font-semibold text-sm ${
                                  account.bgColor ||
                                  "bg-gradient-to-br from-[#15A395] to-[#0f7a6b]"
                                }`}
                              >
                                {account.initials ||
                                  (account.Email
                                    ? account.Email.charAt(0).toUpperCase()
                                    : "?")}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {account.name ||
                                    account.Email ||
                                    "Unnamed Account"}
                                </span>
                                {account.name && account.Email && (
                                  <span className="text-xs text-gray-500 truncate max-w-xs">
                                    {account.Email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {account.emailsSent || "0 of 0"}
                            </span>
                          </td>
                          <td className="text-center py-4 px-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {account.warmupEmails || "0"}
                            </span>
                          </td>
                          <td className="text-center py-4 px-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {account.healthScore || "0%"}
                            </span>
                          </td>
                          <td
                            className="text-gray-400 hover:text-gray-600 py-4 px-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-150">
                              <FaEllipsisH size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden divide-y divide-gray-200">
                {isEmailAccountsLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15A395] mb-3"></div>
                      Loading email accounts...
                    </div>
                  </div>
                ) : emailAccountsError ? (
                  <div className="p-6 text-center text-red-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-8 h-8 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Error loading email accounts
                    </div>
                  </div>
                ) : (
                  emailAccountsObject?.emailAccounts?.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 transition-all duration-200 cursor-pointer ${
                        selected.includes(account.id)
                          ? "bg-green-50 border-l-4 border-l-[#15A395]"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleSelect(account.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(account.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelect(account.id);
                            }}
                            className="w-4 h-4 text-[#15A395] border-gray-300 rounded focus:ring-[#15A395]"
                          />
                          <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold text-sm ${
                              account.bgColor ||
                              "bg-gradient-to-br from-[#15A395] to-[#0f7a6b]"
                            }`}
                          >
                            {account.initials ||
                              (account.Email
                                ? account.Email.charAt(0).toUpperCase()
                                : "?")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {account.name ||
                                account.Email ||
                                "Unnamed Account"}
                            </span>
                            {account.name && account.Email && (
                              <span className="text-xs text-gray-500 truncate">
                                {account.Email}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaEllipsisH size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Emails Sent
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {account.emailsSent || "0 of 0"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Warmup</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {account.warmupEmails || "0"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Health Score
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {account.healthScore || "0%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { OAuthCallback };
export default EmailAccounts;
