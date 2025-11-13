import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemePreference } from '@/state/theme-context';
import { Pressable } from 'react-native';

export default function TabLayout() {
  const { scheme, toggle } = useThemePreference();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[scheme].tint,
        headerShown: true,
        headerRight: () => (
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={scheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ paddingHorizontal: 12 }}
          >
            <IconSymbol size={22} name={scheme === 'dark' ? 'sun.max.fill' : 'moon.fill'} color={Colors[scheme].tint} />
          </Pressable>
        ),
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="common"
        options={{
          title: 'Common',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="leaf.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
