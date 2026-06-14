import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotifications } from './NotificationProvider';
import { COLORS } from '../../theme/theme';

interface NotificationIconProps {
  color?: string;
  badgeBorderColor?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ 
  color = '#ffffff', 
  badgeBorderColor = COLORS.primary 
}) => {
  const navigation = useNavigation<any>();
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('NotificationsScreen')} 
      style={styles.container}
      activeOpacity={0.7}
    >
      <Icon name="bell-ring-outline" size={26} color={color} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { borderColor: badgeBorderColor }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  }
});

export default NotificationIcon;
