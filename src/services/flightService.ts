import axios from 'axios';
import { Flight, Airport, FlightStatus } from '../types';

// Note: You would need to replace this with a real API key from a flight tracking service
// like AviationStack, FlightAware, or FlightRadar24
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.example-flight-api.com/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    access_key: API_KEY
  }
});

/**
 * Get flight information by flight number
 */
export const getFlightByNumber = async (flightNumber: string): Promise<Flight> => {
  try {
    // In a real implementation, this would call the actual API
    // const response = await api.get(`/flights`, { params: { flight_number: flightNumber } });
    // return response.data;
    
    // For demo purposes, return mock data
    return getMockFlightData(flightNumber);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    throw error;
  }
};

/**
 * Get flights by airport code
 */
export const getFlightsByAirport = async (airportCode: string): Promise<Flight[]> => {
  try {
    // In a real implementation, this would call the actual API
    // const response = await api.get(`/flights`, { params: { airport: airportCode } });
    // return response.data;
    
    // For demo purposes, return mock data
    return getMockFlightsByAirport(airportCode);
  } catch (error) {
    console.error('Error fetching airport flights:', error);
    throw error;
  }
};

/**
 * Get airport information by code
 */
export const getAirportByCode = async (airportCode: string): Promise<Airport> => {
  try {
    // In a real implementation, this would call the actual API
    // const response = await api.get(`/airports/${airportCode}`);
    // return response.data;
    
    // For demo purposes, return mock data
    return getMockAirportData(airportCode);
  } catch (error) {
    console.error('Error fetching airport data:', error);
    throw error;
  }
};

/**
 * Get live flight position updates
 */
export const getFlightPosition = async (flightId: string): Promise<Pick<Flight, 'latitude' | 'longitude' | 'altitude' | 'speed' | 'heading'>> => {
  try {
    // In a real implementation, this would call the actual API
    // const response = await api.get(`/flights/${flightId}/position`);
    // return response.data;
    
    // For demo purposes, return mock data
    return getMockFlightPosition(flightId);
  } catch (error) {
    console.error('Error fetching flight position:', error);
    throw error;
  }
};

/**
 * Get connecting flights
 */
export const getConnectingFlights = async (flightId: string): Promise<Flight[]> => {
  try {
    // In a real implementation, this would call the actual API
    // const response = await api.get(`/flights/${flightId}/connections`);
    // return response.data;
    
    // For demo purposes, return mock data
    return getMockConnectingFlights(flightId);
  } catch (error) {
    console.error('Error fetching connecting flights:', error);
    throw error;
  }
};

// Mock data functions for demonstration purposes
// In a real app, these would be replaced with actual API calls

function getMockFlightData(flightNumber: string): Flight {
  return {
    flightNumber,
    airline: flightNumber.substring(0, 2) === 'UA' ? 'United Airlines' : 'Delta Airlines',
    departureAirport: 'JFK',
    arrivalAirport: 'LAX',
    departureTime: new Date(Date.now() + 3600000).toISOString(),
    arrivalTime: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: FlightStatus.ACTIVE,
    gate: 'B12',
    terminal: 'T2',
    aircraft: 'Boeing 737-800',
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: 35000,
    speed: 550,
    heading: 270,
  };
}

function getMockFlightsByAirport(airportCode: string): Flight[] {
  return [
    {
      flightNumber: 'UA123',
      airline: 'United Airlines',
      departureAirport: airportCode,
      arrivalAirport: 'LAX',
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      arrivalTime: new Date(Date.now() + 3600000 * 6).toISOString(),
      status: FlightStatus.SCHEDULED,
      gate: 'A1',
      terminal: 'T1',
    },
    {
      flightNumber: 'DL456',
      airline: 'Delta Airlines',
      departureAirport: 'JFK',
      arrivalAirport: airportCode,
      departureTime: new Date(Date.now() - 3600000).toISOString(),
      arrivalTime: new Date(Date.now() + 3600000 * 2).toISOString(),
      status: FlightStatus.ACTIVE,
      gate: 'C5',
      terminal: 'T3',
    },
  ];
}

function getMockAirportData(airportCode: string): Airport {
  const airports: Record<string, Airport> = {
    'JFK': {
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'United States',
      latitude: 40.6413,
      longitude: -73.7781,
    },
    'LAX': {
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'United States',
      latitude: 33.9416,
      longitude: -118.4085,
    },
    'LHR': {
      code: 'LHR',
      name: 'London Heathrow Airport',
      city: 'London',
      country: 'United Kingdom',
      latitude: 51.4700,
      longitude: -0.4543,
    },
  };
  
  return airports[airportCode] || {
    code: airportCode,
    name: `${airportCode} International Airport`,
    city: 'Unknown City',
    country: 'Unknown Country',
    latitude: 0,
    longitude: 0,
  };
}

function getMockFlightPosition(flightId: string): Pick<Flight, 'latitude' | 'longitude' | 'altitude' | 'speed' | 'heading'> {
  // Simulate a flight moving west
  return {
    latitude: 40.7128 + (Math.random() * 0.1 - 0.05),
    longitude: -74.0060 + (Math.random() * 0.1),
    altitude: 35000 + (Math.random() * 1000 - 500),
    speed: 550 + (Math.random() * 20 - 10),
    heading: 270 + (Math.random() * 10 - 5),
  };
}

function getMockConnectingFlights(flightId: string): Flight[] {
  return [
    {
      flightNumber: 'UA789',
      airline: 'United Airlines',
      departureAirport: 'LAX',
      arrivalAirport: 'SFO',
      departureTime: new Date(Date.now() + 3600000 * 8).toISOString(),
      arrivalTime: new Date(Date.now() + 3600000 * 10).toISOString(),
      status: FlightStatus.SCHEDULED,
      gate: 'D3',
      terminal: 'T4',
    },
    {
      flightNumber: 'DL987',
      airline: 'Delta Airlines',
      departureAirport: 'LAX',
      arrivalAirport: 'SEA',
      departureTime: new Date(Date.now() + 3600000 * 7).toISOString(),
      arrivalTime: new Date(Date.now() + 3600000 * 9).toISOString(),
      status: FlightStatus.SCHEDULED,
      gate: 'E7',
      terminal: 'T5',
    },
  ];
}