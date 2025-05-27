export interface Flight {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
  gate?: string;
  terminal?: string;
  aircraft?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  delay?: number;
  connectingFlights?: Flight[];
}

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  LANDED = 'LANDED',
  CANCELLED = 'CANCELLED',
  DIVERTED = 'DIVERTED',
  DELAYED = 'DELAYED'
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface SearchParams {
  type: 'flight' | 'airport';
  query: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  flightId?: string;
}