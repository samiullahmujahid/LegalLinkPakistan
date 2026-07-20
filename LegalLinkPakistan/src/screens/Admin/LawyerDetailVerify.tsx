import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AdminStyles as s } from '../../theme/styles/AdminStyles';
import Header from '../../components/Common/Header';
import { MyButton } from '../../components/Common/MyButton';

const LawyerDetailVerify = ({ route, navigation }: any) => {
  const { lawyerId } = route.params;
  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        const response = await axios.get(`https://mug-work-public.ngrok-free.dev/api/admin/pending-lawyers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const found = response.data.lawyers.find((l: any) => l._id === lawyerId);
        setLawyer(found);
      } catch (err) {
        Alert.alert("Error", "Could not fetch lawyer details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [lawyerId]);

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reason.trim()) {
      Alert.alert("Reason Required", "Please enter a reason for rejection.");
      return;
    }

    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await axios.post("https://mug-work-public.ngrok-free.dev/api/admin/update-status", {
        id: lawyerId,
        status,
        reason
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Alert.alert("Success", `Lawyer has been ${status}`);
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#001a4d" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <Header 
        title="Lawyer Documents" 
        showBackButton={true} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scrollContent}>
          <View style={s.infoCard}>
          <Text style={s.sectionLabel}>Personal Details</Text>
          <Text style={s.detailText}>Name: <Text style={s.bold}>{lawyer?.name}</Text></Text>
          <Text style={s.detailText}>Email: <Text style={s.bold}>{lawyer?.email}</Text></Text>
          <Text style={s.detailText}>Enrollment: <Text style={s.bold}>{lawyer?.enrollmentNumber}</Text></Text>
        </View>

        <View style={s.docCard}>
          <Text style={s.sectionLabel}>License Copy</Text>
          {lawyer?.licensePicUri ? (
            <Image 
              source={{ 
                uri: lawyer.licensePicUri.startsWith('http://') || lawyer.licensePicUri.startsWith('https://') || lawyer.licensePicUri.startsWith('data:')
                  ? lawyer.licensePicUri
                  : `https://mug-work-public.ngrok-free.dev/${lawyer.licensePicUri.replace(/^\//, '').replace(/\\/g, '/')}`
              }} 
              style={s.licenseImg} 
              resizeMode="contain"
            />
          ) : (
            <View style={s.noDoc}>
              <Icon name="file-image-outline" size={50} color="#ccc" />
              <Text>No Document Uploaded</Text>
            </View>
          )}
        </View>

        <TextInput
          style={s.reasonInput}
          placeholder="Enter rejection reason here..."
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <View style={s.btnRow}>
          <MyButton 
            title="Reject"
            onPress={() => handleStatusUpdate('rejected')}
            disabled={actionLoading}
            style={[s.actionBtn, s.rejectBtn, { height: undefined, marginTop: 0 }]}
            textStyle={s.btnText}
          />

          <MyButton 
            title="Approve"
            onPress={() => handleStatusUpdate('approved')}
            disabled={actionLoading}
            style={[s.actionBtn, s.approveBtn, { height: undefined, marginTop: 0 }]}
            textStyle={s.btnText}
          />
        </View>
        
        {actionLoading && <ActivityIndicator color="#001a4d" style={{marginTop: 10}} />}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LawyerDetailVerify;
