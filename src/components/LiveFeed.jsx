import { Flame, Hand, Clock, Mail, MousePointer, Eye } from "lucide-react";
import { FiCircle } from "react-icons/fi";
import { useState, useEffect } from "react";

function LiveFeed() {
  const [feedItems, setFeedItems] = useState([
    {
      id: 1,
      avatar:
        "https://s3-alpha-sig.figma.com/img/ad23/2f1a/673fe1645ff06837351bc6292fd60f72?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=VVDq6rfQ2pWWTaAOpfg8tli0UbUgcDVHfFCIY7aJsQ93u9eSOdHxJMbBfGkZGbcw1gkl5Pdqfvp4VlKR-NUq4MesVpJtlCZY~kEf09IG6ryLnYULwWPfmy3VUrg0UanQQzpvb31sq3Lpdv0Bzjaccq56B1Nbdg5TB5XQWmCM6taNTrqCTQwNh7e9k~xQaBsh80nmLp6jzaUW61hj7i8POSXayfkWVpDOUuazUmb~GbMfscuO27o1ReIRRpn0m2ztRpbNtSAvi-tpzZx6V3bVqhoHAnfubJ-vGHPvDaX2MSokCbwAJZ8WW2ulnpW73XTuo8tZjdasWOBsmkt6Rz9~YQ__",
      name: "Benjamin Cooper",
      role: "CEO @ Meta Inc.",
      subject: "Re: Meeting with Lead",
      status: "Clicked",
      action: "clicked",
      color: "text-purple-500",
      bg: "bg-[#f5edff]",
      time: "5s ago",
      isNew: true,
    },
    {
      id: 2,
      avatar:
        "https://s3-alpha-sig.figma.com/img/86c2/8a12/4c67bf4716e380d4c59dcf22f991a46b?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=XxPJjT7xtNP8qIm0sJXF4HMux5R4f9Zxd~HujoUQ65DNg0IGAwZjWjR1KbX~PwzLTpKJ7NEu8BlyrMwpURF0aN1fN8tbW9RvhHPzHARmGFkKuQ0vEuhguGI4FpUcyvmAJ6CuPsTuKMmgTmtbodgCNPXPEyMDsCSrDG2dZXYg~aYpYnyUGqCh~kHm5szmUvnq7rdNN26EWjBzoObHvIAUylYi5TTc3K0U9bBt-QnmALP~aK5ctcByuhzw8IaLUkPI~342fIjb7b~dsj4ula1dwsnwv6EopB00XeMUQdA2gOlEppDd6FbXWU7RUd5vhQTFd68y4a~-LmBdowRT0BSh8Q__",
      name: "Casper Nelly",
      role: "Sales manager @ pwc",
      subject: "Re: sales marketing",
      status: "Hot Lead",
      action: "replied",
      color: "text-orange-500",
      bg: "bg-[#fff3e6]",
      time: "7 hrs ago",
      isNew: false,
    },
    {
      id: 3,
      avatar:
        "https://s3-alpha-sig.figma.com/img/cbbe/ed5b/25576aa490309af20745987661e2bd74?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=AAfvHxzNO7Alrt2-Kk2YPqQAqQZAVsHm3ssdPVr02meOODsYlEWREPrUVyBqO8h8a6L8WwWv1~QMQ-1IAFzned9gxSvUh0nXyR41hMJPvFCgrbeOL0IgfsHm~sZIZiCSQQFX7-cUEVhXA0vEgtMJWbQP-A0vAXGElnKvFmsS-onZ7dBmsv~uUjJQAvXPIl4rT4oC0CHQT4KHJLbH4~8IkM31WeU0IGGlK88rloAU9PhkvjTRHxI4oqe~vw1H96PyTg0nl4T-cUFjAeRd6WpTRr14JCET2JEfbhMyr3vxvq7bowdgJNWqVlA53I7PvRc9QfAsPy84kKCDUn8V74o-9A__",
      name: "Philip Oroni",
      role: "Designer @ QuickPipe AI",
      subject: "Re: Email about design work",
      status: "Opened",
      action: "opened",
      color: "text-green-500",
      bg: "bg-[#ebf6ee]",
      time: "2 days ago",
      isNew: false,
    },
  ]);

  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    // Animate items appearing
    feedItems.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => [...prev, item.id]);
      }, index * 150);
    });
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case "clicked":
        return <MousePointer className="h-4 w-4" />;
      case "opened":
        return <Eye className="h-4 w-4" />;
      case "replied":
        return <Mail className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {feedItems.map((item, i) => (
        <div
          key={item.id}
          className={`transition-all duration-500 transform ${
            visibleItems.includes(item.id)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          } ${item.isNew ? "animate-pulse" : ""}`}
        >
          <div className="flex items-start gap-2 sm:gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-300 cursor-pointer group">
            <div className="relative">
              <img
                src={item.avatar || "/placeholder.svg"}
                alt={item.name}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0 border-2 border-white shadow-md"
              />
              {item.isNew && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping">
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold text-sm sm:text-base truncate text-gray-800 group-hover:text-gray-900">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {item.role}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-700 line-clamp-2 font-medium">
                {item.subject}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div
                  className={`${item.bg} rounded-full flex gap-2 p-2 sm:p-2.5 items-center w-fit shadow-sm border border-white/50`}
                >
                  <div className={`${item.color}`}>
                    {getActionIcon(item.action)}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          </div>
          <hr className="border-gray-200 mt-3 sm:mt-4 border-dashed" />
        </div>
      ))}
    </div>
  );
}

export default LiveFeed;
