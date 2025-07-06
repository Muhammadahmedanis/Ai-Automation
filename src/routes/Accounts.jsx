import { ChevronDown, ChevronUp, CircleCheck, Clock, Globe, MapPin, Search } from 'lucide-react'
import React, { useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axios';

function Accounts() {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectAll, setSelectAll] = useState(false);
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);

  const param = useParams();

  useEffect(() => {
    const fetchData = async () => {
        try {
                const response = await axiosInstance.get("/lead/GetAllLeads");
                const updatedLeads = response.data.leads.map((lead) => ({
                ...lead,
                status: lead.Status || "Not yet contacted",
                provider: lead.Email?.includes("@gmail.com")
                ? "Google"
                : lead.Email?.includes("@outlook.com")
                ? "Microsoft"
                : lead.Email?.includes("@yahoo.com")
                ? "Yahoo"
                : "Other",
            }));

            setPeople(updatedLeads);

            if(param.name){
                const filtered = updatedLeads.filter(lead => ( lead.provider.toLowerCase() === param.name.toLowerCase()));
                setFilteredPeople(filtered);
            }
        } catch (error) {
            console.log(error);
        }
    }
    fetchData();
  }, [param.name])

  return (
   <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#16C47F] focus:border-[#16C47F] sm:text-sm"
        placeholder='Search emails...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
    </div>
    <div className="min-w-full overflow-auto">
        <table className="w-full">
        <thead>
            <tr className="border-b border-gray-300 text-sm text-muted-foreground">
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                <input 
                type="checkbox" 
                className="rounded border-muted cursor-pointer"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
                />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-400">EMAIL</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-400">CONTACT</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-400">COMPANY</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-400">TITLE</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-400">EMAIL PROVIDER</th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-400">STATUS</th>
            </tr>
        </thead>
        <tbody>
            {filteredPeople
            .filter(person => 
                person.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                person.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                person.Company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                person.Title?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((person) => (
                <tr key={person.id} className="border-b border-gray-200 text-sm hover:bg-gray-50">
                <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-muted cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-gray-600">
                    <a href={`mailto:${person.Email}`} className="hover:text-blue-500">
                    {person.Email}
                    </a>
                </td>
                <td className="px-4 py-3 text-gray-600">{person.Name}</td>
                <td className="px-4 py-3 text-gray-600">{person.Company || 'Not specified'}</td>
                <td className="px-4 py-3 text-gray-600">{person.Title || 'Not specified'}</td>
                <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                    {person.provider === 'Google' && <FcGoogle size={20} />}
                    {person.provider}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                    {person.status === 'Verified' ? (
                        <div className="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-0.5">
                        <CircleCheck size={17} className="text-blue-500" />
                        <span className="text-blue-500">Verified</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1.5">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-400">Not yet contacted</span>
                        </div>
                    )}
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  )
}

export default Accounts