import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

// NOTE: Expo Go compatible version of LiquidGlass.
// Uses Reanimated animated blobs (no Skia required).
// For the full Skia version, use a dev build.
export const LiquidGlass = () => {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-40, 40]) },
      { translateY: interpolate(progress.value, [0, 1], [-60, 60]) },
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [40, -40]) },
      { translateY: interpolate(progress.value, [0, 1], [60, -60]) },
    ],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0A0A', overflow: 'hidden' }]}>
      {/* Animated Blob 1 — Violet */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: width * 0.4,
            backgroundColor: '#8B5CF6',
            opacity: 0.25,
            top: -width * 0.2,
            left: -width * 0.1,
          },
          blob1Style,
        ]}
      />
      {/* Animated Blob 2 — Blue */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.9,
            height: width * 0.9,
            borderRadius: width * 0.45,
            backgroundColor: '#3B82F6',
            opacity: 0.2,
            bottom: -width * 0.3,
            right: -width * 0.2,
          },
          blob2Style,
        ]}
      />
      {/* Dark overlay for readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 10, 10, 0.55)' }]} />
    </View>
  );
};

export default LiquidGlass;
