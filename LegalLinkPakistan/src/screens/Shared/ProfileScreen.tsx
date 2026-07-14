import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Image, SafeAreaView, Platform, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import Header from '../../components/Common/Header';
import CustomBottomNav from '../../components/Common/BottomBar/Bottombar';
import { LocationSelector } from '../../components/Common/LocationSelector';
import { COLORS } from '../../theme/theme';

const API_BASE = "https://mug-work-public.ngrok-free.dev/api";

export const ProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<'Client' | 'Lawyer' | 'Admin'>('Client');
  const [userId, setUserId] = useState<string | null>(null);

  // Profile Form States
  const [profilePic, setProfilePic] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Client specific
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');

  // Lawyer specific
  const [barCouncil, setBarCouncil] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [courtLevel, setCourtLevel] = useState('Lower Court');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('0');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [cnic, setCnic] = useState('');
  const [bio, setBio] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [consultationFee, setConsultationFee] = useState('1000');
  const [areasOfPractice, setAreasOfPractice] = useState<string[]>([]);
  const [newAreaInput, setNewAreaInput] = useState('');

  // Admin specific
  const [email, setEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');

  // Modal Visibility States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passUpdating, setPassUpdating] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        // Fallback for Admin
        const adminToken = await AsyncStorage.getItem('adminToken');
        if (adminToken) {
          setRole('Admin');
          setEmail("samiullahmujahid.pk@gmail.com");
          setLoading(false);
          return;
        }
        Alert.alert("Session Expired", "User details not found. Please login again.");
        await AsyncStorage.multiRemove(['userToken', 'token', 'user', 'adminToken', 'userId', 'userRole', 'userEmail']);
        navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelection' }],
        });
        return;
      }

      const userObj = JSON.parse(userStr);
      const uId = userObj.id || userObj._id;
      const uRole = userObj.role || 'Client';
      
      if (!uId || uId === 'undefined') {
        Alert.alert("Session Expired", "Invalid user credentials. Please login again.");
        await AsyncStorage.multiRemove(['userToken', 'token', 'user', 'adminToken', 'userId', 'userRole', 'userEmail']);
        navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelection' }],
        });
        return;
      }

      setUserId(uId);
      let normalizedRole: 'Client' | 'Lawyer' | 'Admin' = 'Client';
      if (uRole.toLowerCase() === 'lawyer') normalizedRole = 'Lawyer';
      else if (uRole.toLowerCase() === 'admin') normalizedRole = 'Admin';
      setRole(normalizedRole);

      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      const response = await axios.get(`${API_BASE}/auth/profile/${uId}`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      if (response.data) {
        const data = response.data;
        setName(data.name || '');
        setPhone(data.phone || '');
        
        let pic = data.profilePic || data.profilePicUri || '';
        if (pic && !pic.startsWith('http://') && !pic.startsWith('https://') && !pic.startsWith('data:')) {
          pic = `https://mug-work-public.ngrok-free.dev/${pic.replace(/^\//, '')}`;
        }
        setProfilePic(pic);

        if (normalizedRole === 'Client') {
          setCity(data.address?.city || data.city || '');
          setDistrict(data.address?.district || data.district || '');
          setProvince(data.address?.province || data.province || '');
        } else if (normalizedRole === 'Lawyer') {
          setCity(data.city || data.address?.city || '');
          setDistrict(data.district || data.address?.district || '');
          setProvince(data.province || data.address?.province || '');
          setBarCouncil(data.barCouncil || '');
          setLicenseNumber(data.licenseNumber || '');
          setCourtLevel(data.courtLevel || 'Lower Court');
          setSpecialization(data.specialization || '');
          setExperience(data.experience?.toString() || '0');
          setLicenseExpiry(data.licenseExpiry || '');
          setCnic(data.cnic || '');
          setBio(data.bio || '');
          setOfficeAddress(data.officeAddress || '');
          setConsultationFee(data.consultationFee?.toString() || '1000');
          setAreasOfPractice(data.areasOfPractice || []);
        }
      }
    } catch (error) {
      console.log("[ProfileScreen] Fetch error:", error);
      Alert.alert("Error", "Failed to load profile from server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = () => {
    launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.8,
      includeBase64: true,
    }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert("Image Picker Error", response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const file = response.assets[0];
        if (file.base64) {
          setProfilePic(`data:image/jpeg;base64,${file.base64}`);
        }
      }
    });
  };

  const handleAddArea = () => {
    if (newAreaInput.trim() === '') return;
    if (areasOfPractice.includes(newAreaInput.trim())) {
      setNewAreaInput('');
      return;
    }
    setAreasOfPractice(prev => [...prev, newAreaInput.trim()]);
    setNewAreaInput('');
  };

  const handleRemoveArea = (index: number) => {
    setAreasOfPractice(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem(role === 'Admin' ? 'adminToken' : 'userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      let payload: any = {};
      if (role === 'Client') {
        payload = { name, phone, city, district, province, profilePic };
      } else if (role === 'Lawyer') {
        payload = {
          name, phone, city, district, province, barCouncil, licenseNumber, courtLevel, 
          specialization, experience, licenseExpiry, cnic, bio, 
          officeAddress, consultationFee, profilePic, areasOfPractice
        };
      } else if (role === 'Admin') {
        payload = { email, adminKey };
      }

      const response = await axios.put(`${API_BASE}/auth/profile/update`, payload, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      if (response.data.success) {
        Alert.alert("Success ✅", "Profile updated successfully!");
        setEditModalVisible(false);

        if (role !== 'Admin' && response.data.user) {
          const cachedUserStr = await AsyncStorage.getItem('user');
          if (cachedUserStr) {
            const cachedUser = JSON.parse(cachedUserStr);
            const updatedCache = {
              ...cachedUser,
              name: response.data.user.name,
              profilePic: response.data.user.profilePic || response.data.user.profilePicUri
            };
            await AsyncStorage.setItem('user', JSON.stringify(updatedCache));
          }
        }
        fetchProfileData();
      }
    } catch (error: any) {
      console.log("[ProfileScreen] Save error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch Error ❌", "New password and confirmation do not match.");
      return;
    }

    try {
      setPassUpdating(true);
      const token = await AsyncStorage.getItem(role === 'Admin' ? 'adminToken' : 'userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      const response = await axios.put(`${API_BASE}/auth/profile/update-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      if (response.data.success) {
        Alert.alert("Success ✅", "Password updated successfully!");
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.log("[ProfileScreen] Password update error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update password. Double check current password.");
    } finally {
      setPassUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(['userToken', 'token', 'user', 'adminToken']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'RoleSelection' }],
            });
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching profile details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Profile" showBackButton={false} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Card */}
        {role !== 'Admin' && (
          <View style={styles.profilePicCard}>
            <View style={styles.avatarWrapper}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Icon name="account" size={60} color="#cbd5e1" />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{name || "LegalLink User"}</Text>
            <Text style={styles.profileRoleBadge}>{role}</Text>
          </View>
        )}

        {/* Read-Only Details Layout */}
        <View style={styles.detailsBlock}>
          <Text style={styles.sectionHeader}>Profile Information</Text>

          <View style={styles.infoRowItem}>
            <Icon name="account" size={20} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoVal}>{name || 'N/A'}</Text>
            </View>
          </View>

          {role !== 'Admin' && (
            <View style={styles.infoRowItem}>
              <Icon name="phone" size={20} color={COLORS.primary} />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoVal}>{phone || 'N/A'}</Text>
              </View>
            </View>
          )}

          {role === 'Admin' ? (
            <View style={styles.infoRowItem}>
              <Icon name="email" size={20} color={COLORS.primary} />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoVal}>{email || 'N/A'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoRowItem}>
              <Icon name="map-marker" size={20} color={COLORS.primary} />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Location / City</Text>
                <Text style={styles.infoVal}>
                  {city || 'N/A'}
                  {(district || province) ? `, ${district} (${province})` : ''}
                </Text>
              </View>
            </View>
          )}

          {role === 'Lawyer' && (
            <>
              <View style={styles.infoRowItem}>
                <Icon name="scale-balance" size={20} color={COLORS.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Bar Council & License</Text>
                  <Text style={styles.infoVal}>{barCouncil || 'N/A'} (Lic: #{licenseNumber || 'N/A'})</Text>
                </View>
              </View>

              <View style={styles.infoRowItem}>
                <Icon name="gavel" size={20} color={COLORS.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Court Level</Text>
                  <Text style={styles.infoVal}>{courtLevel || 'Lower Court'}</Text>
                </View>
              </View>

              <View style={styles.infoRowItem}>
                <Icon name="cash" size={20} color={COLORS.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Consultation Fee</Text>
                  <Text style={styles.infoVal}>PKR {consultationFee || '1000'}</Text>
                </View>
              </View>

              <View style={styles.infoRowItem}>
                <Icon name="briefcase-clock" size={20} color={COLORS.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Experience & Specialization</Text>
                  <Text style={styles.infoVal}>{experience} years exp • {specialization || 'General Practice'}</Text>
                </View>
              </View>

              {bio ? (
                <View style={[styles.infoRowItem, { alignItems: 'flex-start' }]}>
                  <Icon name="information" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={styles.infoTextCol}>
                    <Text style={styles.infoLabel}>Bio</Text>
                    <Text style={styles.infoValBio}>{bio}</Text>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Dashboard Actions Panel */}
        <View style={styles.actionsBlock}>
          <TouchableOpacity style={styles.actionBtnRow} onPress={() => setEditModalVisible(true)}>
            <Icon name="account-edit" size={24} color="#fff" />
            <Text style={styles.actionBtnText}>Edit Profile Info</Text>
          </TouchableOpacity>

          {role !== 'Admin' && (
            <TouchableOpacity style={[styles.actionBtnRow, { backgroundColor: '#475569' }]} onPress={() => setPasswordModalVisible(true)}>
              <Icon name="lock-reset" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>Update Password</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutBtnRow} onPress={handleLogout}>
            <Icon name="logout-variant" size={22} color={COLORS.danger} />
            <Text style={styles.logoutBtnText}>Sign Out / Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= EDIT PROFILE MODAL ================= */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Information</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent} showsVerticalScrollIndicator={false}>
              {/* Profile Pic Upload Trigger */}
              {role !== 'Admin' && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={handlePickImage} style={styles.modalAvatarWrapper}>
                    {profilePic ? (
                      <Image source={{ uri: profilePic }} style={styles.modalAvatarImage} />
                    ) : (
                      <View style={styles.modalAvatarFallback}>
                        <Icon name="camera" size={28} color="#94a3b8" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Tap picture to edit avatar</Text>
                </View>
              )}

              {role === 'Admin' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Admin Email Address</Text>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Admin Passkey</Text>
                    <TextInput
                      style={styles.textInput}
                      value={adminKey}
                      onChangeText={setAdminKey}
                      placeholder="LLP123 (Default)"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact Phone</Text>
                    <TextInput
                      style={styles.textInput}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Location Details</Text>
                    <LocationSelector
                      province={province}
                      district={district}
                      tehsil={city}
                      onProvinceChange={setProvince}
                      onDistrictChange={setDistrict}
                      onTehsilChange={setCity}
                      styleType={role === 'Client' ? 'client' : 'lawyer'}
                    />
                  </View>

                  {role === 'Lawyer' && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Bar Council</Text>
                        <TextInput
                          style={styles.textInput}
                          value={barCouncil}
                          onChangeText={setBarCouncil}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>License Number</Text>
                        <TextInput
                          style={styles.textInput}
                          value={licenseNumber}
                          onChangeText={setLicenseNumber}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Court Level</Text>
                        <TextInput
                          style={styles.textInput}
                          value={courtLevel}
                          onChangeText={setCourtLevel}
                          placeholder="e.g. High Court, Supreme Court"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>CNIC Number</Text>
                        <TextInput
                          style={styles.textInput}
                          value={cnic}
                          onChangeText={setCnic}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Specialization</Text>
                        <TextInput
                          style={styles.textInput}
                          value={specialization}
                          onChangeText={setSpecialization}
                          placeholder="e.g. Criminal Law, Corporate Law"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Consultation Fee (PKR)</Text>
                        <TextInput
                          style={styles.textInput}
                          value={consultationFee}
                          onChangeText={setConsultationFee}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Years of Experience</Text>
                        <TextInput
                          style={styles.textInput}
                          value={experience}
                          onChangeText={setExperience}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>License Expiry Date</Text>
                        <TextInput
                          style={styles.textInput}
                          value={licenseExpiry}
                          onChangeText={setLicenseExpiry}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Office Address</Text>
                        <TextInput
                          style={styles.textInput}
                          value={officeAddress}
                          onChangeText={setOfficeAddress}
                          multiline
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Professional Bio</Text>
                        <TextInput
                          style={[styles.textInput, styles.textAreaInput]}
                          value={bio}
                          onChangeText={setBio}
                          multiline
                          numberOfLines={4}
                        />
                      </View>

                      {/* Areas of Practice tags list */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Areas of Practice</Text>
                        <View style={styles.practiceTagsContainer}>
                          {areasOfPractice.map((area, idx) => (
                            <View key={idx} style={styles.tagItem}>
                              <Text style={styles.tagText}>{area}</Text>
                              <TouchableOpacity onPress={() => handleRemoveArea(idx)}>
                                <Icon name="close-circle" size={16} color={COLORS.danger} />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>

                        <View style={styles.addTagWrapper}>
                          <TextInput
                            style={[styles.textInput, { flex: 1, marginTop: 0 }]}
                            value={newAreaInput}
                            onChangeText={setNewAreaInput}
                            placeholder="Add practice area..."
                            placeholderTextColor="#94a3b8"
                          />
                          <TouchableOpacity onPress={handleAddArea} style={styles.addTagBtn}>
                            <Icon name="plus-circle" size={28} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSave, saving && { opacity: 0.6 }]} 
                onPress={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ================= UPDATE PASSWORD MODAL ================= */}
      <Modal visible={passwordModalVisible} animationType="fade" transparent>
        <SafeAreaView style={styles.modalOverlayCenter}>
          <View style={styles.passwordCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} disabled={passUpdating}>
                <Icon name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 15 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                  editable={!passUpdating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="#94a3b8"
                  editable={!passUpdating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Re-type new password"
                  placeholderTextColor="#94a3b8"
                  editable={!passUpdating}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setPasswordModalVisible(false)} disabled={passUpdating}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSave, passUpdating && { opacity: 0.6 }]} 
                onPress={handleUpdatePassword}
                disabled={passUpdating}
              >
                {passUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Save Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Reusable Dashboard Navigation */}
      <CustomBottomNav navigation={navigation} currentRoute="Profile" role={role} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightBg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  profilePicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileRoleBadge: {
    backgroundColor: COLORS.primary + '15',
    color: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsBlock: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextCol: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoVal: {
    fontSize: 14.5,
    color: '#1e293b',
    fontWeight: '600',
    marginTop: 2,
  },
  infoValBio: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 2,
  },
  actionsBlock: {
    gap: 12,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  logoutBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 6,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },

  // Modal styling layouts
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalFormContent: {
    paddingVertical: 15,
    paddingBottom: 40,
  },
  modalAvatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
  },
  modalAvatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    color: '#0f172a',
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  practiceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 12,
    color: '#334155',
    marginRight: 6,
    fontWeight: '500',
  },
  addTagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTagBtn: {
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  modalBtnCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  modalBtnSave: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  modalBtnSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Password specific Modal styles
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passwordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    padding: 20,
    elevation: 5,
  },
});

export default ProfileScreen;
