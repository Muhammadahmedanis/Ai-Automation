import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Circle,
  X,
  Zap,
  Plus,
  Loader2,
  Trash2,
  Edit3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCampaignQuery } from "../reactQuery/hooks/useCampaignQuery";
import { toast } from "react-hot-toast";

function Campaigns() {
  const {
    campaignsObject,
    isCampaignsLoading,
    createCampaignMutation,
    activePauseMutation,
    updateCampaignMutation,
    deleteCampaignMutation,
  } = useCampaignQuery();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortOrder, setSortOrder] = useState("Newest first");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [showOptions, setShowOptions] = useState(null);
  const [newName, setNewName] = useState("");
  const [showUpdateNameModal, setShowUpdateNameModal] = useState(false);
  const [campaignToUpdate, setCampaignToUpdate] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Loading states
  const isCreateLoading = createCampaignMutation.isPending;
  const isUpdateLoading = updateCampaignMutation.isPending;
  const isDeleteLoading = deleteCampaignMutation.isPending;
  const isToggleLoading = activePauseMutation.isPending;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown(false);
      setShowSortDropdown(false);
      setShowOptions(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Memoized campaigns list with filtering and sorting
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaignsObject?.campaigns || [];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((campaign) =>
        campaign.Name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "All statuses") {
      filtered = filtered.filter(
        (campaign) => campaign.Status === statusFilter
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortOrder) {
      case "Newest first":
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "Oldest first":
        sorted.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        break;
      case "Name A - Z":
        sorted.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
        break;
      case "Name Z - A":
        sorted.sort((a, b) => (b.Name || "").localeCompare(a.Name || ""));
        break;
      default:
        break;
    }

    return sorted;
  }, [campaignsObject?.campaigns, searchQuery, statusFilter, sortOrder]);

  // Event handlers
  const handleMoreClick = useCallback((campaignId) => {
    setShowOptions((prev) => (prev === campaignId ? null : campaignId));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortOrder(sort);
    setShowSortDropdown(false);
  }, []);

  const handleDropdownClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Campaign selection handlers
  const handleSelectCampaign = useCallback((campaignId) => {
    setSelectedCampaigns((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(campaignId)) {
        newSelection.delete(campaignId);
      } else {
        newSelection.add(campaignId);
      }
      return newSelection;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(
        new Set(filteredAndSortedCampaigns.map((c) => c.id))
      );
    }
    setSelectAll(!selectAll);
  }, [selectAll, filteredAndSortedCampaigns]);

  // Update selectAll state when campaigns change
  useEffect(() => {
    const allSelected =
      filteredAndSortedCampaigns.length > 0 &&
      filteredAndSortedCampaigns.every((campaign) =>
        selectedCampaigns.has(campaign.id)
      );
    setSelectAll(allSelected);
  }, [selectedCampaigns, filteredAndSortedCampaigns]);

  // Configuration options
  const statusOptions = [
    {
      value: "All statuses",
      icon: Filter,
      iconColor: "text-gray-400",
    },
    {
      value: "Active",
      icon: Play,
      iconColor: "text-blue-500",
    },
    {
      value: "Draft",
      icon: Circle,
      iconColor: "text-gray-400",
    },
    {
      value: "Paused",
      icon: Pause,
      iconColor: "text-yellow-500",
    },
    {
      value: "Error",
      icon: AlertCircle,
      iconColor: "text-red-500",
    },
    {
      value: "Completed",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
  ];

  const sortOptions = [
    { value: "Newest first", label: "Newest first" },
    { value: "Oldest first", label: "Oldest first" },
    { value: "Name A - Z", label: "Name A - Z" },
    { value: "Name Z - A", label: "Name Z - A" },
  ];

  // Campaign action handlers
  const handleCreateCampaign = useCallback(() => {
    if (!newCampaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    const data = { Name: newCampaignName.trim() };

    createCampaignMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Campaign "${newCampaignName}" created successfully!`);
        setNewCampaignName("");
        setShowNewCampaignModal(false);
      },
      onError: (error) => {
        console.error("Campaign creation error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to create campaign"
        );
      },
    });
  }, [newCampaignName, createCampaignMutation]);

  const handleUpdateName = useCallback(() => {
    if (!newName.trim()) {
      toast.error("Please enter a valid name");
      return;
    }

    const data = { Name: newName.trim() };

    updateCampaignMutation.mutate(
      { campaignId: campaignToUpdate, data },
      {
        onSuccess: () => {
          toast.success("Campaign name updated successfully!");
          setShowUpdateNameModal(false);
          setNewName("");
          setCampaignToUpdate("");
          setShowOptions(null);
        },
        onError: (error) => {
          console.error("Campaign update error:", error);
          toast.error(
            error?.response?.data?.message || "Failed to update campaign name"
          );
        },
      }
    );
  }, [newName, campaignToUpdate, updateCampaignMutation]);

  const handleDeleteCampaign = useCallback(
    (campaignId, campaignName) => {
      if (
        !window.confirm(
          `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      setShowOptions(null);
      deleteCampaignMutation.mutate(campaignId, {
        onSuccess: () => {
          toast.success(`Campaign "${campaignName}" deleted successfully!`);
        },
        onError: (error) => {
          console.error("Campaign deletion error:", error);
          toast.error(
            error?.response?.data?.message || "Failed to delete campaign"
          );
        },
      });
    },
    [deleteCampaignMutation]
  );

  const handleToggleStatus = useCallback(
    (campaignId, currentStatus) => {
      const newStatus = currentStatus === "Active" ? "Paused" : "Active";

      activePauseMutation.mutate(campaignId, {
        onSuccess: () => {
          toast.success(`Campaign ${newStatus.toLowerCase()} successfully!`);
        },
        onError: (error) => {
          console.error("Error toggling campaign status:", error);
          toast.error(
            error?.response?.data?.message || "Failed to update campaign status"
          );
        },
      });
    },
    [activePauseMutation]
  );

  // Show loading state while campaigns are being fetched
  if (isCampaignsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Loader2
              size={48}
              className="animate-spin text-[#16C47F] mx-auto"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Campaigns
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your campaigns...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Campaigns
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage and monitor your email campaigns
          </p>
        </div>
        {/* Filters and actions */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between mb-4 sm:mb-6">
          <div className="relative w-full lg:w-auto">
            <div className="relative flex items-center w-full sm:w-72">
              <Search size={20} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 outline-none text-gray-700 focus:ring-2 focus:ring-[#16C47F] focus:border-[#16C47F] text-sm sm:text-base"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
            {/* Status Filter */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex items-center justify-center w-full rounded-full border border-gray-300 px-3 sm:px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#16C47F] cursor-pointer min-w-[120px] sm:min-w-[140px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowSortDropdown(false);
                }}
              >
                <Zap size={16} className="mr-2 text-gray-400" />
                <span className="truncate">{statusFilter}</span>
                <ChevronDown size={16} className="ml-2 text-gray-400" />
              </button>

              {/* Status dropdown */}
              {showStatusDropdown && (
                <div
                  className="absolute right-0 left-0 sm:left-auto mt-2 w-full lg:w-64 rounded-md shadow-lg bg-white border border-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                  onClick={handleDropdownClick}
                >
                  <div className="py-1">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = statusFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? "text-white bg-[#16C47F] font-medium"
                              : "text-gray-700 hover:bg-green-50 hover:text-[#16C47F]"
                          }`}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          <Icon
                            size={16}
                            className={
                              isSelected ? "text-white" : option.iconColor
                            }
                          />
                          <span>{option.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Filter */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                className="inline-flex justify-center items-center w-full rounded-full border border-gray-300 px-3 sm:px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#16C47F] cursor-pointer min-w-[120px] sm:min-w-[140px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                  setShowStatusDropdown(false);
                }}
              >
                <span className="truncate">{sortOrder}</span>
                <ChevronDown size={16} className="ml-2 text-gray-400" />
              </button>

              {/* Sort dropdown */}
              {showSortDropdown && (
                <div
                  className="absolute right-0 left-0 sm:left-auto mt-2 w-full lg:w-64 rounded-md shadow-lg bg-white border border-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                  onClick={handleDropdownClick}
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer transition-colors ${
                          sortOrder === option.value
                            ? "text-white bg-[#16C47F] font-medium"
                            : "text-gray-700 hover:bg-green-50 hover:text-[#16C47F]"
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

            {/* Add Campaign Button */}
            <button
              onClick={() => setShowNewCampaignModal(true)}
              type="button"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-sm font-medium text-white bg-[#16C47F] hover:bg-[#0FA968] rounded-full focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:ring-offset-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto transition-colors"
              disabled={isCreateLoading}
            >
              {isCreateLoading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              <span className="whitespace-nowrap">Add Campaign</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCampaigns.size > 0 && (
          <div className="mb-3 sm:mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium text-[#16C47F]">
                {selectedCampaigns.size} campaign
                {selectedCampaigns.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-[#16C47F] hover:bg-[#0FA968] text-white rounded transition-colors cursor-pointer">
                  Bulk Actions
                </button>
                <button
                  onClick={() => setSelectedCampaigns(new Set())}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns table - Desktop */}
        <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
          {filteredAndSortedCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "All statuses"
                  ? "No campaigns found"
                  : "No campaigns yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "All statuses"
                  ? "Try adjusting your search or filters"
                  : "Create your first campaign to get started"}
              </p>
              {!searchQuery && statusFilter === "All statuses" && (
                <button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#16C47F] hover:bg-[#0FA968] rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:ring-offset-2"
                >
                  <Plus size={16} className="mr-2" />
                  Create Campaign
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="focus:ring-[#16C47F] h-4 w-4 text-[#16C47F] border-gray-300 rounded cursor-pointer"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Progress
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Sent
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Clicks
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Replies
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Opportunities
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Actions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      <span className="sr-only">More</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedCampaigns.has(campaign.id)
                          ? "bg-green-50 border-l-4 border-l-[#16C47F]"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="focus:ring-[#16C47F] h-4 w-4 text-[#16C47F] border-gray-300 rounded cursor-pointer"
                          checked={selectedCampaigns.has(campaign.id)}
                          onChange={() => handleSelectCampaign(campaign.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/campaigns/target/${campaign.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#16C47F] transition-colors"
                        >
                          {campaign.Name || "Unnamed Campaign"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            campaign.Status === "Active"
                              ? "bg-blue-100 text-blue-800"
                              : campaign.Status === "Error"
                              ? "bg-red-100 text-red-800"
                              : campaign.Status === "Paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : campaign.Status === "Draft"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-[#16C47F]"
                          }`}
                        >
                          {campaign.Status || "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-300 ${
                                campaign.Status === "Active"
                                  ? "bg-blue-500"
                                  : campaign.Status === "Error"
                                  ? "bg-red-500"
                                  : campaign.Status === "Completed"
                                  ? "bg-[#16C47F]"
                                  : "bg-yellow-500"
                              }`}
                              style={{ width: `${campaign.progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {campaign.progress || 0}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {campaign.sent || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {campaign.clicks || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">
                            {campaign.replies || 0}
                          </span>
                          <div className="w-px h-4 bg-gray-300"></div>
                          <span className="text-xs text-gray-500">
                            {campaign.replyRate || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {campaign.opportunities || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() =>
                            handleToggleStatus(campaign.id, campaign.Status)
                          }
                          className={`p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${
                            isToggleLoading
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={isToggleLoading}
                          title={
                            campaign.Status === "Active"
                              ? "Pause Campaign"
                              : "Start Campaign"
                          }
                        >
                          {isToggleLoading ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-gray-400"
                            />
                          ) : campaign.Status === "Active" ? (
                            <Pause size={16} className="text-yellow-600" />
                          ) : (
                            <Play size={16} className="text-[#16C47F]" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button
                          onClick={() => handleMoreClick(campaign.id)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>

                        {/* Options dropdown */}
                        {showOptions === campaign.id && (
                          <div className="absolute right-0 top-12 w-48 bg-white shadow-lg border border-gray-200 rounded-md z-30">
                            <div className="py-1">
                              <button
                                className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => {
                                  setCampaignToUpdate(campaign.id);
                                  setNewName(campaign.Name || "");
                                  setShowUpdateNameModal(true);
                                  setShowOptions(null);
                                }}
                              >
                                <Edit3
                                  size={16}
                                  className="mr-3 text-gray-400"
                                />
                                Update Name
                              </button>
                              <hr className="border-gray-100" />
                              <button
                                className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                onClick={() =>
                                  handleDeleteCampaign(
                                    campaign.id,
                                    campaign.Name
                                  )
                                }
                                disabled={isDeleteLoading}
                              >
                                <Trash2 size={16} className="mr-3" />
                                Delete Campaign
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Campaigns cards - Mobile & Tablet */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {filteredAndSortedCampaigns.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "All statuses"
                  ? "No campaigns found"
                  : "No campaigns yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "All statuses"
                  ? "Try adjusting your search or filters"
                  : "Create your first campaign to get started"}
              </p>
              {!searchQuery && statusFilter === "All statuses" && (
                <button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#16C47F] hover:bg-[#0FA968] rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:ring-offset-2"
                >
                  <Plus size={16} className="mr-2" />
                  Create Campaign
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`bg-white shadow rounded-lg p-4 sm:p-6 transition-all hover:shadow-md ${
                  selectedCampaigns.has(campaign.id)
                    ? "ring-2 ring-[#16C47F] ring-opacity-50 bg-green-50 border-l-4 border-l-[#16C47F]"
                    : ""
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className="focus:ring-[#16C47F] h-4 w-4 text-[#16C47F] border-gray-300 rounded cursor-pointer mt-1"
                      checked={selectedCampaigns.has(campaign.id)}
                      onChange={() => handleSelectCampaign(campaign.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/campaigns/target/${campaign.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-[#16C47F] transition-colors block truncate"
                      >
                        {campaign.Name || "Unnamed Campaign"}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            campaign.Status === "Active"
                              ? "bg-blue-100 text-blue-800"
                              : campaign.Status === "Error"
                              ? "bg-red-100 text-red-800"
                              : campaign.Status === "Paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : campaign.Status === "Draft"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {campaign.Status || "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(campaign.id, campaign.Status)
                      }
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${
                        isToggleLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isToggleLoading}
                      title={
                        campaign.Status === "Active"
                          ? "Pause Campaign"
                          : "Start Campaign"
                      }
                    >
                      {isToggleLoading ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-gray-400"
                        />
                      ) : campaign.Status === "Active" ? (
                        <Pause size={16} className="text-yellow-600" />
                      ) : (
                        <Play size={16} className="text-green-600" />
                      )}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => handleMoreClick(campaign.id)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>

                      {/* Options dropdown */}
                      {showOptions === campaign.id && (
                        <div className="absolute right-0 top-12 w-48 bg-white shadow-lg border border-gray-200 rounded-md z-30">
                          <div className="py-1">
                            <button
                              className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => {
                                setCampaignToUpdate(campaign.id);
                                setNewName(campaign.Name || "");
                                setShowUpdateNameModal(true);
                                setShowOptions(null);
                              }}
                            >
                              <Edit3 size={16} className="mr-3 text-gray-400" />
                              Update Name
                            </button>
                            <hr className="border-gray-100" />
                            <button
                              className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              onClick={() =>
                                handleDeleteCampaign(campaign.id, campaign.Name)
                              }
                              disabled={isDeleteLoading}
                            >
                              <Trash2 size={16} className="mr-3" />
                              Delete Campaign
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {campaign.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        campaign.Status === "Active"
                          ? "bg-blue-500"
                          : campaign.Status === "Error"
                          ? "bg-red-500"
                          : campaign.Status === "Completed"
                          ? "bg-[#16C47F]"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${campaign.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {campaign.sent || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Sent
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {campaign.clicks || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Clicks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {campaign.replies || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Replies
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {campaign.replyRate || 0}% rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {campaign.opportunities || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Opportunities
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
            onClick={() => !isCreateLoading && setShowNewCampaignModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Create New Campaign
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Give your campaign a memorable name
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() =>
                  !isCreateLoading && setShowNewCampaignModal(false)
                }
                disabled={isCreateLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <label
                htmlFor="campaign-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Campaign Name *
              </label>
              <input
                type="text"
                id="campaign-name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:border-[#16C47F] transition-colors text-sm sm:text-base"
                placeholder="e.g., Q1 Lead Generation"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  !isCreateLoading &&
                  handleCreateCampaign()
                }
                autoFocus
                disabled={isCreateLoading}
                maxLength={100}
              />
              <div className="mt-1 text-xs text-gray-500">
                {newCampaignName.length}/100 characters
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16C47F] transition-colors disabled:opacity-50"
                onClick={() => setShowNewCampaignModal(false)}
                disabled={isCreateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#16C47F] hover:bg-[#0FA968] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16C47F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                onClick={handleCreateCampaign}
                disabled={!newCampaignName.trim() || isCreateLoading}
              >
                {isCreateLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Creating...
                  </div>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Campaign Name Modal */}
      {showUpdateNameModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
            onClick={() => !isUpdateLoading && setShowUpdateNameModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Update Campaign Name
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter a new name for your campaign
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() =>
                  !isUpdateLoading && setShowUpdateNameModal(false)
                }
                disabled={isUpdateLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <label
                htmlFor="campaign-update-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Campaign Name *
              </label>
              <input
                type="text"
                id="campaign-update-name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:border-[#16C47F] transition-colors text-sm sm:text-base"
                placeholder="Enter new campaign name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isUpdateLoading && handleUpdateName()
                }
                autoFocus
                disabled={isUpdateLoading}
                maxLength={100}
              />
              <div className="mt-1 text-xs text-gray-500">
                {newName.length}/100 characters
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16C47F] transition-colors disabled:opacity-50"
                onClick={() => setShowUpdateNameModal(false)}
                disabled={isUpdateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#16C47F] hover:bg-[#0FA968] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16C47F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                onClick={handleUpdateName}
                disabled={!newName.trim() || isUpdateLoading}
              >
                {isUpdateLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Updating...
                  </div>
                ) : (
                  "Update Name"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Campaigns;
