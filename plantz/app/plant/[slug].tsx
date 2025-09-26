import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlantSearchResult, searchPlants, inferWateringIntervalDays } from '@/services/plant-api';

export default function PlantDetailsScreen() {
  const { slug, data } = useLocalSearchParams<{ slug?: string; data?: string }>();
  const [plant, setPlant] = useState<PlantSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!data) return null;
    try { return JSON.parse(data) as PlantSearchResult; } catch { return null; }
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (parsed) { setPlant(parsed); return; }
      if (!slug) return;
      setLoading(true); setError(null);
      try {
        const results = await searchPlants(String(slug).replace(/-/g, ' '));
        if (!cancelled) setPlant(results[0] ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [slug, parsed]);

  const title = plant?.common_name || plant?.scientific_name || 'Plant';
  const wateringInterval = inferWateringIntervalDays(plant?.watering);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
        {error && <ThemedText style={styles.error}>⚠️ {error}</ThemedText>}
        {!!plant?.default_image?.original_url && (
          <Image
            source={{ uri: plant.default_image.original_url }}
            style={styles.image}
            contentFit="cover"
          />
        )}
        <InfoRow label="Scientific name" value={plant?.scientific_name} />
        <InfoRow label="Watering" value={plant?.watering} />
        <InfoRow label="Suggested interval" value={wateringInterval ? `~ every ${wateringInterval} days` : undefined} />
        <InfoRow label="Sunlight" value={Array.isArray(plant?.sunlight) ? plant?.sunlight?.join(', ') : (plant?.sunlight as any)} />
        <InfoRow label="Care level" value={plant?.care_level} />
        <InfoRow label="Toxicity" value={plant?.toxicity} />
        <InfoRow label="Growth rate" value={plant?.growth_rate} />
        <InfoRow label="Cycle" value={plant?.cycle} />
        {!!plant?.description && (
          <View style={{ marginTop: 12 }}>
            <ThemedText type="subtitle">Description</ThemedText>
            <ThemedText style={{ marginTop: 4, lineHeight: 20 }}>{plant.description}</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <ThemedText type="defaultSemiBold" style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText style={styles.rowValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  title: { marginBottom: 12 },
  image: { width: '100%', height: 220, borderRadius: 16, marginBottom: 14, backgroundColor: '#eee' },
  row: { marginTop: 8 },
  rowLabel: { opacity: 0.7, fontSize: 12 },
  rowValue: { marginTop: 2 },
  error: { color: '#b00020', marginTop: 8 },
});
