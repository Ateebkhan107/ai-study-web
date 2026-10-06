import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { Link } from 'expo-router';
import { useSSO } from '@clerk/expo';
import * as Linking from 'expo-linking';

export default function SignUpScreen() {
  const { startSSOFlow } = useSSO();

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/(tabs)', { scheme: 'mobile' })
      });

      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Join PrepZii Mobile</Text>
      
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Sign up with Google</Text>
      </TouchableOpacity>
      
      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.sizes.h1,
    color: Theme.colors.text,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xl,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  buttonText: {
    color: Theme.colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: Theme.typography.sizes.base,
  },
  link: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.sizes.sm,
  }
});
