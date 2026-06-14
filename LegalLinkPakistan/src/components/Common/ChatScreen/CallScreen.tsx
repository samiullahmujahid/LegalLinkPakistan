import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, PanResponder, Animated, Platform, Image } from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import socket from '../../../socket';

const CallScreen = ({ route, navigation }: any) => {
  const { bookingId, partnerId, partnerName, partnerPic, isCaller, isVideo, callerName, callerPic } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<string>('Connecting...');
  
  // States for visibility and controls
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  // Position for dragging (picture-in-picture local preview)
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => { pan.extractOffset(); },
    })
  ).current;

  const peerConnection = useRef<any>(null);

  const getAvatarUri = (pic: string) => {
    if (!pic) return 'https://via.placeholder.com/150';
    if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:')) {
      return pic;
    }
    const cleanPath = pic.startsWith('/') ? pic : `/${pic}`;
    return `https://mug-work-public.ngrok-free.dev${cleanPath}`;
  };

  // Auto-hide controls overlay on video call after 5 seconds
  useEffect(() => {
    if (!isVideo) return;
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setIsVisible(false));
    }, 5000);
    return () => clearTimeout(timer);
  }, [isVideo]);

  const toggleVisibility = () => {
    if (!isVideo) return;
    if (!isVisible) {
      setIsVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const pc = new RTCPeerConnection(configuration);
    peerConnection.current = pc;

    (pc as any)['ontrack'] = (event: any) => {
      setRemoteStream(event.streams[0]);
      setCallStatus('Connected');
    };

    (pc as any)['onicecandidate'] = (event: any) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: partnerId, candidate: event.candidate });
      }
    };

    mediaDevices.getUserMedia({ audio: true, video: !!isVideo }).then((stream) => {
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (isCaller) {
        setCallStatus('Ringing...');
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          socket.emit('callUser', { 
            userToCall: partnerId, 
            signalData: offer, 
            from: socket.id, 
            isVideo: !!isVideo,
            callerName,
            callerPic
          });
        });
      } else if (route.params.incomingSignal) {
        setCallStatus('Answering...');
        pc.setRemoteDescription(new RTCSessionDescription(route.params.incomingSignal))
          .then(() => pc.createAnswer())
          .then((answer) => pc.setLocalDescription(answer).then(() => answer))
          .then((answer) => {
            socket.emit('acceptCall', { to: route.params.callerSocketId, signal: answer });
            setCallStatus('Connected');
          })
          .catch(err => console.log("Answering Error:", err));
      }
    }).catch(err => console.log("Media Error:", err));

    socket.on('callAccepted', (signal: any) => {
      pc.setRemoteDescription(new RTCSessionDescription(signal));
      setCallStatus('Connected');
    });
    
    socket.on('ice-candidate', (candidate: any) => pc.addIceCandidate(new RTCIceCandidate(candidate)));

    return () => { 
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
      pc.close(); 
      socket.off('callAccepted');
      socket.off('ice-candidate');
    };
  }, [partnerId, bookingId, isCaller, isVideo]); 

  const toggleMute = () => {
    if (localStream?.getAudioTracks()?.[0]) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    // Styling toggle for UX representation
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleCamera = () => {
    if (localStream?.getVideoTracks()?.[0]) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (typeof videoTrack._switchCamera === 'function') {
        videoTrack._switchCamera();
        setIsFrontCamera(!isFrontCamera);
      }
    }
  };

  const endCall = () => {
    console.log("Emitting callLog for booking:", bookingId);
    socket.emit('callLog', { bookingId, message: isVideo ? 'Video call ended' : 'Voice call ended' });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={toggleVisibility} style={{ flex: 1 }}>
        {remoteStream && isVideo ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} />
        ) : (
          (isVisible || !isVideo) && (
            <View style={styles.voiceCallContainer}>
              <View style={styles.statusContainer}>
                <Text style={styles.partnerName}>{partnerName || 'Legal Link Partner'}</Text>
                <Text style={styles.statusText}>{callStatus}</Text>
              </View>

              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: getAvatarUri(partnerPic) }}
                  style={styles.largeAvatar}
                />
                <View style={styles.glowingBorder} />
              </View>

              <View style={styles.encryptionInfo}>
                <Icon name="lock" size={14} color="#8696a0" />
                <Text style={styles.encryptionText}>End-to-end encrypted</Text>
              </View>
            </View>
          )
        )}
      </TouchableOpacity>
      
      {localStream && isVideo && (
        <Animated.View {...panResponder.panHandlers} style={[styles.localVideo, pan.getLayout()]}>
          <RTCView 
            streamURL={localStream.toURL()} 
            style={{ flex: 1 }} 
            mirror={isFrontCamera}
          />
        </Animated.View>
      )}
      
      {isVisible && (
        <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
          <TouchableOpacity style={[styles.controlBtn, isMuted && styles.activeControlBtn]} onPress={toggleMute}>
            <Icon name={isMuted ? "microphone-off" : "microphone"} size={26} color="#fff" />
            <Text style={styles.controlLabel}>Mute</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.endCall} onPress={endCall}>
            <Icon name="phone-hangup" size={32} color="#fff" />
          </TouchableOpacity>
          
          {isVideo ? (
            <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
              <Icon name="camera-flip" size={26} color="#fff" />
              <Text style={styles.controlLabel}>Flip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.controlBtn, !isSpeakerOn && styles.activeControlBtn]} onPress={toggleSpeaker}>
              <Icon name={isSpeakerOn ? "volume-high" : "volume-mute"} size={26} color="#fff" />
              <Text style={styles.controlLabel}>Speaker</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B141A' }, // WhatsApp-style dark color
  remoteVideo: { flex: 1 },
  localVideo: { 
    width: 100, 
    height: 150, 
    position: 'absolute', 
    top: 60, 
    right: 20, 
    zIndex: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#202c33',
  },
  voiceCallContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 100,
  },
  statusContainer: { 
    alignItems: 'center', 
  },
  partnerName: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: 0.5 },
  statusText: { color: '#8696a0', fontSize: 16, marginTop: 8, fontWeight: '500' },
  avatarWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  largeAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#00a884',
    backgroundColor: '#111b21',
  },
  glowingBorder: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  encryptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111b21',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  encryptionText: {
    color: '#8696a0',
    fontSize: 12.5,
    marginLeft: 6,
    fontWeight: '500',
  },
  controls: { 
    position: 'absolute', 
    bottom: 50, 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-evenly', 
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  endCall: { 
    backgroundColor: '#ea0038', 
    padding: 18, 
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlBtn: { 
    backgroundColor: '#202c33', 
    padding: 14, 
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
  },
  activeControlBtn: {
    backgroundColor: '#00a884',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    position: 'absolute',
    bottom: -20,
  }
});

export default CallScreen;
