import { useQuery } from "@tanstack/react-query";
import { getAnalyticsByMonth, getAnalyticsByQuater, getAnalyticsByYear } from "../services/analyticsService.js";

export const useAnalyticsQuery = () => {
    const token = JSON.parse(localStorage.getItem("Token"));

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
        AnalyticsMonthly,
        AnalyticsQuaterly,
        AnalyticsYearly,
    }

}