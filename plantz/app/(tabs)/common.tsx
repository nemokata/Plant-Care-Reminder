import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { PlantSearchResult, searchPlants, inferWateringIntervalDays, fetchFallbackImageFromWikipediaCached } from '@/services/plant-api';
import { Link } from 'expo-router';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const scheme = useColorScheme() ?? 'light';
  const [items, setItems] = useState<PlantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        // Fetch in parallel and take first hit per query
        const settled = await Promise.allSettled(POPULAR_QUERIES.map(q => searchPlants(q)));
        const takeFirst: PlantSearchResult[] = [];
        for (const s of settled) {
          if (s.status === 'fulfilled' && Array.isArray(s.value) && s.value.length) {
            takeFirst.push(s.value[0]);
          }
        }
        // Dedupe by display name to avoid repeats across synonyms
        const seen = new Set<string>();
        const deduped: PlantSearchResult[] = [];
        const getNameFromItem = (item: PlantSearchResult) => {
          const core: any = (item as any)?.item ?? item;
          const common = core.common_name || (Array.isArray(core["Common name"]) ? core["Common name"][0] : core["Common name"]);
          const scientific = core.scientific_name || core["Latin name"];
          return (common as string) || (scientific as string) || 'Unknown';
        };
        for (const item of takeFirst) {
          const disp = getNameFromItem(item);
          const nameKey = disp.toLowerCase();
          // Do not dedupe if name is unknown; keep them to avoid collapsing to a few items
          if (nameKey !== 'unknown') {
            if (seen.has(nameKey)) continue;
            seen.add(nameKey);
          }
          deduped.push(item);
        }
        if (!cancelled) setItems(deduped);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const renderItem = ({ item }: { item: PlantSearchResult }) => (
    <CommonListItem item={item} />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.hero}>
              <Image
                source={require('../../assets/images/splash-icon.png')}
                style={styles.heroImg}
                contentFit="contain"
              />
              <View style={styles.heroTextWrap}>
                <ThemedText type="title" style={styles.title}>Common houseplants</ThemedText>
                <ThemedText style={styles.subtitle}>Discover easy-care favorites for your home</ThemedText>
              </View>
            </View>
            {loading ? (
              <View style={{ gap: 12, marginTop: 8 }}>
                <Skeleton height={74} />
                <Skeleton height={74} />
                <Skeleton height={74} />
              </View>
            ) : null}
            {error ? (
              <EmptyState title="Fehler beim Laden" subtitle={error} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <EmptyState title="Keine beliebten Pflanzen gefunden" subtitle="Versuche es später noch einmal." />
          ) : null
        }
      />
    </ThemedView>
  );
}

function CommonListItem({ item }: { item: PlantSearchResult }) {
  const scheme = useColorScheme() ?? 'light';
  const core: any = (item as any)?.item ?? item;
  const wateringText: string | undefined = core.watering || core["Watering"];
  const wateringInterval = inferWateringIntervalDays(wateringText);
  const status = wateringInterval ? `~ every ${wateringInterval} days` : wateringText || '—';
  const common = core.common_name || (Array.isArray(core["Common name"]) ? core["Common name"][0] : core["Common name"]);
  const scientific = core.scientific_name || core["Latin name"];
  const name = (common as string) || (scientific as string) || 'Unknown';
  const primaryImage =
    core?.default_image?.small_url ||
    core?.default_image?.medium_url ||
    core?.default_image?.regular_url ||
    core?.default_image?.original_url ||
    core?.Img;
  const [fallbackUri, setFallbackUri] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    let isMounted = true;
    if (!primaryImage && name && name !== 'Unknown') {
      fetchFallbackImageFromWikipediaCached(name)
        .then(uri => { if (isMounted) setFallbackUri(uri); })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [primaryImage, name]);
  const imageUri = primaryImage || fallbackUri;
  return (
    <Link href={{ pathname: '/plant-modal', params: { data: JSON.stringify(item) } }} asChild>
      <PlantCard name={name} species={scientific} status={status} imageUri={imageUri} textColor={scheme === 'dark' ? '#000' : undefined} />
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 16, marginBottom: 8 },
  hero: {
    backgroundColor: '#e9f5ef',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1efe7'
  },
  heroImg: { width: 64, height: 64, marginRight: 10 },
  heroTextWrap: { flex: 1 },
  title: { marginBottom: 4 },
  subtitle: { opacity: 0.7 },
  error: { color: '#b00020', marginHorizontal: 18, marginTop: 8 },
  empty: { opacity: 0.6, marginHorizontal: 18, marginTop: 12 },
});
