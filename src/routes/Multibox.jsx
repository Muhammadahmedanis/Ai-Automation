import {
  AlarmClockMinus,
  ArchiveRestore,
  ArrowLeft,
  CornerDownLeft,
  FileMinus,
  List,
  Sparkles,
  Trash2,
  User,
  X,
  Search,
} from "lucide-react";
import { useState } from "react";
import MailboxSlider from "../components/MailboxSlider";

const emails = [
  {
    id: 1,
    name: "Casper Nelly",
    initials: "CN",
    bgColor: "bg-yellow-500",
    subject: "Re: Request for Overview of Your Solutions",
    time: "7 hrs ago",
    unread: true,
  },
  {
    id: 2,
    name: "Phillip Passaquindici",
    initials: "PP",
    bgColor: "bg-red-500",
    subject: "Re: Request for Overview of Your Solutions",
    time: "7 hrs ago",
    unread: false,
  },
  {
    id: 3,
    name: "Anika Rosser",
    initials: "AR",
    bgColor: "bg-green-500",
    subject: "Re: Request for Overview of Your Solutions",
    time: "7 hrs ago",
    unread: false,
  },
];

const Inbox = () => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedTab, setSelectedTab] = useState("All Inboxes");
  const [text, setText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [sliderOpen, setSliderOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  const tabs = ["All Inboxes", "Emails"];

  const renderTabs = () => (
    <div className="mb-4 flex justify-center md:justify-start md:space-x-4 border-b pb-3">
      {tabs.map((tab) => (
        <span
          key={tab}
          onClick={() => setSelectedTab(tab)}
          className={`cursor-pointer px-4 py-2 mx-1 rounded-full text-sm md:text-base transition-all font-medium ${
            selectedTab === tab
              ? "bg-[#15A395] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          {tab}
        </span>
      ))}
    </div>
  );

  const filteredEmails =
    selectedTab === "All Inboxes"
      ? emails
      : emails.filter((e) =>
          e.subject.toLowerCase().includes(selectedTab.toLowerCase())
        );

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-400 p-2 sm:p-4 pt-2 sm:pt-4 flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={`md:w-[40%] p-3 sm:p-4 border-r border-gray-300 bg-white rounded-xl sm:rounded-2xl md:mr-6 mb-4 md:mb-0 ${
          selectedEmail && "hidden md:block"
        }`}
      >
        {renderTabs()}

        <div className="mb-4 text-xl sm:text-2xl text-gray-700 font-semibold hidden md:block">
          Primary
        </div>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#15A395] focus:border-transparent"
          />
        </div>
        <div className="space-y-1">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-3 sm:p-4 border-b border-gray-100 flex items-start sm:items-center justify-between cursor-pointer rounded-lg transition-all duration-200 ${
                selectedEmail?.id === email.id
                  ? "bg-[#15A395] text-white shadow-md"
                  : "hover:bg-gray-50 hover:shadow-sm"
              } ${email.unread ? "font-semibold" : "font-normal"}`}
            >
              <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold text-xs sm:text-sm ${email.bgColor} flex-shrink-0`}
                >
                  {email.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium truncate">
                    {email.name}
                  </p>
                  <p className="text-xs sm:text-sm opacity-80 line-clamp-2 sm:line-clamp-1 mt-1">
                    {email.subject}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end ml-2 flex-shrink-0">
                <span className="text-xs text-current whitespace-nowrap">
                  {email.time}
                </span>
                {email.unread && (
                  <div className="w-2 h-2 bg-[#15A395] rounded-full mt-1 sm:hidden"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div
        className={`flex-1 mt-2 md:mt-0 ${
          selectedEmail ? "" : "hidden md:block"
        }`}
      >
        {/* Tabs again for mobile view */}
        <div className="md:hidden px-2 mb-4">{renderTabs()}</div>

        {/* Back Button for Mobile */}
        {selectedEmail && (
          <div className="md:hidden px-4 mb-4">
            <button
              onClick={() => setSelectedEmail(null)}
              className="flex items-center text-sm text-[#15A395] gap-2 hover:text-teal-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Inbox
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 mb-4 px-2 sm:px-4">
          <div className="bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm flex flex-wrap gap-2 items-center justify-center lg:justify-start">
            <button className="flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm bg-teal-50 hover:bg-teal-100 text-teal-600 font-medium transition-colors">
              <ArchiveRestore className="h-4 w-4" />
              <span className="hidden xs:inline">Archive</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-medium transition-colors">
              <AlarmClockMinus className="h-4 w-4" />
              <span className="hidden xs:inline">Snooze</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors">
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">Delete</span>
            </button>
          </div>

          <div className="bg-white p-2 sm:p-3 cursor-pointer rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center">
            <button onClick={() => setSliderOpen(!sliderOpen)} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium transition-colors">
              <User className="w-4 h-4" />
              <span>About Lead</span>
            </button>
            <MailboxSlider sliderOpen={sliderOpen} setSliderOpen={setSliderOpen} />
          </div>
        </div>

        {/* Email Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm">
          {selectedEmail ? (
            <>
              <div className="flex items-start sm:items-center mb-6 gap-3">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white font-bold text-sm ${selectedEmail.bgColor} flex-shrink-0`}
                >
                  {selectedEmail.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base sm:text-lg leading-tight text-gray-800">
                        {selectedEmail.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        To: support@quickpipe.com
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {selectedEmail.time}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 leading-tight">
                {selectedEmail.subject}
              </h2>

              <div className="text-sm sm:text-base space-y-3 sm:space-y-4 text-gray-700 leading-relaxed">
                <p>Hi Support Team,</p>
                <p>
                  My name is Alex Carter, and I work as a Sales Representative
                  at Greenfield Solutions. We’re currently exploring tools to
                  help us scale our team operations effectively, particularly in
                  areas like client follow-ups, reporting, and team
                  collaboration.
                </p>
                <p>
                  Would it be possible to set up a meeting to discuss this
                  further? I’m generally available on weekdays after 1 PM and
                  can adjust if needed. Looking forward to your insights!
                </p>
                <div className="pt-2">
                  <p>Best regards,</p>
                  <p className="font-medium">Alex Carter</p>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end mt-8">
                <button
                  onClick={() => setShowReplyBox(true)}
                  className="px-6 py-2.5 flex items-center gap-2 bg-[#15A395] text-white text-sm font-medium rounded-full shadow-md hover:bg-teal-600 hover:shadow-lg transition-all duration-200"
                >
                  <CornerDownLeft className="w-4 h-4" /> Reply
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <List className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Email Selected
                </h3>
                <p className="text-sm">
                  Select an email from the list to read its content
                </p>
              </div>
            </div>
          )}
        </div>

        {showReplyBox && (
          <div className="bg-white rounded-xl sm:rounded-2xl mx-2 sm:mx-4 mt-4 p-4 sm:p-6 relative shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Reply</h3>
              <button
                onClick={() => setShowReplyBox(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">To:</span>
                <span>{selectedEmail?.name}</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#15A395] focus:border-transparent text-sm"
                placeholder="Write your reply..."
              />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <button className="hover:text-gray-700 transition-colors">
                    <span>📎 Attach file</span>
                  </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowReplyBox(false)}
                    className="flex-1 sm:flex-none px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyBox(false);
                      setText("");
                    }}
                    className="flex-1 sm:flex-none bg-[#15A395] hover:bg-teal-600 text-white px-6 py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <CornerDownLeft className="w-4 h-4" /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
