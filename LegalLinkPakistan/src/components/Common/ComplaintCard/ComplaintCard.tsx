import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ComplaintCardProps {
  clientName: string;
  lawyerName: string;
  subject: string;
  onPress: () => void;
  clientImage?: string | null; // Nullable handle karne ke liye
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
  clientName, 
  lawyerName, 
  subject, 
  onPress, 
  clientImage 
}) => {
  const baseUrl = 'https://mug-work-public.ngrok-free.dev';

  return (
    <View style={styles.cardContainer}>
      <View style={styles.avatarContainer}>
        {/* Valid image URL check: agar image string hai aur empty nahi hai */}
        {clientImage && typeof clientImage === 'string' && clientImage.length > 0 ? (
          <Image 
            source={{ uri: `${baseUrl}${clientImage}` }} 
            style={styles.avatarImage} 
            onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="account" size={24} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.subject} numberOfLines={1}>{subject}</Text>
        <Text style={styles.details}>
            <Text style={styles.bold}>C: </Text>{clientName}
        </Text>
        <Text style={styles.details}>
            <Text style={styles.bold}>L: </Text>{lawyerName}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.buttonText}>Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    marginHorizontal: 16, 
    marginVertical: 6, 
    borderWidth: 1, 
    borderColor: '#f0f0f0', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  avatarContainer: { marginRight: 12 },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#001a4d', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#eee' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  subject: { fontSize: 14, fontWeight: '700', color: '#001a4d', marginBottom: 2 },
  details: { color: '#555', fontSize: 12 },
  bold: { fontWeight: 'bold', color: '#001a4d' },
  button: { backgroundColor: '#001a4d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 11 }
});

export default ComplaintCard;