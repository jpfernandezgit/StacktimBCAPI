import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { ListenButton } from '../../components/ListenButton';
import { StarField } from '../../components/StarField';
import { WaveformVisualizer } from '../../components/WaveformVisualizer';
import { Colors } from '../../constants/colors';
import { FontSizes, Spacing, Typography } from '../../constants/typography';
import { useListenStore } from '../../store/useListenStore';

/**
 * Home — the "Listening" screen. The single most important screen in the
 * app. Everything else exists to support this one.
 */
export default function HomeScreen() {
  const { t } = useTranslation();

  const state = useListenStore((s) => s.state);
  const setState = useListenStore((s) => s.setState);
  const globalStats = useListenStore((s) => s.globalStats);
  const updateGlobalStats = useListenStore((s) => s.updateGlobalStats);
  const currentSector = useListenStore((s) => s.currentSector);
  const setCurrentSector = useListenStore((s) => s.setCurrentSector);

  const isListening = state === 'listening' || state === 'processing';

  // Simulated live counter drift — real app gets this from Supabase Realtime.
  useEffect(() => {
    const id = setInterval(() => {
      updateGlobalStats({
        activePhones:
          globalStats.activePhones + Math.floor(Math.random() * 120 - 40),
      });
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotate the demo "current sector" while listening so the screen feels alive.
  useEffect(() => {
    if (!isListening) return;
    const id = setInterval(() => {
      setCurrentSector(randomSector());
    }, 4500);
    return () => clearInterval(id);
  }, [isListening, setCurrentSector]);

  const handleToggle = () => {
    setState(isListening ? 'idle' : 'listening');
    if (!isListening) {
      setCurrentSector(randomSector());
    } else {
      setCurrentSector(null);
    }
  };

  return (
    <View style={styles.root}>
      <StarField count={90} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <AnimatedCounter value={globalStats.activePhones} style={styles.counter} />
          <Text style={styles.counterLabel}>
            {t('home.listeningNow', { count: globalStats.activePhones }).replace(
              /^\d[\d,\.]*\s*/,
              '',
            )}
          </Text>
        </View>

        <View style={styles.center}>
          <WaveformVisualizer active={isListening} width={320} height={140} />
          {currentSector ? (
            <Text style={styles.sector}>
              {t('home.sector', { sector: currentSector })}
            </Text>
          ) : (
            <Text style={[styles.sector, { color: Colors.textDim }]}>
              ────  ────  ────
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <ListenButton
            active={isListening}
            onPress={handleToggle}
            label={isListening ? t('home.listening') : t('home.startListening')}
          />
          <Text style={styles.settingsLink} onPress={() => router.push('/settings')}>
            ⚙ Settings
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function randomSector(): string {
  const n = Math.floor(Math.random() * 99) + 1;
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${n}-${letter}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  counter: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
  },
  counterLabel: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sector: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    color: Colors.accentCyan,
    marginTop: Spacing.lg,
    letterSpacing: 1.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  settingsLink: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    letterSpacing: 1.5,
  },
});
