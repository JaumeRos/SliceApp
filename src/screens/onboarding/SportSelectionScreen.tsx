import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { H2, P1, Button, IconButton } from '../../components';
import { colors, spacing, layout } from '../../theme';

interface SportSelectionScreenProps {
  onNext: (data: any) => void;
  onBack?: () => void;
}

const sports = [
  {
    id: 'tennis',
    name: 'Tennis',
    icon: 'tennis',
    color: '#10B981',
  },
  {
    id: 'padel',
    name: 'Padel',
    icon: 'tennis-ball',
    color: '#3B82F6',
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    icon: 'table-tennis',
    color: '#F59E0B',
  },
  {
    id: 'squash',
    name: 'Squash',
    icon: 'racquetball',
    color: '#EF4444',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: 'badminton',
    color: '#8B5CF6',
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    icon: 'table-tennis',
    color: '#EC4899',
  },
];

export const SportSelectionScreen: React.FC<SportSelectionScreenProps> = ({ onNext, onBack }) => {
  const [selectedSport, setSelectedSport] = useState<string>('');

  const handleNext = () => {
    if (selectedSport) {
      onNext({ sport: selectedSport });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {onBack && (
          <View style={styles.backButtonContainer}>
            <IconButton 
              icon="arrow-left" 
              onPress={onBack}
              color={colors.secondary}
            />
          </View>
        )}
        
        <View style={styles.header}>
          <H2 style={styles.title}>What sport do you play?</H2>
          <P1 style={styles.subtitle}>Select your primary racquet sport</P1>
        </View>

        <View style={styles.sportsGrid}>
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportCard,
                selectedSport === sport.id && styles.sportCardSelected,
              ]}
              onPress={() => setSelectedSport(sport.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                selectedSport === sport.id && { backgroundColor: sport.color }
              ]}>
                <Icon 
                  name={sport.icon} 
                  size={40} 
                  color={selectedSport === sport.id ? colors.white : sport.color} 
                />
              </View>
              <P1 style={[
                styles.sportName,
                selectedSport === sport.id && styles.sportNameSelected
              ]}>
                {sport.name}
              </P1>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={!selectedSport}
          fullWidth
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
  scrollContent: {
    padding: layout.screenPadding,
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
    color: colors.secondary,
  },
  subtitle: {
    color: colors.grey,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sportCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ultraLightGrey,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sportCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.hyperLightGrey,
    shadowOpacity: 0.15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.hyperLightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
  },
  sportNameSelected: {
    color: colors.primary,
  },
  footer: {
    padding: layout.screenPadding,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
    backgroundColor: colors.white,
  },
});

