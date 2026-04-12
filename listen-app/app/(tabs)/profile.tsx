import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConstellationAvatar } from '../../components/ConstellationAvatar';
import { SkyMap } from '../../components/SkyMap';
import { StarField } from '../../components/StarField';
import { Colors } from '../../constants/colors';
import { FontSizes, Radii, Spacing, Typography } from '../../constants/typography';
import { useListenStore } from '../../store/useListenStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const userId = useListenStore((s) => s.userId) ?? 'anonymous';
  const stats = useListenStore((s) => s.stats);
  const currentSector = useListenStore((s) => s.currentSector);

  const metrics: Array<[string, string]> = [
    [t('profile.totalHours'), `${stats.totalHours.toFixed(0)}h`],
    [t('profile.packets'), stats.totalPacketsProcessed.toLocaleString('en-US')],
    [t('profile.anomalies'), `${stats.anomaliesDetected}`],
    [t('profile.coverage'), `${(stats.skyCoverage * 100).toFixed(1)}%`],
    [t('profile.globalRank'), '#48,291'],
    [t('profile.countryRank'), '#1,204'],
  ];

  return (
    <View style={styles.root}>
      <StarField count={60} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ConstellationAvatar userId={userId} size={140} />
            <Text style={styles.userId}>{userId}</Text>
          </View>

          <Text style={styles.sectionTitle}>STATS</Text>
          <View style={styles.metrics}>
            {metrics.map(([label, value]) => (
              <View key={label} style={styles.metric}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={styles.metricValue}>{value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>SKY COVERAGE</Text>
          <View style={styles.skyMapWrap}>
            <SkyMap
              size={260}
              scannedSectors={stats.scannedSectors}
              currentSector={currentSector}
            />
          </View>
          <Text style={styles.hint}>
            Light up the entire sky. One sector at a time.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  safe: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  userId: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    color: Colors.textDim,
    marginTop: Spacing.md,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metric: {
    width: '48%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  metricLabel: {
    fontFamily: Typography.body,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  skyMapWrap: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  hint: {
    fontFamily: Typography.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
