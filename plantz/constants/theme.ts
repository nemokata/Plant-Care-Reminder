/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Polished green-friendly palette with accessible contrast
const tintColorLight = '#2e7d32'; // green 700
const tintColorLightMuted = '#7aa77c';
const tintColorDark = '#a5d6a7';  // green 200

export const Colors = {
  light: {
    text: '#0b1a10',
    background: '#f3fbf5',
    card: '#ffffff',
    surface: '#f7fbf8',
    tint: tintColorLight,
    tintMuted: tintColorLightMuted,
    icon: '#2e7d32',
    tabIconDefault: '#7aa77c',
    tabIconSelected: tintColorLight,
    secondaryText: '#5b6a63',
    accent: '#fffefc'
  },
  dark: {
    text: '#eaf6ee',
    background: '#071107',
    card: '#0f1a11',
    surface: '#0a1a0d',
    tint: tintColorDark,
    tintMuted: '#4e8a56',
    icon: '#81c784',
    tabIconDefault: '#81c784',
    tabIconSelected: tintColorDark,
    secondaryText: '#9fc9a8',
    accent: '#071107'
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
