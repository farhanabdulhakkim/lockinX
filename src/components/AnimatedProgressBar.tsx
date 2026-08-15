import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  progress: number; // 0 to 100
}

export default function AnimatedProgressBar({ progress }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    // withSpring gives it that nice, bouncy, organic feel
    width.value = withSpring(progress, { damping: 12, stiffness: 90 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    };
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    backgroundColor: '#222',
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 24,
  },
  fill: {
    height: '100%',
    backgroundColor: '#4ade80', // Neon green
    borderRadius: 6,
  },
});
