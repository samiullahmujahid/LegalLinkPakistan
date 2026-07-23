import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import axios from 'axios';
import { LocationSelector } from '../../../components/Common/LocationSelector/LocationSelector';
import { MyInput } from '../../../components/Common/MyInput/MyInput';
import { MyButton } from '../../../components/Common/MyButton/MyButton';
import { globalStyles } from '../../../theme/globalStyles';
import Header from '../../../components/Common/Header/Header';

const ClientSignup: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', district: '', province: '', password: '', confirmPassword: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let sErrors: any = {};
    if (!formData.name) sErrors.name = "Name is required";
    if (!formData.email) sErrors.email = "Email is required";
    if (!formData.phone) sErrors.phone = "Phone number is required";
    if (!formData.province) sErrors.province = "Province is required";
    if (!formData.district) sErrors.district = "District is required";
    if (!formData.city) sErrors.city = "Tehsil is required";
    if (!formData.password) sErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) sErrors.confirmPassword = "Passwords do not match";
    
    setErrors(sErrors);
    return Object.keys(sErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const API_URL = "https://mug-work-public.ngrok-free.dev/api/auth/register-client";
      const response = await axios.post(API_URL, formData, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.status === 201) {
        navigation.replace('RegistrationSuccess');
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Client Registration" showBackButton={true} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, justifyContent: 'flex-start' }} 
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', paddingHorizontal: 40, justifyContent: 'center' }}>
            <View style={globalStyles.logoContainer}>
              <Image source={require('../../../assets/images/logo.png')} style={globalStyles.logo} />
              <Text style={globalStyles.brandName}>Legal Link Pakistan</Text>
              <Text style={globalStyles.subTitle}>Client Registration</Text>
            </View>

            <View style={globalStyles.form}>
              <Text style={{ fontSize: 14, color: '#001a4d', marginVertical: 8, fontWeight: 'bold' }}>Profile Details:</Text>
              <MyInput 
                placeholder="Full Name" 
                onChangeText={(val) => {
                  setFormData({...formData, name: val});
                  if (errors.name) setErrors({ ...errors, name: '' });
                }} 
                value={formData.name} 
                error={errors.name}
              />

              <MyInput 
                placeholder="Email Address" 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(val) => {
                  setFormData({...formData, email: val});
                  if (errors.email) setErrors({ ...errors, email: '' });
                }} 
                value={formData.email} 
                error={errors.email}
              />

              <MyInput 
                placeholder="Phone Number (e.g., 03001234567)" 
                keyboardType="phone-pad"
                onChangeText={(val) => {
                  setFormData({...formData, phone: val});
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }} 
                value={formData.phone} 
                error={errors.phone}
              />

              <Text style={{ fontSize: 14, color: '#001a4d', marginVertical: 8, fontWeight: 'bold' }}>Address:</Text>
              
              <LocationSelector
                province={formData.province}
                district={formData.district}
                tehsil={formData.city}
                onProvinceChange={(prov) => {
                  setFormData(prev => ({ ...prev, province: prov }));
                  if (errors.province) setErrors({ ...errors, province: '' });
                }}
                onDistrictChange={(dist) => {
                  setFormData(prev => ({ ...prev, district: dist }));
                  if (errors.district) setErrors({ ...errors, district: '' });
                }}
                onTehsilChange={(teh) => {
                  setFormData(prev => ({ ...prev, city: teh }));
                  if (errors.city) setErrors({ ...errors, city: '' });
                }}
                errors={{
                  province: errors.province,
                  district: errors.district,
                  tehsil: errors.city
                }}
                styleType="client"
              />

              <Text style={{ fontSize: 14, color: '#001a4d', marginVertical: 8, fontWeight: 'bold' }}>Password:</Text>
              <MyInput 
                placeholder="Password" 
                isPassword={true} 
                onChangeText={(val) => {
                  setFormData({...formData, password: val});
                  if (errors.password) setErrors({ ...errors, password: '' });
                }} 
                value={formData.password} 
                error={errors.password}
              />

              <MyInput 
                placeholder="Confirm Password" 
                isPassword={true} 
                onChangeText={(val) => {
                  setFormData({...formData, confirmPassword: val});
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }} 
                value={formData.confirmPassword} 
                error={errors.confirmPassword}
              />

              <MyButton 
                title={loading ? "Registering..." : "Register"} 
                onPress={handleRegister} 
                disabled={loading}
                style={{ borderRadius: 25, marginTop: 15 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ClientSignup;
