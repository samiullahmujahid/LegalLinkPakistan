import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotifications } from '../NotificationProvider';
import { COLORS } from '../../../theme/theme';
import { styles } from './NotificationIcon.styles';

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

export default NotificationIcon;
