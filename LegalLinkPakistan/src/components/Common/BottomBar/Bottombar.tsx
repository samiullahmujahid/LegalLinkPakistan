import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './Bottombar.styles';

interface BottomNavProps {
  navigation: any;
  currentRoute: 'Home' | 'Chats' | 'AiChat' | 'Profile';
  role: 'Admin' | 'Client' | 'Lawyer';
}

const Bottombar: React.FC<BottomNavProps> = ({ navigation, currentRoute, role }) => {
  const activeColor = '#ffcc00'; 
  const inactiveColor = '#fff';   
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.bottomNav,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        paddingTop: 10,
      }
    ]}>
      {/* 1. HOME TAB */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => {
            const screen = role === 'Admin' ? 'AdminDashboard' : role === 'Client' ? 'ClientDashboard' : 'LawyerDashboard';
            navigation.navigate(screen);
        }}
      >
        <Icon name="home-variant-outline" size={30} color={currentRoute === 'Home' ? activeColor : inactiveColor} />
      </TouchableOpacity>
      
      {/* 2. CHATS TAB */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('ChatsList')} 
      >
        <Icon name="chat-processing-outline" size={29} color={currentRoute === 'Chats' ? activeColor : inactiveColor} />
      </TouchableOpacity>

      {/* 3. REUSABLE AI CHATBOT TAB */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('AiChatbotScreen')} 
      >
        <Icon name="robot-outline" size={31} color={currentRoute === 'AiChat' ? activeColor : inactiveColor} />
      </TouchableOpacity>

      {/* 4. PROFILE TAB */}
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('ProfileScreen')} 
      >
        <Icon name="account-circle-outline" size={30} color={currentRoute === 'Profile' ? activeColor : inactiveColor} />
      </TouchableOpacity>
    </View>
  );
};

export default Bottombar;