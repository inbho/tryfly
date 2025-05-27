import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Flight } from '../types';
import StatusBadge from './StatusBadge';
import { colors, fontSizes, spacing, shadows, borderRadius } from '../utils/theme';
import { formatTime, formatDate } from '../utils/dateUtils';

interface FlightCardProps {
  flight: Flight;
  onPress: (flight: Flight) => void;
  compact?: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onPress, compact = false }) => {
  return (
    <TouchableOpacity onPress={() => onPress(flight)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.flightInfo}>
              <Text style={styles.flightNumber}>
                {flight.airline} {flight.flightNumber}
              </Text>
              {!compact && (
                <Text style={styles.date}>{formatDate(flight.departureTime)}</Text>
              )}
            </View>
            <StatusBadge status={flight.status} size={compact ? 'small' : 'medium'} />
          </View>

          {compact ? (
            <View style={styles.compactRoute}>
              <Text style={styles.routeText}>
                {flight.departureAirport} → {flight.arrivalAirport}
              </Text>
              <Text style={styles.timeText}>{formatTime(flight.departureTime)}</Text>
            </View>
          ) : (
            <View style={styles.route}>
              <View style={styles.airport}>
                <Text style={styles.airportCode}>{flight.departureAirport}</Text>
                <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
              </View>
              
              <View style={styles.flightPath}>
                <View style={styles.line} />
                <Ionicons name="airplane" size={16} color={colors.primary} />
              </View>
              
              <View style={styles.airport}>
                <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
                <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
              </View>
            </View>
          )}

          {!compact && flight.gate && (
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Ionicons name="git-branch-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>Gate {flight.gate}</Text>
              </View>
              
              {flight.terminal && (
                <View style={styles.detailItem}>
                  <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Terminal {flight.terminal}</Text>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  content: {
    padding: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  flightInfo: {
    flex: 1,
  },
  flightNumber: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  route: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeText: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  timeText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  airport: {
    alignItems: 'center',
    width: '30%',
  },
  airportCode: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  time: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  flightPath: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    height: 20,
  },
  line: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  detailText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});

export default FlightCard;