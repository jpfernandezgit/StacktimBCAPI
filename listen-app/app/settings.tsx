import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FontSizes, Radii, Spacing, Typography } from '../constants/typography';
import { useListenStore } from '../store/useListenStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useListenStore((s) => s.settings);
  const updateSettings = useListenStore((s) => s.updateSettings);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
          <Text style={styles.title}>{t('settings.title').toUpperCase()}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Row
            label={t('settings.wifiOnly')}
            value={settings.wifiOnly}
            onToggle={(v) => updateSettings({ wifiOnly: v })}
          />
          <Row
            label={t('settings.chargingOnly')}
            value={settings.chargingOnly}
            onToggle={(v) => updateSettings({ chargingOnly: v })}
          />
          <Row
            label={t('settings.notifications')}
            value={settings.notificationsEnabled}
            onToggle={(v) => updateSettings({ notificationsEnabled: v })}
          />

          <Info
            label={t('settings.quietHours')}
            value={`${pad(settings.quietStartHour)}:00 → ${pad(settings.quietEndHour)}:00`}
          />
          <Info
            label={t('settings.dataLimit')}
            value={`${Math.round(settings.maxBytesPerNight / 1024 / 1024)} MB / night`}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRANSPARENCY</Text>
            <Text style={styles.paragraph}>
              LISTEN only processes public radio-telescope packets. Your device
              does not record audio, location or personal data. We cannot see
              what is on your phone — only the result of each scientific
              analysis: a score between 0 and 100, a list of detected peak
              frequencies, and the sky sector you analysed. That is it.
            </Text>
            <Text style={styles.paragraph}>
              You paid $1 to join the search. No ads. No subscriptions. Ever.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const Row: React.FC<{
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}> = ({ label, value, onToggle }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: Colors.border, true: Colors.accentCyan }}
      thumbColor={Colors.textPrimary}
    />
  </View>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

function pad(h: number): string {
  return h.toString().padStart(2, '0');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  close: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    width: 24,
  },
  title: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    letterSpacing: 3,
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.xl, paddingTop: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  rowLabel: {
    fontFamily: Typography.body,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  rowValue: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    color: Colors.accentCyan,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  paragraph: {
    fontFamily: Typography.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
});
