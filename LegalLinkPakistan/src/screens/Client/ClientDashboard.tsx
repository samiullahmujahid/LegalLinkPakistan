import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import NotificationIcon from '../../components/Common/NotificationIcon';
import { LawyerStyles as s } from '../../theme/styles/LawyerStyles';
import Card from '../../components/Common/Card/Card';
import CustomBottomNav from '../../components/Common/BottomBar/Bottombar';

interface MenuItem {
  title: string;
  icon: string;
  screen?: string; 
}

const ClientDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  
  const menuItems: MenuItem[] = [
    { title: 'Book an Appointment', icon: 'file-document-outline', screen: 'CaseDetails' },
    { title: 'Appointment Tracking', icon: 'file-find-outline', screen: 'TrackAppointment' },
    { title: 'Find Lawyer', icon: 'text-search', screen: 'RecommendedLawyersScreen' },
    { title: 'Tracking Complaint', icon: 'account-alert-outline', screen: 'ComplaintStatus' }, // ✅ Updated title here
  ];

  const handleNavigation = (item: MenuItem) => {
    if (!item.screen) return;

    try {
      if (item.screen === 'CaseDetails') {
        navigation.navigate('CaseDetails');
      } else if (item.screen === 'RecommendedLawyersScreen') {
        navigation.navigate('RecommendedLawyersScreen');
      } else if (item.screen === 'TrackAppointment') {
        navigation.navigate('TrackAppointment', { role: 'client' });
      } else if (item.screen === 'ComplaintStatus') {
        navigation.navigate('ComplaintStatus');
      } else {
        Alert.alert(
          'Under Development 🛠️', 
          `The ${item.title} dashboard pipeline is currently cooking.`
        );
      }
    } catch (error) {
      console.error(`Client navigation failed for ${item.screen}:`, error);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header Section */}
      <View style={[s.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={s.headerText}>Legal Link Pakistan</Text>
        <NotificationIcon />
      </View>

      {/* Main Content Section */}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            title={item.title}
            iconName={item.icon}
            onPress={() => handleNavigation(item)}
          />
        ))}
      </ScrollView>

      {/* Common Bottom Bar Section */}
      <CustomBottomNav navigation={navigation} currentRoute="Home" role="Client" />
    </SafeAreaView>
  );
};

export default ClientDashboard;