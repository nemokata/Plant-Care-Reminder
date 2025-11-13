import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Props {
  name: string;
  species?: string;
  status?: string;
  onPress?: () => void;
  imageUri?: string;
  textColor?: string; // optional override for name/species text colors
}

export default function PlantCard({ name, species, status, onPress, imageUri, textColor }: Props) {
  const statusColor = getStatusColor(status);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${name} ${species ? `(${species})` : ''}`} onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.7 }]}>
      <ThemedView style={styles.card}>
        <View style={styles.avatar}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <ThemedText style={styles.avatarEmoji}>🌱</ThemedText>
          )}
        </View>
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" style={styles.name} lightColor={textColor} darkColor={textColor}>
            {name}
          </ThemedText>
          {species ? (
            <ThemedText type="default" style={styles.species} lightColor={textColor} darkColor={textColor}>
              {species}
            </ThemedText>
          ) : null}
          {status ? (
            <View style={[styles.pill, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
              <ThemedText style={[styles.pillText, { color: statusColor.text }]}>
                {status}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

function getStatusColor(status?: string) {
  const base = { bg: '#e8f5e9', border: '#c8e6c9', text: '#2e7d32' };
  if (!status) return base;
  const s = status.toLowerCase();
  if (s.includes('every 2') || s.includes('frequent')) {
    return { bg: '#fff3e0', border: '#ffe0b2', text: '#ef6c00' }; // orange for frequent watering
  }
  if (s.includes('10') || s.includes('minimal') || s.includes('low')) {
    return { bg: '#e3f2fd', border: '#bbdefb', text: '#1565c0' }; // blue for low watering
  }
  if (s.includes('7') || s.includes('weekly')) {
    return { bg: '#ede7f6', border: '#d1c4e9', text: '#5e35b1' }; // purple for weekly
  }
  return base;
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8f0ec',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#e8f5ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 14, backgroundColor: '#d9efe0' },
  avatarEmoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: 16 },
  species: { fontSize: 12, opacity: 0.65, marginTop: 2 },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
});
