import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';

const Payment = ({ route, navigation }: any) => {
  const { bookingId, amount } = route.params; // Booking details pass karein
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    setLoading(true);
    try {
      // 1. Backend se Payment Intent fetch karein
      const response = await axios.post('https://mug-work-public.ngrok-free.dev/api/bookings/payment/intent', {
        amount: amount * 100, // Stripe expects amount in cents
        bookingId
      });

      const { clientSecret } = response.data;

      // 2. Stripe Payment Sheet initialize karein
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Legal Link Pakistan',
      });

      if (!error) {
        // 3. Payment Sheet open karein
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert(`Error: ${presentError.message}`);
        } else {
          // 4. Payment Success - Backend confirm karein
          await axios.put(`https://mug-work-public.ngrok-free.dev/api/bookings/confirm-payment/${bookingId}`);
          Alert.alert('Success', 'Payment completed successfully!');
          navigation.navigate('ClientDashboard');
        }
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Payment</Text>
      <Text style={styles.amount}>PKR {amount}</Text>
      <TouchableOpacity style={styles.button} onPress={onCheckout} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pay Now</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 10 },
  amount: { fontSize: 30, fontWeight: 'bold', marginBottom: 30 },
  button: { backgroundColor: '#001a4d', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18 }
});

export default Payment;