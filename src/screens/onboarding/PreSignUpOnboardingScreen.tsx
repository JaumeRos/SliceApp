import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing } from '../../theme';
import { SportSelectionScreen } from './SportSelectionScreen';
import { LevelAssessmentScreen } from './LevelAssessmentScreen';
import { CourtPreferenceScreen } from './CourtPreferenceScreen';
import { PlayingTimeScreen } from './PlayingTimeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'PreSignUpOnboarding'>;

export const PreSignUpOnboardingScreen = ({ navigation }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    sport: '',
    tennisLevel: '',
    levelScore: '',
    courtPreference: '',
    courtPreferences: [] as string[],
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
      // Onboarding complete - navigate to sign up with data
      console.log('[PreSignUpOnboarding] Complete, navigating to SignUp with data:', updatedData);
      navigation.navigate('SignUp', { onboardingData: updatedData });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // Go back to welcome screen
      navigation.goBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SportSelectionScreen onNext={handleNext} onBack={handleBack} />;
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {renderStep()}
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
});

