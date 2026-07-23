import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../../theme/theme';
import { styles } from './MyButton.styles';

interface MyButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const MyButton: React.FC<MyButtonProps> = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  disabled = false 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.defaultButton,
        { backgroundColor: disabled ? '#ccc' : '#001a4d' },
        style
      ]}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyButton;
