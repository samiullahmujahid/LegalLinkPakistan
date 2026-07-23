import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Image, Platform, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonActions } from '@react-navigation/native';
import Header from '../../../components/Common/Header/Header';
import { MyButton } from '../../../components/Common/MyButton/MyButton';

const ComplaintDetails = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminComment, setAdminComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchSingleComplaint();
  }, []);

  const fetchSingleComplaint = async () => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const token = adminToken || (await AsyncStorage.getItem('userToken'));
      setIsAdmin(!!adminToken);

      const res = await axios.get(`https://mug-work-public.ngrok-free.dev/api/complaints/detail/${id}`, {
        headers: { 
          Authorization: `Bearer ${token?.replace(/['"]+/g, '')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const found = res.data.complaint;
      if (found) {
        setComplaint(found);
        setAdminComment(found.adminResponse || '');
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: string, suspensionDays?: number) => {
    try {
      const token = (await AsyncStorage.getItem('adminToken'))?.replace(/['"]+/g, '');
      const body: any = { status: actionType, adminComment };
      if (actionType === 'suspended' && suspensionDays) {
        body.suspensionDays = suspensionDays;
      }

      const response = await axios.put(`https://mug-work-public.ngrok-free.dev/api/complaints/status/${id}`, 
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        Alert.alert("Success 🎉", `Complaint marked as ${actionType}.`);
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update status");
    }
  };

  const promptSuspension = () => {
    Alert.alert(
      "Suspension Duration",
      "Select account suspension period:",
      [
        { text: "7 Days", onPress: () => handleAction('suspended', 7) },
        { text: "30 Days", onPress: () => handleAction('suspended', 30) },
        { text: "Permanent", onPress: () => handleAction('suspended', 36500) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // Stepper tracker rendering helper
  const renderStepper = () => {
    const status = complaint?.status || 'pending';
    const isPending = status === 'pending';
    const isWarned = status === 'warned';
    const isResolved = status === 'resolved';

    const steps = [
      { id: 1, label: 'Submitted', active: true, done: true },
      { id: 2, label: 'In Review', active: isPending || isWarned || isResolved, done: isWarned || isResolved },
      { id: 3, label: isWarned ? 'Warned' : 'Resolved', active: isWarned || isResolved, done: isWarned || isResolved, color: isWarned ? '#dc2626' : '#16a34a' }
    ];

    return (
      <View style={styles.stepperContainer}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <View style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle, 
                step.done && { backgroundColor: step.color || '#001a4d', borderColor: step.color || '#001a4d' },
                step.active && !step.done && { borderColor: '#001a4d', borderWidth: 2 }
              ]}>
                {step.done ? (
                  <Icon name="check" size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, step.active && { color: '#001a4d', fontWeight: 'bold' }]}>{step.id}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, step.active && { color: '#0f172a', fontWeight: '600' }]}>{step.label}</Text>
            </View>
            {idx < steps.length - 1 && (
              <View style={[styles.stepLine, steps[idx + 1].active && { backgroundColor: '#001a4d' }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Details" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
        
        {/* Stepper Status Progress */}
        {renderStepper()}

        {/* Roles Details */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.sectionTitle}>Complainant</Text>
              <Text style={styles.nameText}>
                {complaint?.type === 'client' 
                  ? (complaint?.clientId?.name || 'Unknown User') 
                  : (complaint?.lawyerId?.name || 'Unknown User')}
              </Text>
              <Text style={styles.roleSub}>({complaint?.type === 'client' ? 'Client' : 'Lawyer'})</Text>
            </View>
            <View style={styles.vsSeparator}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.sectionTitle}>Accused Party</Text>
              <Text style={styles.nameText}>
                {complaint?.type === 'client' 
                  ? (complaint?.lawyerId?.name || 'Unknown Lawyer') 
                  : (complaint?.clientId?.name || 'Unknown User')}
              </Text>
              <Text style={styles.roleSub}>({complaint?.type === 'client' ? 'Lawyer' : 'Client'})</Text>
            </View>
          </View>
        </View>

        {/* Subject and Description */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Complaint Subject</Text>
          <Text style={styles.subjectText}>{complaint?.subject || 'N/A'}</Text>
          
          <View style={styles.thinDivider} />
          
          <Text style={styles.sectionTitle}>Incident Description</Text>
          <Text style={styles.descText}>{complaint?.description || 'No description provided.'}</Text>
        </View>

        {/* Evidence Attachment Section */}
        {complaint?.evidence && (
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Uploaded Evidence</Text>
            <Image 
              source={{ uri: `https://mug-work-public.ngrok-free.dev${complaint.evidence}` }} 
              style={styles.evidenceImage} 
              resizeMode="contain"
            />
          </View>
        )}

        {/* Admin Comments and Status Output */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Resolution Details</Text>
          <View style={[styles.statusRow, { backgroundColor: complaint?.status === 'pending' ? '#fffbeb' : '#f0fdf4' }]}>
            <Icon 
              name={complaint?.status === 'pending' ? 'clock-outline' : 'check-decagram-outline'} 
              size={18} 
              color={complaint?.status === 'pending' ? '#b45309' : '#16a34a'} 
            />
            <Text style={[styles.statusTextValue, { color: complaint?.status === 'pending' ? '#b45309' : '#16a34a' }]}>
              Status: {complaint?.status?.toUpperCase()}
            </Text>
          </View>

          {complaint?.adminResponse ? (
            <View style={styles.adminRemarkBox}>
              <Text style={styles.adminLabel}>Official Admin Response</Text>
              <Text style={styles.adminRespText}>{complaint.adminResponse}</Text>
            </View>
          ) : (
            <Text style={styles.noAdminText}>Your complaint is currently under investigation by the LegalLink dispute board.</Text>
          )}
        </View>

        {/* Admin Action Control Board */}
        {isAdmin && (
          <View style={styles.adminActionCard}>
            <Text style={styles.sectionTitle}>Admin Action Panel</Text>
            <TextInput 
              style={styles.commentInput} 
              placeholder="Add official resolution feedback here..." 
              placeholderTextColor="#94a3b8"
              multiline 
              value={adminComment} 
              onChangeText={setAdminComment} 
            />
            <MyButton 
              title="Issue Warning"
              onPress={() => handleAction('warned')}
              style={{ backgroundColor: '#f59e0b', height: 45, borderRadius: 8, marginTop: 12 }}
            />
            <MyButton 
              title="Suspend Account"
              onPress={promptSuspension}
              style={{ backgroundColor: '#ef4444', height: 45, borderRadius: 8, marginTop: 12 }}
            />
            <MyButton 
              title="Mark As Resolved"
              onPress={() => handleAction('resolved')}
              style={{ backgroundColor: '#10b981', height: 45, borderRadius: 8, marginTop: 12 }}
            />
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  
  // Stepper Tracker styles
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  stepNum: {
    fontSize: 11,
    color: '#64748b',
  },
  stepLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
    marginTop: -18,
  },

  // Cards layout
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1.2,
    alignItems: 'center',
  },
  vsSeparator: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  roleSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },

  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2.5,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001a4d',
    marginBottom: 12,
  },
  thinDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  descText: {
    fontSize: 14.5,
    color: '#334155',
    lineHeight: 22,
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },

  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 8,
  },
  statusTextValue: {
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  adminRemarkBox: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#fffdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    borderRadius: 6,
  },
  adminLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#b45309',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  adminRespText: {
    color: '#451a03',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  noAdminText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  adminActionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 40,
  },
  commentInput: { 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 8, 
    height: 90, 
    padding: 12, 
    marginBottom: 15, 
    backgroundColor: '#fff', 
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#0f172a',
  },
  actionBtn: { 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  warnBtn: { backgroundColor: '#f59e0b' },
  suspendBtn: { backgroundColor: '#ef4444' },
  resolveBtn: { backgroundColor: '#10b981' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});

export default ComplaintDetails;
