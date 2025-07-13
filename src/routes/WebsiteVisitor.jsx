import { useEffect, useState } from "react";
import profilePic from "../assets/Boy.png";
import { ChevronDown, CircleX, Filter, MousePointer2, PlusCircle, User } from "lucide-react";
import Filters from "../components/Filters";

const contacts = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: `Contact ${i + 1}`,
  company: "Manaflow Inc.",
  address: "Los Angeles Pier, LA",
  time: "Jan 23, 7:23 AM",
}));


const ContactCard = ({ contact, selected, toggleSelect }) => {
  const isSelected = selected.includes(contact.id);
  return (
    <div
      className={`flex items-center p-2 md:p-4 rounded-lg border border-gray-200 transition-colors ${isSelected ? "bg-[#e4fff5]" : "hover:bg-[#f5fffb]"}`}
    >
      <div className="w-6 flex justify-center mr-4">
        <input 
          type="checkbox" 
          className="form-checkbox w-5 h-5 text-green-500 rounded-full" 
          checked={isSelected}
          onChange={() => toggleSelect(contact.id)} 
        />
      </div>
      <img src={profilePic} alt="Profile" className="md:w-5 md:h-5 w-6 h-6 rounded-full mr-4" />
      <div className="flex-1 grid md:grid-cols-4 md:gap-4 text-left">
        <p className="font-medium">{contact.name}</p>
        <p className="text-sm text-gray-500">{contact.company}</p>
        <p className="text-sm text-gray-500">{contact.address}</p>
        <p className="text-sm text-gray-500">{contact.time}</p>
      </div>
    </div>
  );
};

export default function ContactList() {
  // const [selectedAll, setSelectedAll] = useState(false);
  // const [selectedContacts, setSelectedContacts] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [isModal2, setIsModal2] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(contacts.map((c) => c.id));
    }
    setSelectAll(!selectAll);
  };



//  const toggleSelectAll = () => {
//   const newValue = !selectedAll;
//   setSelectedAll(newValue);
//   setSelectedContacts(
//     newValue ? Object.fromEntries(contacts.map((c) => [c.id, true])) : {}
//   );
// };



//   const toggleSelect = (id) => {
//   setSelectedContacts((prev) => {
//     const updated = { ...prev, [id]: !prev[id] };

//     if (!updated[id]) {
//       delete updated[id];
//     }

//     const allSelected = contacts.every(contact => updated[contact.id]);
//     setSelectedAll(allSelected); // Update top checkbox

//     return updated;
//   });
// };


  return (
    <div className="p-2 md:p-6 bg-white min-h-screen flex justify-center flex-col text-sm ">
      <div className="flex justify-between items-center mb-4 flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border border-gray-300 rounded-full w-full md:w-64"
        />
        <div className="flex items-center space-x-2 md:space-x-4 text-xs flex-wrap gap-2">
          <Filters />
          <button
            type="button"
            onClick={() => setIsModal2(true)}
            className="inline-flex items-center px-4 py-2 cursor-pointer border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-[#16C47F] hover:bg-[#FF9D23]">
            <User size={18} />
            Get Contacts
          </button>
          
          {isModal2 && (
              <div onClick={() => setIsModal2(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 animate-fade-in-up transition-all duration-300">
                  <div className="flex items-center bg-[#16C47F]  justify-between p-5 border-b border-gray-200">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">23 Contacts found</h3>
                      <p className="text-sm text-gray-500">AI has found 23 contact from website  visitors Select the contacts you want to add to your campaign or CRM.</p>
                    </div>
                    <button onClick={() => setIsModal2(false)} className="text-gray-400 cursor-pointer hover:text-gray-600 transition">
                      <CircleX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {contacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        isSelected={selectedContacts[contact.id]}
                        onSelect={() => toggleSelect(contact.id)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 p-4">
                    <button onClick={() => setIsModal(false)} className="py-2 px-5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer">Add to campaign</button>
                    <button className="py-2 px-5 text-sm font-medium text-white bg-[#16C47F] hover:bg-[#FF9D23] rounded-full cursor-pointer">Add to CRM</button>
                  </div>
                </div>
              </div>
            )}
          <button onClick={() => setIsModal(true)} className="px-3 flex items-center gap-1 cursor-pointer text-[13px] md:px-6 py-1.5 md:py-3 rounded-full text-white bg-[#16C47F] hover:bg-[#FF9D23]">
            Add to campaign
            <MousePointer2 size={17} />
          </button>
          
          {isModal && (
            <div onClick={() => setIsModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30">
              <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 animate-fade-in-up transition-all duration-300">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Add to Campaign</h3>
                  <button onClick={() => setIsModal(false)} className="text-gray-400 cursor-pointer hover:text-gray-600 transition">
                    <CircleX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="text-base font-medium">Select Campaign</h4>
                  <p className="text-sm text-gray-500">Choose the campaign you want to send the notification from.</p>
                  <div className="relative">
                    <select className="w-full p-2.5 mt-2 text-sm border border-gray-300 rounded-md  outline-none">
                      <option value="">All Campaigns</option>
                      <option value="option1">Campaign 1</option>
                      <option value="option2">Campaign 2</option>
                      <option value="option3">Campaign 3</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-gray-400 text-[14px]">Check for duplicate across all campaigns</span>
                  </div>

                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:bg-[#16C47F]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">Skip already in campaign</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 p-4">
                  <button onClick={() => setIsModal(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:text-blue-700 cursor-pointer">Cancel</button>
                  <button className="py-2.5 px-5 text-sm font-medium text-white bbg-[#16C47F] hover:bg-[#FF9D23] rounded-full cursor-pointer">Add to campaign</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <input 
          type="checkbox" 
          className="md:w-6 md:h-6 h-4 w-4 text-green-500 border-gray-300 rounded-full ml-[10px] md:ml-[30px] my-[10px] md:my-[20px] " 
          checked={selectAll} 
          onChange={handleSelectAll}
        />
        <span className="text-gray-700">Visitors</span>
      </div>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <ContactCard 
            key={contact.id}
            contact={contact}
            selected={selected}
            toggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
}