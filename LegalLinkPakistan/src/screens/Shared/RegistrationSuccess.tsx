import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
// Importing Icon from Vector Icons library
import Icon from 'react-native-vector-icons/FontAwesome5'; 

const RegistrationSuccess = ({ navigation }: any) => {
  
  useEffect(() => {
    // Auto-navigate to Login screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Using Vector Icon instead of Image file */}
        <View style={styles.iconCircle}>
           <Icon name="thumbs-up" size={70} color="#001a4d" />
        </View>
        
        <Text style={styles.successText}>Registered{"\n"}Successfully!!!</Text>
        
        <Text style={styles.brandName}>Legal Link Pakistan</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center' 
  },
  content: { 
    alignItems: 'center', 
    padding: 20 
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#001a4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#f8f9ff', // Light background to make the icon pop
    // Shadow for a professional look
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  successText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#001a4d', 
    textAlign: 'center',
    lineHeight: 35
  },
  brandName: { 
    fontSize: 20, 
    color: '#001a4d', 
    marginTop: 80, 
    fontWeight: 'bold',
    letterSpacing: 1
  }
});

export default RegistrationSuccess;
