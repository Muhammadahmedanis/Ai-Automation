import { useState, useEffect, useRef } from "react";
import { Check, CircleX, X, RotateCcw, SlidersHorizontal, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEmailAccountQuery } from "../reactQuery/hooks/useEmailAccountsQuery";
import { useNavigate } from "react-router-dom";
import CreateDomain from "../components/CreateDomain";

export default function EmailDomain() {
  const { getDomainSuggestionsMutation, getDomainPricingMutation } = useEmailAccountQuery();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [domainExtensions, setDomainExtensions] = useState({
    com: true,
    co: false,
    org: true,
    net: false,
  });

  const [domainName, setDomainName] = useState("");
  const [selectedExtensions, setSelectedExtensions] = useState(["com", "org"]);
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [suggestionLimit, setSuggestionLimit] = useState(10);

  const [existingDomains, setExistingDomains] = useState([]);
  const [existingLoading, setExistingLoading] = useState(false);
  const [existingError, setExistingError] = useState(false);

  useEffect(() => {
    if (activeTab !== "existing") return;

    const fetchExistingDomains = async () => {
      setExistingLoading(true);
      setExistingError(false);
      const token = localStorage.getItem("Token")?.replace(/^"|"$/g, "");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/EmailAccount/GetDomains`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setExistingDomains(data.domains || []);
        } else {
          setExistingError(true);
        }
      } catch (err) {
        console.error("Error fetching existing domains:", err);
        setExistingError(true);
      } finally {
        setExistingLoading(false);
      }
    };

    fetchExistingDomains();
  }, [activeTab]);



  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categorizedDomains, setCategorizedDomains] = useState({
    premiumAvailable: [],
    nonPremiumAvailable: [],
    unavailablePremium: [],
    unavailableNonPremium: [],
  });

  const [error, setError] = useState(false); // For tracking API errors
  const [totalPrice, setTotalPrice] = useState(0); // For the total price from the API response

  // ⏳ Debounced suggestion fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!domainName.trim() || selectedExtensions.length === 0) return;
  
      getDomainSuggestionsMutation.mutate(
        {
          domain: domainName.trim(),
          tlds: selectedExtensions,
          limit: suggestionLimit,
        },
        {
          onSuccess: (data) => {
            setDomainSuggestions(data.Suggestions || []);
          },
          onError: (err) => {
            console.error("Error fetching domain suggestions", err);
          },
        }
      );
    }, 300);
  
    return () => clearTimeout(timer);
  }, [domainName, selectedExtensions, suggestionLimit]);
  

  const handleExtensionToggle = (ext) => {
    const updated = { ...domainExtensions, [ext]: !domainExtensions[ext] };
    setDomainExtensions(updated);
    setSelectedExtensions(Object.keys(updated).filter((k) => updated[k]));
  };

  const handleDomainSelection = (domain) => {
    const alreadySelected = selectedDomains.find((d) => d.name === domain);

    if (alreadySelected) {
      setSelectedDomains((prev) => prev.filter((d) => d.name !== domain));
    } else {
      const newDomain = { name: domain, price: null, fetched: false, error: false };
      setSelectedDomains((prev) => [...prev, newDomain]);
    }
  };

  const handleConfirm = () => {
    setShowConfirmModal(true);  // Show the modal immediately
    setCategorizedDomains({});  // Reset categorized domains
    setLoading(true); // Show loading state in the modal
    setError(false);

    const domainNames = selectedDomains.map((d) => d.name);

    console.log(domainNames);

    getDomainPricingMutation.mutateAsync({
      Domains: domainNames,
    })
    .then((res) => {
      console.log(res);
      const { Available, Unavailable } = res.prices;

      // Categorize domains based on availability and premium status
      const categorized = {
        premiumAvailable: Available.PremiumDomains,
        nonPremiumAvailable: Available.NonPremiumDomains,
        unavailablePremium: Unavailable.PremiumDomains,
        unavailableNonPremium: Unavailable.NonPremiumDomains,
      };

      setCategorizedDomains(categorized);
      setTotalPrice(res.totalPrice);
      setLoading(false); // Stop the loader when data is available
    })
    .catch((err) => {
      console.error("Error confirming domains", err);
      setError(true)
      setLoading(false); // Stop the loader in case of an error
    });
  };
  
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY_COUNT = 3;

  // const handleRetry = () => {
  //   if (retryCount >= MAX_RETRY_COUNT) {
  //     alert("Maximum retry attempts reached. Please try again later.");
  //     return;
  //   }

  //   setLoading(true);
  //   setCategorizedDomains({});

  //   getDomainPricingMutation
  //     .mutateAsync({ domains: selectedDomains.map(d => d.name) })
  //     .then((res) => {
  //       const { Available, Unavailable } = res.prices;
  //       const categorized = {
  //         premiumAvailable: Available.PremiumDomains,
  //         nonPremiumAvailable: Available.NonPremiumDomains,
  //         unavailablePremium: Unavailable.PremiumDomains,
  //         unavailableNonPremium: Unavailable.NonPremiumDomains,
  //       };

  //       setCategorizedDomains(categorized);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       setRetryCount((prev) => prev + 1);
  //       console.error("Error confirming domains", err);
  //       setLoading(false);
  //     });
  // };

  const handleRetry = () => {
    if (!error) return;
    setLoading(true);
    setError(false);
    setCategorizedDomains({});

    getDomainPricingMutation
      .mutateAsync({ Domains: selectedDomains.map((d) => d.name) })
      .then((res) => {
        const { Available, Unavailable } = res.prices;

        const categorized = {
          premiumAvailable: Available.PremiumDomains,
          nonPremiumAvailable: Available.NonPremiumDomains,
          unavailablePremium: Unavailable.PremiumDomains,
          unavailableNonPremium: Unavailable.NonPremiumDomains,
        };

        setCategorizedDomains(categorized);
        setTotalPrice(res.totalPrice); // Set the total price from the API response
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error confirming domains", err);
        setError(true);
        setLoading(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 mb-12">
      <button onClick={() => navigate(-1)} className="flex gap-1 items-center cursor-pointer text-gray-600"> <ChevronLeft size={18} /> Go Back</button>
      {/* Tabs */}
      <div className="flex border-none">
        {["new", "existing", "create"].map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 font-medium cursor-pointer ${
              activeTab === tab ? "text-[#16C47F] border-b-2 border-[#16C47F]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "new" ? "New Domain" : tab === "existing"? "Existing Domains" : "Create New Email" }
          </button>
        ))}
      </div>

      {activeTab === "new" && (
        <div className="space-y-6 mt-6">
          <input
            type="text"
            placeholder="Type your domain name to start"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#16C47F]"
          />

          {/* Domain extensions */}
          <div className="flex gap-6">
            {Object.keys(domainExtensions).map((ext) => (
              <label key={ext} className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                    domainExtensions[ext] ? "bg-[#16C47F] hover:bg-[#FF9D23] border-[#16C47F]" : "border-gray-300"
                  }`}
                >
                  {domainExtensions[ext] && <Check className="w-4 h-4 text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={domainExtensions[ext]}
                  onChange={() => handleExtensionToggle(ext)}
                />
                <span>.{ext}</span>
              </label>
            ))}
          </div>


          {domainSuggestions.length > 0 && (
            <>
              <p className="font-bold text-black mb-0">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {domainSuggestions.map((domain, idx) => {
                  const selected = selectedDomains.some((d) => d.name === domain);
                  return (
                    <p
                      key={idx}
                      className="flex items-center gap-2 mt-2 bg-[#16C47F] border w-fit text-[13px] border-[#16C47F] p-2 rounded-full cursor-pointer"
                      onClick={() => handleDomainSelection(domain)}
                    >
                      <span>{domain}</span>
                      {selected ? <CircleX size={17} /> : <Check size={17} />}
                    </p>
                  );
                })}
              </div>
              <button
                className="bg-[#15A395] text-white py-2 px-4 rounded-full mt-2 cursor-pointer"
                onClick={() => setSuggestionLimit((prev) => prev + 5)}
              >
                Search for more
              </button>
            </>
          )}


          {selectedDomains.length > 0 && (
            <>
              <p className="font-semibold text-black mt-2">Selected Domains</p>
              <div className="space-y-2">
                {selectedDomains.map((domain, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex justify-between items-center border-2 border-[#16C47F] p-4 w-full rounded-2xl">
                      <span className="text-sm">{domain.name}</span>
                    </div>
                    <button
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedDomains((prev) => prev.filter((d) => d.name !== domain.name))
                      }
                    >
                      <X size={20} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  className="bg-[#15A395] text-white py-2 px-4 rounded-full mt-2 cursor-pointer"
                  onClick={() => handleConfirm()}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      )}


      {activeTab === "existing" && (
        <div className="py-8">
    {existingLoading ? (
      <p className="text-center text-gray-500">Loading your domains...</p>
    ) : existingError ? (
      <p className="text-center text-red-500">Failed to load domains. Please try again.</p>
    ) : existingDomains.length === 0 ? (
      <p className="text-center text-gray-500">You haven’t purchased any domains yet.</p>
    ) : (
      <div className="space-y-4">
        {existingDomains.map((d, idx) => (
          <div
            key={d.id || idx}
            onClick={() => navigate("/configure-domain", { state: d })}
            className="border border-[#16C47F] p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-[#16C47F] transition-colors cursor-pointer"
          >
            <p>{d.DomainName}</p>
            <SlidersHorizontal size={18} className="cursor-pointer hover:text-[#16C47F]" />
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {activeTab === "create" && (
          <CreateDomain />
        )}

    
    {showConfirmModal && (
      <DomainConfirmModal
        isOpen={showConfirmModal}
        categorizedDomains={categorizedDomains}
        onClose={() => setShowConfirmModal(false)}
        onNext={() =>
          navigate("/payment", {
            state: {
              totalPrice,
              paymentIntentDomains: {
                PremiumDomains: categorizedDomains.premiumAvailable, // has domain, price, eapFee
                NonPremiumDomains: categorizedDomains.nonPremiumAvailable, // has domain, registerPrice, etc.
              },
            },
          })
        }
        loading={loading} // Pass loading state
        onRetry={handleRetry} // Pass retry handler
        error={error}
        totalPrice={totalPrice}
      />
    )}


    </div>
  );
}

const DomainConfirmModal = ({ isOpen, categorizedDomains, onClose, onNext, loading, onRetry, error, totalPrice }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-2xl font-semibold mb-6">Confirm Your Domains</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-gray-700">Loading pricing information...</p>
            <div className="animate-spin rounded-full border-4 border-[#16C47F] border-t-transparent w-10 h-10"></div>
          </div>
        ) : (
          <>
            {/* Conditional rendering of categories */}
            {categorizedDomains?.premiumAvailable?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#16C47F] mb-2">Premium Available</h3>
                {categorizedDomains.premiumAvailable.map((domain, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-800">{domain.domain}</span>
                    <span className="text-[#16C47F]">${domain.price}</span>
                  </div>
                ))}
              </div>
            )}

            {categorizedDomains?.nonPremiumAvailable?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#16C47F] mb-2">Non-Premium Available</h3>
                {categorizedDomains.nonPremiumAvailable.map((domain, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-gray-200">
                    <span className="text-gray-800">{domain.domain}</span>
                    <span className="text-[#16C47F]">${domain.registerPrice}</span>
                  </div>
                ))}
              </div>
            )}

            {categorizedDomains?.unavailablePremium?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#16C47F] mb-2">Unavailable Premium</h3>
                {categorizedDomains.unavailablePremium.map((domain, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-800">{domain}</span>
                    <span className="text-red-500">Unavailable</span>
                  </div>
                ))}
              </div>
            )}

            {categorizedDomains?.unavailableNonPremium?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#16C47F] mb-2">Unavailable Non-Premium</h3>
                {categorizedDomains.unavailableNonPremium.map((domain, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-800">{domain}</span>
                    <span className="text-red-500">Unavailable</span>
                  </div>
                ))}
              </div>
            )}

            {/* Display Total Price */}
            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <p className="text-lg font-semibold">Total Price:</p>
              <span className="text-[#16C47F] text-lg">$ {totalPrice}</span>
            </div>
          </>
        )}

        {/* Retry Button only visible if there was an error */}
        {!loading && error && (
          <div className="flex justify-between mt-6">
            <button
              onClick={onRetry}
              className="bg-yellow-400 text-white py-2 px-4 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!loading && !error && (
          <div className="flex justify-between mt-6">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16C47F]"
            >
              Back
            </button>
            <button
              onClick={onNext}
              className="bg-[#16C47F] hover:bg-[#FF9D23] text-white py-2 px-4 rounded-lgfocus:outline-none focus:ring-2 focus:ring-[#16C47F]"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
