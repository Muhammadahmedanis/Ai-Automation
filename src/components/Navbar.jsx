import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, User, HelpCircle, Settings, LogOut, Plus, X, Briefcase, Menu, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { QueryClient } from '@tanstack/react-query';
import { useWorkspaceQuery } from '../reactQuery/hooks/useWorkspaceQuery';

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

            

            {/* Right Side - Dropdowns */}
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
              <div className="relative dropdown">
                <button
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
    </>
  );
};

export default Navbar;