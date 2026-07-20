import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Linking, 
  Alert,
  SafeAreaView
} from 'react-native';
import styles from './Wallet.styles';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyButton } from '../../../components/Common/MyButton';
import Header from '../../../components/Common/Header';

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

      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      const response = await axios.get(
        `https://mug-work-public.ngrok-free.dev/api/bookings/lawyer/wallet/${lawyerId}`,
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <Header title="My Wallet" showBackButton={true} />
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
    </SafeAreaView>
  );
};



export default Wallet;
