import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LawyerStyles as styles } from '../../../theme/styles/LawyerStyles';
import Bottombar from '../../../components/Common/BottomBar/Bottombar';

import StatusCard from '../../../components/Common/StatusCard/StatusCard';

const ClientRequests = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
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
    if (!createdAtString) return 'Just now';
    const dynamicDate = new Date(createdAtString);
    if (isNaN(dynamicDate.getTime())) return 'Just now';

    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const createdDate = new Date(dynamicDate.getFullYear(), dynamicDate.getMonth(), dynamicDate.getDate());
    
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffSeconds = Math.floor((now.getTime() - dynamicDate.getTime()) / 1000);
      if (diffSeconds < 60) return 'Just now';
      
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[dynamicDate.getDay()];
    } else {
      const day = String(dynamicDate.getDate()).padStart(2, '0');
      const month = String(dynamicDate.getMonth() + 1).padStart(2, '0');
      const year = dynamicDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
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
      <StatusCard
        title={item.clientId?.name || 'Client Request'}
        avatarUri={finalAvatarUrl || undefined}
        line1={`Case Type: ${item.category || item.caseType || 'Legal Assistance'}`}
        line2={`Case Subject: ${item.caseTitle || item.caseSubject || '######'}`}
        timeAgo={getTimeAgo(item.createdAt)}
        onPress={() => {
          navigation.navigate('RequestDetails', { bookingId: item._id });
        }}
        containerStyle={{ marginHorizontal: 0 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.requestContainer}>
      <View style={[
        styles.reqBookingHeader,
        {
          height: undefined,
          paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 15,
          paddingBottom: 15,
        }
      ]}>
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