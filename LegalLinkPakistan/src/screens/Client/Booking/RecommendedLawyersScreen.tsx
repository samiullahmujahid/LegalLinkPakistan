import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, Image, SafeAreaView, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../components/Common/Header/Header';
import { COLORS } from '../../../theme/theme';
import StarRating from '../../../components/Common/StarRating/StarRating';

const API_BASE = "https://mug-work-public.ngrok-free.dev/api";

interface Lawyer {
  _id: string;
  name: string;
  specialization: string;
  city: string;
  averageRating: number;
  totalReviews: number;
  consultationFee: string;
  experience: string;
  profilePic: string;
  profilePicUri?: string;
}

export const RecommendedLawyersScreen = ({ navigation }: any) => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('client');

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          setCurrentUserRole(userObj.role?.toLowerCase() || 'client');
        }
      } catch (e) {
        console.log("Error loading user role in RecommendedLawyers:", e);
      }
    };
    loadUserRole();
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      const response = await axios.get(`${API_BASE}/auth/lawyers/recommended`, {
        headers: { 
          Authorization: `Bearer ${cleanToken}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.data.success) {
        setLawyers(response.data.data);
        setFilteredLawyers(response.data.data);
        setClientCity(response.data.clientCity || '');
      }
    } catch (error) {
      console.log("[RecommendedLawyers] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantChat = async (targetLawyer: Lawyer) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      const response = await axios.post(
        `${API_BASE}/bookings/create-instant-chat`,
        { targetLawyerId: targetLawyer._id },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        const booking = response.data.booking;
        
        let profilePic = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const rawPath = targetLawyer.profilePic || targetLawyer.profilePicUri;
        if (rawPath) {
          if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:')) {
            profilePic = rawPath;
          } else {
            profilePic = `${API_BASE.replace('/api', '')}/${rawPath.replace(/^\//, '').replace(/\\/g, '/')}`;
          }
        }

        navigation.navigate('ChatsScreen', {
          bookingId: booking._id,
          partnerName: targetLawyer.name,
          partnerPic: profilePic
        });
      } else {
        Alert.alert("Chat Connection Error", response.data.message || "Failed to establish chat channel.");
      }
    } catch (e: any) {
      console.log("Instant Chat Error:", e);
      Alert.alert("Chat Connection Error", e.response?.data?.message || "Failed to connect to lawyer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredLawyers(lawyers);
      return;
    }
    const query = text.toLowerCase();
    const filtered = lawyers.filter(l => 
      l.name.toLowerCase().includes(query) || 
      l.specialization.toLowerCase().includes(query) || 
      l.city.toLowerCase().includes(query)
    );
    setFilteredLawyers(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Recommended Lawyers" />

      {/* Search Bar Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={22} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, law category, city..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding lawyers in your area...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLawyers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLocal = clientCity && item.city && item.city.toLowerCase().trim() === clientCity.toLowerCase().trim();
            
            const rawPath = item.profilePic || item.profilePicUri;
            let finalImageUri = '';
            if (rawPath) {
              if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:')) {
                finalImageUri = rawPath;
              } else {
                finalImageUri = `${API_BASE.replace('/api', '')}/${rawPath.replace(/^\//, '')}`;
              }
            }

            return (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => {
                  if (currentUserRole === 'lawyer') {
                    navigation.navigate('LawyerProfile', { lawyerId: item._id, viewOnly: true });
                  } else {
                    navigation.navigate('LawyerProfile', { lawyerId: item._id });
                  }
                }}
                activeOpacity={0.8}
              >
                {/* Lawyer Image */}
                <View style={styles.imageWrapper}>
                  {finalImageUri ? (
                    <Image source={{ uri: finalImageUri }} style={styles.lawyerImg} />
                  ) : (
                    <View style={styles.fallbackImg}>
                      <Icon name="account" size={32} color="#94a3b8" />
                    </View>
                  )}
                </View>

                {/* Lawyer Info */}
                <View style={styles.infoWrapper}>
                  <View style={styles.titleRow}>
                    <Text style={styles.lawyerName} numberOfLines={1}>
                      Adv. {item.name}
                    </Text>
                    {isLocal && (
                      <View style={styles.localBadge}>
                        <Icon name="map-marker" size={10} color="#059669" />
                        <Text style={styles.localBadgeText}>Your Area</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.specialization} numberOfLines={1}>
                    {item.specialization || "Legal Consultant"}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Icon name="briefcase-outline" size={14} color="#64748b" />
                      <Text style={styles.metaText}>{item.experience || 0} years exp</Text>
                    </View>
                    <View style={[styles.metaItem, { marginLeft: 10 }]}>
                      <Icon name="map-marker-outline" size={14} color="#64748b" />
                      <Text style={styles.metaText} numberOfLines={1}>{item.city || "Pakistan"}</Text>
                    </View>
                  </View>

                  <View style={styles.footerRow}>
                    {/* Stars rating */}
                    <View style={styles.ratingContainer}>
                      <StarRating rating={item.averageRating || 0} size={15} activeColor="#eab308" />
                      <Text style={styles.ratingText}>
                        ({item.totalReviews || 0})
                      </Text>
                    </View>
                    
                    {/* consultation fee */}
                    <Text style={styles.feeText}>
                      PKR {parseInt(item.consultationFee || '1000').toLocaleString()}
                    </Text>
                  </View>

                  {currentUserRole === 'lawyer' && (
                    <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
                      <TouchableOpacity 
                        style={{
                          backgroundColor: '#f1f5f9',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#cbd5e1',
                          flex: 0.48,
                          alignItems: 'center'
                        }}
                        onPress={() => navigation.navigate('LawyerProfile', { lawyerId: item._id, viewOnly: true })}
                      >
                        <Text style={{ fontSize: 12, color: '#334155', fontWeight: 'bold' }}>Check Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={{
                          backgroundColor: '#001a4d',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          flex: 0.48,
                          alignItems: 'center'
                        }}
                        onPress={() => handleInstantChat(item)}
                      >
                        <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>No lawyers found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search keywords.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0f172a',
    paddingVertical: 10,
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  imageWrapper: {
    width: 80,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  lawyerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallbackImg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lawyerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  localBadgeText: {
    color: '#065f46',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  specialization: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748b',
    marginLeft: 4,
    maxWidth: 90,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11.5,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  feeText: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  }
});

export default RecommendedLawyersScreen;
