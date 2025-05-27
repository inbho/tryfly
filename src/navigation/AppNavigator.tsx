import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import SearchScreen from '../screens/SearchScreen';
import FlightTrackingScreen from '../screens/FlightTrackingScreen';
import FlightDetailsScreen from '../screens/FlightDetailsScreen';

// Import theme
import { colors } from '../utils/theme';

// Define the types for our navigation parameters
export type RootStackParamList = {
  Splash: undefined;
  Search: undefined;
  FlightTracking: { flightNumber: string } | { airportCode: string };
  FlightDetails: { flightNumber: string };
};

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ title: 'Search Flights' }}
        />
        <Stack.Screen 
          name="FlightTracking" 
          component={FlightTrackingScreen} 
          options={{ title: 'Live Tracking' }}
        />
        <Stack.Screen 
          name="FlightDetails" 
          component={FlightDetailsScreen} 
          options={{ title: 'Flight Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;