import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, Image, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 ADDED

// --- Modular Import ---
import { AdminStyles as s } from '../../theme/styles/AdminStyles';
import Header from '../../components/Common/Header';

const NewLawyerVerification = ({ navigation }: any) => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPendingLawyers = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      
      const response = await axios.get("https://mug-work-public.ngrok-free.dev/api/admin/pending-lawyers", {
        headers: {
          Authorization: `Bearer ${token}` // 👈 ADDED: Attach token
        }
      });
      
      if (response.data.success) {
        setLawyers(response.data.lawyers);
      }
    } catch (error) {
      console.error("Error fetching lawyers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingLawyers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingLawyers();
  }, []);

  const renderLawyerCard = ({ item }: any) => {
    const rawPath = item.profilePicUri || item.profilePic || '';
    let finalProfilePicUri = '';
    if (rawPath) {
      if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:')) {
        finalProfilePicUri = rawPath;
      } else {
        finalProfilePicUri = `https://mug-work-public.ngrok-free.dev/${rawPath.replace(/^\//, '')}`;
      }
    }

    return (
      <View style={s.card}>
        <View style={s.cardInfo}>
          {finalProfilePicUri ? (
            <Image source={{ uri: finalProfilePicUri }} style={s.profileImg} />
          ) : (
            <View style={[s.profileImg, s.placeholderImg]}>
              <Icon name="account" size={35} color="#001a4d" />
            </View>
          )}

          <View style={s.details}>
            <Text style={s.lawyerName} numberOfLines={1}>Adv. {item.name}</Text>
            <Text style={s.subText}>En.No#{item.enrollmentNumber || 'N/A'}</Text>
            <Text style={s.subText}>City: {item.city || 'N/A'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={s.checkBtn}
          onPress={() => navigation.navigate('LawyerDetailVerify', { lawyerId: item._id })}
        >
          <Text style={s.checkBtnText}>Check</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <Header 
        title="Verification Requests" 
        showBackButton={true} 
      />

      {/* Search Bar */}
      <View style={s.searchSection}>
        <View style={s.searchContainer}>
          <Icon name="magnify" size={22} color="#666" />
          <TextInput 
            style={s.searchInput} 
            placeholder="Search by name..." 
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#001a4d" style={s.loader} />
      ) : (
        <FlatList
          data={lawyers.filter((l: any) => l.name.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(item: any) => item._id}
          renderItem={renderLawyerCard}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#001a4d']} />
          }
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Icon name="account-off-outline" size={60} color="#ccc" />
              <Text style={s.emptyText}>No pending verification requests.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default NewLawyerVerification;