import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput as RNTextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { H2, H3, P1, P2, Button, IconButton } from '../components';
import { colors, spacing } from '../theme';
import { api } from '../services/api';

export const TrackMatchScreen = () => {
  const navigation = useNavigation();
  const [opponentName, setOpponentName] = useState('');
  const [playerRanking, setPlayerRanking] = useState('7.2');
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles');
  const [sets, setSets] = useState([
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
  ]);
  const [courtType, setCourtType] = useState('Clay');
  const [location, setLocation] = useState('');
  const [matchTitle, setMatchTitle] = useState('');
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
      
      const response = await api.matches.create(matchData);
      
      console.log('Match saved successfully:', response);
      
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
      {/* Green Header with Tennis Ball */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconButton 
              icon="close" 
              onPress={() => navigation.goBack()}
              color={colors.white}
              style={styles.closeButton}
            />
            <View>
              <H2 style={styles.headerTitle}>Match</H2>
              <P2 style={styles.headerSubtitle}>Players</P2>
            </View>
          </View>
          <View style={styles.tennisBall}>
            <Icon name="tennis-ball" size={60} color="#FFF" />
          </View>
        </View>
        <View style={styles.courtLine} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Player Card */}
        <View style={styles.playerCard}>
          <View style={styles.playerRow}>
            <View style={styles.flagIcon}>
              <P1>🇪🇸</P1>
            </View>
            <View style={styles.playerInfo}>
              <P1 style={styles.playerName}>You</P1>
              <View style={styles.rankingBadge}>
                <Icon name="tennis-ball" size={12} color={colors.secondary} />
                <P2 style={styles.rankingText}>{playerRanking}</P2>
              </View>
            </View>
          </View>
          
          <View style={styles.addPlayerButton}>
            <RNTextInput
              style={styles.playerInput}
              placeholder="Add a player"
              placeholderTextColor={colors.grey}
              value={opponentName}
              onChangeText={setOpponentName}
            />
          </View>
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <H3 style={styles.sectionTitle}>Score</H3>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View style={styles.scorePlayer}>
                <View style={styles.flagSmall}>
                  <P2>🇪🇸</P2>
                </View>
                <P1 style={styles.scorePlayerName}>YOU</P1>
              </View>
              <View style={styles.scoreSets}>
                {sets.map((set, index) => (
                  <RNTextInput
                    key={`player-${index}`}
                    style={styles.scoreInput}
                    value={set.player}
                    onChangeText={(value) => handleSetScore(index, 'player', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.lightGrey}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.scoreHeader}>
              <View style={styles.scorePlayer}>
                <View style={styles.flagSmall}>
                  <P2>🏳️</P2>
                </View>
                <P1 style={styles.scorePlayerName}>Player 2</P1>
              </View>
              <View style={styles.scoreSets}>
                {sets.map((set, index) => (
                  <RNTextInput
                    key={`opponent-${index}`}
                    style={styles.scoreInput}
                    value={set.opponent}
                    onChangeText={(value) => handleSetScore(index, 'opponent', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.lightGrey}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.dataSection}>
          <H3 style={styles.sectionTitle}>Data</H3>
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <P2 style={styles.dataLabel}>Time</P2>
              <P2 style={styles.dataValue}>Time</P2>
            </View>
            <View style={styles.dataRow}>
              <P2 style={styles.dataLabel}>Court type</P2>
              <P2 style={styles.dataValue}>{courtType}</P2>
            </View>
            <View style={styles.dataRow}>
              <P2 style={styles.dataLabel}>Location</P2>
              <RNTextInput
                style={styles.dataInput}
                placeholder="Location"
                placeholderTextColor={colors.grey}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <View style={styles.dataRow}>
              <P2 style={styles.dataLabel}>Type</P2>
              <P2 style={styles.dataValue}>Match</P2>
            </View>
            <View style={styles.dataRowFull}>
              <P2 style={styles.dataLabel}>Title</P2>
              <RNTextInput
                style={styles.dataInputFull}
                placeholder="Match title"
                placeholderTextColor={colors.grey}
                value={matchTitle}
                onChangeText={setMatchTitle}
              />
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <H3 style={styles.sectionTitle}>Notes</H3>
          <View style={styles.notesCard}>
            <RNTextInput
              style={styles.notesInput}
              placeholder="Add notes about the match..."
              placeholderTextColor={colors.grey}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

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
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  tennisBall: {
    opacity: 0.3,
  },
  courtLine: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  playerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flagIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.hyperLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  rankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankingText: {
    color: colors.secondary,
    fontWeight: '600',
  },
  addPlayerButton: {
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
    paddingTop: spacing.md,
  },
  playerInput: {
    fontSize: 16,
    color: colors.secondary,
    padding: 0,
  },
  scoreSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.secondary,
  },
  scoreCard: {
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 12,
    padding: spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scorePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  flagSmall: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePlayerName: {
    fontWeight: '600',
    color: colors.secondary,
  },
  scoreSets: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreInput: {
    width: 50,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
  },
  dataSection: {
    marginBottom: spacing.lg,
  },
  dataCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
  },
  dataRowFull: {
    paddingVertical: spacing.md,
  },
  dataLabel: {
    color: colors.grey,
  },
  dataValue: {
    color: colors.secondary,
    fontWeight: '500',
  },
  dataInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: colors.secondary,
    padding: 0,
  },
  dataInputFull: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.secondary,
    padding: 0,
  },
  notesSection: {
    marginBottom: spacing.lg,
  },
  notesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesInput: {
    fontSize: 14,
    color: colors.secondary,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  submitButton: {
    marginBottom: spacing.xxxl,
  },
});

