import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LawyerStyles as styles } from '../../../theme/styles/LawyerStyles';
import ProfileCard from '../../../components/Common/ProfileCard/ProfileCard';

const AppointmentSummary = ({ route, navigation }: any) => {
  const { caseData, lawyerData } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handleBookingSubmit = async () => {
    const BASE_URL = 'https://mug-work-public.ngrok-free.dev'; 
    
    try {
      setLoading(true);
      
      let token = await AsyncStorage.getItem('userToken'); 
      if (!token) {
        token = await AsyncStorage.getItem('token');
      }

      if (token) {
        token = token.trim();
        if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
          token = token.slice(1, -1);
        }
      }

      const payload = {
        lawyerId: lawyerData?._id,
        courtLevel: caseData?.courtLevel,
        caseType: caseData?.caseType,
        subject: caseData?.subject,
        description: caseData?.description
      };

      const config = {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(`${BASE_URL}/api/bookings/create`, payload, config);

      if (response.data && response.data.success) {
        const generatedBookingId = response.data.booking?._id || response.data.data?._id; 

        Alert.alert(
          "Success 🎉", 
          "Your appointment request has been submitted successfully!",
          [{ 
            text: "View Status", 
            onPress: () => navigation.navigate('AppointmentStatus', { bookingId: generatedBookingId }) 
          }]
        );
      }
    } catch (error: any) {
      console.log("❌ [DEBUG] Pipeline Failure:", error?.response?.data || error.message);
      const backendErrorMessage = error?.response?.data?.message || "Failed to submit request. Please try again.";
      
      Alert.alert(
        "Submission Alert", 
        backendErrorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>Appointment Summary</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 100 }}>
        <Text style={styles.mainHeading}>Detailed Summary Of Your Case</Text>
        
        <View style={[styles.infoGrid, { marginBottom: 25, padding: 15, backgroundColor: '#f0f4ff', borderColor: '#001a4d', borderWidth: 0.5 }]}>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Subject:</Text>
            <Text style={[styles.gridValue, { color: '#001a4d' }]}>{caseData?.subject || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Case Type:</Text>
            <Text style={styles.gridValue}>{caseData?.caseType || 'N/A'}</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>Court Level:</Text>
            <Text style={styles.gridValue}>{caseData?.courtLevel || 'N/A'}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.gridLabel, { marginBottom: 4 }]}>Description:</Text>
            <Text style={[styles.bioText, { marginTop: 0, color: '#333' }]}>{caseData?.description || 'No description provided.'}</Text>
          </View>
        </View>

        <Text style={[styles.sectionHeading, { marginBottom: 10 }]}>Selected Lawyer Details</Text>
        
        <ProfileCard 
          userData={{
            ...lawyerData,
            role: 'Lawyer'
          }}
          // Props jo ProfileCard component ke update hone ke baad valid hain
          onCheckPress={() => navigation.navigate('LawyerProfile', { lawyerId: lawyerData?._id, viewOnly: true })}
        />
      </ScrollView>

      <View style={[styles.footerContainer, { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff' }]}>
        <TouchableOpacity 
          style={[styles.nextActionButton, { backgroundColor: '#00cc66' }]} 
          onPress={handleBookingSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextActionText}>Appointment Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AppointmentSummary;