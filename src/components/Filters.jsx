import React, { useState } from 'react'
import {ChevronDown, Zap } from 'lucide-react';

function Filters() {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sortOrder, setSortOrder] = useState('Oldest first');
  const [campaigns, setCampaigns] = useState([]);
    
  const sortOptions = [
    { value: 'Newest first', label: 'Newest first' },
    { value: 'Oldest first', label: 'Oldest first' },
    { value: 'Name A - Z', label: 'Name A - Z' },
    { value: 'Name Z - A', label: 'Name Z - A' }
  ];

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const handleSortChange = (sort) => {
    setSortOrder(sort);
    setShowSortDropdown(false);
    const sortedCampaigns = [...campaigns];
    
    if (sort === 'Newest first') {
      sortedCampaigns.sort((a, b) => b.id - a.id);
    } else if (sort === 'Oldest first') {
      sortedCampaigns.sort((a, b) => a.id - b.id);
    } else if (sort === 'Name A - Z') {
      sortedCampaigns.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'Name Z - A') {
      sortedCampaigns.sort((a, b) => b.name.localeCompare(a.name));
    }
    setCampaigns(sortedCampaigns);
  };

  return (
    <div>
      <div className="flex flex-col w-52 md:w-auto gap-2 md:flex-row space-x-4">
        <div className="relative">
            <button
            type="button"   
            className="inline-flex items-center cursor-pointer justify-center w-full rounded-full border border-gray-300 px-4 py-2 bg-white text-sm font-medium gap-1 text-gray-400 hover:bg-gray-50 focus:outline-none"
            id="filter-menu"
            onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
                setShowSortDropdown(false);
            }}
            >
            <Zap size={18} className='text-gray-400' />
            {statusFilter}
            <ChevronDown size={16} className="ml-2 text-gray-400" />
            </button>
            
            {/* Status dropdown */}
            {showStatusDropdown && (
            <div 
                className="origin-top-right absolute right-0 left-1 mt-2 w-80 rounded-md shadow-lg bg-white border-gray-300 ring-opacity-5 focus:outline-none z-10"
                onClick={handleDropdownClick}
            >
                <div className="py-1">
                    <div className='p-2'>
                        <h3 className='mb-2 font-bold text-[15px]'>Contact</h3>
                        <div className='flex items-center gap-2'>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>Email</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>Linkedin</p>
                            <p className='bg-gray-100 px-2  py-1 font-semibold text-[14px] rounded-full text-gray-400'>Phone</p>
                        </div>
                    </div>
                    <div className='p-2'>
                        <h3 className='mb-2 font-bold text-[15px]'>Revenue</h3>
                        <div className='flex flex-wrap items-center gap-2'>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>$0-1M</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>$1M-10M</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>$10M-50M</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>$250M-300M</p>
                        </div>
                    </div>
                    <div className='p-2'>
                        <h3 className='mb-2 font-bold text-[15px]'>Senioerity</h3>
                        <div className='flex items-center gap-2'>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>C-level</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>Staff</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>Others</p>
                            <p className='bg-gray-100 px-2 py-1 font-semibold text-[14px] rounded-full text-gray-400'>Manager-Level</p>
                        </div>
                    </div>

                    <div className='p-2'>
                        <h3 className='mb-2 font-bold text-[15px]'>Industry</h3>
                        <div className="relative">
                            <select className="w-full p-2.5 mt-2 text-sm border outline-none border-gray-300 rounded-md">
                            <option value="">All Campaigns</option>
                            <option value="option1">Campaign 1</option>
                            <option value="option2">Campaign 2</option>
                            <option value="option3">Campaign 3</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
            )}
        </div>
        <div className="relative">
            <button
            type="button"
            className="inline-flex justify-center cursor-pointer w-full rounded-full border border-gray-300 px-4 py-2 bg-white text-sm font-medium gap-1 text-gray-400 hover:bg-gray-50 focus:outline-none"
            id="sort-menu"
            onClick={(e) => {
                e.stopPropagation();
                setShowSortDropdown(!showSortDropdown);
                setShowStatusDropdown(false);
            }}
            >
            {sortOrder}
            <ChevronDown size={16} className="ml-2 text-gray-400" />
            </button>
            
            {showSortDropdown && (
            <div 
                className="origin-top-right absolute right-0 left-1 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                onClick={handleDropdownClick}
            >
                <div className="py-1">
                {sortOptions.map((option) => (
                    <button
                    key={option.value}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                        sortOrder === option.value ? 'text-[#16C47F] font-medium' : 'text-gray-700'
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
        </div>
    </div>
  )
}

export default Filters