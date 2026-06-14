import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, 
  SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ FIXED: Imported AsyncStorage

const LoginScreen = ({ navigation, route }: any) => {
  // Get role from navigation params, default to Client
  const { role } = route.params || { role: 'Client' }; 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    let emailError = '';
    let passwordError = '';

    // Simple Validation
    if (!email) emailError = "Enter Email!!!";
    if (!password) passwordError = "Enter Your Password!!!";

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setErrors({ email: '', password: '' });
    loadingStream(true);

    function loadingStream(status: boolean) {
      setLoading(status);
    }

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
      };

      // Ngrok API URL
      const API_URL = "https://mug-work-public.ngrok-free.dev/api/auth/login";

      const response = await axios.post(API_URL, loginData, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.data.success) {
        const userData = response.data.user;
        const sessionToken = response.data.token; // ✅ EXTRACTED: Getting token from backend response

        // ✅ CRITICAL FIX: Save user object to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        if (!sessionToken) {
          console.warn("⚠️ Warning: Authentication token missing inside login network response data.");
        } else {
          // ✅ CRITICAL INJECTION: Saving token securely so other screens can fetch it
          await AsyncStorage.setItem('userToken', sessionToken);
          await AsyncStorage.setItem('token', sessionToken); // Safe side layout fallback
          console.log("🎯 [DEBUG] Token and User injected into AsyncStorage successfully:", sessionToken);
        }

        if (role === 'Lawyer') {
          // Check Lawyer verification status from backend response
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
          // Clients proceed directly to their dashboard
          navigation.replace('ClientDashboard'); 
        }
      }

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Login failed!!!";
      Alert.alert("Login Error", errorMsg);
    } finally {
      loadingStream(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.brandName}>Legal Link Pakistan</Text>
        <Text style={styles.subTitle}>{role} Login</Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => role === 'Lawyer' ? navigation.navigate('LawyerSignup') : navigation.navigate('ClientSignup')}>
              <Text style={styles.registerText}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 120, height: 120, resizeMode: 'contain' },
  brandName: { fontSize: 26, fontWeight: 'bold', color: '#001a4d', marginTop: 10 },
  subTitle: { fontSize: 18, color: '#001a4d', marginBottom: 30 },
  form: { width: '100%' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 15, color: '#000', marginTop: 10 },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginTop: 5, marginLeft: 5, fontWeight: '500' },
  loginBtn: { backgroundColor: '#001a4d', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 20, marginTop: 25 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  registerText: { color: '#001a4d', fontWeight: 'bold', textDecorationLine: 'underline' }
});

export default LoginScreen;