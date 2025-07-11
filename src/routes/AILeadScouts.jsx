import React, { useState, useEffect } from "react";
import { 
  FaSearch, FaBriefcase, FaMapMarkerAlt, FaIndustry, FaUsers, FaDollarSign, 
  FaGlobe, FaCogs, FaMoneyCheckAlt, FaUser, FaBuilding, FaHandSparkles 
} from "react-icons/fa";
import backgroundImage from "../assets/AILead_Scouts.jpeg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { parseNaturalLanguageQuery, isNaturalLanguageQuery, formatSearchQuery } from "../utils/nlpParser";

export default function LeadSearch() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showJobTitles, setShowJobTitles] = useState(false);
  const [showIndustry, setShowIndustry] = useState(false);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [skipOwned, setSkipOwned] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedRevenues, setSelectedRevenues] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  
  // Additional filter states to match AILeadSearch
  const [showTechnologies, setShowTechnologies] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [showFundingType, setShowFundingType] = useState(false);
  const [selectedFundingTypes, setSelectedFundingTypes] = useState([]);
  const [showLookalikeInput, setShowLookalikeInput] = useState(false);
  const [lookalikeDomain, setLookalikeDomain] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
  
  // Predefined filter options
  const allJobTitles = [
    "CEO", "CTO", "CFO", "COO", "CMO", "Manager", "Developer", "Engineer", "Designer", 
    "Product Manager", "Sales", "Marketing", "HR", "Recruiter", "Data Scientist", 
    "Analyst", "Consultant", "Director", "VP", "President", "Founder", "Owner",
    "Senior", "Junior", "Lead", "Architect", "DevOps", "QA", "Scrum Master",
    "Business Analyst", "Project Manager"
  ];
  
  const allIndustries = [
    "Software", "Finance", "Healthcare", "Retail", "Manufacturing", "Education",
    "Real Estate", "Marketing", "Consulting", "Non-Profit", "Energy", "Transportation",
    "Entertainment", "Food", "Legal", "Government", "Telecommunications"
  ];
  
  const allLocations = [
    "New York", "London", "San Francisco", "Berlin", "Paris", "Toronto", "Sydney", 
    "Singapore", "Dubai", "Remote", "Los Angeles", "Chicago", "Boston", "Austin", 
    "Seattle", "Tokyo", "Delhi", "Karachi", "Lahore", "Islamabad", "Mumbai", 
    "Bangalore", "Shanghai", "Beijing", "Moscow", "Madrid", "Rome", "Istanbul", 
    "Cairo", "Johannesburg", "Stockholm", "Gothenburg", "Malmö", "Uppsala"
  ];
  
  const allEmployees = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
  
  const allRevenues = ["$0-1M", "$1M-10M", "$10M-50M", "$50M-250M", "$250M-1B", "$1B+"];
  
  const allTechnologies = [
    "JavaScript", "Python", "Java", "React", "Angular", "Vue", "Node.js", "AWS", 
    "Azure", "Google Cloud", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", 
    "MySQL", "Redis", "Git", "Jenkins", "Jira", "Slack"
  ];
  
  const allFundingTypes = [
    "Seed", "Series A", "Series B", "Series C", "IPO", "Private Equity", "Venture Capital"
  ];

  useEffect(() => {
    console.log("selectedJobTitles changed:", selectedJobTitles);
  }, [selectedJobTitles]);

  // Handler for job title checkbox
  const handleJobTitleChange = (title) => {
    setSelectedJobTitles((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  // Handler for industry checkbox
  const handleIndustryChange = (industry) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const handleLocationChange = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
  };

  const handleLocationInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (locationInput.trim() !== "" && !selectedLocations.includes(locationInput.trim())) {
        setSelectedLocations(prev => [...prev, locationInput.trim()]);
        setLocationInput(""); // Optionally clear the input
      }
    }
  };

  const handleNameInputChange = (e) => {
    setNameInput(e.target.value);
  };

  const handleNameInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nameInput.trim() !== "" && !selectedNames.includes(nameInput.trim())) {
        const newNames = [...selectedNames, nameInput.trim()];
        setSelectedNames(newNames);
        setNameInput("");
        handleSearch(searchQuery, { overrideNames: newNames });
      }
    }
  };

  const handleCompanyInputChange = (e) => {
    setCompanyInput(e.target.value);
  };

  const handleCompanyInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (companyInput.trim() !== "" && !selectedCompanies.includes(companyInput.trim())) {
        const newCompanies = [...selectedCompanies, companyInput.trim()];
        setSelectedCompanies(newCompanies);
        setCompanyInput("");
        handleSearch(searchQuery, { overrideCompanies: newCompanies });
      }
    }
  };

  const handleEmployeesChange = (emp) => {
    setSelectedEmployees((prev) =>
      prev.includes(emp) ? prev.filter((e) => e !== emp) : [...prev, emp]
    );
  };

  const handleRevenueChange = (rev) => {
    setSelectedRevenues((prev) =>
      prev.includes(rev) ? prev.filter((r) => r !== rev) : [...prev, rev]
    );
  };

  const handleNamesChange = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleCompaniesChange = (company) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  // Additional handlers for new filters
  const handleTechnologyChange = (tech) => {
    setSelectedTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleFundingTypeChange = (funding) => {
    setSelectedFundingTypes((prev) =>
      prev.includes(funding) ? prev.filter((f) => f !== funding) : [...prev, funding]
    );
  };

  const handleLookalikeKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!lookalikeDomain.trim()) {
        toast.error("Please enter a domain");
        return;
      }
      handleSearch(searchQuery || "all");
    }
  };

  const handleJobTitleInputChange = (e) => {
    setJobTitleInput(e.target.value);
  };

  const handleJobTitleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (jobTitleInput.trim() !== "" && !selectedJobTitles.includes(jobTitleInput.trim())) {
        const newJobTitles = [...selectedJobTitles, jobTitleInput.trim()];
        setSelectedJobTitles(newJobTitles);
        setJobTitleInput("");
        handleSearch(searchQuery, { overrideJobTitles: newJobTitles });
      }
    }
  };

  const handleSearch = (query = searchQuery, overrides = {}) => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setIsLoading(true);
    
    // Parse natural language query if present
    let extractedParams = {};
    let finalQuery = query;
    if (isNaturalLanguageQuery(query)) {
      extractedParams = parseNaturalLanguageQuery(query);
      finalQuery = formatSearchQuery(query, extractedParams);
    }

    // Unify manual filters and extracted filters (manual filters take precedence)
    const jobTitles = overrides.overrideJobTitles || (selectedJobTitles.length > 0 ? selectedJobTitles : (extractedParams.person_titles || []));
    const industries = selectedIndustries.length > 0 ? selectedIndustries : (extractedParams.industries || []);
    const locations = selectedLocations.length > 0 ? selectedLocations : (extractedParams.locations || []);
    const employees = selectedEmployees.length > 0 ? selectedEmployees : (extractedParams.employees || []);
    const revenues = selectedRevenues.length > 0 ? selectedRevenues : (extractedParams.revenues || []);
    const technologies = selectedTechnologies.length > 0 ? selectedTechnologies : (extractedParams.technologies || []);
    const fundingTypes = selectedFundingTypes.length > 0 ? selectedFundingTypes : (extractedParams.funding_types || []);
    const names = overrides.overrideNames || (selectedNames.length > 0 ? selectedNames : (extractedParams.names || []));
    const companies = overrides.overrideCompanies || (selectedCompanies.length > 0 ? selectedCompanies : (extractedParams.companies || []));
    const lookalikeDomains = extractedParams.lookalike_domains?.length > 0 ? extractedParams.lookalike_domains : [];

    // If no search query but filters are selected, build a query string from filters
    if (!finalQuery || finalQuery.trim() === "" || finalQuery === "all") {
      let filterQueryParts = [];
      if (jobTitles.length > 0) filterQueryParts.push(jobTitles.join(", "));
      if (locations.length > 0) filterQueryParts.push("in " + locations.join(", "));
      if (industries.length > 0) filterQueryParts.push("industry: " + industries.join(", "));
      if (employees.length > 0) filterQueryParts.push("employees: " + employees.join(", "));
      if (revenues.length > 0) filterQueryParts.push("revenue: " + revenues.join(", "));
      if (technologies.length > 0) filterQueryParts.push("technologies: " + technologies.join(", "));
      if (fundingTypes.length > 0) filterQueryParts.push("funding: " + fundingTypes.join(", "));
      if (names.length > 0) {
        if (
          names.length === 1 &&
          filterQueryParts.length === 0 &&
          jobTitles.length === 0 &&
          locations.length === 0 &&
          industries.length === 0 &&
          employees.length === 0 &&
          revenues.length === 0 &&
          technologies.length === 0 &&
          fundingTypes.length === 0 &&
          companies.length === 0
        ) {
          filterQueryParts.push(names[0]);
        } else {
          filterQueryParts.push("names: " + names.join(", "));
        }
      }
      if (companies.length > 0) filterQueryParts.push("companies: " + companies.join(", "));
      if (filterQueryParts.length > 0) {
        finalQuery = filterQueryParts.join(" ");
      }
    }
    
    // Build query params for URL
    const params = new URLSearchParams();
    if (jobTitles.length > 0) params.set("jobTitles", jobTitles.join(","));
    if (industries.length > 0) params.set("industries", industries.join(","));
    if (locations.length > 0) params.set("locations", locations.join(","));
    if (employees.length > 0) params.set("employees", employees.join(","));
    if (revenues.length > 0) params.set("revenues", revenues.join(","));
    if (technologies.length > 0) params.set("technologies", technologies.join(","));
    if (fundingTypes.length > 0) params.set("fundingTypes", fundingTypes.join(","));
    if (names.length > 0) params.set("names", names.join(","));
    if (companies.length > 0) params.set("companies", companies.join(","));
    if (lookalikeDomains.length > 0) params.set("lookalikeDomains", lookalikeDomains.join(","));
    if (locationInput.trim() !== "") params.set("locationInput", locationInput.trim());
    if (nameInput.trim() !== "") params.set("nameInput", nameInput.trim());
    if (companyInput.trim() !== "") params.set("companyInput", companyInput.trim());
    if (jobTitleInput.trim() !== "") params.set("jobTitleInput", jobTitleInput.trim());
    if (lookalikeDomain.trim() !== "") params.set("lookalikeDomain", lookalikeDomain.trim());
    params.set("searchQuery", finalQuery);
    params.set("skipOwned", skipOwned ? "1" : "0");

    console.log('jobTitles:', jobTitles);
    console.log('industries:', industries);
    console.log('locations:', locations);
    console.log('employees:', employees);
    console.log('revenues:', revenues);
    console.log('technologies:', technologies);
    console.log('fundingTypes:', fundingTypes);
    console.log('names:', names);
    console.log('companies:', companies);
    console.log('Final URL:', `/ai-lead-search?${params.toString()}`);
    navigate(`/ai-lead-search?${params.toString()}`);
      setIsLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div className="flex min-h-screen w-full h-full flex-col md:flex-row gap-5 md:gap-0 pl-[10px] md:pl-[25px]">
      {/* Sidebar - same as AILeadSearch */}
      <div className="w-full h-full md:w-[400px] bg-white border border-gray-200 rounded-2xl flex flex-col">
        <div className="p-4 border-b border-gray-200 w-full">
          <h2 className="text-l md:text-xl font-bold mb-[40px]">Search Manually</h2>
          
          {/* Filter Status Indicator */}
          {(selectedJobTitles.length > 0 || selectedIndustries.length > 0 || selectedLocations.length > 0 || 
            selectedEmployees.length > 0 || selectedRevenues.length > 0 || selectedTechnologies.length > 0 || 
            selectedFundingTypes.length > 0 || selectedNames.length > 0 || selectedCompanies.length > 0 ||
            locationInput.trim() !== "" || nameInput.trim() !== "" || companyInput.trim() !== "" ||
            jobTitleInput.trim() !== "" || lookalikeDomain.trim() !== "") && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-sm font-medium">⚠️ Filters Selected</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Click "Search with Filters" button below to apply your selections
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <FaMapMarkerAlt />
            <span className="text-md md:text-lg text-gray-500">Skip already owned</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={skipOwned}
                onChange={() => setSkipOwned((v) => !v)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <nav className="p-2 space-y-4">
          {/* Job Titles Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowJobTitles((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaBriefcase />
                <span className="pl-[15px]">Job titles</span>
              </span>
              <span>{showJobTitles ? '▲' : '▼'}</span>
            </div>
            {showJobTitles && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                {allJobTitles.map((title, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedJobTitles.includes(title)}
                      onChange={() => handleJobTitleChange(title)}
                    />
                    <span>{title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Location Input */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowLocation((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaMapMarkerAlt />
                <span className="pl-[15px]">Location</span>
              </span>
              <span>{showLocation ? '▲' : '▼'}</span>
            </div>
            {showLocation && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Enter location (e.g., New York, London, Remote)"
                    value={locationInput}
                    onChange={handleLocationInputChange}
                    onKeyDown={handleLocationInputKeyDown}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Start typing to search for leads in this location
                </div>
              </div>
            )}
          </div>
          {/* Industry & Keywords Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowIndustry((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaIndustry />
                <span className="pl-[15px]">Industry & Keywords</span>
              </span>
              <span>{showIndustry ? '▲' : '▼'}</span>
            </div>
            {showIndustry && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                {allIndustries.map((industry, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedIndustries.includes(industry)}
                      onChange={() => handleIndustryChange(industry)}
                    />
                    <span>{industry}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Employees Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowEmployees((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaUsers />
                <span className="pl-[15px]">Employees</span>
              </span>
              <span>{showEmployees ? '▲' : '▼'}</span>
            </div>
            {showEmployees && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                {allEmployees.map((emp, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedEmployees.includes(emp)}
                      onChange={() => handleEmployeesChange(emp)}
                    />
                    <span>{emp}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Revenue Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowRevenue((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaDollarSign />
                <span className="pl-[15px]">Revenue</span>
              </span>
              <span>{showRevenue ? '▲' : '▼'}</span>
            </div>
            {showRevenue && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                {allRevenues.map((rev, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedRevenues.includes(rev)}
                      onChange={() => handleRevenueChange(rev)}
                    />
                    <span>{rev}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Name Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowNames((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaUser />
                <span className="pl-[15px]">Name</span>
              </span>
              <span>{showNames ? '▲' : '▼'}</span>
            </div>
            {showNames && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Enter person name (e.g., John Smith, Jane Doe)"
                    value={nameInput}
                    onChange={handleNameInputChange}
                    onKeyDown={handleNameInputKeyDown}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Start typing to search for leads with this name
                </div>
              </div>
            )}
          </div>
          {/* Company Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowCompanies((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaBuilding />
                <span className="pl-[15px]">Company</span>
              </span>
              <span>{showCompanies ? '▲' : '▼'}</span>
            </div>
            {showCompanies && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Enter company name (e.g., Google, Microsoft)"
                    value={companyInput}
                    onChange={handleCompanyInputChange}
                    onKeyDown={handleCompanyInputKeyDown}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Start typing to search for leads at this company
                </div>
              </div>
            )}
          </div>
          {/* Technologies Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowTechnologies((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaCogs />
                <span className="pl-[15px]">Technologies</span>
              </span>
              <span>{showTechnologies ? '▲' : '▼'}</span>
            </div>
            {showTechnologies && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                {allTechnologies.map((tech, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedTechnologies.includes(tech)}
                      onChange={() => handleTechnologyChange(tech)}
                    />
                    <span>{tech}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Funding Type Dropdown */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowFundingType((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaMoneyCheckAlt />
                <span className="pl-[15px]">Funding Type</span>
              </span>
              <span>{showFundingType ? '▲' : '▼'}</span>
            </div>
            {showFundingType && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                {allFundingTypes.map((funding, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedFundingTypes.includes(funding)}
                      onChange={() => handleFundingTypeChange(funding)}
                    />
                    <span>{funding}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Lookalike Domain Input */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowLookalikeInput((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaGlobe />
                <span className="pl-[15px]">Lookalike Domain</span>
              </span>
              <span>{showLookalikeInput ? '▲' : '▼'}</span>
            </div>
            {showLookalikeInput && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Enter domain (e.g., netflix.com, shopify.com)"
                    value={lookalikeDomain}
                    onChange={(e) => setLookalikeDomain(e.target.value)}
                    onKeyDown={handleLookalikeKeyDown}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Find companies similar to this domain
                </div>
              </div>
            )}
          </div>
          
          {/* Job Title Input */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div className="flex items-center space-x-2 justify-between" onClick={() => setShowCustomJobTitle((prev) => !prev)}>
              <span className="flex items-center space-x-2">
                <FaBriefcase />
                <span className="pl-[15px]">Custom Job Title</span>
              </span>
              <span>{showCustomJobTitle ? '▲' : '▼'}</span>
            </div>
            {showCustomJobTitle && (
              <div className="pl-8 pt-2 flex flex-col gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Enter custom job title (e.g., Growth Hacker, UX Researcher)"
                    value={jobTitleInput}
                    onChange={handleJobTitleInputChange}
                    onKeyDown={handleJobTitleInputKeyDown}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Search for custom job titles not in the list
                </div>
              </div>
            )}
          </div>
          
          {/* Search Button */}
          <div className="w-full p-4 pt-6">
            <button
              onClick={() => handleSearch(searchQuery || "all")}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-emerald-600 px-4 py-3 text-white font-semibold text-md rounded-lg hover:from-amber-600 hover:to-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaHandSparkles size={16} />
              <span>{isLoading ? "Searching..." : "Search with Filters"}</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Apply all selected filters and search for leads
            </p>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex justify-center items-center w-full bg-black relative bg-cover bg-center rounded-2xl md:mx-4 md:p-10" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="bg-opacity-60 rounded-2xl shadow-lg w-full max-w-[1000px] md:w-[750px] text-center p-4 md:p-10">
          <h2 className="text-white text-xl md:text-3xl mb-[15px] md:mb-[75px] pb-[15px] md:pb-[30px] mt-[0px]">
            Discover high-value leads with ease
          </h2>
          {/* Quick Search Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 w-full max-w-[350px] md:w-[650px] mx-auto">
            {[
              "I want to get all software engineers in Sweden",
              "Find me marketing directors in tech companies with $10M+ revenue",
              "Show me CEOs at startups using React and AWS",
              "Get all sales representatives at Google and Microsoft",
              "Find founders in fintech companies with Series A funding",
              "Looking for data scientists in New York using Python",
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearch(item)}
                className="px-4 py-3 text-sm bg-gray-500/30 text-white rounded-full shadow my-[10px] mx-[6px] hover:bg-gray-500/50 transition-colors duration-200"
                disabled={isLoading}
                title={`Quick search: ${item}`}
              >
                {isLoading ? "Searching..." : item}
              </button>
            ))}
          </div>
          {/* Search Manually Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex items-center gap-2 bg-white rounded-full shadow-md overflow-hidden justify-between w-full max-w-xl mx-auto border border-gray-200 px-2 py-1">
              <div className="text-gray-500 ml-2 md:block hidden">
              <FaSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Try: 'I want to get all software engineers in Sweden' or 'Find me marketing directors in tech companies'"
                className="flex-1 px-4 py-3 text-gray-700 focus:outline-none text-sm bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
            />
            <div className="md:mr-2">
              <button
                  type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-500 to-emerald-600 px-4 py-2 text-white font-semibold text-sm md:text-md rounded-full flex items-center w-full hover:from-amber-600 hover:to-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="AI Search"
              >
                <FaHandSparkles size={16} className="mr-1 md:block hidden" />
                <span>{isLoading ? "Searching..." : "AI Search"}</span>
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
