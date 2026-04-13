import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StarField } from '../components/StarField';
import { Waveform } from '../components/waveform';
import { Colors } from '../constants/colors';
import { FontSizes, Radii, Spacing, Typography } from '../constants/typography';

type Step = 0 | 1 | 2;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(0);

  const next = () => {
    if (step === 2) {
      router.replace('/(tabs)');
    } else {
      setStep((step + 1) as Step);
    }
  };

  return (
    <View style={styles.root}>
      <StarField count={120} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {step === 0 && (
            <Animated.View entering={FadeIn.duration(800)} exiting={FadeOut}>
              <Text style={styles.hero}>{t('onboarding.title1')}</Text>
            </Animated.View>
          )}

          {step === 1 && (
            <Animated.View entering={FadeIn.duration(800)} exiting={FadeOut}>
              <Text style={styles.body}>{t('onboarding.body2')}</Text>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View
              entering={FadeIn.duration(800)}
              exiting={FadeOut}
              style={{ alignItems: 'center' }}
            >
              <Waveform active={true} width={320} height={120} />
              <Text style={[styles.body, { marginTop: Spacing.xl }]}>
                {t('onboarding.body3')}
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.footer}>
          <Dots active={step} />
          <Pressable style={styles.button} onPress={next}>
            <Text style={styles.buttonLabel}>
              {step === 2 ? t('onboarding.start') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const Dots: React.FC<{ active: number }> = ({ active }) => (
  <View style={styles.dots}>
    {[0, 1, 2].map((i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i === active && { backgroundColor: Colors.accentCyan, width: 24 },
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  safe: { flex: 1, padding: Spacing.xl },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.display,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  body: {
    fontFamily: Typography.body,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textDim,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: Colors.accentCyan,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
  },
  buttonLabel: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    letterSpacing: 2,
    color: Colors.bgPrimary,
  },
});
