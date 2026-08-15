import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { registerUser } from '../../services/userService';
import CustomButton from '../../components/CustomButton';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !username || !password) return;
    setLoading(true);
    try {
      await registerUser(email, password, username);
      // App.tsx will automatically detect the new session and log you in!
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>lockin.</Text>
      <Text style={styles.subtitle}>make the pact. do the work.</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Username (no spaces)" placeholderTextColor="#666" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry />

      <CustomButton title="CREATE PACT" onPress={handleRegister} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already locked in? Login here.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 24 },
  logo: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: -2, marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 40 },
  input: { backgroundColor: '#111', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  link: { color: '#666', textAlign: 'center', marginTop: 24, fontSize: 14 }
});
