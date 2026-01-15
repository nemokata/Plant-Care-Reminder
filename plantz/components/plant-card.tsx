import React from 'react';
import { Pressable, StyleSheet, View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePlants } from '@/state/plants-context';
import { useAuth } from '@/state/auth-context';
import { router } from 'expo-router';

interface Props {
  name: string;
  species?: string;
  status?: string;
  onPress?: () => void;
  imageUri?: string;
  wateringIntervalDays?: number;
  savedId?: string; // pass when this card represents a saved plant
}

export default function PlantCard({ name, species, status, onPress, imageUri, wateringIntervalDays, savedId }: Props) {
  const bg = useThemeColor({}, 'card');
  const accent = useThemeColor({}, 'tint');
  const { plants, addPlant, removePlant } = usePlants();
  const { user } = useAuth();

  // try to find a matching saved plant for this account
  const matched = savedId ? plants.find((p) => p.id === savedId) : plants.find((p) => p.name === name && String(p.species || '') === String(species || ''));
  const saved = !!matched;

  const handleToggleSave = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to save plants.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/auth/sign-in') },
      ]);
      return;
    }
    try {
      if (saved && matched) {
        await removePlant(matched.id);
      } else {
        await addPlant({ name, species, imageUri, wateringIntervalDays, source: 'api' });
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update saved plants');
    }
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.85 }]}>
      <ThemedView style={[styles.card, { backgroundColor: bg }]}>
        <View style={[styles.avatar, { backgroundColor: accent + '22' }]}>
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

        <Pressable
          onPress={handleToggleSave}
          onPressIn={(e: any) => { e?.stopPropagation?.(); }}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
        >
          <ThemedText style={[styles.saveText, saved ? styles.saved : undefined]}>{saved ? 'Saved' : 'Save'}</ThemedText>
        </Pressable>
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
  saveBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d8efe0', marginLeft: 12 },
  saveText: { fontWeight: '700', color: '#2e7d32' },
  saved: { backgroundColor: 'transparent' },
});
