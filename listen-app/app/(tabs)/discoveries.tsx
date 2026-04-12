import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Anomaly, AnomalyCard } from '../../components/AnomalyCard';
import { StarField } from '../../components/StarField';
import { Colors } from '../../constants/colors';
import { FontSizes, Spacing, Typography } from '../../constants/typography';

const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: '1',
    skySector: '47-J',
    ra: '14h22m',
    dec: "+38°12'",
    score: 87,
    detectedBy: 2_481,
    status: 'verifying',
    statusLabel: 'Anomaly detected',
    timestamp: 'Apr 12, 2026 · 03:42 UTC',
  },
  {
    id: '2',
    skySector: '12-A',
    ra: '19h21m',
    dec: "+21°53'",
    score: 72,
    detectedBy: 891,
    status: 'resolved',
    statusLabel: 'Resolved — Natural source',
    timestamp: 'Apr 10, 2026 · 21:15 UTC',
    resolution: 'Pulsar PSR B1919+21',
  },
  {
    id: '3',
    skySector: '83-F',
    ra: '05h34m',
    dec: "+22°00'",
    score: 96,
    detectedBy: 12_003,
    status: 'critical',
    statusLabel: 'High priority anomaly',
    timestamp: 'Apr 09, 2026 · 11:08 UTC',
  },
  {
    id: '4',
    skySector: '33-C',
    ra: '22h57m',
    dec: "-07°14'",
    score: 68,
    detectedBy: 612,
    status: 'resolved',
    statusLabel: 'Resolved — Terrestrial RFI',
    timestamp: 'Apr 07, 2026 · 02:31 UTC',
    resolution: 'Commercial satellite downlink',
  },
];

export default function DiscoveriesScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <StarField count={50} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('discoveries.title').toUpperCase()}</Text>
          <Text style={styles.subtitle}>
            Anomalies crowd-verified by the network
          </Text>
          {MOCK_ANOMALIES.map((a) => (
            <AnomalyCard key={a.id} anomaly={a} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  safe: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.lg,
    letterSpacing: 3,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
});
