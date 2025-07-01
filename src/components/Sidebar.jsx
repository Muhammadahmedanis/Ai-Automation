import { useState } from "react";
import {
  Calendar,
  Camera,
  BarChartIcon as ChartBar,
  Eye,
  Inbox,
  LineChart,
  Mail,
  User,
  Settings,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import logo2 from "../assets/logo2.png";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, slug: "/" },
  { name: "AI Lead Scout", icon: User, slug: "ai-lead-scouts" },
  { name: "Email Accounts", icon: Mail, slug: "email-accounts" },
  { name: "Multibox", icon: Inbox, slug: "multi-box" },
  { name: "Analytics", icon: ChartBar, slug: "analytics" },
  { name: "Website Visitors", icon: Eye, slug: "website-visitor" },
  { name: "Pipeline", icon: LineChart, slug: "pipelines" },
  { name: "Calendar", icon: Calendar, slug: "calendar" },
];

const bottomItems = [
  { name: "Support", icon: HelpCircle, slug: "support" },
  { name: "Settings", icon: Settings, slug: "settings" },
];

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-zinc-900 text-white cursor-pointer transition-all duration-300 z-10 ease-in-out ${
        isExpanded ? "w-48" : "w-12 md:w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`p-4 flex ${
          isExpanded ? "justify-start px-4" : "justify-center px-0"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap font-semibold">
          {isExpanded ? (
            <>
              <img src={logo} alt="Logo" />
            </>
          ) : (
            <img src={logo2} alt="Logo" className="h-6 w-full" />
          )}
        </div>
      </div>

      <nav className="mt-4 space-y-2 px-2 flex flex-col h-auto ">
        <div className="space-y-2 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.slug}
                className={`flex items-center gap-4 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800 ${
                  !isExpanded ? "justify-center" : ""
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-opacity ${
                    isExpanded ? "opacity-100 block" : "opacity-0 w-0 hidden"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="space-y-2 absolute w-full left-0 bottom-0 px-2">
          <div className="relative w-full bottom-5">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.slug}
                  className={`flex items-center gap-4 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800 ${
                    !isExpanded ? "justify-center" : ""
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-opacity ${
                      isExpanded ? "opacity-100 block" : "opacity-0  hidden"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
