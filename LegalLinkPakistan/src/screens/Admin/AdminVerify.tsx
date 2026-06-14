import React, { useState, useRef } from 'react';
import { 
  View, Text, Image, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// --- Imports from Theme & Styles ---
import { AdminStyles as s } from '../../theme/styles/AdminStyles';
import { COLORS } from '../../theme/theme';
import { MyButton } from '../../components/Common/MyButton';

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
  const inputRefs = useRef<TextInput[]>([]);

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
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>Back</Text>
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
        
        {loading && <ActivityIndicator size="large" color={COLORS.primary} style={s.loader} />}
      </View>
    </SafeAreaView>
  );
};

export default AdminVerify;