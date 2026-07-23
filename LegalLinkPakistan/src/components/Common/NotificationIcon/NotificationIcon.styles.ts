import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/theme';

export const styles = StyleSheet.create({
  container: {
    padding: 4,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: COLORS.danger,
    borderRadius: 8.5,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: -1,
  },
});
