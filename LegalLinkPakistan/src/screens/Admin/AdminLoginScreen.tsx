import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView, Alert, ActivityIndicator, ViewStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import axios from 'axios';

// --- Modular Imports ---
import { AdminStyles as s } from '../../theme/styles/AdminStyles';
import { MyInput } from '../../components/Common/MyInput';
import { MyButton } from '../../components/Common/MyButton';

type AdminLoginNavigationProp = StackNavigationProp<RootStackParamList, 'AdminLogin'>;

interface Props {
  navigation: AdminLoginNavigationProp;
}

const AdminLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [adminKey, setAdminKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({ email: '', adminKey: '' });

  const handleNext = async () => {
    let emailError = '';
    let keyError = '';

    if (!email) emailError = "Enter Admin Email!!!";
    if (!adminKey) keyError = "Enter Admin Security Key!!!";

    if (emailError || keyError) {
      setErrors({ email: emailError, adminKey: keyError });
      return;
    }

    setErrors({ email: '', adminKey: '' });
    setLoading(true);

    try {
      // FIXED: Pointing to the correct admin route defined in index.js
      const API_URL = "https://mug-work-public.ngrok-free.dev/api/admin/login";
      const payload = {
        email: email.trim().toLowerCase(),
        adminKey: adminKey.trim()
      };

      const response = await axios.post(API_URL, payload, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.status === 200) {
        navigation.navigate('AdminVerify', { email: email.trim().toLowerCase() });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid Admin Credentials.";
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>

        {/* Logo and Screen Title */}
        <View style={s.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={s.logo} />
          <Text style={s.brandName}>Legal Link Pakistan</Text>
          <Text style={s.screenTitle}>Admin Login</Text>
        </View>

        <View style={s.inputWrapper}>

          {/* Admin Email Input */}
          <MyInput
            placeholder="Admin Email Address"
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={[
              { marginTop: -10 } as ViewStyle,
              errors.email ? (s.inputError as ViewStyle) : null
            ]}
          />
          {errors.email ? <Text style={s.errorText}>{errors.email}</Text> : null}

          {/* Admin Security Key Input */}
          <MyInput
            placeholder="Admin Security Key"
            isPassword={true}
            onChangeText={(text) => {
              setAdminKey(text);
              if (errors.adminKey) setErrors({ ...errors, adminKey: '' });
            }}
            value={adminKey}
            containerStyle={[
              { marginTop: 2 } as ViewStyle,
              errors.adminKey ? (s.inputError as ViewStyle) : null
            ]}
          />
          {errors.adminKey ? <Text style={s.errorText}>{errors.adminKey}</Text> : null}

          {/* Submission Button */}
          <MyButton
            title={loading ? "Verifying..." : "NEXT"}
            onPress={handleNext}
            disabled={loading}
            style={{ borderRadius: 30, marginTop: 5 }}
          />
        </View>

        {loading && <ActivityIndicator size="small" color="#001a4d" style={s.loader} />}
      </View>
    </SafeAreaView>
  );
};

export default AdminLoginScreen;