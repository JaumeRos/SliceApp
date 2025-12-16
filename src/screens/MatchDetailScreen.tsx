import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { H2, H3, P1, P2, Card } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchDetail'>;

export const MatchDetailScreen = ({ route, navigation }: Props) => {
  const { matchId } = route.params;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      console.log('[MatchDetailScreen] Fetching match ID:', matchId);
      const matchData = await api.matches.getById(matchId);
      console.log('[MatchDetailScreen] Received match data:', JSON.stringify(matchData, null, 2));
      setMatch(matchData);
    } catch (error) {
      console.error('[MatchDetailScreen] Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <P1>Match not found</P1>
        </View>
      </SafeAreaView>
    );
  }

  const matchDate = match.played_at ? new Date(match.played_at) : new Date();
  const sets = match.sets 
    ? (typeof match.sets === 'string' ? JSON.parse(match.sets) : match.sets)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.secondary} />
          </TouchableOpacity>
          <H2 style={styles.headerTitle}>Match Details</H2>
          <View style={styles.spacer} />
        </View>

        {/* Match Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.opponentAvatar}>
              <Icon name="account" size={56} color={colors.grey} />
            </View>
            <View style={styles.summaryInfo}>
              <H2 style={styles.opponentName}>{match.opponent_name || 'Unknown Opponent'}</H2>
              <P2 style={styles.matchType}>
                {match.match_type === 'singles' ? 'Singles Match' : match.match_type === 'doubles' ? 'Doubles Match' : 'Match'}
              </P2>
            </View>
          </View>
          
          {/* Final Score Display */}
          <View style={styles.finalScoreContainer}>
            <View style={styles.finalScoreColumn}>
              <P2 style={styles.finalScoreLabel}>You</P2>
              <H2 style={[
                styles.finalScoreValue,
                match.result === 'win' && styles.finalScoreWin
              ]}>
                {match.player_sets ?? 0}
              </H2>
            </View>
            <View style={styles.finalScoreDivider}>
              <P1 style={styles.finalScoreSeparator}>-</P1>
            </View>
            <View style={styles.finalScoreColumn}>
              <P2 style={styles.finalScoreLabel}>Opponent</P2>
              <H2 style={[
                styles.finalScoreValue,
                match.result === 'loss' && styles.finalScoreLoss
              ]}>
                {match.opponent_sets ?? 0}
              </H2>
            </View>
          </View>

          {/* Result Badge */}
          <View style={styles.resultContainer}>
            <View style={[
              styles.resultBadgeLarge,
              match.result === 'win' ? styles.resultBadgeWin : styles.resultBadgeLoss
            ]}>
              <Icon 
                name={match.result === 'win' ? 'trophy' : 'close-circle'} 
                size={24} 
                color={colors.white} 
              />
              <P1 style={[
                styles.resultTextLarge,
                match.result === 'win' ? styles.resultTextWin : styles.resultTextLoss
              ]}>
                {match.result === 'win' ? 'Victory' : 'Defeat'}
              </P1>
            </View>
          </View>
        </Card>

        {/* Match Info */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>Match Information</H3>
          
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <P2 style={styles.infoLabel}>Date & Time</P2>
                <P1 style={styles.infoValue}>
                  {matchDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </P1>
                <P2 style={styles.infoSubValue}>
                  {matchDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </P2>
              </View>
            </View>

            {match.location && (
              <View style={[styles.infoRow, styles.infoRowWithBorder]}>
                <View style={styles.infoIconContainer}>
                  <Icon name="map-marker" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <P2 style={styles.infoLabel}>Location</P2>
                  <P1 style={styles.infoValue}>{match.location}</P1>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="tennis" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <P2 style={styles.infoLabel}>Match Type</P2>
                <P1 style={styles.infoValue}>
                  {match.match_type === 'singles' ? 'Singles' : 'Doubles'}
                </P1>
              </View>
            </View>
          </Card>
        </View>

        {/* Score Breakdown */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>Set-by-Set Breakdown</H3>
          
          <Card style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View style={styles.scoreColumn}>
                <P2 style={styles.scoreLabel}>Set</P2>
              </View>
              <View style={styles.scoreColumn}>
                <P2 style={styles.scoreLabel}>You</P2>
              </View>
              <View style={styles.scoreColumn}>
                <P2 style={styles.scoreLabel}>Opponent</P2>
              </View>
            </View>

            {sets && sets.length > 0 ? sets.map((set: any, index: number) => {
              const playerScore = parseInt(set.player || '0');
              const opponentScore = parseInt(set.opponent || '0');
              const playerWon = playerScore > opponentScore;
              return (
                <View key={index} style={styles.setRow}>
                  <View style={styles.setNumberColumn}>
                    <P2 style={styles.setNumber}>Set {index + 1}</P2>
                  </View>
                  <View style={styles.scoreColumn}>
                    <P1 style={[
                      styles.setScore,
                      playerWon && styles.setScoreWin
                    ]}>
                      {set.player || '0'}
                    </P1>
                  </View>
                  <View style={styles.scoreColumn}>
                    <P1 style={[
                      styles.setScore,
                      !playerWon && opponentScore > 0 && styles.setScoreLoss
                    ]}>
                      {set.opponent || '0'}
                    </P1>
                  </View>
                </View>
              );
            }) : (
              <View style={styles.noSetsContainer}>
                <P2 style={styles.noSetsText}>No set scores available</P2>
              </View>
            )}
          </Card>
        </View>

        {/* Notes */}
        {match.notes && (
          <View style={styles.section}>
            <H3 style={styles.sectionTitle}>Notes</H3>
            <Card style={styles.notesCard}>
              <P1 style={styles.notesText}>{match.notes}</P1>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
  },
  spacer: {
    width: 40,
  },
  summaryCard: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  opponentAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.hyperLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  matchType: {
    fontSize: 14,
    color: colors.grey,
    textTransform: 'capitalize',
  },
  finalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 100,
  },
  finalScoreColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  finalScoreLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  finalScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.secondary,
    lineHeight: 56,
    includeFontPadding: false,
  },
  finalScoreWin: {
    color: colors.primary,
  },
  finalScoreLoss: {
    color: colors.error,
  },
  finalScoreDivider: {
    paddingHorizontal: spacing.lg,
  },
  finalScoreSeparator: {
    fontSize: 32,
    color: colors.lightGrey,
    fontWeight: '300',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  resultBadgeWin: {
    backgroundColor: colors.primary,
  },
  resultBadgeLoss: {
    backgroundColor: colors.error,
  },
  resultTextLarge: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultTextWin: {
    color: colors.white,
  },
  resultTextLoss: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: layout.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  infoRowWithBorder: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
    marginTop: spacing.lg,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.hyperLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xxs,
  },
  infoSubValue: {
    fontSize: 14,
    color: colors.grey,
  },
  scoreCard: {
    padding: spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.ultraLightGrey,
  },
  scoreColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  setNumberColumn: {
    width: 80,
    alignItems: 'flex-start',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.grey,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  setNumber: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: '600',
  },
  setScore: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.secondary,
    lineHeight: 36,
    includeFontPadding: false,
  },
  setScoreWin: {
    color: colors.primary,
  },
  setScoreLoss: {
    color: colors.error,
  },
  noSetsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noSetsText: {
    color: colors.grey,
    fontSize: 14,
  },
  notesCard: {
    padding: spacing.md,
  },
  notesText: {
    fontSize: 16,
    color: colors.darkGrey,
    lineHeight: 24,
  },
});

