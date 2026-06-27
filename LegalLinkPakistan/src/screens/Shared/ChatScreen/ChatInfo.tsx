import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RatingAlert from '../../../components/Common/Alert/Alert';
import Header from '../../../components/Common/Header';
import { MyButton } from '../../../components/Common/MyButton';

const ChatInfo = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingAlert, setShowRatingAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');
        setCurrentUser(user);
        
        const token = (await AsyncStorage.getItem('userToken'))?.replace(/['"]+/g, '');
        const res = await axios.get(
          `https://mug-work-public.ngrok-free.dev/api/bookings/status/${bookingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.success) setBooking(res.data.booking);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId]);

  const handleReviewSubmit = async (rating: number, review: string) => {
    try {
      const token = (await AsyncStorage.getItem('userToken'))?.replace(/['"]+/g, '');
      const res = await axios.post(
        `https://mug-work-public.ngrok-free.dev/api/bookings/complete/${bookingId}`,
        { rating, review },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setShowRatingAlert(false);
        Alert.alert('Success', 'Appointment Completed & Review Submitted');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to complete appointment');
    }
  };

  const isLawyerViewing = currentUser?.role?.toLowerCase() === 'lawyer';

  const extractId = (id: any) => {
    if (!id) return "";
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    if (typeof id === 'object' && id?._id) return id._id.toString();
    return String(id);
  };
  
  const profileData = isLawyerViewing ? {
    name: booking?.clientName || "Client",
    pic: booking?.clientPic,
    title: "Client",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
    id: extractId(booking?.clientId)
  } : {
    name: booking?.lawyerName || "Legal Consultant",
    pic: booking?.lawyerPic,
    title: "Legal Consultant",
    email: booking?.lawyerEmail,
    phone: booking?.lawyerPhone,
    address: booking?.lawyerAddress,
    id: extractId(booking?.lawyerId)
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title={isLawyerViewing ? "Client Profile" : "Lawyer Profile"} 
        backgroundColor="#fff" 
        textColor="#000" 
      />

      {loading ? (
        <ActivityIndicator size="large" color="#001a4d" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView>
          <View style={{ alignItems: 'center', marginTop: 25 }}>
            <View style={{ width: 105, height: 105, borderRadius: 52.5, borderWidth: 3, borderColor: '#001a4d', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: profileData.pic ? `https://mug-work-public.ngrok-free.dev${profileData.pic}` : 'https://via.placeholder.com/150' }}
                style={{ width: 95, height: 95, borderRadius: 47.5 }}
              />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 10 }}>{profileData.name}</Text>
            <Text style={{ color: '#001a4d', fontWeight: '500' }}>{profileData.title}</Text>
          </View>

          <View style={{ marginTop: 30, padding: 20, marginHorizontal: 20, borderRadius: 15, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#001a4d' }}>Information</Text>
            <View style={{ gap: 10 }}>
              <Text style={{ color: '#444' }}><Text style={{ fontWeight: 'bold' }}>• Name:</Text> {profileData.name}</Text>
              <Text style={{ color: '#444' }}><Text style={{ fontWeight: 'bold' }}>• Email:</Text> {profileData.email}</Text>
              <Text style={{ color: '#444' }}><Text style={{ fontWeight: 'bold' }}>• Phone:</Text> {profileData.phone}</Text>
              <Text style={{ color: '#444' }}><Text style={{ fontWeight: 'bold' }}>• Address:</Text> {profileData.address}</Text>
            </View>
          </View>

          {!isLawyerViewing && (
            <MyButton 
              title="Complete Appointment"
              onPress={() => setShowRatingAlert(true)}
              style={{ marginTop: 30, marginHorizontal: 20, borderRadius: 10 }}
            />
          )}

          <MyButton 
            title="Add Complaint to Admin"
            onPress={() => {
              const finalId = typeof profileData.id === 'string' ? profileData.id : String(profileData.id);
              navigation.navigate('ComplaintScreen', { 
                  targetId: finalId, 
                  bookingId: bookingId,
                  role: isLawyerViewing ? 'lawyer' : 'client'
              });
            }}
            style={{ marginTop: 15, marginHorizontal: 20, backgroundColor: '#d9534f', borderRadius: 10 }}
          />
        </ScrollView>
      )}

      <RatingAlert
        visible={showRatingAlert}
        onClose={() => setShowRatingAlert(false)}
        onSubmit={handleReviewSubmit}
      />
    </SafeAreaView>
  );
};

export default ChatInfo;