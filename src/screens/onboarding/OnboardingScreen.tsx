import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { H2, P1, Button, Card } from '../../components';
import { OnboardingCompleteModal } from '../../components/OnboardingCompleteModal';
import { colors, spacing, layout } from '../../theme';
import { SportSelectionScreen } from './SportSelectionScreen';
import { LevelAssessmentScreen } from './LevelAssessmentScreen';
import { CourtPreferenceScreen } from './CourtPreferenceScreen';
import { PlayingTimeScreen } from './PlayingTimeScreen';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen = ({ navigation }: Props) => {
  const { refreshUser, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    sport: '',
    tennisLevel: '',
    levelScore: '',
    courtPreference: '',
    playingFrequency: '',
    preferredTimes: [] as string[],
  });

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = async (data: any) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete - save to backend
      setLoading(true);
      try {
        // Transform data to match backend expectations
        const backendData = {
          sport: updatedData.sport || 'tennis', // Include sport selection
          tennisLevel: updatedData.tennisLevel,
          courtPreference: Array.isArray(updatedData.courtPreferences) 
            ? updatedData.courtPreferences.join(', ') 
            : updatedData.courtPreferences || '',
          playingFrequency: updatedData.playingFrequency,
          preferredTimes: updatedData.preferredTimes || [],
        };
        
        console.log('Saving onboarding data:', backendData);
        await api.onboarding.save(backendData);
        console.log('Onboarding saved successfully');
        
        // Show completion modal
        setShowModal(true);
      } catch (error: any) {
        console.error('Error saving onboarding:', error);
        Alert.alert(
          'Error',
          'Failed to save your preferences. Please try again.',
          [
            {
              text: 'Retry',
              onPress: () => handleNext(data),
            },
            {
              text: 'Skip for now',
              onPress: () => navigation.replace('Main'),
              style: 'cancel',
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SportSelectionScreen onNext={handleNext} />;
      case 1:
        return <LevelAssessmentScreen sport={onboardingData.sport} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <CourtPreferenceScreen onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <PlayingTimeScreen onNext={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <P1 style={styles.loadingText}>Saving your preferences...</P1>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you having issues? Signing out will let you sign in again with a fresh account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Sign Out Button */}
      <View style={styles.headerRow}>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <P1 style={styles.signOutText}>Sign Out</P1>
        </TouchableOpacity>
      </View>

      {renderStep()}

      {/* Completion Modal */}
      <OnboardingCompleteModal
        visible={showModal}
        tennisLevel={onboardingData.tennisLevel}
        levelScore={onboardingData.levelScore}
        onClose={async () => {
          setShowModal(false);
          // Refresh user data to get updated onboarding_completed status
          await refreshUser();
          navigation.replace('Main');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.ultraLightGrey,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  signOutButton: {
    padding: spacing.sm,
  },
  signOutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  loadingText: {
    marginTop: spacing.lg,
    color: colors.grey,
  },
});

