import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { H2, P1, Card, Section, Button } from '../components';
import { colors, spacing, layout } from '../theme';

export const SettingsScreen = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <Section title="ACCOUNT" spacing="medium">
          <Card>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={colors.grey} />
              <P1 style={styles.infoLabel}>Email</P1>
            </View>
            <P1 style={styles.infoValue}>{user?.email}</P1>
          </Card>
        </Section>

        {/* App Section */}
        <Section title="APP" spacing="medium">
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="information" size={24} color={colors.grey} />
              <P1 style={styles.menuItemText}>About</P1>
            </View>
            <Icon name="chevron-right" size={24} color={colors.lightGrey} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="help-circle" size={24} color={colors.grey} />
              <P1 style={styles.menuItemText}>Help & Support</P1>
            </View>
            <Icon name="chevron-right" size={24} color={colors.lightGrey} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="star" size={24} color={colors.grey} />
              <P1 style={styles.menuItemText}>Rate App</P1>
            </View>
            <Icon name="chevron-right" size={24} color={colors.lightGrey} />
          </TouchableOpacity>
        </Section>

        {/* Sign Out Button */}
        <Button 
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          style={styles.signOutButton}
          textStyle={{ color: colors.error }}
        />

        {/* App Version */}
        <P1 style={styles.versionText}>Version 1.0.0</P1>
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
    backgroundColor: colors.hyperLightGrey,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.grey,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: layout.cardPadding,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    borderColor: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.lightGrey,
    marginBottom: spacing.xl,
  },
});
