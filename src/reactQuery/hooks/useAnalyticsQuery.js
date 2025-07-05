import { useQuery } from "@tanstack/react-query";
import { 
    getAnalyticsByMonth, 
    getAnalyticsByQuater, 
    getAnalyticsByYear, 
    getDashboardSummary,
    getStatsMonthly,
    getStatsWeekly
} from "../services/analyticsService.js";

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

    const { data: statsMonthly, isLoading: isStatsMonthlyLoading, error: statsMonthlyError, refetch: refetchStatsMonthly } = useQuery({
        queryKey: ["statsMonthly"],
        queryFn: getStatsMonthly,
        enabled: !!token,
        refetchInterval: 60000, // Refetch every minute
    });

    const { data: statsWeekly, isLoading: isStatsWeeklyLoading, error: statsWeeklyError, refetch: refetchStatsWeekly } = useQuery({
        queryKey: ["statsWeekly"],
        queryFn: getStatsWeekly,
        enabled: !!token,
        refetchInterval: 60000, // Refetch every minute
    });


    return {
        dashboardSummary,
        isDashboardLoading,
        dashboardError,
        AnalyticsMonthly,
        AnalyticsQuaterly,
        AnalyticsYearly,
        statsMonthly,
        isStatsMonthlyLoading,
        statsMonthlyError,
        refetchStatsMonthly,
        statsWeekly,
        isStatsWeeklyLoading,
        statsWeeklyError,
        refetchStatsWeekly,
    }

}