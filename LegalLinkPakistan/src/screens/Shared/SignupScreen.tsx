import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { globalStyles } from '../../theme/globalStyles';
import { MyInput } from '../../components/Common/MyInput';
import { MyButton } from '../../components/Common/MyButton';

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Basic Validation
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      // Backend /api/auth/register route call (Points to authController.registerUser)
      const response = await axios.post('http://192.168.1.10:5000/api/auth/register', {
        name,
        email,
        password,
        role: 'Client' 
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate('Login', { role: 'Client' });
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Signup Failed", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={globalStyles.inner}>
          
          <View style={globalStyles.logoContainer}>
            <Image source={require('../../assets/images/logo.png')} style={globalStyles.logo} />
            <Text style={globalStyles.brandName}>Legal Link Pakistan</Text>
            <Text style={globalStyles.screenTitle}>Register Client</Text>
          </View>

          <MyInput 
            placeholder="Full Name" 
            onChangeText={setName} 
            value={name} 
            containerStyle={{ marginBottom: 15 }}
          />

          <MyInput 
            placeholder="Email Address" 
            onChangeText={setEmail} 
            value={email} 
            containerStyle={{ marginBottom: 15 }}
          />

          <MyInput 
            placeholder="Password" 
            isPassword={true} 
            onChangeText={setPassword} 
            value={password} 
          />

          <MyButton 
            title={loading ? "Registering..." : "Register"} 
            onPress={handleSignup} 
            style={{ borderRadius: 25, marginTop: 30 }}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;