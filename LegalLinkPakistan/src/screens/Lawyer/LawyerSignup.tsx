import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { LawyerStyles as ls } from '../../theme/styles/LawyerStyles';
import { LocationSelector } from '../../components/Common/LocationSelector';

const courtLevelData = [
  { label: 'District Court', value: 'District Court' },
  { label: 'High Court', value: 'High Court' },
  { label: 'Supreme Court', value: 'Supreme Court' },
  { label: 'Banking Court', value: 'Banking Court' },
  { label: 'Consumer Court', value: 'Consumer Court' }
];

const LawyerSignup = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    province: '',
    courtLevel: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<any>({});

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    return minLength && hasLetter && hasNumber && hasSpecial;
  };

  const handleNext = () => {
    let tempErrors: any = {};

    if (!formData.name) tempErrors.name = true;
    if (!formData.email) tempErrors.email = true;
    if (!formData.province) tempErrors.province = "Required";
    if (!formData.district) tempErrors.district = "Required";
    if (!formData.city) tempErrors.city = "Required";
    if (!formData.courtLevel) tempErrors.courtLevel = "Required";

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      tempErrors.password = "Must be 8+ characters with letters, numbers & symbols";
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    navigation.navigate('LawyerSignUp2', { basicInfo: formData });
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
          <Text style={ls.fieldLabel}>Profile:</Text>
          
          <TextInput
            style={[ls.regInput, errors.name && ls.inputError]}
            placeholder="Name"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(val) => setFormData({ ...formData, name: val })}
          />

          <TextInput
            style={[ls.regInput, errors.email && ls.inputError]}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(val) => setFormData({ ...formData, email: val })}
          />

          <TextInput
            style={ls.regInput}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(val) => setFormData({ ...formData, phone: val })}
          />

          <Text style={ls.fieldLabel}>Practice Location:</Text>
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
            styleType="lawyer"
          />

          <View style={{ marginBottom: 15, marginTop: 10 }}>
            <Text style={{ fontSize: 12, color: '#333', marginBottom: 4, fontWeight: '500' }}>Court Level:</Text>
            <Dropdown
              style={[ls.dropdown, errors.courtLevel && ls.inputError]}
              placeholderStyle={ls.placeholderStyle}
              selectedTextStyle={ls.selectedTextStyle}
              data={courtLevelData}
              labelField="label"
              valueField="value"
              placeholder="Select Court Level"
              value={formData.courtLevel}
              onChange={item => setFormData({ ...formData, courtLevel: item.value })}
            />
            {errors.courtLevel && <Text style={{ color: 'red', fontSize: 11, marginTop: 2, marginLeft: 5 }}>{errors.courtLevel}</Text>}
          </View>

          <TextInput
            style={[ls.regInput, errors.password && ls.inputError]}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(val) => setFormData({ ...formData, password: val })}
          />
          {errors.password && (
            <Text style={{ color: 'red', fontSize: 11, marginTop: -10, marginBottom: 10, marginLeft: 5 }}>
              {errors.password}
            </Text>
          )}
          
          <TextInput
            style={[ls.regInput, errors.confirmPassword && ls.inputError]}
            placeholder="Confirm Password"
            secureTextEntry
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
          />
          {errors.confirmPassword && (
            <Text style={{ color: 'red', fontSize: 11, marginTop: -10, marginBottom: 10, marginLeft: 5 }}>
              {errors.confirmPassword}
            </Text>
          )}

          <TouchableOpacity style={ls.submitBtn} onPress={handleNext}>
            <Text style={ls.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LawyerSignup;