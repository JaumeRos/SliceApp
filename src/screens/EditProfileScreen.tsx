import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, Dimensions } from 'react-native';
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
  const [privateDataModalVisible, setPrivateDataModalVisible] = useState(false);
  const [sexModalVisible, setSexModalVisible] = useState(false);
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [sex, setSex] = useState('');
  const [birthday, setBirthday] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image_url || null);
  
  // Date picker state
  const [selectedDay, setSelectedDay] = useState(19);
  const [selectedMonth, setSelectedMonth] = useState(11); // 0-indexed, 11 = December
  const [selectedYear, setSelectedYear] = useState(2025);
  
  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const normalizeLink = (linkValue: string): string => {
    if (!linkValue || linkValue.trim() === '') {
      return '';
    }
    // Remove http:// or https:// if present
    let normalized = linkValue.trim().replace(/^https?:\/\//i, '');
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  };

  useEffect(() => {
    // Load user data when screen mounts
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setLink(user.link ? normalizeLink(user.link) : '');
      setSex(user.sex || '');
      setBirthday(user.birthday || '');
      setProfileImage(user.profile_image_url || null);
      
      // Parse birthday if it exists
      if (user.birthday) {
        const date = new Date(user.birthday);
        if (!isNaN(date.getTime())) {
          setSelectedDay(date.getDate());
          setSelectedMonth(date.getMonth());
          setSelectedYear(date.getFullYear());
        }
      }
    }
  }, [user]);
  
  // Generate date arrays for picker
  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
  };
  
  const formatBirthday = (day: number, month: number, year: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };
  
  const handleDateConfirm = () => {
    const formattedDate = formatBirthday(selectedDay, selectedMonth, selectedYear);
    setBirthday(formattedDate);
    setBirthdayModalVisible(false);
  };
  
  // Auto-scroll to selected values when date picker opens
  useEffect(() => {
    if (birthdayModalVisible) {
      // Scroll to selected day
      setTimeout(() => {
        const days = generateDays();
        const dayIndex = days.findIndex(d => d === selectedDay);
        if (dayIndex >= 0 && dayScrollRef.current) {
          dayScrollRef.current.scrollTo({
            y: dayIndex * 48, // 40px height + 8px margin
            animated: true,
          });
        }
      }, 100);
      
      // Scroll to selected month
      setTimeout(() => {
        if (monthScrollRef.current) {
          monthScrollRef.current.scrollTo({
            y: selectedMonth * 48,
            animated: true,
          });
        }
      }, 150);
      
      // Scroll to selected year
      setTimeout(() => {
        const years = generateYears();
        const yearIndex = years.findIndex(y => y === selectedYear);
        if (yearIndex >= 0 && yearScrollRef.current) {
          yearScrollRef.current.scrollTo({
            y: yearIndex * 48,
            animated: true,
          });
        }
      }, 200);
    }
  }, [birthdayModalVisible, selectedDay, selectedMonth, selectedYear]);

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
      const normalizedLink = normalizeLink(link);
      const updateData = {
        full_name: fullName,
        bio,
        link: normalizedLink || null,
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

  const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];


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
              style={styles.inputWrapper}
            />
          </View>

          <View style={styles.inputRow}>
            <P2 style={styles.label}>Bio</P2>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={2}
              maxLength={200}
              style={[styles.inputWrapper, styles.textAreaWrapper]}
            />
          </View>

          <View style={styles.inputRow}>
            <P2 style={styles.label}>Link</P2>
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://example.com"
              keyboardType="url"
              style={styles.inputWrapper}
            />
          </View>
        </View>

        {/* Private Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3 style={styles.sectionTitle}>Private data</H3>
            <TouchableOpacity onPress={() => setPrivateDataModalVisible(true)}>
              <Icon name="help-circle" size={20} color={colors.grey} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputRow}>
            <P2 style={styles.label}>Sex</P2>
            <TouchableOpacity style={styles.selectContainer} onPress={() => setSexModalVisible(true)}>
              <P2 style={styles.selectText}>
                {sexOptions.find(opt => opt.value === sex)?.label || 'Select'}
              </P2>
              <Icon name="chevron-right" size={20} color={colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <P2 style={styles.label}>Birthday</P2>
            <TouchableOpacity 
              style={styles.selectContainer} 
              onPress={() => setBirthdayModalVisible(true)}
            >
              <P2 style={styles.selectText}>
                {birthday ? new Date(birthday).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : 'Select'}
              </P2>
              <Icon name="chevron-right" size={20} color={colors.grey} />
            </TouchableOpacity>
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

      {/* Private Data Info Modal */}
      <Modal
        visible={privateDataModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivateDataModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <H3 style={styles.modalTitle}>Private Data</H3>
              <TouchableOpacity onPress={() => setPrivateDataModalVisible(false)}>
                <Icon name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <P1 style={styles.modalText}>
              This information is not used publicly. It helps us tailor features to your specific demographic and match you with players of your sex and age for better game experiences.
            </P1>
            <Button
              title="Got it"
              onPress={() => setPrivateDataModalVisible(false)}
              fullWidth
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Sex Selection Modal */}
      <Modal
        visible={sexModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSexModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setSexModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.actionSheetContent}
          >
            <View style={styles.modalHandle} />
            <H3 style={styles.actionSheetTitle}>Select Sex</H3>
            {sexOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.actionSheetOption,
                  sex === option.value && styles.actionSheetOptionSelected,
                ]}
                onPress={() => {
                  setSex(option.value);
                  setSexModalVisible(false);
                }}
              >
                <P1 style={styles.actionSheetOptionText}>{option.label}</P1>
                {sex === option.value && (
                  <Icon name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Birthday Date Picker Modal */}
      <Modal
        visible={birthdayModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBirthdayModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setBirthdayModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.datePickerModalContent}
          >
            <View style={styles.modalHandle} />
            <H3 style={styles.actionSheetTitle}>Birthday</H3>
            <View style={styles.datePickerContainer}>
              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <ScrollView
                  ref={dayScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {generateDays().map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.datePickerItem,
                        selectedDay === day && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedDay === day && styles.datePickerItemTextSelected,
                      ]}>
                        {day}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <ScrollView
                  ref={monthScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.datePickerItem,
                        selectedMonth === index && styles.datePickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedMonth(index);
                        // Adjust day if needed
                        const daysInMonth = new Date(selectedYear, index + 1, 0).getDate();
                        if (selectedDay > daysInMonth) {
                          setSelectedDay(daysInMonth);
                        }
                      }}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedMonth === index && styles.datePickerItemTextSelected,
                      ]}>
                        {month}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <ScrollView
                  ref={yearScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.datePickerItem,
                        selectedYear === year && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedYear === year && styles.datePickerItemTextSelected,
                      ]}>
                        {year}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.datePickerButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setBirthdayModalVisible(false)}
                style={styles.datePickerButton}
              />
              <Button
                title="Confirm"
                onPress={handleDateConfirm}
                style={styles.datePickerButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 12,
  },
  inputRowLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    height: 44,
    overflow: 'hidden',
  },
  textAreaWrapper: {
    minHeight: 60,
    height: undefined,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  selectText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
  },
  modalText: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalButton: {
    marginTop: spacing.md,
  },
  // Action Sheet Styles
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.lightGrey,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  actionSheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.hyperLightGrey,
  },
  actionSheetOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  actionSheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  // Date Picker Styles
  datePickerModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    height: 240,
    marginVertical: spacing.lg,
    position: 'relative',
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  datePickerScrollContent: {
    paddingVertical: 100, // Padding to center selected item
  },
  datePickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  datePickerItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  datePickerItemText: {
    fontSize: 18,
    color: colors.grey,
    fontWeight: '400',
  },
  datePickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 20,
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  datePickerButton: {
    flex: 1,
  },
});

