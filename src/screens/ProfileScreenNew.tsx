import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { H2, H3, P1, P2, Card, IconButton } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const fetchData = async () => {
    try {
      const [statsResponse, matchesResponse] = await Promise.all([
        api.matches.getStats(),
        api.matches.getHistory(10, 0),
      ]);
      setStats(statsResponse.stats);
      setMatches(matchesResponse.matches || []);
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

  // Generate ranking graph data (mock for now)
  const generateRankingData = () => {
    return {
      labels: ['', '', '', '', '', '', ''],
      datasets: [{
        data: [6.0, 6.1, 6.0, 6.2, 6.3, 6.3, 6.4],
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
        {/* Header with Profile Info */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle" size={80} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <P2 style={styles.username}>@{user?.email?.split('@')[0]}</P2>
              <H3 style={styles.name}>{user?.email?.split('@')[0] || 'Player'}</H3>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <P1 style={styles.statValue}>{stats?.total_matches || 0}</P1>
                  <P2 style={styles.statLabel}>Matches</P2>
                </View>
                <View style={styles.statItem}>
                  <P1 style={styles.statValue}>0</P1>
                  <P2 style={styles.statLabel}>Followers</P2>
                </View>
                <View style={styles.statItem}>
                  <P1 style={styles.statValue}>0</P1>
                  <P2 style={styles.statLabel}>Following</P2>
                </View>
              </View>
              <View style={styles.rankingBadge}>
                <Icon name="tennis-ball" size={16} color={colors.secondary} />
                <P1 style={styles.rankingText}>Ranking {stats?.win_rate?.toFixed(1) || '6.4'}</P1>
              </View>
            </View>
          </View>
          <IconButton 
            icon="cog" 
            onPress={handleNavigateToSettings}
            color={colors.secondary}
            style={styles.settingsButton}
          />
        </View>

        {/* Ranking Graph */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <P2 style={styles.sectionLabel}>Ranking</P2>
            <View style={styles.rankingValue}>
              <Icon name="tennis-ball" size={16} color={colors.secondary} />
              <P1 style={styles.rankingNumber}>{stats?.win_rate?.toFixed(1) || '6.4'}</P1>
            </View>
          </View>
          <LineChart
            data={rankingData}
            width={screenWidth - 40}
            height={120}
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
            }}
            bezier
            style={styles.chart}
            withVerticalLabels={false}
            withHorizontalLabels={true}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
          />
        </View>

        {/* Calendar Heatmap */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Calendar</P2>
          <View style={styles.calendar}>
            {calendarData.map((day, index) => (
              <View 
                key={index} 
                style={[
                  styles.calendarDay,
                  day.hasMatch && styles.calendarDayActive,
                  index % 7 === 6 && styles.calendarDayLast,
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

        {/* Matches Played Chart */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Matches played</P2>
          <View style={styles.matchesChart}>
            {matchesPlayedData.map((count, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={[
                  styles.bar,
                  { height: Math.max(count * 30, 4) }
                ]} />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Recent Matches</P2>
          {matches.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="tennis" size={40} color={colors.lightGrey} />
              <P1 style={styles.emptyText}>No matches yet</P1>
            </Card>
          ) : (
            matches.slice(0, 3).map((match, index) => (
              <Card key={match.id} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchInfo}>
                    <Icon name="account-circle" size={40} color={colors.primary} />
                    <View style={styles.matchDetails}>
                      <P1 style={styles.matchOpponent}>{match.opponent_name}</P1>
                      <P2 style={styles.matchDate}>
                        {new Date(match.played_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </P2>
                    </View>
                  </View>
                  <View style={styles.matchResult}>
                    <Icon 
                      name={match.result === 'win' ? 'trophy' : 'close-circle'} 
                      size={20} 
                      color={match.result === 'win' ? colors.warning : colors.error} 
                    />
                  </View>
                </View>
                <View style={styles.matchLocation}>
                  <Icon name="map-marker" size={16} color={colors.grey} />
                  <P2 style={styles.locationText}>{match.location || 'No location'}</P2>
                </View>
                <View style={styles.matchScore}>
                  <View style={styles.scoreBox}>
                    <P2 style={styles.scoreLabel}>You</P2>
                    <P1 style={styles.scoreValue}>{match.player_sets}</P1>
                  </View>
                  <P1 style={styles.scoreSeparator}>-</P1>
                  <View style={styles.scoreBox}>
                    <P2 style={styles.scoreLabel}>Opponent</P2>
                    <P1 style={styles.scoreValue}>{match.opponent_sets}</P1>
                  </View>
                </View>
              </Card>
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
    padding: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    color: colors.grey,
    marginBottom: spacing.xxs,
  },
  name: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
    color: colors.secondary,
  },
  statLabel: {
    color: colors.grey,
  },
  rankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  rankingText: {
    fontWeight: '600',
    color: colors.secondary,
  },
  settingsButton: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rankingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankingNumber: {
    fontWeight: '700',
    color: colors.secondary,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  calendarDay: {
    width: (screenWidth - 40 - (6 * spacing.xs)) / 7,
    aspectRatio: 1,
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayActive: {
    backgroundColor: '#FEF3C7',
  },
  calendarDayLast: {
    marginRight: 0,
  },
  calendarDayText: {
    fontSize: 12,
    color: colors.grey,
  },
  calendarDayTextActive: {
    color: colors.warning,
    fontWeight: '600',
  },
  matchesChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: spacing.xs,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.ultraLightGrey,
    borderRadius: 4,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.grey,
  },
  matchCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  matchDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  matchOpponent: {
    fontWeight: '600',
    color: colors.secondary,
  },
  matchDate: {
    color: colors.grey,
  },
  matchResult: {
    marginLeft: spacing.md,
  },
  matchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    color: colors.grey,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ultraLightGrey,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: colors.grey,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
  },
  scoreSeparator: {
    fontSize: 24,
    color: colors.lightGrey,
  },
});

