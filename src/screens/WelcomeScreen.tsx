import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { P1 } from '../components/Text';
import { Button } from '../components';
import { colors, spacing } from '../theme';
import SliceLogo from '../assets/slicelogo.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/slicewoman.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Overlay gradient for better text readability */}
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Content */}
            <View style={styles.content}>
              {/* Logo and Text */}
              <View style={styles.logoContainer}>
                <SliceLogo
                  width={257}
                  height={57}
                  style={styles.logo}
                />
                <P1 style={styles.subtitle}>
                  Track your matches and{'\n'}compete with friends
                </P1>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <Button
                title="Get Started"
                onPress={() => navigation.navigate('PreSignUpOnboarding')}
                variant="primary"
                size="large"
                fullWidth
              />

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('SignIn')}
                activeOpacity={0.9}
              >
                <P1 style={styles.loginButtonText}>Log in</P1>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  backgroundImageStyle: {
    transform: [
      { translateX: 0 },  // Move right (increase to move more right)
      { translateY: 50 },  // Move down (increase to move more down)
    ],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 130,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 23,
    fontWeight: '500',
    color: colors.white,
    lineHeight: 28,
    textAlign: 'center',
    opacity: 0.95,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 50,
    gap: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.white,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
});

