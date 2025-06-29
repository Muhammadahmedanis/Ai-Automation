// import { AlarmClockMinus, ArchiveRestore, CornerDownLeft, FileMinus, List, Sparkles, Trash2, User, X,  Search } from "lucide-react";
// import { useState } from "react";

// const emails = [
//   { id: 1, name: "Casper Nelly", initials: "CN", bgColor: "bg-yellow-500", subject: "Re: Request for Overview of Your Solutions", time: "7 hrs ago", unread: true },
//   { id: 2, name: "Phillip Passaquindici", initials: "PP", bgColor: "bg-red-500", subject: "Re: Request for Overview of Your Solutions", time: "7 hrs ago", unread: false },
//   { id: 3, name: "Anika Rosser", initials: "AR", bgColor: "bg-green-500", subject: "Re: Request for Overview of Your Solutions", time: "7 hrs ago", unread: false },
// ];

// const Inbox = () => {
//   const [selectedEmail, setSelectedEmail] = useState(null);
//   const [selectedTab, setSelectedTab] = useState("All Inboxes");
//   const [text, setText] = useState("");
//   const [showReplyBox, setShowReplyBox] = useState(false);
  
//   const [isOpen, setIsOpen] = useState(false);

//   const handleToggle = () => setIsOpen(!isOpen);
//   const handleClose = () => setIsOpen(false);

//   return (
//     <div className="flex min-h-screen bg-gray-200 text-gray-400 px-[5px] md:pl-[120px] pt-[40px] md:pr-[120px] flex-col md:flex-row">
//       {/* Sidebar */}
//       <div className="md:w-[40%] p-6 border-r border-gray-300 bg-white rounded-2xl md:mr-6">
//       <div className="mb-4 flex space-x-4">
//           {['All Inboxes', 'Emails', 'SMS'].map((tab) => (
//             <span
//               key={tab}
//               onClick={() => setSelectedTab(tab)}
//               className={`cursor-pointer ${selectedTab === tab ? "text-green-500 border-b-2 border-green-500" : "text-gray-500"}`}
//             >
//               {tab}
//             </span>
//           ))}
//         </div>
//         <div className="mb-4 text-2xl text-gray-400">Primary</div>
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Search emails..."
//             className="w-full p-2 border border-gray-300 rounded-full pl-10"
//           />
//         </div>
//         <div>
//           {emails.map((email) => (
//             <div
//               key={email.id}
//               onClick={() => setSelectedEmail(email)}
//               className={`p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${selectedEmail?.id === email.id ? "bg-[#15A395] text-white" : "hover:bg-[#f5fffb]"} ${email.unread ? "font-bold" : "font-normal"}`}
//             >
//               <div className="flex items-center space-x-3">
//                 <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${email.bgColor}`}> 
//                   {email.initials} 
//                 </div>
//                 <div>
//                   <p>{email.name}</p>
//                   <p className="text-sm">{email.subject}</p>
//                 </div>
//               </div>
//               <span className="text-sm">{email.time}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Main Content Container */}
//       <div className="flex-1 mt-6 md:mt-0">
//         {/* Buttons Container */}
//         <div className="flex justify-between items-center mb-4 overflow-auto">
//           <div className="bg-white p-1 rounded-xl flex space-x-2">
//             <button className="p-2 flex items-center gap-1">Archive <ArchiveRestore size={16} /></button>
//             <button className="p-2 flex items-center gap-1">Snooze <AlarmClockMinus size={18} /></button>
//             <button className="p-2 flex items-center gap-1">Delete <Trash2 size={16} /></button>
//           </div>
//           <div className="bg-white p-1 rounded-xl flex space-x-2">
//             <button className="p-2 bg-white rounded-xl flex items-center gap-1">About Lead <User size={20} /></button>
//           </div>
          
//         </div>
//         {/* Email Content */}
//         <div className="flex-1 flex flex-col bg-white rounded-2xl p-3 mb-[10px]">
//           {selectedEmail && <h2 className="text-xl-center font-bold rounded">{selectedEmail.subject}</h2>}
//         </div>
//         <div className="flex-1 flex flex-col bg-white rounded-2xl p-6">
//           {selectedEmail ? (
//             <div className="w-full">
//               <div className="flex items-center mb-4">
//                 <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${selectedEmail.bgColor}`}>{selectedEmail.initials}</div>
//                 <div className="ml-3">
//                   <p className="font-bold">{selectedEmail.name}</p>
//                   <p className="text-sm text-gray-500">To: support@quickpipe.com</p>
//                 </div>
//                 <span className="ml-auto text-sm text-gray-500">{selectedEmail.time}</span>
//               </div>
//               <div className="rounded-xl">
//                 <p className="text-gray-700">Hi Support Team,</p>
//                 <p className="text-gray-700 mt-2">My name is Alex Carter, and I work as a Sales Representative at Greenfield Solutions. We’re currently exploring tools to help us scale our team operations effectively, particularly in areas like client follow-ups, reporting, and team collaboration.</p>
//                 <p className="text-gray-700 mt-2">Would it be possible to set up a meeting to discuss this further? I’m generally available on weekdays after 1 PM and can adjust if needed. Looking forward to your insights!</p>
//                 <p className="text-gray-700 mt-4">Best regards,</p>
//                 <p className="text-gray-700">Alex Carter</p>
//               </div>
//               <div className="flex justify-end mt-4">
//                 <button onClick={() => setShowReplyBox(true)} className="px-3 py-2 flex items-center gap-1 cursor-pointer bg-[#15A395] text-white rounded-xl"> <CornerDownLeft className="w-4 h-4" />
//                 Reply</button>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div role="status" class="animate-pulse">
//                   <div class="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded-sm">
//                   <FileMinus size={40} />
//                   </div>
//                   <div class="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
//                   <div class="h-2 bg-gray-200 rounded-full mb-2.5"></div>
//                   <div class="h-2 bg-gray-200 rounded-full mb-2.5"></div>
//                   <div class="h-2 bg-gray-200 rounded-full"></div>
//                   <div class="flex items-center mt-4">
//                     <svg class="w-10 h-10 me-3 text-gray-200 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
//                       </svg>
//                       <div>
//                           <div class="h-2.5 bg-gray-200 rounded-full w-32 mb-2"></div>
//                           <div class="w-48 h-2 bg-gray-200 rounded-full"></div>
//                       </div>
//                   </div>
//               </div>
//             </div>
//           )}
//         </div>
//         {showReplyBox && <div className="max-w-3xl bg-white mx-auto mt-3 rounded-lg">
//             <div className="shadow-sm p-4 relative">
//               <button  onClick={() => setShowReplyBox(false)} className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-gray-600">
//                 <X className="w-5 h-5" />
//               </button>

//             <div className="mb-4 mt-2">
//               <textarea
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 className="w-full min-h-[100px] outline-none resize-none"
//                 placeholder="Write your reply..."
//               />
//               </div>

//             <div className="flex justify-end mb-3">
//               <button className="text-teal-500 font-medium flex items-center gap-1 text-sm">
//                 Reply with AI <Sparkles className="w-4 h-4 text-amber-400" />
//               </button>
//             </div>

//             <div className="flex items-center gap-1 border-t border-b py-2 flex-wrap">
//               <button className="p-1.5 rounded  hover:bg-gray-100 flex items-center">
//                 <List className="w-4 h-4 text-gray-600" />
//               </button>
//             </div>

//             <div className="flex justify-end mt-4">
//               <button onClick={() => setShowReplyBox(false)} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-full flex items-center cursor-pointer gap-2">
//                 <CornerDownLeft className="w-4 h-4" />
//                 Reply
//               </button>
//             </div>
//           </div>
//         </div>}

//       {/* Trigger Button */}
//       <div
//         className="border border-green-500 p-4 absolute bottom-4 right-10 cursor-pointer rounded-full w-fit bg-white shadow-md"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <Sparkles className="text-yellow-500" />
//       </div>

//       {/* Floating Panel */}
//       <div
//         className={`absolute bottom-28 right-8 z-50 transition-all duration-300 ease-in-out transform ${
//           isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95 pointer-events-none"
//         }`}
//         onClick={() => setIsOpen(false)} // Click to close
//       >
//         <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg border border-purple-200 overflow-hidden relative cursor-default">
//           {/* Gradient Border Effect */}
//           <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-blue-200 to-teal-200 rounded-3xl p-[2px] pointer-events-none">
//             <div className="bg-white rounded-3xl h-full w-full"></div>
//           </div>

//           <div className="relative z-10 p-6 pb-8">
//             {/* Header */}
//             <div className="flex items-center justify-center mb-8">
//               <div className="flex items-center gap-2">
//                 <div className="px-2 bg-teal-500 rounded-lg flex items-center justify-center">
//                   <span className="text-white text-lg">Q</span>
//                 </div>
//                 <span
//                   className="text-lg font-medium bg-gradient-to-r from-[rgb(232,81,68)] to-[rgb(146,181,172)] bg-clip-text text-transparent"
//                 >
//                   QuickPipe AI
//                 </span>

//                 <Sparkles className="w-4 h-4 text-yellow-500" />
//               </div>
//             </div>

//             {/* Illustration */}
//             <div className="flex justify-center mb-8">
//               <div className="relative">
//                 <div className="w-16 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm transform rotate-45 skew-x-12"></div>
//                 <div className="w-14 h-4 bg-gradient-to-r from-teal-400 to-teal-500 rounded-sm transform rotate-45 skew-x-12 -mt-2 ml-1"></div>
//                 <div className="w-12 h-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-sm transform rotate-45 skew-x-12 -mt-2 ml-1"></div>
//                 <div className="absolute -top-4 -left-8 w-24 h-24">
//                   <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
//                     <path
//                       d="M20,50 L80,50 M50,20 L50,80 M30,30 L70,70 M70,30 L30,70"
//                       stroke="#14b8a6"
//                       strokeWidth="1"
//                       fill="none"
//                     />
//                   </svg>  
//                 </div>
//               </div>
//             </div>

//             {/* Button Grid */}
//             <div className="grid grid-cols-2 gap-2 mb-4 mx-auto w-max">
//               {["Find Help 💬", "Find Leads 📊", "Get contacts 👤", "View reports 📈"].map((text, idx) => (
//                 <button
//                   key={idx}
//                   className="p-2 w-fit rounded-full text-sm font-normal bg-gray-50 border border-gray-200 hover:bg-gray-100"
//                 >
//                   {text}
//                 </button>
//               ))}
//             </div>

//             {/* Send Email */}
//             <div className="flex justify-center mb-8">
//               <button className="p-2 rounded-full text-sm font-normal  bg-gray-50 border border-gray-200 hover:bg-gray-100">
//                 Send emails ✉️
//               </button>
//             </div>

//             {/* Input */}
//             <h2 className="text-xl font-semibold text-center text-gray-800 mb-8">Ask me anything</h2>
//             <div className="relative">
//               <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden">
//                 <div className="flex items-center pl-4 pr-2 flex-1">
//                   <Search className="w-4 h-4 text-gray-400 mr-2" />
//                   <input
//                     placeholder="How to add leads"
//                     className="border-0 bg-transparent focus:outline-none text-sm w-full"
//                   />
//                 </div>
//                 <button className="bg-gradient-to-r from-[rgb(224,140,23)] to-[rgb(84,156,110)] flex items-center gap-2 cursor-pointer hover:from-yellow-500 hover:to-teal-600 text-white rounded-full px-6 py-2 m-1 text-sm font-medium">
//                   <Sparkles className="w-4 h-4 text-white" /> AI Search
//                 </button>
//               </div>
//             </div>
//           </div>
//       </div>
//     </div>  
//       </div>

//   </div>
//   );
// };

// export default Inbox;


import { AlarmClockMinus, ArchiveRestore, ArrowLeft, CornerDownLeft, FileMinus, List, Sparkles, Trash2, User, X, Search } from "lucide-react";
import { useState } from "react";

const emails = [
  { id: 1, name: "Casper Nelly", initials: "CN", bgColor: "bg-yellow-500", subject: "Re: Request for Overview of Your Solutions", time: "7 hrs ago", unread: true },
  { id: 2, name: "Phillip Passaquindici", initials: "PP", bgColor: "bg-red-500", subject: "Re: Request for Overview of Your Solutions", time: "7 hrs ago", unread: false },
  { id: 3, name: "Anika Rosser", initials: "AR", bgColor: "bg-green-500", subject: "Re: Request for Overview of Your Solutions", time: "7 hrs ago", unread: false },
];

const Inbox = () => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedTab, setSelectedTab] = useState("All Inboxes");
  const [text, setText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  const tabs = ['All Inboxes', 'Emails', 'SMS'];

  const renderTabs = () => (
    <div className="mb-4 flex justify-around md:justify-start md:space-x-4 border-b pb-2">
      {tabs.map((tab) => (
        <span
          key={tab}
          onClick={() => setSelectedTab(tab)}
          className={`cursor-pointer px-3 py-1 rounded-full text-sm md:text-base transition-all ${selectedTab === tab ? "bg-teal-100 text-teal-600 font-semibold" : "text-gray-500 hover:bg-gray-100"}`}
        >
          {tab}
        </span>
      ))}
    </div>
  );

  const filteredEmails = selectedTab === 'All Inboxes' ? emails : emails.filter(e => e.subject.toLowerCase().includes(selectedTab.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-gray-200 text-gray-400 px-2 pt-4 flex-col md:flex-row">
      {/* Sidebar */}
      <div className={`md:w-[40%] p-4 border-r border-gray-300 bg-white rounded-2xl md:mr-6 ${selectedEmail && 'hidden md:block'}`}>
        {renderTabs()}

        <div className="mb-4 text-2xl text-gray-400 hidden md:block">Primary</div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full p-2 border border-gray-300 rounded-full pl-10"
          />
        </div>
        <div>
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${selectedEmail?.id === email.id ? "bg-[#15A395] text-white" : "hover:bg-[#f5fffb]"} ${email.unread ? "font-bold" : "font-normal"}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${email.bgColor}`}> 
                  {email.initials} 
                </div>
                <div>
                  <p>{email.name}</p>
                  <p className="text-sm">{email.subject}</p>
                </div>
              </div>
              <span className="text-sm">{email.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div className={`flex-1 mt-6 md:mt-0 ${selectedEmail ? '' : 'hidden md:block'}`}>
        {/* Tabs again for mobile view */}
        <div className="md:hidden px-4">{renderTabs()}</div>

        {/* Back Button for Mobile */}
        {selectedEmail && (
          <div className="md:hidden px-4 mb-2">
            <button
              onClick={() => setSelectedEmail(null)}
              className="flex items-center text-sm text-teal-600 gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 mb-4 px-4">
        <div className="bg-white p-2 rounded-2xl shadow flex flex-wrap gap-2 sm:gap-2 items-center justify-center sm:justify-start">
          <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-full text-sm bg-teal-50 hover:bg-teal-100 text-teal-600 font-medium transition">
            <ArchiveRestore className="h-3 w-3" /> <span className="text-[12px] md:text-sm">Archive</span> 
          </button>
          <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-full text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-medium transition">
            <AlarmClockMinus className="h-3 w-3" /> <span className="text-[12px] md:text-sm"> Snooze </span>
          </button>
          <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-full text-sm bg-red-50 hover:bg-red-100 text-red-600 font-medium transition">
            <Trash2 className="h-3 w-3" /> <span className="text-[12px] md:text-sm"> Delete </span>
          </button>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow flex items-center justify-center">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium transition">
            <User size={18} /> About Lead
          </button>
        </div>
      </div>

        {/* Email Content */}
        <div className="bg-white rounded-2xl p-6 mx-4">
          {selectedEmail ? (
            <>
              <div className="flex items-center mb-4 flex-wrap gap-3 ">
                <div className="flex justify-between gap-6 items-center">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${selectedEmail.bgColor}`}>
                      {selectedEmail.initials}
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <p className="font-bold text-sm sm:text-base leading-tight text-gray-800">{selectedEmail.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">To: support@quickpipe.com</p>
                    </div>
                </div>
                  <span className="text-xs sm:text-sm text-gray-500 ml-auto whitespace-nowrap">{selectedEmail.time}</span>
                </div>

                <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 leading-snug">{selectedEmail.subject}</h2>

                <div className="text-sm md:text-base space-y-2 text-gray-700">
                  <p>Hi Support Team,</p>
                  <p>My name is Alex Carter, and I work as a Sales Representative at Greenfield Solutions. We’re currently exploring tools to help us scale our team operations effectively, particularly in areas like client follow-ups, reporting, and team collaboration.</p>
                  <p>Would it be possible to set up a meeting to discuss this further? I’m generally available on weekdays after 1 PM and can adjust if needed. Looking forward to your insights!</p>
                  <div className="pt-2">
                    <p>Best regards,</p>
                    <p>Alex Carter</p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="px-4 py-2 flex items-center gap-2 bg-[#15A395] text-white text-sm rounded-full shadow hover:bg-teal-600 transition"
                  >
                    <CornerDownLeft className="w-4 h-4" /> Reply
                  </button>
                </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">Select an email to read the content</div>
          )}
        </div>

        {showReplyBox && (
          <div className="bg-white rounded-lg mx-4 mt-3 p-4 relative">
            <button onClick={() => setShowReplyBox(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[100px] outline-none resize-none mt-6"
              placeholder="Write your reply..."
            />
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowReplyBox(false)} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-full flex items-center gap-2">
                <CornerDownLeft className="w-4 h-4" /> Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
