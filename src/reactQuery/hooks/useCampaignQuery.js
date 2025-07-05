import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getCampaignLeads,
  getCampaignSequence,
  updateCampaignSequence,
  sendCampaignMail,
  generateAIEmail,
  generateAISequence,
  getCampaignSchedule,
  updateCampaignSchedule,
  generateAISchedule,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  getCampaignById,
  deleteCampaign,
  activePauseCampaign,
  runCampaign,
  getAllTemplate
} from "../services/campaignService";

export const useCampaignQuery = () => {
  const queryClient = useQueryClient();

  // -------------------- Campaign CRUD --------------------
  const {
    data: campaignsObject, 
    isLoading: isCampaignsLoading,
    error: campaignsError,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: getAllCampaigns,
    onSuccess: (data) => console.log("All campaigns fetched:", data),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => createCampaign(data),
    onSuccess: (data) => {
      console.log("Create Campaign Success:", data); // Check what data is returned
      toast.success("Campaign created");
      queryClient.invalidateQueries(["campaigns"]);
    },
    onError: (error) => {
      console.log("Create Campaign Error:", error); // Check if the error is expected
      toast.error("Failed to create campaign");
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ campaignId, data }) => updateCampaign(campaignId, data),
    onSuccess: () => {
      toast.success("Campaign updated");
      queryClient.invalidateQueries(["campaigns"]);
    },
    onError: () => toast.error("Failed to update campaign"),
  });  

  const deleteCampaignMutation = useMutation({
    mutationFn: (data) => deleteCampaign(data),
    onSuccess: () => {
      toast.success("Campaign deleted");
      queryClient.invalidateQueries(["campaigns"]);
    },
    onError: () => toast.error("Failed to delete campaign"),
  });

  const activePauseMutation = useMutation({
    mutationFn: activePauseCampaign,
    onSuccess: () => {
      toast.success("Campaign status updated");
      queryClient.invalidateQueries(["campaigns"]);
    },
    onError: () => toast.error("Failed to update campaign status"),
  });

  const runCampaignMutation = useMutation({
    mutationFn: runCampaign,
    onSuccess: () => {
      toast.success("Campaign status updated");
      queryClient.invalidateQueries(["campaigns"]);
    },
    onError: () => toast.error("Failed to start campaign"),
  });

  // -------------------- Sequence --------------------

  const getCampaignSequenceQuery = (campaignId) => {
    return useQuery({
      queryKey: ["campaignSequence", campaignId],
      queryFn: () => getCampaignSequence(campaignId), // Fetch the sequence data
      enabled: !!campaignId, // Only run the query if campaignId is valid
      onSuccess: (sequence) => console.log("Campaign sequence fetched:", sequence),
      onError: (error) => toast.error(`Failed to fetch campaign sequence: ${error.message}`),
    });
  };

  const updateCampaignSequenceMutation = useMutation({
    mutationFn: ({ campaignId, sequenceData }) => updateCampaignSequence(campaignId, sequenceData),
    onSuccess: (data) => {
      console.log("Campaign sequence updated successfully:", data);
      toast.success("Campaign sequence updated successfully!");
      // No automatic state update — leave it to the component if needed
    },
    onError: (error) => {
      toast.error(`Failed to update campaign sequence: ${error.message}`);
      console.log(error);
    },
  });
  

  const sendMailMutation = useMutation({
    mutationFn: ({ campaignId, data }) => sendCampaignMail(campaignId, data),
    onSuccess: () => toast.success("Email sent"),
    onError: () => toast.error("Failed to send email"),
  });

  const generateEmailWithAI = useMutation({
    mutationFn: ({ campaignId, emailData }) => generateAIEmail(campaignId, emailData),
    onSuccess: (data) => {
      console.log("AI Email generated successfully:", data);
      // We won't directly update the state here. We'll return the data to the component for handling.
    },
    onError: (error) => {
      toast.error(`Failed to generate AI email: ${error.message}`);
      console.log(error);
    },
  });

  const generateSequenceWithAI = useMutation({
    mutationFn: ({ campaignId, sequenceData }) => generateAISequence(campaignId, sequenceData),
    onSuccess: (data) => {
      console.log("AI Sequence generated successfully:", data);
      // We won't directly update the state here. We'll return the data to the component for handling.
    },
    onError: (error) => {
      toast.error(`Failed to generate AI sequence: ${error.message}`);
      console.log(error);
    },
  });
  

  // -------------------- Schedule --------------------
  const updateScheduleMutationQuery = useMutation({
    mutationFn: ({ campaignId, data }) => updateCampaignSchedule(campaignId, data),
    onSuccess: () => {
      toast.success("Schedule updated");
      queryClient.invalidateQueries(["campaignSchedule"]);
    },
    onError: () => toast.error("Failed to update schedule"),
  });

  const getCampaignScheduleQuery = (campaignId) => {
    return useQuery({
      queryKey: ["campaignSchedule", campaignId],
      queryFn: () => getCampaignSchedule(campaignId), 
      enabled: !!campaignId,
      onSuccess: (schedule) => console.log("Campaign schedule fetched:", schedule),
      onError: (error) => toast.error(`Failed to fetch campaign schedule: ${error.message}`),
    });
  };

  const generateAIScheduleQuery = useMutation({
    mutationFn: ({ campaignId, data }) => generateAISchedule(campaignId, data),
    onSuccess: (data) => {
      console.log("AI Schedule generated successfully:", data);
      // We won't directly update the state here. We'll return the data to the component for handling.
    },
    onError: (error) => {
      toast.error(`Failed to generate AI schedule: ${error.message}`);
      console.log(error);
    },
  });


  const getAllTemaplteQuery = () => {
    return useQuery({
      queryKey: ["allTemplate"],
      queryFn: getAllTemplate,
      onSuccess: (data) => {
        console.log("All templates fetched:", data);
      },
      onError: (error) => {
        toast.error(`Failed to fetch templates: ${error.message}`);
      },
    });
  };  
  


  const getCampaignLeadsQuery = (campaignId) => useQuery({
    queryKey: ["campaignLeads", campaignId],
    queryFn: async () => {
      const response = await getCampaignLeads(campaignId);
      return response.leads; // Directly return the leads array
    },
    enabled: !!campaignId,
    onSuccess: (leads) => console.log("Campaign leads fetched:", leads),
  });





  return {
    // Data
    campaignsObject,
    isCampaignsLoading,
    campaignsError,

    // Campaign Mutations
    createCampaignMutation,
    updateCampaignMutation,
    deleteCampaignMutation,
    activePauseMutation,
    runCampaignMutation,
    getCampaignById,

    // Leads
    getCampaignLeadsQuery,

    // Sequence
    getCampaignSequenceQuery,
    sendMailMutation,

    generateEmailWithAI,
    generateSequenceWithAI,
    updateCampaignSequenceMutation,
    

    // Schedule
    getCampaignScheduleQuery,
    updateScheduleMutationQuery,
    generateAIScheduleQuery,
    getAllTemaplteQuery,

  };
};
