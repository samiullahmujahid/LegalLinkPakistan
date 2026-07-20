import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LawyerStyles as s } from '../../../theme/styles/LawyerStyles';
import Header from '../../../components/Common/Header';
import { COLORS } from '../../../theme/theme';
import { MyButton } from '../../../components/Common/MyButton';

const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

export default function RequestDetails({ navigation, route }: { navigation: any; route: any }) {
  const { bookingId, requestData } = route.params || {};

  const [date, setDate] = useState<string>('14/02/2026'); 
  const [time, setTime] = useState<string>('2:00 pm');
  const [paymentLimit, setPaymentLimit] = useState<string>('30'); // Default to 30 minutes
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  React.useEffect(() => {
    if (!requestData && bookingId) {
      const fetchDetails = async () => {
        try {
          setLoadingDetails(true);
          let token = await AsyncStorage.getItem('userToken');
          token = token?.trim().replace(/^["']|["']$/g, '') || '';
          const response = await fetch(`${BASE_URL}/api/bookings/status/${bookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          });
          const res = await response.json();
          if (res.success) {
            setFetchedData(res.booking);
          }
        } catch (e) {
          console.log("Error loading request details:", e);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchDetails();
    }
  }, [bookingId, requestData]);

  const activeData = requestData || fetchedData;
  const clientName = activeData?.clientId?.name || activeData?.client?.name || activeData?.clientName || "Client";
  const caseCategory = activeData?.caseCategory || "General";
  const caseSubject = activeData?.caseSubject || "######";
  const caseDescription = activeData?.caseDescription || "No description provided.";

  if (loadingDetails) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const payload: any = { status };
      if (status === 'accepted') {
        payload.scheduledDate = date;
        payload.scheduledTime = time;
        payload.paymentLimitMinutes = parseInt(paymentLimit) || 30;
      }

      const response = await fetch(`${BASE_URL}/api/bookings/lawyer/update-status/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token?.trim().replace(/^["']|["']$/g, '')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (resData.success) {
        Alert.alert("Success", `Request ${status} successfully!`);
        navigation.goBack();
      } else {
        Alert.alert("Error", resData.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Network Error:", error.message);
      Alert.alert("Network Error", "Check your internet connection.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: COLORS.white }]}>
      <Header title="Request Details" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ backgroundColor: COLORS.primary, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <Text style={{ color: '#ffcc00', fontWeight: '700' }}>CLIENT NAME</Text>
            <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>{clientName}</Text>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 15 }} />
            <Text style={{ color: '#ccc' }}>CATEGORY: {caseCategory}</Text>
            <Text style={{ color: '#fff', marginTop: 10 }}>SUBJECT: {caseSubject}</Text>
            <Text style={{ color: '#e2e8f0', marginTop: 10, textAlign: 'justify' }}>{caseDescription}</Text>
          </View>

          <View style={{ backgroundColor: COLORS.lightBg, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.lightGray }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10, color: COLORS.primary }}>🗓️ Set Schedule & Details</Text>
            
            <Text style={{ fontSize: 12, color: COLORS.gray, marginBottom: 5, fontWeight: '600' }}>Date (e.g. 14/02/2026):</Text>
            <TextInput value={date} onChangeText={setDate} style={{ backgroundColor: COLORS.lightGray, padding: 10, borderRadius: 8, marginBottom: 10, color: COLORS.text }} />
            
            <Text style={{ fontSize: 12, color: COLORS.gray, marginBottom: 5, fontWeight: '600' }}>Time (e.g. 2:00 PM):</Text>
            <TextInput value={time} onChangeText={setTime} style={{ backgroundColor: COLORS.lightGray, padding: 10, borderRadius: 8, marginBottom: 10, color: COLORS.text }} />

            <Text style={{ fontSize: 12, color: COLORS.gray, marginBottom: 5, fontWeight: '600' }}>Payment Due Limit (Minutes):</Text>
            <TextInput 
              value={paymentLimit} 
              onChangeText={setPaymentLimit} 
              keyboardType="numeric" 
              placeholder="e.g. 30" 
              style={{ backgroundColor: COLORS.lightGray, padding: 10, borderRadius: 8, color: COLORS.text }} 
            />
          </View>

          {actionLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <View style={{ gap: 12 }}>
              <MyButton 
                title="Accept & Schedule"
                onPress={() => handleStatusUpdate('accepted')}
                style={{ backgroundColor: COLORS.success, height: undefined, marginTop: 0, paddingVertical: 15 }}
                textStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <MyButton 
                title="Reject Request"
                onPress={() => handleStatusUpdate('rejected')}
                style={{ backgroundColor: COLORS.danger, height: undefined, marginTop: 0, paddingVertical: 15 }}
                textStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
