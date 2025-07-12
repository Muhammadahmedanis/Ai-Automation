import { axiosInstance } from "../../api/axios";

export const searchLeads = async ({ 
  query, 
  page, 
  per_page, 
  person_titles, 
  industries, 
  locations, 
  employees, 
  revenues, 
  technologies, 
  funding_types, 
  names, 
  companies 
}) => {
  try {
    console.log('=== SEARCH LEADS SERVICE CALLED ===');
    console.log('Searching leads with params:', { 
      query, 
      page, 
      per_page, 
      person_titles, 
      industries, 
      locations, 
      employees, 
      revenues, 
      technologies, 
      funding_types, 
      names, 
      companies 
    });
    
    // Bypass backend parser - send frontend-extracted parameters directly
    const requestBody = {
      query: query || "all",
      page,
      per_page,
      // Force use frontend-extracted parameters instead of backend parser
      use_frontend_params: true, // Flag to tell backend to use our parameters
      ...(person_titles && person_titles.length > 0 ? { person_titles } : {}),
      ...(industries && industries.length > 0 ? { industries } : {}),
      ...(locations && locations.length > 0 ? { locations } : {}),
      ...(employees && employees.length > 0 ? { employees } : {}),
      ...(revenues && revenues.length > 0 ? { revenues } : {}),
      ...(technologies && technologies.length > 0 ? { technologies } : {}),
      ...(funding_types && funding_types.length > 0 ? { funding_types } : {}),
      ...(names && names.length > 0 ? { names } : {}),
      ...(companies && companies.length > 0 ? { companies } : {}),
    };
    
    console.log('=== REQUEST BODY BEING SENT ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Request URL:', '/lead/SearchLeads');
    
    // Try with frontend parameters first
    let response = await axiosInstance.post("/lead/SearchLeads", requestBody);
    
    // If no results and we have frontend parameters, try alternative approach
    if ((!response.data?.results || response.data.results.length === 0) && 
        (person_titles?.length > 0 || industries?.length > 0 || locations?.length > 0 || 
         technologies?.length > 0 || companies?.length > 0)) {
      
      console.log('=== NO RESULTS WITH FRONTEND PARAMS, TRYING ALTERNATIVE ===');
      
      // Try sending parameters in a different format that backend might understand
      const alternativeBody = {
        query: query || "all",
        page,
        per_page,
        // Send as individual parameters that backend parser might recognize
        title: person_titles?.join(' '),
        industry: industries?.join(' '),
        location: locations?.join(' '),
        technology: technologies?.join(' '),
        company: companies?.join(' '),
        keyword: query
      };
      
      console.log('Alternative request body:', JSON.stringify(alternativeBody, null, 2));
      
      try {
        response = await axiosInstance.post("/lead/SearchLeads", alternativeBody);
        console.log('Alternative response results:', response.data?.results?.length || 0);
      } catch (altError) {
        console.log('Alternative approach also failed, using original response');
      }
    }
    
    console.log('=== API RESPONSE RECEIVED ===');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('Response results length:', response.data?.results?.length || 0);
    
    return response.data;
  } catch (error) {
    console.error('=== SEARCH LEADS ERROR ===');
    console.error('Error in searchLeads:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};