import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface SkeletonProps { height?: number; width?: number | string; radius?: number; style?: any }

export function Skeleton({ height = 56, width = '100%', radius = 12, style }: SkeletonProps) {
  const opacity = React.useRef(new Animated.Value(0.4)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.base, { height, width, borderRadius: radius, opacity }, style]} />
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#e9f3ee',
  },
});
