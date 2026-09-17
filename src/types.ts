export type RailwayLine =
  | 'Main Line'
  | 'Coastal Line'
  | 'Northern Line'
  | 'Eastern Line'
  | 'Kelani Valley Line'
  | 'Puttalam Line';

export type TrainType = 'ICE' | 'Express' | 'Night Mail' | 'Normal';

export type SeatClass =
  | '1st AC'
  | '1st Observation'
  | '1st Sleeper'
  | '2nd Class'
  | '3rd Class';

export type OperatingRegion = 'Colombo' | 'Nawalapitiya' | 'Anuradhapura';

export interface Station {
  id: string; // e.g., "FOT", "KND", "ELL"
  name_en: string;
  name_si: string;
  name_ta: string;
  line: RailwayLine;
  latitude: number;
  longitude: number;
  elevation_m?: number;
  platforms?: number;
  code: string;
  majorHub?: boolean;
  operating_region?: OperatingRegion;
  distance_from_fort_km?: number;
}

export interface ScheduleStop {
  sequence: number;
  station_code: string;
  station_name: string;
  arrival_time: string | null; // "HH:MM" or null if origin
  departure_time: string | null; // "HH:MM" or null if destination
  distance_km?: number;
}

export interface TrainAmenities {
  has_ac: boolean;
  has_observation?: boolean;
  has_sleeper?: boolean;
  has_buffet?: boolean;
  has_charging?: boolean;
  scenic_views?: string;
  luggage_space?: string;
}

export interface TrainSchedule {
  train_id: string;
  train_name: string;
  train_type: TrainType;
  line: RailwayLine;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  operating_days: string;
  classes: SeatClass[];
  scenic_rating?: number; // 1-5 stars
  scenic_highlight?: string;
  amenities?: TrainAmenities;
  stops: ScheduleStop[];
  estimated_fare_lkr: {
    third: number;
    second: number;
    first_ac?: number;
    first_obs?: number;
    first_sleep?: number;
  };
}

export interface TripSegment {
  fromStation: Station;
  toStation: Station;
  suggestedTrain?: TrainSchedule;
  travelDate?: string;
  segmentDurationMinutes?: number;
  distanceKm?: number;
  notes?: string;
}

export interface MultiStopTrip {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  stops: Station[];
  travelDate?: string;
  totalEstimatedMinutes: number;
  totalDistanceKm: number;
  estimatedFareLkr: {
    third: number;
    second: number;
    first: number;
  };
  segments: {
    from: string;
    to: string;
    trainId?: string;
    trainName?: string;
    depTime?: string;
    arrTime?: string;
    durationMinutes: number;
    distanceKm: number;
  }[];
}

export interface FareMatrixEntry {
  distance_slab_km: string;
  class_type: SeatClass;
  price_lkr: number;
  description: string;
}

export interface HistoryMilestone {
  year: string;
  title: string;
  description: string;
  category: 'milestone' | 'engineering' | 'heritage';
}

export interface LegendaryTrainProfile {
  id: string;
  name: string;
  train_numbers: string;
  line: RailwayLine;
  inauguration: string;
  tagline: string;
  description: string;
  highlights: string[];
  imageUrl: string;
}

export type Language = 'en' | 'si' | 'ta';

export type AppTheme = 'parchment' | 'night';

export interface SavedJourney {
  id: string;
  train_id: string;
  train_name: string;
  from_station: string;
  to_station: string;
  departure_time: string;
  arrival_time: string;
  date: string;
  line: RailwayLine;
  saved_at: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'conductor';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    from?: string;
    to?: string;
  };
}

export interface WeatherAlert {
  station: string;
  temp_c?: number;
  temperature_c?: number;
  condition: string;
  status?: 'Normal' | 'Advisory' | 'Delay Likely';
  note?: string;
  rainfall_mm?: number;
  delay_risk?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  message?: string;
}
