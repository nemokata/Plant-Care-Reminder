import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/state/auth-context';
import { router } from 'expo-router';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await signUp(email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 12 }}>Create account</ThemedText>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <Pressable onPress={onSubmit} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]} disabled={loading}>
        <ThemedText style={styles.btnText}>{loading ? 'Creating…' : 'Sign up'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 18 },
  input: {
    backgroundColor: '#f5fbf6',
    borderWidth: 1,
    borderColor: '#d8efe0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  btn: { marginTop: 16, backgroundColor: '#2e7d32', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
});
