import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

// Styles & Subcomponents
import { LawyerStyles as ls } from '../../../theme/styles/LawyerStyles';
import { globalStyles } from '../../../theme/globalStyles';
import { LocationSelector } from '../../../components/Common/LocationSelector';
import { MyInput } from '../../../components/Common/MyInput';
import { MyButton } from '../../../components/Common/MyButton';

const API_BASE = "https://mug-work-public.ngrok-free.dev/api";

const courtLevelDataStep1 = [
  { label: 'District Court', value: 'District Court' },
  { label: 'High Court', value: 'High Court' },
  { label: 'Supreme Court', value: 'Supreme Court' },
  { label: 'Banking Court', value: 'Banking Court' },
  { label: 'Consumer Court', value: 'Consumer Court' }
];

const barCouncilData = [
  { label: 'Punjab Bar Council', value: 'PBC' },
  { label: 'Sindh Bar Council', value: 'SBC' },
  { label: 'KPK Bar Council', value: 'KPKBC' },
  { label: 'Balochistan Bar Council', value: 'BBC' },
];

const courtLevelDataStep2 = [
  { label: 'Supreme Court', value: 'Supreme' },
  { label: 'High Court', value: 'High' },
  { label: 'Lower Court / District Court', value: 'Lower' },
];

const practiceAreas = [
  { label: 'Civil Law', value: 'Civil' },
  { label: 'Criminal Law', value: 'Criminal' },
  { label: 'Family Law', value: 'Family' },
  { label: 'Corporate Law', value: 'Corporate' },
];

const LawyerSignup = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // STEP 1 State: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    city: '',
    courtLevel: '',
    password: '',
    confirmPassword: ''
  });
  const [step1Errors, setStep1Errors] = useState<any>({});

  // STEP 2 State: Professional Verification
  const [professionalData, setProfessionalData] = useState({
    barCouncil: '',
    enrollmentNumber: '',
    courtLevel: '',
    licenseNumber: '',
    licensePic: null as any,
    licenseExpiry: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // STEP 3 State: Expertise & Office Address
  const [expertise, setExpertise] = useState({
    areasOfPractice: '',
    bio: '',
    officeAddress: '',
    consultationFee: '1000',
    profilePic: null as any,
  });

  // Helper validation for password strength
  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return minLength && hasLetter && hasNumber && hasSpecial;
  };

  // Select License copy (Step 2)
  const selectLicensePic = () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.7 };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfessionalData({ ...professionalData, licensePic: response.assets[0] });
      }
    });
  };

  // Date change for License Expiry (Step 2)
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
      setProfessionalData({ ...professionalData, licenseExpiry: formattedDate });
    }
  };

  // Select Profile Picture (Step 3)
  const selectProfilePic = () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.7 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.assets && response.assets.length > 0) {
        setExpertise({ ...expertise, profilePic: response.assets[0] });
      }
    });
  };

  // Process Step 1 -> Step 2
  const handleNextStep1 = () => {
    let tempErrors: any = {};
    if (!basicInfo.name) tempErrors.name = "Name is required";
    if (!basicInfo.email) tempErrors.email = "Email is required";
    if (!basicInfo.province) tempErrors.province = "Province is required";
    if (!basicInfo.district) tempErrors.district = "District is required";
    if (!basicInfo.city) tempErrors.city = "Tehsil is required";
    if (!basicInfo.courtLevel) tempErrors.courtLevel = "Court Level is required";

    if (!basicInfo.password) {
      tempErrors.password = "Password is required";
    } else if (!validatePassword(basicInfo.password)) {
      tempErrors.password = "Must be 8+ characters with letters, numbers & symbols";
    }

    if (basicInfo.password !== basicInfo.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setStep1Errors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    setStep(2);
  };

  // Process Step 2 -> Step 3
  const handleNextStep2 = () => {
    if (
      !professionalData.barCouncil || 
      !professionalData.licenseNumber || 
      !professionalData.courtLevel ||
      !professionalData.enrollmentNumber ||
      !professionalData.licenseExpiry ||
      !professionalData.licensePic
    ) {
      Alert.alert("Required Fields Missing", "Please fill all professional verification fields and upload your license copy.");
      return;
    }
    setStep(3);
  };

  // Form submission (Step 3)
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
        barCouncil: professionalData.barCouncil,
        enrollmentNumber: professionalData.enrollmentNumber,
        enNo: professionalData.enrollmentNumber,
        profCourtLevel: professionalData.courtLevel,
        licenseNumber: professionalData.licenseNumber,
        licenseExpiry: professionalData.licenseExpiry,
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
        if (key === 'areasOfPractice') {
          formData.append(key, JSON.stringify(combinedData[key]));
        } else {
          formData.append(key, (combinedData as any)[key]);
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
      if (professionalData.licensePic) {
        const lPic = professionalData.licensePic;
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

  // Handling navigation on back button
  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <SafeAreaView style={ls.container}>
      <TouchableOpacity style={ls.backBtn} onPress={handleBack} disabled={loading}>
        <Text style={ls.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={ls.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={ls.headerSection}>
          <Image source={require('../../../assets/images/logo.png')} style={ls.logo} />
          <Text style={ls.brandName}>Legal Link Pakistan</Text>
          <Text style={ls.subTitle}>
            Lawyer Registration {step === 1 ? "(Step 1/3)" : step === 2 ? "(Step 2/3)" : "(Step 3/3)"}
          </Text>
        </View>

        {step === 1 && (
          <View style={ls.form}>
            <Text style={ls.fieldLabel}>Profile Details:</Text>
            
            <MyInput
              placeholder="Name"
              value={basicInfo.name}
              onChangeText={(val) => {
                setBasicInfo({ ...basicInfo, name: val });
                if (step1Errors.name) setStep1Errors({ ...step1Errors, name: '' });
              }}
              error={step1Errors.name}
            />

            <MyInput
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={basicInfo.email}
              onChangeText={(val) => {
                setBasicInfo({ ...basicInfo, email: val });
                if (step1Errors.email) setStep1Errors({ ...step1Errors, email: '' });
              }}
              error={step1Errors.email}
            />

            <MyInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={basicInfo.phone}
              onChangeText={(val) => setBasicInfo({ ...basicInfo, phone: val })}
            />

            <Text style={ls.fieldLabel}>Practice Location:</Text>
            <LocationSelector
              province={basicInfo.province}
              district={basicInfo.district}
              tehsil={basicInfo.city}
              onProvinceChange={(prov) => {
                setBasicInfo(prev => ({ ...prev, province: prov }));
                if (step1Errors.province) setStep1Errors({ ...step1Errors, province: '' });
              }}
              onDistrictChange={(dist) => {
                setBasicInfo(prev => ({ ...prev, district: dist }));
                if (step1Errors.district) setStep1Errors({ ...step1Errors, district: '' });
              }}
              onTehsilChange={(teh) => {
                setBasicInfo(prev => ({ ...prev, city: teh }));
                if (step1Errors.city) setStep1Errors({ ...step1Errors, city: '' });
              }}
              errors={{
                province: step1Errors.province,
                district: step1Errors.district,
                tehsil: step1Errors.city
              }}
              styleType="lawyer"
            />

            <View style={{ marginBottom: 15, marginTop: 10 }}>
              <Text style={{ fontSize: 12, color: '#333', marginBottom: 4, fontWeight: '500' }}>Court Level:</Text>
              <Dropdown
                style={[ls.dropdown, step1Errors.courtLevel && ls.inputError]}
                placeholderStyle={ls.placeholderStyle}
                selectedTextStyle={ls.selectedTextStyle}
                data={courtLevelDataStep1}
                labelField="label"
                valueField="value"
                placeholder="Select Court Level"
                value={basicInfo.courtLevel}
                onChange={item => {
                  setBasicInfo({ ...basicInfo, courtLevel: item.value });
                  if (step1Errors.courtLevel) setStep1Errors({ ...step1Errors, courtLevel: '' });
                }}
              />
              {step1Errors.courtLevel && <Text style={{ color: 'red', fontSize: 11, marginTop: 2, marginLeft: 5 }}>{step1Errors.courtLevel}</Text>}
            </View>

            <MyInput
              placeholder="Password"
              isPassword={true}
              value={basicInfo.password}
              onChangeText={(val) => {
                setBasicInfo({ ...basicInfo, password: val });
                if (step1Errors.password) setStep1Errors({ ...step1Errors, password: '' });
              }}
              error={step1Errors.password}
            />
            
            <MyInput
              placeholder="Confirm Password"
              isPassword={true}
              value={basicInfo.confirmPassword}
              onChangeText={(val) => {
                setBasicInfo({ ...basicInfo, confirmPassword: val });
                if (step1Errors.confirmPassword) setStep1Errors({ ...step1Errors, confirmPassword: '' });
              }}
              error={step1Errors.confirmPassword}
            />

            <MyButton title="Next" onPress={handleNextStep1} style={{ borderRadius: 25, marginTop: 10 }} />
          </View>
        )}

        {step === 2 && (
          <View style={ls.form}>
            <Text style={ls.sectionTitle}>Professional Verification:</Text>

            <Text style={ls.fieldLabel}>Bar Council*</Text>
            <Dropdown
              style={ls.dropdown}
              placeholderStyle={ls.placeholderStyle}
              selectedTextStyle={ls.selectedTextStyle}
              data={barCouncilData}
              labelField="label"
              valueField="value"
              placeholder="Select Bar Council"
              value={professionalData.barCouncil}
              onChange={item => setProfessionalData({ ...professionalData, barCouncil: item.value })}
            />

            <Text style={ls.fieldLabel}>Enrollment Number*</Text>
            <MyInput
              placeholder="Enter Enrollment Number"
              value={professionalData.enrollmentNumber}
              onChangeText={(val) => setProfessionalData({ ...professionalData, enrollmentNumber: val })}
            />

            <Text style={ls.fieldLabel}>Court Level*</Text>
            <Dropdown
              style={ls.dropdown}
              placeholderStyle={ls.placeholderStyle}
              selectedTextStyle={ls.selectedTextStyle}
              data={courtLevelDataStep2}
              labelField="label"
              valueField="value"
              placeholder="Select Court Level"
              value={professionalData.courtLevel}
              onChange={item => setProfessionalData({ ...professionalData, courtLevel: item.value })}
            />

            <Text style={ls.fieldLabel}>License Number*</Text>
            <MyInput
              placeholder="Enter License Number"
              value={professionalData.licenseNumber}
              onChangeText={(val) => setProfessionalData({ ...professionalData, licenseNumber: val })}
            />

            <Text style={ls.fieldLabel}>Upload License Copy*</Text>
            <TouchableOpacity style={ls.uploadBox} onPress={selectLicensePic}>
              {professionalData.licensePic ? (
                <Image source={{ uri: professionalData.licensePic.uri }} style={ls.previewImg} />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Icon name="image-outline" size={50} color="#001a4d" />
                  <Text style={ls.uploadText}>Tap to upload License Pic</Text>
                </View>
              )}
              <Text style={ls.requiredStar}>*</Text>
            </TouchableOpacity>

            <Text style={ls.fieldLabel}>License Expiry Date*</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <MyInput
                  placeholder="DD/MM/YYYY"
                  value={professionalData.licenseExpiry}
                  onChangeText={() => {}}
                />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <MyButton title="Next" onPress={handleNextStep2} style={{ borderRadius: 25, marginTop: 10 }} />
          </View>
        )}

        {step === 3 && (
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
            <MyInput
              placeholder="Describe your legal experience..."
              value={expertise.bio}
              onChangeText={(val) => setExpertise({ ...expertise, bio: val })}
              containerStyle={{ height: 100 }}
              inputStyle={{ textAlignVertical: 'top', height: 90 }}
            />

            <Text style={ls.fieldLabel}>Office Address*</Text>
            <MyInput
              placeholder="Enter complete office address"
              value={expertise.officeAddress}
              onChangeText={(val) => setExpertise({ ...expertise, officeAddress: val })}
            />

            <Text style={ls.fieldLabel}>Consultation Fee (PKR)*</Text>
            <MyInput
              placeholder="e.g. 1500"
              keyboardType="numeric"
              value={expertise.consultationFee}
              onChangeText={(val) => setExpertise({ ...expertise, consultationFee: val })}
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

            <MyButton
              title="Submit Registration"
              onPress={handleSubmit}
              disabled={loading}
              style={{ borderRadius: 25, marginTop: 15 }}
            />
            {loading && <ActivityIndicator size="small" color="#001a4d" style={{ marginTop: 15 }} />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LawyerSignup;
