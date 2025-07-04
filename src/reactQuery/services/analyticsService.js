import { axiosInstance } from "../../api/axios";

export const getAnalyticsByMonth = () => axiosInstance.get("/analytics/GetWorkspaceAnalyticsMonthly").then(res => res.data);
export const getAnalyticsByQuater = () => axiosInstance.get("/analytics/GetWorkspaceAnalyticsQuarterly").then(res => res.data);
export const getAnalyticsByYear = () => axiosInstance.get("/analytics/GetWorkspaceAnalyticsYearly").then(res => res.data);