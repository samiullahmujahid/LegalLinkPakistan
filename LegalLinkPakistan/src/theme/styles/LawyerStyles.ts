import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const LawyerStyles = StyleSheet.create({
  // ==========================================
  // MAIN LAYOUT & COMMON
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center'
  },
  form: {
    width: '88%',
    marginTop: 10
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  // ==========================================
  // HEADERS, BRANDING & BOOKING HEADERS
  // ==========================================
  headerSection: {
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 10,
    width: '100%',
    paddingHorizontal: 20
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain'
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001a4d',
    marginTop: 10
  },
  subTitle: {
    fontSize: 16,
    color: '#001a4d',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center'
  },
  bookingHeader: {
    backgroundColor: '#001a4d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60
  },
  bookingHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },

  // ==========================================
  // NAVIGATION, UTILITIES & ACTION BUTTONS
  // ==========================================
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#001a4d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  backText: {
    color: '#001a4d',
    fontSize: 12,
    fontWeight: 'bold'
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4fa',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#001a4d',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#001a4d',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    width: '100%',
    elevation: 3
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  nextActionButton: {
    backgroundColor: '#001a4d',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },

  // ==========================================
  // INPUTS, DROPDOWNS & VALIDATION RULES
  // ==========================================
  fieldLabel: {
    fontSize: 14,
    color: '#001a4d',
    marginBottom: 8,
    fontWeight: 'bold',
    marginTop: 15
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  regInput: {
    borderWidth: 1,
    borderColor: '#001a4d',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: '#000',
    fontSize: 14,
    height: 48,
    backgroundColor: '#fff'
  },
  input: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
    color: '#000',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  textAreaInput: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#000',
    fontSize: 14,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1.5
  },
  errorHint: {
    fontSize: 11,
    color: 'red',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 5,
    fontWeight: '500'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  placeholderStyle: { color: '#777', fontSize: 14 },
  selectedTextStyle: { color: '#000', fontSize: 14 },

  // ==========================================
  // Custom Section layouts
  // ==========================================
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001a4d',
  },
  subHeadingText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },

  // ==========================================
  // LAWYER CARD REUSABLE ELEMENT STYLES
  // ==========================================
  lawyerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  selectedLawyerCard: {
    borderColor: '#001a4d',
    borderWidth: 2,
    backgroundColor: '#f0f4ff',
  },
  lawyerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  lawyerMetaText: {
    fontSize: 11,
    color: '#555',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#001a4d',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  selectedButtonActive: {
    backgroundColor: '#00cc66',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedButtonTextActive: {
    color: '#fff',
  },

  // ==========================================
  // PROFILE / PORTFOLIO CORES
  // ==========================================
  profileHeaderContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f5',
    marginBottom: 20,
  },
  profileAvatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileMainName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001a4d',
  },
  profileSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  profileRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  profileRatingNum: {
    fontSize: 13,
    color: '#444',
    marginLeft: 5,
    fontWeight: '600',
  },
  counterCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    marginBottom: 20,
  },
  counterIconBox: {
    marginRight: 12,
  },
  counterInfo: {
    flex: 1,
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d9534f',
  },
  counterValue: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bioText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginTop: 5,
  },
  infoGrid: {
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edeef0',
  },
  gridLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  gridValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  footerButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryActionButton: {
    backgroundColor: '#001a4d',
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // ==========================================
  // UPLOAD SECTION & STATUS BOX
  // ==========================================
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#001a4d',
    borderStyle: 'dashed',
    borderRadius: 15,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    backgroundColor: '#f9f9f9',
    width: '100%',
    position: 'relative'
  },
  requiredStar: {
    color: 'red',
    position: 'absolute',
    top: 5,
    right: 10,
    fontSize: 18,
    fontWeight: 'bold'
  },
  uploadText: {
    color: '#001a4d',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600'
  },
  previewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'cover'
  },
  statusContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#001a4d',
    borderRadius: 15,
    paddingVertical: 35,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 30,
    alignSelf: 'center'
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001a4d',
    marginBottom: 10
  },
  statusText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001a4d',
    marginBottom: 10,
    marginTop: 10
  },

  // ==========================================
  // OLD BASE DASHBOARDS & PORTALS
  // ==========================================
  header: {
    backgroundColor: '#001a4d',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#002666',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  menuBox: {
    backgroundColor: '#f8f9fa',
    width: width * 0.88,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    backgroundColor: '#001a4d',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001a4d',
  },

  // ========================================================
  // LAWYER MODULE: CLIENT APPOINTMENT REQUESTS SCREEN STYLES
  // ========================================================
  requestContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  reqBookingHeader: {
    backgroundColor: '#001a4d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60
  },
  reqBookingHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  requestCard: {
    backgroundColor: '#001a4d', // Synchronized exactly with your polymorphic layout
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  reqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  clientMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginRight: 12,
  },
  clientNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: 'transparent',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  reqCaseTitle: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 1,
  },
  reqCaseDesc: {
    fontSize: 14,
    color: '#fff',
  },
  reqActionRow: {
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  acceptBtnText: {
    color: '#001a4d',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: '#d9534f',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  rejectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyReqText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
    fontSize: 14
  }
});
