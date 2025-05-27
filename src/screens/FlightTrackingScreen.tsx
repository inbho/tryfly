import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from 'react-native-paper';
import { colors, fontSizes, spacing, shadows, borderRadius } from '../utils/theme';
import { Flight, FlightStatus, Airport } from '../types';
import { getFlightByNumber, getFlightsByAirport, getAirportByCode, getFlightPosition } from '../services/flightService';
import { formatTime, formatDate, formatDuration, getTimeDifferenceInMinutes } from '../utils/dateUtils';
import { sendLocalNotification } from '../services/notificationService';

type FlightTrackingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FlightTracking'>;
  route: RouteProp<RootStackParamList, 'FlightTracking'>;
};

const FlightTrackingScreen: React.FC<FlightTrackingScreenProps> = ({ navigation, route }) => {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingActive, setTrackingActive] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);
  
  const mapRef = useRef<MapView>(null);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Determine if we're tracking a single flight or airport flights
  const flightNumber = 'flightNumber' in route.params ? route.params.flightNumber : null;
  const airportCode = 'airportCode' in route.params ? route.params.airportCode : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (flightNumber) {
          // Load single flight data
          const flightData = await getFlightByNumber(flightNumber);
          setFlight(flightData);
          
          // Load airport data
          const depAirport = await getAirportByCode(flightData.departureAirport);
          const arrAirport = await getAirportByCode(flightData.arrivalAirport);
          
          setDepartureAirport(depAirport);
          setArrivalAirport(arrAirport);
          
          // Set map region to show flight path
          if (depAirport && arrAirport) {
            const midLat = (depAirport.latitude + arrAirport.latitude) / 2;
            const midLng = (depAirport.longitude + arrAirport.longitude) / 2;
            
            // Calculate the distance to determine zoom level
            const latDelta = Math.abs(depAirport.latitude - arrAirport.latitude) * 1.5;
            const lngDelta = Math.abs(depAirport.longitude - arrAirport.longitude) * 1.5;
            
            setMapRegion({
              latitude: midLat,
              longitude: midLng,
              latitudeDelta: Math.max(latDelta, 5),
              longitudeDelta: Math.max(lngDelta, 5),
            });
          }
          
          // Start position updates for active flights
          if (flightData.status === FlightStatus.ACTIVE) {
            startPositionUpdates(flightData.flightNumber);
          }
        } else if (airportCode) {
          // Load airport flights
          const airportData = await getAirportByCode(airportCode);
          setDepartureAirport(airportData);
          
          const airportFlights = await getFlightsByAirport(airportCode);
          setFlights(airportFlights);
          
          // Set map region centered on airport
          setMapRegion({
            latitude: airportData.latitude,
            longitude: airportData.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      } catch (err) {
        console.error('Error loading flight data:', err);
        setError('Failed to load flight data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup function
    return () => {
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [flightNumber, airportCode]);

  const startPositionUpdates = (flightId: string) => {
    // Clear any existing interval
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }

    // Update position every 10 seconds
    positionUpdateInterval.current = setInterval(async () => {
      if (!trackingActive) return;

      try {
        const position = await getFlightPosition(flightId);
        
        setFlight((prevFlight) => {
          if (!prevFlight) return null;
          
          return {
            ...prevFlight,
            ...position,
          };
        });
      } catch (err) {
        console.error('Error updating flight position:', err);
      }
    }, 10000);
  };

  const handleViewFlightDetails = (selectedFlight: Flight) => {
    navigation.navigate('FlightDetails', { flightNumber: selectedFlight.flightNumber });
  };

  const toggleTracking = () => {
    setTrackingActive(!trackingActive);
    
    if (!trackingActive && flight) {
      // Restart position updates
      startPositionUpdates(flight.flightNumber);
    }
  };

  const handleNotifyMe = async () => {
    if (flight) {
      try {
        await sendLocalNotification(
          `Flight ${flight.flightNumber} Update`,
          `We'll notify you of any changes to your flight.`,
          { flightId: flight.flightNumber }
        );
        
        Alert.alert(
          'Notification Set',
          `You'll receive updates for flight ${flight.flightNumber}.`
        );
      } catch (err) {
        console.error('Error setting notification:', err);
        Alert.alert('Error', 'Failed to set notification. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading flight data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        region={mapRegion}
      >
        {/* Departure Airport Marker */}
        {departureAirport && (
          <Marker
            coordinate={{
              latitude: departureAirport.latitude,
              longitude: departureAirport.longitude,
            }}
            title={departureAirport.name}
            description={`${departureAirport.city}, ${departureAirport.country}`}
            pinColor={colors.info}
          >
            <Ionicons name="airplane-outline" size={24} color={colors.info} />
          </Marker>
        )}

        {/* Arrival Airport Marker */}
        {arrivalAirport && (
          <Marker
            coordinate={{
              latitude: arrivalAirport.latitude,
              longitude: arrivalAirport.longitude,
            }}
            title={arrivalAirport.name}
            description={`${arrivalAirport.city}, ${arrivalAirport.country}`}
            pinColor={colors.success}
          >
            <Ionicons name="location" size={24} color={colors.success} />
          </Marker>
        )}

        {/* Flight Marker */}
        {flight && flight.latitude && flight.longitude && (
          <Marker
            coordinate={{
              latitude: flight.latitude,
              longitude: flight.longitude,
            }}
            title={`${flight.airline} ${flight.flightNumber}`}
            description={`${flight.departureAirport} to ${flight.arrivalAirport}`}
            rotation={flight.heading || 0}
          >
            <View style={styles.planeMarker}>
              <Ionicons
                name="airplane"
                size={24}
                color={colors.primary}
                style={{ transform: [{ rotate: '45deg' }] }}
              />
            </View>
          </Marker>
        )}

        {/* Flight Path */}
        {departureAirport && arrivalAirport && (
          <Polyline
            coordinates={[
              {
                latitude: departureAirport.latitude,
                longitude: departureAirport.longitude,
              },
              {
                latitude: arrivalAirport.latitude,
                longitude: arrivalAirport.longitude,
              },
            ]}
            strokeColor={colors.accent}
            strokeWidth={2}
            lineDashPattern={[1, 2]}
          />
        )}

        {/* Multiple Flights for Airport View */}
        {airportCode &&
          flights.map((airportFlight) => (
            <Marker
              key={airportFlight.flightNumber}
              coordinate={{
                latitude: departureAirport?.latitude || 0,
                longitude: departureAirport?.longitude || 0,
              }}
              title={`${airportFlight.airline} ${airportFlight.flightNumber}`}
              description={`To: ${airportFlight.arrivalAirport}`}
              onCalloutPress={() => handleViewFlightDetails(airportFlight)}
            >
              <Ionicons name="airplane-outline" size={20} color={colors.primary} />
            </Marker>
          ))}
      </MapView>

      {/* Flight Info Card */}
      <View style={styles.infoCardContainer}>
        {flight ? (
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.flightHeaderRow}>
                <View>
                  <Text style={styles.flightNumber}>
                    {flight.airline} {flight.flightNumber}
                  </Text>
                  <Text style={styles.flightDate}>{formatDate(flight.departureTime)}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusBadgeStyle(flight.status)]}>
                  <Text style={styles.statusText}>{flight.status}</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.airportColumn}>
                  <Text style={styles.airportCode}>{flight.departureAirport}</Text>
                  <Text style={styles.airportTime}>{formatTime(flight.departureTime)}</Text>
                  {flight.gate && <Text style={styles.gateText}>Gate {flight.gate}</Text>}
                </View>

                <View style={styles.flightPathContainer}>
                  <View style={styles.flightPathLine} />
                  <Ionicons name="airplane" size={20} color={colors.primary} />
                  <Text style={styles.flightDuration}>
                    {formatDuration(getTimeDifferenceInMinutes(flight.departureTime, flight.arrivalTime))}
                  </Text>
                </View>

                <View style={styles.airportColumn}>
                  <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
                  <Text style={styles.airportTime}>{formatTime(flight.arrivalTime)}</Text>
                  {flight.terminal && <Text style={styles.gateText}>Terminal {flight.terminal}</Text>}
                </View>
              </View>

              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={toggleTracking}
                  style={styles.actionButton}
                  icon={trackingActive ? 'pause' : 'play'}
                >
                  {trackingActive ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleNotifyMe}
                  style={styles.actionButton}
                  icon="bell"
                >
                  Notify Me
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleViewFlightDetails(flight)}
                  style={styles.actionButton}
                  icon="information"
                >
                  Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : airportCode ? (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.airportTitle}>{departureAirport?.name}</Text>
              <Text style={styles.airportSubtitle}>
                {departureAirport?.city}, {departureAirport?.country}
              </Text>

              <Text style={styles.flightsTitle}>Flights ({flights.length})</Text>

              {flights.map((airportFlight) => (
                <TouchableOpacity
                  key={airportFlight.flightNumber}
                  style={styles.flightItem}
                  onPress={() => handleViewFlightDetails(airportFlight)}
                >
                  <View>
                    <Text style={styles.flightItemNumber}>
                      {airportFlight.airline} {airportFlight.flightNumber}
                    </Text>
                    <Text style={styles.flightItemDestination}>
                      To: {airportFlight.arrivalAirport}
                    </Text>
                  </View>
                  <View style={styles.flightItemTimeContainer}>
                    <Text style={styles.flightItemTime}>
                      {formatTime(airportFlight.departureTime)}
                    </Text>
                    <View
                      style={[
                        styles.flightItemStatus,
                        getStatusBadgeStyle(airportFlight.status),
                      ]}
                    >
                      <Text style={styles.flightItemStatusText}>
                        {airportFlight.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        ) : null}
      </View>
    </View>
  );
};

// Helper function to get status badge style
const getStatusBadgeStyle = (status: FlightStatus) => {
  switch (status) {
    case FlightStatus.ACTIVE:
      return styles.statusActive;
    case FlightStatus.LANDED:
      return styles.statusLanded;
    case FlightStatus.DELAYED:
      return styles.statusDelayed;
    case FlightStatus.CANCELLED:
      return styles.statusCancelled;
    case FlightStatus.DIVERTED:
      return styles.statusDiverted;
    default:
      return styles.statusScheduled;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontSize: fontSizes.md,
    color: colors.error,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: colors.primary,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.6,
  },
  planeMarker: {
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  infoCard: {
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  flightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flightNumber: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  flightDate: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.surface,
  },
  statusActive: {
    backgroundColor: colors.success,
  },
  statusLanded: {
    backgroundColor: colors.info,
  },
  statusDelayed: {
    backgroundColor: colors.warning,
  },
  statusCancelled: {
    backgroundColor: colors.error,
  },
  statusDiverted: {
    backgroundColor: colors.error,
  },
  statusScheduled: {
    backgroundColor: colors.accent,
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  airportColumn: {
    alignItems: 'center',
    width: '30%',
  },
  airportCode: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  airportTime: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginTop: spacing.xs,
  },
  gateText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  flightPathContainer: {
    alignItems: 'center',
    width: '40%',
    position: 'relative',
  },
  flightPathLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  flightDuration: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  airportTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  airportSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  flightsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  flightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  flightItemNumber: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  flightItemDestination: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  flightItemTimeContainer: {
    alignItems: 'flex-end',
  },
  flightItemTime: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  flightItemStatus: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  flightItemStatusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.surface,
  },
});

export default FlightTrackingScreen;