import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { cardStyles as cs } from '././Card.styles';

interface CardProps {
  title: string;
  iconName: string;
  onPress: () => void;
}

const Card: React.FC<CardProps> = ({ title, iconName, onPress }) => {
  return (
    <TouchableOpacity style={cs.cardContainer} onPress={onPress} activeOpacity={0.7}>
      {/* Premium Dark Blue Icon Wrapper */}
      <View style={cs.iconBox}>
        <Icon name={iconName} size={28} color="#fff" />
      </View>
      
      {/* Title Text */}
      <Text style={cs.cardText} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Card;
