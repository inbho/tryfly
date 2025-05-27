import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, fontSizes, spacing } from '../utils/theme';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
    ]).start();

    // Navigate to Search screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Search');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Replace with your actual logo */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>✈️</Text>
        </View>
        <Text style={styles.appName}>FlightTracker</Text>
        <Text style={styles.tagline}>Track flights in real-time</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    fontSize: fontSizes.header,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.textLight,
  },
});

export default SplashScreen;