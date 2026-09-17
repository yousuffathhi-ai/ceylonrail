// Local Departure Notification System (15-minute alert before train departure)
import { SavedJourney } from '../types';
import { getBookmarks } from './offlineStorage';

export interface DepartureAlertConfig {
  journeyId: string;
  trainName: string;
  trainId: string;
  fromStation: string;
  departureTime: string;
  travelDate: string;
  leadMinutes: number; // 15 minutes default
  enabled: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'ceylon_rail_departure_alerts';

// Web Audio API station chime generator (authentic gentle two-tone station chime F#5 -> C#5)
export function playStationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Note 1: F#5 (740 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(739.99, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Note 2: C#5 (554 Hz) chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(554.37, now + 0.45);
    gain2.gain.setValueAtTime(0, now + 0.45);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.5);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.45);
    osc2.stop(now + 1.6);
  } catch (err) {
    // Audio context may be restricted before user gesture
  }
}

// Request browser notification permission if available
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string) {
  playStationChime();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'train-departure-alert',
      });
    } catch {
      // Fallback
    }
  }
}

// Load and save alerts
export function getSavedAlerts(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setAlertEnabled(journeyId: string, enabled: boolean) {
  try {
    const current = getSavedAlerts();
    current[journeyId] = enabled;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // fallback
  }
}

export function isAlertEnabled(journeyId: string): boolean {
  const current = getSavedAlerts();
  // By default, enable alerts for bookmarked journeys
  return current[journeyId] !== false;
}

// Calculate minutes until departure for a saved journey
export function getMinutesUntilDeparture(journey: SavedJourney): number | null {
  try {
    const dateStr = journey.date || new Date().toISOString().split('T')[0];
    const [hours, mins] = journey.departure_time.split(':').map(Number);
    const departureDate = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`);
    const now = new Date();
    const diffMs = departureDate.getTime() - now.getTime();
    return Math.round(diffMs / 60000);
  } catch {
    return null;
  }
}

// Check if any active saved journey is departing within 15 minutes
export function checkUpcomingSavedDepartures(): { journey: SavedJourney; minutesUntil: number } | null {
  const bookmarks = getBookmarks();
  for (const journey of bookmarks) {
    if (!isAlertEnabled(journey.id)) continue;
    const mins = getMinutesUntilDeparture(journey);
    if (mins !== null && mins >= 0 && mins <= 15) {
      return { journey, minutesUntil: mins };
    }
  }
  return null;
}
