import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { H2, P1, ButtonText } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { colors } from '../theme';
import { AppleIcon, GoogleIcon, BackIcon } from '../components/Icon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export const SignInScreen = ({ navigation }: Props) => {
  const { signIn, signInWithApple, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Navigation handled by AuthContext
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in. Please try again.');
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
          <H2 style={styles.title}>Welcome Back</H2>
          <P1 style={styles.subtitle}>Sign in to continue tracking your matches</P1>
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
            style={styles.passwordInput}
          />

          <TouchableOpacity
            style={[styles.signInButton, isAnyLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isAnyLoading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <ButtonText style={styles.signInButtonText}>Sign In</ButtonText>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <P1 style={styles.footerText}>Don't have an account? </P1>
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp')}
            disabled={isAnyLoading}
          >
            <P1 style={styles.signUpLink}>Sign Up</P1>
          </TouchableOpacity>
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
  passwordInput: {
    marginTop: 12,
  },
  signInButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInButtonText: {
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
  signUpLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

