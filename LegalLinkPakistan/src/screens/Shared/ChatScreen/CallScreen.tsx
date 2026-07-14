import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, PanResponder, Animated, Platform, Image, BackHandler, Alert } from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import socket from '../../../socket';
import { COLORS } from '../../../theme/theme';

const CallScreen = ({ route, navigation }: any) => {
  const { bookingId, partnerId, partnerName, partnerPic, isCaller, isVideo, callerName, callerPic } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<string>('Connecting...');
  
  // Real-time elapsed call timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // States for visibility and controls
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  // Animated values for pulse waves behind avatar
  const pulseScale1 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.4)).current;
  const pulseScale2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.4)).current;

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
  const isEndingCall = useRef(false);

  // Intercept navigation back gesture/actions
  useEffect(() => {
    const handleBackPress = () => {
      if (!isEndingCall.current) {
        Alert.alert(
          "Call in Progress",
          "Please use the Red Hangup button to end the call and exit.",
          [{ text: "OK", style: "cancel" }]
        );
        return true; // Blocks the back action
      }
      return false; // Allows the back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e: any) => {
      if (isEndingCall.current) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        "Call in Progress",
        "Please use the Red Hangup button to end the call.",
        [{ text: "OK", style: "cancel" }]
      );
    });

    return () => {
      backHandler.remove();
      unsubscribeBeforeRemove();
    };
  }, [navigation]);

  const getAvatarUri = (pic: string) => {
    if (!pic) return '';
    if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:')) {
      return pic;
    }
    const cleanPath = pic.startsWith('/') ? pic : `/${pic}`;
    return `https://mug-work-public.ngrok-free.dev${cleanPath}`;
  };

  // Auto-hide controls overlay on video call after 5 seconds of inactivity
  useEffect(() => {
    if (!isVideo) return;
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setIsVisible(false));
    }, 5000);
    return () => clearTimeout(timer);
  }, [isVideo, isVisible]);

  const toggleVisibility = () => {
    if (!isVideo) return;
    if (!isVisible) {
      setIsVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  // Trigger pulse wave animations during ringing/connecting
  useEffect(() => {
    let pulseAnimation: any = null;
    const isRinging = callStatus === 'Ringing...' || callStatus === 'Connecting...' || callStatus === 'Answering...';

    if (isRinging) {
      pulseScale1.setValue(1);
      pulseOpacity1.setValue(0.5);
      pulseScale2.setValue(1);
      pulseOpacity2.setValue(0.5);

      pulseAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.parallel([
              Animated.timing(pulseScale1, {
                toValue: 2.2,
                duration: 2000,
                useNativeDriver: true
              }),
              Animated.timing(pulseOpacity1, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true
              })
            ])
          ]),
          Animated.sequence([
            Animated.delay(1000),
            Animated.parallel([
              Animated.timing(pulseScale2, {
                toValue: 2.2,
                duration: 2000,
                useNativeDriver: true
              }),
              Animated.timing(pulseOpacity2, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true
              })
            ])
          ])
        ])
      );
      pulseAnimation.start();
    } else {
      if (pulseAnimation) pulseAnimation.stop();
      pulseScale1.setValue(1);
      pulseOpacity1.setValue(0);
      pulseScale2.setValue(1);
      pulseOpacity2.setValue(0);
    }

    return () => {
      if (pulseAnimation) pulseAnimation.stop();
    };
  }, [callStatus]);

  // Real-time call duration elapsed timer (starts on 'Connected')
  useEffect(() => {
    let timerInterval: any = null;
    if (callStatus === 'Connected') {
      timerInterval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [callStatus]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            callerPic,
            bookingId
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
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleCameraOnOff = () => {
    if (localStream?.getVideoTracks()?.[0]) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !isCameraOn;
      setIsCameraOn(!isCameraOn);
    }
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
    isEndingCall.current = true;
    socket.emit('callLog', { bookingId, message: isVideo ? 'Video call ended' : 'Voice call ended' });
    navigation.goBack();
  };

  const getStatusTextDisplay = () => {
    if (callStatus === 'Connected') {
      return formatTimer(secondsElapsed);
    }
    return callStatus;
  };

  // Determine if there is a valid user avatar profile picture passed in
  const hasPic = partnerPic && partnerPic.trim().length > 0 && !partnerPic.includes('placeholder');

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={toggleVisibility} style={{ flex: 1 }}>
        {remoteStream && isVideo ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} zOrder={0} />
        ) : (
          (isVisible || !isVideo) && (
            <View style={styles.voiceCallContainer}>
              {/* Padlock + Encryption Header */}
              <View style={styles.encryptionInfo}>
                <Icon name="lock" size={14} color="#94a3b8" />
                <Text style={styles.encryptionText}>End-to-end encrypted</Text>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.partnerName}>{partnerName || 'Legal Consultant'}</Text>
                <Text style={styles.statusText}>{getStatusTextDisplay()}</Text>
              </View>

              {/* Centered Avatar with pulse rings */}
              <View style={styles.avatarWrapper}>
                <Animated.View style={[
                  styles.pulseRing, 
                  { 
                    transform: [{ scale: pulseScale1 }], 
                    opacity: pulseOpacity1 
                  }
                ]} />
                <Animated.View style={[
                  styles.pulseRing, 
                  { 
                    transform: [{ scale: pulseScale2 }], 
                    opacity: pulseOpacity2 
                  }
                ]} />
                {hasPic ? (
                  <Image 
                    source={{ uri: getAvatarUri(partnerPic) }}
                    style={styles.largeAvatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="account" size={90} color="#0099ff" />
                  </View>
                )}
              </View>

              {/* Spacing placeholder */}
              <View style={{ height: 60 }} />
            </View>
          )
        )}
      </TouchableOpacity>
      
      {/* Video Call local stream preview */}
      {localStream && isVideo && isCameraOn && (
        <Animated.View {...panResponder.panHandlers} style={[styles.localVideo, pan.getLayout()]}>
          <RTCView 
            streamURL={localStream.toURL()} 
            style={{ flex: 1 }} 
            mirror={isFrontCamera}
            zOrder={2}
          />
        </Animated.View>
      )}

      {/* Video call overlay header (Name + Timer) */}
      {remoteStream && isVideo && isVisible && (
        <View style={styles.videoHeaderOverlay}>
          <Text style={styles.videoPartnerName}>{partnerName || 'Legal Consultant'}</Text>
          <Text style={styles.videoTimerText}>{getStatusTextDisplay()}</Text>
        </View>
      )}
      
      {/* Interactive bottom control panel */}
      {isVisible && (
        <Animated.View style={[
          styles.controls, 
          isVideo ? styles.videoControls : styles.voiceControls, 
          { opacity: fadeAnim }
        ]}>
          
          {/* Mute Button */}
          <View style={styles.controlBtnWrapper}>
            <TouchableOpacity style={[styles.controlBtn, isMuted && styles.activeControlBtn]} onPress={toggleMute}>
              <Icon name={isMuted ? "microphone-off" : "microphone"} size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.controlLabel} numberOfLines={1}>Mute</Text>
          </View>

          {/* Speaker (Voice) or Flip Camera (Video) */}
          {isVideo ? (
            <View style={styles.controlBtnWrapper}>
              <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
                <Icon name="camera-flip" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.controlLabel} numberOfLines={1}>Flip</Text>
            </View>
          ) : (
            <View style={styles.controlBtnWrapper}>
              <TouchableOpacity style={[styles.controlBtn, isSpeakerOn && styles.activeControlBtn]} onPress={toggleSpeaker}>
                <Icon name={isSpeakerOn ? "volume-high" : "volume-mute"} size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.controlLabel} numberOfLines={1}>Speaker</Text>
            </View>
          )}

          {/* Camera On/Off Toggle (Video) */}
          {isVideo && (
            <View style={styles.controlBtnWrapper}>
              <TouchableOpacity style={[styles.controlBtn, !isCameraOn && styles.activeControlBtn]} onPress={toggleCameraOnOff}>
                <Icon name={isCameraOn ? "camera" : "camera-off"} size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.controlLabel} numberOfLines={1}>Video</Text>
            </View>
          )}

          {/* Hangup Red Button */}
          <View style={styles.controlBtnWrapper}>
            <TouchableOpacity style={styles.endCall} onPress={endCall}>
              <Icon name="phone-hangup" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.controlLabel} numberOfLines={1}>Hang Up</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000B21' }, // Navy Black
  remoteVideo: { flex: 1, backgroundColor: '#000B21' },
  localVideo: { 
    width: 100, 
    height: 150, 
    position: 'absolute', 
    top: 60, 
    right: 20, 
    zIndex: 99999,
    elevation: 99999,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backgroundColor: '#000',
  },
  voiceCallContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  statusContainer: { 
    alignItems: 'center', 
    marginTop: 10,
  },
  partnerName: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: 0.5 },
  statusText: { color: '#0099ff', fontSize: 16, marginTop: 8, fontWeight: '600' }, // Info Blue
  avatarWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 30,
  },
  largeAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#0099ff', // Info Blue
    backgroundColor: '#001A4D', // Brand Navy
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#0099ff', // Info Blue
    backgroundColor: '#001A4D', // Brand Navy
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#0099ff',
    zIndex: -1,
  },
  encryptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 26, 77, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  encryptionText: {
    color: '#94a3b8',
    fontSize: 12.5,
    marginLeft: 6,
    fontWeight: '500',
  },
  videoHeaderOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 999,
  },
  videoPartnerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  videoTimerText: {
    color: '#0099ff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  controls: { 
    position: 'absolute', 
    bottom: 40, 
    left: 15,
    right: 15,
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  voiceControls: {
    backgroundColor: '#001A4D', // Brand Navy
  },
  videoControls: {
    backgroundColor: 'rgba(0, 26, 77, 0.8)', // Navy with alpha
  },
  endCall: { 
    backgroundColor: '#ff3333', // Danger Red
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
  },
  activeControlBtn: {
    backgroundColor: '#0099ff', // Info Blue
  },
  controlBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default CallScreen;
