// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, SafeAreaView, Alert, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyInput } from '../../components/Common/MyInput';
import { MyButton } from '../../components/Common/MyButton';
import { globalStyles } from '../../theme/globalStyles';
import {
  getGoogleIdToken,
  getFacebookAccessToken,
  loginWithGoogleBackend,
  loginWithFacebookBackend
} from '../../utils/authService';

// ==========================================
// COMPONENT DECLARATION & STATE
// ==========================================
const LoginScreen = ({ navigation, route }: any) => {
  // Get role from navigation params, default to Client
  const { role } = route.params || { role: 'Client' }; 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', adminKey: '' });

  // ==========================================
  // HANDLERS (LOGIN & OAUTH)
  // ==========================================
  const handleLogin = async () => {
    let emailError = '';
    let passwordError = '';
    let adminKeyError = '';

    // Validation
    if (!email) {
      emailError = "Enter Email!!!";
    }
    if (role === 'Admin') {
      if (!adminKey) adminKeyError = "Enter Admin Security Key!!!";
    } else {
      if (!password) passwordError = "Enter Your Password!!!";
    }

    if (emailError || passwordError || adminKeyError) {
      setErrors({ email: emailError, password: passwordError, adminKey: adminKeyError });
      return;
    }

    setErrors({ email: '', password: '', adminKey: '' });
    setLoading(true);

    try {
      if (role === 'Admin') {
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
      } else {
        const loginData = {
          email: email.trim().toLowerCase(),
          password: password,
          role: role,
        };

        const API_URL = "https://mug-work-public.ngrok-free.dev/api/auth/login";

        const response = await axios.post(API_URL, loginData, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (response.data.success) {
          const userData = response.data.user;
          const sessionToken = response.data.token;

          await AsyncStorage.setItem('user', JSON.stringify(userData));

          if (!sessionToken) {
            console.warn("⚠️ Warning: Authentication token missing inside login network response data.");
          } else {
            await AsyncStorage.setItem('userToken', sessionToken);
            await AsyncStorage.setItem('token', sessionToken);
            console.log("🎯 [DEBUG] Token and User injected into AsyncStorage successfully:", sessionToken);
          }

          if (role === 'Lawyer') {
            if (userData.status === 'approved') {
              navigation.replace('LawyerDashboard'); 
            } else if (userData.status === 'pending') {
              Alert.alert(
                "Verification Pending", 
                "Your account is currently under review by the Admin. Please wait for approval."
              );
            } else if (userData.status === 'rejected') {
              Alert.alert(
                "Account Rejected", 
                `Your registration was rejected. Reason: ${userData.rejectionReason || "Documents not valid."}`
              );
            }
          } else {
            navigation.replace('ClientDashboard'); 
          }
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Login failed!!!";
      Alert.alert("Login Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      const response = await loginWithGoogleBackend(idToken, role);
      await handleOAuthSuccess(response);
    } catch (error: any) {
      if (error?.message && !error.message.includes('developer error') && !error.message.includes('SIGN_IN_CANCELLED')) {
        Alert.alert("Google Login Failed", error.message || "Failed to authenticate with Google");
      } else {
        console.log("Google Login Cancelled or Developer Error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const accessToken = await getFacebookAccessToken();
      const response = await loginWithFacebookBackend(accessToken, role);
      await handleOAuthSuccess(response);
    } catch (error: any) {
      if (error?.message && !error.message.includes('cancelled')) {
        Alert.alert("Facebook Login Failed", error.message || "Failed to authenticate with Facebook");
      } else {
        console.log("Facebook Login Cancelled.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSuccess = async (response: any) => {
    if (response.success) {
      const userData = response.user;
      const sessionToken = response.token;

      await AsyncStorage.setItem('user', JSON.stringify(userData));

      if (sessionToken) {
        await AsyncStorage.setItem('userToken', sessionToken);
        await AsyncStorage.setItem('token', sessionToken);
      }

      if (role === 'Lawyer') {
        if (userData.status === 'approved') {
          navigation.replace('LawyerDashboard');
        } else if (userData.status === 'pending') {
          Alert.alert(
            "Verification Pending",
            "Your account is currently under review by the Admin. Please wait for approval."
          );
        } else if (userData.status === 'rejected') {
          Alert.alert(
            "Account Rejected",
            `Your registration was rejected. Reason: ${userData.rejectionReason || "Documents not valid."}`
          );
        }
      } else {
        navigation.replace('ClientDashboard');
      }
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View style={globalStyles.inner}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.brandName}>Legal Link Pakistan</Text>
          <Text style={globalStyles.subTitle}>{role} Login</Text>
        </View>

        <View style={globalStyles.form}>
          <MyInput
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          {role !== 'Admin' && (
            <MyInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              isPassword={true}
              error={errors.password}
            />
          )}

          {role === 'Admin' && (
            <MyInput
              placeholder="Admin Security Key"
              value={adminKey}
              onChangeText={(text) => {
                setAdminKey(text);
                if (errors.adminKey) setErrors({ ...errors, adminKey: '' });
              }}
              isPassword={true}
              error={errors.adminKey}
            />
          )}

          <MyButton
            title={loading ? (role === 'Admin' ? "Verifying..." : "Logging in...") : "Login"}
            onPress={handleLogin}
            disabled={loading}
            style={{ borderRadius: 30, marginTop: 25 }}
          />

          {role !== 'Admin' && (
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
                <Text style={{ marginHorizontal: 10, color: '#888', fontSize: 13 }}>OR</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
              </View>
              
              <TouchableOpacity
                onPress={handleGoogleLogin}
                disabled={loading}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#CCCCCC',
                  paddingVertical: 12,
                  borderRadius: 30,
                  marginBottom: 12
                }}
              >
                <Text style={{ color: '#333333', fontWeight: 'bold', fontSize: 15 }}>Sign in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFacebookLogin}
                disabled={loading}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1877F2',
                  paddingVertical: 12,
                  borderRadius: 30,
                  marginBottom: 15
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>Sign in with Facebook</Text>
              </TouchableOpacity>
            </View>
          )}

          {role !== 'Admin' && (
            <View style={globalStyles.footer}>
              <Text style={globalStyles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => role === 'Lawyer' ? navigation.navigate('LawyerSignup') : navigation.navigate('ClientSignup')}>
                <Text style={globalStyles.linkText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==========================================
// EXPORTS
// ==========================================
export default LoginScreen;
