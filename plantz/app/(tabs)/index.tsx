import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import PlantCard from '@/components/plant-card';
import { usePlants, SavedPlant } from '@/state/plants-context';
import { useAuth } from '@/state/auth-context';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { plants } = usePlants();
  const { user, signOutUser } = useAuth();
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
      {/* Background gradient to softly blend white -> green behind the hero */}
      <LinearGradient
        colors={[ '#f6fbf7', '#eef8f0', '#e8f5e9' ]}
        locations={[0, 0.5, 1]}
        style={styles.bgGradient}
        pointerEvents="none"
      />
      <LinearGradient colors={['#a5d6a7', '#e8f5e9']} style={styles.hero}>
        <ThemedText type="title" style={styles.greeting}>🌿 Hey Plant Friend!</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>Let’s keep your green buddies happy today.</ThemedText>
<<<<<<< Updated upstream
        {user && (
          <ThemedText style={{ marginTop: 6, opacity: 0.7, fontSize: 12 }}>
            Signed in as {user.email} ({user.uid.slice(0,6)}…) · {plants.length} plants
          </ThemedText>
        )}
        <ThemedView style={styles.actionsRow}>
          <QuickAction label="Add Plant" emoji="➕" onPress={() => { /* navigation later */ }} />
          <QuickAction label="Watered" emoji="💧" onPress={() => { /* bulk mark later */ }} />
          <QuickAction label={user ? 'Sign out' : 'Sign in'} emoji={user ? '👋' : '🔐'} onPress={() => {
            if (user) {
              signOutUser();
            } else {
              router.push('/auth/sign-in');
            }
          }} />
=======
        {/* Transparent containers so the hero gradient stays visible behind buttons */}
        <ThemedView style={styles.actionsRow} lightColor="transparent" darkColor="transparent">
          <ThemedView style={styles.actionsInner} lightColor="transparent" darkColor="transparent">
            <QuickAction label="Add Plant" emoji="➕" onPress={() => { /* navigation later */ }} />
            <QuickAction label="Watered" emoji="💧" onPress={() => { /* bulk mark later */ }} />
            <QuickAction label="Reminders" emoji="⏰" onPress={() => { /* open reminders */ }} />
          </ThemedView>
>>>>>>> Stashed changes
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
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260, // covers hero and rounded corners area
  },
  hero: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  greeting: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, opacity: 0.85 },
  actionsRow: {
    marginTop: 22,
    alignSelf: 'center',
    width: '100%'
  },
  actionsInner: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#eaf7ed',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 96,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#cbe9d0',
    // subtle shadow to lift buttons from the gradient
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  sectionTitle: { marginTop: 18, marginHorizontal: 18, marginBottom: 8 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { opacity: 0.6, textAlign: 'center' },
});
