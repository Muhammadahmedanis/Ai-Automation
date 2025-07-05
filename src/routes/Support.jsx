import {
  CloudUpload,
  Bug,
  Lightbulb,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useWorkspaceQuery } from "../reactQuery/hooks/useWorkspaceQuery";
import { BiLoaderCircle } from "react-icons/bi";

const Support = () => {
  const { helpDeskMutation } = useWorkspaceQuery();
  const [formData, setFormData] = useState({
    Type: "",
    Subject: "",
    Message: "",
    Attachment: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestTypes = [
    {
      value: "bug",
      label: "Bug Report",
      icon: Bug,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      value: "feature",
      label: "Feature Request",
      icon: Lightbulb,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      value: "feedback",
      label: "Feedback",
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Type) {
      newErrors.Type = "Please select a request type";
    }
    if (!formData.Subject.trim()) {
      newErrors.Subject = "Subject is required";
    }
    if (!formData.Message.trim()) {
      newErrors.Message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTypeChange = (Type) => {
    setFormData((prevData) => ({
      ...prevData,
      Type: prevData.Type === Type ? "" : Type,
    }));
    // Clear error when user selects a type
    if (errors.Type) {
      setErrors((prev) => ({ ...prev, Type: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, Attachment: e.target.files[0] });
  };

  const handleFileClick = () => {
    document.getElementById("file-upload").click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("Type", formData.Type);
    formDataToSend.append("Subject", formData.Subject);
    formDataToSend.append("Message", formData.Message);
    if (formData.Attachment) {
      formDataToSend.append("Attachment", formData.Attachment);
    }

    helpDeskMutation.mutate(formDataToSend, {
      onSuccess: () => {
        setFormData({
          Type: "",
          Subject: "",
          Message: "",
          Attachment: null,
        });
        setErrors({});
        setIsSubmitted(true);
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      },
      onError: (error) => {
        console.error("Error submitting support request:", error);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex justify-center items-start">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-2xl p-8 mt-2">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#16C47F] rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Desk</h1>
          <p className="text-gray-600 text-lg">
            We're here to help! Submit bugs, feature requests, and feedback.
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-700 font-medium">
              Your request has been submitted successfully! We'll get back to
              you soon.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              What can we help you with?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requestTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = formData.Type === type.value;
                return (
                  <label
                    key={type.value}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? `border-teal-500 ${type.bgColor} shadow-md`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="Type"
                      value={type.value}
                      checked={isSelected}
                      onChange={() => handleTypeChange(type.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <IconComponent
                        className={`w-8 h-8 mb-3 ${
                          isSelected ? type.color : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isSelected ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        {type.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.Type && (
              <div className="mt-2 flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">{errors.Type}</span>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Subject"
              value={formData.Subject}
              onChange={handleInputChange}
              placeholder="Brief description of your issue or request"
              className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.Subject
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus:bg-white"
              }`}
            />
            {errors.Subject && (
              <div className="mt-2 flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">{errors.Subject}</span>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="Message"
              value={formData.Message}
              onChange={handleInputChange}
              placeholder="Please provide detailed information about your request..."
              rows="6"
              className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none ${
                errors.Message
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus:bg-white"
              }`}
            />
            <div className="mt-1 flex justify-between items-center">
              {errors.Message ? (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{errors.Message}</span>
                </div>
              ) : (
                <div></div>
              )}
              <span className="text-sm text-gray-500">
                {formData.Message.length}/1000
              </span>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Attachment (Optional)
            </label>
            <div
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 hover:border-teal-400 hover:bg-teal-50"
              onClick={handleFileClick}
            >
              <div className="flex flex-col items-center">
                <CloudUpload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>
            </div>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
            {formData.Attachment && (
              <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
                <span className="text-teal-700 font-medium">
                  Selected: {formData.Attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, Attachment: null })}
                  className="ml-auto text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={helpDeskMutation?.isPending}
            className="w-full flex items-center justify-center cursor-pointer bg-[#16C47F] hover:bg-[#FF9D23] disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none">
            {helpDeskMutation?.isPending ? (
              <div className="flex items-center">
                <BiLoaderCircle className="w-6 h-6 animate-spin mr-2" />
                Submitting...
              </div>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need immediate assistance? Contact us at{" "}
            <a
              href="mailto:support@example.com"
              className="text-[#16C47F] font-medium hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
