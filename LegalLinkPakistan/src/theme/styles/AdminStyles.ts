import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const AdminStyles = StyleSheet.create({
  // ==========================================
  // MAIN LAYOUT & COMMON
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  scrollContent: { 
    padding: 15,
    paddingBottom: 40 
  },
  loader: {
    marginTop: 20,
  },

  // ==========================================
  // HEADERS & NAVIGATION
  // ==========================================
  header: { 
    backgroundColor: '#001a4d', 
    paddingHorizontal: 20, 
    height: 100, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 30, 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  backBtnHeader: { 
    padding: 5 
  },
  backBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#001a4d',
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  backText: {
    color: '#001a4d',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // ==========================================
  // LOGIN & BRANDING
  // ==========================================
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001a4d',
  },
  screenTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
    fontWeight: '500',
  },

  // ==========================================
  // INPUTS & VALIDATION
  // ==========================================
  inputWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
    marginLeft: 5,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1.5,
  },

  // ==========================================
  // DASHBOARD ACTION CARDS & STATS
  // ==========================================
  sectionHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#001a4d', 
    marginBottom: 15,
    marginTop: 10 
  },
  actionCard: { 
    backgroundColor: '#001a4d', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 25, 
    paddingHorizontal: 20,
    borderRadius: 15, 
    marginBottom: 20,
    elevation: 8,
  },
  mainIcon: { 
    marginRight: 15 
  },
  actionText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
    flexShrink: 1 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  statsCard: { 
    backgroundColor: '#001a4d', 
    width: '48%', 
    padding: 15, 
    borderRadius: 15,
    height: 100,
    justifyContent: 'center',
    elevation: 6,
  },
  statsTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statsLabel: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  statsValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  // ==========================================
  // VERIFICATION & OTP
  // ==========================================
  verifyHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001a4d',
  },
  subTitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginVertical: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1.2,
    borderColor: '#001a4d',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#001a4d',
  },

  // ==========================================
  // BUTTONS
  // ==========================================
  button: {
    backgroundColor: '#001a4d',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ==========================================
  // LISTING CARDS & SEARCH
  // ==========================================
  searchSection: { padding: 15 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    borderRadius: 12, 
    paddingHorizontal: 15,
    elevation: 4,
  },
  searchInput: { flex: 1, height: 48, color: '#000', marginLeft: 10 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#001a4d',
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileImg: { width: 60, height: 60, borderRadius: 30 },
  placeholderImg: { backgroundColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center' },
  details: { marginLeft: 12, flex: 1 },
  lawyerName: { color: '#001a4d', fontSize: 16, fontWeight: 'bold' },
  subText: { color: '#6c757d', fontSize: 13 },
  checkBtn: { backgroundColor: '#001a4d', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // ==========================================
  // BOTTOM NAVIGATION & EMPTY STATE
  // ==========================================
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#001a4d', 
    paddingVertical: 12, 
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
  },
  navItem: { alignItems: 'center' },
  aiContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  aiText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  sparkle: { marginBottom: 12, marginLeft: -2 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 14 },

  // ==========================================
  // LAWYER DETAIL VERIFICATION SPECIFIC
  // ==========================================
  infoCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    elevation: 2, 
    marginBottom: 15 
  },
  docCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    elevation: 2, 
    marginBottom: 15 
  },
  sectionLabel: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#001a4d', 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 5 
  },
  detailText: { 
    fontSize: 14, 
    color: '#444', 
    marginBottom: 5 
  },
  bold: { 
    fontWeight: 'bold', 
    color: '#000' 
  },
  licenseImg: { 
    width: '100%', 
    height: 300, 
    borderRadius: 8, 
    marginTop: 10 
  },
  noDoc: { 
    height: 200, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8 
  },
  reasonInput: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    padding: 10, 
    height: 80, 
    textAlignVertical: 'top',
    color: '#000',
    marginBottom: 10
  },
  btnRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 
  },
  actionBtn: { 
    flex: 0.48, 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  approveBtn: { 
    backgroundColor: '#28a745' 
  },
  rejectBtn: { 
    backgroundColor: '#dc3545' 
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});