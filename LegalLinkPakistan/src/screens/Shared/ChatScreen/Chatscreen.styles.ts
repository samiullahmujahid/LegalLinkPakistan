import { StyleSheet, Platform } from 'react-native';

export const chatStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f4fa' // Soft brand blue-gray tint
  },
  header: {
    backgroundColor: '#001a4d', // Brand color
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#00000020',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700', 
    marginLeft: 5 
  },
  headerSubTitle: {
    color: '#d1e0fc',
    fontSize: 11,
    marginLeft: 5,
    fontWeight: '400',
    marginTop: 1,
  },
  headerIcons: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  // Date Header Separators
  dateHeaderContainer: {
    alignSelf: 'center',
    marginVertical: 12,
    backgroundColor: '#fffef0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateHeaderText: {
    color: '#5c6d75',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Call logs
  callLogContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    backgroundColor: '#fffef0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  callLogText: { 
    color: '#555', 
    fontSize: 12, 
    marginLeft: 5, 
    fontWeight: '500' 
  },

  // WhatsApp-style message bubbles
  msgBubble: {
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    marginVertical: 3,
    marginHorizontal: 12, 
    maxWidth: '82%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  myMsg: { 
    backgroundColor: '#e1eafd', // Soft brand light blue
    alignSelf: 'flex-end', 
    borderTopRightRadius: 2,
  },
  theirMsg: { 
    backgroundColor: '#ffffff', // Clean white
    alignSelf: 'flex-start', 
    borderTopLeftRadius: 2,
  },
  myMsgText: { 
    color: '#001a4d', // Brand dark navy text
    fontSize: 15.5,
    lineHeight: 21
  },
  theirMsgText: { 
    color: '#111', 
    fontSize: 15.5,
    lineHeight: 21
  },

  // Message metadata (time & checkmarks)
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginTop: 2,
    marginLeft: 25,
  },
  msgTimeText: { 
    fontSize: 10.5, 
    color: '#667781',
  },
  checkmarkIcon: {
    marginLeft: 3,
  },

  // Audio Playback Bubbles
  audioBubbleWhatsapp: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    minWidth: 230,
    maxWidth: '82%',
    marginVertical: 3,
    marginHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  audioPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioSliderContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 5,
  },
  audioWaveformSim: {
    height: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
  },
  waveformBar: {
    width: 2.5,
    backgroundColor: '#8696a0',
    borderRadius: 1,
  },
  audioTimeAndStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  audioDurationText: {
    fontSize: 10,
    color: '#667781',
  },

  // WhatsApp-style Split Input Bar
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    minHeight: 46,
    maxHeight: 120,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'android' ? 6 : 10,
    maxHeight: 100,
  },
  inputIcon: {
    padding: 6,
  },
  floatingButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#001a4d', // LegalLink theme deep blue
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  // Reply preview banner above input bar
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#001a4d',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  replyPreviewContent: {
    flex: 1,
    paddingRight: 6,
  },
  replyPreviewTitle: {
    color: '#001a4d',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  replyPreviewText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  replyPreviewCancel: {
    padding: 4,
  },

  // Quoted Box inside Message Bubbles
  quotedBox: {
    backgroundColor: 'rgba(0, 26, 77, 0.07)',
    borderLeftWidth: 3,
    borderLeftColor: '#001a4d',
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
  },
  quotedName: {
    color: '#001a4d',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  quotedText: {
    color: '#475569',
    fontSize: 12,
    marginTop: 1,
  },

  // Recording bar UI
  recordingPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 46,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#ff3b30',
  },
  recordingTimer: {
    color: '#ff3b30',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingText: {
    color: '#8696a0',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  recordingCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cancelText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
});
