import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import { LocationSelector } from '../../components/Common/LocationSelector';

// --- Styles Import ---
import { ClientStyles as s } from '../../theme/styles/ClientStyles';

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Image source={require('../../assets/images/logo.png')} style={s.logo} />
        <Text style={s.mainTitle}>Legal Link Pakistan</Text>
        <Text style={s.subTitle}>Client Registration</Text>

        <View style={s.form}>
          {/* --- Name Input --- */}
          <TextInput 
            style={[s.input, errors.name && s.errorInput]} 
            placeholder="Name" 
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(val) => setFormData({...formData, name: val})}
          />
          {errors.name && <Text style={s.errorText}>{errors.name}</Text>}

          {/* --- Email Input --- */}
          <TextInput 
            style={[s.input, errors.email && s.errorInput]} 
            placeholder="Email Address" 
            keyboardType="email-address"
            placeholderTextColor="#999"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(val) => setFormData({...formData, email: val})}
          />
          {errors.email && <Text style={s.errorText}>{errors.email}</Text>}

          {/* --- Phone Input --- */}
          <TextInput 
            style={[s.input, errors.phone && s.errorInput]} 
            placeholder="Phone Number (e.g., 03001234567)" 
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            value={formData.phone}
            onChangeText={(val) => setFormData({...formData, phone: val})}
          />
          {errors.phone && <Text style={s.errorText}>{errors.phone}</Text>}

          {/* --- Cascading Address Dropdowns --- */}
          <Text style={s.addressLabel}>Address:</Text>
          
          <LocationSelector
            province={formData.province}
            district={formData.district}
            tehsil={formData.city}
            onProvinceChange={(prov) => setFormData({ ...formData, province: prov })}
            onDistrictChange={(dist) => setFormData({ ...formData, district: dist })}
            onTehsilChange={(teh) => setFormData({ ...formData, city: teh })}
            errors={{
              province: errors.province,
              district: errors.district,
              tehsil: errors.city
            }}
            styleType="client"
          />

          {/* --- Password Input --- */}
          <TextInput 
            style={[s.input, errors.password && s.errorInput]} 
            placeholder="Password" 
            secureTextEntry
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(val) => setFormData({...formData, password: val})}
          />
          {errors.password && <Text style={s.errorText}>{errors.password}</Text>}

          {/* --- Confirm Password Input --- */}
          <TextInput 
            style={[s.input, errors.confirmPassword && s.errorInput]} 
            placeholder="Confirm Password" 
            secureTextEntry
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={(val) => setFormData({...formData, confirmPassword: val})}
          />
          {errors.confirmPassword && <Text style={s.errorText}>{errors.confirmPassword}</Text>}

          {/* --- Submit Button --- */}
          <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Register</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ClientSignup;