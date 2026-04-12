import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StarField } from '../../components/StarField';
import { WorldMap } from '../../components/WorldMap';
import { Colors } from '../../constants/colors';
import { FontSizes, Radii, Spacing, Typography } from '../../constants/typography';
import { useListenStore } from '../../store/useListenStore';

const MOCK_COUNTRIES = [
  { flag: '🇺🇸', name: 'United States', phones: 3_104_221 },
  { flag: '🇮🇳', name: 'India', phones: 2_487_003 },
  { flag: '🇧🇷', name: 'Brazil', phones: 1_902_881 },
  { flag: '🇩🇪', name: 'Germany', phones: 1_118_402 },
  { flag: '🇯🇵', name: 'Japan', phones: 971_440 },
  { flag: '🇫🇷', name: 'France', phones: 842_712 },
  { flag: '🇬🇧', name: 'United Kingdom', phones: 788_145 },
  { flag: '🇲🇽', name: 'Mexico', phones: 612_003 },
  { flag: '🇨🇦', name: 'Canada', phones: 441_822 },
  { flag: '🇦🇺', name: 'Australia', phones: 338_901 },
];

export default function NetworkScreen() {
  const { t } = useTranslation();
  const stats = useListenStore((s) => s.globalStats);
  const width = Dimensions.get('window').width - Spacing.xl * 2;

  return (
    <View style={styles.root}>
      <StarField count={60} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('network.title').toUpperCase()}</Text>

          <WorldMap width={width} height={width * 0.55} density={0.9} />

          <View style={styles.statsRow}>
            <Stat label="🌍" value={`${stats.countries}`} />
            <Stat label="📱" value={formatBig(stats.activePhones)} />
            <Stat label="⚡" value={`${stats.petaFlops.toFixed(1)} PF`} />
            <Stat label="📡" value={`${stats.skySectorsScanned}`} />
          </View>

          <Text style={styles.sectionTitle}>COUNTRY RANKING</Text>
          {MOCK_COUNTRIES.map((c, i) => (
            <View key={c.name} style={styles.row}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.flag}>{c.flag}</Text>
              <Text style={styles.country}>{c.name}</Text>
              <Text style={styles.phones}>{formatBig(c.phones)}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statIcon}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

function formatBig(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
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
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
  },
  statIcon: {
    fontSize: FontSizes.lg,
  },
  statValue: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rank: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    color: Colors.textDim,
    width: 40,
  },
  flag: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.md,
  },
  country: {
    flex: 1,
    fontFamily: Typography.body,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  phones: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    color: Colors.accentCyan,
  },
});
