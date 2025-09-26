import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { searchPlants, inferWateringIntervalDays, PlantSearchResult } from '@/services/plant-api';
import { useDebounce } from '@/hooks/use-debounce';
import { Link } from 'expo-router';

export default function PlantSearchScreen() {
  const [query, setQuery] = useState('Fern');
  const debounced = useDebounce(query, 500);
  const [results, setResults] = useState<PlantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    searchPlants(debounced)
      .then(r => { if (!cancelled) setResults(r); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  const renderItem = ({ item }: { item: PlantSearchResult }) => {
    const wateringInterval = inferWateringIntervalDays(item.watering);
    const status = wateringInterval ? `~ every ${wateringInterval} days` : item.watering || '—';
    const name = item.common_name || item.scientific_name || 'Unknown';
    const slug = String(name).toLowerCase().replace(/\s+/g, '-');
    return (
      <Link
        href={{ pathname: '/plant/[slug]', params: { slug, data: JSON.stringify(item) } }}
        asChild>
        <PlantCard name={name} species={item.scientific_name} status={status} />
      </Link>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>Search Plants</ThemedText>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name..."
          placeholderTextColor="#888"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      {error && <ThemedText style={styles.error}>⚠️ {error}</ThemedText>}
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {!loading && results.length === 0 && !error && debounced.trim().length > 0 && (
        <ThemedText style={styles.empty}>No plants found.</ThemedText>
      )}
      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
      />
      <ThemedText style={styles.hint}>Data via house-plants RapidAPI • Do not hard‑code your key</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  heading: { marginHorizontal: 18, marginBottom: 12 },
  searchRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    fontSize: 16,
  },
  error: { color: '#b00020', marginHorizontal: 18, marginTop: 8 },
  empty: { opacity: 0.6, marginHorizontal: 18, marginTop: 12 },
  hint: { textAlign: 'center', opacity: 0.4, fontSize: 11, marginTop: 8 },
});
