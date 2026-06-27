import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { globalStyles } from '../../theme/globalStyles';
import { MyButton } from '../../components/Common/MyButton';

type RoleNavProp = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

const RoleSelectionScreen = ({ navigation }: { navigation: RoleNavProp }) => {
  const handleRoleSelect = (role: 'Client' | 'Lawyer' | 'Admin') => {
    navigation.navigate('Login', { role });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.inner}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.brandName}>Legal Link Pakistan</Text>
        </View>
        <Text style={globalStyles.instructionText}>Select a category:</Text>
        <MyButton title="Client" onPress={() => handleRoleSelect('Client')} style={{borderRadius: 25, marginBottom: 15}} />
        <MyButton title="Lawyer" onPress={() => handleRoleSelect('Lawyer')} style={{borderRadius: 25, marginBottom: 15}} />
        <MyButton title="Admin" onPress={() => handleRoleSelect('Admin')} style={{borderRadius: 25}} />
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;