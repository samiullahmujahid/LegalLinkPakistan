import React, { useEffect, useState } from 'react';
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, ScrollView, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import Header from '../../../components/Common/Header';
import { COLORS } from '../../../theme/theme';
import { MyButton } from '../../../components/Common/MyButton';

// Robust helper to parse scheduled Date & Time formats into a JS Date object
const parseScheduledDateTime = (dateStr: string, timeStr: string): Date | null => {
  try {
    if (!dateStr || !timeStr) return null;
    
    // Normalize date: supports DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD
    const dateParts = dateStr.split(/[-/]/);
    let day = 0, month = 0, year = 0;
    if (dateParts.length === 3) {
      if (dateParts[0].length === 4) {
        year = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]) - 1;
        day = parseInt(dateParts[2]);
      } else {
        day = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]) - 1;
        year = parseInt(dateParts[2]);
      }
    } else {
      const test = new Date(dateStr);
      if (!isNaN(test.getTime())) return test;
      return null;
    }

    // Normalize time: supports format like '2:00 pm' or '12:00 PM'
    const cleanTime = timeStr.trim().toLowerCase();
    const isPm = cleanTime.includes('pm');
    const timeNumStr = cleanTime.replace(/[ap]m/, '').trim();
    const timeParts = timeNumStr.split(':');
    let hours = parseInt(timeParts[0]);
    let minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;

    if (isPm && hours < 12) {
      hours += 12;
    } else if (!isPm && hours === 12) {
      hours = 0;
    }

    const scheduledDateObj = new Date(year, month, day, hours, minutes, 0);
    return isNaN(scheduledDateObj.getTime()) ? null : scheduledDateObj;
  } catch (error) {
    console.error("Error parsing date/time:", error);
    return null;
  }
};

const AppointmentStatus = ({ route, navigation }: any) => {
  const { bookingId, role = 'client' } = route.params || {}; 
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Real-time ticking states
  const [paymentCountdown, setPaymentCountdown] = useState<string>('');
  const [startCountdown, setStartCountdown] = useState<string>('');
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(false);
  const [paymentExpired, setPaymentExpired] = useState<boolean>(false);

  const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

  const getRequestConfig = async () => {
    let token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
    token = token?.trim().replace(/^["']|["']$/g, '') || '';
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    };
  };

  const fetchBookingStatus = async () => {
    try {
      const config = await getRequestConfig();
      const response = await axios.get(`${BASE_URL}/api/bookings/status/${bookingId}`, config);
      if (response.data?.success) {
        setBookingDetails(response.data.booking);
      }
    } catch (error: any) {
      console.error("❌ Sync Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingStatus();
  }, [bookingId]);

  // Real-time Interval Logic
  useEffect(() => {
    if (!bookingDetails) return;

    const tick = () => {
      const now = Date.now();

      // 1. Handle Payment Expiry Countdown
      if (bookingDetails.status === 'accepted') {
        if (bookingDetails.paymentDeadline) {
          const deadlineTime = new Date(bookingDetails.paymentDeadline).getTime();
          const diff = deadlineTime - now;
          if (diff > 0) {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setPaymentCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            setPaymentExpired(false);
          } else {
            setPaymentCountdown('Expired');
            setPaymentExpired(true);
            // Trigger fetch to synchronize expired state with DB
            fetchBookingStatus();
          }
        } else {
          setPaymentCountdown('');
        }
      }

      // 2. Handle Appointment Live Slot countdown
      if (bookingDetails.status === 'confirmed') {
        const startDateTime = parseScheduledDateTime(bookingDetails.scheduledDate, bookingDetails.scheduledTime);
        if (startDateTime) {
          const diff = startDateTime.getTime() - now;
          if (diff > 0) {
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            let countdownStr = '';
            if (hours > 0) countdownStr += `${hours}h `;
            countdownStr += `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
            
            setStartCountdown(countdownStr);
            setIsChatEnabled(false);
          } else {
            setStartCountdown('Appointment is Live! 🟢');
            setIsChatEnabled(true);
          }
        } else {
          setStartCountdown('');
          setIsChatEnabled(true); // fallback
        }
      }
    };

    tick(); // Run immediately
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [bookingDetails]);

  const handleStripePayment = async () => {
    if (paymentExpired) {
      Alert.alert("Expired", "Payment deadline has passed. This appointment is cancelled.");
      return;
    }
    setIsProcessingPayment(true);
    try {
      const config = await getRequestConfig();
      const response = await axios.post(`${BASE_URL}/api/bookings/payment/intent`, {
        amount: 250000,
        bookingId: bookingId
      }, config);
      
      const { clientSecret } = response.data;
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Legal Link Pakistan',
        billingDetailsCollectionConfiguration: {
            address: 'never' as any,
            phone: 'never' as any,
        },
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setIsProcessingPayment(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (!presentError) {
        await axios.put(`${BASE_URL}/api/bookings/confirm-payment/${bookingId}`, {}, config);
        Alert.alert("Success", "Payment settled successfully.");
        await fetchBookingStatus();
      }
    } catch (error: any) {
      Alert.alert("Payment Error", "Gateway connection failed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelAppointment = async () => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this booking?", [
      { text: "No" },
      { text: "Yes", onPress: async () => {
        try {
          const config = await getRequestConfig();
          await axios.put(`${BASE_URL}/api/bookings/cancel/${bookingId}`, {}, config);
          setBookingDetails((prev: any) => ({ ...prev, status: 'rejected' }));
          Alert.alert("Cancelled", "Appointment has been cancelled.");
          navigation.goBack();
        } catch (error) {
          Alert.alert("Error", "Could not cancel appointment.");
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const currentStatus = bookingDetails?.status || 'pending';
  const displayDate = bookingDetails?.scheduledDate || "Pending...";
  const displayTime = bookingDetails?.scheduledTime || "Pending...";
  
  const lawyerName = bookingDetails?.lawyerName || "Consultant";
  const clientName = bookingDetails?.clientName || "Client";
  const caseType = bookingDetails?.caseCategory || "General";
  const courtLevel = bookingDetails?.courtLevel || "District Court";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.lightBg }]}>
      <Header title="Appointment Status" />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Status Card Wrapper */}
        <View style={styles.statusCard}>
          <Icon 
            name={currentStatus === 'rejected' ? "close-circle" : currentStatus === 'confirmed' ? "check-circle" : "clock-outline"} 
            size={72} 
            color={currentStatus === 'rejected' ? COLORS.danger : currentStatus === 'confirmed' ? COLORS.info : COLORS.warning} 
          />
          <Text style={styles.statusHeading}>{currentStatus.toUpperCase()}</Text>
        </View>

        {/* Accepted & Awaiting Client Payment */}
        {currentStatus === 'accepted' && role === 'client' && (
          <View style={{ width: '100%', marginBottom: 10 }}>
            {paymentExpired ? (
              <View style={[styles.infoBox, { borderColor: COLORS.danger, borderWidth: 1.5, alignItems: 'center' }]}>
                <Icon name="alert-circle-outline" size={28} color={COLORS.danger} />
                <Text style={{ color: COLORS.danger, fontWeight: 'bold', marginTop: 5, textAlign: 'center' }}>
                  Payment deadline expired! Appointment has been automatically cancelled.
                </Text>
              </View>
            ) : (
              <MyButton 
                title={`Pay Consultation Fee ${paymentCountdown ? `(Due: ${paymentCountdown})` : ''}`}
                onPress={handleStripePayment} 
                disabled={isProcessingPayment}
                style={{ backgroundColor: COLORS.success, height: 50, marginTop: 0 }}
              />
            )}
          </View>
        )}
        
        {/* Accepted & Awaiting Lawyer View */}
        {currentStatus === 'accepted' && role === 'lawyer' && (
          <View style={[styles.infoBox, { borderLeftWidth: 4, borderLeftColor: COLORS.warning }]}>
            <Text style={{ textAlign: 'center', color: COLORS.warning, fontWeight: 'bold' }}>
              Waiting for client payment... {paymentCountdown ? `(Expires in ${paymentCountdown})` : ''}
            </Text>
          </View>
        )}

        {/* Confirmed Slot Timer & Dynamic Button */}
        {currentStatus === 'confirmed' && (
          <View style={{ width: '100%', marginBottom: 10 }}>
            
            {/* Live slot status banner */}
            <View style={[styles.infoBox, { alignItems: 'center', borderLeftWidth: 4, borderLeftColor: isChatEnabled ? COLORS.success : COLORS.info }]}>
              <Icon name={isChatEnabled ? "chat-processing-outline" : "clock-fast"} size={28} color={isChatEnabled ? COLORS.success : COLORS.info} />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginTop: 6 }}>
                {isChatEnabled ? 'Your consultation is active!' : 'Appointment Starts In:'}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: isChatEnabled ? COLORS.success : COLORS.info, marginTop: 4 }}>
                {startCountdown || 'Syncing clock...'}
              </Text>
            </View>

            <MyButton 
              title={isChatEnabled ? 'Go to Chat' : 'Go to Chat (Locked)'}
              onPress={() => navigation.navigate('ChatsScreen', { bookingId: bookingId })}
              disabled={!isChatEnabled}
              style={[
                { backgroundColor: COLORS.info, height: 50, marginTop: 0 },
                !isChatEnabled && { backgroundColor: COLORS.gray, opacity: 0.6 }
              ]}
            />
          </View>
        )}

        {/* Cancel Button */}
        {currentStatus !== 'rejected' && currentStatus !== 'completed' && currentStatus !== 'confirmed' && !paymentExpired && (
          <View style={{ width: '100%', marginBottom: 10 }}>
            <MyButton 
              title="Cancel Appointment" 
              onPress={handleCancelAppointment}
              style={{ backgroundColor: COLORS.danger, height: 50, marginTop: 0 }}
            />
          </View>
        )}

        {/* Details Card */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Appointment Details</Text>
          <View style={styles.row}><Text style={styles.label}>Booking ID:</Text><Text style={styles.value}>{bookingId.slice(-8)}</Text></View>
          
          <View style={styles.row}>
            <Text style={styles.label}>{role === 'lawyer' ? 'Client Name:' : 'Lawyer Name:'}</Text>
            <Text style={styles.value}>{role === 'lawyer' ? clientName : lawyerName}</Text>
          </View>

          <View style={styles.row}><Text style={styles.label}>Case Type:</Text><Text style={styles.value}>{caseType}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Court Level:</Text><Text style={styles.value}>{courtLevel}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Scheduled Date:</Text><Text style={styles.value}>{displayDate}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Scheduled Time:</Text><Text style={styles.value}>{displayTime}</Text></View>
        </View>

        <View style={{ width: '100%', marginTop: 10 }}>
          <MyButton 
            title="Back to Dashboard" 
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: COLORS.primary, height: 50, marginTop: 0 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 20, alignItems: 'stretch' },
  statusCard: { backgroundColor: COLORS.white, width: '100%', padding: 25, borderRadius: 15, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.lightGray },
  statusHeading: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 10 },
  paymentButton: { backgroundColor: COLORS.success, width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  chatButton: { backgroundColor: COLORS.info, width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  cancelButton: { backgroundColor: COLORS.danger, width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  dashboardBtn: { backgroundColor: COLORS.primary, width: '100%', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  infoBox: { backgroundColor: COLORS.white, width: '100%', padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.lightGray },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { color: COLORS.gray, fontSize: 13 },
  value: { color: COLORS.text, fontWeight: 'bold', fontSize: 13 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightBg }
});

export default AppointmentStatus;