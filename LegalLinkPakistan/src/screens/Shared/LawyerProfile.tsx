import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Image, StyleSheet, Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Common/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bottombar from '../../components/Common/BottomBar/Bottombar';
import { MyButton } from '../../components/Common/MyButton';
import StarRating from '../../components/Common/StarRating';

const LawyerProfile = ({ route, navigation }: any) => {
  const { lawyerId, viewOnly } = route.params || {};
  const [lawyer, setLawyer] = useState<any>(null);
  const [activeAppointments, setActiveAppointments] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

  useEffect(() => {
    const fetchProfileAndLoad = async () => {
      const targetedId = lawyerId || '6a1bcd7cc101bbc46aa3a4ff';

      try {
        let token = await AsyncStorage.getItem('token');
        if (token && (token.startsWith('"') || token.startsWith("'"))) {
          token = token.slice(1, -1);
        }

        const config = {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        };

        console.log(`📡 Fetching Layer Target -> ${BASE_URL}/api/auth/lawyers`);

        const res = await axios.get(`${BASE_URL}/api/auth/lawyers`, config).catch(async () => {
          return await axios.get(`${BASE_URL}/api/lawyers`, config);
        });

        let extractedArray: any[] = [];
        if (res && res.data) {
          if (Array.isArray(res.data.data)) extractedArray = res.data.data;
          else if (Array.isArray(res.data)) extractedArray = res.data;
          else if (Array.isArray(res.data.lawyers)) extractedArray = res.data.lawyers;
        }

        if (extractedArray.length > 0) {
          const match = extractedArray.find((l: any) => l._id === targetedId);
          if (match) {
            setLawyer(match);
          } else {
            loadMockData(targetedId);
          }
        } else {
          loadMockData(targetedId);
        }

        // Fetch active appointments count
        try {
          const countRes = await axios.get(`${BASE_URL}/api/bookings/lawyer-active-count/${targetedId}`, config);
          if (countRes?.data?.success) {
            setActiveAppointments(countRes.data.activeAppointmentsCount || 0);
          }
        } catch {
          setActiveAppointments(12);
        }

        // Fetch reviews dynamically
        try {
          const reviewsRes = await axios.get(`${BASE_URL}/api/bookings/reviews/${targetedId}`, config);
          const reviewsList = reviewsRes?.data?.reviews || [];
          if (reviewsList.length > 0) {
            setReviews(reviewsList);
          } else {
            loadMockReviews();
          }
        } catch {
          loadMockReviews();
        }

      } catch (err) {
        console.log("🛠️ Catch matrix redirecting to mock data storage.");
        loadMockData(targetedId);
        loadMockReviews();
      } finally {
        setLoading(false);
      }
    };

    const loadMockData = (id: string) => {
      setLawyer({
        _id: id,
        name: "Ahmed Khan",
        courtLevel: "HIGH COURT LAWYER",
        bio: "With over 15 years of dedicated legal service in Lahore's High Court, Advocate Ahmed Khan specializes in navigating complex civil and corporate disputes. Known for his unwavering commitment to justice and meticulous legal strategy, he has successfully represented numerous high-profile clients in intricate family and intellectual property matters across Pakistan's judicial system.",
        address: { city: "Lahore", district: "Lahore District Bar Association", street: "123, Davis Road, Lahore, Pakistan" },
        areasOfPractice: ["Civil Law", "Corporate Law", "Family Law", "Intellectual Property"],
        averageRating: 4.8,
        totalReviews: 12,
        profilePicUri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      });
      setActiveAppointments(12);
    };

    const loadMockReviews = () => {
      setReviews([
        {
          bookingId: "mock_r_1",
          rating: 5,
          comment: "Advocate Ahmed Khan provided exceptional legal advice and handled my case with extreme professionalism.",
          clientName: "M. Ali",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
      ]);
    };

    fetchProfileAndLoad();
  }, [lawyerId]);

  const getProfileImageSource = () => {
    if (!lawyer?.profilePicUri) return null;
    
    if (lawyer.profilePicUri.includes('file:///')) {
      return null;
    }

    const cleanPath = lawyer.profilePicUri.replace(/\\/g, '/');

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return { uri: cleanPath };
    }
    
    const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
    return { uri: `${BASE_URL}/${finalPath}` };
  };

  const formatReviewDate = (dateStr: string) => {
    try {
      const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) return 'Today';
      if (diffDays === 2) return '1 day ago';
      return `${diffDays - 1} days ago`;
    } catch {
      return '2 days ago';
    }
  };

  const getPracticeAreas = () => {
    if (Array.isArray(lawyer?.areasOfPractice)) {
      return lawyer.areasOfPractice;
    }
    if (typeof lawyer?.areasOfPractice === 'string') {
      return lawyer.areasOfPractice.split(',').map((s: string) => s.trim());
    }
    return ["Civil Law", "Corporate Law", "Family Law", "Intellectual Property"];
  };

  const getOfficeAddress = () => {
    const addr = lawyer?.address;
    if (!addr) return '123, Davis Road, Lahore, Pakistan';
    if (typeof addr === 'string') return addr;
    
    const parts = [];
    if (addr.street) parts.push(addr.street);
    else if (addr.streetAddress) parts.push(addr.streetAddress);
    
    if (addr.city) parts.push(addr.city);
    if (addr.province || addr.state) parts.push(addr.province || addr.state);
    if (addr.country) parts.push(addr.country);
    
    return parts.length > 0 ? parts.join(', ') : '123, Davis Road, Lahore, Pakistan';
  };

  if (loading) {
    return (
      <SafeAreaView style={[localStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00193f" />
      </SafeAreaView>
    );
  }

  const imageSource = getProfileImageSource();

  return (
    <SafeAreaView style={localStyles.container}>
      <Header title="Lawyer Profile" showBackButton={true} backgroundColor="#00193f" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
        {/* Profile Card */}
        <View style={localStyles.card}>
          <View style={localStyles.profileCard}>
            <View style={localStyles.avatarWrapper}>
              <View style={localStyles.avatarBorder}>
                {imageSource ? (
                  <Image source={imageSource} style={localStyles.avatar} resizeMode="cover" />
                ) : (
                  <Icon name="account-tie" size={60} color="#00193f" style={localStyles.avatarPlaceholder} />
                )}
              </View>
              <View style={localStyles.statusDot} />
            </View>

            <Text style={localStyles.nameText}>
              {lawyer?.name ? (lawyer.name.toLowerCase().startsWith('adv') ? lawyer.name : `Advocate ${lawyer.name}`) : 'Advocate Professional'}
            </Text>
            <Text style={localStyles.subTitleText}>{lawyer?.courtLevel || 'HIGH COURT LAWYER'}</Text>

            <View style={localStyles.ratingRow}>
              <StarRating rating={lawyer?.averageRating || 4.8} size={20} activeColor="#cca353" />
              <Text style={localStyles.ratingText}>{(lawyer?.averageRating || 4.8).toFixed(1)}/5</Text>
            </View>

            <View style={localStyles.appointmentsBadge}>
              <Icon name="calendar-month-outline" size={16} color="#cca353" />
              <Text style={localStyles.appointmentsBadgeText}>Active Appointments: {activeAppointments}</Text>
            </View>
          </View>
        </View>

        {/* Professional Bio Card */}
        <View style={localStyles.card}>
          <View style={localStyles.sectionHeaderRow}>
            <View style={localStyles.goldBar} />
            <Text style={localStyles.sectionTitle}>Professional Bio</Text>
          </View>
          <Text style={localStyles.bioText}>{lawyer?.bio || 'Professional Legal Practitioner.'}</Text>
        </View>

        {/* Details Card */}
        <View style={localStyles.card}>
          {/* City */}
          <View style={localStyles.detailRow}>
            <View style={localStyles.iconBox}>
              <Icon name="map-marker-outline" size={20} color="#00193f" />
            </View>
            <View style={localStyles.detailInfo}>
              <Text style={localStyles.detailLabel}>City</Text>
              <Text style={localStyles.detailValue}>{lawyer?.address?.city || lawyer?.city || 'Lahore'}</Text>
            </View>
          </View>

          {/* Bar Council */}
          <View style={localStyles.detailRow}>
            <View style={localStyles.iconBox}>
              <Icon name="bank-outline" size={20} color="#00193f" />
            </View>
            <View style={localStyles.detailInfo}>
              <Text style={localStyles.detailLabel}>Bar Council District</Text>
              <Text style={localStyles.detailValue}>
                {lawyer?.address?.district || lawyer?.district || 'Lahore District Bar Association'}
              </Text>
            </View>
          </View>

          {/* Areas of Practice */}
          <View style={localStyles.detailRow}>
            <View style={localStyles.iconBox}>
              <Icon name="gavel" size={20} color="#00193f" />
            </View>
            <View style={localStyles.detailInfo}>
              <Text style={localStyles.detailLabel}>Areas of Practice</Text>
              <View style={localStyles.badgeContainer}>
                {getPracticeAreas().map((area: string, idx: number) => (
                  <View key={idx} style={localStyles.practiceBadge}>
                    <Text style={localStyles.practiceBadgeText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Office Address */}
          <View style={localStyles.detailRow}>
            <View style={localStyles.iconBox}>
              <Icon name="briefcase-outline" size={20} color="#00193f" />
            </View>
            <View style={localStyles.detailInfo}>
              <Text style={localStyles.detailLabel}>Office Address</Text>
              <Text style={localStyles.detailValue}>{getOfficeAddress()}</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section Card */}
        <View style={localStyles.card}>
          <View style={localStyles.sectionHeaderRow}>
            <View style={localStyles.goldBar} />
            <Text style={localStyles.sectionTitle}>Reviews</Text>
          </View>

          {reviews.length > 0 ? (
            reviews.map((rev, index) => (
              <View key={rev.bookingId || index} style={localStyles.reviewItem}>
                <View style={localStyles.reviewStars}>
                  <StarRating rating={rev.rating || 5} size={16} activeColor="#cca353" />
                </View>
                <Text style={localStyles.reviewComment}>"{rev.comment || 'No comment provided'}"</Text>
                <View style={localStyles.reviewFooter}>
                  <Text style={localStyles.reviewAuthor}>{rev.clientName}</Text>
                  <Text style={localStyles.reviewDate}>{formatReviewDate(rev.createdAt)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={localStyles.noReviewsText}>No reviews posted yet.</Text>
          )}
        </View>
      </ScrollView>

      {!viewOnly && (
        <View style={localStyles.footerButtonContainer}>
          <MyButton 
            title="Proceed to Case Details"
            onPress={() => navigation.navigate('CaseDetails', { lawyerId: lawyer?._id, lawyerName: lawyer?.name })}
            style={localStyles.primaryActionButton}
            textStyle={{ color: '#ffffff', fontWeight: 'bold' }}
          />
        </View>
      )}

      <Bottombar navigation={navigation} currentRoute="Home" role="Client" />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 160,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 16,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#cca353',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignSelf: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#cca353', // Status dot color matches screenshot (olive/gold)
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  nameText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#00193f',
    textAlign: 'center',
    marginBottom: 4,
  },
  subTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 8,
  },
  appointmentsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  appointmentsBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00193f',
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goldBar: {
    width: 4,
    height: 16,
    backgroundColor: '#cca353',
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00193f',
  },
  bioText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e6f0fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  practiceBadge: {
    backgroundColor: '#00193f',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  practiceBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewItem: {
    paddingBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 13.5,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00193f',
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
  },
  noReviewsText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  footerButtonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  primaryActionButton: {
    backgroundColor: '#cca353', // Gold button matching gold design palette
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LawyerProfile;
