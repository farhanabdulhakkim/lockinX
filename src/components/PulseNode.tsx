import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

interface Props {
  username: string;
  streak: number;
}

export default function PulseNode({ username, streak }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    // Continuous looping pulse animation
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // -1 means infinite loop
      true // reverse back to original state
    );
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedAuraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* The glowing animated background */}
      <Animated.View style={[styles.aura, animatedAuraStyle]} />
      
      {/* The static center node */}
      <View style={styles.core}>
        <Text style={styles.streakText}>🔥 {streak}</Text>
      </View>
      <Text style={styles.username}>{username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 32 },
  aura: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#4ade80' },
  core: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#000', borderWidth: 2, borderColor: '#4ade80', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  streakText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  username: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 16, letterSpacing: 1 },
});
