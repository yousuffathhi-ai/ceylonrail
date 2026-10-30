import React, { useState, useEffect } from 'react';
import {
  Compass,
  Mountain,
  Train,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Camera,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';

interface HeroBannerProps {
  language: Language;
  onExploreRoute: (from: string, to: string) => void;
  onOpenScenicGuide?: () => void;
}

export interface AuthenticHeroSlide {
  id: string;
  category: 'trains' | 'landmarks';
  title: string;
  subtitle: string;
  train: string;
  route: string;
  origin: string;
  destination: string;
  image: string;
  fallbackImage: string;
  badge: string;
  elevation: string;
  scenicTip: string;
}

const AUTHENTIC_HERO_SLIDES: AuthenticHeroSlide[] = [
  {
    id: 'samudra-devi',
    category: 'trains',
    title: 'Samudra Devi — Ocean Queen Express',
    subtitle: 'Coastal Line flagship hauled by Class M11 #952, thundering right along the Indian Ocean surf and palm shores',
    train: 'Class M11 #952 Heavy Diesel Locomotive',
    route: 'Colombo Fort ➔ Panadura ➔ Kalutara ➔ Galle',
    origin: 'Colombo Fort',
    destination: 'Galle',
    image: '/public/assets/aistudio/samudhradevi_f81d0624.jpg',
    fallbackImage: '/images/samudra_devi_coast.jpg',
    badge: 'Coastal Line Flagship',
    elevation: 'Sea Level (3 m)',
    scenicTip: 'Best view: Sit on the Right-hand side traveling South for uninterrupted views of breaking surf and coconut palms.',
  },
  {
    id: 'nine-arch',
    category: 'landmarks',
    title: 'Demodara Nine Arch Bridge (Bridge in the Sky)',
    subtitle: '1921 British Ceylon stone masonry viaduct standing 24 meters tall, constructed purely with rock and brick without steel',
    train: 'Class S14 Main Line Hill Country Service',
    route: 'Ella ➔ Demodara ➔ Badulla',
    origin: 'Ella',
    destination: 'Badulla',
    image: '/public/assets/aistudio/night_Mail_9f0d754b.jpeg',
    fallbackImage: '/images/nine_arch_bridge.jpeg',
    badge: 'World Heritage Viaduct',
    elevation: '1,114 m',
    scenicTip: 'Best view: Sit on the Left-hand side when traveling towards Demodara to look directly down onto the lush tea valley.',
  },
  {
    id: 'summit',
    category: 'landmarks',
    title: 'Pattipola Summit Level — 1,898 m (6,226 ft)',
    subtitle: 'Highest railway summit in Sri Lanka & highest broad gauge summit across British Commonwealth Ceylon',
    train: 'Class S14 DMU #975 "Ella Odyssey"',
    route: 'Colombo Fort ➔ Kandy ➔ Nanu Oya ➔ Pattipola ➔ Ella',
    origin: 'Colombo Fort',
    destination: 'Ella',
    image: '/public/assets/aistudio/ELLA-ODYSSEY_66aab7ee.jpg',
    fallbackImage: '/images/hero_summit_s14.jpg',
    badge: 'Official SLR Main Line Summit',
    elevation: '1,898 m',
    scenicTip: 'Ascending from Nanu Oya: Right-hand side looks across the mist-shrouded Horton Plains cloud forests.',
  },
  {
    id: 'yal-devi',
    category: 'trains',
    title: 'Yal Devi — Northern Line Queen',
    subtitle: 'Legendary express connecting Colombo with Anuradhapura, Jaffna, and the northern railhead at Kankesanthurai',
    train: 'Class S13 DMU #11958 Northern Express',
    route: 'Colombo Fort ➔ Maho ➔ Anuradhapura ➔ Jaffna ➔ Kankesanthurai',
    origin: 'Colombo Fort',
    destination: 'Jaffna',
    image: '/public/assets/aistudio/yaldevi_c87a561e.jpeg',
    fallbackImage: '/images/yaldevi_kks.jpeg',
    badge: 'Northern Cultural Lifeline',
    elevation: '8 m (Jaffna Peninsula)',
    scenicTip: 'Witness the iconic Elephant Pass lagoon crossing as the track enters the palmyrah landscapes of the North.',
  },
  {
    id: 'galle-fort',
    category: 'landmarks',
    title: 'Galle Dutch Fort & Coastal Ramparts',
    subtitle: '17th-century UNESCO World Heritage fortress and iconic white lighthouse guarding the southern shore',
    train: 'Ruhunu Kumari & Coastal Commuter Trains',
    route: 'Colombo Fort ➔ Bentota ➔ Hikkaduwa ➔ Galle ➔ Matara',
    origin: 'Colombo Fort',
    destination: 'Galle',
    image: '/public/assets/aistudio/galle_eafb2d10.jpeg',
    fallbackImage: '/images/galle_lighthouse.jpeg',
    badge: 'UNESCO World Heritage Gateway',
    elevation: '4 m',
    scenicTip: 'The rail track hugs the golden beaches of Bentota and Hikkaduwa before curving into Galle harbor.',
  },
  {
    id: 'kandy-temple',
    category: 'landmarks',
    title: 'Sri Dalada Maligawa — Kandy Hill Capital',
    subtitle: 'Sacred Temple of the Tooth Relic and royal lake at the terminus of the historic 1867 Ceylon Government Railway extension',
    train: 'Udarata Menike & Senkadagala Menike',
    route: 'Colombo Fort ➔ Rambukkana ➔ Kadugannawa ➔ Kandy',
    origin: 'Colombo Fort',
    destination: 'Kandy',
    image: '/public/assets/aistudio/kandy_b24d3ea7.jpeg',
    fallbackImage: '/images/kandy_temple.jpeg',
    badge: 'Historic 1867 Rail Terminus',
    elevation: '500 m',
    scenicTip: 'Marvel at the climb through Kadugannawa Incline and the dramatic Bible Rock vista from the right windows.',
  },
  {
    id: 'nanu-oya',
    category: 'landmarks',
    title: 'Nanu Oya Junction — Gateway to Nuwara Eliya',
    subtitle: 'Charming colonial hill station surrounded by manicured tea estates, English gardens, and mountain mist',
    train: 'Class S12 & S14 Hill Express',
    route: 'Peradeniya ➔ Hatton ➔ Talawakele ➔ Nanu Oya',
    origin: 'Colombo Fort',
    destination: 'Nanu Oya',
    image: '/public/assets/aistudio/nanuoya_07e1686c.jpeg',
    fallbackImage: '/images/nanuoya_station.jpeg',
    badge: 'Tea Estate Junction',
    elevation: '1,613 m',
    scenicTip: 'St. Clair and Devon waterfalls are visible between Hatton and Nanu Oya from the right-hand carriage side.',
  },
  {
    id: 'rajarata-rajini',
    category: 'trains',
    title: 'Rajarata Rajini — Heritage of the King\'s Realm',
    subtitle: 'Class M2 Canadian GM-EMD diesel electric veteran serving the ancient capital of Anuradhapura',
    train: 'Class M2 Canadian GM-EMD (Inaugurated 1954)',
    route: 'Veyangoda ➔ Polgahawela ➔ Maho ➔ Anuradhapura',
    origin: 'Colombo Fort',
    destination: 'Anuradhapura',
    image: '/public/assets/aistudio/rajataranjini_9e530ca9.jpeg',
    fallbackImage: '/images/rajarata_heritage.jpeg',
    badge: 'SLR Living Legend (1954)',
    elevation: '81 m',
    scenicTip: 'Look out for ancient artificial lakes (Wewas) reflecting the stupas as the train nears the sacred city.',
  },
  {
    id: 'uthaya-devi',
    category: 'trains',
    title: 'Uthaya Devi (Queen of Dawn) — Eastern Express',
    subtitle: 'Heavy Class M8 diesel electric locomotive #595 departing for Batticaloa and the east coast beaches',
    train: 'Class M8 Heavy Diesel Electric #595',
    route: 'Colombo Fort ➔ Maho ➔ Gal Oya ➔ Batticaloa',
    origin: 'Colombo Fort',
    destination: 'Batticaloa',
    image: '/public/assets/aistudio/udayadevi_3da9667f.jpg',
    fallbackImage: '/images/uthayadevi_loco.jpg',
    badge: 'Eastern Dawn Express',
    elevation: '12 m',
    scenicTip: 'Passes directly through the Minneriya elephant wildlife corridor where wild elephants frequently graze.',
  },
  {
    id: 'trinco-bay',
    category: 'landmarks',
    title: 'Trincomalee Bay & Gokanna Harbor',
    subtitle: 'Eastern Line terminus overlooking the 5th deepest natural harbor in the world and turquoise coastal beaches',
    train: 'Night Mail & Eastern Intercity',
    route: 'Colombo Fort ➔ Gal Oya Junction ➔ Trincomalee',
    origin: 'Colombo Fort',
    destination: 'Trincomalee',
    image: '/public/assets/aistudio/trincomalee_6c20a21d.jpeg',
    fallbackImage: '/images/trincomalee_bay.jpeg',
    badge: 'Natural Harbor Terminus',
    elevation: '2 m',
    scenicTip: 'Arrives in early morning near Nilaveli beach, Marble Beach, and Pigeon Island marine sanctuary.',
  },
  {
    id: 'podi-menike',
    category: 'trains',
    title: 'Podi Menike — Hand-Carved Mountain Tunnels',
    subtitle: 'Class S14 #977 emerging through 1890s hand-chiseled solid granite tunnels of the Central Province',
    train: 'Class S14 DMU #977 "Podi Menike"',
    route: 'Colombo Fort ➔ Kandy ➔ Nanu Oya ➔ Badulla',
    origin: 'Colombo Fort',
    destination: 'Badulla',
    image: '/public/assets/aistudio/podimenikkei_05f9d782.jpeg',
    fallbackImage: '/images/hero_tunnel_s14.jpg',
    badge: 'Highland Tunnel Passages',
    elevation: '1,450 m',
    scenicTip: 'Prepare for Tunnel #18, where the train emerges from mountain fog directly onto the sunlit plains of Wellawaya.',
  },
  {
    id: 'udarata-menike',
    category: 'trains',
    title: 'Udarata Menike — Semaphore Heritage Line',
    subtitle: 'Class S14 #971 passing historical lower-quadrant mechanical semaphore railway signals near Hatton',
    train: 'Class S14 DMU #971 "Udarata Menike"',
    route: 'Colombo Fort ➔ Peradeniya ➔ Hatton ➔ Badulla',
    origin: 'Colombo Fort',
    destination: 'Kandy',
    image: '/public/assets/aistudio/udratamenikkei_70c23443.jpeg',
    fallbackImage: '/images/hero_semaphore_s14.jpg',
    badge: 'SLR Heritage Safety System',
    elevation: '1,260 m',
    scenicTip: 'Watch the station master exchange the brass tablet token as the train enters the single-line mountain loop.',
  },
  {
    id: 'ella-retreat',
    category: 'landmarks',
    title: 'Ella Mountain Sanctuary & Cloud Forest',
    subtitle: 'Serene illuminated alpine lodge amidst Ceylon tea plantations, mist-draped pines, and Ella Rock peaks',
    train: 'Highland Night Mail & Ella Odyssey',
    route: 'Colombo Fort ➔ Nanu Oya ➔ Ohiya ➔ Ella',
    origin: 'Colombo Fort',
    destination: 'Ella',
    image: '/public/assets/aistudio/ella_bd61a24a.jpeg',
    fallbackImage: '/images/ella_mountains.jpeg',
    badge: 'Ella Rock & Mountain Gap',
    elevation: '1,041 m',
    scenicTip: 'Watch the morning mountain mist roll through the Ella Gap as the train rounds the mountain contours.',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  language,
  onExploreRoute,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trains' | 'landmarks'>('all');
  const [activeSlideId, setActiveSlideId] = useState<string>('samudra-devi');

  const filteredSlides = AUTHENTIC_HERO_SLIDES.filter(
    (s) => selectedCategory === 'all' || s.category === selectedCategory
  );

  // Active slide
  const currentSlide =
    filteredSlides.find((s) => s.id === activeSlideId) || filteredSlides[0] || AUTHENTIC_HERO_SLIDES[0];

  const currentIdx = filteredSlides.findIndex((s) => s.id === currentSlide.id);

  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % filteredSlides.length;
    setActiveSlideId(filteredSlides[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (currentIdx - 1 + filteredSlides.length) % filteredSlides.length;
    setActiveSlideId(filteredSlides[prevIdx].id);
  };

  return (
    <section className="relative rounded-2xl overflow-hidden border-2 border-[#D5CAA4] bg-[#173024] shadow-md text-[#F4F0EA]">
      {/* Category Filter Selector Header */}
      <div className="bg-[#102219] px-4 py-2.5 border-b border-[#244233] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#D4A359]" />
          <span className="font-serif font-bold text-white text-xs sm:text-sm tracking-wide">
            Authentic Sri Lanka Railways Gallery
          </span>
          <span className="hidden sm:inline bg-[#1A382B] text-[#9FE8BC] font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2F6548]">
            {filteredSlides.length} Real Photos
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0A1610] p-1 rounded-xl border border-[#274535]">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setActiveSlideId(AUTHENTIC_HERO_SLIDES[0].id);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#173024] text-[#D4A359] border border-[#D4A359]/50 shadow-2xs'
                : 'text-[#9BB5A7] hover:text-white'
            }`}
          >
            All Highlights ({AUTHENTIC_HERO_SLIDES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('trains');
              const firstTrain = AUTHENTIC_HERO_SLIDES.find((s) => s.category === 'trains');
              if (firstTrain) setActiveSlideId(firstTrain.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'trains'
                ? 'bg-[#173024] text-[#D4A359] border border-[#D4A359]/50 shadow-2xs'
                : 'text-[#9BB5A7] hover:text-white'
            }`}
          >
            Trains ({AUTHENTIC_HERO_SLIDES.filter((s) => s.category === 'trains').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('landmarks');
              const firstLandmark = AUTHENTIC_HERO_SLIDES.find((s) => s.category === 'landmarks');
              if (firstLandmark) setActiveSlideId(firstLandmark.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'landmarks'
                ? 'bg-[#173024] text-[#D4A359] border border-[#D4A359]/50 shadow-2xs'
                : 'text-[#9BB5A7] hover:text-white'
            }`}
          >
            Landmarks ({AUTHENTIC_HERO_SLIDES.filter((s) => s.category === 'landmarks').length})
          </button>
        </div>
      </div>

      {/* Main Large Hero Frame */}
      <div className="relative h-80 sm:h-96 md:h-[420px] w-full overflow-hidden bg-[#0A1610]">
        <img
          key={currentSlide.id}
          src={currentSlide.image}
          alt={currentSlide.title}
          className="w-full h-full object-cover object-center transition-all duration-700 animate-fadeIn"
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (e.currentTarget.src !== currentSlide.fallbackImage) {
              e.currentTarget.src = currentSlide.fallbackImage;
            }
          }}
        />

        {/* Solid High-Contrast Gradient Base (No blurry glassmorphism) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1F17] via-[#0E1F17]/65 to-black/35" />

        {/* Top Badges Bar */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12241C] text-[#D4A359] border border-[#D4A359]/70 text-[11px] font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>{currentSlide.badge}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A382B] text-[#9FE8BC] border border-[#2F6548] text-[11px] font-mono font-semibold">
              <Mountain className="w-3.5 h-3.5 text-[#52D288]" />
              <span>{currentSlide.elevation}</span>
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-[#12241C] p-1 rounded-full border border-[#2D4E3D] shadow-xs">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-[#1C372A] hover:bg-[#254C3A] text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold px-2 text-[#D4A359]">
              {currentIdx + 1}/{filteredSlides.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-[#1C372A] hover:bg-[#254C3A] text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Hero Overlay Content - Solid & High Contrast */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-[#E5B25D] font-mono uppercase tracking-wider font-bold">
            <Train className="w-4 h-4 text-[#D4A359]" />
            <span>{currentSlide.train}</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-snug drop-shadow-sm">
              {currentSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#CBD8D1] mt-1 max-w-3xl line-clamp-2">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Route & Scenic Tip Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#254534]">
            <div className="flex items-center gap-2 text-xs text-[#9FE8BC] font-medium max-w-xl">
              <Eye className="w-4 h-4 text-[#D4A359] shrink-0" />
              <span className="line-clamp-1">{currentSlide.scenicTip}</span>
            </div>

            <button
              type="button"
              onClick={() => onExploreRoute(currentSlide.origin, currentSlide.destination)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A359] hover:bg-[#C2924A] text-[#12241C] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-[#12241C]" />
              <span>Search {currentSlide.origin} ➔ {currentSlide.destination}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Thumbnail Carousel Strip (Solid Crisp Styling) */}
      <div className="bg-[#102219] p-2.5 sm:p-3 border-t border-[#244233] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {filteredSlides.map((slide) => {
            const isSelected = slide.id === currentSlide.id;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlideId(slide.id)}
                className={`relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-[#D4A359] ring-2 ring-[#D4A359]/30 scale-102 shadow-md'
                    : 'border-[#2D4D3D] hover:border-[#758A80] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="h-14 sm:h-16 w-full relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (e.currentTarget.src !== slide.fallbackImage) {
                        e.currentTarget.src = slide.fallbackImage;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-1 left-1.5 right-1.5">
                    <span className="text-[10px] font-bold text-white truncate block leading-tight">
                      {slide.title.split('—')[0].trim()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
