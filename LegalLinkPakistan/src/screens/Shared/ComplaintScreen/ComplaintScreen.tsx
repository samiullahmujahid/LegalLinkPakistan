import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, 
  Alert, ActivityIndicator, StyleSheet, TextInput, ScrollView, Image, Platform, KeyboardAvoidingView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../components/Common/Header/Header';
import { MyButton } from '../../../components/Common/MyButton/MyButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const ComplaintScreen = ({ route, navigation }: any) => {
  const params = route.params || {};
  const targetId = typeof params.targetId === 'object' 
    ? (params.targetId?._id || params.targetId?.toString() || JSON.stringify(params.targetId).replace(/['"]+/g, '')) 
    : params.targetId;
    
  const { bookingId, role } = params; 
  
  const [complaintType, setComplaintType] = useState('');
  const [detail, setDetail] = useState('');
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

  const complaintPresets = [
    { label: 'Unprofessional Behavior', icon: 'account-alert-outline', color: '#ea0038' },
    { label: 'Late / No Response', icon: 'clock-alert-outline', color: '#ff9800' },
    { label: 'Payment / Fee Dispute', icon: 'cash-remove', color: '#27ae60' },
    { label: 'Other Serious Issue', icon: 'alert-circle-outline', color: '#34495e' }
  ];

  useEffect(() => {
    const fetchTargetProfile = async () => {
      try {
        setProfileLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        const cleanToken = token?.replace(/['"]+/g, '').trim();
        
        const response = await fetch(`${BASE_URL}/api/auth/profile/${targetId}`, {
          headers: { 
            'Authorization': `Bearer ${cleanToken}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await response.json();
        if (data && !data.message) {
          setTargetUser(data);
        }
      } catch (err) {
        console.log("Error fetching target profile for card:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    if (targetId) {
      fetchTargetProfile();
    } else {
      setProfileLoading(false);
    }
  }, [targetId]);

  const handlePickEvidence = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert("Picker Error", response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      if (asset) setEvidence(asset);
    });
  };

  const handleSubmit = async () => {
    if (!complaintType || !detail || !targetId || !bookingId) {
      Alert.alert("Validation Failed", "Please select a complaint subject and fill in the details.");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('targetId', targetId);
    formData.append('bookingId', bookingId);
    formData.append('subject', complaintType);
    formData.append('description', detail);
    formData.append('type', role ? role.toLowerCase() : 'client');

    if (evidence) {
      formData.append('evidence', {
        uri: evidence.uri,
        type: evidence.type || 'image/jpeg',
        name: evidence.fileName || `evidence_${Date.now()}.jpg`,
      } as any);
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token?.replace(/['"]+/g, '').trim();
      
      const response = await fetch(`${BASE_URL}/api/complaints/submit`, {
        method: 'POST',
        body: formData,
        headers: { 
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const resData = await response.json();
      
      if (resData.success) {
        Alert.alert("Complaint Submitted 🎉", "Your complaint has been submitted to the Admin team for review.");
        navigation.goBack();
      } else {
        Alert.alert("Error", resData.message || "Failed to submit complaint.");
      }
    } catch (err: any) {
      console.log("Submit Error:", err);
      Alert.alert("Error", 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="File a Complaint" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Target User Profile Card */}
        {profileLoading ? (
          <View style={styles.targetCardLoader}>
            <ActivityIndicator size="small" color="#001a4d" />
            <Text style={styles.loadingProfileText}>Loading user profile...</Text>
          </View>
        ) : targetUser ? (
          <View style={styles.targetCard}>
            <Image 
              source={{ 
                uri: targetUser.profilePic || targetUser.profilePicUri
                  ? ( (targetUser.profilePic || targetUser.profilePicUri).startsWith('http') 
                      ? (targetUser.profilePic || targetUser.profilePicUri) 
                      : `${BASE_URL}/${(targetUser.profilePic || targetUser.profilePicUri).replace(/^\//, '')}` )
                  : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
              }} 
              style={styles.targetAvatar} 
            />
            <View style={styles.targetInfo}>
              <Text style={styles.targetName}>
                {targetUser.role === 'Lawyer' ? 'Adv. ' : ''}{targetUser.name}
              </Text>
              <Text style={styles.targetRole}>
                {targetUser.specialization ? `${targetUser.specialization} • ` : ''}
                {targetUser.role || 'User'}
              </Text>
              <Text style={styles.targetCity}>City: {targetUser.city || targetUser.address?.city || 'Pakistan'}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Select Complaint Subject</Text>
        <View style={styles.presetGrid}>
          {complaintPresets.map((preset) => {
            const isSelected = complaintType === preset.label;
            return (
              <TouchableOpacity
                key={preset.label}
                onPress={() => setComplaintType(preset.label)}
                style={[
                  styles.presetCard,
                  isSelected && { borderColor: preset.color, backgroundColor: `${preset.color}08` }
                ]}
              >
                <Icon 
                  name={preset.icon} 
                  size={28} 
                  color={isSelected ? preset.color : '#8696a0'} 
                />
                <Text style={[styles.presetText, isSelected && { color: preset.color, fontWeight: '700' }]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Provide Details</Text>
        <View style={styles.inputCard}>
          <TextInput 
            style={styles.textArea} 
            placeholder="Please write the exact issue you faced here..." 
            placeholderTextColor="#8696a0"
            multiline 
            numberOfLines={5}
            value={detail} 
            onChangeText={setDetail} 
          />
        </View>

        <Text style={styles.sectionTitle}>Attach Evidence (Optional)</Text>
        {evidence ? (
          <View style={styles.evidenceContainer}>
            <Image source={{ uri: evidence.uri }} style={styles.evidencePreview} />
            <TouchableOpacity style={styles.removeEvidenceBtn} onPress={() => setEvidence(null)}>
              <Icon name="close-circle" size={24} color="#ea0038" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.attachCard} onPress={handlePickEvidence}>
            <Icon name="camera-plus-outline" size={36} color="#001a4d" />
            <Text style={styles.attachText}>Upload Screenshot or Document Photo</Text>
          </TouchableOpacity>
        )}

        <MyButton 
          title={loading ? "Submitting..." : "Submit Complaint"} 
          onPress={handleSubmit} 
          disabled={loading || !complaintType || !detail}
          style={[
            { height: 52, borderRadius: 12, marginTop: 10 },
            (!complaintType || !detail) && { backgroundColor: '#cbd5e1' }
          ]}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#001a4d', marginTop: 15, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  targetCardLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  loadingProfileText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 10,
    fontWeight: '500',
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  targetAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  targetInfo: {
    flex: 1,
    marginLeft: 16,
  },
  targetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  targetRole: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#001a4d',
    marginBottom: 2,
  },
  targetCity: {
    fontSize: 11.5,
    color: '#64748b',
  },
  presetGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  presetCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    height: 105,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: { 
    padding: 16, 
    height: 120, 
    textAlignVertical: 'top',
    fontSize: 14.5,
    color: '#0f172a',
  },
  attachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#001a4d',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  attachText: {
    color: '#001a4d',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 8,
  },
  evidenceContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  evidencePreview: {
    width: 250,
    height: 150,
    resizeMode: 'cover',
  },
  removeEvidenceBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  submitButton: { 
    backgroundColor: '#001a4d', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  disabledBtn: {
    backgroundColor: '#cbd5e1',
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});

export default ComplaintScreen;
