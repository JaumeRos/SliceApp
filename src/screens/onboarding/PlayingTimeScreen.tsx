import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { H2, P1, Button } from '../../components';
import { colors, spacing, layout } from '../../theme';

interface PlayingTimeScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const frequencies = [
  { id: 'rarely', label: 'Rarely (Once a month or less)', icon: 'calendar-blank' },
  { id: 'sometimes', label: 'Sometimes (2-3 times a month)', icon: 'calendar' },
  { id: 'often', label: 'Often (Once a week)', icon: 'calendar-check' },
  { id: 'very-often', label: 'Very Often (2-3 times a week)', icon: 'calendar-multiple' },
  { id: 'daily', label: 'Daily', icon: 'calendar-star' },
];

const times = [
  { id: 'morning', label: 'Morning (6am - 12pm)', icon: 'weather-sunset-up' },
  { id: 'afternoon', label: 'Afternoon (12pm - 6pm)', icon: 'weather-sunny' },
  { id: 'evening', label: 'Evening (6pm - 10pm)', icon: 'weather-sunset-down' },
  { id: 'night', label: 'Night (10pm - 12am)', icon: 'weather-night' },
];

export const PlayingTimeScreen: React.FC<PlayingTimeScreenProps> = ({ onNext, onBack }) => {
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const toggleTime = (timeId: string) => {
    if (selectedTimes.includes(timeId)) {
      setSelectedTimes(selectedTimes.filter(id => id !== timeId));
    } else {
      setSelectedTimes([...selectedTimes, timeId]);
    }
  };

  const handleNext = () => {
    onNext({ 
      playingFrequency: selectedFrequency,
      preferredTimes: selectedTimes,
    });
  };

  const isValid = selectedFrequency && selectedTimes.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <H2 style={styles.title}>How often do you play?</H2>

        <View style={styles.section}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.option,
                selectedFrequency === freq.id && styles.optionSelected,
              ]}
              onPress={() => setSelectedFrequency(freq.id)}
            >
              <Icon 
                name={freq.icon} 
                size={28} 
                color={selectedFrequency === freq.id ? colors.primary : colors.grey} 
              />
              <P1 style={[
                styles.optionText,
                selectedFrequency === freq.id && styles.optionTextSelected,
              ]}>
                {freq.label}
              </P1>
              {selectedFrequency === freq.id && (
                <Icon name="check-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <H2 style={[styles.title, styles.secondTitle]}>What time do you usually play?</H2>
        <P1 style={styles.subtitle}>Select all that apply</P1>

        <View style={styles.section}>
          {times.map((time) => (
            <TouchableOpacity
              key={time.id}
              style={[
                styles.option,
                selectedTimes.includes(time.id) && styles.optionSelected,
              ]}
              onPress={() => toggleTime(time.id)}
            >
              <Icon 
                name={time.icon} 
                size={28} 
                color={selectedTimes.includes(time.id) ? colors.primary : colors.grey} 
              />
              <P1 style={[
                styles.optionText,
                selectedTimes.includes(time.id) && styles.optionTextSelected,
              ]}>
                {time.label}
              </P1>
              {selectedTimes.includes(time.id) && (
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
          title="Complete"
          onPress={handleNext}
          disabled={!isValid}
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
    marginBottom: spacing.xl,
    color: colors.secondary,
  },
  secondTitle: {
    marginTop: spacing.xxxl,
  },
  subtitle: {
    color: colors.grey,
    marginBottom: spacing.xl,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
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
    fontSize: 15,
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

