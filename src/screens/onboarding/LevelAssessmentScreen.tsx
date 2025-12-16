import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { H2, P1, Button } from '../../components';
import { colors, spacing, layout } from '../../theme';
import { sportQuestions, sportLevelNames } from './sportQuestions';

interface LevelAssessmentScreenProps {
  sport: string;
  onNext: (data: any) => void;
  onBack?: () => void;
}

export const LevelAssessmentScreen: React.FC<LevelAssessmentScreenProps> = ({ sport, onNext, onBack }) => {
  // Get sport-specific questions, fallback to tennis if sport not found
  const questions = sportQuestions[sport] || sportQuestions.tennis;
  const levelNames = sportLevelNames[sport] || sportLevelNames.tennis;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswer = answers[question.id] !== undefined;

  const handleSelectOption = (value: number) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate level based on answers
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxScore = questions.reduce((sum, q) => sum + (q.options.length - 1), 0);
      const percentage = totalScore / maxScore;
      
      // Map percentage to level category based on sport
      let levelIndex = 0;
      if (percentage >= 0.85) levelIndex = 3; // Pro/Expert
      else if (percentage >= 0.6) levelIndex = 2; // Advanced
      else if (percentage >= 0.3) levelIndex = 1; // Intermediate
      else levelIndex = 0; // Beginner
      
      const levelCategory = levelNames[levelIndex];
      const level = percentage * 7; // Scale to 0-7 for compatibility
      
      onNext({ 
        tennisLevel: levelCategory, 
        levelScore: level.toFixed(1), 
        answers,
        sport 
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBackPress = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <H2 style={styles.question}>{question.question}</H2>

        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                answers[question.id] === option.value && styles.optionSelected,
              ]}
              onPress={() => handleSelectOption(option.value)}
            >
              <View style={[
                styles.radio,
                answers[question.id] === option.value && styles.radioSelected,
              ]} />
              <P1 style={styles.optionText}>{option.label}</P1>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {(currentQuestion > 0 || onBack) && (
          <Button
            title="Back"
            variant="ghost"
            onPress={handleBackPress}
            style={styles.backButton}
          />
        )}
        <Button
          title={isLastQuestion ? 'Complete' : 'Next'}
          onPress={handleNext}
          disabled={!hasAnswer}
          style={styles.nextButton}
          fullWidth={currentQuestion === 0 && !onBack}
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
  question: {
    marginBottom: spacing.xxxl,
    color: colors.secondary,
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
  },
  optionSelected: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    marginRight: spacing.md,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    color: colors.secondary,
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

