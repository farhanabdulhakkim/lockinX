import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

interface SocialButtonProps {
  label: string;
  iconText: string;
  onPress: () => void;
}

export default function SocialButton({ label, iconText, onPress }: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.icon}>{iconText}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b', // bg-muted
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  buttonPressed: {
    backgroundColor: '#27272a',
    transform: [{ scale: 0.98 }],
  },
  icon: {
    fontSize: 16,
    color: '#fafafa',
    marginRight: 6,
  },
  label: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
  },
});
