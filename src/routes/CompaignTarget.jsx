import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pause,
  Clock,
  Zap,
  Eye,
  Hand,
  CircleDollarSign,
  CircleCheckBig,
  Ellipsis,
  ArrowDownToLine,
  Share2,
  ListFilter,
  User,
  PhoneIncoming,
  FileMinus,
  MailOpen,
  X,
  ChevronDown,
  Package2,
} from "lucide-react";
import { useCampaignQuery } from "../reactQuery/hooks/useCampaignQuery";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Funnel,
} from "recharts";
import ScheduleForm from "../components/SheduleForm";
import EmailTemplateBuilder from "../components/EmailTemplate";
import { IoClose } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import RichTextEditor from "../components/RichTextEditor";
import { CircleX, Mail } from "lucide-react";

export default function CompaignTarget() {
  // template
  const { getAllTemaplteQuery } = useCampaignQuery();
  const [templateData, setTemplateData] = useState(null);

  const { data: templates, isLoading, error } = getAllTemaplteQuery();

  const { campaignId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const {
    getCampaignLeadsQuery,
    getCampaignSequenceQuery,
    generateEmailWithAI,
    generateSequenceWithAI,
    updateCampaignSequenceMutation,
    generateAIScheduleQuery,
  } = useCampaignQuery();
  const [scheduleMadeByAI, setScheduleMadeByAI] = useState(null);
  const [selectStep, setSelectStep] = useState(null);
  const [steps, setSteps] = useState([]);
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [delay, setDelay] = useState(0);
  const [dropdown2, setdropdown2] = useState(false);
  const [dropdown1, setdropdown1] = useState(false);

  const {
    data: leads, // Now directly the array of leads
    isLoading: isLeadsLoading,
    error: leadsError,
  } = getCampaignLeadsQuery(campaignId);
  const {
    data: campaignSequence,
    isLoading: isSequenceLoading,
    isError: isSequenceError,
    error: sequenceError,
  } = getCampaignSequenceQuery(campaignId);

  const data = [
    {
      name: "SEP",
      sent: 250,
      opens: 200,
      clicks: 150,
      opportunities: 100,
      conversions: 50,
    },
    {
      name: "OCT",
      sent: 150,
      opens: 120,
      clicks: 90,
      opportunities: 60,
      conversions: 30,
    },
    {
      name: "NOV",
      sent: 180,
      opens: 140,
      clicks: 100,
      opportunities: 80,
      conversions: 40,
    },
    {
      name: "DEC",
      sent: 220,
      opens: 170,
      clicks: 130,
      opportunities: 90,
      conversions: 60,
    },
  ];

  // Fetch and populate steps when campaign sequence is available
  useEffect(() => {
    if (campaignSequence?.sequence?.Emails) {
      const emailSteps = campaignSequence.sequence.Emails.map(
        (email, index, arr) => {
          const isFollowUp = email.Subject === "" && index > 0; // No subject and not first email
          return {
            id: index + 1,
            value: isFollowUp
              ? `Follow-up to "${arr[index - 1]?.Name || "Previous Email"}"`
              : email.Name,
            subject: email.Subject,
            body: email.Body,
            delay: email.Delay,
          };
        }
      );

      setSteps(emailSteps);
      setSelectStep(emailSteps[0]?.id);
      setSubject(emailSteps[0]?.subject);
      setContent(emailSteps[0]?.body);
    }
  }, [campaignSequence]);

  // Update step data when subject/content changes
  useEffect(() => {
    if (selectStep !== null) {
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === selectStep ? { ...step, subject, body: content } : step
        )
      );
    }
  }, [subject, content, selectStep]);

  const addSeqStep = () => {
    setSteps([
      ...steps,
      { id: steps.length + 1, value: "", subject: "", body: "" },
    ]);
  };

  const deleteSeqStep = (id) => {
    setSteps(steps.filter((step) => step.id !== id));
    if (selectStep === id) {
      setSelectStep(null);
    }
  };

  const handleEmailSubjectChange = (id, subject) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => (step.id === id ? { ...step, subject } : step))
    );

    if (id === selectStep) {
      setSubject(subject); // Also update subject displayed above editor
    }
  };

  const handleEmailDelayChange = (id, delay) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => (step.id === id ? { ...step, delay } : step))
    );

    if (id === selectStep) {
      setDelay(delay); // Also update subject displayed above editor
    }
  };

  const AddTemplateToStep = (template) => () => {
    const updatedSteps = steps.map((step) => {
      if (step.id === selectStep) {
        return {
          ...step,
          subject: template.Subject,
          body: template.Body,
          value: template.Name,
        };
      }
      return step;
    });
    setSteps(updatedSteps);
    setSubject(template.Subject);
    setContent(template.Body);
    setIsOpen(false);
  };

  const handleSelectSeqStep = (id) => {
    const selectedStep = steps.find((step) => step.id === id);
    if (selectedStep) {
      setSelectStep(id);
      setSubject(selectedStep.subject);
      setContent(selectedStep.body);
    }
  };

  const handleWriteEmailWithAI = () => {
    const emailIndex = selectStep - 1;
    console.log(emailIndex);
    const emailObject = {
      Emails: campaignSequence.sequence.Emails.map((email) => ({
        Name: email.Name,
        Subject: email.Subject,
        Body: email.Body,
      })),
      EmailIndex: emailIndex,
    };

    console.log("Generated Object to Send:", emailObject);

    // Use the mutation hook to generate the email with AI
    generateEmailWithAI.mutate(
      { campaignId, emailData: emailObject },
      {
        onSuccess: (response) => {
          console.log("AI Email generated successfully:", response);

          if (response?.content) {
            const { Subject, Body } = response.content;

            setSteps((prevSteps) =>
              prevSteps.map((step, idx) =>
                idx === emailIndex
                  ? {
                      ...step,
                      subject: Subject ?? step.subject,
                      body: Body ?? step.body,
                    }
                  : step
              )
            );

            if (selectStep - 1 === emailIndex) {
              if (Subject) setSubject(Subject);
              if (Body) setContent(Body);
            }
          }
        },
      }
    );
  };

  const handleWriteFullSequenceWithAI = () => {
    const sequenceData = {
      Emails: steps.map((step) => ({
        Name: step.value || "",
        Subject: step.subject || "",
        Body: step.body || "",
      })),
    };

    console.log("Generated Sequence Object to Send:", sequenceData);

    generateSequenceWithAI.mutate(
      { campaignId, sequenceData },
      {
        onSuccess: (response) => {
          console.log("AI Sequence generated successfully:", response);

          if (response?.content?.length) {
            const updatedSteps = response.content.map((email, index, arr) => {
              return {
                id: index + 1,
                value: email.Name,
                subject: email.Subject,
                body: email.Body,
                delay: email.Delay,
              };
            });

            setSteps(updatedSteps);

            if (updatedSteps.length > 0) {
              setSelectStep(updatedSteps[0].id);
              setSubject(updatedSteps[0].subject);
              setContent(updatedSteps[0].body);
            }
          }
        },
      }
    );
  };

  const handleWriteScheduleWithAI = () => {
    const emailObject = {
      Emails: campaignSequence.sequence.Emails.map((email) => ({
        Name: email.Name,
        Subject: email.Subject,
        Body: email.Body,
        Delay: email.Delay,
      })),
      Leads: leads,
    };

    console.log("Generated Object to Send:", emailObject);

    // Use the mutation hook to generate the email with AI
    generateAIScheduleQuery.mutate(
      { campaignId, data: emailObject },
      {
        onSuccess: (response) => {
          console.log("AI Schedule generated successfully:", response);
          setScheduleMadeByAI(response.content);
        },
      }
    );
  };

  const handleSaveSequence = () => {
    const sequenceData = {
      Emails: steps.map((step) => ({
        Name: step.value || "",
        Subject: step.subject || "",
        Body: step.body || "",
        Delay: step.delay || 0,
      })),
    };

    console.log("Saving Sequence Object:", sequenceData);

    updateCampaignSequenceMutation.mutate(
      { campaignId, sequenceData },
      {
        onSuccess: (response) => {
          console.log("Campaign sequence updated!", response);
        },
      }
    );
  };

  const box = [
    {
      amount: "214",
      icon: <Zap size={24} className="text-blue-500" />,
      text: "Sequence started",
      bg: "bg-blue-100",
    },
    {
      amount: "45%",
      icon: <Eye size={24} className="text-purple-500" />,
      text: "Open rate",
      bg: "bg-purple-100",
    },
    {
      amount: "67%",
      icon: <Hand size={24} className="text-pink-500" />,
      text: "Click rate",
      bg: "bg-pink-100",
    },
    {
      amount: "145",
      icon: <CircleDollarSign size={24} className="text-red-500" />,
      text: "Opportunities",
      bg: "bg-red-100",
    },
    {
      amount: "26",
      icon: <CircleDollarSign size={24} className="text-yellow-500" />,
      text: "Conversion",
      bg: "bg-yellow-100",
    },
  ];

  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  const handleAnother = () => {
    setIsSecondModalOpen(true);
    setIsModalOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("People");

  return (
    <div className="min-h-screen bg-gray-50 pl-4 sm:pl-2 md:pl-2 ">
      <div className="container mx-auto px-2 py-4 sm:py-6 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6">
            <nav className="flex -mb-px overflow-x-auto w-full xl:w-auto scrollbar-hide">
              <div className="flex min-w-max">
                {["Analytics", "People", "Sequence", "Schedule", "Options"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`mr-6 lg:mr-8 py-3 lg:py-4 px-1 border-b-2 cursor-pointer font-medium text-sm lg:text-base whitespace-nowrap transition-colors duration-200 ${
                        activeTab === tab
                          ? "border-[#16C47F] text-[#16C47F]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </nav>
            <div className="flex flex-wrap gap-2 lg:gap-3 w-full xl:w-auto justify-start xl:justify-end">
              {activeTab === "Sequence" && (
                <>
                  <button
                    onClick={handleWriteFullSequenceWithAI}
                    className="bg-gradient-to-br from-green-400 to-orange-500 shrink-0 text-white text-xs sm:text-sm font-semibold border border-gray-400 flex gap-1 items-center rounded-full px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer"
                  >
                    <p className="hidden sm:inline">AI Sequence</p>
                    <p className="sm:hidden">AI</p>
                  </button>
                  <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="border cursor-pointer border-gray-300 flex gap-1 items-center rounded hover:bg-gray-200 px-2 sm:px-2.5 py-1.5"
                  >
                    <Package2
                      size={16}
                      className="text-gray-400 sm:w-5 sm:h-5"
                    />
                  </div>

                  <div className="relative">
                    <div
                      className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform bg-gray-50 w-full sm:w-80 shadow-lg transform ${
                        isOpen ? "translate-x-0" : "translate-x-full"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-base font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                          AI sequence template
                        </h5>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center"
                        >
                          <CircleX size={22} />
                        </button>
                      </div>

                      {isLoading && <p>Loading templates...</p>}
                      {error && (
                        <p className="text-red-500">Failed to load templates</p>
                      )}

                      {templates &&
                        templates?.Templates.map((template) => (
                          <div
                            key={template.id}
                            className="border hover:border-[#16C47F]0 bg-white p-3 rounded-xl mb-3"
                          >
                            <div className="flex items-center gap-1">
                              <Mail size={17} />
                              <p className="py-0 font-medium">
                                {template?.Name}
                              </p>
                            </div>
                            <p className="text-gray-400 text-[15px]">
                              {template?.Body
                                ? template.Body.split(" ")
                                    .slice(0, 10)
                                    .join(" ") + "..."
                                : "No description provided."}
                            </p>

                            <hr className="text-gray-200 py-2" />
                            <button
                              onClick={AddTemplateToStep(template)}
                              className="px-3 py-1 cursor-pointer hover:text-white hover:bg-[#16C47F] rounded-full border border-gray-500"
                            >
                              Use template
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                  {/* <SideDrawer2 isOpen={isOpen} setIsOpen={setIsOpen} /> */}
                </>
              )}

              {activeTab === "Schedule" && (
                <button
                  onClick={handleWriteScheduleWithAI}
                  className="bg-gradient-to-br from-green-400 to-orange-500 shrink-0 text-white text-xs sm:text-sm font-semibold border border-gray-400 flex gap-1 items-center rounded-full px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer"
                >
                  <p className="inline">AI Schedule</p>
                  {/* <p className="sm:hidden">AI</p> */}
                </button>
              )}

              <div className="border border-gray-300 flex gap-1 items-center rounded-full hover:bg-gray-200 px-2 sm:px-2.5 py-1.5">
                <Pause size={16} className="text-gray-400 sm:w-5 sm:h-5" />
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:inline">
                  Pause campaign
                </p>
              </div>

              {activeTab === "Analytics" && (
                <div className="relative dropdown ">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setdropdown2(!dropdown2);
                    }}
                    className="p-2.5 border border-gray-300 cursor-pointer hover:bg-gray-200 text-gray-600 rounded-full flex gap-1 items-center"
                  >
                    <Share2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">
                      Share
                    </span>
                  </button>

                  {dropdown2 && (
                    <div className="absolute border-none outline-none right-0 mt-2 w-40 sm:w-56 bg-white rounded-md shadow-lg z-10 border">
                      <div className="">
                        <ul>
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Newest First
                          </li>
                          <hr className="text-gray-300" />
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Oldest First
                          </li>
                          <hr className="text-gray-300" />
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Name A-Z
                          </li>
                          <hr className="text-gray-300" />
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Name Z-A
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Analytics" && (
                <div className="relative dropdown ">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setdropdown1(!dropdown1);
                    }}
                    className="p-1.5 border border-gray-300 cursor-pointer hover:bg-gray-200 text-gray-600 rounded-full flex gap-1 items-center"
                  >
                    <span className="text-gray-400 text-xs sm:text-sm p-1">
                      Last 4 weeks
                    </span>
                    <ChevronDown className="w-4 h-5" />
                  </button>

                  {dropdown1 && (
                    <div className="absolute border-none outline-none right-0 mt-2 w-40 sm:w-56 bg-white rounded-md shadow-lg z-10 border">
                      <div className="">
                        <ul>
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Newest First
                          </li>
                          <hr className="text-gray-300" />
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Oldest First
                          </li>
                          <hr className="text-gray-300" />
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Name A-Z
                          </li>
                          <hr className="text-gray-300" />
                          <li className="text-gray-400 px-3 py-2 text-xs sm:text-sm font-[450] cursor-pointer hover:text-[#15a395] hover:bg-[#defffcbe]">
                            Name Z-A
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsOpen2(!isOpen2)}
                  className="p-2 border cursor-pointer border-gray-300 text-gray-600 rounded-lg"
                >
                  <Ellipsis />
                </button>
                {isOpen2 && (
                  <div className="absolute z-10 mt-2 right-0 bg-white shadow-md w-40 sm:w-48 rounded-lg">
                    <ul className="py-1 text-xs sm:text-sm text-gray-700">
                      <li className="px-3 py-2 flex text-gray-400 text-xs sm:text-sm gap-2 items-center hover:bg-gray-100">
                        <ArrowDownToLine
                          size={16}
                          className="text-green-500 sm:w-5 sm:h-5"
                        />{" "}
                        <span className="hidden sm:inline">
                          Download Analytics CSV
                        </span>
                        <span className="sm:hidden">Download</span>
                      </li>
                      <li className="px-3 py-2 flex text-gray-400 text-xs sm:text-sm gap-2 items-center hover:bg-gray-100">
                        <Share2 size={16} className="sm:w-5 sm:h-5" />{" "}
                        <span className="hidden sm:inline">Share Campaign</span>
                        <span className="sm:hidden">Share</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          {activeTab == "People" && (
            <div className="flex flex-col xl:flex-row justify-between mb-6 lg:mb-8 gap-4 lg:gap-6">
              <div className="relative w-full xl:w-auto xl:min-w-[320px] xl:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 lg:pl-11 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:border-[#16C47F] text-sm lg:text-base transition-all duration-200"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:gap-3 justify-start xl:justify-end">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-3 lg:px-4 py-2 lg:py-2.5 cursor-pointer border border-gray-300 text-gray-500 rounded-full flex gap-2 items-center text-sm lg:text-base hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ListFilter size={16} className="lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  {isOpen && (
                    <div className="absolute z-10 mt-2 bg-white shadow-lg border border-gray-200 w-44 lg:w-52 rounded-xl overflow-hidden">
                      <ul className="py-2 text-sm lg:text-base text-gray-700">
                        <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                          Newest first
                        </li>
                        <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                          Oldest first
                        </li>
                        <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                          Name A-Z
                        </li>
                        <li className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                          Name Z-A
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center cursor-pointer px-4 lg:px-5 py-2 lg:py-2.5 border border-transparent text-sm lg:text-base font-medium rounded-full shadow-sm text-white bg-[#16C47F] hover:bg-[#FF9D23] focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:ring-offset-2 transition-all duration-200"
                >
                  <User className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden sm:inline">Add lead</span>
                  <span className="sm:hidden">Add</span>
                </button>
                {isModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
                    <div className="w-full max-w-md lg:max-w-lg rounded-xl bg-white p-6 lg:p-8 shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                          Add leads
                        </h3>
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                          <IoClose className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="group hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl p-4 lg:p-5 cursor-pointer">
                          <div className="flex gap-4 items-center">
                            <div className="flex-shrink-0">
                              <FileMinus className="text-green-500 h-6 w-6" />
                            </div>
                            <div className="border-l border-gray-200 h-8"></div>
                            <div>
                              <p className="text-gray-500 text-sm">Upload</p>
                              <p className="font-semibold text-base lg:text-lg">
                                CSV
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="group hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl p-4 lg:p-5 cursor-pointer">
                          <div className="flex gap-4 items-center">
                            <div className="flex-shrink-0">
                              <FileMinus className="text-green-500 h-6 w-6" />
                            </div>
                            <div className="border-l border-gray-200 h-8"></div>
                            <div>
                              <p className="text-gray-500 text-sm">Use</p>
                              <p className="font-semibold text-base lg:text-lg">
                                AI lead Finder
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="group hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl p-4 lg:p-5 cursor-pointer">
                          <div
                            onClick={handleAnother}
                            className="flex gap-4 items-center"
                          >
                            <div className="flex-shrink-0">
                              <MailOpen className="text-blue-500 h-6 w-6" />
                            </div>
                            <div className="border-l border-gray-200 h-8"></div>
                            <div>
                              <p className="text-gray-500 text-sm">Enter</p>
                              <p className="font-semibold text-base lg:text-lg">
                                Email Manually
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="group hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl p-4 lg:p-5 cursor-pointer">
                          <div className="flex gap-4 items-center">
                            <div className="flex-shrink-0">
                              <FcGoogle className="h-6 w-6" />
                            </div>
                            <div className="border-l border-gray-200 h-8"></div>
                            <div>
                              <p className="text-gray-500 text-sm">Use</p>
                              <p className="font-semibold text-base lg:text-lg">
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
                  <div className="fixed inset-0 flex items-center justify-center bg-[#3a3939a3] bg-opacity-50 p-4 z-50">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-semibold inline-flex gap-1">
                          {" "}
                          <User className="text-gray-300" /> Add new lead
                        </h3>
                        <button onClick={() => setIsSecondModalOpen(false)}>
                          <IoClose className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
                        </button>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm sm:text-base">lead owner</p>
                        <div className="bg-gray-200 w-fit rounded-full px-2 flex gap-2 items-center my-2 border border-gray-300">
                          <img
                            src="https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover "
                            alt=""
                          />
                          <span className="text-sm sm:text-base">
                            Beetao lenu
                          </span>
                        </div>
                        <p className="bg-gray-200 rounded p-1 text-sm sm:text-base">
                          Personal Information
                        </p>
                        <form className="space-y-3 sm:space-y-4" action="#">
                          <div className="flex flex-col sm:flex-row gap-2 my-2">
                            <div className="w-full sm:w-72">
                              <label
                                for="email"
                                className="block mb-2 text-xs sm:text-sm font-medium text-gray-900"
                              >
                                First Name
                              </label>
                              <input
                                type="email"
                                name="email"
                                id="email"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                                placeholder="name@company.com"
                                required
                              />
                            </div>
                            <div className="w-full sm:w-72">
                              <label
                                for="password"
                                className="block mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Lead Status
                              </label>
                              <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                                required
                              />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="w-full sm:w-72">
                              <label
                                for="email"
                                className="block mb-2 text-xs sm:text-sm font-medium text-gray-900"
                              >
                                Last Name
                              </label>
                              <input
                                type="email"
                                name="email"
                                id="email"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                                placeholder="name@company.com"
                                required
                              />
                            </div>
                            <div className="w-full sm:w-72">
                              <label
                                for="password"
                                className="block mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Email
                              </label>
                              <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                                required
                              />
                            </div>
                          </div>
                          <div className="w-full sm:w-72">
                            <label
                              for="password"
                              className="block mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Phone Number
                            </label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              placeholder="••••••••"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                              required
                            />
                          </div>
                          <p className="bg-gray-200 rounded p-1 text-sm sm:text-base">
                            Company Information
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="w-full sm:w-72">
                              <label
                                for="email"
                                className="block mb-2 text-xs sm:text-sm font-medium text-gray-900"
                              >
                                Company
                              </label>
                              <input
                                type="email"
                                name="email"
                                id="email"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                                placeholder="name@company.com"
                                required
                              />
                            </div>
                            <div className="w-full sm:w-72">
                              <label
                                for="password"
                                className="block mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Website
                              </label>
                              <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg block w-full p-2.5 focus:border-green-500 focus:bg-green-100 focus:outline-none "
                                required
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            class="text-white bg-blue-700 cursor-pointer hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2.5 me-2 mb-2"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
                <button className="bg-gradient-to-br from-green-400 to-orange-500 border-none shrink-0 text-white text-sm lg:text-base font-semibold flex gap-2 items-center rounded-full px-4 lg:px-5 py-2 lg:py-2.5 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  <PhoneIncoming size={16} className="lg:w-5 lg:h-5" />
                  <p className="hidden sm:inline">Call with AI</p>
                  <p className="sm:hidden">Call</p>
                </button>
              </div>
            </div>
          )}

          {/* Analytics Grid */}
          {activeTab === "Analytics" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 w-full mb-8">
                {box.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl px-4 lg:px-5 py-5 lg:py-6 flex items-center gap-3 lg:gap-4 bg-white hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className={`p-3 lg:p-4 rounded-xl ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                        {item.amount}
                      </div>
                      <div className="text-sm lg:text-base text-gray-500 mt-1">
                        {item.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-8 shadow-sm">
                <div className="h-[300px] sm:h-[350px] lg:h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{
                        top: 20,
                        right: window.innerWidth < 640 ? 10 : 30,
                        left: window.innerWidth < 640 ? 0 : 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        stroke="#6B7280"
                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                      />
                      <YAxis
                        stroke="#6B7280"
                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          padding: "12px",
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="conversions"
                        stackId="a"
                        fill="#6366f1"
                        radius={[0, 0, 0, 0]}
                        barSize={window.innerWidth < 640 ? 25 : 50}
                      />
                      <Bar
                        dataKey="opportunities"
                        stackId="a"
                        fill="#8b5cf6"
                        radius={[0, 0, 0, 0]}
                        barSize={window.innerWidth < 640 ? 25 : 50}
                      />
                      <Bar
                        dataKey="clicks"
                        stackId="a"
                        fill="#ec4899"
                        radius={[0, 0, 0, 0]}
                        barSize={window.innerWidth < 640 ? 25 : 50}
                      />
                      <Bar
                        dataKey="opens"
                        stackId="a"
                        fill="#f59e0b"
                        radius={[0, 0, 0, 0]}
                        barSize={window.innerWidth < 640 ? 25 : 50}
                      />
                      <Bar
                        dataKey="sent"
                        stackId="a"
                        fill="#10b981"
                        radius={[2, 2, 0, 0]}
                        barSize={window.innerWidth < 640 ? 25 : 50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 w-full">
            {activeTab === "People" && (
              <div className="col-span-full w-full">
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-4">
                  {leads?.map((person, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {person.Name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {person.Email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {person.provider === "Microsoft" ? (
                            <div className="flex items-center">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 21 21"
                                fill="none"
                              >
                                <path d="M10 1H1V10H10V1Z" fill="#F25022" />
                                <path d="M20 1H11V10H20V1Z" fill="#7FBA00" />
                                <path d="M10 11H1V20H10V11Z" fill="#00A4EF" />
                                <path d="M20 11H11V20H20V11Z" fill="#FFB900" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <svg viewBox="0 0 24 24" width="16" height="16">
                                <path
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  fill="#4285F4"
                                />
                                <path
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  fill="#34A853"
                                />
                                <path
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  fill="#FBBC05"
                                />
                                <path
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  fill="#EA4335"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CircleCheckBig size={12} className="text-blue-500" />
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            Verified
                          </span>
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Not contacted
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Company: </span>
                          <span className="text-gray-900">
                            {person.Company}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Website: </span>
                          <span className="text-blue-500">
                            {person.Website}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Title: </span>
                          <span className="text-gray-900">{person.Title}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-[1000px]">
                    <table className="w-full table-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr className="border-none text-sm text-gray-500">
                          <th className="px-6 py-4 text-left font-medium w-[50px]">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[200px]">
                            EMAIL
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[150px]">
                            CONTACT
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[150px]">
                            EMAIL PROVIDER
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[250px]">
                            STATUS
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[180px]">
                            COMPANY
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[180px]">
                            WEBSITE
                          </th>
                          <th className="px-6 py-4 text-left font-medium min-w-[150px]">
                            TITLE
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {leads?.map((person, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 text-gray-900 font-medium">
                              {person.Email}
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              {person.Name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {person.provider === "Microsoft" ? (
                                  <>
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 21 21"
                                      fill="none"
                                    >
                                      <path
                                        d="M10 1H1V10H10V1Z"
                                        fill="#F25022"
                                      />
                                      <path
                                        d="M20 1H11V10H20V1Z"
                                        fill="#7FBA00"
                                      />
                                      <path
                                        d="M10 11H1V20H10V11Z"
                                        fill="#00A4EF"
                                      />
                                      <path
                                        d="M20 11H11V20H20V11Z"
                                        fill="#FFB900"
                                      />
                                    </svg>
                                    <span>Microsoft</span>
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="20"
                                      height="20"
                                    >
                                      <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                      />
                                      <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                      />
                                      <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                      />
                                      <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                      />
                                    </svg>
                                    <span>Google</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2 bg-blue-100 rounded-full px-3 py-1 w-fit">
                                  <CircleCheckBig
                                    size={14}
                                    className="text-blue-500"
                                  />
                                  <span className="text-blue-600 text-sm font-medium">
                                    Verified
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <Clock size={14} />
                                  <span className="text-sm">Not contacted</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              {person.Company}
                            </td>
                            <td className="px-6 py-4 text-blue-600 hover:text-blue-800 cursor-pointer">
                              {person.Website}
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              {person.Title}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Sequence" && (
              <div className="col-span-full w-full">
                <div className="flex flex-col xl:flex-row min-h-screen bg-white rounded-xl  overflow-hidden">
                  {/* Sidebar */}
                  <div className="w-full xl:w-80 p-4 lg:p-6 flex flex-col gap-4 border-b xl:border-b-0 xl:border-r border-gray-200 bg-gray-50">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => handleSelectSeqStep(step.id)}
                        className={`p-4 lg:p-5 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                        ${
                          selectStep === step.id
                            ? "border-green-500 bg-green-50 shadow-md"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-semibold text-base lg:text-lg truncate mr-2">
                            {step.value || `Step ${step.id}`}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSeqStep(step.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <hr className="my-3 border-gray-200" />
                        <input
                          type="text"
                          value={step.subject}
                          onChange={(e) =>
                            handleEmailSubjectChange(step.id, e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:border-[#16C47F] transition-all duration-200"
                          placeholder={`Step ${step.id} Subject`}
                        />
                        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                          <span>Delay:</span>
                          <input
                            type="number"
                            value={step.delay}
                            onChange={(e) =>
                              handleEmailDelayChange(step.id, e.target.value)
                            }
                            className="w-16 px-2 py-1 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:border-[#16C47F]"
                            min="0"
                          />
                          <span>days</span>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addSeqStep}
                      className="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Add step</span>
                    </button>
                  </div>

                  {/* Main Editor */}
                  <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <div className="max-w-full xl:max-w-4xl mx-auto">
                      {/* Subject and Action Buttons */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                        <div className="text-gray-700 text-sm lg:text-base">
                          <span className="font-medium">Subject: </span>
                          <span className="break-words text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                            {subject || "No Subject"}
                          </span>
                        </div>
                        <div className="flex gap-3 shrink-0">
                          <button className="px-4 py-2 border border-[#16C47F] text-[#16C47F] hover:bg-[#16C47F] text-sm rounded-lg flex items-center gap-2 transition-colors duration-200">
                            <Eye size={16} />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button className="p-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Rich Text Editor */}
                      <div className="mb-6">
                        <RichTextEditor
                          value={content}
                          onChange={setContent}
                          height={window.innerWidth < 768 ? "350px" : "450px"}
                          placeholder="Start writing your email content..."
                          mobile={window.innerWidth < 768}
                          showAiButton={true}
                          onAiButtonClick={handleWriteEmailWithAI}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveSequence}
                          className="flex items-center bg-[#16C47F] hover:bg-[#FF9D23]  text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16C47F] focus:ring-offset-2 text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          💾 Save Sequence
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "Schedule" && (
              <div className="col-span-full w-full overflow-x-auto">
                <main className="min-h-screen bg-gray-50 py-8">
                  {/* <ScheduleForm campaignId={campaignId} /> */}
                  <ScheduleForm
                    campaignId={campaignId}
                    newSchedulesData={scheduleMadeByAI}
                  />
                </main>
              </div>
            )}
            {activeTab === "Options" && (
              <div className="col-span-full w-full overflow-x-auto">
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full max-w-4xl mx-auto bg-white my-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        Owner of Campaign
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                        Select the owner of this campaign
                      </p>
                    </div>
                    <div className="border border-gray-50 px-3 py-1 rounded text-sm">
                      Select
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        Daily Limit
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Max number of emails to send per day for this campaign
                      </p>
                    </div>
                    <div className="border border-gray-200 ps-2 pe-6 sm:pe-10 py-1 rounded w-full sm:w-36 text-sm">
                      50
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        Max new leads per day
                      </h3>
                    </div>
                    <div className="border border-gray-200 ps-2 pe-6 sm:pe-10 py-1 rounded w-full sm:w-36 text-sm">
                      No limit
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full max-w-4xl mx-auto bg-white my-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base">
                        Stop campaign for company on reply
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                        Stop the campaign automatically for all leads from a
                        company if a reply is received from any of them.
                      </p>
                    </div>
                    <label class="inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" value="" class="sr-only peer" />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base">
                        Stop sending emails on Auto-reply
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Stop sending emails to a lead if a response has been
                        received
                      </p>
                    </div>
                    <label class="inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" value="" class="sr-only peer" />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base">
                        Open tracking
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Track email opens
                      </p>
                    </div>
                    <label class="inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" value="" class="sr-only peer" />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base">
                        Insert unsubscribe to link header
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Automatically adds an unsubscribe link to email headers
                        for on-click unsubscription by supported email providers
                      </p>
                    </div>
                    <label class="inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" value="" class="sr-only peer" />
                      <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full max-w-4xl mx-auto bg-white my-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base">CC</h3>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                        Send a copy of the email to the addresses listed in the
                        field
                      </p>
                    </div>
                    <input
                      type="text"
                      className="w-full sm:w-80 px-3 sm:px-10 py-2 border border-gray-500 rounded text-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 my-2 gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base">
                        BCC
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm w-full sm:w-48">
                        Send a copy of the email to certain recipients without
                        the other recipients knowing about it
                      </p>
                    </div>
                    <input
                      type="text"
                      className="w-full sm:w-80 px-3 sm:px-10 py-2 border border-gray-500 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
