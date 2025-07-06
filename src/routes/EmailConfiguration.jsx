// Improved responsive layout for EmailConfiguration.jsx
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Switch } from "@headlessui/react";

const EmailConfiguration = () => {
    const { state: domain } = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [configuring, setConfiguring] = useState(false);
    const [error, setError] = useState(null);

    const [verifying, setVerifying] = useState(false);
    const [verificationSteps, setVerificationSteps] = useState([]);
    const [verificationResult, setVerificationResult] = useState(null);

    const [webForwardingUrl, setWebForwardingUrl] = useState("");
    const [forwardingMessage, setForwardingMessage] = useState(null);
    const [forwardingSubmitting, setForwardingSubmitting] = useState(false);

    useEffect(() => {
        if (!domain) {
            setError("No domain data found.");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");

        const fetchDomainStatus = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/GetDomainStatus`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ DomainId: domain.id }),
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Failed to fetch domain status.");
                }

                setStatus(data);
            } catch (err) {
                setError("Something went wrong.");
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDomainStatus();
    }, [domain]);

    const handleEnableMailHosting = async () => {
        if (!domain) return;
        setConfiguring(true);

        const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/ConfigureEmailHosting`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ Domain: domain.DomainName }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.ConfigurationResults?.Message || "Failed to configure mail hosting.");
            }

            const refreshed = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/GetDomainStatus`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ DomainId: domain.id }),
            });

            const refreshedData = await refreshed.json();
            setStatus(refreshedData);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setConfiguring(false);
        }
    };

    const handleVerifyDomain = async () => {
        if (!domain) return;
        setVerifying(true);
        setVerificationSteps([]);
        setVerificationResult(null);

        const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/VerifyEmailHosting`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ Domain: domain.DomainName }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Verification failed.");

            const steps = data.VerificationProgress;
            for (const key of Object.keys(steps)) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                const step = steps[key];
                setVerificationSteps((prev) => [...prev, { key, success: step.Success, message: step.Message }]);
            }

            const allPassed = Object.values(steps).every((s) => s.Success === true);
            setVerificationResult(allPassed ? "success" : "failed");

            if (allPassed) {
                const refreshed = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/GetDomainStatus`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ DomainId: domain.id }),
                });
                const refreshedData = await refreshed.json();
                setStatus(refreshedData);
            }
        } catch (err) {
            toast.error(err.message);
            setVerificationResult("failed");
        } finally {
            setVerifying(false);
        }
    };

    const handleConfigureWebForwarding = async () => {
        if (!domain || !webForwardingUrl) return;
        setForwardingSubmitting(true);
        setForwardingMessage(null);

        const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/ConfigureWebForwarding`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    Domain: domain.DomainName,
                    ForwardingUrl: webForwardingUrl,
                }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Failed to configure web forwarding.");

            toast.success(data.message);
            setStatus((prev) => ({
                ...prev,
                WebForwardingConfiguration: true,
                WebForwardingUrl: data.WebForwardingUrl,
            }));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setForwardingSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-4 sm:p-6 text-gray-500">Checking domain status...</div>;
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 text-red-600">
                {error}
                <button onClick={() => navigate("/email-domain")} className="block mt-4 bg-[#16C47F] p-4 text-white rounded-md">
                    Go to Existing Domains
                </button>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 bg-white rounded-lg max-w-3xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 break-words">
                Domain Configuration: <span className="text-[#16C47F]">{domain.DomainName}</span>
            </h1>

            {/* Mail Hosting Section */}
            <section className="space-y-2 sm:space-y-4 border border-gray-200 rounded-md p-3 sm:p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">Mail Hosting Configuration</h2>
                    <Switch
                        checked={status.MailHostingConfiguration}
                        disabled={status.MailHostingConfiguration || configuring}
                        onChange={handleEnableMailHosting}
                        className={`${
                            status.MailHostingConfiguration ? "bg-[#16C47F]" : "bg-gray-300"
                        } relative inline-flex h-6 w-11 items-center rounded-full transition shrink-0 cursor-pointer`}
                    >
                        <span
                            className={`${
                                status.MailHostingConfiguration ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
                        />
                    </Switch>
                </div>

                {configuring && <p className="text-sm text-gray-500">Configuring...</p>}

                {status.MailHostingConfiguration && (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                            <button
                                onClick={handleVerifyDomain}
                                disabled={status.Verification || verifying || verificationResult === "success"}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-white text-sm sm:text-base ${
                                    status.Verification || verificationResult === "success"
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#16C47F] hover:bg-[#FF9D23] cursor-pointer"
                                }`}
                            >
                                {verifying ? "Verifying..." : status.Verification || verificationResult === "success" ? "Already Verified" : "Verify"}
                            </button>

            {verificationResult === "success" && <span className="text-[#16C47F] font-medium">Domain Verified</span>}
            {verificationResult === "failed" && <span className="text-red-600 font-medium">Domain Verification Failed</span>}
            </div>

            {verificationSteps.length > 0 && (
              <div className="space-y-1">
                {verificationSteps.map((step, idx) => (
                  <div key={idx} className={`flex items-center gap-2 ${step.success ? "text-green-600" : "text-red-500"}`}>
                    {step.success ? "✅" : "❌"} <span>{step.message}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </section>

      {/* Web Forwarding Section */}
      <section className="space-y-4 border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Web Forwarding Configuration</h2>
          <Switch
            checked={status.WebForwardingConfiguration}
            disabled={status.WebForwardingConfiguration}
            onChange={() =>
              setStatus((prev) => ({
                ...prev,
                WebForwardingConfiguration: !prev.WebForwardingConfiguration,
              }))
            }
            className={`${
              status.WebForwardingConfiguration ? "bg-[#16C47F]" : "bg-gray-300"
            } relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer`}
          >
            <span
              className={`${
                status.WebForwardingConfiguration ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
            />
          </Switch>
        </div>

        {status.WebForwardingConfiguration && (
          <div className="space-y-2 w-full">
            <div className="flex gap-2 w-full md:flex-row flex-col">
            <input
              type="url"
              placeholder="Enter forwarding URL"
              value={webForwardingUrl}
              onChange={(e) => setWebForwardingUrl(e.target.value)}
              className="p-2 border rounded w-full"
            />
            <button
              onClick={handleConfigureWebForwarding}
              disabled={forwardingSubmitting || !webForwardingUrl}
              className="bg-[#16C47F] hover:bg-[#FF9D23] text-white px-4 py-2 w-fit whitespace-nowrap cursor-pointer rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {forwardingSubmitting ? "Submitting..." : status.WebForwardingUrl ? "Update Forwarding" : "Submit"}
            </button>
            </div>

            {status.WebForwardingUrl && (
              <p className="">
                Currently forwarding to:{" "}
                <a href={status.WebForwardingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {status.WebForwardingUrl}
                </a>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmailConfiguration;
