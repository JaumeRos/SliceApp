import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Share, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { H1, H2, H3, P1, P2, Button, Card, IconButton } from '../components';
import { colors, spacing, layout } from '../theme';

export const MatchResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const matchData = (route.params as any)?.matchData;

  if (!matchData) {
    return null;
  }

  const { result, opponentName, sets, playerSets, opponentSets, location, date, matchType } = matchData;
  const isWin = result === 'win';

  const handleShare = async () => {
    try {
      const message = `🎾 Tennis Match Result\n\n${isWin ? '✅ Victory!' : '❌ Loss'}\n\nYou ${playerSets} - ${opponentSets} ${opponentName}\n\n${sets.map((set: any, i: number) => `Set ${i + 1}: ${set.player}-${set.opponent}`).join('\n')}\n\n${location ? `📍 ${location}\n` : ''}Tracked with SliceApp 🎾`;

      await Share.share({
        message,
        title: 'Tennis Match Result',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDone = () => {
    navigation.navigate('Main' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon="close" 
          onPress={handleDone}
          color={colors.secondary}
        />
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Result Badge */}
        <View style={styles.resultBadge}>
          <Icon 
            name={isWin ? 'trophy' : 'close-circle'} 
            size={60} 
            color={isWin ? colors.accent : colors.danger} 
          />
          <H1 style={[styles.resultText, { color: isWin ? colors.accent : colors.danger }]}>
            {isWin ? 'Victory!' : 'Good Try!'}
          </H1>
          <P1 style={styles.resultSubtext}>
            {isWin ? 'Great match! Keep it up!' : 'You\'ll get them next time!'}
          </P1>
        </View>

        {/* Match Card - This is the shareable part */}
        <Card style={styles.matchCard}>
          {/* Match Type Badge */}
          <View style={styles.matchTypeBadge}>
            <Icon 
              name={matchType === 'singles' ? 'account' : 'account-multiple'} 
              size={16} 
              color={colors.primary} 
            />
            <P2 style={styles.matchTypeText}>
              {matchType === 'singles' ? 'Singles' : 'Doubles'}
            </P2>
          </View>

          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <View style={styles.playerSection}>
              <View style={styles.playerInfo}>
                <Icon name="account-circle" size={50} color={colors.primary} />
                <View>
                  <P2 style={styles.playerLabel}>You</P2>
                  <H2 style={styles.playerName}>Me</H2>
                </View>
              </View>
              <H1 style={[styles.finalScore, isWin && styles.winningScore]}>
                {playerSets}
              </H1>
            </View>

            <View style={styles.scoreDivider}>
              <P1 style={styles.vsText}>VS</P1>
            </View>

            <View style={styles.playerSection}>
              <H1 style={[styles.finalScore, !isWin && styles.winningScore]}>
                {opponentSets}
              </H1>
              <View style={styles.playerInfo}>
                <View style={styles.opponentTextContainer}>
                  <P2 style={styles.playerLabel}>Opponent</P2>
                  <H2 style={styles.playerName}>{opponentName}</H2>
                </View>
                <Icon name="account-circle" size={50} color={colors.grey} />
              </View>
            </View>
          </View>

          {/* Set Breakdown */}
          <View style={styles.setsContainer}>
            <P2 style={styles.setsTitle}>SET BREAKDOWN</P2>
            {sets.map((set: any, index: number) => (
              <View key={index} style={styles.setRow}>
                <P1 style={styles.setLabel}>Set {index + 1}</P1>
                <View style={styles.setScores}>
                  <P1 style={[
                    styles.setScore,
                    parseInt(set.player) > parseInt(set.opponent) && styles.setScoreWin,
                  ]}>
                    {set.player}
                  </P1>
                  <P1 style={styles.setScoreSeparator}>-</P1>
                  <P1 style={[
                    styles.setScore,
                    parseInt(set.opponent) > parseInt(set.player) && styles.setScoreWin,
                  ]}>
                    {set.opponent}
                  </P1>
                </View>
              </View>
            ))}
          </View>

          {/* Match Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Icon name="calendar" size={20} color={colors.grey} />
              <P2 style={styles.detailText}>
                {new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </P2>
            </View>
            {location && (
              <View style={styles.detailRow}>
                <Icon name="map-marker" size={20} color={colors.grey} />
                <P2 style={styles.detailText}>{location}</P2>
              </View>
            )}
          </View>

          {/* SliceApp Branding */}
          <View style={styles.branding}>
            <Icon name="tennis-ball" size={16} color={colors.primary} />
            <P2 style={styles.brandingText}>Tracked with SliceApp</P2>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Share Result"
            onPress={handleShare}
            leftIcon="share-variant"
            fullWidth
            style={styles.shareButton}
          />
          <Button
            title="Done"
            onPress={handleDone}
            variant="ghost"
            fullWidth
          />
        </View>
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
  resultBadge: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
  },
  resultText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  resultSubtext: {
    color: colors.grey,
  },
  matchCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  matchTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.hyperLightGrey,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  matchTypeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
    minHeight: 120,
  },
  playerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  opponentTextContainer: {
    alignItems: 'flex-end',
  },
  playerLabel: {
    color: colors.grey,
    marginBottom: spacing.xxs,
  },
  playerName: {
    fontSize: 18,
    color: colors.secondary,
    lineHeight: 24,
    includeFontPadding: false,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.lightGrey,
    lineHeight: 56,
    includeFontPadding: false,
  },
  winningScore: {
    color: colors.primary,
  },
  scoreDivider: {
    paddingHorizontal: spacing.lg,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.lightGrey,
  },
  setsContainer: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
  },
  setsTitle: {
    fontWeight: '600',
    color: colors.grey,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 40,
    paddingVertical: spacing.xs,
  },
  setLabel: {
    fontSize: 16,
    color: colors.darkGrey,
    lineHeight: 22,
    includeFontPadding: false,
  },
  setScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setScore: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.grey,
    minWidth: 30,
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  setScoreWin: {
    color: colors.primary,
    fontWeight: '700',
  },
  setScoreSeparator: {
    fontSize: 18,
    color: colors.lightGrey,
  },
  detailsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    color: colors.darkGrey,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
  },
  brandingText: {
    color: colors.grey,
    fontSize: 12,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
});

