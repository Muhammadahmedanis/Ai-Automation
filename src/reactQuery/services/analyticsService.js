import { axiosInstance } from "../../api/axios";
import axios from "axios";

export const getAnalyticsByMonth = () => axiosInstance.get("/analytics/GetWorkspaceAnalyticsMonthly").then(res => res.data);
export const getAnalyticsByQuater = () => axiosInstance.get("/analytics/GetWorkspaceAnalyticsQuarterly").then(res => res.data);
export const getAnalyticsByYear = () => axiosInstance.get("/analytics/GetWorkspaceAnalyticsYearly").then(res => res.data);

export const getDashboardSummary = () => {
  const token = JSON.parse(localStorage.getItem("Token"));
  const token1 = token?.token || token;
  
  return axios.get("https://quick-pipe-backend.vercel.app/Dashboard/SummaryWidget", {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  }).then(res => res.data);
};

export const getStatsMonthly = () => {
  const token = JSON.parse(localStorage.getItem("Token"));
  const token1 = token?.token || token;
  
  return axios.get("https://quick-pipe-backend.vercel.app/Dashboard/StatsMonthlyWidget", {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  }).then(res => res.data);
};

export const getStatsWeekly = () => {
  const token = JSON.parse(localStorage.getItem("Token"));
  const token1 = token?.token || token;
  
  return axios.get("https://quick-pipe-backend.vercel.app/Dashboard/StatsWeeklyWidget", {
    headers: {
      Authorization: `Bearer ${token1}`
    }
  }).then(res => res.data);
};