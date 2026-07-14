import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;
        if (!userId) return;

        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`https://mug-work-public.ngrok-free.dev/api/chat/list/${userId}`, {
          headers: { Authorization: `Bearer ${token?.replace(/['"]+/g, '')}` }
        });

        if (response.data.success) {
          const chatsList = response.data.chats;
          const keys = chatsList.map((c: any) => `lastRead_${c._id}`);
          let readMap: any = {};
          if (keys.length > 0) {
            const pairs = await AsyncStorage.multiGet(keys);
            pairs.forEach(([key, val]) => {
              const bId = key.replace('lastRead_', '');
              if (val) {
                readMap[bId] = val;
              }
            });
          }

          let count = 0;
          chatsList.forEach((item: any) => {
            const isMe = item.lastMessage?.sender === userId;
            const lastMsgId = item.lastMessage?._id || item.lastMessage?.id;
            const hasSeenLastMsg = lastMsgId && readMap[item._id] === lastMsgId;
            const isUnread = item.lastMessage && !isMe && !hasSeenLastMsg;
            if (isUnread) {
              count++;
            }
          });
          setUnreadCount(count);
        }
      } catch (e) {
        console.log("Error fetching unread count for bottom bar:", e);
      }
    };

    fetchUnreadCount();
  }, [currentRoute, role]);

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
        <View style={{ position: 'relative' }}>
          <Icon name="chat-processing-outline" size={29} color={currentRoute === 'Chats' ? activeColor : inactiveColor} />
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#ff3333',
              borderRadius: 8.5,
              minWidth: 17,
              height: 17,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 2,
              borderWidth: 1.5,
              borderColor: '#001a4d',
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 8,
                fontWeight: '800',
                textAlign: 'center',
                marginTop: -1,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
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