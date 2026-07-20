import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StatusBar, Image, PermissionsAndroid, Alert, Keyboard, Modal, BackHandler, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { chatStyles } from './Chatscreen.styles';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import socket from '../../../socket';
import RNFS from 'react-native-fs';

Sound.setCategory('Playback');

const ChatScreen = ({ route, navigation }: any) => {
  const { bookingId, partnerName, partnerPic } = route.params;
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'ios' ? insets.top + 10 : insets.top + 15;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const activeSound = useRef<Sound | null>(null);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [blink, setBlink] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = (animated = true) => {
    if (messagesRef.current.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 100);
    }
  };

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('ChatsList');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const lastMsgId = lastMsg._id || lastMsg.id;
      if (lastMsgId) {
        AsyncStorage.setItem(`lastRead_${bookingId}`, lastMsgId).catch(err => console.log(err));
      }
    }
    scrollToBottom(true);
  }, [messages, bookingId]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      scrollToBottom(true);
    });
    return () => {
      showSubscription.remove();
    };
  }, []);

  const deleteSelectedMessages = () => {
    if (selectedMsgIds.length === 0) return;

    // Check if all selected messages were sent by the current user
    const allByMe = selectedMsgIds.every((id) => {
      const msg = messages.find((m) => (m._id || m.id) === id);
      return msg && msg.sender === currentUser?.id;
    });

    const alertOptions: any[] = [
      { text: "Cancel", style: "cancel" },
      { text: "Delete for me", onPress: () => performDeleteMessages('me') }
    ];

    if (allByMe) {
      alertOptions.push({
        text: "Delete for everyone",
        style: "destructive",
        onPress: () => performDeleteMessages('everyone')
      });
    }

    Alert.alert(
      selectedMsgIds.length === 1 ? "Delete Message" : "Delete Messages",
      `Would you like to delete ${selectedMsgIds.length === 1 ? 'this message' : 'these messages'}?`,
      alertOptions
    );
  };

  const performDeleteMessages = async (deleteType: 'me' | 'everyone') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token?.replace(/['"]+/g, '');

      await Promise.all(
        selectedMsgIds.map(async (msgId) => {
          const config = {
            headers: { Authorization: `Bearer ${cleanToken}` },
            data: { deleteType }
          };
          await axios.delete(`https://mug-work-public.ngrok-free.dev/api/chat/message/${msgId}`, config);
        })
      );

      if (deleteType === 'me') {
        setMessages(prev => prev.filter(m => !selectedMsgIds.includes(m._id || m.id)));
      }
      setSelectedMsgIds([]);
    } catch (error) {
      console.error("Delete Messages Error:", error);
      Alert.alert("Error", "Could not delete messages.");
    }
  };

  useEffect(() => {
    return () => {
      if (activeSound.current) {
        activeSound.current.stop();
        activeSound.current.release();
      }
    };
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setBlink((b) => !b);
      }, 500);
    } else {
      setBlink(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('content://') || url.startsWith('file://') || url.startsWith('ph://')) {
      return url;
    }
    let finalUrl = url;
    if (!url.startsWith('http')) {
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      finalUrl = `https://mug-work-public.ngrok-free.dev${cleanUrl}`;
    }
    // Force https on ngrok URLs to bypass cleartext policy
    if (finalUrl.startsWith('http://mug-work-public.ngrok-free.dev')) {
      finalUrl = finalUrl.replace('http://', 'https://');
    }
    return finalUrl;
  };

  const emojis = ['😀', '😂', '😍', '👍', '🙏', '🔥', '👏', '🎉', '😢', '😡', '❤️', '💼', '⚖️', '📝', '📞', '🏛️'];

  const [chatPartner, setChatPartner] = useState<any>({
    name: partnerName || 'Loading...',
    profilePic: partnerPic || '',
    id: ''
  });

  // Recording timer logic
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const initChat = async () => {
      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token?.replace(/['"]+/g, '');

      setCurrentUser(user);
      const myId = user.id || user._id;
      if (myId) {
        socket.emit('registerUser', myId);
      }
      socket.emit('joinRoom', bookingId);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            'ngrok-skip-browser-warning': 'true'
          }
        };

        const msgRes = await axios.get(
          `https://mug-work-public.ngrok-free.dev/api/chat/${bookingId}`,
          config
        );
        if (msgRes.data.success) setMessages(msgRes.data.messages);

        const bookingRes = await axios.get(
          `https://mug-work-public.ngrok-free.dev/api/bookings/status/${bookingId}`,
          config
        );

        if (bookingRes.data.success) {
          const b = bookingRes.data.booking;
          const myId = user.id || user._id;
          const myIdStr = String(myId || '').trim().toLowerCase();
          const clientIdStr = String(b.clientId?._id || b.clientId || '').trim().toLowerCase();

          const isMeClient = clientIdStr === myIdStr;
          const partnerName = isMeClient ? b.lawyerName : b.clientName;
          const partnerPic = isMeClient ? b.lawyerPic : b.clientPic;
          const partnerId = isMeClient ? b.lawyerId : b.clientId;

          const rawPic = partnerPic || '';
          const cleanPic = rawPic.replace(/\\/g, '/');

          setChatPartner({
            name: partnerName || 'Unknown',
            profilePic: cleanPic,
            id: partnerId || ''
          });
        }

      } catch (e) {
        console.log("Init Chat Error:", e);
      }
    };

    initChat();

    socket.on('receiveMessage', (msg) =>
      setMessages((prev) => {
        if (msg.sender === (currentUser?.id || currentUser?._id) && (msg.type === 'file' || msg.type === 'audio')) {
          const index = prev.findIndex(m => m.isUploading && m.type === msg.type);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = msg;
            return updated;
          }
        }
        if (prev.some(m => (m._id || m.id) === (msg._id || msg.id))) {
          return prev;
        }
        return [...prev, msg];
      })
    );

    socket.on('messageDeleted', (data: any) => {
      setMessages((prev) =>
        prev.map((m) => {
          if ((m._id || m.id) === data.messageId) {
            return { ...m, text: data.text, type: data.type };
          }
          return m;
        })
      );
    });

    socket.on('callLog', (logMsg) =>
      setMessages((prev) => [
        ...prev,
        {
          type: 'call_log',
          text: logMsg,
          createdAt: new Date()
        }
      ])
    );

    return () => {
      socket.off('receiveMessage');
      socket.off('messageDeleted');
      socket.off('callLog');
    };
  }, [bookingId, chatPartner.name]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    socket.emit('sendMessage', {
      bookingId,
      text: inputText,
      sender: currentUser?.id || currentUser?._id,
      type: 'text'
    });

    setInputText('');
  };

  const selectDocument = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true, maxWidth: 800, maxHeight: 800, quality: 0.5 }, async (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        await uploadFile(asset);
      }
    });
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', includeBase64: true, maxWidth: 800, maxHeight: 800, quality: 0.5 }, async (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        await uploadFile(asset);
      }
    });
  };

  const uploadFile = async (asset: any) => {
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      sender: currentUser?.id || currentUser?._id,
      type: 'file',
      text: asset.uri || '',
      fileName: asset.fileName || 'photo.jpg',
      createdAt: new Date().toISOString(),
      isUploading: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token?.replace(/['"]+/g, '');

      if (!asset.base64) {
        Alert.alert("Error", "Could not read image base64 data.");
        setMessages((prev) => prev.filter(m => m._id !== tempId));
        return;
      }

      console.log("📡 Uploading document via native base64 JSON post...");
      const response = await fetch('https://mug-work-public.ngrok-free.dev/api/chat/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          fileBase64: asset.base64,
          fileName: asset.fileName || 'photo.jpg'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const uploadResData = await response.json();

      if (uploadResData.success) {
        socket.emit('sendMessage', {
          bookingId,
          text: uploadResData.fileUrl,
          sender: currentUser?.id || currentUser?._id,
          type: 'file',
          fileName: asset.fileName || 'Document'
        });
      } else {
        Alert.alert("Upload Error", uploadResData.message || "Failed to upload document.");
        setMessages((prev) => prev.filter(m => m._id !== tempId));
      }
    } catch (error: any) {
      console.log("File Upload Error:", error);
      const errMsg = error?.message || "Failed to upload document.";
      Alert.alert("Upload Error", errMsg);
      setMessages((prev) => prev.filter(m => m._id !== tempId));
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      const audioFile = await AudioRecord.stop();
      setIsRecording(false);

      if (!audioFile) {
        console.log("Audio recording file path is empty");
        return;
      }

      console.log("🎙️ Stopped recording. File saved at:", audioFile);

      const tempId = `temp_${Date.now()}`;
      const tempMsg = {
        _id: tempId,
        sender: currentUser?.id || currentUser?._id,
        type: 'audio',
        text: audioFile,
        createdAt: new Date().toISOString(),
        isUploading: true,
      };
      setMessages((prev) => [...prev, tempMsg]);

      // Add a 500ms delay to ensure the OS finishes writing and releases the file lock
      setTimeout(async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          const cleanToken = token?.replace(/['"]+/g, '');

          console.log("🎙️ Reading voice note file from disk as base64...");
          const audioBase64 = await RNFS.readFile(audioFile, 'base64');
          console.log("📡 Uploading voice note via base64 JSON post...");

          const response = await fetch('https://mug-work-public.ngrok-free.dev/api/upload/audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanToken}`,
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              fileBase64: audioBase64
            })
          });

          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
          }

          const uploadResData = await response.json();

          if (uploadResData.success) {
            socket.emit('sendMessage', {
              bookingId,
              text: uploadResData.fileUrl,
              sender: currentUser?.id || currentUser?._id,
              type: 'audio'
            });
          } else {
            Alert.alert("Audio Upload Error", uploadResData.message || "Failed to upload audio.");
            setMessages((prev) => prev.filter(m => m._id !== tempId));
          }
        } catch (error: any) {
          console.log("Audio Upload Error:", error);
          const errMsg = error?.message || "Failed to upload audio.";
          Alert.alert("Audio Upload Error", errMsg);
          setMessages((prev) => prev.filter(m => m._id !== tempId));
        }
      }, 500);
    } else {
      let audioGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (!audioGranted) {
        const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (status === PermissionsAndroid.RESULTS.GRANTED) {
          audioGranted = true;
        }
      }
      if (!audioGranted) {
        Alert.alert("Permission Required", "Microphone access is needed to record voice messages.");
        return;
      }
      AudioRecord.init({ sampleRate: 16000, channels: 1, bitsPerSample: 16, audioSource: 1, wavFile: `voice_${Date.now()}.wav` });
      AudioRecord.start();
      setIsRecording(true);
    }
  };

  const cancelRecording = async () => {
    if (isRecording) {
      await AudioRecord.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (msgId: string, url: string) => {
    if (playingMsgId === msgId && activeSound.current) {
      activeSound.current.pause();
      setPlayingMsgId(null);
      return;
    }

    if (activeSound.current) {
      activeSound.current.stop();
      activeSound.current.release();
      activeSound.current = null;
    }

    const finalUrl = getFileUrl(url);
    const sound = new Sound(finalUrl, '', (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      setPlayingMsgId(msgId);
      sound.play((success) => {
        setPlayingMsgId(null);
        sound.release();
        if (activeSound.current === sound) {
          activeSound.current = null;
        }
      });
    });
    activeSound.current = sound;
  };

  const handleCall = async (isVideo: boolean) => {
    navigation.navigate('CallScreen', {
      socket,
      bookingId,
      partnerId: chatPartner.id,
      partnerName: chatPartner.name,
      partnerPic: chatPartner.profilePic,
      isCaller: true,
      isVideo,
      callerName: currentUser?.name || 'Legal Link Partner',
      callerPic: currentUser?.profilePic || currentUser?.profilePicUri || '',
    });
  };

  // Date helper methods
  const shouldShowDateHeader = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt || Date.now()).toDateString();
    const prevDate = new Date(prevMsg.createdAt || Date.now()).toDateString();
    return currentDate !== prevDate;
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
    >
      <View style={chatStyles.container}>
        <StatusBar barStyle="light-content" />
        <View style={[chatStyles.header, { paddingTop: headerPaddingTop, paddingBottom: 15 }]}>
          {selectedMsgIds.length > 0 ? (
            <>
              <TouchableOpacity onPress={() => setSelectedMsgIds([])}>
                <Icon name="close" size={25} color="#fff" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 20 }}>
                <Text style={chatStyles.headerTitle}>
                  {selectedMsgIds.length === 1 ? "1 Message Selected" : `${selectedMsgIds.length} Messages Selected`}
                </Text>
              </View>
              <View style={chatStyles.headerIcons}>
                <TouchableOpacity onPress={deleteSelectedMessages}>
                  <Icon name="delete" size={25} color="#ff3333" style={{ marginRight: 5 }} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={25} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ChatInfo', { bookingId })}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10 }}
              >
                <Image
                  source={{ uri: chatPartner.profilePic ? (chatPartner.profilePic.startsWith('http') ? chatPartner.profilePic : `https://mug-work-public.ngrok-free.dev${chatPartner.profilePic.startsWith('/') ? '' : '/'}${chatPartner.profilePic}`) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={chatStyles.headerTitle}>{chatPartner.name}</Text>
                  <Text style={chatStyles.headerSubTitle}>tap here for info</Text>
                </View>
              </TouchableOpacity>

              <View style={chatStyles.headerIcons}>
                <TouchableOpacity onPress={() => handleCall(false)} style={{ marginRight: 20 }}>
                  <Icon name="phone" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCall(true)}>
                  <Icon name="video" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || item._id || index.toString()}
          contentContainerStyle={{ paddingBottom: 15 }}
          renderItem={({ item, index }) => {
            const isMe = item.sender === currentUser?.id;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const displayDateHeader = index === 0 || shouldShowDateHeader(item, prevMsg);
            const dateStr = item.createdAt || new Date().toISOString();

            const msgId = item._id || item.id || index.toString();
            const isSelected = selectedMsgIds.includes(msgId);

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => {
                  if (item.type !== 'deleted' && item.type !== 'call_log') {
                    setSelectedMsgIds((prev) => {
                      if (prev.includes(msgId)) {
                        return prev.filter((id) => id !== msgId);
                      } else {
                        return [...prev, msgId];
                      }
                    });
                  }
                }}
                onPress={() => {
                  if (selectedMsgIds.length > 0) {
                    setSelectedMsgIds((prev) => {
                      if (prev.includes(msgId)) {
                        return prev.filter((id) => id !== msgId);
                      } else {
                        return [...prev, msgId];
                      }
                    });
                  }
                }}
                style={[isSelected && { backgroundColor: 'rgba(0, 153, 255, 0.15)' }]}
              >
                {displayDateHeader && (
                  <View style={chatStyles.dateHeaderContainer}>
                    <Text style={chatStyles.dateHeaderText}>{formatDateHeader(dateStr)}</Text>
                  </View>
                )}

                {item.type === 'call_log' ? (
                  <View style={chatStyles.callLogContainer}>
                    <Icon name="phone-check" size={16} color="#555" />
                    <Text style={chatStyles.callLogText}>{item.text}</Text>
                  </View>
                ) : item.type === 'deleted' ? (
                  <View style={[chatStyles.msgBubble, isMe ? chatStyles.myMsg : chatStyles.theirMsg]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="cancel" size={16} color="#8696a0" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#8696a0', fontStyle: 'italic', fontSize: 14.5 }}>
                        This message was deleted
                      </Text>
                    </View>
                    <View style={chatStyles.msgMeta}>
                      <Text style={chatStyles.msgTimeText}>{formatTime(item.createdAt)}</Text>
                    </View>
                  </View>
                ) : item.type === 'audio' ? (
                  <View style={[chatStyles.audioBubbleWhatsapp, isMe ? chatStyles.myMsg : chatStyles.theirMsg]}>
                    {item.isUploading ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                        <ActivityIndicator size="small" color={isMe ? '#0099ff' : '#8696a0'} style={{ marginRight: 8 }} />
                        <Text style={{ color: isMe ? '#001a4d' : '#64748b', fontSize: 13.5, fontStyle: 'italic' }}>Uploading voice note...</Text>
                      </View>
                    ) : (
                      <View style={chatStyles.audioControls}>
                        {(() => {
                          const msgId = item._id || item.id || index.toString();
                          const isPlaying = playingMsgId === msgId;
                          return (
                            <TouchableOpacity
                              onPress={() => playAudio(msgId, item.text)}
                              style={[chatStyles.audioPlayBtn, { backgroundColor: isMe ? '#d0e1fd' : '#f1f5f9' }]}
                            >
                              <Icon name={isPlaying ? "pause" : "play"} size={24} color={isMe ? '#001a4d' : '#64748b'} />
                            </TouchableOpacity>
                          );
                        })()}

                        <View style={chatStyles.audioSliderContainer}>
                          <View style={chatStyles.audioWaveformSim}>
                            <View style={[chatStyles.waveformBar, { height: 10, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 16, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 8, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 14, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 12, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 18, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 10, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 15, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 6, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                            <View style={[chatStyles.waveformBar, { height: 12, backgroundColor: isMe ? '#0099ff' : '#8696a0' }]} />
                          </View>

                          <View style={chatStyles.audioTimeAndStatus}>
                            <Text style={chatStyles.audioDurationText}>Voice Note</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={chatStyles.msgTimeText}>{formatTime(item.createdAt)}</Text>
                              {isMe && (
                                <Icon name="check-all" size={15} color="#0099ff" style={chatStyles.checkmarkIcon} />
                              )}
                            </View>
                          </View>
                        </View>

                        <Icon name="microphone" size={24} color={isMe ? '#0099ff' : '#8696a0'} style={{ marginLeft: 5 }} />
                      </View>
                    )}
                  </View>
                ) : item.type === 'file' ? (
                  <View style={[chatStyles.msgBubble, isMe ? chatStyles.myMsg : chatStyles.theirMsg, { maxWidth: '75%', padding: 5 }]}>
                    {item.text.match(/\.(jpeg|jpg|gif|png)$/i) || item.text.startsWith('content://') || item.text.startsWith('file://') || item.text.startsWith('ph://') ? (
                      <TouchableOpacity onPress={() => setSelectedImageUri(getFileUrl(item.text))}>
                        <View style={{ position: 'relative' }}>
                          <Image
                            source={{ uri: getFileUrl(item.text) }}
                            style={{ width: 220, height: 160, borderRadius: 8, marginBottom: 5 }}
                            resizeMode="cover"
                          />
                          {item.isUploading && (
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 5, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}>
                              <ActivityIndicator size="small" color="#fff" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, padding: 5 }}>
                        <Icon name="file-document-outline" size={36} color={isMe ? '#001a4d' : '#001a4d'} />
                        <Text style={[{ marginLeft: 8, flex: 1, fontWeight: '500' }, isMe ? chatStyles.myMsgText : chatStyles.theirMsgText]} numberOfLines={2}>
                          {item.fileName || 'Document'}
                        </Text>
                      </View>
                    )}
                    <View style={[chatStyles.msgMeta, { marginTop: 0 }]}>
                      <Text style={chatStyles.msgTimeText}>{formatTime(item.createdAt)}</Text>
                      {isMe && (
                        <Icon name="check-all" size={15} color="#0099ff" style={chatStyles.checkmarkIcon} />
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={[chatStyles.msgBubble, isMe ? chatStyles.myMsg : chatStyles.theirMsg]}>
                    <Text style={isMe ? chatStyles.myMsgText : chatStyles.theirMsgText}>{item.text}</Text>
                    <View style={chatStyles.msgMeta}>
                      <Text style={chatStyles.msgTimeText}>{formatTime(item.createdAt)}</Text>
                      {isMe && (
                        <Icon name="check-all" size={15} color="#0099ff" style={chatStyles.checkmarkIcon} />
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />

        {isRecording ? (
          <View style={[chatStyles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={chatStyles.recordingPill}>
              <Icon name="microphone" size={22} color="#ff3b30" style={{ opacity: blink ? 1 : 0.2, marginRight: 8 }} />
              <Text style={[chatStyles.recordingTimer, { color: '#111', fontWeight: '700' }]}>{formatDuration(recordingSeconds)}</Text>
              <Text style={[chatStyles.recordingText, { color: '#8696a0', fontSize: 13.5, marginLeft: 10 }]}>Recording...</Text>
              <TouchableOpacity onPress={cancelRecording} style={chatStyles.recordingCancelBtn}>
                <Text style={chatStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleRecord} style={chatStyles.floatingButton}>
              <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={[chatStyles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
              <View style={chatStyles.inputPill}>
                <TouchableOpacity
                  style={chatStyles.inputIcon}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                >
                  <Icon name="emoticon-happy-outline" size={24} color="#8696a0" />
                </TouchableOpacity>

                <TextInput
                  style={chatStyles.textInput}
                  value={inputText}
                  onChangeText={(text) => {
                    setInputText(text);
                    if (showEmojiPicker) setShowEmojiPicker(false);
                  }}
                  onFocus={() => setShowEmojiPicker(false)}
                  placeholder="Type a message"
                  placeholderTextColor="#8696a0"
                  multiline
                />

                <TouchableOpacity style={chatStyles.inputIcon} onPress={selectDocument}>
                  <Icon name="paperclip" size={22} color="#8696a0" />
                </TouchableOpacity>
                <TouchableOpacity style={chatStyles.inputIcon} onPress={takePhoto}>
                  <Icon name="camera" size={22} color="#8696a0" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={inputText.trim() ? sendMessage : handleRecord}
                style={chatStyles.floatingButton}
              >
                <Icon
                  name={inputText.trim() ? "send" : "microphone"}
                  size={inputText.trim() ? 20 : 24}
                  color="#fff"
                  style={inputText.trim() ? { marginLeft: 3 } : null}
                />
              </TouchableOpacity>
            </View>

            {showEmojiPicker && (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                backgroundColor: '#fff',
                padding: 10,
                borderTopWidth: 0.5,
                borderTopColor: '#e0e0e0',
                justifyContent: 'space-evenly',
                paddingBottom: Math.max(insets.bottom, 10)
              }}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setInputText(prev => prev + emoji)}
                    style={{ padding: 10 }}
                  >
                    <Text style={{ fontSize: 26 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        {selectedImageUri && (
          <Modal
            visible={!!selectedImageUri}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedImageUri(null)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 30, right: 20, zIndex: 10, padding: 10 }}
                onPress={() => setSelectedImageUri(null)}
              >
                <Icon name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedImageUri }}
                style={{ width: '100%', height: '80%' }}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
