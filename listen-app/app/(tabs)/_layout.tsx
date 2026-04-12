import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSizes, Typography } from '../../constants/typography';

/**
 * Minimal tab bar. No icon library needed — we use monospace glyphs to keep
 * the mission-control vibe consistent.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgPrimary,
          borderTopColor: Colors.border,
          height: 64,
        },
        tabBarActiveTintColor: Colors.accentCyan,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: Typography.mono,
          fontSize: FontSizes.xs,
          letterSpacing: 1.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'LISTEN',
          tabBarIcon: ({ color }) => <Glyph char="◉" color={color} />,
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'NETWORK',
          tabBarIcon: ({ color }) => <Glyph char="⌘" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discoveries"
        options={{
          title: 'DISCOVER',
          tabBarIcon: ({ color }) => <Glyph char="✦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'IMPACT',
          tabBarIcon: ({ color }) => <Glyph char="☉" color={color} />,
        }}
      />
    </Tabs>
  );
}

const Glyph: React.FC<{ char: string; color: string }> = ({ char, color }) => (
  <Text style={{ color, fontSize: 18 }}>{char}</Text>
);
