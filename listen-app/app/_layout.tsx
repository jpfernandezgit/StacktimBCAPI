import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Colors } from '../constants/colors';
// Importing the module for its side effect: it initialises i18next at
// bundle load time, BEFORE any screen component calls useTranslation().
import '../services/i18n';
import { useListenStore } from '../store/useListenStore';

/**
 * Root layout.
 *
 * Kept intentionally minimal:
 *   - no conditional return-null (that's what produced the white screen in
 *     Expo Go on SDK 54 — the splash never got a chance to hand off)
 *   - wraps the whole tree in GestureHandlerRootView for Reanimated 4 /
 *     gesture handler 2.28, which need it at the root
 *   - wraps in a visible ErrorBoundary so any render error surfaces as
 *     text instead of a blank screen
 *   - i18n is initialised at module-load time, not here, so the first
 *     render of any child screen sees a fully-configured i18next
 */
export default function RootLayout() {
  const userId = useListenStore((s) => s.userId);
  const setUserId = useListenStore((s) => s.setUserId);

  useEffect(() => {
    if (!userId) {
      const id = `u_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      setUserId(id);
    }
  }, [userId, setUserId]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
