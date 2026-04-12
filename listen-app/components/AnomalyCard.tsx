import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSizes, Radii, Spacing, Typography } from '../constants/typography';

export type AnomalyStatus = 'verifying' | 'critical' | 'resolved' | 'contact';

export interface Anomaly {
  id: string;
  skySector: string;
  ra: string;
  dec: string;
  score: number;
  detectedBy: number;
  status: AnomalyStatus;
  statusLabel: string;
  timestamp: string;
  resolution?: string;
}

interface AnomalyCardProps {
  anomaly: Anomaly;
  onPress?: () => void;
}

const STATUS_COLORS: Record<AnomalyStatus, string> = {
  verifying: Colors.accentGold,
  critical: Colors.accentRed,
  resolved: Colors.textSecondary,
  contact: Colors.accentGreen,
};

const STATUS_ICONS: Record<AnomalyStatus, string> = {
  verifying: '●',
  critical: '●',
  resolved: '○',
  contact: '●',
};

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly, onPress }) => {
  const color = STATUS_COLORS[anomaly.status];
  return (
    <View
      style={[styles.card, { borderLeftColor: color }]}
      onTouchEnd={onPress}
    >
      <View style={styles.row}>
        <Text style={[styles.icon, { color }]}>{STATUS_ICONS[anomaly.status]}</Text>
        <Text style={[styles.status, { color }]}>{anomaly.statusLabel.toUpperCase()}</Text>
      </View>
      <Text style={styles.sector}>
        Sector {anomaly.skySector} · RA {anomaly.ra} · Dec {anomaly.dec}
      </Text>
      <Text style={styles.metrics}>
        Score {anomaly.score}/100 · Detected by {anomaly.detectedBy.toLocaleString('en-US')} phones
      </Text>
      {anomaly.resolution && (
        <Text style={styles.resolution}>{anomaly.resolution}</Text>
      )}
      <Text style={styles.timestamp}>{anomaly.timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.md,
    borderLeftWidth: 3,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: FontSizes.base,
    marginRight: Spacing.sm,
  },
  status: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 1.5,
  },
  sector: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  metrics: {
    fontFamily: Typography.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  resolution: {
    fontFamily: Typography.body,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    fontFamily: Typography.mono,
    fontSize: FontSizes.xs,
    color: Colors.textDim,
    marginTop: Spacing.xs,
  },
});
