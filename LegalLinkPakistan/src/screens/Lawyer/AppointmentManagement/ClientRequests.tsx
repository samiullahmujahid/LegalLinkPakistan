import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, ActivityIndicator, Alert, RefreshControl, TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LawyerStyles as styles } from '../../../theme/styles/LawyerStyles';
import Bottombar from '../../../components/Common/BottomBar/Bottombar';

// 🔥 CORRECTED RELATIVE PATH NODE BASED ON YOUR VS CODE TREE
import RequestCard from '../../../components/Common/Requestcard/Requestcard'; 

const ClientRequests = ({ navigation }: any) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

  const getAuthHeader = async () => {
    let token = await AsyncStorage.getItem('userToken');
    if (!token) token = await AsyncStorage.getItem('token');

    if (token) {
      token = token.trim();
      if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        token = token.slice(1, -1);
      }
    }
    return token ? `Bearer ${token}` : '';
  };

  const fetchIncomingRequests = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      let lawyerId = '';
      if (userDataString) {
        const user = JSON.parse(userDataString);
        lawyerId = user.id || user._id;
      }

      if (!lawyerId) {
        lawyerId = "6a1bcd7cc101bbc46aa3a4ff"; 
      }

      const tokenHeader = await getAuthHeader();
      const config = {
        headers: {
          'Authorization': tokenHeader,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.get(`${BASE_URL}/api/bookings/lawyer/${lawyerId}`, config);
      
      if (response.data.success) {
        const allBookings = response.data.bookings || response.data.data || [];
        const pendingItems = allBookings.filter((b: any) => b.status?.toLowerCase() === 'pending');
        setRequests(pendingItems);
      }
    } catch (error: any) {
      console.error('Fetch Lawyer Requests Error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const getTimeAgo = (createdAtString: string) => {
    if (!createdAtString) return '2 hours ago';
    const dynamicDate = new Date(createdAtString);
    if (isNaN(dynamicDate.getTime())) return '2 hours ago';
    
    const seconds = Math.floor((new Date().getTime() - dynamicDate.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return 'Just now';
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    let rawPath = item.clientId?.profilePicUri || '';
    let finalAvatarUrl = '';

    if (rawPath) {
      if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
        finalAvatarUrl = rawPath;
      } else {
        finalAvatarUrl = `${BASE_URL}/${rawPath.replace(/^\//, '')}`;
      }
    }

    return (
      <RequestCard
        name={item.clientId?.name || 'Client Request'}
        avatarUri={finalAvatarUrl || undefined}
        line1Label="Case Type"
        line1Value={item.category || item.caseType || 'Legal Assistance'}
        line2Label="Case Subject"
        line2Value={item.caseTitle || item.caseSubject || '######'}
        timeAgo={getTimeAgo(item.createdAt)}
        status={item.status || 'pending'} 
        onPressDetails={() => {
          navigation.navigate('RequestDetails', { bookingId: item._id });
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.requestContainer}>
      <View style={styles.reqBookingHeader}>
        <View style={{ width: 28 }} />
        <Text style={styles.reqBookingHeaderTitle}>Incoming Client Requests</Text>
        <TouchableOpacity onPress={fetchIncomingRequests}>
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#001a4d" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchIncomingRequests} colors={['#001a4d']} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Icon name="folder-open-outline" size={60} color="#ccc" />
              <Text style={styles.emptyReqText}>No pending legal consultation requests found.</Text>
            </View>
          }
        />
      )}

      <Bottombar navigation={navigation} currentRoute="Home" role="Lawyer" />
    </SafeAreaView>
  );
};

export default ClientRequests;