import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  home: string;
  search: string;
  map: string;
  history: string;
  saved: string;
  from: string;
  to: string;
  date: string;
  today: string;
  tomorrow: string;
  findTrains: string;
  popularJourneys: string;
  nextFromFort: string;
  railwayLines: string;
  allLines: string;
  allTypes: string;
  iceService: string;
  expressService: string;
  nightMail: string;
  normalService: string;
  duration: string;
  departure: string;
  arrival: string;
  classesAvailable: string;
  fareCalculator: string;
  viewStops: string;
  bookTickets: string;
  addToCalendar: string;
  addToTasks: string;
  syncSuccess: string;
  scenicWindowTip: string;
  slrOfficialBooking: string;
  stationDirectory: string;
  elevation: string;
  platforms: string;
  aiConductor: string;
  aiConductorSub: string;
  askConductor: string;
  recentSearches: string;
  bookmarkedTrains: string;
  noSavedYet: string;
  offlineStatus: string;
  onlineSynced: string;
  weatherAlerts: string;
  filterByLine: string;
  filterByType: string;
  swapStations: string;
  clearFilters: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Ceylon Rail',
    tagline: 'Sri Lanka Railways Timetable & Travel Companion',
    home: 'Home',
    search: 'Search',
    map: 'Route Map',
    history: 'Heritage',
    saved: 'Saved',
    from: 'From Station',
    to: 'To Destination',
    date: 'Date of Travel',
    today: 'Today',
    tomorrow: 'Tomorrow',
    findTrains: 'Find Trains',
    popularJourneys: 'Popular Journeys',
    nextFromFort: 'Next Departures from Colombo Fort',
    railwayLines: 'Explore Railway Lines',
    allLines: 'All Lines',
    allTypes: 'All Types',
    iceService: 'Intercity Express (ICE)',
    expressService: 'Express Service',
    nightMail: 'Night Mail Sleeper',
    normalService: 'Slow / Commuter',
    duration: 'Duration',
    departure: 'Departs',
    arrival: 'Arrives',
    classesAvailable: 'Available Classes',
    fareCalculator: 'Fare Calculator',
    viewStops: 'Route & Stops',
    bookTickets: 'Reserve Seats (SLR Portal)',
    addToCalendar: 'Add to Google Calendar',
    addToTasks: 'Add to Google Tasks',
    syncSuccess: 'Departure synced to your Google Calendar!',
    scenicWindowTip: 'Scenic Window Tip',
    slrOfficialBooking: 'Official SLR E-Ticketing Portal',
    stationDirectory: 'Station Directory',
    elevation: 'Elevation',
    platforms: 'Platforms',
    aiConductor: 'Ceylon Rail Conductor AI',
    aiConductorSub: 'Ask about scenic routes, ticket tips & schedules',
    askConductor: 'Ask the Conductor...',
    recentSearches: 'Recent Searches',
    bookmarkedTrains: 'Bookmarked Trains',
    noSavedYet: 'No saved journeys yet. Tap the bookmark icon on any train!',
    offlineStatus: '100% Offline SQLite Cache Ready',
    onlineSynced: 'Live Timetable Synchronized',
    weatherAlerts: 'Live Route Weather & Track Status',
    filterByLine: 'Filter by Line',
    filterByType: 'Train Type',
    swapStations: 'Swap Stations',
    clearFilters: 'Clear Filters',
    close: 'Close',
  },
  si: {
    appName: 'සීලෝන් රේල්',
    tagline: 'ශ්‍රී ලංකා දුම්රිය කාලසටහන සහ සංචාරක මගපෙන්වීම',
    home: 'මුල් පිටුව',
    search: 'සොයන්න',
    map: 'සිතියම',
    history: 'ඉතිහාසය',
    saved: 'සුරැකි',
    from: 'ආරම්භක දුම්රිය ස්ථානය',
    to: 'ගමනාන්තය',
    date: 'ගමන් දිනය',
    today: 'අද',
    tomorrow: 'හෙට',
    findTrains: 'දුම්රිය සොයන්න',
    popularJourneys: 'ජනප්‍රිය ගමන් වාර',
    nextFromFort: 'කොළඹ කොටුවෙන් ඊළඟ දුම්රිය',
    railwayLines: 'දුම්රිය මාර්ග',
    allLines: 'සියලු මාර්ග',
    allTypes: 'සියලු වර්ග',
    iceService: 'අන්තර්නගර සීඝ්‍රගාමී (ICE)',
    expressService: 'සීඝ්‍රගාමී දුම්රිය',
    nightMail: 'රාත්‍රී තැපැල් දුම්රිය',
    normalService: 'සාමාන්‍ය දුම්රිය',
    duration: 'කාලය',
    departure: 'පිටත්වීම',
    arrival: 'ලඟාවීම',
    classesAvailable: 'ලබා ගත හැකි පන්ති',
    fareCalculator: 'ගාස්තු ගණකය',
    viewStops: 'නැවතුම්පොළවල්',
    bookTickets: 'ආසන වෙන්කරවා ගැනීම (SLR)',
    addToCalendar: 'Google දින දර්ශනයට එක් කරන්න',
    addToTasks: 'Google කාර්යයන් වෙත එක් කරන්න',
    syncSuccess: 'ගමන් වාරය Google දින දර්ශනයට එක් කරන ලදී!',
    scenicWindowTip: 'දර්ශනීය කවුළු ඉඟිය',
    slrOfficialBooking: 'නිල ශ්‍රී ලංකා දුම්රිය ප්‍රවේශපත්‍ර වෙබ් අඩවිය',
    stationDirectory: 'දුම්රිය ස්ථාන නාමාවලිය',
    elevation: 'උන්නතාංශය',
    platforms: 'වේදිකා',
    aiConductor: 'සීලෝන් රේල් කොන්දොස්තර AI',
    aiConductorSub: 'දුම්රිය ගමන්, ආසන සහ කාලසටහන් ගැන අසන්න',
    askConductor: 'කොන්දොස්තරගෙන් අසන්න...',
    recentSearches: 'මෑත සෙවීම්',
    bookmarkedTrains: 'සුරැකි දුම්රිය',
    noSavedYet: 'තවමත් සුරැකි ගමන් වාර නොමැත.',
    offlineStatus: 'නොබැඳි දත්ත සූදානම් (Offline SQLite)',
    onlineSynced: 'කාලසටහන යාවත්කාලීනයි',
    weatherAlerts: 'කාලගුණ හා මාර්ග තත්ත්වය',
    filterByLine: 'මාර්ගය අනුව පෙරහන',
    filterByType: 'දුම්රිය වර්ගය',
    swapStations: 'ස්ථාන මාරු කරන්න',
    clearFilters: 'පෙරහන් ඉවත් කරන්න',
    close: 'වසන්න',
  },
  ta: {
    appName: 'சிலோன் ரயில்',
    tagline: 'இலங்கை புகையிரத அட்டவணை மற்றும் பயண வழிகாட்டி',
    home: 'முகப்பு',
    search: 'தேடல்',
    map: 'வரைபடம்',
    history: 'வரலாறு',
    saved: 'சேமித்தவை',
    from: 'புறப்படும் நிலையம்',
    to: 'சேருமிடம்',
    date: 'பயண தேதி',
    today: 'இன்று',
    tomorrow: 'நாளை',
    findTrains: 'ரயில்களைத் தேடுங்கள்',
    popularJourneys: 'பிரபலமான பயணங்கள்',
    nextFromFort: 'கொழும்பு கோட்டையிலிருந்து அடுத்த ரயில்கள்',
    railwayLines: 'புகையிரத பாதைகள்',
    allLines: 'அனைத்து பாதைகள்',
    allTypes: 'அனைத்து வகைகள்',
    iceService: 'நகரிடை விரைவு ரயில் (ICE)',
    expressService: 'விரைவு ரயில்',
    nightMail: 'இரவு தபால் ரயில்',
    normalService: 'சாதாரண ரயில்',
    duration: 'பயண நேரம்',
    departure: 'புறப்பாடு',
    arrival: 'வருகை',
    classesAvailable: 'வகுப்புகள்',
    fareCalculator: 'கட்டண கணக்கீடு',
    viewStops: 'நிலையங்கள் மற்றும் நிறுத்தங்கள்',
    bookTickets: 'இருக்கைகள் முன்பதிவு (SLR)',
    addToCalendar: 'Google காலெண்டரில் சேர்க்கவும்',
    addToTasks: 'Google பணிகளில் சேர்க்கவும்',
    syncSuccess: 'Google காலெண்டரில் பதிவு செய்யப்பட்டது!',
    scenicWindowTip: 'இயற்கைக் காட்சி சாளரக் குறிப்பு',
    slrOfficialBooking: 'அதிகாரப்பூர்வ முன்பதிவு தளம்',
    stationDirectory: 'நிலைய விபரங்கள்',
    elevation: 'உயரம்',
    platforms: 'மேடைகள்',
    aiConductor: 'சிலோன் ரயில் நடத்துனர் AI',
    aiConductorSub: 'பயண வழிகாட்டுதல் மற்றும் அட்டவணை உதவி',
    askConductor: 'நடத்துனரிடம் கேளுங்கள்...',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    bookmarkedTrains: 'சேமிக்கப்பட்ட ரயில்கள்',
    noSavedYet: 'சேமிக்கப்பட்ட பயணங்கள் எதுவும் இல்லை.',
    offlineStatus: 'ஆஃப்லைன் தரவு தயார் (SQLite)',
    onlineSynced: 'அட்டவணை புதுப்பிக்கப்பட்டது',
    weatherAlerts: 'வானிலை மற்றும் பாதை விபரங்கள்',
    filterByLine: 'பாதை வாரியாக வடிக்கவும்',
    filterByType: 'ரயில் வகை',
    swapStations: 'நிலையங்களை மாற்றவும்',
    clearFilters: 'வடிப்பான்களை அழிக்கவும்',
    close: 'மூடுக',
  },
};
