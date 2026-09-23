import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  KeyboardTypeOptions 
} from 'react-native';

interface AuthInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  iconType?: 'email' | 'lock' | 'user';
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  iconType = 'email',
  isPassword = false,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Render minimal SVG-like geometric glyph for input type
  const renderIcon = () => {
    switch (iconType) {
      case 'lock':
        return <Text style={[styles.iconText, isFocused && styles.iconTextFocused]}>🔒</Text>;
      case 'user':
        return <Text style={[styles.iconText, isFocused && styles.iconTextFocused]}>👤</Text>;
      case 'email':
      default:
        return <Text style={[styles.iconText, isFocused && styles.iconTextFocused]}>✉</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View 
        style={[
          styles.inputWrapper, 
          isFocused && styles.inputWrapperFocused
        ]}
      >
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#71717a"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isPassword && (
          <Pressable 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b', // bg-muted in dark mode
    borderWidth: 1,
    borderColor: '#27272a',     // border-border
    borderRadius: 14,          // rounded-xl
    height: 48,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#52525b',
    backgroundColor: '#1c1c20',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconText: {
    fontSize: 15,
    opacity: 0.6,
  },
  iconTextFocused: {
    opacity: 1,
  },
  input: {
    flex: 1,
    color: '#fafafa',
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#27272a',
  },
  eyeText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '600',
  },
});
