import React, { useState } from 'react';
import {
  Lightbulb,
  Camera,
  Ticket,
  CloudFog,
  Luggage,
  Coffee,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Compass,
} from 'lucide-react';
import { Language } from '../../types';

interface TravelTipsSectionProps {
  language: Language;
}

interface TravelTip {
  id: string;
  category: 'tourist' | 'commuter' | 'general';
  icon: React.ReactNode;
  tag: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  actionableNote?: Record<Language, string>;
}

const TRAVEL_TIPS: TravelTip[] = [
  {
    id: 'tip-reservation',
    category: 'tourist',
    icon: <Ticket className="w-4 h-4 text-[#D4A359]" />,
    tag: '30-Day Booking Window',
    title: {
      en: 'Reserve 1st & 2nd Class Seats 30 Days Ahead',
      si: 'දින 30 කට පෙර 1 සහ 2 පන්තියේ ආසන වෙන්කරවා ගන්න',
      ta: '30 நாட்களுக்கு முன்பே 1 மற்றும் 2 ஆம் வகுப்பு இருக்கைகளை முன்பதிவு செய்யவும்',
    },
    description: {
      en: 'Online seat reservations for scenic trains (Ella Odyssey, Podi Menike, Udarata Menike) open exactly 30 days prior to travel at 10:00 AM Sri Lanka Time (IST). Tickets for 1st AC and Observation Saloons sell out within minutes.',
      si: 'ඇල්ල ඔඩෙසි, පොඩි මැණිකේ සහ උඩරට මැණිකේ දුම්රිය සඳහා ආසන වෙන්කිරීම ගමනට දින 30 කට පෙර උදෑසන 10:00 ට විවෘත වේ. පළමු පන්තියේ නිරීක්ෂණ මැදිරි ඉතා ඉක්මනින් අවසන් වේ.',
      ta: 'எல்லா ஒடிசி, பொடி மெனிகே போன்ற புகழ்பெற்ற ரயில்களுக்கான இருக்கை முன்பதிவுகள் பயணத்திற்கு 30 நாட்களுக்கு முன் காலை 10:00 மணிக்கு தொடங்கும்.',
    },
    actionableNote: {
      en: 'Tip: Use the official SLR Seat Reservation portal (seatreservation.railway.gov.lk) or dial 365 (Mobitel) / 444 (Dialog).',
      si: 'ඉඟිය: නිල SLR වෙබ් අඩවිය හෝ 365 / 444 අංක අමතා වෙන්කරවා ගන්න.',
      ta: 'குறிப்பு: உத்தியோகபூர்வ ரயில்வே தளம் அல்லது 365/444 ஐ டயல் செய்யவும்.',
    },
  },
  {
    id: 'tip-weather-clothing',
    category: 'tourist',
    icon: <CloudFog className="w-4 h-4 text-[#5B7B6E]" />,
    tag: 'Highland Microclimates',
    title: {
      en: 'Pack a Fleece for Pattipola & Nanu Oya',
      si: 'පත්තිපොළ සහ නානුඔය සඳහා උණුසුම් ඇඳුම් රැගෙන යන්න',
      ta: 'பட்டிபொல மற்றும் நானு ஓயாவுக்கு கம்பளி ஆடைகளை எடுத்துச் செல்லுங்கள்',
    },
    description: {
      en: 'While Colombo and the coast are tropical at 28–32°C, the railway climbs to 1,898 m at Pattipola. Sudden cold highland mist and rain can drop temperatures to 10–14°C in Ohiya, Ambewela, and Nuwara Eliya.',
      si: 'කොළඹ උණුසුම් වුවද, පත්තිපොළ සහ ඔහිය ප්‍රදේශවල උෂ්ණත්වය සෙල්සියස් 10–14°C දක්වා පහත වැටේ. ජැකට්ටුවක් හෝ උණුසුම් ඇඳුමක් ළඟ තබා ගන්න.',
      ta: 'கொழும்பு வெப்பமாக இருந்தாலும், பட்டிபொல உச்சி பகுதியில் வெப்பநிலை 10-14 டிகிரி செல்சியஸ் வரை குறையும். சூடான உடைகளை எடுத்துச் செல்லுங்கள்.',
    },
    actionableNote: {
      en: 'Action: Keep a light waterproof jacket or windbreaker in your daypack, especially for morning train rides.',
      si: 'ක්‍රියාමාර්ගය: සැහැල්ලු වැහි කබායක් හෝ ජැකට්ටුවක් අත්බෑගයේ තබා ගන්න.',
      ta: 'செயல்: லேசான மழைக்கோட் அல்லது ஸ்வெட்டரை எளிதில் எடுக்கும் வகையில் வைக்கவும்.',
    },
  },
  {
    id: 'tip-doorway-safety',
    category: 'tourist',
    icon: <Camera className="w-4 h-4 text-[#E07A5F]" />,
    tag: 'Photography & Safety',
    title: {
      en: 'Doorway Photography & Tunnel Clearances',
      si: 'දුම්රිය දොරකඩ ඡායාරූප ගැනීමේදී විමසිලිමත් වන්න',
      ta: 'வாசல் புகைப்படங்கள் எடுக்கும் போது எச்சரிக்கையாக இருங்கள்',
    },
    description: {
      en: 'Hanging slightly from carriage doorways for photos of the Nine Arch Bridge or Kadugannawa Pass is world-famous. However, trackside signal poles, overhanging branches, and narrow rock tunnel walls are dangerously close.',
      si: 'දෙමෝදර නව ආරුක්කු පාලම සහ කඩුගන්නාවේදී දොරකඩ සිට ඡායාරූප ගැනීම සුලබ වුවද, උමං මාර්ග ගල් බිත්ති සහ සංඥා කණු ඉතා ළඟින් පිහිටා ඇති බැවින් දැඩි සැලකිල්ලක් දක්වන්න.',
      ta: 'ஒன்பது வளைவு பாலத்தில் வாசலில் நின்று படம் எடுப்பது அழகாக இருந்தாலும், குறுகிய சுரங்கப்பாதை சுவர்கள் மற்றும் சிக்னல் கம்பங்கள் மிக அருகில் உள்ளன.',
    },
    actionableNote: {
      en: 'Safety Rule: Always step fully back inside when entering any of the 46 tunnels between Rambukkana and Badulla.',
      si: 'ආරක්ෂිත උපදෙස: උමං මාර්ගවලට ඇතුළු වීමට පෙර වහාම මැදිරිය තුළට පියවර තබන්න.',
      ta: 'பாதுகாப்பு விதி: சுரங்கப்பாதைகளுக்குள் நுழையும் போது எப்போதும் உள்ளே செல்லவும்.',
    },
  },
  {
    id: 'tip-peak-hours',
    category: 'commuter',
    icon: <Clock className="w-4 h-4 text-[#C88A35]" />,
    tag: 'Rush Hour Avoidance',
    title: {
      en: 'Colombo Fort Commuter Peak Hours',
      si: 'කොළඹ කොටුව කාර්යබහුල වේලාවන් මගහැරීම',
      ta: 'கொழும்பு கோட்டை நெரிசல் நேரங்கள்',
    },
    description: {
      en: 'Suburban trains along the Coastal Line (Panadura/Kalutara) and Main Line (Gampaha/Polgahawela) are heavily packed between 07:00–08:45 AM incoming to Fort, and 16:30–18:30 PM outgoing.',
      si: 'උදෑසන 07:00–08:45 සහ සවස 16:30–18:30 අතර කාර්යාල දුම්රිය අධික ලෙස පිරී යයි. නිස්කලංක ගමනකට උදෑසන 09:30 න් පසු දුම්රිය තෝරාගන්න.',
      ta: 'கடற்கரை மற்றும் பிரதான பாதைகளில் காலை 7:00-8:45 மற்றும் மாலை 4:30-6:30 நெரிசல் மிகுந்தது. ஓய்வான பயணத்திற்கு காலை 9:30க்கு மேல் பயணிக்கவும்.',
    },
    actionableNote: {
      en: 'Commuter Hack: Travel between 09:30 AM and 03:00 PM for open seats and spacious scenic views.',
      si: 'ඉඟිය: උදෑසන 09:30 සිට පස්වරු 03:00 දක්වා කාලය තුළ ගමන් කිරීම වඩාත් පහසුය.',
      ta: 'குறிப்பு: காலை 9:30 முதல் பிற்பகல் 3:00 மணி வரை பயணித்தால் எளிதாக இருக்கை கிடைக்கும்.',
    },
  },
  {
    id: 'tip-chai-wade',
    category: 'general',
    icon: <Coffee className="w-4 h-4 text-[#758A80]" />,
    tag: 'Platform Vendors',
    title: {
      en: 'Taste Fresh "Wade" & Hot Ceylon Tea',
      si: 'උණුසුම් වඩේ සහ තේ රස විඳින්න',
      ta: 'சூடான வடை மற்றும் இலங்கை தேநீர் ருசியுங்கள்',
    },
    description: {
      en: 'At major stations like Polgahawela, Rambukkana, and Nawalapitiya, licensed platform vendors board the train selling spicy crispy dhal wade, freshly roasted peanuts, and piping-hot Ceylon ginger milk tea.',
      si: 'පොල්ගහවෙල, රඹුක්කන සහ නාවලපිටිය දුම්රිය ස්ථානවලදී මැදිරියට පැමිණෙන වෙළෙන්දන්ගෙන් උණුසුම් පරිප්පු වඩේ සහ ඉඟුරු තේ මිලදී ගත හැකිය.',
      ta: 'பொல்கஹவெல, ரம்புக்கனை போன்ற முக்கிய நிலையங்களில் சூடான பருப்பு வடை, வறுத்த வேர்க்கடலை மற்றும் இஞ்சி தேநீர் விற்கப்படும்.',
    },
    actionableNote: {
      en: 'Cash Tip: Keep small Sri Lankan Rupee currency notes (Rs. 50, 100, 500) handy as vendors do not accept cards.',
      si: 'මුදල් ඉඟිය: කුඩා රුපියල් 50, 100 නෝට්ටු ළඟ තබා ගන්න.',
      ta: 'குறிப்பு: சிறிய ரூபாய் நோட்டுகளை (ரூ. 50, 100) கையில் வைத்திருங்கள்.',
    },
  },
  {
    id: 'tip-luggage-lofts',
    category: 'commuter',
    icon: <Luggage className="w-4 h-4 text-[#173024]" />,
    tag: 'Baggage Allowance',
    title: {
      en: 'Overhead Lofts vs. Guard Van Carriage',
      si: 'ගමන් මලු සහ බඩු ගබඩා මැදිරි',
      ta: 'பயணப்பொதிகள் மற்றும் பிரேக் வேன்',
    },
    description: {
      en: 'Standard overhead luggage racks comfortably fit backpacks and medium trolley suitcases up to 35 kg. For large surfboards (headed to Weligama, Arugam Bay) or oversized trunks, check them into the rear Guard Van for a nominal fee.',
      si: 'සාමාන්‍ය ගමන් මලු රාක්කවල බෑග් තැබිය හැක. සර්ෆින් ලෑලි හෝ විශාල පෙට්ටි Guard Van භාණ්ඩ මැදිරියට භාර දිය හැක.',
      ta: '35 கிலோ வரை உள்ள பைகளை மேலே வைக்கலாம். பெரிய சர்பிங் பலகைகளை கார்ட் வேனில் சிறிய கட்டணத்தில் பதிவு செய்யலாம்.',
    },
    actionableNote: {
      en: 'Rule: Guard Van parcels must be tagged at the station parcels counter 30 minutes before train departure.',
      si: 'රීතිය: පිටත්වීමට විනාඩි 30 කට පෙර පාර්සල් කවුන්ටරයට භාර දෙන්න.',
      ta: 'விதி: ரயில் புறப்படுவதற்கு 30 நிமிடங்களுக்கு முன் பார்சல் கவுண்டரில் பதிவு செய்ய வேண்டும்.',
    },
  },
];

export const TravelTipsSection: React.FC<TravelTipsSectionProps> = ({ language }) => {
  const [filter, setFilter] = useState<'all' | 'tourist' | 'commuter'>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>(TRAVEL_TIPS[0].id);

  const filteredTips = TRAVEL_TIPS.filter((tip) => {
    if (filter === 'all') return true;
    return tip.category === filter || tip.category === 'general';
  });

  return (
    <section className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#DFD5C2] shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E1D3]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#D4A359]/20 text-[#C88A35]">
            <Lightbulb className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#173024]">
              {language === 'si'
                ? 'ශ්‍රී ලංකා දුම්රිය ගමන් උපදෙස්'
                : language === 'ta'
                ? 'இலங்கை ரயில் பயண வழிகாட்டி மற்றும் குறிப்புகள்'
                : 'Sri Lanka Railways Travel Tips & Advice'}
            </h2>
            <p className="text-[11px] text-[#7A7468]">
              Contextual guidance for scenic tourists, backpackers & daily commuters
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#ECE5D7] p-1 rounded-full text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] ${
              filter === 'all'
                ? 'bg-[#173024] text-white shadow-xs font-semibold'
                : 'text-[#615C53] hover:text-[#173024]'
            }`}
          >
            All Tips
          </button>
          <button
            type="button"
            onClick={() => setFilter('tourist')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] ${
              filter === 'tourist'
                ? 'bg-[#173024] text-white shadow-xs font-semibold'
                : 'text-[#615C53] hover:text-[#173024]'
            }`}
          >
            Scenic Tourists
          </button>
          <button
            type="button"
            onClick={() => setFilter('commuter')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] ${
              filter === 'commuter'
                ? 'bg-[#173024] text-white shadow-xs font-semibold'
                : 'text-[#615C53] hover:text-[#173024]'
            }`}
          >
            Commuters
          </button>
        </div>
      </div>

      {/* Tip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTips.map((tip) => {
          const isExpanded = expandedTipId === tip.id;
          return (
            <div
              key={tip.id}
              className="bg-[#F6F1E7] border border-[#DDD3BF] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between transition-all hover:border-[#758A80]/60 text-[#1F2923]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#825B16] bg-[#EEDCB5] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {tip.icon}
                    <span>{tip.tag}</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono text-[#8C8578]">
                    {tip.category === 'tourist' ? 'Scenic' : tip.category === 'commuter' ? 'Commuter' : 'General'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xs sm:text-sm text-[#173024] leading-snug">
                  {tip.title[language] || tip.title.en}
                </h3>

                <p className="text-xs text-[#524E46] mt-1.5 leading-relaxed">
                  {tip.description[language] || tip.description.en}
                </p>

                {isExpanded && tip.actionableNote && (
                  <div className="mt-2.5 p-2 rounded-lg bg-[#EAE2D2] border border-[#D8CEBA] text-[11px] text-[#1E3B2C] font-medium animate-fadeIn">
                    {tip.actionableNote[language] || tip.actionableNote.en}
                  </div>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#E3D9C5] flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="text-[#758A80] hover:text-[#173024] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>{isExpanded ? 'Show Less' : 'Conductor Insight'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] text-[#8C8578] font-sans">Official SLR Regulation</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
