import { useState } from "react";
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
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

const people = [
  {
    email: "xmitchell@hotmail.com",
    contact: "Lynn Tanner",
    provider: "Microsoft",
    status: "Verified",
  },
  {
    email: "tbaker@outlook.com",
    contact: "Capt. Trunk",
    provider: "Google",
    status: "Not yet contacted",
  },
  {
    email: "mgonzalez@aol.com",
    contact: "Thomas Anum",
    provider: "Google",
    status: "Not yet contacted",
  },
];

export default function ToPeople() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  const handleAnother = () => {
    setIsSecondModalOpen(true);
    setIsModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-sm sm:text-base">Top Lead</h3>
        <button className="ml-auto">
          <Link to="/analytics">
            <MdArrowOutward className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </Link>
        </button>
      </div>

      <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 flex-col sm:flex-row">
        <div className="relative w-full sm:flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <input
            type="search"
            className="block w-full p-2 sm:p-3 pl-8 sm:pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 outline-none"
            placeholder="Search leads..."
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#15a395] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#128a7e] transition-colors text-sm sm:text-base whitespace-nowrap"
        >
          <FiPlus className="h-4 w-4" />
          <span className="hidden sm:inline cursor-pointer">Add leads</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-50">
            <tr className="border border-gray-300">
              <th className="px-3 sm:px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-muted cursor-pointer"
                />
              </th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">
                EMAIL
              </th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">
                CONTACT
              </th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">
                PROVIDER
              </th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr
                key={person.email}
                className="border border-gray-300 text-xs sm:text-sm hover:bg-gray-50"
              >
                <td className="px-3 sm:px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-muted cursor-pointer"
                  />
                </td>
                <td className="px-3 sm:px-4 py-3 text-gray-400 truncate max-w-0">
                  {person.email}
                </td>
                <td className="px-3 sm:px-4 py-3 text-gray-400 truncate">
                  {person.contact}
                </td>
                <td className="px-3 sm:px-4 py-3 text-gray-400">
                  <div className="flex items-center gap-1">
                    <FcGoogle size={18} />
                    <span className="hidden sm:inline">{person.provider}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
                    <div className="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-0.5 w-fit">
                      <CircleCheck size={14} className="text-blue-500" />
                      <span className="text-xs text-blue-500">Verified</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 w-fit">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400 hidden xl:inline">
                        Not yet contacted
                      </span>
                      <span className="text-xs text-gray-400 xl:hidden">
                        Pending
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {people.map((person) => (
          <div
            key={person.email}
            className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <input
                  type="checkbox"
                  className="rounded border-muted cursor-pointer flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {person.contact}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {person.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FcGoogle size={18} />
                <span className="text-xs sm:text-sm text-gray-400">
                  {person.provider}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-0.5">
                <CircleCheck size={14} className="text-blue-500" />
                <span className="text-xs text-blue-500">Verified</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">Not yet contacted</span>
              </div>
            </div>
          </div>
        ))}
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
