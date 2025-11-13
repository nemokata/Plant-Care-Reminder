import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemePreference } from '@/state/theme-context';

// Wrapper that prefers the user-chosen scheme from ThemeProviderLocal,
// falling back to the system scheme when no provider is found.
export function useColorScheme() {
	try {
		const { scheme } = useThemePreference();
		return scheme;
	} catch {
		return useSystemColorScheme();
	}
}
