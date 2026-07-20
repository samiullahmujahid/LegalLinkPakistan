import { StyleSheet } from 'react-native';

export const cardStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#f8f9fa', // Light subtle gray matching dashboard grid
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
  },
  iconBox: {
    backgroundColor: '#001a4d', // Solid Dark Blue from LegalLink Palette
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    color: '#001a4d',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
});
