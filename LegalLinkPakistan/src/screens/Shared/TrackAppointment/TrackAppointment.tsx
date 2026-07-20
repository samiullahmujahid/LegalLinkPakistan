import React, { useState, useCallback } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ClientStyles as styles } from '../../../theme/styles/ClientStyles';
import Header from '../../../components/Common/Header';
import StatusCard from '../../../components/Common/StatusCard/StatusCard';

const TrackAppointment = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { role = 'client' } = route.params || {};
  
  const [activeTab, setActiveTab] = useState<'current' | 'pending' | 'completed'>('current');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Selection Logic States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

  const fetchClientAppointments = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
      const cleanToken = token?.trim().replace(/^["']|["']$/g, '');
      const endpoint = role === 'lawyer' ? '/api/bookings/lawyer-bookings' : '/api/bookings/my-bookings';

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${cleanToken}`, 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.data.success) {
        setAllBookings(response.data.bookings || []);
        filterBookings(response.data.bookings || [], activeTab);
      }
    } catch (error: any) {
      console.error('Fetch Tracking Appointments Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, role]);

  useFocusEffect(useCallback(() => { fetchClientAppointments(); }, [fetchClientAppointments]));

  const filterBookings = (data: any[], tab: string) => {
    const filtered = data.filter((b: any) => {
      const status = b.status?.toLowerCase();
      if (status === 'cancelled_by_client') return false;
      if (tab === 'pending') return status === 'pending';
      if (tab === 'current') return status === 'accepted' || status === 'confirmed';
      if (tab === 'completed') return status === 'completed';
      return false;
    });
    setFilteredBookings(filtered);
  };

  React.useEffect(() => { filterBookings(allBookings, activeTab); setSelectedIds([]); setIsSelectionMode(false); }, [activeTab, allBookings]);

  const toggleSelection = (id: string) => {
    if (activeTab !== 'completed') return;
    if (selectedIds.includes(id)) {
      const newIds = selectedIds.filter(i => i !== id);
      setSelectedIds(newIds);
      if (newIds.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedIds([...selectedIds, id]);
      setIsSelectionMode(true);
    }
  };

  const deleteSelected = () => {
    Alert.alert("Delete", `Are you sure to delete ${selectedIds.length} items?`, [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
          const cleanToken = token?.trim().replace(/^["']|["']$/g, '');
          
          await Promise.all(selectedIds.map(id => 
            axios.delete(`${BASE_URL}/api/bookings/delete/${id}`, {
              headers: { 'Authorization': `Bearer ${cleanToken}` }
            }).catch(() => {})
          ));

          const remainingBookings = allBookings.filter(b => !selectedIds.includes(b._id));
          setAllBookings(remainingBookings);
          filterBookings(remainingBookings, activeTab);
        } catch (error) {
          console.log("Deletion failed:", error);
        } finally {
          setSelectedIds([]);
          setIsSelectionMode(false);
        }
      }}
    ]);
  };

  const tabs = role === 'lawyer' ? (['current', 'completed'] as const) : (['current', 'pending', 'completed'] as const);

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

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={isSelectionMode ? `${selectedIds.length} Selected` : "Track Appointments"}
        showBackButton={!isSelectionMode}
        leftElement={
          isSelectionMode ? (
            <TouchableOpacity onPress={() => {setIsSelectionMode(false); setSelectedIds([])}}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ) : undefined
        }
        rightElement={
          isSelectionMode ? (
            <TouchableOpacity onPress={deleteSelected}>
              <Icon name="delete" size={24} color="#ff3333" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={fetchClientAppointments}>
              <Icon name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          )
        }
      />

      <View style={styles.trackingTabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.trackingTabButton, activeTab === tab && styles.trackingActiveTabButton]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.trackingTabText, activeTab === tab && styles.trackingActiveTabText]}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.trackingLoaderBox}><ActivityIndicator size="large" color="#001a4d" /></View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchClientAppointments} colors={['#001a4d']} />}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item._id);
            const displayName = item.name || 'User';
            const rawPic = item.avatarUri || '';
            const finalAvatarUrl = rawPic ? (rawPic.startsWith('http') ? rawPic : `${BASE_URL}${rawPic.startsWith('/') ? '' : '/'}${rawPic}`) : undefined;

            return (
              <TouchableOpacity 
                activeOpacity={0.8}
                onLongPress={() => toggleSelection(item._id)} 
                onPress={() => isSelectionMode ? toggleSelection(item._id) : navigation.navigate('AppointmentStatus', { bookingId: item._id, role })}
                style={{ marginBottom: 10 }}
              >
                <StatusCard
                  title={displayName}
                  avatarUri={finalAvatarUrl}
                  line1={`Category: ${item.caseCategory || 'General Legal'}`}
                  line2={`Subject: ${item.caseSubject || 'Case Consultation'}`}
                  timeAgo={getTimeAgo(item.createdAt)}
                  onPress={() => isSelectionMode ? toggleSelection(item._id) : navigation.navigate('AppointmentStatus', { bookingId: item._id, role })}
                  containerStyle={{ marginHorizontal: 0, marginBottom: 0 }}
                  selected={isSelected}
                />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.trackingEmptyBox}>
              <Icon name="folder-open-outline" size={60} color="#ccc" />
              <Text style={styles.trackingEmptyText}>No {activeTab} appointments found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default TrackAppointment;
