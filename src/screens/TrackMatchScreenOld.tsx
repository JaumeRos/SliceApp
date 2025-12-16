import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput as RNTextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { H2, P1, Button, Card, Section, IconButton } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';

export const TrackMatchScreen = () => {
  const navigation = useNavigation();
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles');
  const [opponentName, setOpponentName] = useState('');
  const [sets, setSets] = useState([
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
  ]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetScore = (setIndex: number, type: 'player' | 'opponent', value: string) => {
    const newSets = [...sets];
    newSets[setIndex][type] = value;
    setSets(newSets);
  };

  const calculateResult = () => {
    let playerSets = 0;
    let opponentSets = 0;

    sets.forEach(set => {
      const playerScore = parseInt(set.player) || 0;
      const opponentScore = parseInt(set.opponent) || 0;
      
      if (playerScore > opponentScore) playerSets++;
      if (opponentScore > playerScore) opponentSets++;
    });

    return { playerSets, opponentSets, result: playerSets > opponentSets ? 'win' : 'loss' };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const { playerSets, opponentSets, result } = calculateResult();
      
      const matchData = {
        opponentName,
        matchType,
        result,
        playerSets,
        opponentSets,
        sets: sets.filter(set => set.player && set.opponent),
        location: location || undefined,
        notes: notes || undefined,
        playedAt: new Date().toISOString(),
      };

      console.log('Submitting match:', matchData);
      
      // Save to backend
      const response = await api.matches.create(matchData);
      
      console.log('Match saved successfully:', response);
      
      // Navigate to result screen with full match data
      navigation.navigate('MatchResult' as never, { 
        matchData: {
          ...matchData,
          date: matchData.playedAt,
        },
        stats: response.stats,
      } as never);
    } catch (error: any) {
      console.error('Error saving match:', error);
      Alert.alert(
        'Error',
        'Failed to save match. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid = opponentName && sets[0].player && sets[0].opponent;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon="close" 
          onPress={() => navigation.goBack()}
          color={colors.secondary}
        />
        <H2>Track Match</H2>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Match Type */}
        <Section title="MATCH TYPE" spacing="medium">
          <View style={styles.matchTypeContainer}>
            <TouchableOpacity
              style={[
                styles.matchTypeButton,
                matchType === 'singles' && styles.matchTypeButtonActive,
              ]}
              onPress={() => setMatchType('singles')}
            >
              <Icon 
                name="account" 
                size={24} 
                color={matchType === 'singles' ? colors.white : colors.grey} 
              />
              <P1 style={[
                styles.matchTypeText,
                matchType === 'singles' && styles.matchTypeTextActive,
              ]}>
                Singles
              </P1>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.matchTypeButton,
                matchType === 'doubles' && styles.matchTypeButtonActive,
              ]}
              onPress={() => setMatchType('doubles')}
            >
              <Icon 
                name="account-multiple" 
                size={24} 
                color={matchType === 'doubles' ? colors.white : colors.grey} 
              />
              <P1 style={[
                styles.matchTypeText,
                matchType === 'doubles' && styles.matchTypeTextActive,
              ]}>
                Doubles
              </P1>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Opponent */}
        <Section title="OPPONENT" spacing="medium">
          <Card>
            <RNTextInput
              style={styles.input}
              placeholder="Opponent name"
              value={opponentName}
              onChangeText={setOpponentName}
              placeholderTextColor={colors.grey}
            />
          </Card>
        </Section>

        {/* Score */}
        <Section title="SCORE" spacing="medium">
          <Card>
            <View style={styles.scoreHeader}>
              <P1 style={styles.scoreHeaderText}>You</P1>
              <P1 style={styles.scoreHeaderText}>Opponent</P1>
            </View>

            {sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <P1 style={styles.setLabel}>Set {index + 1}</P1>
                <View style={styles.setInputs}>
                  <RNTextInput
                    style={styles.scoreInput}
                    value={set.player}
                    onChangeText={(value) => handleSetScore(index, 'player', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.lightGrey}
                  />
                  <P1 style={styles.scoreSeparator}>-</P1>
                  <RNTextInput
                    style={styles.scoreInput}
                    value={set.opponent}
                    onChangeText={(value) => handleSetScore(index, 'opponent', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.lightGrey}
                  />
                </View>
              </View>
            ))}
          </Card>
        </Section>

        {/* Location */}
        <Section title="LOCATION (OPTIONAL)" spacing="medium">
          <Card>
            <RNTextInput
              style={styles.input}
              placeholder="Where did you play?"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={colors.grey}
            />
          </Card>
        </Section>

        {/* Notes */}
        <Section title="NOTES (OPTIONAL)" spacing="medium">
          <Card>
            <RNTextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any notes about the match..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.grey}
            />
          </Card>
        </Section>

        {/* Submit Button */}
        <Button
          title={loading ? "Saving..." : "Save Match"}
          onPress={handleSubmit}
          disabled={!isValid || loading}
          loading={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hyperLightGrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  matchTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: layout.cardPadding,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    gap: spacing.sm,
  },
  matchTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  matchTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.grey,
  },
  matchTypeTextActive: {
    color: colors.white,
  },
  input: {
    fontSize: 16,
    color: colors.secondary,
    padding: 0,
  },
  notesInput: {
    minHeight: 100,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    paddingRight: spacing.md,
  },
  scoreHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.grey,
    width: 80,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreInput: {
    width: 60,
    height: 50,
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
  },
  scoreSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.lightGrey,
  },
  submitButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
  },
});

