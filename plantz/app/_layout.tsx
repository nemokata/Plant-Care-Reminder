import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PlantsProvider } from '@/state/plants-context';
<<<<<<< Updated upstream
import { AuthProvider, useAuth } from '@/state/auth-context';
import { Pressable, Text } from 'react-native';
=======
import { ThemeProviderLocal, useThemePreference } from '@/state/theme-context';
>>>>>>> Stashed changes

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerRoot() {
  const { scheme } = useThemePreference();
  return (
<<<<<<< Updated upstream
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <PlantsProvider>
=======
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PlantsProvider>
>>>>>>> Stashed changes
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerTitle: 'Plantz',
              headerRight: () => <HeaderAuthButton />,
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="plant-modal" options={{ presentation: 'modal', title: 'Plant' }} />
        </Stack>
<<<<<<< Updated upstream
        </PlantsProvider>
      </AuthProvider>
  <StatusBar style="dark" />
=======
      </PlantsProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
>>>>>>> Stashed changes
    </ThemeProvider>
  );
}

<<<<<<< Updated upstream
function HeaderAuthButton() {
  const { user, signOutUser } = useAuth();
  const first = user?.displayName?.split(' ')[0];
  const label = user ? (first ? `Sign out (${first})` : 'Sign out') : 'Sign in';
  return (
    <Pressable onPress={() => (user ? signOutUser() : router.push('/auth/sign-in'))} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ color: '#2e7d32', fontWeight: '700' }}>{label}</Text>
    </Pressable>
=======
export default function RootLayout() {
  return (
    <ThemeProviderLocal>
      <InnerRoot />
    </ThemeProviderLocal>
>>>>>>> Stashed changes
  );
}
