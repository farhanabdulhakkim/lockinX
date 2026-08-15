import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { loginUser } from '../../services/userService';
import CustomButton from '../../components/CustomButton';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await loginUser(email, password);
    } catch (error: any) {
      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>lockin.</Text>
      
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry />

      <CustomButton title="LOGIN" onPress={handleLogin} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Need an account? Sign up.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 24 },
  logo: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: -2, marginBottom: 40 },
  input: { backgroundColor: '#111', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  link: { color: '#666', textAlign: 'center', marginTop: 24, fontSize: 14 }
});
