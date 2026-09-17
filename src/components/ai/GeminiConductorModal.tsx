import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  Sparkles,
  Train,
  ArrowRight,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, Language } from '../../types';
import { translations } from '../../data/localization';

interface GeminiConductorModalProps {
  onClose: () => void;
  language: Language;
  onSelectRoute?: (from: string, to: string) => void;
}

const INITIAL_MESSAGES: Record<Language, ChatMessage[]> = {
  en: [
    {
      id: 'init-1',
      sender: 'conductor',
      text: `Ayubowan! I am your **Ceylon Rail Conductor AI**. 

Whether you need advice on the world-famous hill country journey to Ella, which carriage side has the finest photography angles, or how to reserve 1st class seats 30 days ahead—I am at your service. How may I assist your Sri Lanka railway adventure today?`,
      timestamp: 'Just now',
    },
  ],
  si: [
    {
      id: 'init-1',
      sender: 'conductor',
      text: `ආයුබෝවන්! මම ඔබගේ **සීලෝන් රේල් කොන්දොස්තර AI** සහායකයා වෙමි. 

ඇල්ල බලා යන කඳුකර දුම්රිය චාරිකාව, ඡායාරූප ගැනීමට සුදුසුම කවුළු පැත්ත, හෝ ආසන වෙන්කරවා ගැනීම පිළිබඳව ඕනෑම ප්‍රශ්නයක් මගෙන් අසන්න!`,
      timestamp: 'දැන්',
    },
  ],
  ta: [
    {
      id: 'init-1',
      sender: 'conductor',
      text: `வணக்கம்! நான் உங்கள் **சிலோன் ரயில் நடத்துனர் AI** உதவியாளர். 

எல்லா மலைநாட்டுப் பயணம், இயற்கை எழில் காட்சிகள், அல்லது இருக்கை முன்பதிவு குறித்து ஏதேனும் உதவி தேவைப்பட்டால் என்னிடம் கேளுங்கள்!`,
      timestamp: 'இப்போது',
    },
  ],
};

const SUGGESTED_PROMPTS = [
  'Which side to sit from Kandy to Ella for best photos?',
  'Best morning train from Colombo to Galle Fort?',
  'How to book Podi Menike Observation Saloon tickets?',
  'What is the elevation and temperature at Nanu Oya?',
  'Plan a 3-day scenic train itinerary across Sri Lanka',
];

export const GeminiConductorModal: React.FC<GeminiConductorModalProps> = ({
  onClose,
  language,
  onSelectRoute,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => INITIAL_MESSAGES[language] || INITIAL_MESSAGES.en);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to server-side /api/conductor
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await fetch('/api/conductor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'Ayubowan! I am currently assisting with timetable operations. Please try again in a moment.';

      // Check if reply mentions a specific route to suggest a quick action
      let action: ChatMessage['suggestedAction'] = undefined;
      const lowerReply = textToSend.toLowerCase();
      if (lowerReply.includes('ella') || lowerReply.includes('badulla')) {
        action = { label: 'Search Colombo ➔ Ella Trains', from: 'Colombo Fort', to: 'Ella' };
      } else if (lowerReply.includes('galle') || lowerReply.includes('matara')) {
        action = { label: 'Search Colombo ➔ Galle Trains', from: 'Colombo Fort', to: 'Galle' };
      } else if (lowerReply.includes('kandy')) {
        action = { label: 'Search Colombo ➔ Kandy Trains', from: 'Colombo Fort', to: 'Kandy' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'conductor',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: action,
        },
      ]);
    } catch (err) {
      console.warn('Conductor fallback triggered:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'conductor',
          text: `Ayubowan! For the scenic Hill Country train to Ella:
• **Podi Menike (05:55 AM)** & **Udarata Menike (09:45 AM)** offer the most spectacular views.
• Sit on the **RIGHT side** climbing from Rambukkana to Hatton, and switch your view to the **LEFT side** as you cross the majestic Demodara Nine Arch Bridge!
• Book online 30 days in advance via **seatreservation.railway.gov.lk** at 10:00 AM IST.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES[language] || INITIAL_MESSAGES.en);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#DFD6C4] h-[88vh] flex flex-col overflow-hidden text-[#1F2923]">
        {/* Modal Header */}
        <div className="bg-[#173024] text-[#F4F0EA] p-3.5 sm:p-4 flex items-center justify-between border-b border-[#2A4C3A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27503B] to-[#14261D] border border-[#3E6B52] flex items-center justify-center text-[#FFE2A4] shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                  {t.aiConductor}
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-[#D4A359]/20 text-[#E7C286] border border-[#D4A359]/30 px-1.5 py-0.5 rounded font-mono">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-[#A7BCB0]">
                {t.aiConductorSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              className="text-[#A7BCB0] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-[#A7BCB0] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-[#F9F6F0]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#173024] text-[#D4A359] flex items-center justify-center shrink-0 border border-[#2F5240] mt-1 shadow-2xs">
                    <Train className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-[#5B7B6E] text-white rounded-br-xs'
                      : 'bg-[#F2ECE1] text-[#24211D] border border-[#DDD5C3] rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line break-words">
                    {msg.text}
                  </div>

                  {msg.suggestedAction && onSelectRoute && (
                    <div className="mt-2.5 pt-2 border-t border-[#D6CDBC]">
                      <button
                        onClick={() => {
                          if (msg.suggestedAction?.from && msg.suggestedAction?.to) {
                            onSelectRoute(msg.suggestedAction.from, msg.suggestedAction.to);
                            onClose();
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#173024] bg-[#DFD6C4] hover:bg-[#D4C9B4] px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#C88A35]" />
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isUser ? 'text-[#D3E0D9]' : 'text-[#857F75]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center text-xs text-[#6B665C]">
              <div className="w-8 h-8 rounded-lg bg-[#173024] text-[#D4A359] flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F2ECE1] border border-[#DDD5C3] rounded-2xl px-3 py-2 rounded-bl-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#758A80] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#758A80] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#758A80] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-[#7A7468]">Checking SLR dispatch & tracks...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-3.5 py-2 bg-[#EFE9DC] border-t border-[#DDD5C3] overflow-x-auto flex gap-1.5 no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] text-[#3E3A33] bg-[#FAF7F0] hover:bg-white border border-[#CFC5B1] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors hover:border-[#758A80] disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#EDE7DA] border-t border-[#D5CCB8] flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={t.askConductor}
            disabled={isLoading}
            className="flex-1 bg-[#FAF7F0] border border-[#C5BBA7] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1F2923] placeholder-[#8A8478] focus:ring-2 focus:ring-[#758A80] outline-none"
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 rounded-xl bg-[#173024] hover:bg-[#204031] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#173024] shadow-sm"
          >
            <Send className="w-4 h-4 text-[#D4A359]" />
          </button>
        </div>
      </div>
    </div>
  );
};
