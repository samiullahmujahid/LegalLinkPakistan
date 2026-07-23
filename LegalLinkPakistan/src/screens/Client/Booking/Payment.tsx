import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { MyButton } from '../../../components/Common/MyButton/MyButton';
import Header from '../../../components/Common/Header/Header';

const Payment = ({ route, navigation }: any) => {
  const { bookingId, amount } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    setLoading(true);
    try {
      // 1. Fetch Payment Intent from backend
      const response = await axios.post('https://mug-work-public.ngrok-free.dev/api/bookings/payment/intent', {
        amount: amount * 100, // Stripe expects amount in cents
        bookingId
      });

      const { clientSecret } = response.data;

      // 2. Initialize Stripe Payment Sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Legal Link Pakistan',
      });

      if (!error) {
        // 3. Open Payment Sheet
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert(`Error: ${presentError.message}`);
        } else {
          // 4. Confirm payment status with backend upon success
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header title="Payment" showBackButton={true} />
      <View style={styles.container}>
        <Text style={styles.title}>Confirm Payment</Text>
        <Text style={styles.amount}>PKR {amount}</Text>
        <MyButton
          title={loading ? "Processing..." : "Pay Now"}
          onPress={onCheckout}
          disabled={loading}
          style={[styles.button, { height: undefined, marginTop: 0 }]}
          textStyle={styles.btnText}
        />
      </View>
    </SafeAreaView>
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
