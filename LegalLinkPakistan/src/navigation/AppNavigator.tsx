// ==========================================
// IMPORTS & COMPONENT INCLUDES
// ==========================================
import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export const navigationRef = createNavigationContainerRef<any>();

// Auth Screens
import RoleSelectionScreen from '../screens/Shared/RoleSelectionScreen';
import LoginScreen from '../screens/Shared/LoginScreen';
import RegistrationSuccess from '../screens/Shared/RegistrationSuccess';

// AI Screens
import AiChatbotScreen from '../screens/Shared/AiChatbotScreen';

// Admin Screens
import AdminVerify from '../screens/Admin/AdminVerify';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import NewLawyerVerification from '../screens/Admin/NewLawyerVerification';
import ComplaintHandling from '../screens/Admin/ComplaintHandling'; 
import ComplaintDetails from '../screens/Shared/ComplaintScreen/ComplaintDetails';

// Client Screens
import ClientSignup from '../screens/Client/Registration/ClientSignup';
import ClientDashboard from '../screens/Client/ClientDashboard';

// Lawyer Screens
import LawyerProfile from '../screens/Shared/LawyerProfile';
import CaseDetails from '../screens/Client/Booking/CaseDetails';
import AppointmentSummary from '../screens/Client/Booking/AppointmentSummary';
import Payment from '../screens/Client/Booking/Payment';

import AppointmentStatus from '../screens/Shared/TrackAppointment/AppointmentStatus';
import TrackAppointment from '../screens/Shared/TrackAppointment/TrackAppointment';
import ComplaintStatus from '../screens/Shared/ComplaintScreen/ComplaintStatus';

// Lawyer Onboarding
import LawyerSignup from '../screens/Lawyer/Registration/LawyerSignup';

import LawyerStatus from '../screens/Lawyer/LawyerStatus';
import LawyerDetailVerify from '../screens/Admin/LawyerDetailVerify';
import LawyerDashboard from '../screens/Lawyer/LawyerDashboard';

// Appointment & Wallet Management
import ClientRequests from '../screens/Lawyer/AppointmentManagement/ClientRequests';
import RequestDetails from '../screens/Lawyer/AppointmentManagement/RequestDetails';
import Wallet from '../screens/Lawyer/Wallet/Wallet';

// Chat & Notifications
import ChatScreen from '../screens/Shared/ChatScreen/ChatScreen';
import ChatsListScreen from '../screens/Shared/ChatScreen/ChatsListScreen';
import CallScreen from '../screens/Shared/ChatScreen/CallScreen';
import ChatInfo from '../screens/Shared/ChatScreen/ChatInfo';
import ComplaintScreen from '../screens/Shared/ComplaintScreen/ComplaintScreen';
import { NotificationProvider } from '../components/Common/NotificationProvider';
import NotificationsScreen from '../screens/Shared/NotificationsScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';
import RecommendedLawyersScreen from '../screens/Client/Booking/RecommendedLawyersScreen';

// ==========================================
// NAVIGATION TYPES
// ==========================================
export type RootStackParamList = {
  RoleSelection: undefined;
  Login: { role: 'Client' | 'Lawyer' | 'Admin' };
  RegistrationSuccess: undefined;

  AdminVerify: { email: string };
  AdminDashboard: undefined;
  NewLawyerVerification: undefined;
  ComplaintHandling: undefined; 
  ComplaintDetails: { id: string };

  ClientSignup: undefined;
  ClientDashboard: undefined;

  LawyerProfile: { lawyerId: string };
  CaseDetails: { lawyerId: string; lawyerName: string };
  AppointmentSummary: { caseData: any; lawyerData: any };
  SecurePaymentScreen: { bookingId: string; amount: number };

  AppointmentStatus: { bookingId: string; role?: 'client' | 'lawyer' };
  TrackAppointment: { role: 'client' | 'lawyer' };
  ComplaintStatus: undefined;

  LawyerSignup: undefined;

  LawyerStatus: { status: string; reason?: string };
  LawyerDetailVerify: { lawyerId: string };
  LawyerDashboard: undefined;

  ClientRequests: undefined;
  RequestDetails: { bookingId: string; requestData: any };
  Wallet: undefined;

  AiChatbotScreen: undefined;

  ChatsList: undefined;
  ChatsScreen: { bookingId: string };
  ChatInfo: { bookingId: string };
  ComplaintScreen: { lawyerId: string; bookingId: string };

  CallScreen: {
    socket: any;
    bookingId: string;
    partnerId: string;
    partnerName?: string;
    isCaller: boolean;
    isVideo: boolean;
  };

  ProfileScreen: undefined;
  RecommendedLawyersScreen: undefined;
  NotificationsScreen: undefined;
};

// ==========================================
// STACK NAVIGATOR CONFIG & COMPONENT
// ==========================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [initialRoute, setInitialRoute] = React.useState<any>('RoleSelection');

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          const role = user.role;
          if (role === 'Client') {
            setInitialRoute('ClientDashboard');
          } else if (role === 'Lawyer') {
            setInitialRoute('LawyerDashboard');
          } else if (role === 'Admin') {
            setInitialRoute('AdminDashboard');
          }
        }
      } catch (e) {
        console.error('Session check error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#001a4d', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NotificationProvider>
      <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* AUTH */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />

        {/* ADMIN */}
        <Stack.Screen name="AdminVerify" component={AdminVerify} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="NewLawyerVerification" component={NewLawyerVerification} />
        <Stack.Screen name="ComplaintHandling" component={ComplaintHandling} />
        <Stack.Screen name="ComplaintDetails" component={ComplaintDetails} />

        {/* CLIENT */}
        <Stack.Screen name="ClientSignup" component={ClientSignup} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />

        {/* LAWYER */}
        <Stack.Screen name="LawyerSignup" component={LawyerSignup} />

        <Stack.Screen name="LawyerStatus" component={LawyerStatus} />
        <Stack.Screen name="LawyerDetailVerify" component={LawyerDetailVerify} />
        <Stack.Screen name="LawyerDashboard" component={LawyerDashboard} />

        {/* BOOKING */}
        <Stack.Screen name="LawyerProfile" component={LawyerProfile} />
        <Stack.Screen name="CaseDetails" component={CaseDetails} />
        <Stack.Screen name="AppointmentSummary" component={AppointmentSummary} />
        <Stack.Screen name="AppointmentStatus" component={AppointmentStatus} />
        <Stack.Screen name="TrackAppointment" component={TrackAppointment} />
        <Stack.Screen name="SecurePaymentScreen" component={Payment} />
        <Stack.Screen name="ComplaintStatus" component={ComplaintStatus} />

        {/* REQUESTS */}
        <Stack.Screen name="ClientRequests" component={ClientRequests} />
        <Stack.Screen name="RequestDetails" component={RequestDetails} />
        <Stack.Screen name="Wallet" component={Wallet} />

        {/* CHAT SYSTEM & COMPLAINT */}
        <Stack.Screen name="ChatsList" component={ChatsListScreen} />
        <Stack.Screen name="ChatsScreen" component={ChatScreen} />
        <Stack.Screen name="ChatInfo" component={ChatInfo} />
        <Stack.Screen name="ComplaintScreen" component={ComplaintScreen} />
        <Stack.Screen name="CallScreen" component={CallScreen} />

        {/* AI & UTILITY */}
        <Stack.Screen name="AiChatbotScreen" component={AiChatbotScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="RecommendedLawyersScreen" component={RecommendedLawyersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </NotificationProvider>
  );
};

// ==========================================
// EXPORTS
// ==========================================
export default AppNavigator;
