import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const ClientStyles = StyleSheet.create({
  // ==========================================
  // MAIN LAYOUT & COMMON
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001a4d',
    marginBottom: 15,
  },

  // ==========================================
  // HEADERS & NAVIGATION
  // ==========================================
  header: {
    backgroundColor: '#001a4d',
    paddingHorizontal: 20,
    height: 80,
    justifyContent: 'center',
    paddingTop: 20, // Status bar adjustment
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#001a4d',
    justifyContent: 'space-around',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },

  // ==========================================
  // AI COMPONENTS
  // ==========================================
  aiIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
  },
  aiText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  sparkle: {
    marginBottom: 10,
    marginLeft: -2,
  },

  // ==========================================
  // DASHBOARD CARDS
  // ==========================================
  card: {
    backgroundColor: '#D9D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#001a4d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '700',
    color: '#001a4d',
  },

  // ==========================================
  // BRANDING & FORMS (Signup/Login / Form Common)
  // ==========================================
  logo: {
    width: 120,
    height: 120,
    marginTop: 40,
    resizeMode: 'contain',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001a4d',
    marginTop: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  form: {
    width: '90%',
    marginTop: 10,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#001a4d',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
  },

  // ==========================================
  // MERGED IMAGE DESIGN SPECIFIC: LIGHT-GREY INPUT TUNING
  // ==========================================
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#001a4d',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
    height: 48,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#001a4d',
    marginBottom: 10,
  },
  halfDropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#001a4d',
    marginBottom: 10,
    width: '48%',
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#001a4d',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: '#000',
    fontSize: 14,
    height: 120,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },

  // ==========================================
  // MERGED IMAGE DESIGN SPECIFIC: APPOINT A LAWYER LIST
  // ==========================================
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  subHeadingText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  lawyerCard: { 
    flexDirection: 'row',
    backgroundColor: '#001a4d', // Solid Dark Blue card background from screenshot
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  selectedLawyerCard: {
    borderWidth: 2,
    borderColor: '#ffcc00', // Yellow highlight indicator on active selection
    backgroundColor: '#002673',
  },
  lawyerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lawyerInfo: { 
    flex: 1 
  },
  lawyerNameText: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#fff' 
  },
  lawyerMetaText: {
    fontSize: 11,
    color: '#ccc',
    marginTop: 1,
  },
  ratingRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: { 
    fontSize: 11, 
    color: '#fff', 
    marginLeft: 4, 
  },
  selectButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedButtonActive: {
    backgroundColor: '#ffcc00',
  },
  selectButtonText: {
    color: '#001a4d',
    fontSize: 12,
    fontWeight: '700',
  },
  selectedButtonTextActive: {
    color: '#000',
  },

  // ==========================================
  // BUTTONS & SUBMISSIONS
  // ==========================================
  button: {
    backgroundColor: '#001a4d',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#001a4d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 25,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: '#ffffff',
  },
  nextActionButton: {
    backgroundColor: '#001a4d',
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextActionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },

  // ==========================================
  // LAWYER PROFILE DETAIL SCREEN STYLES
  // ==========================================
  profileHeaderContainer: {
    backgroundColor: '#001a4d',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  profileAvatarBox: {
    backgroundColor: '#fff',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  profileMainName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileSubText: {
    fontSize: 14,
    color: '#ffcc00',
    fontWeight: '600',
    marginBottom: 10,
  },
  profileRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  profileRatingNum: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  counterCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  counterIconBox: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 12,
  },
  counterInfo: {
    marginLeft: 15,
    flex: 1,
  },
  counterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d9534f',
    marginTop: 2,
  },
  detailsSection: {
    padding: 20,
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001a4d',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    textAlign: 'justify',
  },
  infoGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 5,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  gridLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  gridValue: {
    fontSize: 14,
    color: '#001a4d',
    fontWeight: '700',
  },
  profileFeeText: {
    fontSize: 14,
    color: '#00cc66',
    fontWeight: '700',
  },
  footerButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  primaryActionButton: {
    backgroundColor: '#001a4d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  // ==========================================
  // CASE DETAILS COMPONENT FALLBACK (PREVIOUS)
  // ==========================================
  briefLawyerTag: {
    backgroundColor: '#e6f0ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#001a4d',
  },
  briefLawyerTitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  briefLawyerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001a4d',
    marginTop: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001a4d',
    marginBottom: 6,
    marginTop: 10,
  },

  // ==========================================
  // APPOINTMENT STATUS TRACKING SCREEN STYLES
  // ==========================================
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statusIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadgePending: { backgroundColor: '#fff3cd' }, 
  statusBadgeAccepted: { backgroundColor: '#d4edda' }, 
  statusBadgeRejected: { backgroundColor: '#f8d7da' }, 

  statusCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001a4d',
    textAlign: 'center',
    marginBottom: 6,
  },
  statusCardSubText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  briefPreviewBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    marginTop: 5,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
    textTransform: 'uppercase',
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001a4d',
    marginTop: 2,
    marginBottom: 10,
  },
  previewDesc: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    marginTop: 2,
  },
  statusSecondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#001a4d',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  statusSecondaryBtnText: {
    color: '#001a4d',
    fontSize: 14,
    fontWeight: '700',
  },
  statusActionBtnAccepted: {
    backgroundColor: '#00cc66', 
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
    elevation: 3,
  },
  statusActionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  statusActionBtnRejected: {
    backgroundColor: '#d9534f', 
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
    elevation: 3,
  },
  
  // Backward compatibility style wrapper for old discovery layouts
  infoBanner: {
    backgroundColor: '#e6f0ff',
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  infoBannerText: { 
    color: '#001a4d', 
    fontSize: 13, 
    marginLeft: 6 
  },
  listContent: { 
    padding: 16 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    color: '#888', 
    fontSize: 14 
  },
  specializationText: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 4 
  },
  feeText: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#00cc66' 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 12,
    marginTop: 4 
  },
  locLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  locationText: { 
    fontSize: 13, 
    color: '#555', 
    marginLeft: 4 
  },

  // ==========================================
  // 🔥 DYNAMIC CLIENT-SIDE TRACKING TABS ATTRIBUTES
  // ==========================================
  trackingTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 6,
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  trackingTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  trackingActiveTabButton: {
    backgroundColor: '#001a4d',
  },
  trackingTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  trackingActiveTabText: {
    color: '#ffffff',
  },
  trackingLoaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  trackingEmptyBox: {
    alignItems: 'center',
    marginTop: 80,
    width: '100%',
  },
  trackingEmptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  }
});