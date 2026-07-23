import React from 'react';
import { View, TextInput, Text, StyleProp, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { COLORS } from '../../../theme/theme';
import { styles } from './MyInput.styles';

interface MyInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  containerStyle?: StyleProp<ViewStyle>; 
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
}

export const MyInput: React.FC<MyInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  containerStyle,
  inputStyle,
  multiline = false,
  numberOfLines,
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.defaultContainer, 
        multiline ? { height: 100, paddingTop: 10, paddingBottom: 10 } : null,
        error ? styles.errorBorder : null,
      ]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.defaultInput, multiline ? { textAlignVertical: 'top', height: '100%' } : null, inputStyle]}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default MyInput;
