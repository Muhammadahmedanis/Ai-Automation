import { useEffect, useState } from "react";
import { ChevronDown, Eye, Share2, Plus, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { useCampaignQuery } from "../reactQuery/hooks/useCampaignQuery";

export default function EmailTemplateBuilder({ campaignId }) {
  const { getCampaignSequenceQuery, generateEmailWithAI } = useCampaignQuery();
  const [selectStep, setSelectStep] = useState(null);
  const [steps, setSteps] = useState([]);
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");

  const {
    data: campaignSequence,
    isLoading: isSequenceLoading,
    isError: isSequenceError,
    error: sequenceError,
  } = getCampaignSequenceQuery(campaignId);

  // Fetch and populate steps when campaign sequence is available
  useEffect(() => {
    if (campaignSequence?.sequence?.Emails) {
      const emailSteps = campaignSequence.sequence.Emails.map(
        (email, index, arr) => {
          const isFollowUp = !email.Subject && index > 0; // No subject and not first email
          return {
            id: index + 1,
            value: isFollowUp
              ? `Follow-up to "${arr[index - 1]?.Name || "Previous Email"}"`
              : email.Name,
            subject: email.Subject,
            body: email.Body,
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
    if (steps.length < 3) {
      setSteps([
        ...steps,
        { id: steps.length + 1, value: "", subject: "", body: "" },
      ]);
    }
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
    generateEmailWithAI(
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

  // --- LOADING & ERROR UI Improvements ---

  if (isSequenceLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-gray-500 text-lg animate-pulse">
          Loading campaign sequence...
        </div>
      </div>
    );
  }

  if (isSequenceError) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-red-500 font-semibold">
          Error: {sequenceError.message}
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 p-4 flex flex-col gap-4">
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => handleSelectSeqStep(step.id)}
            className={`p-4 border rounded-lg cursor-pointer 
              ${
                selectStep === step.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-white"
              }`}
          >
            <div className="flex justify-between items-center my-2">
              <p className="font-semibold">{step.value}</p>
              <button
                onClick={() => deleteStep(step.id)}
                className="text-red-500 ml-2 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <hr className="my-2 text-gray-300" />
            <input
              type="text"
              value={step.subject}
              onChange={(e) => handleEmailSubjectChange(step.id, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16C47F]"
              placeholder={`Step ${step.id}`}
            />
          </div>
        ))}

        <button
          onClick={addStep}
          disabled={steps.length >= 3}
          className="w-full py-2 border border-gray-300 rounded-full flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 transition-colors border-dashed"
        >
          <Plus size={16} />
          <span className="cursor-pointer">Add step</span>
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 border-l border-gray-200 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Subject and Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-700 text-sm">
              <span className="font-medium">Subject: </span>
              {subject || "No Subject"}
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-[#16C47F] text-[#16C47F]  hover:bg-[#FF9D23] text-sm rounded flex items-center gap-1">
                <Eye size={16} />
                <span>Preview</span>
              </button>
              <button className="p-2 border border-gray-300 text-gray-500 rounded hover:bg-gray-100">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="mb-6">
            <RichTextEditor
              value={content}
              onChange={setContent}
              height="400px"
              placeholder="Start writing your email content..."
              showAiButton={true}
              onAiButtonClick={handleWriteEmailWithAI}
            />
          </div>

          <div className="mt-6">
            <button className="bg-[#16C47F] hover:bg-[#FF9D23] text-white px-6 py-1.5 rounded-full text-[15px]">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
