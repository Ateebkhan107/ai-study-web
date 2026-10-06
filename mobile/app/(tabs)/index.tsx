import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { useAuth, useUser } from '@clerk/expo';
import { useApi } from '../../lib/api';

export default function HomeScreen() {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const api = useApi();
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [hasTested, setHasTested] = useState(false);

  useEffect(() => {
    async function testApi() {
      if (!isSignedIn || hasTested) return;
      
      setHasTested(true);
      setLoading(true);
      const { data, error } = await api.fetch('/access');
      
      if (error) {
        setApiResult({ status: 'Error', error });
      } else {
        setApiResult({ status: 'Connected', data });
      }
      setLoading(false);
    }
    
    testApi();
  }, [isSignedIn, api, hasTested]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Home (Dashboard)</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Authentication Status</Text>
        <Text style={styles.text}>Authenticated: {isSignedIn ? 'Yes' : 'No'}</Text>
        <Text style={styles.text}>User: {user?.firstName} {user?.lastName}</Text>
        <Text style={styles.text}>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>API Connectivity Test (/api/access)</Text>
        <Text style={styles.text}>Status: {loading ? 'Testing...' : apiResult?.status}</Text>
        
        {apiResult?.data && (
          <View style={styles.resultBox}>
            <Text style={styles.codeText}>Plan: {apiResult.data.plan}</Text>
            <Text style={styles.codeText}>Exam: {apiResult.data.examTrack}</Text>
            <Text style={styles.codeText}>Account: {apiResult.data.accountType}</Text>
            <Text style={styles.codeText}>Pro: {apiResult.data.isPro ? 'Yes' : 'No'}</Text>
          </View>
        )}
        
        {apiResult?.error && (
          <View style={[styles.resultBox, { borderColor: Theme.colors.danger }]}>
            <Text style={styles.codeText}>{JSON.stringify(apiResult.error, null, 2)}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxl * 1.5,
  },
  title: {
    fontSize: Theme.typography.sizes.h1,
    color: Theme.colors.text,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  cardTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  text: {
    color: Theme.colors.textMuted,
    fontSize: Theme.typography.sizes.base,
    marginBottom: Theme.spacing.xs,
  },
  resultBox: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: Theme.typography.fontFamily.mono,
    color: Theme.colors.textMuted,
    fontSize: Theme.typography.sizes.sm,
  },
  button: {
    marginTop: Theme.spacing.lg,
    height: 50,
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Theme.colors.danger,
    fontWeight: 'bold',
    fontSize: Theme.typography.sizes.base,
  }
});
