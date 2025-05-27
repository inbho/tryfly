import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TextInput, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, spacing, shadows, borderRadius } from '../utils/theme';
import { SearchParams } from '../types';

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
};

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    type: 'flight',
    query: '',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'UA123',
    'DL456',
    'JFK',
    'LAX',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (!searchParams.query.trim()) {
      setError('Please enter a flight number or airport code');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add to recent searches if not already there
    if (!recentSearches.includes(searchParams.query)) {
      setRecentSearches([searchParams.query, ...recentSearches.slice(0, 4)]);
    }

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      if (searchParams.type === 'flight') {
        navigation.navigate('FlightTracking', { flightNumber: searchParams.query });
      } else {
        navigation.navigate('FlightTracking', { airportCode: searchParams.query });
      }
    }, 1000);
  };

  const handleRecentSearch = (query: string) => {
    // Determine if it's a flight number or airport code
    const isFlightNumber = /^[A-Z0-9]{2,8}$/.test(query);
    
    setSearchParams({
      type: isFlightNumber ? 'flight' : 'airport',
      query,
    });
    
    // Trigger search immediately
    setTimeout(() => {
      if (isFlightNumber) {
        navigation.navigate('FlightTracking', { flightNumber: query });
      } else {
        navigation.navigate('FlightTracking', { airportCode: query });
      }
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Track Your Flight</Text>
          <Text style={styles.subtitle}>
            Enter a flight number or airport code to get real-time updates
          </Text>
        </View>

        <View style={styles.searchTypeContainer}>
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchParams.type === 'flight' && styles.searchTypeButtonActive,
            ]}
            onPress={() => setSearchParams({ ...searchParams, type: 'flight' })}
          >
            <Ionicons
              name="airplane"
              size={20}
              color={searchParams.type === 'flight' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.searchTypeText,
                searchParams.type === 'flight' && styles.searchTypeTextActive,
              ]}
            >
              Flight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchParams.type === 'airport' && styles.searchTypeButtonActive,
            ]}
            onPress={() => setSearchParams({ ...searchParams, type: 'airport' })}
          >
            <Ionicons
              name="business"
              size={20}
              color={searchParams.type === 'airport' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.searchTypeText,
                searchParams.type === 'airport' && styles.searchTypeTextActive,
              ]}
            >
              Airport
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            label={searchParams.type === 'flight' ? 'Flight Number (e.g., UA123)' : 'Airport Code (e.g., JFK)'}
            value={searchParams.query}
            onChangeText={(text) => setSearchParams({ ...searchParams, query: text.toUpperCase() })}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            right={
              searchParams.query ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => setSearchParams({ ...searchParams, query: '' })}
                />
              ) : null
            }
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleSearch}
            style={styles.searchButton}
            labelStyle={styles.searchButtonText}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              'Search'
            )}
          </Button>
        </View>

        {recentSearches.length > 0 && (
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            <View style={styles.chipsContainer}>
              {recentSearches.map((search, index) => (
                <Chip
                  key={index}
                  style={styles.chip}
                  onPress={() => handleRecentSearch(search)}
                  icon={/^[A-Z]{3}$/.test(search) ? 'business' : 'airplane'}
                >
                  {search}
                </Chip>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  searchTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  searchTypeButtonActive: {
    backgroundColor: colors.primaryLight + '20', // 20% opacity
  },
  searchTypeText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  searchTypeTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
  },
  searchButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  recentSearchesContainer: {
    marginBottom: spacing.xl,
  },
  recentSearchesTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: spacing.xs,
    backgroundColor: colors.surface,
  },
});

export default SearchScreen;