import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { H2, P1, ButtonText } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { OnboardingCompleteModal } from '../components/OnboardingCompleteModal';
import { colors } from '../theme';
import { AppleIcon, GoogleIcon, BackIcon } from '../components/Icon';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen = ({ navigation, route }: Props) => {
  const { signUp, signInWithApple, signInWithGoogle, refreshUser } = useAuth();
  const onboardingData = route.params?.onboardingData;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);

      // If we have onboarding data from pre-signup flow, save it now
      if (onboardingData) {
        try {
          console.log('[SignUpScreen] Saving onboarding data after signup:', onboardingData);
          const backendData = {
            sport: onboardingData.sport || 'tennis', // Include sport selection
            tennisLevel: onboardingData.tennisLevel,
            courtPreference: Array.isArray(onboardingData.courtPreferences)
              ? onboardingData.courtPreferences.join(', ')
              : onboardingData.courtPreference || '',
            playingFrequency: onboardingData.playingFrequency,
            preferredTimes: onboardingData.preferredTimes || [],
          };

          console.log('[SignUpScreen] ===== SAVING ONBOARDING DATA =====');
          console.log('[SignUpScreen] Data being sent to backend:', JSON.stringify(backendData, null, 2));

          await api.onboarding.save(backendData);
          console.log('[SignUpScreen] ✅ Onboarding save API call completed');

          console.log('[SignUpScreen] ===== REFRESHING USER DATA =====');
          await refreshUser();
          console.log('[SignUpScreen] ✅ User refresh completed');

          // Show completion modal with ranking
          setShowCompletionModal(true);
        } catch (error) {
          console.error('[SignUpScreen] Error saving onboarding data:', error);
          // Don't block the user if onboarding save fails
        }
      }
      // Navigation handled by AuthContext
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign In is only available on iOS');
      return;
    }

    try {
      setAppleLoading(true);
      await signInWithApple();
      // Navigation handled by AuthContext
    } catch (error: any) {
      console.error('Apple Sign in error:', error);
      if (!error.message?.includes('canceled')) {
        Alert.alert('Apple Sign In Failed', error.message || 'Failed to sign in with Apple.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      // Navigation handled by AuthContext
    } catch (error: any) {
      console.error('Google Sign in error:', error);
      if (!error.message?.includes('canceled')) {
        Alert.alert('Google Sign In Failed', error.message || 'Failed to sign in with Google.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || appleLoading || googleLoading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          disabled={isAnyLoading}
        >
          <BackIcon color={colors.secondary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <H2 style={styles.title}>Create Account</H2>
          <P1 style={styles.subtitle}>Sign up to start tracking your tennis matches</P1>
        </View>

        {/* Social Sign In Buttons */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={isAnyLoading}
          >
            {appleLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <AppleIcon width={20} height={20} color={colors.white} />
                <ButtonText style={styles.appleButtonText}>Continue with Apple</ButtonText>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={isAnyLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <>
              <GoogleIcon width={20} height={20} />
              <ButtonText style={styles.googleButtonText}>Continue with Google</ButtonText>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <P1 style={styles.dividerText}>or</P1>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="email"
            editable={!isAnyLoading}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon="lock"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            editable={!isAnyLoading}
            style={styles.input}
          />

          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            leftIcon="lock"
            rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            editable={!isAnyLoading}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.signUpButton, isAnyLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isAnyLoading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <ButtonText style={styles.signUpButtonText}>Sign Up</ButtonText>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <P1 style={styles.footerText}>Already have an account? </P1>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            disabled={isAnyLoading}
          >
            <P1 style={styles.signInLink}>Sign In</P1>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Onboarding Completion Modal */}
      {onboardingData && (
        <OnboardingCompleteModal
          visible={showCompletionModal}
          tennisLevel={onboardingData.tennisLevel || 'Beginner'}
          levelScore={onboardingData.levelScore || '0.0'}
          onClose={() => setShowCompletionModal(false)}
        />
      )}
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
    padding: 24,
    paddingBottom: 360,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: colors.grey,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    marginBottom: 12,
  },
  appleButton: {
    backgroundColor: colors.secondary,
  },
  appleButtonText: {
    color: colors.white,
    marginLeft: 8,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  googleButtonText: {
    color: colors.secondary,
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGrey,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.grey,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginTop: 12,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.grey,
  },
  signInLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

