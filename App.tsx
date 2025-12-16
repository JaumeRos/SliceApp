import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RootStackParamList } from './src/types/navigation';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { PreSignUpOnboardingScreen } from './src/screens/onboarding/PreSignUpOnboardingScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import { TrackMatchScreen } from './src/screens/TrackMatchScreen';
import { MatchResultScreen } from './src/screens/MatchResultScreen';
import { MatchDetailScreen } from './src/screens/MatchDetailScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasCompletedOnboarding = user?.onboarding_completed === true;

  console.log('[APP NAVIGATOR] ===== NAVIGATION DECISION =====');
  console.log('[APP NAVIGATOR] User exists:', !!user);
  console.log('[APP NAVIGATOR] User ID:', user?.id);
  console.log('[APP NAVIGATOR] User email:', user?.email);
  console.log('[APP NAVIGATOR] onboarding_completed:', user?.onboarding_completed);
  console.log('[APP NAVIGATOR] hasCompletedOnboarding:', hasCompletedOnboarding);
  console.log('[APP NAVIGATOR] Will show:', !user ? 'AUTH STACK' : !hasCompletedOnboarding ? 'ONBOARDING STACK' : 'MAIN APP STACK');

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="PreSignUpOnboarding" component={PreSignUpOnboardingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : !hasCompletedOnboarding ? (
          // Onboarding Stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
                headerStyle: {
                  backgroundColor: colors.white,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '600',
                },
              }}
            />
            <Stack.Screen name="TrackMatch" component={TrackMatchScreen} />
            <Stack.Screen name="MatchResult" component={MatchResultScreen} />
            <Stack.Screen 
              name="MatchDetail" 
              component={MatchDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={({ navigation }) => ({
                headerShown: true,
                title: 'Edit Profile',
                headerStyle: {
                  backgroundColor: colors.white,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '600',
                },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 16 }}
                  >
                    <Icon name="arrow-left" size={24} color={colors.secondary} />
                  </TouchableOpacity>
                ),
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
