import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RequestCardStyles as styles } from './RequestCard.styles';

interface RequestCardProps {
  name: string;
  avatarUri?: string;
  line1Label: string;
  line1Value: string;
  line2Label: string;
  line2Value: string;
  timeAgo?: string;
  status: string;
  onPressDetails: () => void;
}

export default function RequestCard({
  name,
  avatarUri,
  line1Label,
  line1Value,
  line2Label,
  line2Value,
  timeAgo,
  status,
  onPressDetails,
}: RequestCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return '#00cc66';
      case 'pending': return '#ff9900';
      case 'confirmed': return '#0099ff';
      case 'rejected': return '#ff3333';
      case 'completed': return '#0099ff';
      default: return '#666';
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Time Tag */}
      {timeAgo && <Text style={styles.timeTag}>{timeAgo}</Text>}

      <View style={styles.leftSection}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image 
              source={{ uri: avatarUri }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : (
            <Icon name="account" size={32} color="#001a4d" />
          )}
        </View>
        
        <View style={styles.infoContainer}>
          {/* ✅ Name display fix: flex shrink diya gaya hai taake container se bahar na nikle */}
          <Text style={[styles.clientName, { flexShrink: 1 }]} ellipsizeMode="tail">
            {name || "Unknown"}
          </Text>
          
          <Text style={styles.metaText}>
            {line1Label}: {line1Value}
          </Text>
          
          <Text style={styles.metaText}>
            {line2Label}: {line2Value}
          </Text>
          
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            Status: {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailsButton} onPress={onPressDetails}>
        <Text style={styles.detailsButtonText}>Details</Text>
      </TouchableOpacity>
    </View>
  );
}