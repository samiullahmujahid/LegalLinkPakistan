import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LawyerStyles as s } from '../../theme/styles/LawyerStyles';
import Card from '../../components/Common/Card/Card';
import CustomBottomNav from '../../components/Common/BottomBar/Bottombar';
import NotificationIcon from '../../components/Common/NotificationIcon/NotificationIcon';
import Header from '../../components/Common/Header/Header';

interface LawyerMenuItem {
  title: string;
  icon: string;
  screen: string;
}

const LawyerDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {

  const menuItems: LawyerMenuItem[] = [
    { title: 'Clients Requests', icon: 'file-document-outline', screen: 'ClientRequests' },
    { title: 'Appointment Tracking', icon: 'file-find-outline', screen: 'TrackAppointment' },
    { title: 'Tracking Complaint', icon: 'account-alert-outline', screen: 'ComplaintStatus' },
    { title: 'Find Lawyers', icon: 'text-search', screen: 'FindLawyers' },
  ];

  const handleNavigation = (screenName: string) => {
    try {
      if (screenName === 'ClientRequests') {
        navigation.navigate(screenName);
      }
      else if (screenName === 'TrackAppointment') {
        navigation.navigate('TrackAppointment', { role: 'lawyer' });
      }
      else if (screenName === 'ComplaintStatus') {
        navigation.navigate('ComplaintStatus');
      }
      else if (screenName === 'FindLawyers' || screenName === 'RecommendedLawyersScreen') {
        navigation.navigate('RecommendedLawyersScreen');
      }
      else {
        Alert.alert(
          'Under Development 🛠️',
          `The ${screenName} interface workflow integration is currently baking.`
        );
      }
    } catch (error) {
      console.error(`Navigation dispatch to ${screenName} failed:`, error);
    }
  };

  return (
    <View style={s.container}>
      {/* Header Section */}
      <Header
        title="Legal Link Pakistan"
        showBackButton={false}
        rightElement={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Wallet Icon Shortcut */}
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')} style={{ marginRight: 15 }}>
              <Icon name="wallet-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <NotificationIcon />
          </View>
        }
      />

      {/* Main Content Section */}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <Card
            key={index}
            title={item.title}
            iconName={item.icon}
            onPress={() => handleNavigation(item.screen)}
          />
        ))}
      </ScrollView>

      {/* Common Bottom Bar Section */}
      <CustomBottomNav navigation={navigation} currentRoute="Home" role="Lawyer" />
    </View>
  );
};

export default LawyerDashboard;
