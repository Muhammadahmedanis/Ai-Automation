import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import {
  CircleCheck,
  Clock,
  FileMinus,
  MailOpen,
  Search,
  User,
  TrendingUp,
  Star,
  Filter,
  Download,
  MoreVertical,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

const initialPeople = [
  {
    id: 1,
    email: "xmitchell@hotmail.com",
    contact: "Lynn Tanner",
    provider: "Microsoft",
    status: "Verified",
    score: 95,
    avatar: "https://i.pravatar.cc/40?img=1",
    lastActivity: "2 hours ago",
    engagement: "high",
  },
  {
    id: 2,
    email: "tbaker@outlook.com",
    contact: "Capt. Trunk",
    provider: "Google",
    status: "Not yet contacted",
    score: 78,
    avatar: "https://i.pravatar.cc/40?img=2",
    lastActivity: "1 day ago",
    engagement: "medium",
  },
  {
    id: 3,
    email: "mgonzalez@aol.com",
    contact: "Thomas Anum",
    provider: "Google",
    status: "Not yet contacted",
    score: 62,
    avatar: "https://i.pravatar.cc/40?img=3",
    lastActivity: "3 days ago",
    engagement: "low",
  },
];

export default function ToPeople() {
  const [people, setPeople] = useState(initialPeople);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visiblePeople, setVisiblePeople] = useState([]);

  useEffect(() => {
    // Animate people appearing
    people.forEach((person, index) => {
      setTimeout(() => {
        setVisiblePeople((prev) => [...prev, person.id]);
      }, index * 100);
    });
  }, [people]);

  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "verified" && person.status === "Verified") ||
      (selectedFilter === "pending" && person.status === "Not yet contacted");
    return matchesSearch && matchesFilter;
  });

  const handleAnother = () => {
    setIsSecondModalOpen(true);
    setIsModalOpen(false);
  };

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case "high":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    return status === "Verified"
      ? "text-green-600 bg-green-100 border-green-200"
      : "text-orange-600 bg-orange-100 border-orange-200";
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Enhanced Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg sm:text-xl text-gray-800">
            Top Leads
          </h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              +{people.length} this week
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="h-4 w-4 text-gray-600" />
          </button>
          <Link to="/analytics">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MdArrowOutward className="h-4 w-4 text-gray-600" />
            </button>
          </Link>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="mb-6 flex items-center gap-4 flex-col sm:flex-row">
        <div className="relative w-full sm:flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="text-gray-400 h-4 w-4" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-3 pl-11 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="Search leads by name or email..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#16C47F] hover:bg-[#FF9D23] cursor-pointer text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-sm font-medium">
            <FiPlus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Enhanced Cards View for Mobile and Desktop */}
      <div className="space-y-4">
        {filteredPeople.map((person, index) => (
          <div
            key={person.id}
            className={`bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
              visiblePeople.includes(person.id)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative">
                  <img
                    src={person.avatar}
                    alt={person.contact}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {person.contact}
                    </h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(person.score / 20)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {person.email}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        person.status
                      )}`}
                    >
                      {person.status === "Verified" ? (
                        <CircleCheck className="inline h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="inline h-3 w-3 mr-1" />
                      )}
                      {person.status}
                    </div>

                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(
                        person.engagement
                      )}`}
                    >
                      {person.engagement.charAt(0).toUpperCase() +
                        person.engagement.slice(1)}{" "}
                      Engagement
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {person.provider === "Google" ? (
                        <FcGoogle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                          M
                        </div>
                      )}
                      <span>{person.provider}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {person.score}
                  </div>
                  <div className="text-xs text-gray-500">Lead Score</div>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Last activity: {person.lastActivity}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                  View Profile
                </button>
                <button className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
                  Send Email
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPeople.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <User className="h-12 w-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No leads found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1d1c1c96] bg-opacity-50 px-4 z-50">
          <div className="w-full max-w-[95vw] sm:max-w-md rounded-lg bg-white p-4 sm:p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add leads</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <IoClose className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="shadow-lg p-3 rounded-lg">
                <div className="flex gap-3 sm:gap-4 cursor-pointer items-center px-2 sm:px-4">
                  <div className="flex-shrink-0">
                    <FileMinus className="text-green-400" size={30} />
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Upload</p>
                    <p className="font-semibold text-sm sm:text-base">CSV</p>
                  </div>
                </div>
              </div>

              <div className="shadow-lg p-3 rounded-lg">
                <div className="flex gap-3 sm:gap-4 items-center px-2 sm:px-4">
                  <div className="flex-shrink-0">
                    <FileMinus className="text-green-400" size={30} />
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Use</p>
                    <p className="font-semibold text-sm sm:text-base">
                      AI lead Finder
                    </p>
                  </div>
                </div>
              </div>

              <div className="shadow-lg p-3 rounded-lg">
                <div
                  onClick={handleAnother}
                  className="flex gap-3 sm:gap-4 cursor-pointer items-center px-2 sm:px-4"
                >
                  <div className="flex-shrink-0">
                    <MailOpen size={26} className="cursor-pointer" />
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Enter</p>
                    <p className="font-semibold text-sm sm:text-base">
                      Email Manually
                    </p>
                  </div>
                </div>
              </div>

              <div className="shadow-lg p-3 rounded-lg">
                <div className="flex gap-3 sm:gap-4 cursor-pointer items-center px-2 sm:px-4">
                  <div className="flex-shrink-0">
                    <FcGoogle size={24} />
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-400">Use</p>
                    <p className="font-semibold text-sm sm:text-base">
                      Google Sheets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Second Modal (MailOpen Click) */}
      {isSecondModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="rounded-lg bg-white p-4 sm:p-6 shadow-lg w-full max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold inline-flex gap-2 items-center">
                <User className="text-gray-300" size={20} />
                Add new lead
              </h3>
              <button onClick={() => setIsSecondModalOpen(false)}>
                <IoClose className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead owner
                </label>
                <div className="bg-gray-200 w-fit rounded-full px-3 py-2 flex gap-2 items-center border border-gray-300">
                  <img
                    src="https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg"
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                    alt="Profile"
                  />
                  <span className="text-sm sm:text-base">Beetao lenu</span>
                </div>
              </div>

              <div className="bg-gray-200 rounded p-2 text-sm font-medium">
                Personal Information
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="leadStatus"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Lead Status
                    </label>
                    <input
                      type="text"
                      name="leadStatus"
                      id="leadStatus"
                      placeholder="Enter status"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="name@company.com"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="Enter phone number"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-200 rounded p-2 text-sm font-medium">
                  Company Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="company"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="website"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      id="website"
                      placeholder="https://example.com"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="text-white bg-blue-700 cursor-pointer hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// export default TopPeople;
