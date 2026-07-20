import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, AppState, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import socket from '../../socket';
import { NotificationService } from '../../utils/notificationService';
import { navigationRef } from '../../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/theme';
import IncomingCallModal from './IncomingCallModal';

const { width } = Dimensions.get('window');
const API_BASE = "https://mug-work-public.ngrok-free.dev/api";

interface NotificationContextProps {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  deleteMultipleNotifications: (ids: string[]) => Promise<void>;
  handleNotificationRedirect: (data: any, explicitType?: string) => void | Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Incoming Call Overlay Modal State
  const [incomingCallData, setIncomingCallData] = useState<any>(null);

  // Foreground Toast Animation State
  const [currentToast, setCurrentToast] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const toastTimeoutRef = useRef<any>(null);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const cleanToken = token.replace(/['"]+/g, '');
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
        const unread = response.data.notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.log('[NotificationProvider] Fetch error:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const cleanToken = token.replace(/['"]+/g, '');
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
    } catch (error) {
      console.log('[NotificationProvider] Mark read error:', error);
      fetchNotifications(); // Rollback on error
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const cleanToken = token.replace(/['"]+/g, '');
      await axios.put(`${API_BASE}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
    } catch (error) {
      console.log('[NotificationProvider] Mark all read error:', error);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      console.log('[NotificationProvider] deleteNotification called for ID:', id);
      const isUnread = !notifications.find(n => n._id === id)?.isRead;
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (isUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      const token = await AsyncStorage.getItem('userToken');
      console.log('[NotificationProvider] token retrieved for delete:', token ? 'exists' : 'null/empty');
      if (!token) return;
      const cleanToken = token.replace(/['"]+/g, '');
      console.log('[NotificationProvider] sending DELETE to:', `${API_BASE}/notifications/${id}`);
      const response = await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      console.log('[NotificationProvider] delete success:', response.data);
    } catch (error) {
      console.log('[NotificationProvider] Delete notification error:', error);
      fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    try {
      console.log('[NotificationProvider] clearAllNotifications called');
      setNotifications([]);
      setUnreadCount(0);

      const token = await AsyncStorage.getItem('userToken');
      console.log('[NotificationProvider] token retrieved for clearAll:', token ? 'exists' : 'null/empty');
      if (!token) return;
      const cleanToken = token.replace(/['"]+/g, '');
      console.log('[NotificationProvider] sending DELETE to clear-all');
      const response = await axios.delete(`${API_BASE}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      console.log('[NotificationProvider] clearAll success:', response.data);
    } catch (error) {
      console.log('[NotificationProvider] Clear all notifications error:', error);
      fetchNotifications();
    }
  };

  const deleteMultipleNotifications = async (ids: string[]) => {
    try {
      console.log('[NotificationProvider] deleteMultipleNotifications called for IDs:', ids);
      const unreadSelectedCount = notifications.filter(n => ids.includes(n._id) && !n.isRead).length;
      setNotifications(prev => prev.filter(n => !ids.includes(n._id)));
      setUnreadCount(prev => Math.max(0, prev - unreadSelectedCount));

      const token = await AsyncStorage.getItem('userToken');
      console.log('[NotificationProvider] token retrieved for deleteMultiple:', token ? 'exists' : 'null/empty');
      if (!token) return;
      const cleanToken = token.replace(/['"]+/g, '');
      console.log('[NotificationProvider] sending POST to delete-multiple');
      const response = await axios.post(`${API_BASE}/notifications/delete-multiple`, { ids }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      console.log('[NotificationProvider] deleteMultiple success:', response.data);
    } catch (error) {
      console.log('[NotificationProvider] Delete multiple notifications error:', error);
      fetchNotifications();
    }
  };

  const handleNotificationRedirect = async (data: any, explicitType?: string) => {
    if (!data) return;
    const type = data.type || explicitType;
    const { bookingId, complaintId, id } = data;
    console.log(`[NotificationProvider] Redirecting for type: ${type}`, data);

    if (navigationRef.isReady()) {
      if (type === 'chat' && bookingId) {
        navigationRef.navigate('ChatsScreen', { bookingId });
      } else if (type === 'booking' && bookingId) {
        if (userRole?.toLowerCase() === 'lawyer') {
          try {
            let token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
            token = token?.trim().replace(/^["']|["']$/g, '') || '';
            const res = await axios.get(`https://mug-work-public.ngrok-free.dev/api/bookings/status/${bookingId}`, {
              headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.data?.success) {
              const booking = res.data.booking;
              if (booking.status === 'pending') {
                navigationRef.navigate('RequestDetails', { bookingId, requestData: booking });
                return;
              }
            }
          } catch (e) {
            console.log("Error checking booking status on redirect:", e);
          }
        }
        navigationRef.navigate('AppointmentStatus', { bookingId, role: userRole?.toLowerCase() === 'lawyer' ? 'lawyer' : 'client' });
      } else if (type === 'complaint') {
        const targetId = complaintId || id;
        if (targetId) {
          navigationRef.navigate('ComplaintDetails', { id: targetId });
        } else {
          navigationRef.navigate('ComplaintStatus');
        }
      }
    } else {
      console.warn('[NotificationProvider] Navigation Container not ready');
    }
  };

  const showToast = (notification: any) => {
    // Dismiss any active toast
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setCurrentToast(notification);

    // Slide down animation
    Animated.spring(slideAnim, {
      toValue: 20, // Slide down past notch area
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Auto dismiss after 4 seconds
    toastTimeoutRef.current = setTimeout(() => {
      dismissToast();
    }, 4500);
  };

  const dismissToast = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setCurrentToast(null);
    });
  };

  const handleToastPress = () => {
    if (currentToast) {
      markAsRead(currentToast._id);
      handleNotificationRedirect(currentToast.data, currentToast.type);
      dismissToast();
    }
  };

  useEffect(() => {
    const setupNotifications = async () => {
      // 1. Request permissions and construct Android channel
      await NotificationService.requestPermission();
      await NotificationService.createChannels();

      // 2. Register socket & fetch history
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        const myUserId = (userObj.id || userObj._id || '').toString();
        if (myUserId) {
          setUserId(myUserId);
          setUserRole(userObj.role);

          // Register socket
          socket.emit('registerUser', myUserId);
          console.log('[NotificationProvider] User socket registered:', myUserId);
        }
      }
      await fetchNotifications();
    };

    setupNotifications();

    const handleConnect = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        const myUserId = (userObj.id || userObj._id || '').toString();
        if (myUserId) {
          socket.emit('registerUser', myUserId);
          console.log('[NotificationProvider] Socket reconnected & user registered:', myUserId);
        }
      }
    };

    socket.on('connect', handleConnect);

    // Periodic check for new session items (every 15s)
    const interval = setInterval(setupNotifications, 15000);

    return () => {
      clearInterval(interval);
      socket.off('connect', handleConnect);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const handleNewNotification = async (notification: any) => {
      console.log('[NotificationProvider] Received notification event:', notification);

      // Append new notification to feed state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Verify app state
      const state = AppState.currentState;
      if (state === 'active') {
        // Foreground: Animated Slide-down Alert Banner
        showToast(notification);
      } else {
        // Background: Trigger OS Local System Banner (including chat notifications)
        await NotificationService.displayNotification(
          notification.title,
          notification.body,
          notification.type,
          notification.data
        );
      }
    };

    const handleIncomingCall = async (data: any) => {
      console.log('[NotificationProvider] Received global incomingCall:', data);

      // 1. Store incoming call data to show full screen IncomingCallModal
      setIncomingCallData(data);

      // 2. Trigger native OS system notification banner (works outside the app)
      await NotificationService.displayNotification(
        `Incoming ${data.isVideo ? 'Video' : 'Voice'} Call`,
        `Tap to answer incoming call from ${data.callerName || 'Legal Partner'}`,
        'call',
        {
          bookingId: data.bookingId,
          partnerId: data.callerId,
          partnerName: data.callerName || 'Legal Partner',
          partnerPic: data.callerPic || '',
          isCaller: false,
          isVideo: data.isVideo,
          incomingSignal: data.signal,
          callerSocketId: data.from
        }
      );
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('incomingCall', handleIncomingCall);

    // Register Notifee background event click actions
    NotificationService.registerBackgroundHandler((data) => {
      handleNotificationRedirect(data);
    });

    // Register Notifee foreground event click actions
    const unsubscribeForeground = NotificationService.registerForegroundHandler((data) => {
      handleNotificationRedirect(data);
    });

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('incomingCall', handleIncomingCall);
      unsubscribeForeground();
    };
  }, [userId, userRole]);

  const handleAcceptCall = () => {
    if (!incomingCallData) return;
    const data = incomingCallData;
    setIncomingCallData(null);

    if (navigationRef.isReady()) {
      navigationRef.navigate('CallScreen', {
        socket,
        bookingId: data.bookingId,
        partnerId: data.callerId,
        partnerName: data.callerName || 'Legal Partner',
        partnerPic: data.callerPic || '',
        isCaller: false,
        isVideo: data.isVideo,
        incomingSignal: data.signal,
        callerSocketId: data.from
      });
    }
  };

  const handleDeclineCall = () => {
    if (!incomingCallData) return;
    socket.emit('callLog', { bookingId: incomingCallData.bookingId, message: 'Call declined' });
    setIncomingCallData(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return 'chat-processing-outline';
      case 'booking':
        return 'calendar-clock';
      case 'complaint':
        return 'alert-circle-outline';
      default:
        return 'bell-ring-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat':
        return COLORS.info;
      case 'booking':
        return COLORS.success;
      case 'complaint':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      deleteMultipleNotifications,
      handleNotificationRedirect
    }}>
      {children}

      {/* Full-Screen Interactive Incoming Call Modal Overlay */}
      {incomingCallData && (
        <IncomingCallModal
          visible={!!incomingCallData}
          callerName={incomingCallData.callerName || 'Legal Partner'}
          callerPic={incomingCallData.callerPic}
          isVideo={incomingCallData.isVideo}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Floating Animated In-App Notification Toast */}
      {currentToast && (
        <Animated.View style={[
          styles.toastContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}>
          <TouchableOpacity
            style={styles.toastContent}
            onPress={handleToastPress}
            activeOpacity={0.9}
          >
            <View style={[styles.iconBadge, { backgroundColor: getNotificationColor(currentToast.type) + '20' }]}>
              <Icon
                name={getNotificationIcon(currentToast.type)}
                size={26}
                color={getNotificationColor(currentToast.type)}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.toastTitle} numberOfLines={1}>{currentToast.title}</Text>
              <Text style={styles.toastBody} numberOfLines={2}>{currentToast.body}</Text>
            </View>
            <TouchableOpacity onPress={dismissToast} style={styles.closeBtn}>
              <Icon name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 35,
    left: 15,
    right: 15,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  toastTitle: {
    color: '#001a4d',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  toastBody: {
    color: '#64748b',
    fontSize: 12.5,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  }
});
