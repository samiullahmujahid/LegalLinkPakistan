import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../theme/theme';
import { styles } from './Header.styles';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  leftElement,
  rightElement,
  onBackPress,
  backgroundColor = COLORS.primary,
  textColor = COLORS.white,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[
      styles.headerContainer, 
      { 
        backgroundColor, 
        paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 15,
        paddingBottom: 15
      }
    ]}>
      <View style={styles.mainLeftContent}>
        {(leftElement || showBackButton) && (
          <View style={styles.leftContainer}>
            {leftElement ? (
              leftElement
            ) : (
              <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.7}>
                <Icon name="arrow-back-outline" size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[
          styles.titleContainer,
          (leftElement || showBackButton) ? { marginLeft: 10 } : { marginLeft: 0 }
        ]}>
          <Text style={[styles.titleText, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightElement || null}
      </View>
    </View>
  );
};

export default Header;
