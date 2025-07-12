import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
  User,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../api/axios";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm your AI CRM assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [companies, setCompanies] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch companies when chatbot opens
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/lead/GetAllLeads");
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.leads)
      ) {
        // Group leads by company
        const groupedLeads = response.data.leads.reduce((acc, lead) => {
          const companyName = lead.Company || "Unassigned";
          if (!acc[companyName]) {
            acc[companyName] = {
              name: companyName,
              leads: [],
              location: lead.Location || "Not specified",
              website: lead.Website || "Not specified",
              industry: lead.Industry || "Not specified",
              source: lead.Source || "Not specified",
            };
          }
          acc[companyName].leads.push(lead);
          return acc;
        }, {});
        const companiesArray = Object.values(groupedLeads);
        setCompanies(companiesArray);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  // --- CRM logic, with fallback to LLM ---
  const generateBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    // CRM-specific logic (same as before)
    const companyKeywords = [
      "company",
      "tell me about",
      "what about",
      "background of",
      "history of",
      "information about",
      "show me",
      "find",
    ];
    const isAskingAboutCompany = companyKeywords.some((keyword) =>
      input.includes(keyword)
    );
    let aiSummary = null;
    let companyQuery = null;
    let potentialCompanyName = null;
    if (isAskingAboutCompany) {
      // Extract potential company name from the query
      const words = input.split(" ");
      const stopWords = [
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "me",
        "you",
        "your",
        "crm",
        "database",
        "tell",
        "about",
        "show",
        "find",
        "information",
        "background",
        "history",
      ];

      // First, try to find exact company matches in the query
      for (const company of companies) {
        const companyNameLower = company.name.toLowerCase();
        if (input.includes(companyNameLower)) {
          potentialCompanyName = company.name;
          break;
        }
      }

      // If no exact match found, try to extract from words
      if (!potentialCompanyName) {
        for (let i = words.length - 1; i >= 0; i--) {
          const word = words[i].toLowerCase();
          if (
            word.length > 2 &&
            !companyKeywords.includes(word) &&
            !stopWords.includes(word)
          ) {
            potentialCompanyName = words[i];
            break;
          }
        }
      }
      if (potentialCompanyName) {
        companyQuery = companies.find((company) => {
          const companyNameLower = company.name.toLowerCase();
          const searchTermLower = potentialCompanyName.toLowerCase();

          // Exact match
          if (companyNameLower === searchTermLower) return true;

          // Partial match (company name contains search term or vice versa)
          if (
            companyNameLower.includes(searchTermLower) ||
            searchTermLower.includes(companyNameLower)
          )
            return true;

          // Word-based matching for multi-word company names
          const companyWords = companyNameLower.split(/\s+/);
          const searchWords = searchTermLower.split(/\s+/);

          // Check if any search word matches any company word
          return searchWords.some((searchWord) =>
            companyWords.some(
              (companyWord) =>
                companyWord.startsWith(searchWord) ||
                searchWord.startsWith(companyWord) ||
                companyWord === searchWord
            )
          );
        });
        if (companyQuery) {
          // Fetch AI summary from OpenAI
          let botReply = "";
          try {
            const aiRes = await axios.post("http://localhost:4000/api/chat", {
              message: `Tell me about the company ${companyQuery.name}`,
            });
            aiSummary = aiRes.data.reply;
          } catch (err) {
            aiSummary = null;
          }
          // Compose CRM info
          const leadCount = companyQuery.leads.length;
          const activeLeads = companyQuery.leads.filter(
            (lead) => lead.Status && lead.Status !== "Closed"
          );
          const statuses = [
            ...new Set(
              companyQuery.leads.map((lead) => lead.Status).filter(Boolean)
            ),
          ];
          const totalValue = companyQuery.leads.reduce(
            (sum, lead) => sum + (parseFloat(lead.Amount) || 0),
            0
          );
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentLeads = companyQuery.leads.filter(
            (lead) => lead.createdAt && new Date(lead.createdAt) > thirtyDaysAgo
          );
          const oldestLead = companyQuery.leads[companyQuery.leads.length - 1];
          const latestLead = companyQuery.leads[0];
          const firstContactDate = oldestLead?.createdAt
            ? new Date(oldestLead.createdAt).toLocaleDateString()
            : "Unknown";
          const industryInfo =
            companyQuery.industry !== "Not specified"
              ? `Industry: ${companyQuery.industry}. `
              : "";
          const sourceInfo =
            companyQuery.source !== "Not specified"
              ? `Lead source: ${companyQuery.source}. `
              : "";
          const engagementSummary =
            activeLeads.length > 0
              ? `Active opportunities: ${activeLeads.length}. `
              : "";
          const valueInfo =
            totalValue > 0
              ? `Total pipeline value: $${totalValue.toLocaleString()}. `
              : "";
          const recentActivity =
            recentLeads.length > 0
              ? `Recent activity: ${recentLeads.length} new contact(s) in the last 30 days. `
              : "";
          // Compose final content
          let content = "";
          if (aiSummary) {
            content += aiSummary + "\n\n";
          }
          content += `This company exists in your CRM. It has ${leadCount} contact(s) with ${activeLeads.length} active opportunities. See details below.`;
          return {
            content,
            companyInfo: {
              name: companyQuery.name,
              background: `${
                companyQuery.name
              } has been in your CRM since ${firstContactDate}. ${industryInfo}${sourceInfo}${
                companyQuery.location !== "Not specified"
                  ? `Located in ${companyQuery.location}. `
                  : ""
              }${
                companyQuery.website !== "Not specified"
                  ? `Website: ${companyQuery.website}. `
                  : ""
              }${engagementSummary}${valueInfo}${recentActivity}Current lead statuses: ${
                statuses.length > 0 ? statuses.join(", ") : "No status assigned"
              }. ${
                latestLead
                  ? `Latest contact: ${latestLead.Name} (${latestLead.Email})`
                  : ""
              }`,
            },
          };
        }
      }
    }
    // Direct company match
    companyQuery = companies.find((company) => {
      const companyNameLower = company.name.toLowerCase();
      const inputClean = input.replace(/[^a-zA-Z0-9\s]/g, "").trim();
      if (inputClean === companyNameLower) return true;
      if (inputClean.includes(companyNameLower)) return true;
      if (companyNameLower.includes(inputClean)) return true;
      const companyWords = companyNameLower.split(/\s+/);
      const inputWords = inputClean.split(/\s+/);
      return inputWords.some((inputWord) =>
        companyWords.some(
          (companyWord) =>
            companyWord.startsWith(inputWord) ||
            inputWord.startsWith(companyWord)
        )
      );
    });
    if (companyQuery) {
      const leadCount = companyQuery.leads.length;
      const latestLead = companyQuery.leads[0];
      const statuses = [
        ...new Set(
          companyQuery.leads.map((lead) => lead.Status).filter(Boolean)
        ),
      ];
      const activeLeads = companyQuery.leads.filter(
        (lead) => lead.Status && lead.Status !== "Closed"
      );
      const closedLeads = companyQuery.leads.filter(
        (lead) => lead.Status === "Closed"
      );
      const totalValue = companyQuery.leads.reduce(
        (sum, lead) => sum + (parseFloat(lead.Amount) || 0),
        0
      );
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentLeads = companyQuery.leads.filter(
        (lead) => lead.createdAt && new Date(lead.createdAt) > thirtyDaysAgo
      );
      const oldestLead = companyQuery.leads[companyQuery.leads.length - 1];
      const firstContactDate = oldestLead?.createdAt
        ? new Date(oldestLead.createdAt).toLocaleDateString()
        : "Unknown";
      const industryInfo =
        companyQuery.industry !== "Not specified"
          ? `Industry: ${companyQuery.industry}. `
          : "";
      const sourceInfo =
        companyQuery.source !== "Not specified"
          ? `Lead source: ${companyQuery.source}. `
          : "";
      const engagementSummary =
        activeLeads.length > 0
          ? `Active opportunities: ${activeLeads.length}. `
          : "";
      const valueInfo =
        totalValue > 0
          ? `Total pipeline value: $${totalValue.toLocaleString()}. `
          : "";
      const recentActivity =
        recentLeads.length > 0
          ? `Recent activity: ${recentLeads.length} new contact(s) in the last 30 days. `
          : "";
      return {
        content: `I found comprehensive information about ${companyQuery.name}. This company has ${leadCount} contact(s) in your CRM with ${activeLeads.length} active opportunities.`,
        companyInfo: {
          name: companyQuery.name,
          background: `${
            companyQuery.name
          } has been in your CRM since ${firstContactDate}. ${industryInfo}${sourceInfo}${
            companyQuery.location !== "Not specified"
              ? `Located in ${companyQuery.location}. `
              : ""
          }${
            companyQuery.website !== "Not specified"
              ? `Website: ${companyQuery.website}. `
              : ""
          }${engagementSummary}${valueInfo}${recentActivity}Current lead statuses: ${
            statuses.length > 0 ? statuses.join(", ") : "No status assigned"
          }. ${
            latestLead
              ? `Latest contact: ${latestLead.Name} (${latestLead.Email})`
              : ""
          }`,
        },
      };
    }
    // General company queries
    if (
      input.includes("company") ||
      input.includes("background") ||
      input.includes("history") ||
      input.includes("tell me about")
    ) {
      if (companies.length === 0) {
        return {
          content:
            "I don't have any company information available right now. Please try again in a moment.",
          companyInfo: null,
        };
      }
      const companyNames = companies.map((c) => c.name).join(", ");
      return {
        content: `I can provide information about companies in your CRM. Available companies: ${companyNames}. Try asking about a specific company like "Tell me about [company name]" or "What's the background of [company name]?"`,
        companyInfo: null,
      };
    }
    if (input.includes("lead") || input.includes("contact")) {
      const totalLeads = companies.reduce(
        (sum, company) => sum + company.leads.length,
        0
      );
      const activeLeads = companies.reduce(
        (sum, company) =>
          sum +
          company.leads.filter(
            (lead) => lead.Status && lead.Status !== "Closed"
          ).length,
        0
      );
      return {
        content: `I can help you manage leads and contacts. You currently have ${totalLeads} total contacts across ${companies.length} companies, with ${activeLeads} active opportunities. You can view all leads in the "People" tab, or organize them by company in the "Accounts" tab. Would you like me to show you how to add a new lead?`,
        companyInfo: null,
      };
    }
    if (
      input.includes("opportunity") ||
      input.includes("deal") ||
      input.includes("pipeline")
    ) {
      const totalValue = companies.reduce(
        (sum, company) =>
          sum +
          company.leads.reduce(
            (companySum, lead) => companySum + (parseFloat(lead.Amount) || 0),
            0
          ),
        0
      );
      const stageCounts = companies.reduce((acc, company) => {
        company.leads.forEach((lead) => {
          if (lead.Status) {
            acc[lead.Status] = (acc[lead.Status] || 0) + 1;
          }
        });
        return acc;
      }, {});
      const stageInfo = Object.entries(stageCounts)
        .map(([stage, count]) => `${stage}: ${count}`)
        .join(", ");
      return {
        content: `The Opportunities tab shows your sales pipeline with different stages: Discovery, Evaluation, Proposal, Negotiation, Commit, and Closed. You can drag and drop leads between stages to update their status. Current pipeline: ${stageInfo}. Total pipeline value: $${totalValue.toLocaleString()}.`,
        companyInfo: null,
      };
    }
    if (input.includes("call") || input.includes("phone")) {
      return {
        content:
          'You can view all your calls in the "Calls" tab. This shows call history, duration, and notes. You can also schedule new calls or view call analytics.',
        companyInfo: null,
      };
    }
    if (input.includes("meeting") || input.includes("appointment")) {
      return {
        content:
          'The "Meetings" tab contains all scheduled meetings, their details, and meeting links. You can also schedule new meetings with your contacts.',
        companyInfo: null,
      };
    }
    if (input.includes("email") || input.includes("inbox")) {
      return {
        content:
          'The "Inbox" tab contains all your email communications. You can view, reply to, and manage your email conversations with leads and contacts.',
        companyInfo: null,
      };
    }
    if (input.includes("help") || input.includes("how")) {
      return {
        content:
          "I can help you with:\n• Managing leads and contacts\n• Tracking opportunities and deals\n• Viewing call and meeting history\n• Managing your email inbox\n• Understanding your CRM workflow\n• Company background information\n\nJust ask me about any of these topics!",
        companyInfo: null,
      };
    }
    if (input.includes("hello") || input.includes("hi")) {
      return {
        content:
          "Hello! I'm here to help you with your CRM tasks. You can ask me about leads, opportunities, calls, meetings, company backgrounds, or anything else related to your customer relationships.",
        companyInfo: null,
      };
    }
    // --- Fallback to LLM (OpenAI) ---
    // Use full backend URL to avoid 404 errors if proxy is not set up
    let botReply = "Error: Unable to get response from AI.";
    try {
      const res = await axios.post("http://localhost:4000/api/chat", {
        message: userInput,
      });
      botReply = res.data.reply;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        botReply =
          "Unauthorized: The backend rejected the request. Please ensure /api/chat is not protected by authentication.";
      } else if (err.response && err.response.status === 404) {
        botReply =
          "Not Found: The backend /api/chat route is missing. Please check backend setup.";
      } else if (err.code === "ECONNREFUSED") {
        botReply =
          "Connection refused: Backend server is not running or not reachable.";
      } else {
        botReply = "Error: Unable to get response from AI.";
      }
    }
    return { content: botReply, companyInfo: null };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    const botResponse = await generateBotResponse(inputMessage);
    const botMessage = {
      id: Date.now() + 1,
      type: "bot",
      content: botResponse.content,
      companyInfo: botResponse.companyInfo,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMaximized(false);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMaximized
          ? "bottom-24 right-6 w-96 h-[480px]"
          : "bottom-20 right-6 w-80 h-[400px]"
      }`}
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-t-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">AI CRM Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMaximize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="bg-white flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.type === "user"
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {message.type === "user" ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.type === "user"
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.companyInfo && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {message.companyInfo.name === "Company Not Found"
                            ? "Company Not Found"
                            : message.companyInfo.name ===
                              "Multiple Companies Found"
                            ? "Multiple Companies Found"
                            : "Company Background"}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {message.companyInfo.background}
                        </p>
                        {message.companyInfo.name !== "Company Not Found" &&
                          message.companyInfo.name !==
                            "Multiple Companies Found" && (
                            <Link
                              to={`/Accounts/${encodeURIComponent(
                                message.companyInfo.name
                              )}`}
                              className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                            >
                              <ExternalLink size={12} />
                              View Company Details
                            </Link>
                          )}
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-teal-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-full bg-gray-100">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
