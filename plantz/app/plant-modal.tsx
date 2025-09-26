import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlants } from '@/state/plants-context';
import { Pressable } from 'react-native';
import { PlantSearchResult, fetchFallbackImageFromWikipedia, inferWateringIntervalDays } from '@/services/plant-api';

export default function PlantModal() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const [plant, setPlant] = useState<any | null>(null);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (data) {
      try { setPlant(JSON.parse(data)); } catch {}
    }
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    async function ensureImage() {
      if (!plant) return;
      const core: any = plant?.item ?? plant;
      const direct = core.default_image?.small_url || core.default_image?.medium_url || core.default_image?.regular_url || core.default_image?.original_url || core.Img;
      if (direct) { setImageUri(direct); return; }
      setLoadingImage(true);
      const fallback = await fetchFallbackImageFromWikipedia(core.common_name || core.scientific_name || core['Common name']?.[0] || core['Latin name'] || '');
      if (!cancelled) setImageUri(fallback);
      if (!cancelled) setLoadingImage(false);
    }
    ensureImage();
    return () => { cancelled = true; };
  }, [plant]);

  const core: any = plant?.item ?? plant;
  const title = core?.common_name || core?.scientific_name || (Array.isArray(core?.['Common name']) ? core?.['Common name'][0] : core?.['Common name']) || core?.['Latin name'] || 'Plant';
  const wateringText: string | undefined = core?.watering || core?.['Watering'];
  const wateringInterval = inferWateringIntervalDays(wateringText);
  const { addPlant } = usePlants();

  const handleSave = () => {
    if (!plant) return;
    const name = title;
    addPlant({
      name,
      species: core.scientific_name || core['Latin name'],
      imageUri,
      wateringIntervalDays: wateringInterval,
      source: 'api',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        {loadingImage && <ActivityIndicator />}
        {!!imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        )}
        <InfoRow label="Scientific name" value={core?.scientific_name || core?.['Latin name']} />
        <InfoRow label="Watering" value={wateringText} />
        <InfoRow label="Suggested interval" value={wateringInterval ? `~ every ${wateringInterval} days` : undefined} />
        <InfoRow label="Humidity" value={core?.humidity} />
        <InfoRow label="Sunlight" value={Array.isArray(core?.sunlight) ? core?.sunlight?.join(', ') : (core?.sunlight as any) || core?.['Light ideal'] || core?.['Light tolered']} />
        <InfoRow label="Care level" value={core?.care_level} />
        <InfoRow label="Toxicity" value={core?.toxicity} />
        <InfoRow label="Growth rate" value={core?.growth_rate || core?.Growth} />
        <InfoRow label="Cycle" value={core?.cycle} />
        <InfoRow label="Family" value={core?.Family} />
        <InfoRow label="Origin" value={Array.isArray(core?.Origin) ? core?.Origin?.join(', ') : core?.Origin} />
        <InfoRow label="Use" value={Array.isArray(core?.Use) ? core?.Use?.join(', ') : core?.Use} />
        <InfoRow label="Bearing" value={core?.Bearing} />
        <InfoRow label="Temperature range" value={(core?.['Temperature min'] && core?.['Temperature max']) ? `${core['Temperature min'].C}–${core['Temperature max'].C} °C` : undefined} />
        <InfoRow label="Zone" value={Array.isArray(core?.Zone) ? core?.Zone?.join(', ') : core?.Zone} />
        <InfoRow label="Colors (leaf)" value={Array.isArray(core?.['Color of leaf']) ? core?.['Color of leaf']?.join(', ') : core?.['Color of leaf']} />
        <InfoRow label="Colors (blooms)" value={Array.isArray(core?.['Color of blooms']) ? core?.['Color of blooms']?.join(', ') : core?.['Color of blooms']} />
        {!!core?.description && (
          <View style={{ marginTop: 12 }}>
            <ThemedText type="subtitle">Description</ThemedText>
            <ThemedText style={{ marginTop: 4, lineHeight: 20 }}>{core.description}</ThemedText>
          </View>
        )}

        <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}>
          <ThemedText type="defaultSemiBold" style={styles.saveText}>Save to My Plants</ThemedText>
        </Pressable>
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
  container: { flex: 1, paddingTop: 50 },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  title: { marginBottom: 10 },
  image: { width: '100%', height: 240, borderRadius: 16, marginBottom: 16, backgroundColor: '#eaf6ee' },
  row: { marginTop: 10 },
  rowLabel: { opacity: 0.7, fontSize: 12 },
  rowValue: { marginTop: 2 },
  saveBtn: { marginTop: 16, backgroundColor: '#2e7d32', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1b5e20', shadowColor: '#1b5e20', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  saveText: { color: 'white', fontWeight: '700' },
});
