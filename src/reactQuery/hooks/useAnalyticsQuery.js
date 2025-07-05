import { useQuery } from "@tanstack/react-query";
import { getAnalyticsByMonth, getAnalyticsByQuater, getAnalyticsByYear, getDashboardSummary } from "../services/analyticsService.js";

export const useAnalyticsQuery = () => {
    const token = JSON.parse(localStorage.getItem("Token"));

    const { data: dashboardSummary, isLoading: isDashboardLoading, error: dashboardError } = useQuery({
        queryKey: ["dashboardSummary"],
        queryFn: getDashboardSummary,
        enabled: !!token,
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    });

    const { data: AnalyticsMonthly} = useQuery({
        queryKey: ["AnalyticsM"],
        queryFn: getAnalyticsByMonth,
        enabled: !!token,
    })


    const { data: AnalyticsQuaterly } = useQuery({
        queryKey: ["AnalyticsQ"],
        queryFn: getAnalyticsByQuater,
        enabled: !!token,
    })


    const { data: AnalyticsYearly } = useQuery({
        queryKey: ["AnalyticsY"],
        queryFn: getAnalyticsByYear,
        enabled: !!token,
    })


    return {
        dashboardSummary,
        isDashboardLoading,
        dashboardError,
        AnalyticsMonthly,
        AnalyticsQuaterly,
        AnalyticsYearly,
    }

}