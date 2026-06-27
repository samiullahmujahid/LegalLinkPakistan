import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyButton } from '../../../components/Common/MyButton';

const Wallet = () => {
  const [data, setData] = useState({ 
    history: [], 
    totalEarnings: 0, 
    stripeOnboardingComplete: false, 
    stripeAccountId: "" 
  });
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

  // useFocusEffect calls fetchWalletData every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');
      const lawyerId = user.id || user._id;
      if (!lawyerId) return;

      const response = await axios.get(`https://mug-work-public.ngrok-free.dev/api/bookings/lawyer/wallet/${lawyerId}`);
      if (response.data.success) {
        setData(response.data);
      }
    } catch (e) { 
      console.log("Wallet fetch error:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStripeOnboard = async () => {
    try {
      setStripeLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';
      
      const response = await axios.get(
        'https://mug-work-public.ngrok-free.dev/api/bookings/stripe/onboard',
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      
      if (response.data.success && response.data.url) {
        Linking.openURL(response.data.url);
      } else {
        Alert.alert("Stripe Error", "Failed to get onboarding link.");
      }
    } catch (error: any) {
      console.log("Stripe Onboarding error:", error);
      Alert.alert("Stripe Error", error.response?.data?.message || "Unable to initiate onboarding.");
    } finally {
      setStripeLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#001a4d" />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.subTitle}>Total Balance</Text>
        <Text style={styles.balance}>PKR {data.totalEarnings.toLocaleString()}</Text>
      </View>

      {/* Stripe Connection Status */}
      {data.stripeOnboardingComplete ? (
        <View style={styles.stripeConnectedCard}>
          <View style={styles.stripeStatusHeader}>
            <Icon name="check-decagram" size={20} color="#10b981" />
            <Text style={styles.stripeStatusTitle}>Stripe Account Connected</Text>
          </View>
          <Text style={styles.stripeStatusDetails}>
            ID: {data.stripeAccountId || "Associated Express Account"}
          </Text>
        </View>
      ) : (
        <View style={styles.stripePromoCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stripePromoTitle}>Setup Stripe Payouts</Text>
            <Text style={styles.stripePromoDesc}>
              Link your account to receive consultation fees directly to your wallet.
            </Text>
          </View>
          <MyButton 
            title={stripeLoading ? "Linking..." : "Link Stripe"}
            onPress={handleStripeOnboard}
            disabled={stripeLoading}
            style={[styles.stripeLinkButton, { height: 40, marginTop: 0 }]}
            textStyle={styles.stripeLinkText}
          />
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#e3f2fd' }]}>
          <Icon name="cash" size={24} color="#1976d2" />
          <Text style={styles.cardLabel}>Earnings</Text>
          <Text style={styles.cardValue}>{data.totalEarnings}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
          <Icon name="history" size={24} color="#388e3c" />
          <Text style={styles.cardLabel}>Transactions</Text>
          <Text style={styles.cardValue}>{data.history.length}</Text>
        </View>
      </View>

      {/* History List */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={data.history}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.caseName}>{item.bookingId?.caseSubject || "Case Consultation"}</Text>
              <Text style={{ fontSize: 10, color: '#999' }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.amount}>+ PKR {item.amount}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No transactions yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { alignItems: 'center', marginVertical: 20 },
  subTitle: { fontSize: 14, color: '#888' },
  balance: { fontSize: 40, fontWeight: 'bold', color: '#001a4d' },
  stripeConnectedCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stripeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stripeStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065f46',
    marginLeft: 8,
  },
  stripeStatusDetails: {
    fontSize: 12,
    color: '#047857',
    marginLeft: 28,
  },
  stripePromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stripePromoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  stripePromoDesc: {
    fontSize: 12,
    color: '#64748b',
    paddingRight: 12,
  },
  stripeLinkButton: {
    backgroundColor: '#001a4d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  stripeLinkText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  cardLabel: { fontSize: 12, color: '#555', marginTop: 10 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 15, marginBottom: 10, elevation: 1 },
  caseName: { fontWeight: '600', fontSize: 14 },
  amount: { color: '#2e7d32', fontWeight: 'bold' }
});

export default Wallet;