import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { initI18n } from '../services/i18n';
import { useListenStore } from '../store/useListenStore';

export default function RootLayout() {
  const userId = useListenStore((s) => s.userId);
  const setUserId = useListenStore((s) => s.setUserId);
  const language = useListenStore((s) => s.settings.language);

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

  return (
    <>
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
    </>
  );
}
