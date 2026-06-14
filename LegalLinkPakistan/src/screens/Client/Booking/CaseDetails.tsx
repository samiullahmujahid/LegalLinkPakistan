import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LawyerStyles as styles } from '../../../theme/styles/LawyerStyles';
import ProfileCard from '../../../components/Common/ProfileCard/ProfileCard';

const courtLevels = [
  { label: 'Supreme Court', value: 'Supreme Court' },
  { label: 'High Court', value: 'High Court' },
  { label: 'District Court', value: 'District Court' },
];

const caseTypes = [
  { label: 'Criminal Case', value: 'Criminal Case' },
  { label: 'Civil Litigation', value: 'Civil Litigation' },
  { label: 'Family Dispute', value: 'Family Dispute' },
];

const CaseDetails = ({ navigation }: any) => {
  const [courtLevel, setCourtLevel] = useState('');
  const [caseType, setCaseType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<any[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);

  useEffect(() => {
    const fetchLawyers = async () => {
      const BASE_URL = 'https://mug-work-public.ngrok-free.dev';
      try {
        const rawToken = await AsyncStorage.getItem('token');
        const token = rawToken ? rawToken.replace(/['"]+/g, '') : '';

        const config = {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        };

        let res;
        try {
          res = await axios.get(`${BASE_URL}/api/auth/lawyers`, config);
        } catch {
          res = await axios.get(`${BASE_URL}/api/lawyers`, config);
        }

        const data = res?.data?.lawyers || res?.data?.data || res?.data || [];
        setLawyers(data);
        setFilteredLawyers(data);
      } catch {
        loadMocks();
      }
    };

    const loadMocks = () => {
      const mocks = [
        { _id: '6a1bcd7cc101bbc46aa3a4ff', name: 'Samiullah Mujahid', city: 'Pasrur', enNo: 'PBC/786-S', rating: 5, activeCount: 2, role: 'Lawyer' },
        { _id: '6b2bcd7cc101bbc46aa3a500', name: 'Ahmad Ali', city: 'Pasrur', enNo: 'PBC/123-A', rating: 4, activeCount: 3, role: 'Lawyer' }
      ];
      setLawyers(mocks);
      setFilteredLawyers(mocks);
    };

    fetchLawyers();
  }, []);

  useEffect(() => {
    let filtered = lawyers;

    if (courtLevel) {
      filtered = filtered.filter(l => {
        const lCourt = l.courtLevel ? l.courtLevel.toLowerCase() : "";
        const selectedCourt = courtLevel.toLowerCase();
        return lCourt.includes(selectedCourt) || selectedCourt.includes(lCourt);
      });
    }

    if (caseType) {
      filtered = filtered.filter(l => {
        const matchesSpecialization = l.specialization && l.specialization.toLowerCase().includes(caseType.toLowerCase().split(' ')[0]);
        const matchesPractice = l.areasOfPractice && l.areasOfPractice.some((area: string) => 
          area.toLowerCase().includes(caseType.toLowerCase().split(' ')[0])
        );
        return matchesSpecialization || matchesPractice;
      });
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(lowerQuery) || 
        (l.city && l.city.toLowerCase().includes(lowerQuery))
      );
    }

    setFilteredLawyers(filtered);
  }, [courtLevel, caseType, searchQuery, lawyers]);

  const handleNext = () => {
    if (!courtLevel || !caseType || !subject || !description || !selectedLawyer) {
      Alert.alert('Missing Fields', 'Please fill all details and select a lawyer.');
      return;
    }

    navigation.navigate('AppointmentSummary', {
      caseData: { courtLevel, caseType, subject, description },
      lawyerData: selectedLawyer
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>Appointment Booking</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={filteredLawyers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ marginTop: 15 }}>
            <Text style={styles.mainHeading}>Fill Case Details</Text>
            
            <View style={styles.inputGroup}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={courtLevels}
                labelField="label"
                valueField="value"
                placeholder="Select court level..."
                value={courtLevel}
                onChange={item => setCourtLevel(item.value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={caseTypes}
                labelField="label"
                valueField="value"
                placeholder="Select Case Type..."
                value={caseType}
                onChange={item => setCaseType(item.value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput 
                style={styles.input}
                placeholder="Case Subject"
                placeholderTextColor="#777"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput 
                style={[styles.textAreaInput, { height: 120 }]}
                placeholder="Describe case shortly..."
                placeholderTextColor="#777"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 10, marginBottom: 5 }]}>Appoint a Lawyer</Text>
            
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 10 }]}>
              <TextInput 
                style={{ flex: 1, color: '#000', padding: 0 }}
                placeholder="Search a specific Lawyer"
                placeholderTextColor="#777"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Icon name="magnify" size={22} color="#001a4d" />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProfileCard 
            userData={{
              ...item, 
              role: 'Lawyer'
            }}
            isSelected={selectedLawyer?._id === item._id}
            onSelectPress={() => setSelectedLawyer(item)}
            onCheckPress={() => navigation.navigate('LawyerProfile', { lawyerId: item._id, viewOnly: true })}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No lawyers found.</Text>
        }
      />

      <View style={[styles.footerContainer, { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff' }]}>
        <TouchableOpacity style={styles.nextActionButton} onPress={handleNext}>
          <Text style={styles.nextActionText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CaseDetails;