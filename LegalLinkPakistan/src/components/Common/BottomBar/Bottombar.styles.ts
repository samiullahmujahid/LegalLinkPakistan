import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#001a4d', 
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#002666',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 65,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
});