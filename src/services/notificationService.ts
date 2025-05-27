import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  
  return true;
};

// Register for push notifications
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    const permissionGranted = await requestNotificationPermissions();
    
    if (!permissionGranted) {
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // On Android, we need to set up a notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('flight-updates', {
        name: 'Flight Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0A84FF',
      });
    }
    
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Send a local notification
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: null, // null means show immediately
  });
  
  // Save notification to local storage
  await saveNotification({
    id: notificationId,
    title,
    message: body,
    timestamp: Date.now(),
    read: false,
    flightId: data?.flightId as string | undefined,
  });
  
  return notificationId;
};

// Get all notifications from storage
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const notificationsJson = await AsyncStorage.getItem('notifications');
    if (notificationsJson) {
      return JSON.parse(notificationsJson) as Notification[];
    }
    return [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Save a notification to storage
export const saveNotification = async (notification: Notification): Promise<void> => {
  try {
    const notifications = await getNotifications();
    notifications.unshift(notification); // Add to beginning of array
    await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    );
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Clear all notifications
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};