// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-hot-toast";
// import { searchLeads } from "../services/aiLeadScoutService";

// export const useAILeadScoutQuery = (data) => {
//   const queryClient = useQueryClient();

//   const {
//     data: allLeads, 
//     isLoading: isLeadsLoading,
//     error: leadsError,
//     refetch
//   } = useQuery({
//     queryKey: ["allLeads"],
//     queryFn: searchLeads(data),
//     onSuccess: (data) => console.log("All leads fetched:", data),
//   });

//   return {
//     allLeads,
//     isLeadsLoading,
//     leadsError,
//     refetch
//   };

// };

import { useQuery } from "@tanstack/react-query";
import { searchLeads } from "../services/aiLeadScoutService";

export const useAILeadScoutQuery = (
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
  companies,
  forceSearch
) => {
  return useQuery({
    queryKey: [
      "leads", 
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
      companies,
      forceSearch
    ],
    queryFn: async () => {
      console.log('useAILeadScoutQuery called with:', { 
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
        companies,
        forceSearch
      });
      const result = await searchLeads({ 
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
      console.log('Query result:', result);
      return result;
    },
    enabled: !!query || 
             (person_titles && person_titles.length > 0) || 
             (industries && industries.length > 0) ||
             (locations && locations.length > 0) ||
             (employees && employees.length > 0) ||
             (revenues && revenues.length > 0) ||
             (technologies && technologies.length > 0) ||
             (funding_types && funding_types.length > 0) ||
             (names && names.length > 0) ||
             (companies && companies.length > 0) ||
             forceSearch,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
