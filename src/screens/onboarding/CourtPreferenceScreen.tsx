import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { H2, P1, Button } from '../../components';
import { colors, spacing, layout } from '../../theme';

interface CourtPreferenceScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const courtTypes = [
  { id: 'hard', label: 'Hard Court', icon: 'square' },
  { id: 'clay', label: 'Clay Court', icon: 'square-outline' },
  { id: 'grass', label: 'Grass Court', icon: 'grass' },
  { id: 'indoor', label: 'Indoor', icon: 'home' },
  { id: 'outdoor', label: 'Outdoor', icon: 'weather-sunny' },
];

export const CourtPreferenceScreen: React.FC<CourtPreferenceScreenProps> = ({ onNext, onBack }) => {
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);

  const toggleCourt = (courtId: string) => {
    if (selectedCourts.includes(courtId)) {
      setSelectedCourts(selectedCourts.filter(id => id !== courtId));
    } else {
      setSelectedCourts([...selectedCourts, courtId]);
    }
  };

  const handleNext = () => {
    onNext({ courtPreferences: selectedCourts });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <H2 style={styles.title}>Where do you usually play?</H2>
        <P1 style={styles.subtitle}>Select all that apply</P1>

        <View style={styles.optionsContainer}>
          {courtTypes.map((court) => (
            <TouchableOpacity
              key={court.id}
              style={[
                styles.option,
                selectedCourts.includes(court.id) && styles.optionSelected,
              ]}
              onPress={() => toggleCourt(court.id)}
            >
              <Icon 
                name={court.icon} 
                size={32} 
                color={selectedCourts.includes(court.id) ? colors.primary : colors.grey} 
              />
              <P1 style={[
                styles.optionText,
                selectedCourts.includes(court.id) && styles.optionTextSelected,
              ]}>
                {court.label}
              </P1>
              {selectedCourts.includes(court.id) && (
                <Icon name="check-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back"
          variant="ghost"
          onPress={onBack}
          style={styles.backButton}
        />
        <Button
          title="Next"
          onPress={handleNext}
          disabled={selectedCourts.length === 0}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
    paddingTop: spacing.xxxl,
  },
  title: {
    marginBottom: spacing.sm,
    color: colors.secondary,
  },
  subtitle: {
    color: colors.grey,
    marginBottom: spacing.xxxl,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.hyperLightGrey,
    padding: layout.cardPadding,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  optionText: {
    flex: 1,
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: layout.screenPadding,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

