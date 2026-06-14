import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, 
  ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { LawyerStyles as ls } from '../../theme/styles/LawyerStyles';

const API_BASE = "https://mug-work-public.ngrok-free.dev/api";

const practiceAreas = [
  { label: 'Civil Law', value: 'Civil' },
  { label: 'Criminal Law', value: 'Criminal' },
  { label: 'Family Law', value: 'Family' },
  { label: 'Corporate Law', value: 'Corporate' },
];

const LawyerSignUp3 = ({ navigation, route }: any) => {
  const { basicInfo, professionalData } = route.params || {};
  const [loading, setLoading] = useState(false);

  const [expertise, setExpertise] = useState({
    areasOfPractice: '',
    bio: '',
    officeAddress: '',
    profilePic: null as any,
    consultationFee: '1000',
  });

  const selectProfilePic = () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.7 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.assets && response.assets.length > 0) {
        setExpertise({ ...expertise, profilePic: response.assets[0] });
      }
    });
  };

  const handleSubmit = async () => {
    if (!expertise.areasOfPractice || !expertise.officeAddress || !expertise.profilePic || !expertise.consultationFee) {
      Alert.alert("Missing Information", "Please fill all required fields and upload a profile picture.");
      return;
    }

    setLoading(true);

    try {
      const practiceArray = expertise.areasOfPractice ? [expertise.areasOfPractice] : [];
      const combinedData = {
        ...basicInfo,
        ...professionalData,
        areasOfPractice: practiceArray,
        bio: expertise.bio,
        officeAddress: expertise.officeAddress,
        consultationFee: expertise.consultationFee,
        paymentMethod: 'Local/Stripe',
        role: 'Lawyer'
      };

      const formData = new FormData();

      // Append text fields
      Object.keys(combinedData).forEach((key) => {
        if (key !== 'profilePicRaw' && key !== 'licensePicRaw' && key !== 'profilePic' && key !== 'licensePic') {
          if (key === 'areasOfPractice' && Array.isArray(combinedData[key])) {
            formData.append(key, JSON.stringify(combinedData[key]));
          } else {
            formData.append(key, combinedData[key]);
          }
        }
      });

      // Append Profile Picture Binary
      if (expertise.profilePic) {
        const pPic = expertise.profilePic;
        const profileUri = Platform.OS === 'android' ? pPic.uri : pPic.uri.replace('file://', '');
        formData.append('profilePic', {
          uri: profileUri,
          name: pPic.fileName || `profile_${Date.now()}.jpg`,
          type: pPic.type || 'image/jpeg',
        } as any);
      }

      // Append License Picture Binary (from step 2)
      if (professionalData?.licensePicRaw) {
        const lPic = professionalData.licensePicRaw;
        const licenseUri = Platform.OS === 'android' ? lPic.uri : lPic.uri.replace('file://', '');
        formData.append('licensePic', {
          uri: licenseUri,
          name: lPic.fileName || `license_${Date.now()}.jpg`,
          type: lPic.type || 'image/jpeg',
        } as any);
      }

      console.log("📡 Submitting Lawyer Registration stream to server...");

      const response = await axios.post(
        `${API_BASE}/auth/register`,
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
      <TouchableOpacity style={ls.backBtn} onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={ls.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={ls.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={ls.headerSection}>
          <Image source={require('../../assets/images/logo.png')} style={ls.logo} />
          <Text style={ls.brandName}>Legal Link Pakistan</Text>
          <Text style={ls.subTitle}>Expertise & Office (Step 3)</Text>
        </View>

        <View style={ls.form}>
          <Text style={ls.sectionTitle}>Professional Details:</Text>

          <Text style={ls.fieldLabel}>Areas of Practice*</Text>
          <Dropdown
            style={ls.dropdown}
            data={practiceAreas}
            labelField="label"
            valueField="value"
            placeholder="Select Area"
            placeholderStyle={ls.placeholderStyle}
            selectedTextStyle={ls.selectedTextStyle}
            value={expertise.areasOfPractice}
            onChange={item => setExpertise({ ...expertise, areasOfPractice: item.value })}
            disable={loading}
          />

          <Text style={ls.fieldLabel}>Brief Bio / Experience</Text>
          <TextInput
            style={[ls.regInput, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Describe your legal experience..."
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
            value={expertise.bio}
            onChangeText={(val) => setExpertise({ ...expertise, bio: val })}
            editable={!loading}
          />

          <Text style={ls.fieldLabel}>Office Address*</Text>
          <TextInput
            style={ls.regInput}
            placeholder="Enter complete office address"
            placeholderTextColor="#999"
            value={expertise.officeAddress}
            onChangeText={(val) => setExpertise({ ...expertise, officeAddress: val })}
            editable={!loading}
          />

          <Text style={ls.fieldLabel}>Consultation Fee (PKR)*</Text>
          <TextInput
            style={ls.regInput}
            placeholder="e.g. 1500"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={expertise.consultationFee}
            onChangeText={(val) => setExpertise({ ...expertise, consultationFee: val })}
            editable={!loading}
          />

          <Text style={ls.fieldLabel}>Profile Picture*</Text>
          <TouchableOpacity style={ls.uploadBox} onPress={selectProfilePic} disabled={loading}>
            {expertise.profilePic ? (
              <Image source={{ uri: expertise.profilePic.uri }} style={ls.previewImg} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Icon name="camera-plus-outline" size={45} color="#001a4d" />
                <Text style={ls.uploadText}>Upload Professional Picture</Text>
              </View>
            )}
            {!expertise.profilePic && <Text style={ls.requiredStar}>*</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[ls.submitBtn, loading && { backgroundColor: '#ccc' }]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={ls.buttonText}>Submit Registration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LawyerSignUp3;