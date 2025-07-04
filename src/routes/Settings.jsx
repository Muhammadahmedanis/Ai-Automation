import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthQuery } from "../reactQuery/hooks/useAuthQuery";
import {
  Copy,
  Download,
  Lock,
  Mail,
  Phone,
  Search,
  Settings as setting,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWorkspaceQuery } from "../reactQuery/hooks/useWorkspaceQuery";
import { FileText, XCircle } from "lucide-react";
import { useSettingQuery } from "../reactQuery/hooks/useSetting";
import { BiLoaderCircle } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const {
    updatePasswordMutation,
    updateProfileMutation,
    userInfo,
    TFAMutation,
  } = useAuthQuery();

  const [passwords, setPasswords] = useState({
    OldPassword: "",
    NewPassword: "",
    RetypePassword: "",
    Login: false,
  });

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };
  const handleUpdatePassword = () => {
    if (passwords.NewPassword !== passwords.RetypePassword) {
      alert("New password and Retype password do not match!");
      return;
    }
    updatePasswordMutation.mutate(passwords);
    console.log("Password updated successfully!", passwords);
    setIsModalOpen(false);
  };

  // console.log(userInfo?.User);
  const [profileData, setProfileData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PhoneNumber: "",
    password: "",
    TFA: false,
  });

  useEffect(() => {
    if (userInfo?.User) {
      setProfileData({
        FirstName: userInfo.User.FirstName || "",
        LastName: userInfo.User.LastName || "",
        Email: userInfo.User.Email || "",
        PhoneNumber: userInfo.User.PhoneNumber || "",
        password: userInfo.User.Password || "",
        TFA: false,
      });
    }
  }, [userInfo]);

  const updateProfile = () => {
    const { password, ...profileDetail } = profileData;
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(profileDetail.PhoneNumber)) {
      toast.error("Invalid phone number format!");
      return;
    }
    // console.log(profileDetail);
    updateProfileMutation.mutate(profileDetail);
  };

  // *****************************

  const {
    currentWorkspace,
    updateWorkspaceMutation,
    teamWorkspaceMember,
    addMemeberMutation,
  } = useWorkspaceQuery();

  const [workspaceData, setWorkspaceData] = useState({
    WorkspaceName: "",
    id: "",
  });
  useEffect(() => {
    if (currentWorkspace?.Workspace) {
      setWorkspaceData({
        WorkspaceName: currentWorkspace?.Workspace?.WorkspaceName,
        id: currentWorkspace?.Workspace?.id,
      });
    }
  }, [currentWorkspace]);

  const handleUpdateWorkspace = () => {
    // console.log({WorkspaceName: workspaceData.WorkspaceName});
    updateWorkspaceMutation.mutate({
      WorkspaceName: workspaceData.WorkspaceName,
    });
  };

  const [newMember, setNewMember] = useState({
    Email: "",
    Role: "Admin",
  });

  const handlenewMemeber = (e) => {
    setNewMember((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createMemeber = () => {
    addMemeberMutation.mutate(newMember, {
      onSuccess: () => {
        setIsModalOpen2(false);
        setNewMember({
          Email: "",
          Role: "Admin",
        });
      },
    });
  };

  const handleConnectCalendar = async () => {
    try {
      const tokenObj = JSON.parse(localStorage.getItem("Token"));
      const token = tokenObj?.token;

      if (!token) {
        alert("No auth token found.");
        return;
      }

      const response = await fetch(
        "https://quick-pipe-backend.vercel.app/calendar/connect",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to connect to calendar");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("URL not found in response");
      }
    } catch (error) {
      console.error("Error connecting to calendar:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const [activeTab, setActiveTab] = useState("profile");
  const [activeTab2, setActiveTab2] = useState("team");
  const [highlightCalendarIntegration, setHighlightCalendarIntegration] =
    useState(false);

  // Handle URL parameters to set the active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const fromParam = searchParams.get("from"); // Track where user came from
    const validTabs = [
      "profile",
      "workspace",
      "integrations",
      "businessDetails",
    ];

    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);

      // If they're coming to the integrations tab from calendar, highlight the calendar integration
      if (tabParam === "integrations" && fromParam === "calendar") {
        setHighlightCalendarIntegration(true);
        // Remove highlight after 4 seconds
        setTimeout(() => {
          setHighlightCalendarIntegration(false);
        }, 4000);
      }

      // Clear the URL parameters after setting the tab to keep the URL clean
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("tab");
        newParams.delete("from");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkspaceChange = (e) => {
    const { name, value } = e.target;
    setWorkspaceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    console.log(userInfo?.User?.TFA);
    if (userInfo?.User?.TFA !== undefined) {
      TFAMutation.mutate();
      setProfileData((prev) => ({
        ...prev,
        TFA: !userInfo?.User?.TFA,
      }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(workspaceData.id);
  };

  //

  const {
    businessDetails,
    handleSubmit,
    isLoadingAddDoc,
    isLoadingBusinessName,
    isLoadingWebUrl,
    updateBusinessNameMutation,
    addWebsiteMutation,
    addDocumentMutation,
  } = useSettingQuery();
  const [businessName, setBusinessName] = useState(""); // Changed from array to string
  const [websiteUrls, setWebsiteUrls] = useState([""]);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  // Prefill form from businessDetails
  useEffect(() => {
    if (businessDetails && businessDetails.BusinessDetails) {
      const details = businessDetails.BusinessDetails;

      setBusinessName(details.BusinessName || ""); // Set directly as string
      setWebsiteUrls(details.Websites?.length ? details.Websites : [""]);

      const documentLinks =
        details.Documents?.map((docName) => ({
          name: docName,
          url: `/uploads/${docName}`,
        })) || [];

      setExistingDocuments(documentLinks);
      setDocuments([]);
    }
  }, [businessDetails]);

  const handleRemoveWebsiteUrl = (index) => {
    setWebsiteUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeField = (type, index, value) => {
    if (type === "url") {
      const updated = [...websiteUrls];
      updated[index] = value;
      setWebsiteUrls(updated);
    }
  };

  const handleAddField = (type) => {
    if (type === "url") setWebsiteUrls((prev) => [...prev, ""]);
  };

  // Remove existing document (by index)
  const handleDeleteDocument = (index) => {
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle file selection for new documents
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      toast.error("no new files selected.");
      return;
    }
    setDocuments((prev) => [...prev, ...files]);
  };

  // Remove selected new document
  const handleRemoveFile = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBusinessNameSubmit = () => {
    const BusinessName = businessName.trim();
    if (BusinessName.trim().length > 0) {
      updateBusinessNameMutation.mutate({ BusinessName: businessName.trim() });
      return;
    }
    toast.error("Business Name required!");
  };

  const handleWebUrlSubmit = () => {
    const validUrls = websiteUrls
      .map((url) => url.trim())
      .filter((url) => url != "" && url.startsWith("https://"));
    if (validUrls.length === 0) {
      toast.error("Field is empty OR provide a valid URL ( https:// )");
      return;
    }
    addWebsiteMutation.mutate({ WebsiteUrls: validUrls });
  };

  const handleDocSubmit = () => {
    const newDocuments = documents;

    if (newDocuments.length === 0 && existingDocuments.length === 0) {
      toast.error("Please upload or keep at least one document");
      return;
    }

    const formData = new FormData();

    newDocuments.forEach((file) => {
      formData.append("documents", file);
    });

    const keepFiles = existingDocuments.map((doc) => doc.name);
    console.log(keepFiles[0]);
    console.log(typeof(keepFiles))

    formData.append("KeepFiles", JSON.stringify(keepFiles));

    addDocumentMutation.mutate(formData);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-[#f5f5f5] min-h-screen">
      {/* Navigation Tabs */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <nav className="grid grid-cols-2 md:grid-cols-4 gap-1">
              <button
                className={`py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-gray-300  shadow-sm"
                    : "text-gray-600 hover:text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <User size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Profile</span>
                </div>
              </button>
              <button
                className={`py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all duration-200 ${
                  activeTab === "workspace"
                    ? "bg-gray-300  shadow-sm"
                    : "text-gray-600 hover:text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("workspace")}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm hidden sm:inline">
                    Workspace
                  </span>
                  <span className="text-xs sm:hidden text-center leading-tight">
                    Work
                  </span>
                </div>
              </button>
              <button
                className={`py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all duration-200 ${
                  activeTab === "integrations"
                    ? "bg-gray-300  shadow-sm"
                    : "text-gray-600 hover:text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("integrations")}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm">Integrations</span>
                </div>
              </button>
              <button
                className={`py-2 sm:py-3 px-1 sm:px-2 text-xs cursor-pointer sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "businessDetails"
                    ? "bg-gray-300  shadow-sm"
                    : "text-gray-600 hover:text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("businessDetails")}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm hidden sm:inline">
                    Business
                  </span>
                  <span className="text-xs sm:hidden text-center leading-tight">
                    Business
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content Based on Active Tab */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {activeTab === "profile" ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Profile Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
                Profile Settings
              </h2>

              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {/* Add logic to show uploaded image preview here */}
                  <span className="text-xl sm:text-2xl text-yellow-800">
                    👤
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <input type="file" className="hidden" accept="image/*" />
                  <button className="text-sm font-medium text-teal-600 hover:text-teal-700 block">
                    Change picture
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="text-gray-400 mr-2" size={16} />
                    First name
                  </label>
                  <input
                    type="text"
                    name="FirstName"
                    value={profileData.FirstName}
                    onChange={handleProfileChange}
                    className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="text-gray-400 mr-2" size={16} />
                    Last name
                  </label>
                  <input
                    type="text"
                    name="LastName"
                    value={profileData.LastName}
                    onChange={handleProfileChange}
                    className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    Email address
                  </label>
                  <input
                    type="Email"
                    name="Email"
                    value={profileData.Email}
                    onChange={handleProfileChange}
                    className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone size={16} className="text-gray-400 mr-2" />
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="PhoneNumber"
                    value={profileData.PhoneNumber}
                    onChange={handleProfileChange}
                    className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-stretch sm:justify-end pt-6">
                <button
                  onClick={updateProfile}
                  className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white cursor-pointer px-6 py-3 rounded-full text-sm font-medium transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
                Security
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {/* Password */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700">
                      Password
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Change your password.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto text-sm cursor-pointer text-teal-500 hover:text-teal-600 font-medium border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-all"
                  >
                    Update password
                  </button>
                </div>

                {/* 2FA Toggle */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <button
                    onClick={handleToggle}
                    className={`relative inline-flex items-center cursor-pointer h-6 rounded-full w-11 transition-colors focus:outline-none ${
                      userInfo?.User.TFA ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                        userInfo?.User?.TFA ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Update Password</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer bg-gray-200 p-2 rounded-full text-sm transition-colors"
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
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Old Password
                      </label>
                      <input
                        type="password"
                        name="OldPassword"
                        value={passwords.OldPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="NewPassword"
                        value={passwords.NewPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Retype Password
                      </label>
                      <input
                        type="password"
                        name="RetypePassword"
                        value={passwords.RetypePassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end mt-6 gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="w-full sm:w-auto text-black cursor-pointer border border-gray-300 rounded-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      className="w-full sm:w-auto bg-teal-500 cursor-pointer text-white px-4 py-2 rounded-full text-sm hover:bg-teal-600 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "workspace" ? (
          <>
            {/* Workspace Section */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Workspace Settings
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  {/* Workspace Name */}
                  <div className="relative">
                    <label className="text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      Workspace Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="WorkspaceName"
                        value={workspaceData.WorkspaceName}
                        onChange={handleWorkspaceChange}
                        className="w-full p-3 pr-16 sm:pr-20 border border-gray-200 rounded-lg focus:bg-[#f3faf9] focus:ring-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm transition-all duration-200"
                        placeholder="Enter workspace name"
                        aria-label="Workspace Name"
                      />
                      <button
                        onClick={handleUpdateWorkspace}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                          workspaceData.WorkspaceName?.trim()
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                        }`}
                        aria-label="Update Workspace Name"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Workspace ID */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                      <User className="mr-2" size={16} />
                      Workspace ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={workspaceData.id}
                        readOnly
                        className="w-full p-3 pr-12 text-xs sm:text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        aria-label="Workspace ID (Read-only)"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 p-1 rounded transition-all duration-200"
                        title="Copy Workspace ID"
                        aria-label="Copy Workspace ID to clipboard"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Share this ID with team members to invite them to your
                      workspace
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header with Title and Stats */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Team Management
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage your team members and pending invitations
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-800">
                        {teamWorkspaceMember?.Members?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Members</div>
                    </div>
                  </div>
                </div>

                {/* Member Tabs */}
                <div className="border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex space-x-4 sm:space-x-6 text-sm overflow-x-auto w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTab2("team")}
                      className={`py-2 px-1 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                        activeTab2 === "team"
                          ? "text-teal-600 border-teal-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                      aria-label="View Team Members"
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
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <span>
                        Team ({teamWorkspaceMember?.Members?.length || 0})
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab2("pending")}
                      className={`py-2 px-1 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                        activeTab2 === "pending"
                          ? "text-teal-600 border-teal-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                      aria-label="View Pending Invitations"
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
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Pending ({teamWorkspaceMember?.Invites?.length || 0})
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => setIsModalOpen2(true)}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-2.5 px-4 sm:px-5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                    aria-label="Add New Member"
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
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Add Member</span>
                  </button>

                  {isModalOpen2 && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                              />
                            </svg>
                            <span className="hidden sm:inline">
                              Invite Team Member
                            </span>
                            <span className="sm:hidden">Invite Member</span>
                          </h3>
                          <button
                            onClick={() => setIsModalOpen2(false)}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
                            aria-label="Close Add Member Modal"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-4 sm:space-y-5">
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center mb-2 sm:mb-3">
                              <Mail
                                size={16}
                                className="sm:w-5 sm:h-5 text-teal-500 mr-2"
                              />
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="Email"
                              placeholder="colleague@company.com"
                              value={newMember.Email}
                              onChange={handlenewMemeber}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all duration-200"
                              aria-label="Member Email Address"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center mb-2 sm:mb-3">
                              <Lock
                                size={16}
                                className="sm:w-5 sm:h-5 text-teal-500 mr-2"
                              />
                              Role & Permissions
                            </label>
                            <select
                              onChange={handlenewMemeber}
                              name="Role"
                              value={newMember.Role}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all duration-200"
                              aria-label="Member Role"
                            >
                              <option value="Admin">Admin - Full access</option>
                              <option value="Editor">
                                Editor - Limited access
                              </option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                              {newMember.Role === "Admin"
                                ? "Can manage workspace, members, and all settings"
                                : "Can view and edit content but cannot manage members"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end mt-6 sm:mt-8 gap-3">
                          <button
                            onClick={() => setIsModalOpen2(false)}
                            className="w-full sm:w-auto text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-all duration-200"
                            aria-label="Cancel Adding Member"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={createMemeber}
                            disabled={
                              !newMember.Email || addMemeberMutation?.isPending
                            }
                            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            aria-label="Send Member Invite"
                          >
                            {addMemeberMutation?.isPending ? (
                              <>
                                <BiLoaderCircle className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                  />
                                </svg>
                                <span>Send Invitation</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Member List */}
                <div className="p-6">
                  {activeTab2 === "team" ? (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search team members..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          aria-label="Search Members"
                          onChange={(e) => setSearchQuery?.(e.target.value)}
                        />
                      </div>

                      {/* Team Members List */}
                      {teamWorkspaceMember?.Members?.length > 0 ? (
                        <div className="space-y-3">
                          {teamWorkspaceMember.Members.map((member, index) => (
                            <div
                              key={member.UserId || index}
                              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                                  <span className="text-white font-semibold text-lg">
                                    {member?.FullName?.charAt(
                                      0
                                    )?.toUpperCase() || "U"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {member?.FullName || "Unknown User"}
                                  </h3>
                                  <p className="text-sm text-gray-500 truncate">
                                    {member?.Email || "No email provided"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    member.Role === "Admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {member.Role}
                                </span>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No team members
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Get started by adding your first team member.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pending Invitations */}
                      {teamWorkspaceMember?.Invites?.length > 0 ? (
                        <div className="space-y-3">
                          {teamWorkspaceMember.Invites.map((member, index) => (
                            <div
                              key={member.UserId || index}
                              className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all duration-200 border border-yellow-200"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {member?.FirstName || "Pending User"}
                                  </h3>
                                  <p className="text-sm text-gray-600 truncate">
                                    Invitation sent • Waiting for response
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {member.Role}
                                </span>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No pending invitations
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            All team members have accepted their invitations.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "integrations" ? (
          <div className="px-2 sm:px-4 md:px-6 lg:px-8">
            {highlightCalendarIntegration && (
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-teal-800">
                      Calendar Integration Required
                    </h3>
                    <p className="text-sm text-teal-700 mt-1">
                      To use the Calendar features, please connect your Google
                      Calendar below.
                    </p>
                  </div>
                  <button
                    onClick={() => setHighlightCalendarIntegration(false)}
                    className="flex-shrink-0 text-teal-400 hover:text-teal-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <input
                type="search"
                className="block w-full sm:w-80 p-3 pl-10 text-sm text-gray-700 border border-gray-200 rounded-full bg-gray-50 focus:ring focus:outline-none focus:ring-teal-500"
                placeholder="Search integrations..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {/* Slack */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg border border-gray-100 shadow-sm group hover:border-[#15A395] transition-colors duration-200">
                <div className="mb-3 sm:mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <path
                      d="M6.5 19.5a3.5 3.5 0 01-3.5-3.5 3.5 3.5 0 013.5-3.5h3.5v3.5a3.5 3.5 0 01-3.5 3.5zm1.75-10.5V6.5a3.5 3.5 0 013.5-3.5 3.5 3.5 0 013.5 3.5v10.5a3.5 3.5 0 01-3.5 3.5 3.5 3.5 0 01-3.5-3.5v-7zm10.5 1.75h3.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5h-3.5v-7zm-1.75 10.5v3.5a3.5 3.5 0 01-3.5 3.5 3.5 3.5 0 01-3.5-3.5v-3.5h7z"
                      fill="#E01E5A"
                    />
                    <path
                      d="M19.5 6.5a3.5 3.5 0 013.5-3.5 3.5 3.5 0 013.5 3.5v3.5h-3.5a3.5 3.5 0 01-3.5-3.5zm-1.75 1.75H8.25a3.5 3.5 0 01-3.5-3.5 3.5 3.5 0 013.5-3.5h10.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5z"
                      fill="#36C5F0"
                    />
                    <path
                      d="M25.5 19.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5h-3.5v-3.5a3.5 3.5 0 013.5-3.5zm-1.75 10.5v-3.5a3.5 3.5 0 013.5-3.5 3.5 3.5 0 013.5 3.5v3.5h-7z"
                      fill="#ECB22E"
                    />
                    <path
                      d="M12.5 25.5a3.5 3.5 0 01-3.5 3.5 3.5 3.5 0 01-3.5-3.5v-3.5h3.5a3.5 3.5 0 013.5 3.5zm1.75-1.75h10.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5h-10.5a3.5 3.5 0 01-3.5-3.5 3.5 3.5 0 013.5-3.5z"
                      fill="#2EB67D"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Slack
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  Connect Quickpipe AI with Slack to get instant lead updates,
                  follow-up reminders, and notifications in your team's channels
                  for seamless collaboration.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center text-sm gap-1 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <IoSettingsOutline size={16} />
                    <span>Manage</span>
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center text-xs text-gray-900 font-semibold bg-white group-hover:bg-[#15A395] group-hover:text-white px-4 py-2 rounded-full border border-gray-400 group-hover:border-[#15A395] transition-colors duration-200 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>

              {/* Google Calendar */}
              <div
                className={`bg-white p-4 sm:p-5 lg:p-6 rounded-lg border shadow-sm group transition-all duration-300 ${
                  highlightCalendarIntegration
                    ? "border-teal-500 ring-2 ring-teal-200 shadow-teal-100"
                    : "border-gray-100 hover:border-[#15A395]"
                }`}
              >
                {highlightCalendarIntegration && (
                  <div className="mb-3 flex items-center gap-2 text-teal-600 text-sm font-medium">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                    Connect here to use Calendar features
                  </div>
                )}
                <div className="mb-3 sm:mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <rect
                      x="4"
                      y="6"
                      width="24"
                      height="20"
                      rx="2"
                      fill="#4285F4"
                    />
                    <rect x="10" y="12" width="12" height="2" fill="white" />
                    <rect x="10" y="16" width="12" height="2" fill="white" />
                    <rect x="10" y="20" width="8" height="2" fill="white" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Google Calendar
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  Automatically sync meetings, follow-ups, and reminders from
                  Quickpipe AI to Google Calendar, ensuring you never miss an
                  important event.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center text-sm gap-1 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <IoSettingsOutline size={16} />
                    <span>Manage</span>
                  </button>
                  <button
                    onClick={handleConnectCalendar}
                    className={`w-full sm:w-auto flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-full border transition-colors duration-200 cursor-pointer ${
                      highlightCalendarIntegration
                        ? "bg-teal-500 text-white border-teal-500 hover:bg-teal-600"
                        : "text-gray-900 bg-white group-hover:bg-[#15A395] group-hover:text-white border-gray-400 group-hover:border-[#15A395]"
                    }`}
                  >
                    Connect
                  </button>
                </div>
              </div>

              {/* Open AI */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg border border-gray-100 shadow-sm group hover:border-[#15A395] transition-colors duration-200">
                <div className="mb-3 sm:mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <path
                      d="M26 16a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"
                      stroke="#000"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M16 6v20M6 16h20M23 9 9 23M9 9l14 14"
                      stroke="#000"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Open AI
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  Leverage AI to draft emails, summarize notes, and predict lead
                  conversions directly within Quickpipe AI. Boosting efficiency
                  and personalization.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center text-sm gap-1 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <IoSettingsOutline size={16} />
                    <span>Manage</span>
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center text-xs text-gray-900 font-semibold bg-white group-hover:bg-[#15A395] group-hover:text-white px-4 py-2 rounded-full border border-gray-400 group-hover:border-[#15A395] transition-colors duration-200 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>

              {/* Hubspot */}
              <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-100 shadow-sm group hover:border-[#15A395] transition-colors duration-200">
                <div className="mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8"
                  >
                    <path
                      d="M5.41 13.714v4.572H8.53v-4.572H5.41zm9.143 0v4.572h3.122v-4.572h-3.122zm9.143 0v4.572h3.122v-4.572h-3.122zM10.133 22.857v-3.122H5.562a4.572 4.572 0 0 0 4.571 3.122zm3.2-3.122v3.122a4.571 4.571 0 0 0 4.572-4.572h-1.371v1.45h-3.2zm9.142 0v3.122a4.571 4.571 0 0 0 4.572-4.572H25.6v1.45h-3.124z"
                      fill="#FF7A59"
                    />
                    <path
                      d="M25.6 9.143a4.571 4.571 0 0 0-4.572 4.571h1.372v-1.45H25.6v-3.121zm-9.143 4.571a4.572 4.572 0 0 0-4.571-4.571v3.121h3.2v-1.45h1.371zM10.133 12.266V9.143a4.571 4.571 0 0 0-4.571 4.571h1.371v-1.45h3.2z"
                      fill="#FF7A59"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Hubspot
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  Integrate HubSpot with Quickpipe AI to sync lead data, track
                  interactions, and access HubSpot's analytics for a seamless
                  sales workflow.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center text-sm gap-1 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <IoSettingsOutline size={16} />
                    <span>Manage</span>
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center text-xs text-gray-900 font-semibold bg-white group-hover:bg-[#15A395] group-hover:text-white px-4 py-2 rounded-full border border-gray-400 group-hover:border-[#15A395] transition-colors duration-200 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>

              {/* Salesforce */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg border border-gray-100 shadow-sm group hover:border-[#15A395] transition-colors duration-200">
                <div className="mb-3 sm:mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <path
                      d="M16.847 7.84c1.017-1.08 2.45-1.747 4.045-1.747 3.05 0 5.547 2.44 5.547 5.427 0 .48-.067.933-.187 1.373 1.627.587 2.8 2.147 2.8 3.96 0 2.333-1.947 4.227-4.347 4.227-.24 0-.48-.013-.707-.053-.573 1.373-1.933 2.347-3.52 2.347-.667 0-1.293-.174-1.84-.467-.6 2.053-2.52 3.547-4.773 3.547-2.293 0-4.227-1.534-4.8-3.627-.28.053-.573.08-.867.08-2.413 0-4.387-1.893-4.387-4.227 0-1.813 1.173-3.373 2.827-3.96-.12-.44-.187-.893-.187-1.373 0-2.987 2.493-5.427 5.56-5.427 1.307 0 2.493.453 3.44 1.213.4-.306.84-.573 1.293-.786.04-.133.093-.267.133-.413z"
                      fill="#00A1E0"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Salesforce
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  Sync leads and contact data between Quickpipe AI and
                  Salesforce. Track progress, update records, and access CRM
                  insights without leaving the app.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button className="w-full sm:w-auto cursor-pointer flex items-center justify-center text-sm gap-1 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <IoSettingsOutline size={16} />
                    <span>Manage</span>
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center text-xs text-gray-900 font-semibold bg-white group-hover:bg-[#15A395] group-hover:text-white px-4 py-2 rounded-full border border-gray-400 group-hover:border-[#15A395] transition-colors duration-200 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "businessDetails" ? (
          <div className="bg-white p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto rounded-lg shadow-sm border border-gray-200 space-y-6 sm:space-y-8">
            <div className="text-center sm:text-left mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                Business Details
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your business information and documents
              </p>
            </div>
            {/* Business Name Section */}
            <div className="space-y-3 sm:space-y-4">
              <label className="text-gray-700 font-medium text-sm sm:text-base flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Business Name:
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="border border-gray-300 rounded-md w-full outline-none px-3 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter Business Name"
              />
              <button
                onClick={handleBusinessNameSubmit}
                className="bg-teal-500 w-full hover:bg-teal-600 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition duration-200 text-sm font-medium"
                disabled={isLoadingBusinessName}
              >
                {isLoadingBusinessName ? (
                  <BiLoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>

            {/* Website URLs Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-gray-700 font-medium text-sm sm:text-base flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                  />
                </svg>
                Website URLs:
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {websiteUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <label className="text-gray-600 text-sm mb-2 block">
                      Website URL {index + 1}:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) =>
                          handleChangeField("url", index, e.target.value)
                        }
                        className="border border-gray-300 rounded-md w-full outline-none px-3 py-3 pr-10 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="https://example.com"
                      />
                      {websiteUrls.length > 1 && (
                        <button
                          onClick={() => handleRemoveWebsiteUrl(index)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField("url")}
                  className="text-teal-500 text-sm underline hover:text-teal-600 transition-colors flex items-center gap-1"
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
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Another Website URL
                </button>
              </div>
              <button
                onClick={handleWebUrlSubmit}
                className="bg-teal-500 w-full hover:bg-teal-600 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition duration-200 text-sm font-medium"
                disabled={isLoadingWebUrl}
              >
                {isLoadingWebUrl ? (
                  <BiLoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit URLs
                  </>
                )}
              </button>
            </div>

            {/* Existing Documents */}
            {existingDocuments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-gray-700 font-medium text-sm sm:text-base flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Existing Documents:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {existingDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 text-sm hover:underline flex-1 min-w-0"
                      >
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {doc.name || `Document ${index + 1}`}
                        </span>
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(index)}
                        className="text-red-500 hover:text-red-600 transition-colors ml-2 flex-shrink-0 p-1 hover:bg-red-50 rounded"
                        title="Delete Document"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm sm:text-base flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload New Documents:
              </label>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg h-32 sm:h-40 lg:h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => document.getElementById("file").click()}
              >
                {documents.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-w-full justify-center p-4">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="relative flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 min-w-0 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mb-1" />
                        <span className="text-xs text-center max-w-20 truncate">
                          {doc.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 transition-colors bg-white rounded-full shadow-sm"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 mb-2" />
                    <span className="text-sm text-center px-4">
                      Click to upload documents or drag and drop
                    </span>
                    <span className="text-xs text-center px-4 mt-1 text-gray-500">
                      Supports .doc, .docx, .pdf files
                    </span>
                  </div>
                )}
              </div>

              <input
                type="file"
                id="file"
                accept=".doc,.docx,.pdf"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500 text-center sm:text-left">
                You can upload multiple documents (.doc, .docx, .pdf)
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDocSubmit}
              className="bg-teal-500 w-full hover:bg-teal-600 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition duration-200 text-sm font-medium"
              disabled={isLoadingAddDoc}
            >
              {isLoadingAddDoc ? (
                <BiLoaderCircle className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Submit Documents
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Settings;
