import { useState, useEffect } from "react";
import { useCampaignQuery } from "../reactQuery/hooks/useCampaignQuery";
import { ChevronDown, Plus, Calendar, X } from "lucide-react";

function ScheduleForm({ campaignId, newSchedulesData }) {
  const [schedules, setSchedules] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [scheduleName, setScheduleName] = useState("");
  const [startDate] = useState("Now");
  const [endDate] = useState("No end date");
  const [selectedDays, setSelectedDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });

  const { getCampaignScheduleQuery, updateScheduleMutationQuery } = useCampaignQuery();

  const {
    data: campaignSchedule,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    error: scheduleError,
  } = getCampaignScheduleQuery(campaignId);

  useEffect(() => {
    if (Array.isArray(campaignSchedule?.schedule?.Schedule)) {
      const scheduleData = campaignSchedule.schedule.Schedule.map((schedule, index) => ({
        id: index + 1,
        name: schedule.Name,
        fromTime: schedule.TimingFrom,
        toTime: schedule.TimingTo,
        timezone: schedule.Timezone,
        days: schedule.Days.reduce((acc, day) => {
          acc[day] = true;
          return acc;
        }, {}),
      }));
  
      setSchedules(scheduleData);
      setActiveSchedule(scheduleData[0]?.id); // Set first schedule as active
      setScheduleName(scheduleData[0]?.name);
    } else {
      // if it's not an array, you might want to reset the states
      setSchedules([]);
      setActiveSchedule(null);
      setScheduleName("");
    }
  }, [campaignSchedule]);
  

  useEffect(() => {
    console.log("Schedules by AI: ", newSchedulesData);
  
    setSchedules([]); // Always reset to empty array, NOT null.
  
    if (Array.isArray(newSchedulesData) && newSchedulesData.length > 0) {
      console.log("Received new schedules from parent:", newSchedulesData);
  
      const formattedSchedules = newSchedulesData.map((schedule, index) => ({
        id: index + 1,
        name: schedule.Name,
        fromTime: schedule.TimingFrom,
        toTime: schedule.TimingTo,
        timezone: schedule.Timezone,
        days: schedule.Days.reduce((acc, day) => {
          acc[day] = true;
          return acc;
        }, {}),
      }));
  
      setSchedules(formattedSchedules);
      setActiveSchedule(formattedSchedules[0]?.id || null);
      setScheduleName(formattedSchedules[0]?.name || "");
    } else {
      // In case there are no new schedules, reset active and name
      setActiveSchedule(null);
      setScheduleName("");
    }
  }, [newSchedulesData]);
  
  const timezones = [
        "Africa/Abidjan",
        "Africa/Accra",
        "Africa/Addis_Ababa",
        "Africa/Algiers",
        "Africa/Asmara",
        "Africa/Asmera",
        "Africa/Bamako",
        "Africa/Bangui",
        "Africa/Banjul",
        "Africa/Bissau",
        "Africa/Blantyre",
        "Africa/Brazzaville",
        "Africa/Bujumbura",
        "Africa/Cairo",
        "Africa/Casablanca",
        "Africa/Ceuta",
        "Africa/Conakry",
        "Africa/Dakar",
        "Africa/Dar_es_Salaam",
        "Africa/Djibouti",
        "Africa/Douala",
        "Africa/El_Aaiun",
        "Africa/Freetown",
        "Africa/Gaborone",
        "Africa/Harare",
        "Africa/Johannesburg",
        "Africa/Juba",
        "Africa/Kampala",
        "Africa/Khartoum",
        "Africa/Kigali",
        "Africa/Kinshasa",
        "Africa/Lagos",
        "Africa/Libreville",
        "Africa/Lome",
        "Africa/Luanda",
        "Africa/Lubumbashi",
        "Africa/Lusaka",
        "Africa/Malabo",
        "Africa/Maputo",
        "Africa/Maseru",
        "Africa/Mbabane",
        "Africa/Mogadishu",
        "Africa/Monrovia",
        "Africa/Nairobi",
        "Africa/Ndjamena",
        "Africa/Niamey",
        "Africa/Nouakchott",
        "Africa/Ouagadougou",
        "Africa/Porto-Novo",
        "Africa/Sao_Tome",
        "Africa/Timbuktu",
        "Africa/Tripoli",
        "Africa/Tunis",
        "Africa/Windhoek",
        "America/Adak",
        "America/Anchorage",
        "America/Anguilla",
        "America/Antigua",
        "America/Araguaina",
        "America/Argentina/Buenos_Aires",
        "America/Argentina/Catamarca",
        "America/Argentina/ComodRivadavia",
        "America/Argentina/Cordoba",
        "America/Argentina/Jujuy",
        "America/Argentina/La_Rioja",
        "America/Argentina/Mendoza",
        "America/Argentina/Rio_Gallegos",
        "America/Argentina/Salta",
        "America/Argentina/San_Juan",
        "America/Argentina/San_Luis",
        "America/Argentina/Tucuman",
        "America/Argentina/Ushuaia",
        "America/Aruba",
        "America/Asuncion",
        "America/Atikokan",
        "America/Atka",
        "America/Bahia",
        "America/Bahia_Banderas",
        "America/Barbados",
        "America/Belem",
        "America/Belize",
        "America/Blanc-Sablon",
        "America/Boa_Vista",
        "America/Bogota",
        "America/Boise",
        "America/Buenos_Aires",
        "America/Cambridge_Bay",
        "America/Campo_Grande",
        "America/Cancun",
        "America/Caracas",
        "America/Catamarca",
        "America/Cayenne",
        "America/Cayman",
        "America/Chicago",
        "America/Chihuahua",
        "America/Ciudad_Juarez",
        "America/Coral_Harbour",
        "America/Cordoba",
        "America/Costa_Rica",
        "America/Coyhaique",
        "America/Creston",
        "America/Cuiaba",
        "America/Curacao",
        "America/Danmarkshavn",
        "America/Dawson",
        "America/Dawson_Creek",
        "America/Denver",
        "America/Detroit",
        "America/Dominica",
        "America/Edmonton",
        "America/Eirunepe",
        "America/El_Salvador",
        "America/Ensenada",
        "America/Fort_Nelson",
        "America/Fort_Wayne",
        "America/Fortaleza",
        "America/Glace_Bay",
        "America/Godthab",
        "America/Goose_Bay",
        "America/Grand_Turk",
        "America/Grenada",
        "America/Guadeloupe",
        "America/Guatemala",
        "America/Guayaquil",
        "America/Guyana",
        "America/Halifax",
        "America/Havana",
        "America/Hermosillo",
        "America/Indiana/Indianapolis",
        "America/Indiana/Knox",
        "America/Indiana/Marengo",
        "America/Indiana/Petersburg",
        "America/Indiana/Tell_City",
        "America/Indiana/Vevay",
        "America/Indiana/Vincennes",
        "America/Indiana/Winamac",
        "America/Indianapolis",
        "America/Inuvik",
        "America/Iqaluit",
        "America/Jamaica",
        "America/Jujuy",
        "America/Juneau",
        "America/Kentucky/Louisville",
        "America/Kentucky/Monticello",
        "America/Knox_IN",
        "America/Kralendijk",
        "America/La_Paz",
        "America/Lima",
        "America/Los_Angeles",
        "America/Louisville",
        "America/Lower_Princes",
        "America/Maceio",
        "America/Managua",
        "America/Manaus",
        "America/Marigot",
        "America/Martinique",
        "America/Matamoros",
        "America/Mazatlan",
        "America/Mendoza",
        "America/Menominee",
        "America/Merida",
        "America/Metlakatla",
        "America/Mexico_City",
        "America/Miquelon",
        "America/Moncton",
        "America/Monterrey",
        "America/Montevideo",
        "America/Montreal",
        "America/Montserrat",
        "America/Nassau",
        "America/New_York",
        "America/Nipigon",
        "America/Nome",
        "America/Noronha",
        "America/North_Dakota/Beulah",
        "America/North_Dakota/Center",
        "America/North_Dakota/New_Salem",
        "America/Nuuk",
        "America/Ojinaga",
        "America/Panama",
        "America/Pangnirtung",
        "America/Paramaribo",
        "America/Phoenix",
        "America/Port-au-Prince",
        "America/Port_of_Spain",
        "America/Porto_Acre",
        "America/Porto_Velho",
        "America/Puerto_Rico",
        "America/Punta_Arenas",
        "America/Rainy_River",
        "America/Rankin_Inlet",
        "America/Recife",
        "America/Regina",
        "America/Resolute",
        "America/Rio_Branco",
        "America/Rosario",
        "America/Santa_Isabel",
        "America/Santarem",
        "America/Santiago",
        "America/Santo_Domingo",
        "America/Sao_Paulo",
        "America/Scoresbysund",
        "America/Shiprock",
        "America/Sitka",
        "America/St_Barthelemy",
        "America/St_Johns",
        "America/St_Kitts",
        "America/St_Lucia",
        "America/St_Thomas",
        "America/St_Vincent",
        "America/Swift_Current",
        "America/Tegucigalpa",
        "America/Thule",
        "America/Thunder_Bay",
        "America/Tijuana",
        "America/Toronto",
        "America/Tortola",
        "America/Vancouver",
        "America/Virgin",
        "America/Whitehorse",
        "America/Winnipeg",
        "America/Yakutat",
        "America/Yellowknife",
        "Antarctica/Casey",
        "Antarctica/Davis",
        "Antarctica/DumontDUrville",
        "Antarctica/Macquarie",
        "Antarctica/Mawson",
        "Antarctica/McMurdo",
        "Antarctica/Palmer",
        "Antarctica/Rothera",
        "Antarctica/South_Pole",
        "Antarctica/Syowa",
        "Antarctica/Troll",
        "Antarctica/Vostok",
        "Arctic/Longyearbyen",
        "Asia/Aden",
        "Asia/Almaty",
        "Asia/Amman",
        "Asia/Anadyr",
        "Asia/Aqtau",
        "Asia/Aqtobe",
        "Asia/Ashgabat",
        "Asia/Ashkhabad",
        "Asia/Atyrau",
        "Asia/Baghdad",
        "Asia/Bahrain",
        "Asia/Baku",
        "Asia/Bangkok",
        "Asia/Barnaul",
        "Asia/Beirut",
        "Asia/Bishkek",
        "Asia/Brunei",
        "Asia/Calcutta",
        "Asia/Chita",
        "Asia/Choibalsan",
        "Asia/Chongqing",
        "Asia/Chungking",
        "Asia/Colombo",
        "Asia/Dacca",
        "Asia/Damascus",
        "Asia/Dhaka",
        "Asia/Dili",
        "Asia/Dubai",
        "Asia/Dushanbe",
        "Asia/Famagusta",
        "Asia/Gaza",
        "Asia/Harbin",
        "Asia/Hebron",
        "Asia/Ho_Chi_Minh",
        "Asia/Hong_Kong",
        "Asia/Hovd",
        "Asia/Irkutsk",
        "Asia/Istanbul",
        "Asia/Jakarta",
        "Asia/Jayapura",
        "Asia/Jerusalem",
        "Asia/Kabul",
        "Asia/Kamchatka",
        "Asia/Karachi",
        "Asia/Kashgar",
        "Asia/Kathmandu",
        "Asia/Katmandu",
        "Asia/Khandyga",
        "Asia/Kolkata",
        "Asia/Krasnoyarsk",
        "Asia/Kuala_Lumpur",
        "Asia/Kuching",
        "Asia/Kuwait",
        "Asia/Macao",
        "Asia/Macau",
        "Asia/Magadan",
        "Asia/Makassar",
        "Asia/Manila",
        "Asia/Muscat",
        "Asia/Nicosia",
        "Asia/Novokuznetsk",
        "Asia/Novosibirsk",
        "Asia/Omsk",
        "Asia/Oral",
        "Asia/Phnom_Penh",
        "Asia/Pontianak",
        "Asia/Pyongyang",
        "Asia/Qatar",
        "Asia/Qostanay",
        "Asia/Qyzylorda",
        "Asia/Rangoon",
        "Asia/Riyadh",
        "Asia/Saigon",
        "Asia/Sakhalin",
        "Asia/Samarkand",
        "Asia/Seoul",
        "Asia/Shanghai",
        "Asia/Singapore",
        "Asia/Srednekolymsk",
        "Asia/Taipei",
        "Asia/Tashkent",
        "Asia/Tbilisi",
        "Asia/Tehran",
        "Asia/Tel_Aviv",
        "Asia/Thimbu",
        "Asia/Thimphu",
        "Asia/Tokyo",
        "Asia/Tomsk",
        "Asia/Ujung_Pandang",
        "Asia/Ulaanbaatar",
        "Asia/Ulan_Bator",
        "Asia/Urumqi",
        "Asia/Ust-Nera",
        "Asia/Vientiane",
        "Asia/Vladivostok",
        "Asia/Yakutsk",
        "Asia/Yangon",
        "Asia/Yekaterinburg",
        "Asia/Yerevan",
        "Atlantic/Azores",
        "Atlantic/Bermuda",
        "Atlantic/Canary",
        "Atlantic/Cape_Verde",
        "Atlantic/Faeroe",
        "Atlantic/Faroe",
        "Atlantic/Jan_Mayen",
        "Atlantic/Madeira",
        "Atlantic/Reykjavik",
        "Atlantic/South_Georgia",
        "Atlantic/St_Helena",
        "Atlantic/Stanley",
        "Australia/ACT",
        "Australia/Adelaide",
        "Australia/Brisbane",
        "Australia/Broken_Hill",
        "Australia/Canberra",
        "Australia/Currie",
        "Australia/Darwin",
        "Australia/Eucla",
        "Australia/Hobart",
        "Australia/LHI",
        "Australia/Lindeman",
        "Australia/Lord_Howe",
        "Australia/Melbourne",
        "Australia/NSW",
        "Australia/North",
        "Australia/Perth",
        "Australia/Queensland",
        "Australia/South",
        "Australia/Sydney",
        "Australia/Tasmania",
        "Australia/Victoria",
        "Australia/West",
        "Australia/Yancowinna",
        "Brazil/Acre",
        "Brazil/DeNoronha",
        "Brazil/East",
        "Brazil/West",
        "CET",
        "CST6CDT",
        "Canada/Atlantic",
        "Canada/Central",
        "Canada/Eastern",
        "Canada/Mountain",
        "Canada/Newfoundland",
        "Canada/Pacific",
        "Canada/Saskatchewan",
        "Canada/Yukon",
        "Chile/Continental",
        "Chile/EasterIsland",
        "Cuba",
        "EET",
        "EST",
        "EST5EDT",
        "Egypt",
        "Eire",
        "Etc/GMT",
        "Etc/GMT+0",
        "Etc/GMT+1",
        "Etc/GMT+10",
        "Etc/GMT+11",
        "Etc/GMT+12",
        "Etc/GMT+2",
        "Etc/GMT+3",
        "Etc/GMT+4",
        "Etc/GMT+5",
        "Etc/GMT+6",
        "Etc/GMT+7",
        "Etc/GMT+8",
        "Etc/GMT+9",
        "Etc/GMT-0",
        "Etc/GMT-1",
        "Etc/GMT-10",
        "Etc/GMT-11",
        "Etc/GMT-12",
        "Etc/GMT-13",
        "Etc/GMT-14",
        "Etc/GMT-2",
        "Etc/GMT-3",
        "Etc/GMT-4",
        "Etc/GMT-5",
        "Etc/GMT-6",
        "Etc/GMT-7",
        "Etc/GMT-8",
        "Etc/GMT-9",
        "Etc/GMT0",
        "Etc/Greenwich",
        "Etc/UCT",
        "Etc/UTC",
        "Etc/Universal",
        "Etc/Zulu",
        "Europe/Amsterdam",
        "Europe/Andorra",
        "Europe/Astrakhan",
        "Europe/Athens",
        "Europe/Belfast",
        "Europe/Belgrade",
        "Europe/Berlin",
        "Europe/Bratislava",
        "Europe/Brussels",
        "Europe/Bucharest",
        "Europe/Budapest",
        "Europe/Busingen",
        "Europe/Chisinau",
        "Europe/Copenhagen",
        "Europe/Dublin",
        "Europe/Gibraltar",
        "Europe/Guernsey",
        "Europe/Helsinki",
        "Europe/Isle_of_Man",
        "Europe/Istanbul",
        "Europe/Jersey",
        "Europe/Kaliningrad",
        "Europe/Kiev",
        "Europe/Kirov",
        "Europe/Kyiv",
        "Europe/Lisbon",
        "Europe/Ljubljana",
        "Europe/London",
        "Europe/Luxembourg",
        "Europe/Madrid",
        "Europe/Malta",
        "Europe/Mariehamn",
        "Europe/Minsk",
        "Europe/Monaco",
        "Europe/Moscow",
        "Europe/Nicosia",
        "Europe/Oslo",
        "Europe/Paris",
        "Europe/Podgorica",
        "Europe/Prague",
        "Europe/Riga",
        "Europe/Rome",
        "Europe/Samara",
        "Europe/San_Marino",
        "Europe/Sarajevo",
        "Europe/Saratov",
        "Europe/Simferopol",
        "Europe/Skopje",
        "Europe/Sofia",
        "Europe/Stockholm",
        "Europe/Tallinn",
        "Europe/Tirane",
        "Europe/Tiraspol",
        "Europe/Ulyanovsk",
        "Europe/Uzhgorod",
        "Europe/Vaduz",
        "Europe/Vatican",
        "Europe/Vienna",
        "Europe/Vilnius",
        "Europe/Volgograd",
        "Europe/Warsaw",
        "Europe/Zagreb",
        "Europe/Zaporozhye",
        "Europe/Zurich",
        "GB",
        "GB-Eire",
        "GMT",
        "GMT+0",
        "GMT-0",
        "GMT0",
        "Greenwich",
        "HST",
        "Hongkong",
        "Iceland",
        "Indian/Antananarivo",
        "Indian/Chagos",
        "Indian/Christmas",
        "Indian/Cocos",
        "Indian/Comoro",
        "Indian/Kerguelen",
        "Indian/Mahe",
        "Indian/Maldives",
        "Indian/Mauritius",
        "Indian/Mayotte",
        "Indian/Reunion",
        "Iran",
        "Israel",
        "Jamaica",
        "Japan",
        "Kwajalein",
        "Libya",
        "MET",
        "MST",
        "MST7MDT",
        "Mexico/BajaNorte",
        "Mexico/BajaSur",
        "Mexico/General",
        "NZ",
        "NZ-CHAT",
        "Navajo",
        "PRC",
        "PST8PDT",
        "Pacific/Apia",
        "Pacific/Auckland",
        "Pacific/Bougainville",
        "Pacific/Chatham",
        "Pacific/Chuuk",
        "Pacific/Easter",
        "Pacific/Efate",
        "Pacific/Enderbury",
        "Pacific/Fakaofo",
        "Pacific/Fiji",
        "Pacific/Funafuti",
        "Pacific/Galapagos",
        "Pacific/Gambier",
        "Pacific/Guadalcanal",
        "Pacific/Guam",
        "Pacific/Honolulu",
        "Pacific/Johnston",
        "Pacific/Kanton",
        "Pacific/Kiritimati",
        "Pacific/Kosrae",
        "Pacific/Kwajalein",
        "Pacific/Majuro",
        "Pacific/Marquesas",
        "Pacific/Midway",
        "Pacific/Nauru",
        "Pacific/Niue",
        "Pacific/Norfolk",
        "Pacific/Noumea",
        "Pacific/Pago_Pago",
        "Pacific/Palau",
        "Pacific/Pitcairn",
        "Pacific/Pohnpei",
        "Pacific/Ponape",
        "Pacific/Port_Moresby",
        "Pacific/Rarotonga",
        "Pacific/Saipan",
        "Pacific/Samoa",
        "Pacific/Tahiti",
        "Pacific/Tarawa",
        "Pacific/Tongatapu",
        "Pacific/Truk",
        "Pacific/Wake",
        "Pacific/Wallis",
        "Pacific/Yap",
        "Poland",
        "Portugal",
        "ROC",
        "ROK",
        "Singapore",
        "Turkey",
        "UCT",
        "US/Alaska",
        "US/Aleutian",
        "US/Arizona",
        "US/Central",
        "US/East-Indiana",
        "US/Eastern",
        "US/Hawaii",
        "US/Indiana-Starke",
        "US/Michigan",
        "US/Mountain",
        "US/Pacific",
        "US/Samoa",
        "UTC",
        "Universal",
        "W-SU",
        "WET",
        "Zulu"
    ]
  
  const handleDayToggle = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const addSchedule = () => {
    if (schedules.length >= 3) {
      alert("You can't add more than 3 schedules");
      return;
    }
    const newId = schedules.length + 1;
    const newSchedule = { id: newId, name: `Schedule ${newId}` };
    setSchedules([...schedules, newSchedule]);
    setActiveSchedule(newId);
    setScheduleName(newSchedule.name);
  };

  const deleteSchedule = (id) => {
    if (schedules.length === 1) return;
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    if (activeSchedule === id && updated.length > 0) {
      const next = updated[0];
      setActiveSchedule(next.id);
      setScheduleName(next.name);
    }
  };

  const handleScheduleChange = (scheduleId) => {
    const selectedSchedule = schedules.find((schedule) => schedule.id === scheduleId);
    setActiveSchedule(scheduleId);
    setScheduleName(selectedSchedule?.name);
    setSelectedDays((prev) => {
      const updatedDays = { ...prev };
      Object.keys(updatedDays).forEach((day) => {
        updatedDays[day] = selectedSchedule?.days[day] || false;
      });
      return updatedDays;
    });
  };

  const handleSaveSchedules = () => {
    const scheduleData = {
      Schedule: schedules.map(schedule => ({
        Name: schedule.name || "",
        TimingFrom: schedule.fromTime || "",
        TimingTo: schedule.toTime || "",
        Timezone: schedule.timezone || "",
        Days: schedule.days ? Object.keys(schedule.days).filter(day => schedule.days[day]) : [], 
      })),
    };

    console.log("Saving schedule Object:", scheduleData);

    updateScheduleMutationQuery.mutate(
      { campaignId, scheduleData },
      {
        onSuccess: (response) => {
          console.log("Campaign schedule updated!", response);
        },
      }
    );
  };


  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto p-4">
      {/* Sidebar */}
      <div className="w-full md:w-64 space-y-4">
        <div className="flex items-center text-gray-600 mb-4 space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Start</span>
          <span className="text-[#16C47F] ml-auto">{startDate}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-6 space-x-2">
          <Calendar className="h-5 w-5" />
          <span>End date</span>
          <span className="text-[#16C47F] ml-auto">{endDate}</span>
        </div>

        <div className="border-t border-gray-200 pt-6">
          {schedules?.map((schedule) => (
            <div
              key={schedule.id}
              className={`px-4 py-2 mb-2 rounded-md cursor-pointer border relative ${
                activeSchedule === schedule.id
                  ? "border-[#16C47F] text-[#16C47F]"
                  : "border-gray-200"
              }`}
              onClick={() => handleScheduleChange(schedule.id)}
            >
              <span>{schedule.name}</span>
              {schedules.length > 1 && (
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSchedule(schedule.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          <button
            className={`w-full flex items-center justify-center px-4 py-2 border rounded-full cursor-pointer ${
              schedules?.length >= 3
                ? "text-gray-300 cursor-not-allowed border-gray-200"
                : "text-gray-500 hover:text-[#16C47F] border-gray-200"
            }`}
            onClick={addSchedule}
            disabled={schedules?.length >= 3}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add schedule
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 space-y-6">
        {/* Display only the active schedule */}
        {schedules?.length > 0 && (
          <div className="bg-white p-6 shadow rounded-md">
            <h2 className="text-base font-medium mb-2">Schedule Name</h2>
            <input
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="w-full border border-[#16C47F] rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#16C47F]"
            />
          </div>
        )}

        <div className="bg-white p-6 shadow rounded-md">
          <h2 className="text-base font-medium mb-4">Timing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">From</label>
              <input
                type="time"
                value={schedules[activeSchedule - 1]?.fromTime}
                onChange={(e) =>
                  setSchedules((prevSchedules) =>
                    prevSchedules.map((schedule, idx) =>
                      idx === activeSchedule - 1
                        ? { ...schedule, fromTime: e.target.value }
                        : schedule
                    )
                  )
                }
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#16C47F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">To</label>
              <input
                type="time"
                value={schedules[activeSchedule - 1]?.toTime}
                onChange={(e) =>
                  setSchedules((prevSchedules) =>
                    prevSchedules.map((schedule, idx) =>
                      idx === activeSchedule - 1
                        ? { ...schedule, toTime: e.target.value }
                        : schedule
                    )
                  )
                }
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-text-[#16C47F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Timezone</label>
              <div className="relative">
                <select
                  value={schedules[activeSchedule - 1]?.timezone}
                  onChange={(e) =>
                    setSchedules((prevSchedules) =>
                      prevSchedules.map((schedule, idx) =>
                        idx === activeSchedule - 1
                          ? { ...schedule, timezone: e.target.value }
                          : schedule
                      )
                    )
                  }
                  className="w-full border border-gray-300 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-text-[#16C47F]"
                >
                  {/* Map through the timezones array to create the options dynamically */}
                  {timezones.map((timezone, index) => (
                    <option key={index} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-md">
          <h2 className="text-base font-medium mb-4">Days</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(selectedDays).map((day) => (
              <label key={day} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDays[day]}
                  onChange={() => handleDayToggle(day)}
                  className="form-checkbox h-4 w-4 text-[#16C47F] border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm font-medium">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-start">
          <button onClick={handleSaveSchedules} className="flex items-center cursor-pointer bg-[#16C47F] hover:bg-[#FF9D23] text-white px-6 py-2 rounded-md focus:outline-none">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleForm;
