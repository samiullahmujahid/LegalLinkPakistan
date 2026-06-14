import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONTS,
} from '../../../theme/theme';

interface RatingAlertProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

const AlertComponent: React.FC<RatingAlertProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, review);

    setRating(0);
    setReview('');
    onClose();
  };

  const handleCancel = () => {
    setRating(0);
    setReview('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Rate Lawyer
          </Text>

          <Text style={styles.subtitle}>
            Please share your experience with this lawyer.
          </Text>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => setRating(item)}
                activeOpacity={0.8}
              >
                <Icon
                  name={
                    item <= rating
                      ? 'star'
                      : 'star-outline'
                  }
                  size={38}
                  color="#FFC107"
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Write your review..."
            placeholderTextColor={COLORS.gray}
            multiline
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>
                CANCEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                SEND REVIEW
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AlertComponent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
  },

  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.l,
  },

  title: {
    fontSize: FONTS.h2,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: FONTS.body,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.s,
  },

  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
    marginBottom: SPACING.l,
  },

  star: {
    marginHorizontal: 4,
  },

  input: {
    minHeight: 130,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    color: COLORS.text,
    fontSize: 15,
    backgroundColor: COLORS.white,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.l,
  },

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.s,
  },

  cancelText: {
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 14,
  },

  submitText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});