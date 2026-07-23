import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './StarRating.styles';

interface StarRatingProps {
  rating: number;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 15,
  activeColor = '#ffcc00',
  inactiveColor = '#cbd5e1',
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Icon key={i} name="star" size={size} color={activeColor} />
      );
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(
        <Icon key={i} name="star-half-full" size={size} color={activeColor} />
      );
    } else {
      stars.push(
        <Icon key={i} name="star-outline" size={size} color={inactiveColor} />
      );
    }
  }

  return <View style={styles.starRow}>{stars}</View>;
};

export default StarRating;
