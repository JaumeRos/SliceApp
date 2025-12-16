import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { H1, H2, H3, P1, P2 } from '../components';
import { colors, spacing, layout } from '../theme';

export const PlayScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleAddMatch = () => {
    navigation.navigate('TrackMatch');
  };

  const handleAddTraining = () => {
    // TODO: Navigate to training screen when implemented
    console.log('Add Training - Coming soon');
  };

  const handleFindPlayers = () => {
    // TODO: Navigate to find players screen when implemented
    console.log('Find Players - Coming soon');
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Match Results Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleAddMatch}
          activeOpacity={0.7}
        >
          <Icon name="plus" size={24} color={colors.white} />
          <P1 style={styles.primaryButtonText}>Add Match Results</P1>
        </TouchableOpacity>

        {/* Training Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Training</H2>
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={styles.gridButton}
              onPress={handleAddTraining}
              activeOpacity={0.7}
            >
              <Icon name="dumbbell" size={32} color={colors.white} />
              <P2 style={styles.gridButtonText}>Add Training</P2>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={handleFindPlayers}
              activeOpacity={0.7}
            >
              <Icon name="account-group" size={32} color={colors.white} />
              <P2 style={styles.gridButtonText}>Find Players</P2>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    gap: spacing.md,
  },
  gridButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});

