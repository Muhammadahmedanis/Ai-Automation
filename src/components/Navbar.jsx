import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, User, HelpCircle, Settings, LogOut, Plus, X, Briefcase, Menu, Sparkles, Upload, FileText, Sheet, Link2, Database, Cloud, Users, Inbox as InboxIcon } from 'lucide-react';

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { QueryClient } from '@tanstack/react-query';
import { useWorkspaceQuery } from '../reactQuery/hooks/useWorkspaceQuery';
import Papa from 'papaparse';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const notifications = [
    {
      name: "Benjiman Cooper",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "CEO @Meta .Inc",
      title: "Re: Meeting with lead",
      time: "5s ago",
      type: 'Clicked',
      bg: "bg-[#33beff]",
      color: "text-[#ff336b]"
    },
    {
      name: "Casper",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "Sales Manager @Meta .Inc",
      title:  "Re: Meeting with lead",
      time: "9s ago",
      type: 'Hot lead',
      bg: "bg-[#33ffca]",
      color: "text-[#ff336b]"
    },
    {
      name: "John",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "Sales Manager @Meta .Inc",
      title:  "Re: Meeting with lead",
      time: "Yesterday",
      type: 'Unread',
      bg: "bg-[#7dff33]",
      color: "text-[#ff336b]"
    },
    {
      name: "Naism",
      img: "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
      designation: "Sales Manager @Meta .Inc",
      title:  "Re: Meeting with lead",
      time: "1 hour ago",
      type: 'Opened',
      color: "text-[#ff336b]",
      bg: "bg-[#e6ff33]",
    }
  ];
  const [workspaceName, setWorkspaceName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For toggling the menu on mobile
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [importModal, setImportModal] = useState(null); // 'csv', 'sheets', 'hubspot', etc.
  const [csvData, setCsvData] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [hubspotApiKey, setHubspotApiKey] = useState('');
  const [hubspotLoading, setHubspotLoading] = useState(false);

  const { createWorkspaceMutation, allWorkspace, switchWorkspaceMutation } = useWorkspaceQuery()
  const[selectedId, setSelectedId] = useState(null);
  const handleCreateWorkspace = () => {
    createWorkspaceMutation.mutate({WorkspaceName: workspaceName});
    setIsModalOpen(false);
    setWorkspaceName('');
  };

  // console.log(allWorkspace);
  useEffect(() => {
    const id = JSON.parse(localStorage.getItem("user"))
    setSelectedId(id?.data?.CurrentWorkspaceId)
    // console.log(id?.data?.CurrentWorkspaceId);
  }, [])
  
  const handleSwitchWorkspace = (id) => {
    console.log({WorkspaceId: id});
    setSelectedId(id);
    switchWorkspaceMutation.mutate({WorkspaceId: id});
    const storedData = JSON.parse(localStorage.getItem("user")) || {};
    storedData.data.CurrentWorkspaceId = id;
    localStorage.setItem("user", JSON.stringify(storedData));
  }
  



  const location = useLocation();
  const pathSegements = location.pathname.split('/').filter(Boolean);
  const lastSegements = pathSegements[pathSegements.length - 1];
  const formattedName = lastSegements?.replace(/-/g, ' ')?.split(' ').map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1))?.join(' ');

  const filteredNotifications = selectedFilter === "All" 
    ? notifications 
    : notifications.filter(notification => notification.type === selectedFilter);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.import-dropdown') && !e.target.closest('.import-btn')) {
        setShowImportDropdown(false);
      }
    };
    if (showImportDropdown) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showImportDropdown]);

  // CSV file handler
  const handleCSVFile = (e) => {
    setCsvError('');
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setCsvError('Error parsing CSV file.');
          setCsvData(null);
          setCsvPreview([]);
        } else {
          // Validation: require at least one of Name, Email, Phone columns
          const requiredCols = ['Name', 'Email', 'Phone'];
          const headers = results.meta.fields || [];
          const hasRequiredCol = requiredCols.some(col => headers.includes(col));
          if (!hasRequiredCol) {
            setCsvError('CSV must contain at least one of: Name, Email, or Phone columns.');
            setCsvData(null);
            setCsvPreview([]);
            return;
          }
          // Validation: at least one row with a non-empty value for one of these fields
          const validLeads = results.data.filter(row => requiredCols.some(col => (row[col] || '').trim() !== ''));
          if (validLeads.length === 0) {
            setCsvError('No valid leads found in the uploaded file.');
            setCsvData(null);
            setCsvPreview([]);
            return;
          }
          setCsvData(validLeads);
          setCsvPreview(validLeads.slice(0, 5));
        }
      },
      error: () => setCsvError('Error reading CSV file.'),
    });
  };

  // Send CSV data to backend
  const handleCSVImport = async () => {
    if (!csvData || !csvData.length) return;
    setCsvUploading(true);
    setCsvError('');
    try {
      const response = await axiosInstance.post('/lead/import-csv', { leads: csvData });
      setImportModal(null);
      setCsvData(null);
      setCsvPreview([]);
      setCsvUploading(false);
      toast.success('Leads imported successfully!');
    } catch (err) {
      setCsvError(err?.response?.data?.message || 'Failed to import leads.');
      setCsvUploading(false);
    }
  };

  // Google Sheets handler
  const handleGoogleSheetFile = (e) => {
    setCsvError('');
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setCsvError('Error parsing Google Sheets file.');
          setCsvData(null);
          setCsvPreview([]);
        } else {
          setCsvData(results.data);
          setCsvPreview(results.data.slice(0, 5));
        }
      },
      error: () => setCsvError('Error reading Google Sheets file.'),
    });
  };

  // HubSpot fetch handler
  const handleHubspotFetch = async () => {
    setCsvError('');
    setHubspotLoading(true);
    try {
      // HubSpot API: https://api.hubapi.com/crm/v3/objects/contacts
      const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${hubspotApiKey}` }
      });
      if (!response.ok) throw new Error('Failed to fetch from HubSpot. Check your API key.');
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) throw new Error('Unexpected HubSpot response.');
      // Map to our lead format
      const leads = data.results.map(c => ({
        Name: `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim(),
        Email: c.properties.email || '',
        Phone: c.properties.phone || '',
        Company: c.properties.company || '',
      }));
      setCsvData(leads);
      setCsvPreview(leads.slice(0, 5));
      setHubspotLoading(false);
    } catch (err) {
      setCsvError('Failed to fetch or parse HubSpot contacts.');
      setHubspotLoading(false);
    }
  };


  return (
    <>
      <nav className="border-b border-gray-200 bg-white w-full flex ">
        <div className="max-w-9xl mx-auto px-2 ml-12 md:ml-16 sm:px-3 lg:px-8 w-full pt-5 pb-1">
          <div className="flex items-center justify-between h-10">
            
            {/* Left side - Logo */}
            <div className="flex items-center">
              <span className="text-xl font-bold"> {formattedName || "Dashboard"} </span>
            </div>
            <div className="hidden md:flex">
        <ul className="flex gap-5 pb-0">
          <Link to="/" className={`pb-3 ${location.pathname === "/" ? "border-b-2 border-green-500" : ""}`}>
            <li className={`${location.pathname === "/" ? "text-green-500" : ""}`}>Home</li>
          </Link>
          <Link to="/crm" className={`pb-3 flex items-center ${location.pathname === "/crm" ? "border-b-2 border-green-500" : ""}`}>
          <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
            <li className={`${location.pathname === "/crm" ? "text-green-500" : ""}`}>AI CRM</li>
          </Link>
          <Link to="/campaigns" className={`pb-3 ${location.pathname === "/campaigns" ? "border-b-2 border-green-500" : ""}`}>
            <li className={`${location.pathname === "/campaigns" ? "text-green-500" : ""}`}>Campaigns</li>
          </Link>
        </ul>
      </div>

            

      <div className="flex items-center md:space-x-2 gap-1">
              {/* Import Leads Button and Dropdown - moved to left of notifications */}
              <div className="relative flex items-center gap-2">
                <button
                  className="ml-0 sm:ml-2 w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg shadow border-2 border-green-700 import-btn mb-2 sm:mb-0"
                  onClick={() => setShowImportDropdown((v) => !v)}
                >
                  <Upload className="inline-block w-4 h-4 mr-1" /> Import Leads
                </button>
                {showImportDropdown && (
                  <div className="import-dropdown absolute left-0 top-full mt-2 min-w-[220px] max-w-[320px] w-[90vw] sm:w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 animate-fade-in transition-all duration-150">
                    <div className="px-4 pt-2 pb-1 font-semibold text-gray-700 text-base border-b border-gray-100">Import Leads From</div>
                    <button className="flex flex-col items-start w-full px-4 py-2 hover:bg-green-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group" onClick={() => {setImportModal('csv'); setShowImportDropdown(false);}}>
                      <div className="flex items-center"><FileText className="w-5 h-5 mr-2 text-green-600" /> CSV File</div>
                      <span className="text-xs text-gray-400 ml-7 group-hover:text-green-700">Upload a CSV file</span>
                    </button>
                    <button className="flex flex-col items-start w-full px-4 py-2 hover:bg-green-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group" onClick={() => {setImportModal('sheets'); setShowImportDropdown(false);}}>
                      <div className="flex items-center"><Sheet className="w-5 h-5 mr-2 text-green-600" /> Google Sheets</div>
                      <span className="text-xs text-gray-400 ml-7 group-hover:text-green-700">Import from a Google Sheets file</span>
                    </button>
                    <div className="my-2 border-t border-gray-200"></div>
                    <button className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group" onClick={() => {setImportModal('hubspot'); setShowImportDropdown(false);}}>
                      <div className="flex items-center"><Link2 className="w-5 h-5 mr-2 text-blue-600" /> HubSpot</div>
                      <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">Connect your HubSpot account</span>
                    </button>
                    <button className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group" onClick={() => {toast('Coming soon!'); setShowImportDropdown(false);}}>
                      <div className="flex items-center"><Database className="w-5 h-5 mr-2 text-blue-600" /> Pipedrive</div>
                      <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">Connect your Pipedrive account</span>
                    </button>
                    <button className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group" onClick={() => {toast('Coming soon!'); setShowImportDropdown(false);}}>
                      <div className="flex items-center"><Cloud className="w-5 h-5 mr-2 text-blue-600" /> Salesforce</div>
                      <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">Connect your Salesforce account</span>
                    </button>
                    <button className="flex flex-col items-start w-full px-4 py-2 hover:bg-blue-50 hover:scale-[1.03] transition-transform rounded text-gray-800 group" onClick={() => {toast('Coming soon!'); setShowImportDropdown(false);}}>
                      <div className="flex items-center"><Users className="w-5 h-5 mr-2 text-blue-600" /> Zoho</div>
                      <span className="text-xs text-gray-400 ml-7 group-hover:text-blue-700">Connect your Zoho account</span>
                    </button>
                  </div>
                )}
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
                  <Bell size={22}/>
                </button>

                {isNotificationOpen && (
                  <div className="absolute -left-50 mt-4 bg-white shadow-lg w-80 rounded-lg px-1 py-3 z-10">
                    <div className='flex gap-2 items-center p-2'>
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
                    <ul className='flex gap-3 p-2 text-[15px] font-semibold cursor-pointer'>
                      {["All", "Unread", "Opened", "Clicked", "Hot lead"].map((filter) => (
                        <li 
                          key={filter} 
                          className={selectedFilter === filter ? "text-blue-500" : ""}
                          onClick={() => setSelectedFilter(filter)}
                        >
                          {filter}
                        </li>
                      ))}
                    </ul>

                    {/* Filtered Notifications */}
                    {filteredNotifications.map((val, index) => (
                      <div key={index} className='flex gap-3 px-3 mt-5'>
                        <img src={val.img} className='w-9 h-9 rounded-full object-cover' alt="" />
                        <div>
                          <div className='flex text-[15px] gap-2 items-center'>
                            <h2>{val.name}</h2>
                            <p className='text-gray-400'>{val.designation}</p>
                          </div>
                          <p>{val.title}</p>
                          <div className='flex items-center gap-1'>
                            <p className={`${val.bg} px-1.5 py-0.5 ${val.color} rounded-full text-[13px] inline-flex items-center`}>
                              {val.type}
                            </p>
                            <p>{val.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show message if no notifications */}
                    {filteredNotifications.length === 0 && (
                      <p className="text-center text-gray-500 mt-3">No notifications found</p>
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
                      <Link to='/settings'>
                        Settings
                      </Link>
                      <Settings className="w-4 h-4 mr-2 text-gray-400" />
                    </span>
                    <hr className='text-gray-300' />
                    <span className="flex items-center justify-between px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                      <Link to='/support'>
                        Help Center
                      </Link>
                      <HelpCircle className="w-4 h-4 mr-2 text-gray-400" />
                    </span>
                    <hr className='text-gray-300' />
                    {  JSON.parse(localStorage?.getItem("user"))?.data ? 
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex justify-between cursor-pointer items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Logout
                        <LogOut className="w-4 h-4 mr-2" />
                      </button> :
                      <button
                        className="w-full text-left flex justify-between cursor-pointer items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <Link to='/login'>
                          Signin
                        </Link>
                      </button> 
                    }
                  </div>
                )}
              </div>

              {/* Organization Dropdown */}
              <div className="relative dropdown flex items-center gap-2">                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    setIsOrgOpen(!isOrgOpen);
                  }}
                  className="p-1.5 border border-gray-300 cursor-pointer text-gray-600 rounded-full flex gap-1 items-center"
                >
                  <span className='hidden md:block text-sm'>My Organization</span>
                  {/* <span className='block md:hidden text-sm'>Org</span> */}
                  <ChevronDown className="w-4 h-5" />
                </button>

                {isOrgOpen && (
                  <div className="absolute border-none outline-none right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-10 border">
                    {/* <div className="pb-2"> */}
                      {/* <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none"
                      /> */}
                    {/* </div> */}
                      <div className="p-2">
                        <ul>
                        {allWorkspace.OwnedWorkspaces.map((val) => (
                          <div key={val?.id}>
                            <input
                              onChange={() => handleSwitchWorkspace(val?.id)}
                                  className="cursor-pointer my-2"
                                  type="radio"
                                  name="workspace"
                                  id={`workspace-${val?.id}`}
                                  checked={selectedId === val?.id}
                                />
                                <span className='mx-2'>{val?.WorkspaceName}</span>
                                <hr className='text-[#16C47F]' />
                              </div>
                            ))}
                          </ul>
                      </div>

                    <div onClick={()=> setIsModalOpen(true)} className="px-3 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="text-sm">Create Workspace</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isModalOpen && (<div className="fixed bottom-20 inset-0 flex items-center z-40 justify-center">
              <div className="bg-white md:w-96 w-[80%] z-[150] p-6 rounded-lg shadow-lg modal">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Create New Workspace</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 cursor-pointer hover:text-gray-700">
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
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-[#FF9D23] hover:text-white cursor-pointer border border-gray-300 rounded-md text-sm">
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
            <ul className='flex flex-col gap-2 p-4 justify-center items-center '>
              <Link to='/'>
                <li>Home</li>
              </Link>
              <Link to='/crm'>
                <li>AI CRM</li>
              </Link>
              <Link to="/campaigns">
                <li>Campaigns</li>
              </Link>
            </ul>
          </div>
        )}
      </nav>
            {/* Import Modals */}
            {importModal === 'csv' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => { setImportModal(null); setCsvData(null); setCsvPreview([]); setCsvError(''); }}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Import from CSV</h2>
            <input type="file" accept=".csv" onChange={handleCSVFile} className="mb-2" />
            {csvError && <div className="text-red-500 text-sm mb-2">{csvError}</div>}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Preview (first 5 rows):</div>
                <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(csvPreview, null, 2)}</pre>
              </div>
            )}
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleCSVImport}
              disabled={!csvData || csvUploading || !!csvError}
            >
              {csvUploading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      )}
      {importModal === 'sheets' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => { setImportModal(null); setCsvData(null); setCsvPreview([]); setCsvError(''); }}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Import from Google Sheets</h2>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleGoogleSheetFile}
              className="mb-2"
            />
            {csvError && <div className="text-red-500 text-sm mb-2">{csvError}</div>}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Preview (first 5 rows):</div>
                <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(csvPreview, null, 2)}</pre>
              </div>
            )}
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleCSVImport}
              disabled={!csvData || csvUploading}
            >
              {csvUploading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      )}
      {importModal === 'hubspot' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => { setImportModal(null); setCsvData(null); setCsvPreview([]); setCsvError(''); setHubspotApiKey(''); }}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Import from HubSpot</h2>
            {!hubspotLoading && !csvData && (
              <div className="mb-4">
                <p className="mb-2">To import leads from HubSpot, you must connect your HubSpot account.</p>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  onClick={() => {
                    window.location.href = 'http://localhost:4000/auth/hubspot';
                  }}
                >
                  Connect to HubSpot
                </button>
              </div>
            )}
            {hubspotLoading && <div className="mb-2 text-gray-500">Loading leads from HubSpot...</div>}
            {csvError && <div className="text-red-500 text-sm mb-2">{csvError}</div>}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Preview (first 5 rows):</div>
                <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(csvPreview, null, 2)}</pre>
              </div>
            )}
            {csvData && (
              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={handleCSVImport}
                disabled={!csvData || csvUploading}
              >
                {csvUploading ? 'Importing...' : 'Import'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;