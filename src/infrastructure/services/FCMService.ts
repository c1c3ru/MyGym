/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notifications on the client side
 */

import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { db } from '@infrastructure/services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

class FCMService {
  private static instance: FCMService;

  private constructor() {}

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Request permission for notifications (iOS)
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted:', authStatus);
      } else {
        console.log('Notification permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token for this device
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to user document in Firestore
   */
  async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date(),
        platform: Platform.OS,
      });
      console.log('FCM token saved to Firestore');
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  /**
   * Initialize FCM service
   * Call this when user logs in
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Request permission (iOS)
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        console.log('Notification permission not granted');
        return;
      }

      // Get FCM token
      const token = await this.getToken();
      
      if (!token) {
        console.log('Failed to get FCM token');
        return;
      }

      // Save token to Firestore
      await this.saveTokenToFirestore(userId, token);

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        console.log('FCM token refreshed:', newToken);
        await this.saveTokenToFirestore(userId, newToken);
      });

      console.log('FCM service initialized successfully');
    } catch (error) {
      console.error('Error initializing FCM service:', error);
      throw error;
    }
  }

  /**
   * Set up foreground notification handler
   */
  setupForegroundHandler(onNotification: (notification: any) => void): () => void {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);
      onNotification(remoteMessage);
    });

    return unsubscribe;
  }

  /**
   * Set up background notification handler
   */
  setupBackgroundHandler(handler: (remoteMessage: any) => Promise<void>): void {
    messaging().setBackgroundMessageHandler(handler);
  }

  /**
   * Handle notification opened (user tapped on notification)
   */
  setupNotificationOpenedHandler(
    onNotificationOpened: (notification: any) => void
  ): () => void {
    // Handle notification opened app from background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);
      onNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification (when app was quit)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          onNotificationOpened(remoteMessage);
        }
      });

    return () => {}; // Return empty unsubscribe function
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Delete FCM token (call on logout)
   */
  async deleteToken(userId: string): Promise<void> {
    try {
      await messaging().deleteToken();
      
      // Remove token from Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: null,
      });
      
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      throw error;
    }
  }
}

export default FCMService.getInstance();
