import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

export const navigationRef = createNavigationContainerRef<any>();

// ================= AUTH =================
import RoleSelectionScreen from '../screens/Shared/RoleSelectionScreen';
import LoginScreen from '../screens/Shared/LoginScreen';
import RegistrationSuccess from '../screens/Shared/RegistrationSuccess';

// ================= AI =================
import AiChatbotScreen from '../components/Common/AiChatbotScreen';

// ================= ADMIN =================
import AdminLoginScreen from '../screens/Admin/AdminLoginScreen';
import AdminVerify from '../screens/Admin/AdminVerify';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import NewLawyerVerification from '../screens/Admin/NewLawyerVerification';
import ComplaintHandling from '../screens/Admin/ComplaintHandling'; 
import ComplaintDetails from '../components/Common/ComplaintScreen/ComplaintDetails'; // Added

// ================= CLIENT =================
import ClientSignup from '../screens/Client/ClientSignup';
import ClientDashboard from '../screens/Client/ClientDashboard';

// ================= LAWYER =================
import LawyerProfile from '../screens/Client/Booking/LawyerProfile';
import CaseDetails from '../screens/Client/Booking/CaseDetails';
import AppointmentSummary from '../screens/Client/Booking/AppointmentSummary';
import Payment from '../screens/Client/Booking/Payment';

import AppointmentStatus from '../components/Common/TrackAppointment/AppointmentStatus';
import TrackAppointment from '../components/Common/TrackAppointment/TrackAppointment';
import ComplaintStatus from '../components/Common/ComplaintScreen/ComplaintStatus'; // Added

// ================= LAWYER ONBOARD =================
import LawyerSignup from '../screens/Lawyer/LawyerSignup';
import LawyerSignUp2 from '../screens/Lawyer/LawyerSignUp2';
import LawyerSignUp3 from '../screens/Lawyer/LawyerSignUp3';

import LawyerStatus from '../screens/Lawyer/LawyerStatus';
import LawyerDetailVerify from '../screens/Lawyer/LawyerDetailVerify';
import LawyerDashboard from '../screens/Lawyer/LawyerDashboard';

// ================= REQUESTS =================
import ClientRequests from '../screens/Lawyer/AppointmentManagement/ClientRequests';
import RequestDetails from '../screens/Lawyer/AppointmentManagement/RequestDetails';
import Wallet from '../screens/Lawyer/Wallet/Wallet';

// ================= CHAT & COMPLAINTS =================
import ChatScreen from '../components/Common/ChatScreen/ChatScreen';
import ChatsListScreen from '../components/Common/ChatScreen/ChatsListScreen';
import CallScreen from '../components/Common/ChatScreen/CallScreen';
import ChatInfo from '../components/Common/ChatScreen/ChatInfo';
import ComplaintScreen from '../components/Common/ComplaintScreen/ComplaintScreen';
import { NotificationProvider } from '../components/Common/NotificationProvider';
import NotificationsScreen from '../screens/Shared/NotificationsScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';
import RecommendedLawyersScreen from '../screens/Client/Booking/RecommendedLawyersScreen';

// ================= TYPES =================
export type RootStackParamList = {
  RoleSelection: undefined;
  Login: { role: 'Client' | 'Lawyer' };
  RegistrationSuccess: undefined;

  AdminLogin: undefined;
  AdminVerify: { email: string };
  AdminDashboard: undefined;
  NewLawyerVerification: undefined;
  ComplaintHandling: undefined; 
  ComplaintDetails: { id: string }; // Added

  ClientSignup: undefined;
  ClientDashboard: undefined;

  LawyerProfile: { lawyerId: string };
  CaseDetails: { lawyerId: string; lawyerName: string };
  AppointmentSummary: { caseData: any; lawyerData: any };
  SecurePaymentScreen: { bookingId: string; amount: number };

  AppointmentStatus: { bookingId: string; role?: 'client' | 'lawyer' };
  TrackAppointment: { role: 'client' | 'lawyer' }; // Updated
  ComplaintStatus: undefined; // Added

  LawyerSignup: undefined;
  LawyerSignUp2: undefined;
  LawyerSignUp3: undefined;


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

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NotificationProvider>
      <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="RoleSelection"
        screenOptions={{ headerShown: false }}
      >
        {/* AUTH */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />

        {/* ADMIN */}
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
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
        <Stack.Screen name="LawyerSignUp2" component={LawyerSignUp2} />
        <Stack.Screen name="LawyerSignUp3" component={LawyerSignUp3} />


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

        {/* AI */}
        <Stack.Screen name="AiChatbotScreen" component={AiChatbotScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="RecommendedLawyersScreen" component={RecommendedLawyersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </NotificationProvider>
  );
};

export default AppNavigator;