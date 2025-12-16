import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { H2, H3, P1, P2, Button, TextInput } from '../components';
import { colors, spacing, layout } from '../theme';
import { api } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen = ({ navigation }: Props) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [sex, setSex] = useState('');
  const [birthday, setBirthday] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image_url || null);

  useEffect(() => {
    // Load user data when screen mounts
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setLink(user.link || '');
      setSex(user.sex || '');
      setBirthday(user.birthday || '');
      setProfileImage(user.profile_image_url || null);
    }
  }, [user]);

  const handleImagePicker = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1000,
        height: 1000,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      if (image && image.path) {
        await uploadProfileImage(image.path);
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Image picker error:', error);
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await api.user.uploadProfileImage(formData);
      
      if (response.success && response.imageUrl) {
        setProfileImage(response.imageUrl);
        // Refresh user data to update the profile image in the app
        await refreshUser();
        Alert.alert('Success', 'Profile image updated');
      } else {
        throw new Error(response.error || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        full_name: fullName,
        bio,
        link,
        sex: sex || null,
        birthday: birthday || null,
      };

      const response = await api.user.updateProfile(updateData);
      
      if (response.success) {
        await refreshUser();
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSex = () => {
    Alert.alert(
      'Select Sex',
      '',
      [
        { text: 'Male', onPress: () => setSex('male') },
        { text: 'Female', onPress: () => setSex('female') },
        { text: 'Other', onPress: () => setSex('other') },
        { text: 'Prefer not to say', onPress: () => setSex('prefer_not_to_say') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            onPress={handleImagePicker}
            disabled={uploadingImage}
            style={styles.imageContainer}
          >
            {uploadingImage ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="account-circle" size={100} color={colors.grey} />
              </View>
            )}
            <View style={styles.imageOverlay}>
              <Icon name="camera" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImagePicker} style={styles.changePictureButton}>
            <P2 style={styles.changePictureText}>Change Picture</P2>
          </TouchableOpacity>
        </View>

        {/* Public Profile Data */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>Public profile data</H3>
          
          <View style={styles.inputRow}>
            <P2 style={styles.label}>Name</P2>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              style={styles.input}
            />
          </View>

          <View style={styles.inputRow}>
            <P2 style={styles.label}>Bio</P2>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.inputRow}>
            <P2 style={styles.label}>Link</P2>
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://example.com"
              keyboardType="url"
              style={styles.input}
            />
          </View>
        </View>

        {/* Private Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3 style={styles.sectionTitle}>Private data</H3>
            <Icon name="help-circle" size={20} color={colors.grey} />
          </View>
          
          <TouchableOpacity style={styles.selectRow} onPress={handleSelectSex}>
            <P2 style={styles.label}>Sex</P2>
            <View style={styles.selectButton}>
              <P2 style={styles.selectText}>{sex || 'Select'}</P2>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <P2 style={styles.label}>Birthday</P2>
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          title="Save"
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={styles.saveButton}
        />
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
  profileImageSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.hyperLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  changePictureButton: {
    paddingVertical: spacing.xs,
  },
  changePictureText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  inputRow: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});

