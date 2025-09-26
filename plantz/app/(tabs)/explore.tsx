import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { searchPlants, inferWateringIntervalDays, PlantSearchResult } from '@/services/plant-api';
import { useDebounce } from '@/hooks/use-debounce';
import { Link } from 'expo-router';

export default function PlantSearchScreen() {
  const [query, setQuery] = useState('Fern');
  // Two debounced values: quick for suggestions, slower for full results
  const quickDebounced = useDebounce(query, 150);
  const slowDebounced = useDebounce(query, 400);
  const [results, setResults] = useState<PlantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const blurHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: get a good display name from item supporting various API field shapes
  const getNameFromItem = (item: PlantSearchResult) => {
    const core: any = (item as any)?.item ?? item;
    const common = core.common_name
      || (Array.isArray(core["Common name"]) ? core["Common name"][0] : core["Common name"]) ;
    const scientific = core.scientific_name || core["Latin name"]; 
    return (common as string) || (scientific as string) || 'Unknown';
  };

  // Fetch full results on slower debounce
  useEffect(() => {
    let cancelled = false;
    if (!slowDebounced.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    searchPlants(slowDebounced)
      .then(r => { if (!cancelled) setResults(r); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slowDebounced]);

  // Fetch lightweight suggestions on quick debounce
  useEffect(() => {
    let cancelled = false;
    const q = quickDebounced.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    searchPlants(q)
      .then(r => {
        if (cancelled) return;
        const names = r
          .map(getNameFromItem)
          .filter(Boolean)
          .map(s => String(s))
          .slice(0, 25);
        // dedupe, keep order, and keep top 8
        const seen = new Set<string>();
        const unique = names.filter(n => {
          const key = n.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 8);
        setSuggestions(unique);
      })
      .catch(() => {
        // silence suggestions error to avoid noisy UI
      });
    return () => { cancelled = true; };
  }, [quickDebounced]);

  const renderItem = ({ item }: { item: PlantSearchResult }) => {
    const core: any = (item as any)?.item ?? item;
    const wateringText: string | undefined = core.watering || core["Watering"];
    const wateringInterval = inferWateringIntervalDays(wateringText);
    const status = wateringInterval ? `~ every ${wateringInterval} days` : wateringText || '—';
    const name = getNameFromItem(item);
    const slug = String(name).toLowerCase().replace(/\s+/g, '-');
    const imageUri =
      core?.default_image?.small_url ||
      core?.default_image?.medium_url ||
      core?.default_image?.regular_url ||
      core?.default_image?.original_url ||
      core?.Img;
    return (
      <Link href={{ pathname: '/plant-modal', params: { data: JSON.stringify(item) } }} asChild>
        <PlantCard name={name} species={core.scientific_name || core["Latin name"]} status={status} imageUri={imageUri} />
      </Link>
    );
  };

  const onSuggestionPress = async (text: string) => {
    // Fill the input, hide suggestions, and trigger an immediate search for results
    setQuery(text);
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    try {
      const r = await searchPlants(text);
      setResults(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding to allow tap on suggestion
            blurHideTimer.current && clearTimeout(blurHideTimer.current);
            blurHideTimer.current = setTimeout(() => setShowSuggestions(false), 100);
          }}
        />
      </View>
      {showSuggestions && suggestions.length > 0 && query.trim().length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((s, i) => (
            <Pressable key={`${s}-${i}`} onPress={() => onSuggestionPress(s)} style={({ pressed }) => [styles.suggestionRow, pressed && { opacity: 0.6 }] }>
              <ThemedText>{s}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}
      {error && <ThemedText style={styles.error}>⚠️ {error}</ThemedText>}
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {!loading && results.length === 0 && !error && slowDebounced.trim().length > 0 && (
        <ThemedText style={styles.empty}>No plants found.</ThemedText>
      )}
      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
      />
  <ThemedText style={styles.hint}>Data via house-plants RapidAPI</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  heading: { marginHorizontal: 18, marginBottom: 10 },
  searchRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, zIndex: 5 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)'
  },
  suggestionsBox: {
    position: 'absolute',
    top: 118, // heading + margins + input height approx
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
    overflow: 'hidden'
  },
  suggestionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  error: { color: '#b00020', marginHorizontal: 18, marginTop: 8 },
  empty: { opacity: 0.6, marginHorizontal: 18, marginTop: 12 },
  hint: { textAlign: 'center', opacity: 0.4, fontSize: 11, marginTop: 8 },
});
