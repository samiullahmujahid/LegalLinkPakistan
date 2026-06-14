import React, { useState, useCallback } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RequestCard from '../Requestcard/Requestcard';
import { ClientStyles as styles } from '../../../theme/styles/ClientStyles';

const TrackAppointment = ({ navigation, route }: any) => {
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
      { text: "Delete", style: 'destructive', onPress: () => {
        // Yahan delete API call karein
        console.log("Deleting:", selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
      }}
    ]);
  };

  const tabs = role === 'lawyer' ? (['current', 'completed'] as const) : (['current', 'pending', 'completed'] as const);

  const getTimeAgo = (createdAtString: string) => {
    if (!createdAtString) return 'Just now';
    const dynamicDate = new Date(createdAtString);
    const seconds = Math.floor((new Date().getTime() - dynamicDate.getTime()) / 1000);
    if (seconds / 3600 > 1) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds / 60 > 1) return Math.floor(seconds / 60) + ' minutes ago';
    return 'Just now';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bookingHeader}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity onPress={() => {setIsSelectionMode(false); setSelectedIds([])}}><Icon name="close" size={24} color="#fff" /></TouchableOpacity>
            <Text style={styles.bookingHeaderTitle}>{selectedIds.length} Selected</Text>
            <TouchableOpacity onPress={deleteSelected}><Icon name="delete" size={24} color="#ff3333" /></TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
            <Text style={styles.bookingHeaderTitle}>Track Appointments</Text>
            <TouchableOpacity onPress={fetchClientAppointments}><Icon name="refresh" size={24} color="#fff" /></TouchableOpacity>
          </>
        )}
      </View>

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
                onLongPress={() => toggleSelection(item._id)} 
                onPress={() => isSelectionMode ? toggleSelection(item._id) : navigation.navigate('AppointmentStatus', { bookingId: item._id, role })}
                style={{ opacity: isSelected ? 0.6 : 1, borderWidth: isSelected ? 2 : 0, borderColor: '#001a4d', borderRadius: 12, marginBottom: 10 }}
              >
                <RequestCard
                  name={displayName}
                  avatarUri={finalAvatarUrl}
                  line1Label="Category"
                  line1Value={item.caseCategory || 'General Legal'}
                  line2Label="Subject"
                  line2Value={item.caseSubject || 'Case Consultation'}
                  timeAgo={getTimeAgo(item.createdAt)}
                  status={item.status}
                  onPressDetails={() => navigation.navigate('AppointmentStatus', { bookingId: item._id, role })}
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