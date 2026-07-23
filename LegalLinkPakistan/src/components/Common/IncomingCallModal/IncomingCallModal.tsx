// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { styles } from './IncomingCallModal.styles';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface IncomingCallModalProps {
  visible: boolean;
  callerName: string;
  callerPic?: string;
  isVideo?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const BASE_URL = 'https://mug-work-public.ngrok-free.dev';

// ==========================================
// INCOMING CALL MODAL COMPONENT
// ==========================================
export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  visible,
  callerName,
  callerPic,
  isVideo = false,
  onAccept,
  onDecline,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Start pulsing animation for incoming call ring
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      return () => loop.stop();
    }
  }, [visible]);

  if (!visible) return null;

  const getProfileImageUri = () => {
    if (!callerPic) return null;
    if (callerPic.startsWith('http://') || callerPic.startsWith('https://')) {
      return callerPic;
    }
    const cleanPath = callerPic.startsWith('/') ? callerPic.slice(1) : callerPic;
    return `${BASE_URL}/${cleanPath}`;
  };

  const imageUri = getProfileImageUri();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Header Info */}
          <View style={styles.header}>
            <Icon
              name={isVideo ? 'video' : 'phone-incoming'}
              size={28}
              color="#00cc66"
            />
            <Text style={styles.callTypeTitle}>
              {isVideo ? 'Incoming Video Call...' : 'Incoming Voice Call...'}
            </Text>
          </View>

          {/* Caller Profile & Pulse Ring */}
          <View style={styles.avatarSection}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.avatarWrapper}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <Icon name="account" size={70} color="#001a4d" />
              )}
            </View>
            <Text style={styles.callerName}>{callerName || 'Legal Partner'}</Text>
            <Text style={styles.subText}>LegalLink Pakistan</Text>
          </View>

          {/* Action Controls (Accept & Reject) */}
          <View style={styles.actionsContainer}>
            {/* Decline Button */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                onPress={onDecline}
                style={[styles.buttonCircle, styles.declineButton]}
                activeOpacity={0.8}
              >
                <Icon name="phone-hangup" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Decline</Text>
            </View>

            {/* Accept Button */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                onPress={onAccept}
                style={[styles.buttonCircle, styles.acceptButton]}
                activeOpacity={0.8}
              >
                <Icon name={isVideo ? 'video' : 'phone'} size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Accept</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default IncomingCallModal;
