import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, StatusBar, TextInput, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BottomBar from '../../../components/Common/BottomBar/Bottombar'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../components/Common/Header';

const ChatsListScreen = ({ navigation }: any) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [lastReadMap, setLastReadMap] = useState<{[bookingId: string]: string}>({});

  const loadLastReadStatus = async (chatList: any[]) => {
    try {
      const keys = chatList.map(c => `lastRead_${c._id}`);
      if (keys.length === 0) return;
      const pairs = await AsyncStorage.multiGet(keys);
      const map: any = {};
      pairs.forEach(([key, val]) => {
        const bId = key.replace('lastRead_', '');
        if (val) {
          map[bId] = val;
        }
      });
      setLastReadMap(map);
    } catch (e) {
      console.log("Error loading last read statuses:", e);
    }
  };

  const deleteSelectedChat = () => {
    if (!selectedChatId) return;
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This will clear all messages and hide the chat for you.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`https://mug-work-public.ngrok-free.dev/api/chat/chat/${selectedChatId}`, {
              headers: { Authorization: `Bearer ${token?.replace(/['"]+/g, '')}` }
            });
            setSelectedChatId(null);
            if (currentUser?.id) {
              fetchChatList(currentUser.id);
            }
          } catch (error) {
            console.error("Delete Chat Error:", error);
            Alert.alert("Error", "Could not delete chat.");
            setLoading(false);
          }
        }}
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const userData = JSON.parse(await AsyncStorage.getItem('user') || '{}');
          setCurrentUser(userData);
          if (userData.id) {
            fetchChatList(userData.id);
          } else {
            setLoading(false);
          }
        } catch (e) {
          setLoading(false);
        }
      };
      loadUser();
    }, [])
  );

  const fetchChatList = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`https://mug-work-public.ngrok-free.dev/api/chat/list/${userId}`, {
        headers: { Authorization: `Bearer ${token?.replace(/['"]+/g, '')}` }
      });

      if (response.data.success) {
        setChats(response.data.chats);
        loadLastReadStatus(response.data.chats);
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getMessagePreview = (lastMessage: any, defaultSubject: string) => {
    if (!lastMessage) return defaultSubject || "Tap to continue...";
    if (lastMessage.type === 'audio') return "🎙️ Voice note";
    if (lastMessage.type === 'call_log') return "📞 " + lastMessage.text;
    return lastMessage.text;
  };

  // Filter chats by lawyer/client name
  const filteredChats = chats.filter((item: any) => {
    const isLawyer = currentUser?.role?.toLowerCase() === 'lawyer';
    const partner = isLawyer ? item.clientId : item.lawyerId;
    const partnerName = partner?.name || "Consultant";
    return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar backgroundColor="#001a4d" barStyle="light-content" />
      
      <Header 
        title={selectedChatId ? "1 Chat Selected" : "Chats"} 
        showBackButton={false}
        leftElement={
          selectedChatId ? (
            <TouchableOpacity onPress={() => setSelectedChatId(null)}>
              <Icon name="close" size={24} color="#fff" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
          ) : undefined
        }
        rightElement={
          selectedChatId ? (
            <TouchableOpacity onPress={deleteSelectedChat}>
              <Icon name="delete" size={24} color="#ff3333" style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* WhatsApp Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchPill}>
          <Icon name="magnify" size={20} color="#8696a0" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or start a new chat"
            placeholderTextColor="#8696a0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) => {
            const myId = currentUser?.id || currentUser?._id;
            const myIdStr = String(myId || '').trim().toLowerCase();
            const clientIdStr = String(item.clientId?._id || item.clientId || '').trim().toLowerCase();
            const partner = clientIdStr === myIdStr ? item.lawyerId : item.clientId;
            const partnerName = partner?.name || "Consultant";
            
            let profilePic = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            const rawPath = partner?.profilePic || partner?.profilePicUri;
            if (rawPath) {
              if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:')) {
                profilePic = rawPath;
              } else {
                profilePic = `https://mug-work-public.ngrok-free.dev/${rawPath.replace(/^\//, '').replace(/\\/g, '/')}`;
              }
            }
            
            const lastMsgText = getMessagePreview(item.lastMessage, item.caseSubject);
            const lastMsgTime = item.lastMessage ? formatMessageTime(item.lastMessage.createdAt) : '';
            const isMe = item.lastMessage?.sender === (currentUser?.id || currentUser?._id);
            const lastMsgId = item.lastMessage?._id || item.lastMessage?.id;
            const hasSeenLastMsg = lastMsgId && lastReadMap[item._id] === lastMsgId;
            const isUnread = item.lastMessage && !isMe && !hasSeenLastMsg;

            const isSelected = selectedChatId === item._id;

            return (
              <TouchableOpacity 
                style={[styles.chatCard, isSelected && { backgroundColor: '#e1eafd' }]}
                onLongPress={() => setSelectedChatId(item._id)}
                onPress={() => {
                  if (selectedChatId) {
                    setSelectedChatId(selectedChatId === item._id ? null : item._id);
                  } else {
                    navigation.navigate('ChatsScreen', { 
                      bookingId: item._id,
                      partnerName: partnerName,
                      partnerPic: profilePic
                    });
                  }
                }}
              >
                <Image 
                  source={{ uri: profilePic }} 
                  style={styles.avatar} 
                />
                <View style={styles.infoContainer}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.title} numberOfLines={1}>{partnerName}</Text>
                    {lastMsgTime ? (
                      <Text style={[styles.timeText, isUnread ? styles.timeTextUnread : null]}>
                        {lastMsgTime}
                      </Text>
                    ) : null}
                  </View>

                  {/* Dynamic Case Category / Type Display */}
                  <View style={styles.caseTypeRow}>
                    <Icon name="file-document-outline" size={13} color="#001a4d" />
                    <Text style={styles.caseTypeText} numberOfLines={1}>
                      {item.caseCategory || "General Consultation"}
                    </Text>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.subtitle, isUnread ? styles.subtitleUnread : null]} numberOfLines={1}>
                      {isMe && (
                        <Icon name="check-all" size={16} color="#8696a0" style={{ marginRight: 4 }} />
                      )}
                      {' '}{lastMsgText}
                    </Text>
                    
                    {isUnread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>1</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No active chats found.</Text>}
        />
      </View>
      <BottomBar navigation={navigation} currentRoute="Chats" role={currentUser?.role || 'Client'} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#000',
    paddingVertical: 0,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  chatCard: { 
    backgroundColor: '#fff', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#f0f0f0' 
  },
  avatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    backgroundColor: '#ece5dd' 
  },
  infoContainer: { 
    flex: 1, 
    marginLeft: 15, 
    justifyContent: 'center' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  title: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111', 
    flex: 1, 
    marginRight: 10 
  },
  timeText: { 
    fontSize: 11, 
    color: '#667781', 
    fontWeight: '500' 
  },
  timeTextUnread: {
    color: '#0099ff',
    fontWeight: '600'
  },
  subtitle: { 
    fontSize: 13.5, 
    color: '#667781', 
    flex: 1,
    marginRight: 10
  },
  subtitleUnread: {
    color: '#111',
    fontWeight: '500'
  },
  unreadBadge: {
    backgroundColor: '#0099ff',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#999', 
    fontSize: 16 
  },
  caseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  caseTypeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#001a4d',
    marginLeft: 4,
  }
});

export default ChatsListScreen;