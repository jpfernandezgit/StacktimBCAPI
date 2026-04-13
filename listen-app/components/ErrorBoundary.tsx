import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  info: string | null;
}

/**
 * Visible error boundary. When any child throws during render, we show the
 * error name, message and stack on a dark screen so a black/white screen
 * in Expo Go is never silent. Click-to-reload is not possible without a
 * full navigation reset, so users are asked to shake/reload manually.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    this.setState({
      error,
      info: info.componentStack?.slice(0, 4000) ?? null,
    });
    // eslint-disable-next-line no-console
    console.error('[LISTEN ErrorBoundary]', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;
    return <ErrorScreen error={this.state.error} info={this.state.info} />;
  }
}

const ErrorScreen: React.FC<{ error: Error; info: string | null }> = ({
  error,
  info,
}) => {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[LISTEN] Error screen displayed:', error.message);
  }, [error]);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>LISTEN crashed</Text>
        <Text style={styles.label}>Error</Text>
        <Text style={styles.body}>{error.name}</Text>
        <Text style={styles.body}>{error.message}</Text>
        {error.stack && (
          <>
            <Text style={styles.label}>Stack</Text>
            <Text style={styles.mono}>{error.stack.slice(0, 2000)}</Text>
          </>
        )}
        {info && (
          <>
            <Text style={styles.label}>Component stack</Text>
            <Text style={styles.mono}>{info}</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  content: {
    padding: 24,
    paddingTop: 64,
  },
  title: {
    color: '#EF476F',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    color: '#F8F9FA',
    fontSize: 15,
  },
  mono: {
    color: '#06D6A0',
    fontSize: 11,
    fontFamily: 'Courier',
  },
});
