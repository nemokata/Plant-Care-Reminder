import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { PlantSearchResult, searchPlants, inferWateringIntervalDays } from '@/services/plant-api';
import { Link } from 'expo-router';

const POPULAR_QUERIES = [
  'Monstera',
  'Snake Plant',
  'Spider Plant',
  'ZZ Plant',
  'Peace Lily',
  'Pothos',
  'Aloe Vera',
  'Fiddle Leaf Fig',
  'Rubber Plant',
  'Philodendron',
];

export default function CommonPlantsScreen() {
  const [items, setItems] = useState<PlantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const all: PlantSearchResult[] = [];
        // Fetch in sequence to keep it simple and avoid rate limits
        for (const q of POPULAR_QUERIES) {
          const r = await searchPlants(q);
          if (r && r.length) all.push(r[0]);
        }
        if (!cancelled) setItems(all);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const renderItem = ({ item }: { item: PlantSearchResult }) => {
    const wateringInterval = inferWateringIntervalDays(item.watering);
    const status = wateringInterval ? `~ every ${wateringInterval} days` : item.watering || '—';
    const name = item.common_name || item.scientific_name || 'Unknown';
    const slug = String(name).toLowerCase().replace(/\s+/g, '-');
    const imageUri =
      item.default_image?.small_url ||
      item.default_image?.medium_url ||
      item.default_image?.regular_url ||
      item.default_image?.original_url;
    return (
      <Link href={{ pathname: '/plant-modal', params: { data: JSON.stringify(item) } }} asChild>
        <PlantCard name={name} species={item.scientific_name} status={status} imageUri={imageUri} wateringIntervalDays={wateringInterval} />
      </Link>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Common houseplants</ThemedText>
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {error && <ThemedText style={styles.error}>⚠️ {error}</ThemedText>}
      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        ListEmptyComponent={!loading ? <ThemedText style={styles.empty}>No popular plants found.</ThemedText> : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  title: { marginHorizontal: 18, marginBottom: 6 },
  error: { color: '#b00020', marginHorizontal: 18, marginTop: 8 },
  empty: { opacity: 0.6, marginHorizontal: 18, marginTop: 12 },
});
