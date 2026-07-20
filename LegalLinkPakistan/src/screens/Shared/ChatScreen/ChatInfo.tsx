import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RatingAlert from '../../../components/Common/Alert/Alert';
import Header from '../../../components/Common/Header';
import { MyButton } from '../../../components/Common/MyButton';
import { COLORS } from '../../../theme/theme';

const { width } = Dimensions.get('window');

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

  const extractId = (id: any) => {
    if (!id) return "";
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id?.$oid) return id.$oid;
    if (typeof id === 'object' && id?._id) return id._id.toString();
    return String(id);
  };

  const getProfilePicUri = (picPath: string) => {
    if (!picPath) return null;
    if (picPath.startsWith('http://') || picPath.startsWith('https://') || picPath.startsWith('data:')) {
      return picPath;
    }
    return `https://mug-work-public.ngrok-free.dev/${picPath.replace(/^\//, '').replace(/\\/g, '/')}`;
  };

  const myId = currentUser?.id || currentUser?._id;
  const isMeClient = extractId(booking?.clientId) === extractId(myId);
  const isLawyerViewing = currentUser?.role?.toLowerCase() === 'lawyer';

  const profileData = isMeClient ? {
    name: booking?.lawyerName || "Legal Consultant",
    pic: getProfilePicUri(booking?.lawyerPic),
    title: "Legal Consultant",
    email: booking?.lawyerEmail || "N/A",
    phone: booking?.lawyerPhone || "N/A",
    address: booking?.lawyerAddress || "N/A",
    id: extractId(booking?.lawyerId)
  } : {
    name: booking?.clientName || "Client User",
    pic: getProfilePicUri(booking?.clientPic),
    title: "Client",
    email: booking?.clientEmail || "N/A",
    phone: booking?.clientPhone || "N/A",
    address: booking?.clientAddress || "N/A",
    id: extractId(booking?.clientId)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Header title={isMeClient ? "Lawyer Profile" : "Client Profile"} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001a4d" />
          <Text style={styles.loadingText}>Fetching profile details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Profile Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.avatarOutline}>
              {profileData.pic ? (
                <Image
                  source={{ uri: profileData.pic }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="account" size={60} color="#001a4d" />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{profileData.name}</Text>
            
            <View style={[styles.roleBadge, { backgroundColor: isLawyerViewing ? '#e1eafd' : '#e6f4ea' }]}>
              <Text style={[styles.roleBadgeText, { color: isLawyerViewing ? '#001a4d' : '#137333' }]}>
                {profileData.title}
              </Text>
            </View>
          </View>

          {/* Details Information Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Contact & Address</Text>
            
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Icon name="account-outline" size={20} color="#0099ff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>NAME</Text>
                  <Text style={styles.infoValue}>{profileData.name}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Icon name="email-outline" size={20} color="#0099ff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{profileData.email}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Icon name="phone-outline" size={20} color="#0099ff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>PHONE NUMBER</Text>
                  <Text style={styles.infoValue}>{profileData.phone}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Icon name="map-marker-outline" size={20} color="#0099ff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>ADDRESS</Text>
                  <Text style={styles.infoValue}>{profileData.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Area */}
          <View style={styles.actionContainer}>
            {!isLawyerViewing && booking?.status !== 'completed' && (
              <MyButton 
                title="Complete Appointment"
                onPress={() => setShowRatingAlert(true)}
                style={{ backgroundColor: COLORS.primary, height: 48, borderRadius: 24 }}
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
              style={{ backgroundColor: COLORS.danger, marginTop: 12, height: 48, borderRadius: 24 }}
            />
          </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001a4d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: '100%',
  },
  avatarOutline: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1eafd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#001a4d',
    marginTop: 14,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001a4d',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0f4fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 52,
  },
  actionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  completeBtn: {
    backgroundColor: '#0099ff',
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0099ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  complaintBtn: {
    backgroundColor: '#d9534f',
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d9534f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ChatInfo;
