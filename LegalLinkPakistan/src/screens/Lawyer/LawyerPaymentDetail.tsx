import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, 
  ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import axios from 'axios'; 
import { LawyerStyles as ls } from '../../theme/styles/LawyerStyles';
import Header from '../../components/Common/Header';

const LawyerPaymentDetail = ({ navigation, route }: any) => {
  const { allData } = route.params || {};
  const [loading, setLoading] = useState(false); 

  const [paymentInfo, setPaymentInfo] = useState({
    easyPaisa: '',
    jazzCash: '',
    consultationFee: '',
  });

  const handleSubmit = async () => {
    if (!paymentInfo.consultationFee) {
      Alert.alert("Error", "Please set your consultation fee.");
      return;
    }

    setLoading(true);

    try {
      // 🚀 🔥 MULTIPART FORMDATA ASSEMBLY MATRIX
      const formData = new FormData();

      // 1. All text fields package dynamic extraction
      const textFields = {
        ...allData,
        ...paymentInfo,
        paymentMethod: 'Local/Stripe'
      };

      // 2. Text data fields append loop array block
      Object.keys(textFields).forEach((key) => {
        // Skip raw image fields alongside text fields in the loop
        if (key !== 'profilePicRaw' && key !== 'licensePicRaw' && key !== 'profilePic' && key !== 'licensePic') {
          if (key === 'areasOfPractice' && Array.isArray(textFields[key])) {
            // MongoDB array compatibility binding
            formData.append(key, JSON.stringify(textFields[key]));
          } else {
            formData.append(key, textFields[key]);
          }
        }
      });

      // 3. Profile Picture Binary Attachment Node
      if (allData?.profilePicRaw) {
        const pPic = allData.profilePicRaw;
        const profileUri = Platform.OS === 'android' ? pPic.uri : pPic.uri.replace('file://', '');
        formData.append('profilePic', {
          uri: profileUri,
          name: pPic.fileName || `profile_${Date.now()}.jpg`,
          type: pPic.type || 'image/jpeg',
        } as any);
      }

      // 4. License Picture Binary Attachment Node
      if (allData?.licensePicRaw) {
        const lPic = allData.licensePicRaw;
        const licenseUri = Platform.OS === 'android' ? lPic.uri : lPic.uri.replace('file://', '');
        formData.append('licensePic', {
          uri: licenseUri,
          name: lPic.fileName || `license_${Date.now()}.jpg`,
          type: lPic.type || 'image/jpeg',
        } as any);
      }

      console.log("📡 Sending Multi-part Form Data Stream to Backend Server...");

      // 🚀 HIT THE ACTUAL BACKEND SIGNUP ROUTE WITH MULTIPART HEADERS
      const response = await axios.post(
        "https://mug-work-public.ngrok-free.dev/api/auth/register", 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.success) {
        Alert.alert("Success", "Registration details submitted successfully!");
        navigation.navigate('LawyerStatus', { currentStatus: 'pending' });
      } else {
        Alert.alert("Registration Failed", response.data.message || "Something went wrong.");
      }
    } catch (error: any) {
      console.log("Lawyer Registration Axios Error:", error?.response?.data || error);
      Alert.alert("Network Error", "Could not submit files. Ensure backend server router has upload middleware.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={ls.container}>
      <Header title="Payment Details" showBackButton={true} onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={ls.scrollContent}>
        <View style={ls.headerSection}>
          <Image source={require('../../assets/images/logo.png')} style={ls.logo} />
          <Text style={ls.brandName}>Legal Link Pakistan</Text>
          <Text style={ls.subTitle}>Lawyer Registeration</Text>
        </View>

        <View style={ls.form}>
          <Text style={[ls.sectionTitle, { fontSize: 16 }]}>Payment Info.</Text>
          <Text style={{ fontSize: 13, color: '#001a4d', fontWeight: '600' }}>Set Payment Method:</Text>
          <Text style={{ fontSize: 11, color: '#555', marginBottom: 15 }}>(You can select More than one)</Text>

          {/* EasyPaisa */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
             <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#555', marginRight: 8 }} />
             <Text style={ls.fieldLabel}>EasyPaisa</Text>
          </View>
          <TextInput
            style={ls.regInput}
            placeholder="03................"
            keyboardType="numeric"
            editable={!loading}
            value={paymentInfo.easyPaisa}
            onChangeText={(val) => setPaymentInfo({ ...paymentInfo, easyPaisa: val })}
          />

          {/* JazzCash */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, marginTop: 10 }}>
             <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#555', marginRight: 8 }} />
             <Text style={ls.fieldLabel}>Jazzcash</Text>
          </View>
          <TextInput
            style={ls.regInput}
            placeholder="03................"
            keyboardType="numeric"
            editable={!loading}
            value={paymentInfo.jazzCash}
            onChangeText={(val) => setPaymentInfo({ ...paymentInfo, jazzCash: val })}
          />

          {/* Consultation Fee */}
          <Text style={[ls.fieldLabel, { marginTop: 20 }]}>Consultation Fee:</Text>
          <TextInput
            style={ls.regInput}
            placeholder="0."
            keyboardType="numeric"
            editable={!loading}
            value={paymentInfo.consultationFee}
            onChangeText={(val) => setPaymentInfo({ ...paymentInfo, consultationFee: val })}
          />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[ls.submitBtn, { marginTop: 60, borderRadius: 25 }, loading && { backgroundColor: '#ccc' }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={ls.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LawyerPaymentDetail;
