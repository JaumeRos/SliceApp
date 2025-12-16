import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { H1, H2, P1 } from './Text';
import { Button } from './Button';
import { colors, spacing, layout } from '../theme';

interface OnboardingCompleteModalProps {
  visible: boolean;
  tennisLevel: string;
  levelScore: string;
  onClose: () => void;
}

export const OnboardingCompleteModal: React.FC<OnboardingCompleteModalProps> = ({
  visible,
  tennisLevel,
  levelScore,
  onClose,
}) => {
  const getLevelIcon = () => {
    switch (tennisLevel) {
      case 'Pro': return 'trophy';
      case 'Advanced': return 'star';
      case 'Intermediate': return 'medal';
      default: return 'tennis';
    }
  };

  const getLevelColor = () => {
    switch (tennisLevel) {
      case 'Pro': return colors.warning;
      case 'Advanced': return colors.primary;
      case 'Intermediate': return '#8B5CF6';
      default: return colors.grey;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={colors.grey} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${getLevelColor()}20` }]}>
            <Icon name={getLevelIcon()} size={80} color={getLevelColor()} />
          </View>

          {/* Title */}
          <H1 style={styles.title}>Welcome to SliceApp!</H1>
          
          {/* Score */}
          <View style={styles.scoreContainer}>
            <P1 style={styles.scoreLabel}>Your Tennis Level</P1>
            <H2 style={[styles.level, { color: getLevelColor() }]}>{tennisLevel}</H2>
            <View style={styles.scoreBox}>
              <Icon name="tennis-ball" size={24} color={colors.primary} />
              <H1 style={styles.score}>{levelScore}</H1>
              <P1 style={styles.scoreMax}>/7.0</P1>
            </View>
          </View>

          {/* Description */}
          <P1 style={styles.description}>
            Start tracking your matches to improve your ranking and compete with players at your level!
          </P1>

          {/* CTA Button */}
          <Button
            title="Start Tracking Matches"
            onPress={onClose}
            fullWidth
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  scoreLabel: {
    color: colors.grey,
    marginBottom: spacing.xs,
  },
  level: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.hyperLightGrey,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreMax: {
    fontSize: 24,
    color: colors.grey,
    marginTop: spacing.md,
  },
  description: {
    textAlign: 'center',
    color: colors.darkGrey,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});

