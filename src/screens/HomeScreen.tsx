import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { H2, H3, P1, P2, Card } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const response = await api.matches.getHistory(10, 0);
      setMatches(response.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMatches();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Social Feed - Coming Soon */}
        <View style={styles.emptyState}>
          <Icon name="account-group" size={80} color={colors.lightGrey} />
          <H3 style={styles.emptyTitle}>Social Feed</H3>
          <P1 style={styles.emptySubtitle}>
            Connect with other players and see their matches
          </P1>
        </View>

        {/* Recent Matches Section */}
        {matches.length > 0 && (
          <View style={styles.matchesSection}>
            <H3 style={styles.sectionTitle}>Your Recent Matches</H3>
            {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
              activeOpacity={0.7}
            >
              <Card style={styles.matchCard}>
                <View style={styles.matchRow}>
                  <View style={styles.matchLeft}>
                    <View style={styles.opponentAvatar}>
                      <Icon name="account" size={32} color={colors.grey} />
                    </View>
                    <View style={styles.matchInfo}>
                      <P1 style={styles.matchOpponent}>{match.opponent_name}</P1>
                      <P2 style={styles.matchDate}>
                        {new Date(match.played_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </P2>
                    </View>
                  </View>
                  <View style={styles.matchRight}>
                    <View style={[
                      styles.resultBadge,
                      match.result === 'win' ? styles.resultBadgeWin : styles.resultBadgeLoss
                    ]}>
                      <P2 style={[
                        styles.resultText,
                        match.result === 'win' ? styles.resultTextWin : styles.resultTextLoss
                      ]}>
                        {match.result === 'win' ? 'W' : 'L'}
                      </P2>
                    </View>
                    <P1 style={styles.matchScore}>
                      {match.player_sets} - {match.opponent_sets}
                    </P1>
                  </View>
                </View>
                {match.location && (
                  <View style={styles.matchLocation}>
                    <Icon name="map-marker" size={16} color={colors.grey} />
                    <P2 style={styles.locationText}>{match.location}</P2>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hyperLightGrey,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPadding,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    color: colors.grey,
  },
  matchesSection: {
    marginTop: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  matchCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  opponentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  matchDate: {
    fontSize: 13,
    color: colors.grey,
  },
  matchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadgeWin: {
    backgroundColor: colors.primary,
  },
  resultBadgeLoss: {
    backgroundColor: colors.error,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultTextWin: {
    color: colors.white,
  },
  resultTextLoss: {
    color: colors.white,
  },
  matchScore: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    minWidth: 50,
    textAlign: 'right',
  },
  matchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
  },
  locationText: {
    color: colors.grey,
  },
});

