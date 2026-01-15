import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { usePlants, SavedPlant } from '@/state/plants-context';

export default function WateredScreen() {
  const { plants, markWatered } = usePlants();

  const items = useMemo(() => {
    // compute next water date and sort by urgency
    return plants
      .map((p) => {
        const interval = p.wateringIntervalDays;
        const last = p.lastWateredAt ? new Date(p.lastWateredAt) : null;
        const next = interval ? (last ? new Date(last.getTime() + interval * 86400000) : new Date()) : null;
        const dueMs = next ? (next.getTime() - Date.now()) : Infinity;
        return { p, next, dueMs };
      })
      .sort((a, b) => a.dueMs - b.dueMs);
  }, [plants]);

  const handleMark = async (id: string) => {
    try {
      await markWatered(id);
    } catch (e: any) {
      Alert.alert('Could not mark watered', e?.message || 'Please try again');
    }
  };

    const renderItem = ({ item }: { item: { p: SavedPlant; next: Date | null } }) => {
    const { p, next } = item;
    const status = !p.wateringIntervalDays ? 'No interval set' : (next ? formatNext(next) : 'Water today');
    return (
      <View style={styles.row}>
        <PlantCard name={p.name} species={p.species} status={status} imageUri={p.imageUri} wateringIntervalDays={p.wateringIntervalDays} savedId={p.id} />
        <Pressable onPress={() => handleMark(p.id)} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
          <ThemedText type="defaultSemiBold" style={styles.btnText}>Mark Watered</ThemedText>
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Water Schedule</ThemedText>
      <FlatList
        data={items}
        keyExtractor={(it) => it.p.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<ThemedText style={styles.empty}>You have no saved plants yet. Save a plant to see watering reminders.</ThemedText>}
      />
    </ThemedView>
  );
}

function formatNext(d: Date) {
  const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (diffDays <= 0) return 'Needs water now';
  if (diffDays === 1) return 'Water tomorrow';
  return `Water in ${diffDays} days`;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  title: { marginHorizontal: 18, marginBottom: 10 },
  row: { marginBottom: 8 },
  btn: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#eaf7ed', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#cdebd1' },
  btnText: { color: '#2e7d32' },
  empty: { opacity: 0.6, marginHorizontal: 18, marginTop: 12 },
});
