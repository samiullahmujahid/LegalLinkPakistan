import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StatusBar, Image, PermissionsAndroid, Alert, Keyboard, Modal
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

  const getFileUrl = (url: string) => {
    if (!url) return '';
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
          const isLawyer = user.role === 'lawyer';

          // LOGIC: Retrieve partner details based on role
          const partner = isLawyer ? b.clientId : b.lawyerId;

          setChatPartner({
            name: partner?.name || 'Unknown',
            profilePic: partner?.profilePic || '',
            id: partner?._id || ''
          });
        }

      } catch (e) {
        console.log("Init Chat Error:", e);
      }
    };

    initChat();

    socket.on('receiveMessage', (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on('incomingCall', (data) => {
      Alert.alert(
        "Incoming Call",
        `Incoming ${data.isVideo ? 'Video' : 'Voice'} Call from ${data.callerName || chatPartner.name}...`,
        [
          {
            text: "Decline",
            onPress: () => {
              socket.emit('callLog', { bookingId, message: 'Call declined' });
            },
            style: "cancel"
          },
          {
            text: "Accept",
            onPress: () => {
              navigation.navigate('CallScreen', {
                socket,
                bookingId,
                partnerId: data.callerId,
                partnerName: data.callerName || chatPartner.name,
                partnerPic: data.callerPic || chatPartner.profilePic,
                isCaller: false,
                isVideo: data.isVideo,
                incomingSignal: data.signal,
                callerSocketId: data.from
              });
            }
          }
        ]
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
      socket.off('incomingCall');
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
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
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
    launchCamera({ mediaType: 'photo', quality: 0.8 }, async (response) => {
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
    try {
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token?.replace(/['"]+/g, '');

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `file_${Date.now()}.jpg`,
      } as any);
      formData.append('bookingId', bookingId);

      console.log("📡 Uploading document via Axios...");
      const response = await axios.post('https://mug-work-public.ngrok-free.dev/api/chat/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${cleanToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const uploadResData = response.data;

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
      }
    } catch (error: any) {
      console.log("File Upload Error:", error?.response?.data || error);
      Alert.alert("Upload Error", "Failed to upload document.");
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

      try {
        const token = await AsyncStorage.getItem('userToken');
        const cleanToken = token?.replace(/['"]+/g, '');

        const audioUri = audioFile.startsWith('file://') ? audioFile : `file://${audioFile}`;

        const formData = new FormData();
        formData.append('file', {
          uri: audioUri,
          type: 'audio/wav',
          name: `voice_${Date.now()}.wav`,
        } as any);
        formData.append('bookingId', bookingId);

        console.log("📡 Uploading voice note via Axios...");
        const response = await axios.post('https://mug-work-public.ngrok-free.dev/api/upload/audio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${cleanToken}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const uploadResData = response.data;

        if (uploadResData.success) {
          socket.emit('sendMessage', {
            bookingId,
            text: uploadResData.fileUrl,
            sender: currentUser?.id || currentUser?._id,
            type: 'audio'
          });
        } else {
          Alert.alert("Audio Upload Error", uploadResData.message || "Failed to upload audio.");
        }
      } catch (error: any) {
        console.log("Audio Upload Error:", error?.response?.data || error);
        Alert.alert("Audio Upload Error", "Failed to upload audio.");
      }
    } else {
      const audioGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (!audioGranted) {
        Alert.alert("Permission Required", "Microphone access is needed.");
        return;
      }
      AudioRecord.init({ sampleRate: 16000, channels: 1, bitsPerSample: 16, audioSource: 6, wavFile: `voice_${Date.now()}.wav` });
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

  const playAudio = (url: string) => {
    const finalUrl = getFileUrl(url);
    const whoosh = new Sound(finalUrl, '', (error) => {
      if (!error) whoosh.play();
    });
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={chatStyles.container}>
        <StatusBar barStyle="light-content" />
        <View style={[chatStyles.header, { paddingTop: headerPaddingTop, paddingBottom: 15 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={25} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ChatInfo', { bookingId })}
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10 }}
          >
            <Image
              source={{ uri: chatPartner.profilePic ? `https://mug-work-public.ngrok-free.dev${chatPartner.profilePic}` : 'https://via.placeholder.com/150' }}
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
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item, index) => item.id || item._id || index.toString()}
          contentContainerStyle={{ paddingBottom: 15 }}
          renderItem={({ item, index }) => {
            const isMe = item.sender === currentUser?.id;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const displayDateHeader = index === 0 || shouldShowDateHeader(item, prevMsg);
            const dateStr = item.createdAt || new Date().toISOString();

            return (
              <View>
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
                ) : item.type === 'audio' ? (
                  <View style={[chatStyles.audioBubbleWhatsapp, isMe ? chatStyles.myMsg : chatStyles.theirMsg]}>
                    <View style={chatStyles.audioControls}>
                      <TouchableOpacity 
                        onPress={() => playAudio(item.text)} 
                        style={[chatStyles.audioPlayBtn, { backgroundColor: isMe ? '#a9dfbf' : '#ebedef' }]}
                      >
                        <Icon name="play" size={24} color={isMe ? '#27ae60' : '#7f8c8d'} />
                      </TouchableOpacity>

                      <View style={chatStyles.audioSliderContainer}>
                        <View style={chatStyles.audioWaveformSim}>
                          <View style={[chatStyles.waveformBar, { height: 10, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 16, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 8, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 14, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 12, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 18, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 10, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 15, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 6, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                          <View style={[chatStyles.waveformBar, { height: 12, backgroundColor: isMe ? '#27ae60' : '#8696a0' }]} />
                        </View>

                        <View style={chatStyles.audioTimeAndStatus}>
                          <Text style={chatStyles.audioDurationText}>Voice Note</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={chatStyles.msgTimeText}>{formatTime(item.createdAt)}</Text>
                            {isMe && (
                              <Icon name="check-all" size={15} color="#34b7f1" style={chatStyles.checkmarkIcon} />
                            )}
                          </View>
                        </View>
                      </View>
                      
                      <Icon name="microphone" size={24} color={isMe ? '#34b7f1' : '#8696a0'} style={{ marginLeft: 5 }} />
                    </View>
                  </View>
                ) : item.type === 'file' ? (
                  <View style={[chatStyles.msgBubble, isMe ? chatStyles.myMsg : chatStyles.theirMsg, { maxWidth: '75%', padding: 5 }]}>
                    {item.text.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <TouchableOpacity onPress={() => setSelectedImageUri(getFileUrl(item.text))}>
                        <Image 
                          source={{ uri: getFileUrl(item.text) }} 
                          style={{ width: 220, height: 160, borderRadius: 8, marginBottom: 5 }} 
                          resizeMode="cover"
                        />
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
                        <Icon name="check-all" size={15} color="#34b7f1" style={chatStyles.checkmarkIcon} />
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={[chatStyles.msgBubble, isMe ? chatStyles.myMsg : chatStyles.theirMsg]}>
                    <Text style={isMe ? chatStyles.myMsgText : chatStyles.theirMsgText}>{item.text}</Text>
                    <View style={chatStyles.msgMeta}>
                      <Text style={chatStyles.msgTimeText}>{formatTime(item.createdAt)}</Text>
                      {isMe && (
                        <Icon name="check-all" size={15} color="#34b7f1" style={chatStyles.checkmarkIcon} />
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />

        {isRecording ? (
          <View style={[chatStyles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={chatStyles.recordingPill}>
              <View style={chatStyles.recordingDot} />
              <Text style={chatStyles.recordingTimer}>{formatDuration(recordingSeconds)}</Text>
              <Text style={chatStyles.recordingText}>Recording...</Text>
              <TouchableOpacity onPress={cancelRecording} style={chatStyles.recordingCancelBtn}>
                <Text style={chatStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleRecord} style={chatStyles.floatingButton}>
              <Icon name="stop" size={22} color="#fff" />
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