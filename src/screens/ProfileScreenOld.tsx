import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { H2, H3, P1, P2, Card, Section, IconButton } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';

export const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const fetchStats = async () => {
    try {
      const response = await api.matches.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Fetch stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with icons */}
      <View style={styles.topBar}>
        <IconButton 
          icon="pencil" 
          onPress={() => console.log('Edit profile')}
          color={colors.secondary}
        />
        <IconButton 
          icon="cog" 
          onPress={handleNavigateToSettings}
          color={colors.secondary}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={100} color={colors.primary} />
          </View>
          <P1 style={styles.email}>{user?.email}</P1>
        </View>

        {/* Stats Section */}
        <Section title="STATS" spacing="medium">
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Icon name="tennis" size={32} color={colors.primary} />
              <H2 style={styles.statValue}>{stats?.total_matches || 0}</H2>
              <P1 style={styles.statLabel}>Matches</P1>
            </Card>
            
            <Card style={styles.statCard}>
              <Icon name="trophy" size={32} color={colors.warning} />
              <H2 style={styles.statValue}>{stats?.total_wins || 0}</H2>
              <P1 style={styles.statLabel}>Wins</P1>
            </Card>
          </View>

          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Icon name="close-circle" size={32} color={colors.error} />
              <H2 style={styles.statValue}>{stats?.total_losses || 0}</H2>
              <P1 style={styles.statLabel}>Losses</P1>
            </Card>
            
            <Card style={styles.statCard}>
              <Icon name="percent" size={32} color="#8B5CF6" />
              <H2 style={styles.statValue}>{stats?.win_rate?.toFixed(0) || 0}%</H2>
              <P1 style={styles.statLabel}>Win Rate</P1>
            </Card>
          </View>

          {/* Streak Section */}
          {stats && stats.current_streak !== 0 && (
            <Card style={styles.streakCard}>
              <Icon 
                name={stats.current_streak > 0 ? 'fire' : 'water'} 
                size={40} 
                color={stats.current_streak > 0 ? colors.warning : colors.primary} 
              />
              <View style={styles.streakContent}>
                <H3 style={styles.streakValue}>
                  {Math.abs(stats.current_streak)} {stats.current_streak > 0 ? 'Win' : 'Loss'} Streak
                </H3>
                <P2 style={styles.streakLabel}>
                  {stats.current_streak > 0 ? 'Keep it going! 🔥' : 'You\'ll bounce back! 💪'}
                </P2>
              </View>
            </Card>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hyperLightGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: layout.sectionSpacing,
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: '500',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  streakContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  streakValue: {
    marginBottom: spacing.xs,
    color: colors.secondary,
  },
  streakLabel: {
    color: colors.grey,
  },
});

