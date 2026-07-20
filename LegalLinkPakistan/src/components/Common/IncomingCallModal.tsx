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

// ==========================================
// STYLES & EXPORTS
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001a4d', // Brand Dark Blue
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  callTypeTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(0, 204, 102, 0.25)',
  },
  avatarWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 25,
    textAlign: 'center',
  },
  subText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  buttonCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  declineButton: {
    backgroundColor: '#ff3333',
  },
  acceptButton: {
    backgroundColor: '#00cc66',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
});

export default IncomingCallModal;
