import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, Dimensions, TouchableOpacity, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { H2, H3, P1, P2 } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsResponse, matchesResponse] = await Promise.all([
        api.matches.getStats(),
        api.matches.getHistory(10, 0),
      ]);
      console.log('[ProfileScreen] Stats response:', statsResponse);
      console.log('[ProfileScreen] Matches response:', matchesResponse);
      setStats(statsResponse.stats);
      setMatches(matchesResponse.matches || []);
      console.log('[ProfileScreen] Matches set:', matchesResponse.matches?.length || 0);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // Generate calendar data (last 49 days, 7x7 grid)
  const generateCalendarData = () => {
    const today = new Date();
    const days = [];
    for (let i = 48; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayNumber = date.getDate();
      const hasMatch = matches.some(m => {
        const matchDate = new Date(m.played_at);
        return matchDate.toDateString() === date.toDateString();
      });
      days.push({ day: dayNumber, hasMatch });
    }
    return days;
  };

  // Generate ranking graph data based on current ranking
  const generateRankingData = () => {
    // Safely parse ranking, default to 6.4 if invalid
    let currentRanking = parseFloat(user?.tennis_level || '6.4');
    if (isNaN(currentRanking) || currentRanking <= 0) {
      currentRanking = 6.4;
    }

    const labels = ['', '', '', '', '', '', ''];

    // Generate a progression that ends at current ranking
    // Show last 7 data points gradually increasing to current ranking
    const data = [];
    const baseRanking = Math.max(4.0, currentRanking - 0.4); // Start 0.4 below current, min 4.0

    for (let i = 0; i < 7; i++) {
      // Gradually increase towards current ranking
      const progress = i / 6;
      const value = baseRanking + (currentRanking - baseRanking) * progress;
      const roundedValue = Math.round(value * 10) / 10;
      // Ensure we never push NaN
      data.push(isNaN(roundedValue) ? currentRanking : roundedValue);
    }

    // Final validation - ensure all values are valid numbers
    const validatedData = data.map(val => (isNaN(val) || val <= 0 ? 6.4 : val));

    return {
      labels,
      datasets: [{
        data: validatedData,
        strokeWidth: 2,
      }],
    };
  };

  // Generate matches played chart data (last 14 days)
  const generateMatchesPlayedData = () => {
    const data = Array(14).fill(0);
    matches.forEach(match => {
      const matchDate = new Date(match.played_at);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 14) {
        data[13 - diffDays]++;
      }
    });
    return data;
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const calendarData = generateCalendarData();
  const rankingData = generateRankingData();
  const matchesPlayedData = generateMatchesPlayedData();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Profile Header - Image on Left, Name and Stats on Right */}
        <View style={styles.profileContainer}>
          {/* Left: Profile Image */}
          <View style={styles.profileLeft}>
            <View style={styles.avatarCircle}>
              {user?.profile_image_url ? (
                <Image
                  source={{ uri: user.profile_image_url }}
                  style={styles.profileImage}
                />
              ) : (
                <Icon name="account-circle" size={100} color={colors.primary} />
              )}
            </View>
          </View>

          {/* Right: Name and Stats */}
          <View style={styles.profileRight}>
            <H2 style={styles.name}>{user?.full_name || user?.email?.split('@')[0] || 'Player'}</H2>

            {/* Stats Row - Full Width */}
            <View style={styles.statsRowFullWidth}>
              <View style={styles.statItem}>
                <P2 style={styles.statLabel}>Matches</P2>
                <P1 style={styles.statValue}>{stats?.total_matches || 0}</P1>
              </View>
              <View style={styles.statItem}>
                <P2 style={styles.statLabel}>Followers</P2>
                <P1 style={styles.statValue}>0</P1>
              </View>
              <View style={styles.statItem}>
                <P2 style={styles.statLabel}>Following</P2>
                <P1 style={styles.statValue}>0</P1>
              </View>
            </View>
          </View>
        </View>

        {/* Bio and Link Section */}
        {(user?.bio || user?.link) && (
          <View style={[styles.bioSection, user?.bio && user?.link && styles.bioSectionWithGap]}>
            {user?.bio && (
              <View style={styles.bioContainer}>
                <P1 style={styles.bioText}>{user.bio.trim()}</P1>
              </View>
            )}
            {user?.link && (
              <TouchableOpacity
                onPress={async () => {
                  const link = user.link;
                  if (!link) {
                    return;
                  }
                  const url = link.startsWith('http') ? link : `https://${link}`;
                  try {
                    const canOpen = await Linking.canOpenURL(url);
                    if (canOpen) {
                      await Linking.openURL(url);
                    }
                  } catch (error) {
                    console.error('Error opening link:', error);
                  }
                }}
                style={styles.linkContainer}
              >
                <P2 style={styles.linkText}>{user.link}</P2>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Matches Played Chart */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>Match Activity</H3>
          <View style={styles.matchesChartContainer}>
            <View style={styles.matchesChart}>
              {matchesPlayedData.map((count, index) => {
                const maxBarHeight = 100; // Maximum height for bars
                const barHeight = Math.min(Math.max(count * 20, 8), maxBarHeight);
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: count > 0 ? colors.primary : colors.ultraLightGrey,
                      },
                    ]} />
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <P2 style={styles.legendText}>Last 14 days</P2>
            </View>
          </View>
        </View>

        {/* Ranking Progression */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3 style={styles.sectionTitle}>Ranking Progression</H3>
            <View style={styles.rankingValue}>
              <Icon name="tennis-ball" size={18} color={colors.primary} />
              <P1 style={styles.rankingNumber}>{user?.tennis_level || '6.4'}</P1>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={rankingData}
              width={screenWidth - 40}
              height={140}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 1,
                color: () => colors.primary,
                labelColor: () => colors.grey,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: 2,
                  stroke: colors.primary,
                },
              }}
              bezier
              style={styles.chart}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
          </View>
        </View>

        {/* Calendar Heatmap */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>Activity Calendar</H3>
          <View style={styles.calendarContainer}>
            <View style={styles.calendar}>
              {calendarData.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.calendarDay,
                    day.hasMatch && styles.calendarDayActive,
                  ]}
                >
                  <P2 style={[
                    styles.calendarDayText,
                    day.hasMatch && styles.calendarDayTextActive,
                  ]}>
                    {day.day}
                  </P2>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>Recent Matches</H3>
          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="tennis" size={60} color={colors.lightGrey} />
              <P1 style={styles.emptyText}>No matches yet</P1>
              <P2 style={styles.emptySubtext}>Start tracking your matches to see them here</P2>
            </View>
          ) : (
            matches.slice(0, 5).map((match) => (
              <TouchableOpacity
                key={match.id}
                onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
                activeOpacity={0.7}
              >
                <View style={styles.matchCard}>
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
                          })}
                        </P2>
                      </View>
                    </View>
                    <View style={styles.matchRight}>
                      <View style={[
                        styles.resultBadge,
                        match.result === 'win' ? styles.resultBadgeWin : styles.resultBadgeLoss,
                      ]}>
                        <P2 style={[
                          styles.resultText,
                          match.result === 'win' ? styles.resultTextWin : styles.resultTextLoss,
                        ]}>
                          {match.result === 'win' ? 'W' : 'L'}
                        </P2>
                      </View>
                      <P1 style={styles.matchScore}>
                        {match.player_sets} - {match.opponent_sets}
                      </P1>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  profileContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  profileLeft: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.hyperLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileRight: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statsRowFullWidth: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: spacing.xs,
    paddingRight: spacing.xl,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey,
  },
  bioSection: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  bioSectionWithGap: {
    gap: 8,
  },
  bioContainer: {
  },
  bioText: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  linkContainer: {
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: layout.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  rankingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankingNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    overflow: 'hidden',
  },
  chart: {
    marginLeft: -20,
    borderRadius: 16,
  },
  calendarContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  calendarDay: {
    width: (screenWidth - 80 - (6 * spacing.xs)) / 7,
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayActive: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    fontSize: 12,
    color: colors.grey,
    fontWeight: '500',
  },
  calendarDayTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  matchesChartContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    overflow: 'hidden',
  },
  matchesChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    maxHeight: 100,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  chartLegend: {
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    color: colors.grey,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGrey,
  },
  emptySubtext: {
    marginTop: spacing.xs,
    color: colors.grey,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
});

