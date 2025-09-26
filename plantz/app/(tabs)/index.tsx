import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { usePlants, SavedPlant } from '@/state/plants-context';

export default function HomeScreen() {
  const { plants } = usePlants();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const nextWaterText = (p: SavedPlant) => {
    if (!p.wateringIntervalDays) return 'Set watering interval';
    if (!p.lastWateredAt) return 'Water today';
    const last = new Date(p.lastWateredAt);
    const next = new Date(last.getTime() + p.wateringIntervalDays * 86400000);
    const diffDays = Math.ceil((next.getTime() - Date.now()) / 86400000);
    if (diffDays <= 0) return 'Needs water now';
    if (diffDays === 1) return 'Water tomorrow';
    return `Water in ${diffDays} days`;
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={['#a5d6a7', '#e8f5e9']} style={styles.hero}>
        <ThemedText type="title" style={styles.greeting}>🌿 Hey Plant Friend!</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>Let’s keep your green buddies happy today.</ThemedText>
        <ThemedView style={styles.actionsRow}>
          <QuickAction label="Add Plant" emoji="➕" onPress={() => { /* navigation later */ }} />
          <QuickAction label="Watered" emoji="💧" onPress={() => { /* bulk mark later */ }} />
          <QuickAction label="Reminders" emoji="⏰" onPress={() => { /* open reminders */ }} />
        </ThemedView>
      </LinearGradient>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Your Plants</ThemedText>

      <FlatList
        data={plants}
        keyExtractor={(p) => p.id}
        contentContainerStyle={plants.length === 0 && styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<ThemedText style={styles.emptyText}>No plants yet. Find one in Explore or Common and tap Save 🌱</ThemedText>}
        renderItem={({ item }) => (
          <PlantCard
            name={item.name}
            species={item.species}
            status={nextWaterText(item)}
            onPress={() => {}}
            imageUri={item.imageUri}
          />
        )}
      />
    </ThemedView>
  );
}

function QuickAction({ label, emoji, onPress }: { label: string; emoji: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <ThemedText style={styles.quickEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.quickLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, opacity: 0.85 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 22 },
  quickAction: {
    backgroundColor: '#eaf7ed',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 84,
    borderWidth: 1,
    borderColor: '#cbe9d0'
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  sectionTitle: { marginTop: 18, marginHorizontal: 18, marginBottom: 8 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { opacity: 0.6, textAlign: 'center' },
});
