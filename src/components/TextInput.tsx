import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface CustomTextInputProps extends TextInputProps {
  error?: boolean;
  leftIcon?: string | React.ReactNode;
  leftIconColor?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  multiline?: boolean;
}

export function TextInput({
  style,
  error,
  leftIcon,
  leftIconColor = colors.grey,
  rightIcon,
  onRightIconPress,
  multiline,
  ...props
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const backgroundColor = isFocused ? colors.input.active : colors.input.inactive;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (props.onFocus) {props.onFocus(e);}
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) {props.onBlur(e);}
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor },
      error && styles.errorContainer,
      multiline && styles.multilineContainer,
      style,
    ]}>
      {leftIcon && (
        <View style={styles.leftIcon}>
          {typeof leftIcon === 'string' ? (
            <Icon
              name={leftIcon}
              size={20}
              color={leftIconColor}
            />
          ) : (
            leftIcon
          )}
        </View>
      )}
      <RNTextInput
        style={[
          styles.input,
          leftIcon ? styles.inputWithLeftIcon : null,
          rightIcon ? styles.inputWithRightIcon : null,
          error ? styles.error : null,
          multiline ? styles.multilineInput : null,
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={colors.grey}
        multiline={multiline}
        autoComplete="off"
        textContentType="none"
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <Icon name={rightIcon} size={20} color={colors.grey} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 0,
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.secondary,
    backgroundColor: 'transparent',
  },
  multilineInput: {
    height: undefined,
    minHeight: 48,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    borderColor: colors.error,
  },
});

