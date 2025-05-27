import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Card, Divider, Button, List } from 'react-native-paper';
import { colors, fontSizes, spacing, shadows, borderRadius } from '../utils/theme';
import { Flight, FlightStatus, Airport } from '../types';
import {
  getFlightByNumber,
  getAirportByCode,
  getConnectingFlights,
} from '../services/flightService';
import { formatTime, formatDate, formatDuration, getTimeDifferenceInMinutes } from '../utils/dateUtils';
import { sendLocalNotification } from '../services/notificationService';

type FlightDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FlightDetails'>;
  route: RouteProp<RootStackParamList, 'FlightDetails'>;
};

const FlightDetailsScreen: React.FC<FlightDetailsScreenProps> = ({ navigation, route }) => {
  const { flightNumber } = route.params;
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [connectingFlights, setConnectingFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('flightInfo');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load flight data
        const flightData = await getFlightByNumber(flightNumber);
        setFlight(flightData);
        
        // Load airport data
        const depAirport = await getAirportByCode(flightData.departureAirport);
        const arrAirport = await getAirportByCode(flightData.arrivalAirport);
        
        setDepartureAirport(depAirport);
        setArrivalAirport(arrAirport);
        
        // Load connecting flights
        const connections = await getConnectingFlights(flightNumber);
        setConnectingFlights(connections);
      } catch (err) {
        console.error('Error loading flight details:', err);
        setError('Failed to load flight details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [flightNumber]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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

  const handleTrackFlight = () => {
    navigation.navigate('FlightTracking', { flightNumber });
  };

  const handleTrackConnectingFlight = (connectingFlightNumber: string) => {
    navigation.navigate('FlightTracking', { flightNumber: connectingFlightNumber });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading flight details...</Text>
      </View>
    );
  }

  if (error || !flight) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Flight not found'}</Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Flight Header */}
      <Card style={styles.headerCard}>
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
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleNotifyMe}
              style={styles.actionButton}
              icon="bell"
            >
              Notify Me
            </Button>
            <Button
              mode="contained"
              onPress={handleTrackFlight}
              style={styles.actionButton}
              icon="map-marker"
            >
              Track
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Flight Information */}
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('flightInfo')}
        >
          <Text style={styles.sectionTitle}>Flight Information</Text>
          <Ionicons
            name={expandedSection === 'flightInfo' ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        {expandedSection === 'flightInfo' && (
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Airline:</Text>
              <Text style={styles.infoValue}>{flight.airline}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aircraft:</Text>
              <Text style={styles.infoValue}>{flight.aircraft || 'Not available'}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, getStatusTextStyle(flight.status)]}>
                {flight.status}
              </Text>
            </View>
            <Divider style={styles.divider} />
            
            {flight.delay && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Delay:</Text>
                  <Text style={[styles.infoValue, styles.delayText]}>
                    {formatDuration(flight.delay)}
                  </Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Speed:</Text>
              <Text style={styles.infoValue}>
                {flight.speed ? `${flight.speed} knots` : 'Not available'}
              </Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Altitude:</Text>
              <Text style={styles.infoValue}>
                {flight.altitude ? `${flight.altitude} feet` : 'Not available'}
              </Text>
            </View>
          </Card.Content>
        )}
      </Card>

      {/* Departure Airport */}
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('departureAirport')}
        >
          <Text style={styles.sectionTitle}>Departure Airport</Text>
          <Ionicons
            name={expandedSection === 'departureAirport' ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        {expandedSection === 'departureAirport' && departureAirport && (
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Airport:</Text>
              <Text style={styles.infoValue}>{departureAirport.name}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City:</Text>
              <Text style={styles.infoValue}>{departureAirport.city}, {departureAirport.country}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Terminal:</Text>
              <Text style={styles.infoValue}>{flight.terminal || 'Not available'}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gate:</Text>
              <Text style={styles.infoValue}>{flight.gate || 'Not available'}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Departure:</Text>
              <Text style={styles.infoValue}>
                {formatTime(flight.departureTime)} ({formatDate(flight.departureTime)})
              </Text>
            </View>
          </Card.Content>
        )}
      </Card>

      {/* Arrival Airport */}
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('arrivalAirport')}
        >
          <Text style={styles.sectionTitle}>Arrival Airport</Text>
          <Ionicons
            name={expandedSection === 'arrivalAirport' ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        {expandedSection === 'arrivalAirport' && arrivalAirport && (
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Airport:</Text>
              <Text style={styles.infoValue}>{arrivalAirport.name}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City:</Text>
              <Text style={styles.infoValue}>{arrivalAirport.city}, {arrivalAirport.country}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Terminal:</Text>
              <Text style={styles.infoValue}>{flight.terminal || 'Not available'}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gate:</Text>
              <Text style={styles.infoValue}>{flight.gate || 'Not available'}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Arrival:</Text>
              <Text style={styles.infoValue}>
                {formatTime(flight.arrivalTime)} ({formatDate(flight.arrivalTime)})
              </Text>
            </View>
          </Card.Content>
        )}
      </Card>

      {/* Connecting Flights */}
      {connectingFlights.length > 0 && (
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('connectingFlights')}
          >
            <Text style={styles.sectionTitle}>Connecting Flights</Text>
            <Ionicons
              name={expandedSection === 'connectingFlights' ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          
          {expandedSection === 'connectingFlights' && (
            <Card.Content>
              {connectingFlights.map((connectingFlight, index) => (
                <React.Fragment key={connectingFlight.flightNumber}>
                  <List.Item
                    title={`${connectingFlight.airline} ${connectingFlight.flightNumber}`}
                    description={`${connectingFlight.departureAirport} to ${connectingFlight.arrivalAirport} • ${formatTime(connectingFlight.departureTime)}`}
                    left={props => <List.Icon {...props} icon="airplane" />}
                    right={props => (
                      <Button
                        mode="text"
                        onPress={() => handleTrackConnectingFlight(connectingFlight.flightNumber)}
                        style={{ marginVertical: -8 }}
                      >
                        Track
                      </Button>
                    )}
                    style={styles.connectingFlightItem}
                  />
                  {index < connectingFlights.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card.Content>
          )}
        </Card>
      )}
    </ScrollView>
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

// Helper function to get status text style
const getStatusTextStyle = (status: FlightStatus) => {
  switch (status) {
    case FlightStatus.ACTIVE:
      return styles.statusTextActive;
    case FlightStatus.LANDED:
      return styles.statusTextLanded;
    case FlightStatus.DELAYED:
      return styles.statusTextDelayed;
    case FlightStatus.CANCELLED:
      return styles.statusTextCancelled;
    case FlightStatus.DIVERTED:
      return styles.statusTextDiverted;
    default:
      return styles.statusTextScheduled;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
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
  headerCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
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
  statusTextActive: {
    color: colors.success,
  },
  statusTextLanded: {
    color: colors.info,
  },
  statusTextDelayed: {
    color: colors.warning,
  },
  statusTextCancelled: {
    color: colors.error,
  },
  statusTextDiverted: {
    color: colors.error,
  },
  statusTextScheduled: {
    color: colors.accent,
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
  sectionCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: colors.border,
  },
  delayText: {
    color: colors.warning,
  },
  connectingFlightItem: {
    paddingVertical: spacing.xs,
  },
});

export default FlightDetailsScreen;