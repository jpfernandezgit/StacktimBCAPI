import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Colors } from '../constants/colors';
import { useLoadFonts } from '../services/fonts';
import { initI18n } from '../services/i18n';
import { useListenStore } from '../store/useListenStore';

export default function RootLayout() {
  const userId = useListenStore((s) => s.userId);
  const setUserId = useListenStore((s) => s.setUserId);
  const language = useListenStore((s) => s.settings.language);

  // Best-effort font loading — if the TTFs are not bundled yet the hook
  // immediately resolves to "ready" and we fall back to system monospaces.
  const fontsReady = useLoadFonts();

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

  if (!fontsReady) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
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
