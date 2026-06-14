import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, 
  ScrollView, SafeAreaView, Alert, Platform
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'; 
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'; 
import DateTimePicker from '@react-native-community/datetimepicker'; // Import for better UX
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LawyerStyles as ls } from '../../theme/styles/LawyerStyles';

const barCouncilData = [
  { label: 'Punjab Bar Council', value: 'PBC' },
  { label: 'Sindh Bar Council', value: 'SBC' },
  { label: 'KPK Bar Council', value: 'KPKBC' },
  { label: 'Balochistan Bar Council', value: 'BBC' },
];

const courtLevelData = [
  { label: 'Supreme Court', value: 'Supreme' },
  { label: 'High Court', value: 'High' },
  { label: 'Lower Court / District Court', value: 'Lower' },
];

const LawyerSignUp2 = ({ navigation, route }: any) => {
  const { basicInfo } = route.params || {};

  const [professionalData, setProfessionalData] = useState({
    barCouncil: '',
    enrollmentNumber: '',
    courtLevel: '',
    licenseNumber: '',
    licenseExpiry: '',
    licensePic: null as any,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectLicensePic = () => {
    const options: ImageLibraryOptions = { 
      mediaType: 'photo', 
      quality: 0.7 
    }; 

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfessionalData({ ...professionalData, licensePic: response.assets[0] });
      }
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
      setProfessionalData({ ...professionalData, licenseExpiry: formattedDate });
    }
  };

  const handleNext = () => {
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

    navigation.navigate('LawyerSignUp3', { 
      basicInfo: basicInfo, 
      professionalData: {
        barCouncil: professionalData.barCouncil,
        enrollmentNumber: professionalData.enrollmentNumber,
        enNo: professionalData.enrollmentNumber, 
        courtLevel: professionalData.courtLevel,
        licenseNumber: professionalData.licenseNumber,
        licenseExpiry: professionalData.licenseExpiry,
        licensePicRaw: professionalData.licensePic 
      } 
    });
  };

  return (
    <SafeAreaView style={ls.container}>
      <TouchableOpacity style={ls.backBtn} onPress={() => navigation.goBack()}>
        <Text style={ls.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={ls.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={ls.headerSection}>
            <Image source={require('../../assets/images/logo.png')} style={ls.logo} />
            <Text style={ls.brandName}>Legal Link Pakistan</Text>
            <Text style={ls.subTitle}>Lawyer Registration</Text>
        </View>

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
          <TextInput
            style={ls.regInput}
            placeholder="Enter Enrollment Number"
            placeholderTextColor="#999"
            value={professionalData.enrollmentNumber}
            onChangeText={(val) => setProfessionalData({ ...professionalData, enrollmentNumber: val })}
          />

          <Text style={ls.fieldLabel}>Court Level*</Text>
          <Dropdown
            style={ls.dropdown}
            placeholderStyle={ls.placeholderStyle}
            selectedTextStyle={ls.selectedTextStyle}
            data={courtLevelData}
            labelField="label"
            valueField="value"
            placeholder="Select Court Level"
            value={professionalData.courtLevel}
            onChange={item => setProfessionalData({ ...professionalData, courtLevel: item.value })}
          />

          <Text style={ls.fieldLabel}>License Number*</Text>
          <TextInput
            style={ls.regInput}
            placeholder="Enter License Number"
            placeholderTextColor="#999"
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
            <TextInput
              style={ls.regInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              value={professionalData.licenseExpiry}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity style={ls.submitBtn} onPress={handleNext}>
            <Text style={ls.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LawyerSignUp2;