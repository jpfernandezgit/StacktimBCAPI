import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Colors } from '../constants/colors';
import { initI18n } from '../services/i18n';
import { useListenStore } from '../store/useListenStore';

// Keep the native splash up until fonts have loaded so the first paint is
// guaranteed to be in mission-control style, not the system default.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const userId = useListenStore((s) => s.userId);
  const setUserId = useListenStore((s) => s.setUserId);
  const language = useListenStore((s) => s.settings.language);

  // Bundled-font loading. The two font files are resolved via the @expo/vector
  // fonts pipeline; when packaging the app the files should live under
  // assets/fonts/. If they are missing we still boot with system defaults.
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    DMSans: require('../assets/fonts/DMSans-Regular.ttf'),
  });

  useEffect(() => {
    initI18n(language);
  }, [language]);

  useEffect(() => {
    if (!userId) {
      // Generate a stable anonymous id. Real app would pair with Supabase auth.
      const id = `u_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      setUserId(id);
    }
  }, [userId, setUserId]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <View
      style={{ flex: 1, backgroundColor: Colors.bgPrimary }}
      onLayout={onLayoutRootView}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bgPrimary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
