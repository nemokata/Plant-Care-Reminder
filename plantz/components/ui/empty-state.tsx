import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type Props = { title: string; subtitle?: string; imageUri?: string; children?: React.ReactNode; color?: string };

export function EmptyState({ title, subtitle, imageUri, children, color }: Props) {
  return (
    <View style={styles.wrap}>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} contentFit="contain" /> : <ThemedText style={styles.emoji} lightColor={color} darkColor={color}>🪴</ThemedText>}
      <ThemedText type="subtitle" style={styles.title} lightColor={color} darkColor={color}>{title}</ThemedText>
      {subtitle ? <ThemedText style={styles.subtitle} lightColor={color} darkColor={color}>{subtitle}</ThemedText> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  image: { width: 160, height: 120, marginBottom: 12 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { textAlign: 'center', marginBottom: 6 },
  subtitle: { textAlign: 'center', opacity: 0.7 },
});
