import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Icon from 'react-native-vector-icons/Ionicons'; 

// --- Imports from Theme & Styles ---
import { AdminStyles as s } from '../../theme/styles/AdminStyles';
import { COLORS } from '../../theme/theme';
import { MyButton } from '../../components/Common/MyButton/MyButton';

type AdminVerifyNavigationProp = StackNavigationProp<RootStackParamList, 'AdminVerify'>;
type AdminVerifyRouteProp = RouteProp<RootStackParamList, 'AdminVerify'>;

interface Props {
  navigation: AdminVerifyNavigationProp;
  route: AdminVerifyRouteProp;
}

const AdminVerify: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params; 
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']); 
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendOTP = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      const response = await axios.post("https://mug-work-public.ngrok-free.dev/api/admin/resend-otp", {
        email: email
      });

      if (response.data.success || response.status === 200) {
        Alert.alert("Success", "A new OTP has been sent to your email.");
        setCountdown(60); // Reset timer
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to resend OTP";
      Alert.alert("Error", msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://mug-work-public.ngrok-free.dev/api/admin/verify-otp", {
        email: email,
        otp: fullOtp
      });

      if (response.data.success || response.status === 200) {
        // Clear old session
        await AsyncStorage.clear(); 
        
        // Save new admin token
        if (response.data.token) {
          await AsyncStorage.setItem('adminToken', response.data.token);
        }
        
        Alert.alert("Success", "Admin Verified Successfully!");
        navigation.replace('AdminDashboard'); 
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Invalid OTP or Expired";
      Alert.alert("Verification Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <TouchableOpacity 
        style={[s.backBtn, { borderWidth: 0, paddingHorizontal: 12, paddingVertical: 8 }]} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#001a4d" />
      </TouchableOpacity>

      <View style={s.inner}>
        <View style={s.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={s.logo} />
          <Text style={s.brandName}>Legal Link Pakistan</Text>
        </View>

        <View style={s.verifyHeader}>
          <Text style={s.mainTitle}>Verify Your Identification</Text>
          <Text style={s.subTitle}>Enter the 6-digit OTP sent to: {email}</Text>
        </View>

        <View style={s.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
              style={s.otpInput} 
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onChangeText={(val) => handleOtpChange(val, index)}
            />
          ))}
        </View>

        <MyButton 
          title={loading ? "Verifying..." : "Verify & Login"} 
          onPress={handleVerifyOTP} 
          disabled={loading}
          style={{ borderRadius: 25, marginTop: 40 }} 
        />

        <View style={{ marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#666', fontSize: 14 }}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResendOTP} 
            disabled={countdown > 0 || resendLoading}
          >
            <Text style={{ 
              color: countdown > 0 ? '#aaa' : (COLORS.primary || '#001a4d'), 
              fontWeight: 'bold', 
              fontSize: 14,
              textDecorationLine: countdown > 0 ? 'none' : 'underline'
            }}>
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {(loading || resendLoading) && <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />}
      </View>
    </SafeAreaView>
  );
};

export default AdminVerify;
