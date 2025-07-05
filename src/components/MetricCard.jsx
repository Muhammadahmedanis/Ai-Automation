import {
  Book,
  Calendar,
  Mail,
  UsersRound,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useState, useEffect } from "react";

function MetricCard({
  icon,
  label,
  value,
  iconColor = "text-gray-700",
  bgColor = "bg-gray-200",
  className,
  trend,
  trendDirection = "up",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const Icon = {
    mail: Mail,
    users: UsersRound,
    calendar: Calendar,
    briefcase: Book,
  }[icon];

  // Animate value on mount
  useEffect(() => {
    setIsVisible(true);
    const numericValue = parseInt(value.replace(/,/g, "")) || 0;
    let currentValue = 0;
    const increment = numericValue / 50;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(timer);
      }
      setDisplayValue(Math.floor(currentValue));
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  const formatDisplayValue = (val) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + "k";
    }
    return val.toLocaleString();
  };

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 shadow-lg bg-white transition-all border-2 border-transparent hover:border-green-300 duration-500 hover:shadow-[0_8px_30px_rgba(45,212,191,0.3)] transform hover:-translate-y-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`p-3 sm:p-4 rounded-xl ${bgColor} flex-shrink-0 shadow-inner`}
          >
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
              {formatDisplayValue(displayValue)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 truncate font-medium">
              {label}
            </div>
            {trend && (
              <div
                className={`flex items-center gap-1 mt-1 ${
                  trendDirection === "up" ? "text-green-600" : "text-red-500"
                }`}
              >
                {trendDirection === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-xs font-semibold">{trend}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-0.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: isVisible ? "75%" : "0%" }}
          />
        </div>
      </div>

      <button className="mt-4 flex justify-between w-full text-xs sm:text-sm text-gray-600 hover:text-green-600 cursor-pointer items-center group transition-colors duration-300">
        <span className="font-medium">View details</span>
        <MdKeyboardArrowRight className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}

export default MetricCard;
