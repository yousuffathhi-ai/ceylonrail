import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION = `You are the official "Ceylon Rail Conductor AI", an authoritative, courteous, and deeply knowledgeable railway travel guide for Sri Lanka Railways (SLR / CGR).

Your knowledge covers:
- The 5 Major Lines: Main Line (Colombo to Badulla), Coastal Line (Colombo to Matara/Beliatta), Northern Line (Colombo to Anuradhapura/Jaffna), Eastern Line (Colombo to Trincomalee/Batticaloa), and Kelani Valley Line (Colombo to Avissawella).
- Legendary Trains: Podi Menike (1015/1016), Udarata Menike (1005/1006), Yal Devi (4017/4018), Samudra Devi (8760), Ruhunu Kumari (8056), Galu Kumari (8040), Uthaya Devi (6011), and Night Mail sleepers.
- Iconic Landmarks: Demodara Nine Arch Bridge ("Bridge in the Sky"), Demodara Spiral Loop, Pattipola summit (1,898m / 6,227ft - highest broad gauge point in the Commonwealth), Kadugannawa Pass, and Great Western.
- Photography & Scenic Seat Tips:
  - Colombo to Kandy: Right side for Kadugannawa pass views.
  - Kandy to Nanu Oya: Right side for waterfalls and tea carpet vistas.
  - Nanu Oya to Ella: Left side for St. Clair/Devon distant views and approaching Ella Gap and Nine Arch Bridge.
  - Coastal Line: Right side going South (Colombo to Galle/Matara) for sea views directly beside the waves!
- Ticketing & Booking:
  - Official SLR portal: seatreservation.railway.gov.lk
  - Advance reservations open 30 days prior at 10:00 AM Sri Lanka time.
  - 1st Class Observation Saloon has big panoramic windows at the rear of the train.
  - 2nd Class reserved seats are favored by photographers because windows can be opened.
  - Night Mail has 1st Class sleeping berths with linen.

Tone: Warm, vintage Sri Lankan hospitality, professional, poetic yet precise with departure times and platform advice. Keep answers crisp and formatted with bullet points where helpful.`;

export async function askCeylonConductor(userMessage: string, history: Array<{ role: string; content: string }> = []): Promise<string> {
  const client = getGenAI();

  if (!client) {
    return generateFallbackConductorResponse(userMessage);
  }

  try {
    const formattedContents = [
      ...history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || generateFallbackConductorResponse(userMessage);
  } catch (error) {
    console.error('Error in Gemini Conductor call:', error);
    return generateFallbackConductorResponse(userMessage);
  }
}

function generateFallbackConductorResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('side') || lower.includes('window') || lower.includes('photo') || lower.includes('view')) {
    return `Ayubowan! For the finest panoramic photography on Ceylon Rail:

• **Colombo to Kandy / Nanu Oya**: Sit on the **RIGHT side** of the carriage to see the dramatic drops of the Kadugannawa incline and lush terraced tea valleys.
• **Nanu Oya to Ella / Badulla**: Sit on the **LEFT side** as the train curves around Ella Gap and approaches the world-famous Demodara Nine Arch Bridge.
• **Coastal Line (Colombo to Galle/Matara)**: Sit on the **RIGHT side** facing forward to watch the Indian Ocean surf breaking just meters from the tracks!

*Tip:* 2nd Class reserved seats are ideal for photographers since their windows open fully for clear shots!`;
  }

  if (lower.includes('ticket') || lower.includes('book') || lower.includes('reserve') || lower.includes('cost') || lower.includes('price')) {
    return `Greetings traveler! Here is the official booking advice for Sri Lanka Railways:

• **Online Portal**: You can reserve 1st, 2nd, and 3rd Class reserved seats directly at **seatreservation.railway.gov.lk** or through Sri Lankan telco services (Mobitel/Dialog).
• **Booking Window**: Online bookings open **30 days in advance at 10:00 AM** Sri Lanka Time. Observation Saloon and 1st Class AC tickets on Podi Menike and Udarata Menike sell out within minutes, so book promptly!
• **Unreserved Tickets**: If reserved tickets are sold out, 2nd and 3rd class unreserved tickets can be bought at the station counter on the day of departure.`;
  }

  if (lower.includes('nine arch') || lower.includes('ella') || lower.includes('bridge')) {
    return `The Demodara Nine Arch Bridge ("Bridge in the Sky") is one of Sri Lanka's greatest architectural marvels:

• Built in 1921 between Ella and Demodara stations without a single steel beam—only solid granite blocks and brick cement.
• **Best Trains to See It**:
  - **Podi Menike (Train 1015)** crosses over the bridge around **15:25 - 15:35**.
  - **Udarata Menike (Train 1005)** crosses around **19:15**.
  - **Podi Menike return (Train 1016)** departs Ella at **09:27** in the morning light.
• You can stand safely on the tea plantation ridges next to the viaduct for the postcard photograph!`;
  }

  if (lower.includes('galle') || lower.includes('coast') || lower.includes('matara') || lower.includes('beach')) {
    return `For the Coastal Line:

• Take **Express 8051 (departs Colombo Fort at 06:55)** or the legendary **Ruhunu Kumari (15:40)** or **Samudra Devi (17:20)**.
• The train runs right alongside the shoreline from Mount Lavinia all the way through Hikkaduwa and Galle.
• A 2nd Class ticket from Colombo to Galle is approximately **1,000 LKR**, reaching Galle Fort in under 2.5 hours on express services!`;
  }

  return `Ayubowan and welcome aboard Ceylon Rail! I am your AI Conductor. 

You can ask me about:
• Optimal departure times from Colombo Fort, Kandy, Galle, Ella, or Jaffna
• Which side of the carriage provides the best photography views
• The history of legendary trains like Podi Menike, Udarata Menike, and Yal Devi
• How to book official online seat reservations 30 days in advance
• Baggage guidelines and station platform transfers

Where would you like to journey across the island today?`;
}
