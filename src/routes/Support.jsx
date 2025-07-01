import { CloudUpload } from "lucide-react";
import { useState } from "react";
import { useWorkspaceQuery } from "../reactQuery/hooks/useWorkspaceQuery";
import { BiLoaderCircle } from "react-icons/bi";

const Support = () => {
    const { helpDeskMutation } = useWorkspaceQuery()
    const [formData, setFormData] = useState({
        Type: "",
        Subject: "",
        Message: "",
        Attachment: null
    });

    const handleTypeChange = (Type) => {
        setFormData((prevData) => ({
            ...prevData,
            Type: prevData.Type === Type ? "" : Type,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, Attachment: e.target.files[0] });
    };

    const handleFileClick = () => {
        document.getElementById("file-upload").click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append("Type", formData.Type);
        formDataToSend.append("Subject", formData.Subject);
        formDataToSend.append("Message", formData.Message);
        formDataToSend.append("Attachment", formData.Attachment);
        helpDeskMutation.mutate(formDataToSend, {
            onSuccess: () => {
                setFormData({
                    Type: "",
                    Subject: "",
                    Message: "",
                    Attachment: null
                })
            }
        });
        console.log(formData);
    };
    

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-xl p-8">
                <h1 className="text-2xl font-medium text-center mb-1">Help Desk</h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                    Submit bugs, feature requests and feedback here
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Request Type */}
                    <div className="flex gap-4 text-sm md:text-md md:gap-8 mb-6 flex-col md:flex-row">
                        {["bug", "feature", "feedback"].map((Type) => (
                            <label key={Type} className="flex items-center text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.Type === Type}
                                    onChange={() => handleTypeChange(Type)}
                                    className="w-4 h-4 mr-2 border-gray-300 rounded focus:bg-[#f3faf9] focus:ring"
                                />
                                {Type.charAt(0).toUpperCase() + Type.slice(1)}
                            </label>
                        ))}
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Issue</label>
                        <input
                            type="text"
                            name="Subject"
                            value={formData.Subject}
                            onChange={handleInputChange}
                            placeholder="Issue"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:bg-[#f3faf9] focus:ring focus:outline-none  focus:ring-teal-500"
                        />
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Message</label>
                        <textarea
                            name="Message"
                            value={formData.Message}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                            rows="5"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:bg-[#f3faf9] focus:ring focus:ring-teal-500"
                        ></textarea>
                    </div>

                    {/* Attachment */}
                    <div className="mb-6">
                        <label className="block font-medium mb-2">Attachment</label>
                        <div
                            className="border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
                            onClick={handleFileClick}>
                            <div className="flex justify-center mb-2">
                             <CloudUpload size={40} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">Drag file here or click to browse</p>
                        </div>
                        <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" />
                        {formData.Attachment && (
                            <p className="text-sm text-teal-600 mt-2">Selected: {formData.Attachment.name}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full cursor-pointer flex justify-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-full transition duration-300">
                        {helpDeskMutation?.isPending ? 
                        ( <BiLoaderCircle className="size-7 animate-spin" /> ) : 
                        ( "Submit" ) 
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Support;
