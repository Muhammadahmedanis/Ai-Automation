import React, { useState, useEffect, useRef } from 'react'
import { Search, EyeOff } from "lucide-react"
import { FaBriefcase, FaMapMarkerAlt, FaIndustry, FaUsers, FaDollarSign, FaGlobe, FaCogs, FaMoneyCheckAlt, FaUser, FaBuilding, FaSearch, FaTimes, FaFilter, FaUserPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAILeadScoutQuery } from "../reactQuery/hooks/useAILeadScoutQuery";
import { toast } from "react-hot-toast";
import axiosInstance from "../services/axiosInstance";
import { summarizeMainKeywords } from "../utils/nlpParser";
import { useCampaignQuery } from "../reactQuery/hooks/useCampaignQuery";
import { searchLeads } from "../reactQuery/services/aiLeadScoutService";

function CustomCheckbox({ id, checked = false, onChange = () => {}, disabled = false }) {
  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div
        onClick={!disabled ? onChange : undefined}
        className={`rounded-sm h-4 w-4 border flex items-center justify-center transition-colors
          ${disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 
            checked ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}
        `}
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  )
}

function CustomButton({ children, variant = "default", className = "", ...props }) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9 text-sm",
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  )
}

// Helper to fetch alternatives from GotAlt
async function fetchDomainAlternatives(domain) {
  try {
    // Call backend proxy with /integration prefix
    const url = `${import.meta.env.VITE_API_URL}integration/gotalt-alternatives?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch alternatives");
    const data = await res.json();
    return data.alternatives || [];
  } catch (err) {
    return null;
  }
}

// Helper function to split array into batches
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Helper function to send batches in parallel (up to N at a time) with error handling
async function sendBatchesInParallel(batches, campaignId, updateProgress, alreadyAddedEmails = null) {
  const CONCURRENCY = 3; // Reduced for stability
  let totalAdded = 0;
  let hadError = false;
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const batchGroup = batches.slice(i, i + CONCURRENCY);
    const promises = batchGroup.map(async (batch) => {
      if (batch.length > 0) {
        try {
          await axiosInstance.post("/lead/AddLeadsToCampaign", {
            Leads: batch,
            CampaignId: campaignId
          });
          if (alreadyAddedEmails) batch.forEach(lead => alreadyAddedEmails.add(lead.email));
          totalAdded += batch.length;
          updateProgress(totalAdded);
        } catch (err) {
          hadError = true;
          console.error('Batch add failed:', err);
          toast.error('Failed to add a batch of leads to campaign.');
        }
      }
    });
    await Promise.all(promises);
  }
  if (hadError) {
    toast.error('Some batches failed to add. Please check your connection or try again.');
  }
  return totalAdded;
}

export default function AILeadSearch() {
  const [selectAll, setSelectAll] = useState(false);
  const [skipOwned, setSkipOwned] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [leads, setLeads] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showJobTitles, setShowJobTitles] = useState(false);
  const [showIndustry, setShowIndustry] = useState(false);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedRevenues, setSelectedRevenues] = useState([]);
  const [selectedFundingTypes, setSelectedFundingTypes] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [allLocations] = useState([
    "New York", "London", "San Francisco", "Berlin", "Paris", "Toronto", "Sydney", "Singapore", "Dubai", "Remote", "Los Angeles", "Chicago", "Boston", "Austin", "Seattle", "Tokyo", "Delhi", "Karachi", "Lahore", "Islamabad", "Mumbai", "Bangalore", "Shanghai", "Beijing", "Moscow", "Madrid", "Rome", "Istanbul", "Cairo", "Johannesburg"
  ]);
  const [nameInput, setNameInput] = useState("");
  const [debouncedNameInput, setDebouncedNameInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [debouncedCompanyInput, setDebouncedCompanyInput] = useState("");
  const [showTechnologies, setShowTechnologies] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [showFundingType, setShowFundingType] = useState(false);
  const [showLookalikeInput, setShowLookalikeInput] = useState(false);
  const [lookalikeDomain, setLookalikeDomain] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [altDomain, setAltDomain] = useState("");
  const [showOnlyAlternatives, setShowOnlyAlternatives] = useState(false);
  const [backToLeads, setBackToLeads] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [forceSearch, setForceSearch] = useState(false);
  const [isFromAILeadScouts, setIsFromAILeadScouts] = useState(false);
  const [currentLeadSource, setCurrentLeadSource] = useState(null); // Track current source
  const allJobTitles = [
    "CEO", "CTO", "CFO", "COO", "CMO", "Manager", "Developer", "Engineer", "Designer", "Product Manager", "Sales", "Marketing", "HR", "Recruiter", "Data Scientist", "Analyst", "Consultant", "Director", "VP", "President", "Founder", "Owner"
  ];
  const { campaignsObject, isCampaignsLoading } = useCampaignQuery();
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  // Add state for select all mode
  const [selectAllMode, setSelectAllMode] = useState('page'); // 'page' or 'all'
  // Add state to track if all leads are loaded
  const [allLeadsLoaded, setAllLeadsLoaded] = useState(false);
  // Add state for custom per page input
  const [customPerPage, setCustomPerPage] = useState(perPage);
  const [selectedLeadsForCampaign, setSelectedLeadsForCampaign] = useState([]);
  const [allLeadsLoadedAndChecked, setAllLeadsLoadedAndChecked] = useState(false);
  const [addToCampaignProgress, setAddToCampaignProgress] = useState({ total: 0, added: 0, inProgress: false });
  const BATCH_SIZE = 100;

  const location = useLocation();
  const navigate = useNavigate();
  const debounceTimeout = useRef();
  const locationDebounceTimeout = useRef();
  const nameDebounceTimeout = useRef();
  const companyDebounceTimeout = useRef();
  const [dropdown2, setdropdown2] = useState(false);

  // Extract the initial search query and filters from the URL
  const queryParams = new URLSearchParams(location.search);
  const initialSearchQuery = queryParams.get("searchQuery") || "";
  const initialJobTitles = queryParams.get("jobTitles") ? queryParams.get("jobTitles").split(",") : [];
  const initialIndustries = queryParams.get("industries") ? queryParams.get("industries").split(",") : [];
  const initialSkipOwned = queryParams.get("skipOwned") === "0" ? false : true;
  const initialLocations = queryParams.get("locations") ? queryParams.get("locations").split(",") : [];
  const initialEmployees = queryParams.get("employees") ? queryParams.get("employees").split(",") : [];
  const initialRevenues = queryParams.get("revenues") ? queryParams.get("revenues").split(",") : [];
  const initialTechnologies = queryParams.get("technologies") ? queryParams.get("technologies").split(",") : [];
  const initialFundingTypes = queryParams.get("fundingTypes") ? queryParams.get("fundingTypes").split(",") : [];
  const initialNames = queryParams.get("names") ? queryParams.get("names").split(",") : [];
  const initialCompanies = queryParams.get("companies") ? queryParams.get("companies").split(",") : [];
  const initialLocationInput = queryParams.get("locationInput") || "";
  const initialNameInput = queryParams.get("nameInput") || "";
  const initialCompanyInput = queryParams.get("companyInput") || "";
  const initialJobTitleInput = queryParams.get("jobTitleInput") || "";
  const initialLookalikeDomain = queryParams.get("lookalikeDomain") || "";
  const initialOriginalQuery = queryParams.get("originalQuery") || "";

  // Initialize state from URL params on mount
  useEffect(() => {
    console.log('=== INITIALIZING STATE FROM URL PARAMS ===');
    console.log('URL params:', location.search);
    console.log('Initial values from URL:');
    console.log('- initialSearchQuery:', initialSearchQuery);
    console.log('- initialJobTitles:', initialJobTitles);
    console.log('- initialIndustries:', initialIndustries);
    console.log('- initialLocations:', initialLocations);
    console.log('- initialEmployees:', initialEmployees);
    console.log('- initialRevenues:', initialRevenues);
    console.log('- initialTechnologies:', initialTechnologies);
    console.log('- initialFundingTypes:', initialFundingTypes);
    console.log('- initialNames:', initialNames);
    console.log('- initialCompanies:', initialCompanies);
    console.log('- initialLocationInput:', initialLocationInput);
    console.log('- initialNameInput:', initialNameInput);
    console.log('- initialCompanyInput:', initialCompanyInput);
    console.log('- initialJobTitleInput:', initialJobTitleInput);
    console.log('- initialLookalikeDomain:', initialLookalikeDomain);
    
    setSearchTerm(initialSearchQuery);
    setSelectedJobTitles(initialJobTitles);
    setSelectedIndustries(initialIndustries);
    setSkipOwned(initialSkipOwned);
    setSelectedLocations(initialLocations);
    setSelectedEmployees(initialEmployees);
    setSelectedRevenues(initialRevenues);
    setSelectedTechnologies(initialTechnologies);
    setSelectedFundingTypes(initialFundingTypes);
    setSelectedNames(initialNames);
    setSelectedCompanies(initialCompanies);
    setLocationInput(initialLocationInput);
    setNameInput(initialNameInput);
    setDebouncedNameInput(initialNameInput);
    setCompanyInput(initialCompanyInput);
    setDebouncedCompanyInput(initialCompanyInput);
    setJobTitleInput(initialJobTitleInput);
    setLookalikeDomain(initialLookalikeDomain);
    
    console.log('State variables set. Current state:');
    console.log('- selectedJobTitles:', initialJobTitles);
    console.log('- selectedIndustries:', initialIndustries);
    console.log('- selectedLocations:', initialLocations);
    console.log('- selectedEmployees:', initialEmployees);
    console.log('- selectedRevenues:', initialRevenues);
    console.log('- selectedTechnologies:', initialTechnologies);
    console.log('- selectedFundingTypes:', initialFundingTypes);
    console.log('- selectedNames:', initialNames);
    console.log('- selectedCompanies:', initialCompanies);
    
    // Trigger immediate search if we have filters from URL
    const hasFilters = initialJobTitles.length > 0 || 
                      initialIndustries.length > 0 || 
                      initialLocations.length > 0 || 
                      initialEmployees.length > 0 || 
                      initialRevenues.length > 0 || 
                      initialTechnologies.length > 0 || 
                      initialFundingTypes.length > 0 || 
                      initialNames.length > 0 || 
                      initialCompanies.length > 0 || 
                      initialLocationInput || 
                      initialNameInput || 
                      initialCompanyInput || 
                      initialJobTitleInput || 
                      initialLookalikeDomain;
    
    console.log('Has filters from URL:', hasFilters);
    
    if (hasFilters) {
      console.log('Filters detected from URL, triggering immediate search');
      // Set debounced search term immediately if we have a search query
      if (initialSearchQuery) {
        setDebouncedSearchTerm(initialSearchQuery);
      }
      // Reset to first page
      setCurrentPage(1);
      // Force search to happen
      setForceSearch(true);
      // Mark that this search is coming from AILeadScouts
      setIsFromAILeadScouts(true);
    }
  }, [initialSearchQuery, location.search]);

  // Debounce searchTerm
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
      navigate(`?searchQuery=${searchTerm}`, { replace: true });
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm, navigate]);

  // Debounce location input
  useEffect(() => {
    console.log('Location input useEffect triggered with:', locationInput);
    if (locationDebounceTimeout.current) clearTimeout(locationDebounceTimeout.current);
    locationDebounceTimeout.current = setTimeout(() => {
      console.log('Setting debouncedLocationInput to:', locationInput);
      setLocationInput(locationInput);
      setCurrentPage(1); // Reset to first page on new location search
    }, 500);
    return () => clearTimeout(locationDebounceTimeout.current);
  }, [locationInput]);

  // Debounce name input
  useEffect(() => {
    console.log('Name input useEffect triggered with:', nameInput);
    if (nameDebounceTimeout.current) clearTimeout(nameDebounceTimeout.current);
    nameDebounceTimeout.current = setTimeout(() => {
      console.log('Setting debouncedNameInput to:', nameInput);
      setDebouncedNameInput(nameInput);
      setCurrentPage(1); // Reset to first page on new name search
    }, 500);
    return () => clearTimeout(nameDebounceTimeout.current);
  }, [nameInput]);

  // Debounce company input
  useEffect(() => {
    console.log('Company input useEffect triggered with:', companyInput);
    if (companyDebounceTimeout.current) clearTimeout(companyDebounceTimeout.current);
    companyDebounceTimeout.current = setTimeout(() => {
      console.log('Setting debouncedCompanyInput to:', companyInput);
      setDebouncedCompanyInput(companyInput);
      setCurrentPage(1); // Reset to first page on new company search
    }, 500);
    return () => clearTimeout(companyDebounceTimeout.current);
  }, [companyInput]);

  // Trigger immediate search when locationInput is set from URL
  useEffect(() => {
    if (initialLocationInput && initialLocationInput !== locationInput) {
      setLocationInput(initialLocationInput);
      setCurrentPage(1);
    }
  }, [initialLocationInput]);

  // Trigger immediate search when nameInput is set from URL
  useEffect(() => {
    if (initialNameInput && initialNameInput !== nameInput) {
      setDebouncedNameInput(initialNameInput);
      setCurrentPage(1);
    }
  }, [initialNameInput]);

  // Trigger immediate search when companyInput is set from URL
  useEffect(() => {
    if (initialCompanyInput && initialCompanyInput !== companyInput) {
      setDebouncedCompanyInput(initialCompanyInput);
      setCurrentPage(1);
    }
  }, [initialCompanyInput]);

  // Always send a non-empty query
  const safeSearchTerm = debouncedSearchTerm && debouncedSearchTerm.trim() ? debouncedSearchTerm : 'all';
  
  // Prepare location array for the query
  const locationArray = locationInput ? [...selectedLocations, locationInput] : selectedLocations;
  
  // Prepare name array for the query
  const nameArray = debouncedNameInput ? [...selectedNames, debouncedNameInput] : selectedNames;
  
  // Prepare company array for the query
  const companyArray = debouncedCompanyInput ? [...selectedCompanies, debouncedCompanyInput] : selectedCompanies;
  
  console.log('AILeadSearch - Current state:', {
    locationInput,
    locationArray,
    selectedLocations,
    hasLocation: locationInput ? true : false,
    nameInput,
    debouncedNameInput,
    nameArray,
    selectedNames,
    hasName: debouncedNameInput ? true : false,
    companyInput,
    debouncedCompanyInput,
    companyArray,
    selectedCompanies,
    hasCompany: debouncedCompanyInput ? true : false,
    selectedJobTitles,
    selectedIndustries,
    selectedEmployees,
    selectedRevenues,
    selectedTechnologies,
    selectedFundingTypes,
    safeSearchTerm
  });

  // If we have filters but no search term, ensure we have a default query
  let finalSearchTerm = (selectedJobTitles.length > 0 || selectedIndustries.length > 0 || 
                          locationArray.length > 0 || selectedEmployees.length > 0 || 
                          selectedRevenues.length > 0 || selectedTechnologies.length > 0 || 
                          selectedFundingTypes.length > 0 || nameArray.length > 0 || 
                          companyArray.length > 0) && !debouncedSearchTerm ? 'all' : safeSearchTerm;

  // Debug: Show filters sent to backend
  console.log('Filters sent to backend:', {
    selectedJobTitles,
    selectedIndustries,
    locationArray,
    selectedEmployees,
    selectedRevenues,
    selectedTechnologies,
    selectedFundingTypes,
    nameArray,
    companyArray
  });

  // Fetch leads with the debounced search query, selected job titles, and selected industries
  const { data, isLoading, error, refetch } = useAILeadScoutQuery(
    finalSearchTerm,
    currentPage,
    perPage,
    selectedJobTitles,
    selectedIndustries,
    locationArray,
    selectedEmployees,
    selectedRevenues,
    selectedTechnologies,
    selectedFundingTypes,
    nameArray,
    companyArray,
    forceSearch
  );

  // Always update leads when backend data changes
  useEffect(() => {
    console.log('=== LEADS UPDATE EFFECT ===');
    console.log('Raw API response data:', data);
    console.log('Data results:', data?.results);
    console.log('Data results length:', data?.results?.length);
    
    if (data?.results) {
      console.log('Processing results...');
      // If the first result has a 'person' property, map as before
      if (data.results.length > 0 && data.results[0].person) {
        console.log('Using person structure');
        const processedLeads = data.results.map(lead =>
          lead.person
            ? {
                id: lead.person.id,
                name: lead.person.name,
                email: lead.person.email,
                company: lead.person.organization?.name,
                title: lead.person.title,
                location: [lead.person.city, lead.person.state, lead.person.country].filter(Boolean).join(', '),
                website: lead.person.organization?.website_url,
                employeeCount: lead.person.organization?.estimated_num_employees,
                checked: false
              }
            : { ...lead, checked: false }
        );
        console.log('Processed leads (person structure):', processedLeads);
        setLeads(processedLeads);
      } else {
        console.log('Using flat structure');
        // Otherwise, assume flat structure from backend
        const processedLeads = data.results.map(lead => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          title: lead.title,
          location: lead.location,
          website: lead.website,
          employeeCount: lead.employeeCount,
          checked: false
        }));
        console.log('Processed leads (flat structure):', processedLeads);
        setLeads(processedLeads);
      }
    } else {
      console.log('No results in data, clearing leads');
      setLeads([]);
    }
  }, [data]);

  // Log leads before rendering
  useEffect(() => {
    console.log('=== LEADS STATE UPDATED ===');
    console.log('Current leads state:', leads);
    console.log('Leads length:', leads.length);
    console.log('Leads to render:', leads);
  }, [leads]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching leads:', error);
      toast.error(error.message || "Failed to fetch leads");
    }
  }, [error]);

  // Reset forceSearch flag after search is triggered
  useEffect(() => {
    if (forceSearch && (data || error)) {
      console.log('Search completed, resetting forceSearch flag');
      setForceSearch(false);
      // Keep isFromAILeadScouts true to maintain priority of these results
    }
  }, [forceSearch, data, error]);

  // Debug forceSearch changes
  useEffect(() => {
    console.log('forceSearch changed:', forceSearch);
  }, [forceSearch]);

  // Debug query parameters changes
  useEffect(() => {
    console.log('=== QUERY PARAMETERS CHANGED ===');
    console.log('finalSearchTerm:', finalSearchTerm);
    console.log('selectedJobTitles:', selectedJobTitles);
    console.log('selectedIndustries:', selectedIndustries);
    console.log('locationArray:', locationArray);
    console.log('selectedEmployees:', selectedEmployees);
    console.log('selectedRevenues:', selectedRevenues);
    console.log('selectedTechnologies:', selectedTechnologies);
    console.log('selectedFundingTypes:', selectedFundingTypes);
    console.log('nameArray:', nameArray);
    console.log('companyArray:', companyArray);
    console.log('forceSearch:', forceSearch);
  }, [finalSearchTerm, selectedJobTitles, selectedIndustries, locationArray, selectedEmployees, selectedRevenues, selectedTechnologies, selectedFundingTypes, nameArray, companyArray, forceSearch]);

  // Reset isFromAILeadScouts when user manually searches on AILeadSearch page
  useEffect(() => {
    if (!forceSearch && (debouncedSearchTerm || locationInput || debouncedNameInput || debouncedCompanyInput)) {
      console.log('Manual search detected, resetting isFromAILeadScouts');
      setIsFromAILeadScouts(false);
      setCurrentLeadSource(null); // Reset current source
      // Clear leads when switching from AILeadScout to manual search
      if (isFromAILeadScouts) {
        console.log('Clearing AILeadScout results for manual search');
        setLeads([]);
      }
    }
  }, [debouncedSearchTerm, locationInput, debouncedNameInput, debouncedCompanyInput, forceSearch, isFromAILeadScouts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // No need to manually refetch, as debouncedSearchTerm will trigger it
  };

  // Update handlePerPageChange to support both input and suggestions
  const handlePerPageChange = (value) => {
    const newPerPage = parseInt(value);
    if (!isNaN(newPerPage) && newPerPage > 0) {
    setPerPage(newPerPage);
      setCustomPerPage(newPerPage);
      setCurrentPage(1);
      setAllLeadsLoaded(false);
    refetch();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (data?.pagination?.totalPages && newPage > data.pagination.totalPages)) return;
    console.log('Changing to page:', newPage);
    setCurrentPage(newPage);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (selectAllMode === 'all' && newSelectAll) {
      if (data?.results) {
        setLeads(data.results.map(lead => ({
          ...lead,
          checked: !skipOwned || !lead.owned,
        })));
      }
    } else {
    setLeads(leads.map((lead) => ({
      ...lead,
      checked: newSelectAll && (!skipOwned || !lead.owned),
    })));
    }
  };

  const toggleLeadSelection = (id) => {
    setLeads(leads.map((lead) =>
      lead.id === id ? { ...lead, checked: !lead.checked } : lead
    ));
    setSelectAll(false);
  };

  const toggleSkipOwned = () => {
    const newSkipOwned = !skipOwned;
    setSkipOwned(newSkipOwned);
    if (selectAll) {
      setLeads(leads.map((lead) => ({
        ...lead,
        checked: !newSkipOwned || !lead.owned,
      })));
    }
  };

  const handleAddToCampaign = async () => {
    // If selectAllMode is 'all' and not all leads are loaded, do progressive batch add
    if (selectAll && selectAllMode === 'all' && !allLeadsLoaded && data?.pagination?.totalResults > leads.length) {
      // Open campaign form immediately
      setShowCampaignForm(true);
      setAddToCampaignProgress({ total: data.pagination.totalResults, added: 0, inProgress: false });
      return;
    }
    actuallyAddToCampaign(leads);
  };

  // Progressive batch add-to-campaign logic
  const handleProgressiveAddToCampaign = async (campaignId) => {
    setAddToCampaignProgress({ total: data.pagination.totalResults, added: 0, inProgress: true });
    let currentPage = 1;
    let totalAdded = 0;
    let totalResults = data.pagination.totalResults;
    let finished = false;

    while (!finished) {
      const batchResult = await searchLeads({
        query: finalSearchTerm,
        page: currentPage,
        per_page: BATCH_SIZE,
        person_titles: selectedJobTitles,
        industries: selectedIndustries,
        locations: locationArray,
        employees: selectedEmployees,
        revenues: selectedRevenues,
        technologies: selectedTechnologies,
        fundingTypes: selectedFundingTypes,
        names: nameArray,
        companies: companyArray
      });
      const batchLeads = batchResult.results.map(lead => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        title: lead.title,
        location: lead.location,
        website: lead.website,
        employeeCount: lead.employeeCount
      }));
      if (batchLeads.length === 0) break;
      await axiosInstance.post("/lead/AddLeadsToCampaign", {
        Leads: batchLeads,
        CampaignId: campaignId
      });
      totalAdded += batchLeads.length;
      setAddToCampaignProgress(prev => ({ ...prev, added: totalAdded }));
      if (totalAdded >= totalResults) finished = true;
      currentPage++;
    }
    setAddToCampaignProgress(prev => ({ ...prev, inProgress: false }));
    toast.success("All leads added to campaign!");
    setShowCampaignForm(false);
    setLeads(leads.map((lead) => ({ ...lead, checked: false })));
    setSelectAll(false);
    setSelectedLeadsForCampaign([]);
  };

  // Modified handleCampaignSubmit to support progressive add
  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId && !campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    // If progressive add is needed
    if (selectAll && selectAllMode === 'all' && !allLeadsLoaded && data?.pagination?.totalResults > leads.length) {
      let campaignId = selectedCampaignId;
      if (!campaignId) {
        const createRes = await axiosInstance.post("/campaigns", { Name: campaignName });
        campaignId = createRes.data.campaign?.id || createRes.data.id;
      }
      // 1. Immediately add currently fetched/checked leads in batches of 100, in parallel
      const visibleSelectedLeads = leads.filter(lead => lead.checked).map(lead => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        title: lead.title,
        location: lead.location,
        website: lead.website,
        employeeCount: lead.employeeCount
      }));
      const visibleBatches = chunkArray(visibleSelectedLeads, 100);
      let totalAdded = 0;
      totalAdded += await sendBatchesInParallel(visibleBatches, campaignId, (added) => setAddToCampaignProgress(prev => ({ ...prev, added })));
      // 2. Start progressive batch add for the rest
      setAddToCampaignProgress({ total: data.pagination.totalResults, added: totalAdded, inProgress: true });
      let currentPage = 1;
      let totalResults = data.pagination.totalResults;
      let finished = false;
      // Build a set of emails already added to avoid duplicates
      const alreadyAddedEmails = new Set(visibleSelectedLeads.map(l => l.email));
      while (!finished) {
        const batchResult = await searchLeads({
          query: finalSearchTerm,
          page: currentPage,
          per_page: BATCH_SIZE,
          person_titles: selectedJobTitles,
          industries: selectedIndustries,
          locations: locationArray,
          employees: selectedEmployees,
          revenues: selectedRevenues,
          technologies: selectedTechnologies,
          fundingTypes: selectedFundingTypes,
          names: nameArray,
          companies: companyArray
        });
        let batchLeads = batchResult.results.map(lead => ({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          title: lead.title,
          location: lead.location,
          website: lead.website,
          employeeCount: lead.employeeCount
        }));
        // Filter out leads already added
        batchLeads = batchLeads.filter(lead => !alreadyAddedEmails.has(lead.email));
        // Send in batches of 100, in parallel
        const backgroundBatches = chunkArray(batchLeads, 100);
        totalAdded += await sendBatchesInParallel(backgroundBatches, campaignId, (added) => setAddToCampaignProgress(prev => ({ ...prev, added })), alreadyAddedEmails);
        if (totalAdded >= totalResults) finished = true;
        currentPage++;
      }
      setAddToCampaignProgress(prev => ({ ...prev, inProgress: false }));
      toast.success("All leads added to campaign!");
      setShowCampaignForm(false);
      setLeads(leads.map((lead) => ({ ...lead, checked: false })));
      setSelectAll(false);
      setSelectedLeadsForCampaign([]);
      return;
    }

    // Use the selectedLeadsForCampaign state for normal add
    const selectedLeads = selectedLeadsForCampaign.map((lead) => ({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      title: lead.title,
      location: lead.location,
      website: lead.website,
      employeeCount: lead.employeeCount
    }));
    // Send in batches of 100, in parallel
    const normalBatches = chunkArray(selectedLeads, 100);
    let totalAdded = 0;
    totalAdded += await sendBatchesInParallel(normalBatches, selectedCampaignId, (added) => setAddToCampaignProgress(prev => ({ ...prev, added })));
    toast.success("Leads added to campaign!");
    setCampaignName("");
    setShowCampaignForm(false);
    setLeads(leads.map((lead) => ({ ...lead, checked: false })));
    setSelectAll(false);
    setSelectedLeadsForCampaign([]);
  };

  // The actual add-to-campaign logic
  const actuallyAddToCampaign = (leadsArray) => {
    const selectedLeads = leadsArray.filter((lead) => lead.checked);
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }
    setSelectedLeadsForCampaign(selectedLeads);
    setShowCampaignForm(true);
  };

  // Handler for job title checkbox
  const handleJobTitleChange = (title) => {
    setSelectedJobTitles((prev) => {
      const updated = prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title];
      setCurrentPage(1); // Reset to first page on filter change
      return updated;
    });
  };

  // Handler for industry checkbox
  const handleIndustryChange = (industry) => {
    setSelectedIndustries((prev) => {
      const updated = prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry];
      setCurrentPage(1); // Reset to first page on filter change
      return updated;
    });
  };

  const handleLocationInputChange = (e) => {
    console.log('Location input changed:', e.target.value);
    setLocationInput(e.target.value);
  };

  const handleLocationInputKeyDown = (e) => {
    console.log('Key pressed:', e.key);
    if (e.key === "Enter") {
      console.log('Enter pressed, triggering search immediately');
      e.preventDefault();
      // Trigger search immediately instead of waiting for debounce
      setLocationInput(locationInput);
      setCurrentPage(1);
    }
  };

  const handleNameInputChange = (e) => {
    console.log('Name input changed:', e.target.value);
    setNameInput(e.target.value);
  };

  const handleNameInputKeyDown = (e) => {
    console.log('Name key pressed:', e.key);
    if (e.key === "Enter") {
      console.log('Enter pressed, triggering name search immediately');
      e.preventDefault();
      // Trigger search immediately instead of waiting for debounce
      setDebouncedNameInput(nameInput);
      setCurrentPage(1);
    }
  };

  const handleCompanyInputChange = (e) => {
    console.log('Company input changed:', e.target.value);
    setCompanyInput(e.target.value);
  };

  const handleCompanyInputKeyDown = (e) => {
    console.log('Company key pressed:', e.key);
    if (e.key === "Enter") {
      console.log('Enter pressed, triggering company search immediately');
      e.preventDefault();
      // Trigger search immediately instead of waiting for debounce
      setDebouncedCompanyInput(companyInput);
      setCurrentPage(1);
    }
  };

  const handleLookalikeKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!lookalikeDomain.trim()) {
        toast.error("Please enter a domain.");
        return;
      }
      setAlternatives([]);
      setAltDomain("");
      const findCompanies = async () => {
        try {
          const response = await axiosInstance.post('/lead/lookalike', { domain: lookalikeDomain });
          return { type: 'companies', data: response.data };
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // Fallback to GotAlt/static alternatives, do not log as error
            const alts = await fetchDomainAlternatives(lookalikeDomain);
            if (alts && alts.length > 0) {
              return { type: 'alternatives', data: alts };
            } else {
              throw new Error('No similar companies or alternatives found.');
            }
          } else {
            // Only log unexpected errors
            console.error(err);
            throw err;
          }
        }
      };
      toast.promise(
        findCompanies(),
        {
          loading: `Finding companies similar to ${lookalikeDomain}...`,
          success: (result) => {
            if (result.type === 'companies') {
              const newCompanies = result.data.companies;
              if (newCompanies.length === 0) {
                return "No similar companies found.";
              }
              const updatedCompanies = [...new Set([...selectedCompanies, ...newCompanies])];
              setSelectedCompanies(updatedCompanies);
              setLookalikeDomain('');
              setShowLookalikeInput(false);
              setAlternatives([]);
              setAltDomain("");
              return "Found and added similar companies to your filter!";
            } else if (result.type === 'alternatives') {
              setLookalikeDomain('');
              setShowLookalikeInput(false);
              setAlternatives(result.data);
              setAltDomain(lookalikeDomain);
              return "No similar companies in your DB, but here are some alternatives!";
            }
          },
          error: (err) => err.message || "Could not find similar companies or alternatives.",
        }
      );
    }
  };

  // On mount, check for altDomain in query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const alt = params.get("altDomain");
    if (alt) {
      setShowOnlyAlternatives(true);
      setAltDomain(alt);
      fetchDomainAlternatives(alt).then((alts) => setAlternatives(alts || []));
    } else {
      setShowOnlyAlternatives(false);
      setAltDomain("");
      setAlternatives([]);
    }
  }, [location.search]);

  // If no search query but filters are selected, build a query string from filters
  if (!finalSearchTerm || finalSearchTerm.trim() === "" || finalSearchTerm === "all") {
    let filterQueryParts = [];
    if (selectedJobTitles.length > 0) filterQueryParts.push(selectedJobTitles.join(", "));
    if (selectedIndustries.length > 0) filterQueryParts.push("industry: " + selectedIndustries.join(", "));
    if (locationArray.length > 0) filterQueryParts.push("location: " + locationArray.join(", "));
    if (selectedEmployees.length > 0) filterQueryParts.push("company size: " + selectedEmployees.join(", "));
    if (selectedRevenues.length > 0) filterQueryParts.push("revenue: " + selectedRevenues.join(", "));
    if (selectedTechnologies.length > 0) filterQueryParts.push("technology: " + selectedTechnologies.join(", "));
    if (selectedFundingTypes.length > 0) filterQueryParts.push("funding type: " + selectedFundingTypes.join(", "));
    if (nameArray.length > 0) filterQueryParts.push("name: " + nameArray.join(", "));
    if (companyArray.length > 0) filterQueryParts.push("company: " + companyArray.join(", "));
    if (filterQueryParts.length > 0) {
      finalSearchTerm = filterQueryParts.join(" ");
    }
  }

  useEffect(() => {
    if (selectedCampaignId) setCampaignName("");
  }, [selectedCampaignId]);

  // Optionally, set selectAllMode to 'all' by default if the checkbox is present
  useEffect(() => {
    if (data?.pagination?.totalPages > 1) {
      setSelectAllMode('all');
    }
  }, [data?.pagination?.totalPages]);

  // Handler for 'Select all (N)' checkbox
  const handleSelectAllN = async () => {
    const newSelectAll = !(selectAll && selectAllMode === 'all');
    setSelectAllMode('all');
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      // Instantly select all leads on the current page for UI feedback
      setLeads(leads.map(lead => ({
        ...lead,
        checked: !skipOwned || !lead.owned,
      })));
      // Then fetch all leads from backend and select all
      if (!allLeadsLoaded && data?.pagination?.totalResults > leads.length) {
        const allLeadsResult = await searchLeads({
          query: finalSearchTerm,
          page: 1,
          per_page: 'all', // Always request all leads
          person_titles: selectedJobTitles,
          industries: selectedIndustries,
          locations: locationArray,
          employees: selectedEmployees,
          revenues: selectedRevenues,
          technologies: selectedTechnologies,
          fundingTypes: selectedFundingTypes,
          names: nameArray,
          companies: companyArray
        });
        setLeads(allLeadsResult.results.map(lead => ({
          ...lead,
          checked: !skipOwned || !lead.owned,
        })));
        setAllLeadsLoaded(true);
      }
    } else {
      setLeads(leads.map(lead => ({ ...lead, checked: false })));
    }
  };

  // Add a computed variable for selection state
  const allSelected = selectAll && selectAllMode === 'all' && leads.length > 0 && leads.every(lead => lead.checked);
  const noneSelected = leads.every(lead => !lead.checked);

  // Handler for 'Select All From Page' checkbox
  const handleSelectAllPage = () => {
    const newSelectAll = !(selectAll && selectAllMode === 'page');
    setSelectAllMode('page');
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      setLeads(leads.map(lead => ({
        ...lead,
        checked: !skipOwned || !lead.owned,
      })));
    } else {
      setLeads(leads.map(lead => ({ ...lead, checked: false })));
    }
  };

  useEffect(() => {
    if (allLeadsLoadedAndChecked) {
      actuallyAddToCampaign(leads); // Use the fully updated leads array
      setAllLeadsLoadedAndChecked(false); // Reset for next time
    }
  }, [allLeadsLoadedAndChecked, leads]);

  return (
    <div className="flex min-h-screen w-full h-full flex-col md:flex-row gap-5 md:gap-0 pl-[10px] md:pl-[25px]">
      {/* Sidebar */}
      <div className="w-full h-full md:w-[400px] bg-white border border-gray-200 rounded-2xl flex flex-col">
        <div className="p-4 border-b border-gray-200 w-full">
          <h2 className="text-l md:text-xl font-bold mb-[40px]">Search Manually</h2>
          <div className="flex items-center justify-between">
            <FaMapMarkerAlt />
            <span className="text-md md:text-lg text-gray-500">Skip already owned</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={skipOwned}
                onChange={toggleSkipOwned}
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
                <input
                  type="text"
                  placeholder="Search or add job title..."
                  value={jobTitleInput}
                  onChange={e => setJobTitleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && jobTitleInput.trim()) {
                      if (!selectedJobTitles.includes(jobTitleInput.trim())) {
                        setSelectedJobTitles([...selectedJobTitles, jobTitleInput.trim()]);
                        setCurrentPage(1);
                      }
                      setJobTitleInput("");
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                />
                {/* Suggestions dropdown */}
                {jobTitleInput && (
                  <div className="bg-white border rounded shadow max-h-32 overflow-y-auto z-10">
                    {allJobTitles.filter(jt => jt.toLowerCase().includes(jobTitleInput.toLowerCase()) && !selectedJobTitles.includes(jt)).map(jt => (
                      <div
                        key={jt}
                        className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          setSelectedJobTitles([...selectedJobTitles, jt]);
                          setCurrentPage(1);
                          setJobTitleInput("");
                        }}
                      >
                        {jt}
                      </div>
                    ))}
                    {allJobTitles.filter(jt => jt.toLowerCase().includes(jobTitleInput.toLowerCase()) && !selectedJobTitles.includes(jt)).length === 0 && (
                      <div className="px-3 py-1 text-gray-400">No matches</div>
                    )}
                  </div>
                )}
                {/* Selected job titles as chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJobTitles.map((jt, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                      {jt}
                      <button
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={() => {
                          setSelectedJobTitles(selectedJobTitles.filter(t => t !== jt));
                          setCurrentPage(1);
                        }}
                        aria-label={`Remove ${jt}`}
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
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
              <div className="pl-8 pt-2 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="Search or add location..."
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && locationInput.trim()) {
                      if (!selectedLocations.includes(locationInput.trim())) {
                        setSelectedLocations([...selectedLocations, locationInput.trim()]);
                        setCurrentPage(1);
                      }
                      setLocationInput("");
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                />
                {/* Suggestions dropdown */}
                {locationInput && (
                  <div className="bg-white border rounded shadow max-h-32 overflow-y-auto z-10">
                    {allLocations.filter(loc => loc.toLowerCase().includes(locationInput.toLowerCase()) && !selectedLocations.includes(loc)).map(loc => (
                      <div
                        key={loc}
                        className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          setSelectedLocations([...selectedLocations, loc]);
                          setCurrentPage(1);
                          setLocationInput("");
                        }}
                      >
                        {loc}
                      </div>
                    ))}
                    {allLocations.filter(loc => loc.toLowerCase().includes(locationInput.toLowerCase()) && !selectedLocations.includes(loc)).length === 0 && (
                      <div className="px-3 py-1 text-gray-400">No matches</div>
                    )}
                  </div>
                )}
                {/* Selected locations as chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLocations.map((loc, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                      {loc}
                      <button
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={() => {
                          setSelectedLocations(selectedLocations.filter(l => l !== loc));
                          setCurrentPage(1);
                        }}
                        aria-label={`Remove ${loc}`}
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
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
                {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((emp, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedEmployees.includes(emp)}
                      onChange={() => {
                        setSelectedEmployees((prev) => prev.includes(emp) ? prev.filter((e) => e !== emp) : [...prev, emp]);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
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
                {["$0-1M", "$1M-10M", "$10M-50M", "$50M-250M", "$250M-1B", "$1B+"].map((rev, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedRevenues.includes(rev)}
                      onChange={() => {
                        setSelectedRevenues((prev) => prev.includes(rev) ? prev.filter((r) => r !== rev) : [...prev, rev]);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
                    />
                    <span>{rev}</span>
                  </label>
                ))}
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
                {[ "Finance", "Healthcare", "Retail"].map((industry, idx) => (
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
              <div className="pl-8 pt-2 flex flex-col gap-2 h-48 overflow-y-auto">
                {[
                  "JavaScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Swift", "Kotlin",
                  "TypeScript", "HTML5", "CSS3", "SQL", "NoSQL",
                  "React", "Angular", "Vue.js", "jQuery", "Next.js", "Gatsby",
                  "Node.js", "Express.js", "Django", "Flask", "Ruby on Rails", "ASP.NET", "Spring",
                  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Firebase",
                  "Amazon Web Services (AWS)", "Microsoft Azure", "Google Cloud Platform (GCP)",
                  "Docker", "Kubernetes", "Terraform", "Ansible",
                  "TensorFlow", "PyTorch", "scikit-learn",
                  "Git", "Jira", "Slack", "Salesforce", "Shopify", "WordPress", "HubSpot"
                ].map((tech, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedTechnologies.includes(tech)}
                      onChange={() => {
                        setSelectedTechnologies((prev) =>
                          prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
                        );
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
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
                {[
                  "Seed", "Series A", "Series B", "Series C+", "IPO", "Acquired", "Bootstrapped"
                ].map((type, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedFundingTypes.includes(type)}
                      onChange={() => {
                        setSelectedFundingTypes((prev) =>
                          prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
                        );
                        setCurrentPage(1);
                      }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Lookalike Domain Input */}
          <div className="w-full p-2 rounded text-md md:text-lg text-gray-400 hover:bg-gray-100 cursor-pointer flex flex-col">
            <div
              className="flex items-center space-x-2 justify-between"
              onClick={() => setShowLookalikeInput((prev) => !prev)}
            >
              <span className="flex items-center space-x-2">
                <FaGlobe />
                <span className="pl-[15px]">Lookalike Domain</span>
              </span>
              <span>{showLookalikeInput ? '▲' : '▼'}</span>
            </div>
            {showLookalikeInput && (
              <div className="pl-8 pt-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="e.g., stripe.com"
                  value={lookalikeDomain}
                  onChange={(e) => setLookalikeDomain(e.target.value)}
                  onKeyDown={handleLookalikeKeyDown}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Enter a domain to find similar companies.
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          
          {/* Show the full search query entered by the user */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="font-semibold text-blue-800">Full Search Entered:</span>
            <span className="ml-2 text-blue-900">{initialOriginalQuery || searchTerm || initialSearchQuery}</span>
          </div>

          {/* Main Words/Keywords Display */}
          {(selectedJobTitles.length > 0 || selectedIndustries.length > 0 || selectedLocations.length > 0 || selectedEmployees.length > 0 || selectedRevenues.length > 0 || selectedTechnologies.length > 0 || selectedFundingTypes.length > 0 || selectedNames.length > 0 || selectedCompanies.length > 0) && (
            <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <span>🔑</span>
                Main Words / Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Use summarizeMainKeywords for concise display */}
                {summarizeMainKeywords({
                  person_titles: selectedJobTitles,
                  industries: selectedIndustries,
                  companies: selectedCompanies,
                  locations: selectedLocations,
                  technologies: selectedTechnologies,
                  funding_types: selectedFundingTypes,
                  employees: selectedEmployees,
                  revenues: selectedRevenues,
                  names: selectedNames,
                  lookalike_domains: []
                }).map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-xs text-green-700 mt-2">
                These are the main words/keywords extracted from your search and filters.
              </p>
            </div>
          )}

          {/* Source Indicator */}
          {isFromAILeadScouts && (
            <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800">
                  <span className="text-lg">🤖</span>
                  <span className="font-semibold">AI Lead Scout Results</span>
                  <span className="text-xs bg-amber-200 px-2 py-1 rounded-full">
                    {currentLeadSource === 'aiLeadScouts' ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsFromAILeadScouts(false);
                    setCurrentLeadSource(null);
                    setLeads([]);
                    console.log('AI Scout results cleared manually');
                  }}
                  className="px-3 py-1 text-xs bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Clear Results
                </button>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                These leads were generated using your selected filters from the AI Lead Scout page.
                {currentLeadSource === 'aiLeadScouts' && ' ✅ Currently displaying AI Lead Scout results.'}
              </p>
            </div>
          )}
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex items-center gap-2">
                <input
                  type="text"
                value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for leads..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {/* Extracted Parameters Display */}
          {(selectedJobTitles.length > 0 || selectedIndustries.length > 0 || selectedLocations.length > 0 || selectedEmployees.length > 0 || selectedRevenues.length > 0 || selectedTechnologies.length > 0 || selectedFundingTypes.length > 0 || selectedNames.length > 0 || selectedCompanies.length > 0) && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>🤖</span>
                AI Extracted Parameters
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedJobTitles.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaBriefcase className="mr-1" />
                    Job Titles: {selectedJobTitles.join(', ')}
                  </span>
                )}
                {selectedIndustries.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FaIndustry className="mr-1" />
                    Industries: {selectedIndustries.join(', ')}
                  </span>
                )}
                {selectedLocations.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <FaMapMarkerAlt className="mr-1" />
                    Locations: {selectedLocations.join(', ')}
                  </span>
                )}
                {selectedEmployees.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <FaUsers className="mr-1" />
                    Company Size: {selectedEmployees.join(', ')}
                  </span>
                )}
                {selectedRevenues.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FaDollarSign className="mr-1" />
                    Revenue: {selectedRevenues.join(', ')}
                  </span>
                )}
                {selectedTechnologies.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <FaCogs className="mr-1" />
                    Technologies: {selectedTechnologies.join(', ')}
                  </span>
                )}
                {selectedFundingTypes.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    <FaMoneyCheckAlt className="mr-1" />
                    Funding: {selectedFundingTypes.join(', ')}
                  </span>
                )}
                {selectedNames.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    <FaUser className="mr-1" />
                    Names: {selectedNames.join(', ')}
                  </span>
                )}
                {selectedCompanies.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <FaBuilding className="mr-1" />
                    Companies: {selectedCompanies.join(', ')}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-700 mt-2">
                These parameters were automatically extracted from your natural language query.
              </p>
            </div>
          )}

          {/* Alternatives display (moved from sidebar) */}
          {alternatives.length > 0 && !showOnlyAlternatives && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded p-3">
              <p className="font-bold text-black mb-1">Alternatives to <span className="text-blue-600">{altDomain}</span>:</p>
              <ul className="list-disc ml-6">
                {alternatives.map((alt, idx) => (
                  <li key={idx} className="mb-1">
                    <button
                      className="text-blue-700 underline font-medium bg-transparent border-none p-0 cursor-pointer"
                      onClick={() => {
                        navigate(`?altDomain=${alt.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`);
                      }}
                    >
                      {alt.name || alt.url}
                    </button>
                    {alt.description && <span className="text-gray-600 ml-2">- {alt.description}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results */}
          {showOnlyAlternatives && (
            <div className="mb-6">
              <button
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => {
                  navigate("?");
                }}
              >
                ← Back to Leads
              </button>
              <h2 className="text-xl font-bold mb-4">Alternatives to <span className="text-blue-600">{altDomain}</span></h2>
              {alternatives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No alternatives found for this domain.</div>
              ) : (
                <div className="space-y-4">
                  {alternatives.map((alt, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{alt.name || alt.url}</h3>
                              <p className="text-gray-600 font-medium">Alternative Service</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <FaGlobe className="text-gray-400" />
                              <a href={alt.url.startsWith('http') ? alt.url : `https://${alt.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                {alt.url}
                              </a>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaBuilding className="text-gray-400" />
                              <span>{alt.name || alt.url}</span>
                            </div>
                            {alt.description && (
                              <div className="mt-2 text-sm text-gray-500">{alt.description}</div>
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <a
                              href={alt.url.startsWith('http') ? alt.url : `https://${alt.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              <span>🌐</span> Visit
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for leads...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error.message || "Failed to fetch leads"}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No leads found. Try a different search query.</p>
              <div className="mt-4 text-sm text-gray-400">
                <p>Debug Info:</p>
                <p>Leads length: {leads.length}</p>
                <p>Data results length: {data?.results?.length || 0}</p>
                <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
                <p>Has error: {error ? 'Yes' : 'No'}</p>
                <p>Search term: {finalSearchTerm}</p>
                <p>Force search: {forceSearch ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results Header with Per Page Selector */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAll && selectAllMode === 'page'}
                    onChange={handleSelectAllPage}
                    className="h-4 w-4 text-blue-500"
                  />
                  <span>Select All From Page </span>
                  {data?.pagination?.totalPages > 1 && (
                    <div className="flex items-center ml-2 gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectAll && selectAllMode === 'all'}
                          onChange={handleSelectAllN}
                        />
                        <span className="text-sm">Select all ({data.pagination.totalResults})</span>
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Show:</span>
                  <input
                    type="number"
                    min="1"
                    value={customPerPage}
                    onChange={e => setCustomPerPage(e.target.value)}
                    onBlur={e => handlePerPageChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handlePerPageChange(e.target.value);
                    }}
                    className="w-20 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Per page"
                  />
                  {/* Suggestions */}
                  {[10, 20, 50, 100].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-2 py-1 rounded ${customPerPage == opt ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} ml-1`}
                      onClick={() => handlePerPageChange(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                  {data?.pagination?.totalResults && data.pagination.totalResults > 100 && (
                    <button
                      type="button"
                      className={`px-2 py-1 rounded ${customPerPage == data.pagination.totalResults ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} ml-1`}
                      onClick={() => handlePerPageChange(data.pagination.totalResults)}
                    >
                      All ({data.pagination.totalResults})
                    </button>
                  )}
                  <span className="text-gray-600">contacts per page</span>
                </div>
              </div>

              {/* In the render, above the leads list, show a message if all or none are selected */}
              {(allSelected || noneSelected) && (
                <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${allSelected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {allSelected ? `All ${data?.pagination?.totalResults || leads.length} leads are selected.` : 'No leads are selected.'}
                </div>
              )}

              {/* Leads List */}
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={lead.checked}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="h-4 w-4 text-blue-500 mt-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{lead.name}</h3>
                          <p className="text-gray-600 font-medium">{lead.title}</p>
                          {/* Source Badge */}
                          {lead.source && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              lead.source === 'aiLeadScouts' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {lead.source === 'aiLeadScouts' ? '🤖 AI Scout' : '🔍 AI Search'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>
                            {lead.location && lead.location.trim() !== '' 
                              ? lead.location 
                              : lead.organization?.location || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaBuilding className="text-gray-400" />
                          <span>{lead.company || 'Company not specified'}</span>
                        </div>
                        
                        {lead.organization && (
                          <div className="mt-2 text-sm text-gray-500 space-y-1">
                            {lead.organization.employee_count && (
                              <div className="flex items-center gap-2">
                                <FaUsers className="text-gray-400" />
                                <span>Company Size: {lead.organization.employee_count}</span>
                              </div>
                            )}
                            {lead.organization.website && (
                              <div className="flex items-center gap-2">
                                <FaGlobe className="text-gray-400" />
                                <a 
                                  href={lead.organization.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  {lead.organization.website}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <span>✉</span> Email
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                          >
                            <span>📞</span> Call
                          </a>
                        )}
                        {lead.linkedin_url && (
                          <a
                            href={lead.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <span>🔗</span> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {data?.pagination && (
                <div className="flex justify-end items-center mt-6">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">Page {currentPage} of {data?.pagination?.totalPages ?? 1}</span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === (data?.pagination?.totalPages ?? 1)}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Campaign Button */}
              <button
                onClick={handleAddToCampaign}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Selected to Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add to Campaign</h3>
            <form onSubmit={handleCampaignSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-900">Select Existing Campaign</label>
              <select
                className="w-full p-2 border border-gray-300 rounded mb-4"
                value={selectedCampaignId}
                onChange={e => setSelectedCampaignId(e.target.value)}
              >
                <option value="">Select a campaign</option>
                {campaignsObject?.campaigns
                  ?.filter(camp => camp.Name && camp.Name.toLowerCase() !== 'new campaign' && camp.id && typeof camp.id === 'string' && !camp.id.toLowerCase().includes('login'))
                  .map(camp => (
                  <option key={camp.id} value={camp.id}>{camp.Name}</option>
                ))}
              </select>
              <div className="flex items-center my-2">
                <span className="text-gray-400 text-xs">or create new:</span>
              </div>
              {!selectedCampaignId && (
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="New Campaign Name"
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCampaignForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add to Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadRow({ checked, onChange, name, avatar, avatarColor, company, title, email, phone, lastInteraction, owned }) {
  return (
    <tr className={`border-b hover:bg-gray-50 ${owned ? 'bg-gray-50' : ''}`}>
      <td className="p-4">
        <CustomCheckbox 
          checked={checked} 
          onChange={onChange}
          disabled={owned}
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>{avatar}</div>
          <span className={`text-sm ${owned ? 'text-gray-400' : ''}`}>{name}</span>
          {owned && <span className="text-xs text-gray-400">(owned)</span>}
        </div>
      </td>
      <td className="p-4">
        <span className={`text-sm ${owned ? 'text-gray-400' : ''}`}>{company}</span>
      </td>
      <td className="p-4">
        <span className={`text-sm ${owned ? 'text-gray-400' : ''}`}>{title}</span>
      </td>
      <td className="p-4">
        <span className={`text-sm ${owned ? 'text-gray-400' : 'text-blue-500'}`}>{email}</span>
      </td>
      <td className="p-4">
        <span className={`text-sm ${owned ? 'text-gray-400' : ''}`}>{phone}</span>
      </td>
      <td className="p-4">
        <span className={`text-sm ${owned ? 'text-gray-400' : ''}`}>{lastInteraction}</span>
      </td>
    </tr>
  )
}