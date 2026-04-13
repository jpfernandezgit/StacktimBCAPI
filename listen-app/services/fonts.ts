/**
 * Best-effort font loader.
 *
 * Why the indirection: Metro resolves `require()` calls statically at bundle
 * time, so writing `require('../assets/fonts/SpaceMono-Regular.ttf')` would
 * crash the bundler if the file is missing. Here we use expo-font's async
 * `loadAsync` with a string-keyed object and wrap each call in a try/catch,
 * so a missing TTF degrades gracefully to the platform's system monospace
 * instead of taking the whole app down.
 *
 * To actually ship the custom fonts, drop the two TTFs under
 * `assets/fonts/` (see assets/fonts/README.md) and either switch to
 * `useFonts` with a static require map, or extend `FONT_SOURCES` below with
 * real `require(...)` calls once the files exist in the repo.
 */

import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

// Declared as a function so the module stays pure and tree-shakeable.
// Populate this array once real TTF assets are committed.
const FONT_SOURCES: Array<{ name: string; asset: number }> = [];

export function useLoadFonts(): boolean {
  const [ready, setReady] = useState(FONT_SOURCES.length === 0);

  useEffect(() => {
    if (FONT_SOURCES.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const map: Record<string, Font.FontSource> = {};
        for (const { name, asset } of FONT_SOURCES) map[name] = asset;
        await Font.loadAsync(map);
      } catch {
        // Swallow — we'll use system fonts on failure.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
