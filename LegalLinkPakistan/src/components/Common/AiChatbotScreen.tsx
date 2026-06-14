import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../theme/theme';

const { width } = Dimensions.get('window');
const API_BASE = "https://mug-work-public.ngrok-free.dev/api";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'image';
  imageUri?: string; // For rendering local uploaded document photos
}

export const AiChatbotScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Assalam-o-Alaikum! I am Insaaf-AI, your Pakistani legal companion. How can I assist you with law, contract verification, or legal draft generation today?', sender: 'ai', type: 'text' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'dalle'>('chat'); // chat = ask law, dalle = generate illustrations
  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  const recommendedQueries = [
    { text: "Register a company in SECP 🏢", prompt: "How can I register a company with SECP in Pakistan? Explain the step-by-step procedure." },
    { text: "Tenant rights in Islamabad 🏠", prompt: "What are the rights of tenants and landlords in Islamabad under Pakistani tenancy laws?" },
    { text: "Divorce legal procedure ⚖️", prompt: "What is the complete legal procedure for filing a divorce in Pakistan under family laws?" },
    { text: "Check property registration 📝", prompt: "How can I verify or check land/property registration online in Punjab or Sindh?" }
  ];

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSelectDocument = () => {
    launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      includeBase64: true
    }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert("Picker Error", response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const file = response.assets[0];
        if (file.uri && file.base64) {
          setSelectedImage({
            uri: file.uri,
            base64: file.base64
          });
          // Alert user vision mode is armed
          Alert.alert("Document Selected 📎", "Photo attached successfully. Enter your question and press send to analyze.");
        }
      }
    });
  };

  const handleRecommendedQuery = (prompt: string) => {
    sendMessage(prompt);
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (textToSend.trim() === '' && !selectedImage && !loading) return;

    setLoading(true);
    const textSnapshot = textToSend;
    const imageSnapshot = selectedImage;

    // Construct local user message representation
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textSnapshot,
      sender: 'user',
      type: 'text',
      imageUri: imageSnapshot?.uri
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/['"]+/g, '') : '';

      if (mode === 'dalle') {
        // 🎨 Trigger DALL-E Image Generation Route
        const res = await axios.post(`${API_BASE}/ai/generate-image`, 
          { prompt: textSnapshot },
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        );
        if (res.data.success && res.data.imageUrl) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: res.data.imageUrl,
            sender: 'ai',
            type: 'image'
          }]);
        }
      } else {
        // 💬 Trigger Vision / Ask Legal Assistant Route
        const payload: any = { message: textSnapshot };
        if (imageSnapshot) {
          payload.image = imageSnapshot.base64;
        }

        const res = await axios.post(`${API_BASE}/ai/ask`, 
          payload,
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        );

        if (res.data?.reply) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: res.data.reply,
            sender: 'ai',
            type: 'text'
          }]);
        }
      }
    } catch (error) {
      console.log("[AiChat] Error sending prompt:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Insaaf-AI server connection failed. Please check ngrok link or network.",
        sender: 'ai',
        type: 'text'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Notch-safe Premium Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.aiIconCircle}>
            <Icon name="scale-balance" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.headerText}>Insaaf-AI</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>Active Online</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.modeToggleBtn, mode === 'dalle' && styles.modeToggleActive]}
          onPress={() => setMode(prev => prev === 'chat' ? 'dalle' : 'chat')}
        >
          <Icon name={mode === 'dalle' ? "image-multiple" : "chat-processing"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Chat Log feed list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            
            return (
              <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  {/* Local image preview inside chat message (vision upload) */}
                  {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.uploadedDocPreview} />
                  )}

                  {/* Render DALL-E output image or text */}
                  {item.type === 'image' ? (
                    <View style={styles.dalleImageWrapper}>
                      <Image source={{ uri: item.text }} style={styles.dalleImg} />
                      <Text style={styles.dalleLabel}>AI Generated Illustration 🎨</Text>
                    </View>
                  ) : (
                    <Text style={isUser ? styles.userText : styles.aiText}>
                      {item.text}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            // Recommended query template chips shown on fresh chat
            messages.length === 1 ? (
              <View style={styles.recommendedContainer}>
                <Text style={styles.recommendedTitle}>Recommended Legal Queries</Text>
                <View style={styles.queriesGrid}>
                  {recommendedQueries.map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.queryChip}
                      onPress={() => handleRecommendedQuery(item.prompt)}
                    >
                      <Text style={styles.queryChipText}>{item.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* Selected image document preview bar above input */}
        {selectedImage && (
          <View style={styles.attachmentBar}>
            <Image source={{ uri: selectedImage.uri }} style={styles.attachmentThumb} />
            <Text style={styles.attachmentLabel}>Document attached for analysis</Text>
            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.clearAttachment}>
              <Icon name="close-circle" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {mode === 'dalle' ? "Generating image with DALL-E..." : "Insaaf-AI is analyzing..."}
            </Text>
          </View>
        )}

        {/* Chat input console */}
        <View style={styles.inputContainer}>
          <View style={styles.searchBarWrapper}>
            {/* 1. Attachment picker button */}
            <TouchableOpacity 
              style={styles.actionIconBtn} 
              onPress={handleSelectDocument}
              disabled={loading}
            >
              <Icon name="paperclip" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {/* 2. Text input */}
            <TextInput
              style={styles.input}
              placeholder={mode === 'dalle' ? "Describe the illustration to generate..." : "Ask a legal question or upload document..."}
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!loading}
            />

            {/* 3. Send button */}
            <TouchableOpacity 
              style={[styles.sendButton, { opacity: loading ? 0.4 : 1 }]} 
              onPress={() => sendMessage()}
              disabled={loading}
            >
              <Icon name="send-circle" size={36} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.lightBg 
  },
  header: { 
    backgroundColor: COLORS.primary, 
    paddingBottom: 12,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: { 
    padding: 4 
  },
  headerTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginLeft: 10 
  },
  aiIconCircle: { 
    backgroundColor: '#fff', 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  headerText: { 
    color: '#fff', 
    fontSize: 16.5, 
    fontWeight: '800' 
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  modeToggleBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  modeToggleActive: {
    backgroundColor: COLORS.warning,
  },
  chatContent: { 
    padding: 15,
    flexGrow: 1,
  },
  messageRow: { 
    marginBottom: 14, 
    flexDirection: 'row', 
    width: '100%' 
  },
  userRow: { 
    justifyContent: 'flex-end' 
  },
  aiRow: { 
    justifyContent: 'flex-start' 
  },
  bubble: { 
    padding: 12, 
    borderRadius: 16, 
    maxWidth: '82%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  userBubble: { 
    backgroundColor: '#fff', 
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiBubble: { 
    backgroundColor: COLORS.primary, 
    borderBottomLeftRadius: 2 
  },
  userText: { 
    color: '#1e293b', 
    fontSize: 14.5,
    lineHeight: 20,
  },
  aiText: { 
    color: '#fff', 
    fontSize: 14.5,
    lineHeight: 20,
  },
  uploadedDocPreview: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  dalleImageWrapper: {
    width: 220,
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 4,
  },
  dalleImg: {
    width: '100%',
    height: '88%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  dalleLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  recommendedContainer: {
    marginTop: 30,
    paddingHorizontal: 5,
  },
  recommendedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  queriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  queryChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  queryChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachmentThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  attachmentLabel: {
    flex: 1,
    fontSize: 12.5,
    color: '#64748b',
    marginLeft: 10,
    fontWeight: '500',
  },
  clearAttachment: {
    padding: 4,
  },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  loadingText: { 
    marginLeft: 10, 
    color: '#64748b', 
    fontStyle: 'italic',
    fontSize: 12.5,
  },
  inputContainer: { 
    padding: 10, 
    backgroundColor: '#fff',
    borderTopWidth: 1, 
    borderTopColor: '#e2e8f0' 
  },
  searchBarWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 24, 
    paddingHorizontal: 10, 
    backgroundColor: '#f8fafc', 
    minHeight: 48 
  },
  actionIconBtn: {
    padding: 4,
  },
  input: { 
    flex: 1, 
    fontSize: 14.5, 
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendButton: { 
    marginLeft: 5 
  },
});

export default AiChatbotScreen;