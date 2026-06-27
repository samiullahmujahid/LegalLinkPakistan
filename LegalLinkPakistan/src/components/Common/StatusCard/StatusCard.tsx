import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StatusCardProps {
  title: string;
  avatarUri?: string | null;
  line1?: string;
  line2?: string;
  timeAgo?: string;
  onPress: () => void;
  theme?: 'dark' | 'light';
  containerStyle?: any;
  selected?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  avatarUri,
  line1,
  line2,
  timeAgo,
  onPress,
  theme = 'dark',
  containerStyle,
  selected = false,
}) => {
  const isDark = theme === 'dark';
  
  return (
    <View style={[
      styles.cardContainer, 
      isDark ? styles.darkCard : styles.lightCard, 
      selected && { borderWidth: 2, borderColor: isDark ? '#ffffff' : '#001a4d', opacity: 0.6 },
      containerStyle
    ]}>
      {timeAgo && <Text style={[styles.timeTag, isDark ? styles.darkText : styles.lightTextSecondary]}>{timeAgo}</Text>}

      <View style={styles.leftSection}>
        <View style={[styles.avatarWrapper, isDark ? styles.darkAvatarWrapper : styles.lightAvatarWrapper]}>
          {avatarUri ? (
            <Image 
              source={{ uri: avatarUri }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : (
            <Icon name="account" size={32} color={isDark ? '#001a4d' : '#94a3b8'} />
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.titleText, isDark ? styles.darkText : styles.lightTextTitle]} numberOfLines={1}>
            {title || "Unknown"}
          </Text>
          
          {line1 && (
            <Text style={[styles.metaText, isDark ? styles.darkMeta : styles.lightMeta]}>
              {line1}
            </Text>
          )}
          
          {line2 && (
            <Text style={[styles.metaText, isDark ? styles.darkMeta : styles.lightMeta]}>
              {line2}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.detailsButton, isDark ? styles.darkButton : styles.lightButton]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.detailsButtonText, isDark ? styles.darkButtonText : styles.lightButtonText]}>Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  darkCard: {
    backgroundColor: '#001a4d',
  },
  lightCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  darkAvatarWrapper: {
    backgroundColor: '#ffffff',
  },
  lightAvatarWrapper: {
    backgroundColor: '#f1f5f9',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  darkText: {
    color: '#ffffff',
  },
  lightTextTitle: {
    color: '#001a4d',
  },
  metaText: {
    fontSize: 12,
    marginTop: 2,
  },
  darkMeta: {
    color: '#e2e8f0',
  },
  lightMeta: {
    color: '#64748b',
  },
  timeTag: {
    position: 'absolute',
    top: 8,
    right: 16,
    fontSize: 10,
    fontWeight: '600',
  },
  lightTextSecondary: {
    color: '#64748b',
  },
  detailsButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkButton: {
    backgroundColor: '#ffffff',
  },
  lightButton: {
    backgroundColor: '#001a4d',
  },
  detailsButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  darkButtonText: {
    color: '#001a4d',
  },
  lightButtonText: {
    color: '#ffffff',
  },
});

export default StatusCard;
