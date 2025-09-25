import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Props {
  name: string;
  species?: string;
  status?: string;
  onPress?: () => void;
}

export default function PlantCard({ name, species, status, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.7 }]}>
      <ThemedView style={styles.card}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarEmoji}>🌱</ThemedText>
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
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#E4F8EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarEmoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: 16 },
  species: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  status: { fontSize: 12, marginTop: 6, color: '#2e7d32', fontWeight: '600' },
});
