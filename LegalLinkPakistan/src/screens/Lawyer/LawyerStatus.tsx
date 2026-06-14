import React, { useState, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, Image, ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LawyerStyles as ls } from '../../theme/styles/LawyerStyles';
import Header from '../../components/Common/Header';

const LawyerStatus = ({ navigation, route }: any) => {
  const [status, setStatus] = useState('Pending Approval');
  const [loading, setLoading] = useState(false);

  // Check profile status
  const checkStatus = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const res = await axios.get(`https://mug-work-public.ngrok-free.dev/api/auth/lawyer-profile-check/${email}`);
      if (res.data.isApproved) {
        setStatus('Approved');
      }
    } catch (err) {
      console.log("Status update error");
    } finally {
      setLoading(false);
    }
  };

  // Update status whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [])
  );

  return (
    <View style={ls.container}>
      {/* Header */}
      <Header 
        title="Verification Status" 
        showBackButton={true} 
      />

      <View style={[ls.scrollContent, { paddingTop: 40, paddingHorizontal: 20 }]}>
        
        {/* Branding Section */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image source={require('../../assets/images/logo.png')} style={ls.logo} />
          <Text style={ls.brandName}>Legal Link Pakistan</Text>
          <Text style={ls.subTitle}>Lawyer Registeration</Text>
        </View>

        {/* Message Section */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#001a4d' }}>
            Your Profile is in Under Review
          </Text>
          <Text style={{ fontSize: 13, color: '#555', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 }}>
            Thanks For Submitting details. Your Profile will be verify by Admin Panel. 
            This May take 24 hours or soon.
          </Text>
        </View>

        {/* Status Box */}
        <View style={{
          width: '85%',
          borderWidth: 1,
          borderColor: '#001a4d',
          borderRadius: 15,
          paddingVertical: 30,
          alignItems: 'center',
          backgroundColor: '#fff'
        }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#001a4d', marginBottom: 10 }}>
            Profile Status
          </Text>
          {loading ? (
            <ActivityIndicator color="#001a4d" />
          ) : (
            <Text style={{ fontSize: 14, color: status === 'Approved' ? 'green' : '#555', fontWeight: 'bold' }}>
              {status}
            </Text>
          )}
        </View>

      </View>
    </View>
  );
};

export default LawyerStatus;