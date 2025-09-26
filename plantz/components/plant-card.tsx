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
}

export default function PlantCard({ name, species, status, onPress, imageUri }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.7 }]}>
      <ThemedView style={styles.card}>
        <View style={styles.avatar}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <ThemedText style={styles.avatarEmoji}>🌱</ThemedText>
          )}
        </View>
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" style={styles.name}>
            {name}
          </ThemedText>
          {species ? (
            <ThemedText type="default" style={styles.species}>
              {species}
            </ThemedText>
          ) : null}
          {status ? (
            <ThemedText style={styles.status}>
              {status}
            </ThemedText>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f7fbf8',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    borderWidth: 1,
    borderColor: '#d8efe0',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#d9efe0' },
  avatarEmoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: 16 },
  species: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  status: { fontSize: 12, marginTop: 6, color: '#2e7d32', fontWeight: '700' },
});
