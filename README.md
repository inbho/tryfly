# FlightTracker

A cross-platform mobile application for tracking flights in real-time, built with React Native and Expo.

## Features

- Track live location of flights using flight numbers or airport data
- Identify and follow connecting or waiting flights
- Display flight data (ETA, gate info, delays) in real-time
- Simple, intuitive user interface with no clutter or complex menus
- Clean color contrast that is visually appealing and accessible
- Push notifications for gate changes or delays

## Screens

- **Welcome/Splash Screen**: Introduction to the app
- **Search Screen**: Search for flights by flight number or airport code
- **Live Tracking Screen**: Map view with flight path and real-time information
- **Flight Info Detail Screen**: Detailed information about a specific flight

## Technologies Used

- React Native
- Expo
- React Navigation
- React Native Maps
- React Native Paper (UI components)
- Axios (API requests)
- Expo Location
- Expo Notifications

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/FlightTracker.git
cd FlightTracker
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Run on iOS or Android
```
npm run ios
# or
npm run android
```

## API Integration

The app is designed to work with flight tracking APIs such as:
- AviationStack
- FlightAware
- FlightRadar24

To use a real API:
1. Sign up for an API key from one of the providers
2. Replace the API_KEY constant in src/services/flightService.ts
3. Uncomment the actual API calls and comment out the mock data functions

## Project Structure

```
FlightTracker/
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens
│   ├── services/       # API and other services
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions and constants
├── App.tsx             # Main app component
└── package.json        # Dependencies and scripts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flight icons by [Ionicons](https://ionicons.com/)
- Map integration powered by [Google Maps](https://developers.google.com/maps/documentation)