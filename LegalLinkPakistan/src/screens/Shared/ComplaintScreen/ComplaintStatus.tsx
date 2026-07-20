import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../components/Common/Header';
import { COLORS } from '../../../theme/theme';

const ComplaintStatus = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('pending'); 
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = (id: string) => {
    if (activeTab !== 'resolved') return;
    if (selectedIds.includes(id)) {
      const newIds = selectedIds.filter(i => i !== id);
      setSelectedIds(newIds);
      if (newIds.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedIds([...selectedIds, id]);
      setIsSelectionMode(true);
    }
  };

  const deleteSelected = () => {
    Alert.alert("Delete Complaints", `Are you sure you want to delete ${selectedIds.length} resolved complaints?`, [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        try {
          const token = (await AsyncStorage.getItem('userToken'))?.replace(/['"]+/g, '');
          
          await Promise.all(selectedIds.map(id => 
            axios.delete(`https://mug-work-public.ngrok-free.dev/api/complaints/delete/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {})
          ));

          const remainingComplaints = complaints.filter((c: any) => !selectedIds.includes(c._id));
          setComplaints(remainingComplaints);
        } catch (error) {
          console.log("Delete failed:", error);
        } finally {
          setSelectedIds([]);
          setIsSelectionMode(false);
        }
      }}
    ]);
  };

  useEffect(() => {
    fetchMyComplaints();
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, [activeTab]);

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setUserRole(userObj.role);
      }
      const token = (await AsyncStorage.getItem('userToken'))?.replace(/['"]+/g, '');
      const res = await axios.get(`https://mug-work-public.ngrok-free.dev/api/complaints/my-complaints?status=${activeTab.toLowerCase()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      setComplaints(res.data.complaints);
    } catch (err: any) {
      console.log("Error fetching complaints:", err);
      if (err.response?.data?.isSuspended) {
        Alert.alert("Account Suspended", err.response.data.message, [
          {
            text: "OK",
            onPress: async () => {
              await AsyncStorage.multiRemove(['userToken', 'token', 'user']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'RoleSelection' }],
              });
            }
          }
        ]);
      } else {
        Alert.alert("Error", "Could not load complaints.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeWarning = async (id: string) => {
    try {
      const token = (await AsyncStorage.getItem('userToken'))?.replace(/['"]+/g, '');
      const res = await axios.put(`https://mug-work-public.ngrok-free.dev/api/complaints/acknowledge/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        Alert.alert("Acknowledged ✅", "You have acknowledged the warning. Please adhere to LegalLink rules and guidelines.");
        fetchMyComplaints();
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to acknowledge warning.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706', label: 'Pending Review' };
      case 'warned':
        return { bg: '#fee2e2', text: '#dc2626', label: 'Warning Issued' };
      case 'resolved':
        return { bg: '#d1e7dd', text: '#0f5132', label: 'Resolved' };
      default:
        return { bg: '#f1f5f9', text: '#475569', label: status };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.lightBg }]}>
      <Header 
        title={isSelectionMode ? `${selectedIds.length} Selected` : "Complaint Tracker"} 
        showBackButton={!isSelectionMode}
        leftElement={
          isSelectionMode ? (
            <TouchableOpacity onPress={() => {setIsSelectionMode(false); setSelectedIds([])}}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ) : undefined
        }
        rightElement={
          isSelectionMode ? (
            <TouchableOpacity onPress={deleteSelected}>
              <Icon name="delete" size={24} color="#ff3333" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Modern Segmented Controller Tabs */}
      <View style={styles.tabContainer}>
        {['pending', 'warned', 'resolved'].map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)} 
              style={[styles.tabButton, isSelected && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 80 }} color="#001a4d" />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => {
            const isUserLawyer = userRole === 'Lawyer';
            const otherPartyName = isUserLawyer ? item.clientId?.name : item.lawyerId?.name;
            const relationshipLabel = isUserLawyer
              ? (item.type === 'lawyer' ? 'Against Client' : 'Complained By Client')
              : (item.type === 'client' ? 'Against Lawyer' : 'Complained By Lawyer');
            
            const badge = getStatusBadge(item.status);
            const isSelected = selectedIds.includes(item._id);

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onLongPress={() => toggleSelection(item._id)}
                onPress={() => isSelectionMode ? toggleSelection(item._id) : undefined}
                style={{ opacity: isSelected ? 0.6 : 1 }}
              >
                <View style={[styles.card, isSelected && { borderWidth: 2, borderColor: '#001a4d' }]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.subject}</Text>
                    <View style={[styles.badgeContainer, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                      <Icon name="account-outline" size={16} color="#64748b" />
                      <Text style={styles.metaLabel}>{relationshipLabel}: </Text>
                      <Text style={styles.metaValue}>{otherPartyName || "N/A"}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Icon name="calendar-range" size={16} color="#64748b" />
                      <Text style={styles.metaLabel}>Submitted: </Text>
                      <Text style={styles.metaValue}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    
                    {item.adminResponse ? (
                      <View style={styles.adminNoteBox}>
                        <View style={styles.adminNoteHeader}>
                          <Icon name="shield-account-outline" size={16} color="#856404" />
                          <Text style={styles.adminLabel}> Admin Remarks</Text>
                        </View>
                        <Text style={styles.adminNoteText}>{item.adminResponse}</Text>
                      </View>
                    ) : (
                      <View style={styles.waitingContainer}>
                        <Icon name="clock-outline" size={14} color="#94a3b8" />
                        <Text style={styles.noResponse}> Awaiting admin response and investigation...</Text>
                      </View>
                    )}

                    {item.status === 'warned' && !item.warningAccepted && (
                      <TouchableOpacity 
                        style={styles.acknowledgeBtn} 
                        onPress={() => handleAcknowledgeWarning(item._id)}
                      >
                        <Icon name="check-decagram" size={16} color="#fff" />
                        <Text style={styles.acknowledgeBtnText}> Acknowledge Warning</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity 
                      style={styles.detailBtn} 
                      onPress={() => isSelectionMode ? toggleSelection(item._id) : navigation.navigate('ComplaintDetails', { id: item._id })}
                    >
                      <Text style={styles.detailBtnText}>View Details</Text>
                      <Icon name="chevron-right" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No complaints found in this section.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBg },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 6, 
    backgroundColor: COLORS.white, 
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButton: { 
    flex: 1,
    paddingVertical: 10, 
    alignItems: 'center',
    borderRadius: 20, 
  },
  activeTabButton: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 11.5, fontWeight: '700', color: '#64748b' },
  activeTabText: { color: '#fff' },
  card: { 
    backgroundColor: '#fff', 
    marginBottom: 16, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: { color: '#001a4d', fontWeight: '700', fontSize: 16 },
  badgeContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  cardBody: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
  },
  metaValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  adminNoteBox: { 
    marginTop: 12, 
    padding: 12, 
    backgroundColor: '#fffbeb', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#fef3c7' 
  },
  adminNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminLabel: { fontSize: 11, fontWeight: '700', color: '#b45309', textTransform: 'uppercase' },
  adminNoteText: { color: '#78350f', fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  noResponse: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
  cardFooter: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'flex-end',
  },
  detailBtn: { 
    backgroundColor: '#001a4d', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, marginRight: 4 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 15, fontWeight: '500' },
  acknowledgeBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626', 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginTop: 14,
    alignSelf: 'flex-start',
    elevation: 1,
  },
  acknowledgeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 }
});

export default ComplaintStatus;
