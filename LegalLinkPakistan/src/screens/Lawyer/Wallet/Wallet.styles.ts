import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { alignItems: 'center', marginVertical: 20 },
  subTitle: { fontSize: 14, color: '#888' },
  balance: { fontSize: 40, fontWeight: 'bold', color: '#001a4d' },
  stripeConnectedCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stripeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stripeStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065f46',
    marginLeft: 8,
  },
  stripeStatusDetails: {
    fontSize: 12,
    color: '#047857',
    marginLeft: 28,
  },
  stripePromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stripePromoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  stripePromoDesc: {
    fontSize: 12,
    color: '#64748b',
    paddingRight: 12,
  },
  stripeLinkButton: {
    backgroundColor: '#001a4d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  stripeLinkText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  cardLabel: { fontSize: 12, color: '#555', marginTop: 10 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  caseName: { fontWeight: '600', fontSize: 14 },
  amount: { color: '#2e7d32', fontWeight: 'bold' }
});

export default styles;
