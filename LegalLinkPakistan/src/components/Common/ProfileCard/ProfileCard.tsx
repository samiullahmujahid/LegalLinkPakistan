import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileCardProps {
  userData: {
    _id: string;
    name: string;
    role?: 'Lawyer' | 'Client';
    enNo?: string;
    city?: string;
    rating?: number | string;
    expertise?: string;
    address?: string;
    profilePicUri?: string;
  };
  isSelected?: boolean;
  onSelectPress?: () => void;
  onCheckPress?: () => void;
  rightButtonText?: string;
  showActiveCount?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  userData,
  isSelected = false,
  onSelectPress,
  onCheckPress,
  rightButtonText = 'Select',
  showActiveCount = true,
}) => {
  const BASE_URL = 'https://mug-work-public.ngrok-free.dev';
  
  // Safely check the role, with case-insensitivity and trimming
  const role = userData.role ? userData.role.toString().trim() : '';
  const isLawyer = role.toLowerCase() === 'lawyer';

  const getRating = () => {
    const val = Number(userData.rating || 0);
    return isNaN(val) ? 0 : val;
  };

  const getCardImageSource = () => {
    const rawPath = userData?.profilePicUri || (userData as any)?.profilePic;
    if (!rawPath) return null;
    const cleanPath = rawPath.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return { uri: cleanPath };
    const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
    return { uri: `${BASE_URL}/${finalPath}` };
  };

  const imageSource = getCardImageSource();

  return (
    <View style={[styles.card, isSelected && styles.selectedCard]}>
      <View style={styles.leftSection}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.avatar} resizeMode="cover" />
          ) : (
            <Icon name="account" size={32} color="#001a4d" />
          )}
        </View>

        <View style={styles.infoSection}>
          {/* Sahi Name Logic */}
          <Text style={styles.nameText}>
            {isLawyer ? `Adv. ${userData.name}` : userData.name}
          </Text>

          {/* Role-based Subtext */}
          {isLawyer ? (
            <Text style={styles.subText}>{userData.expertise || 'Legal Expert'}</Text>
          ) : (
            <Text style={styles.subText} numberOfLines={1}>
              <Icon name="map-marker" size={12} color="#666" /> {userData.address || userData.city || 'N/A'}
            </Text>
          )}
          
          {isLawyer && (
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i} 
                  name={i < getRating() ? "star" : "star-outline"} 
                  size={14} 
                  color="#ffcc00" 
                />
              ))}
              <Text style={styles.ratingText}> ({getRating()})</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonSection}>
        {onSelectPress && (
          <TouchableOpacity style={[styles.btn, isSelected && styles.btnActive]} onPress={onSelectPress}>
            <Text style={styles.btnText}>{isSelected ? 'Selected' : rightButtonText}</Text>
          </TouchableOpacity>
        )}
        
        {onCheckPress && (
          <TouchableOpacity style={[styles.btn, { marginTop: 5, backgroundColor: '#666' }]} onPress={onCheckPress}>
            <Text style={styles.btnText}>Check Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginVertical: 8, borderWidth: 1, borderColor: '#e1e4e8', elevation: 3 },
  selectedCard: { borderColor: '#001a4d', backgroundColor: '#f0f4ff' },
  leftSection: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  imageContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  infoSection: { marginLeft: 15, flex: 1 },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#001a4d' },
  subText: { fontSize: 13, color: '#555', marginTop: 2 },
  ratingRow: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#888', marginLeft: 5 },
  buttonSection: { justifyContent: 'center', alignItems: 'center' },
  btn: { 
    backgroundColor: '#001a4d', 
    width: 110,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16
  },
  btnActive: { backgroundColor: '#28a745' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }
});

const ProfileCardMemoized = React.memo(ProfileCard, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.userData?._id === nextProps.userData?._id &&
    prevProps.userData?.name === nextProps.userData?.name &&
    prevProps.userData?.rating === nextProps.userData?.rating &&
    prevProps.userData?.expertise === nextProps.userData?.expertise &&
    prevProps.userData?.profilePicUri === nextProps.userData?.profilePicUri &&
    prevProps.rightButtonText === nextProps.rightButtonText &&
    prevProps.showActiveCount === nextProps.showActiveCount
  );
});

export default ProfileCardMemoized;