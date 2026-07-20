import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 ADDED
import { AdminStyles as s } from '../../theme/styles/AdminStyles';
import Card from '../../components/Common/Card/Card';
import CustomBottomNav from '../../components/Common/BottomBar/Bottombar';
import NotificationIcon from '../../components/Common/NotificationIcon';
import Header from '../../components/Common/Header';

const AdminDashboard = ({ navigation }: any) => {
  const [stats, setStats] = useState({ totalLawyers: 0, totalClients: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      
      const response = await axios.get("https://mug-work-public.ngrok-free.dev/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}` // 👈 ADDED: Secure request
        }
      });
      
      if (response.data) {
        setStats({
          totalLawyers: response.data.totalLawyers || 0,
          totalClients: response.data.totalClients || 0
        });
      }
    } catch (error) {
      console.log("Stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={s.container}>
      {/* Header Section */}
      <Header 
        title="Legal Link Pakistan" 
        showBackButton={false} 
        rightElement={<NotificationIcon badgeBorderColor="#001a4d" />} 
      />

      {/* Main Content Section */}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionHeader}>Action Required</Text>
        
        <Card 
          title="New Lawyers Verification"
          iconName="account-search-outline"
          onPress={() => navigation.navigate('NewLawyerVerification')}
        />

        {/* Updated Complaint Navigation */}
        <Card 
          title="User Complaints"
          iconName="account-alert-outline"
          onPress={() => navigation.navigate('ComplaintHandling')}
        />

        <Text style={s.sectionHeader}>System Overview</Text>
        
        {loading ? (
          <ActivityIndicator color="#001a4d" size="small" />
        ) : (
          <View style={s.statsRow}>
            <View style={s.statsCard}>
              <View style={s.statsTextContainer}>
                <Text style={s.statsLabel}>Total {"\n"}Lawyers</Text>
                <Text style={s.statsValue}>{stats.totalLawyers}</Text>
              </View>
            </View>
            
            <View style={s.statsCard}>
              <View style={s.statsTextContainer}>
                <Text style={s.statsLabel}>Total {"\n"}Clients</Text>
                <Text style={s.statsValue}>{stats.totalClients}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Common Bottom Bar Section */}
      <CustomBottomNav navigation={navigation} currentRoute="Home" role="Admin" />
    </View>
  );
};

export default AdminDashboard;
