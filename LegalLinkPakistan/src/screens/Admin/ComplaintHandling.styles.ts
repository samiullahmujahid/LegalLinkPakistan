import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', paddingVertical: 15, elevation: 2 },
    tabButton: { alignItems: 'center', paddingHorizontal: 20 },
    tabText: { fontSize: 16, color: '#888' },
    activeTabText: { color: '#001a4d', fontWeight: 'bold' },
    activeIndicator: { height: 3, width: '100%', backgroundColor: '#001a4d', marginTop: 5, borderRadius: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#999', fontSize: 16 }
});

export default styles;
