import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { registerUser } from '../../services/userService';
import AuthInput from '../../components/auth/AuthInput';
import SocialButton from '../../components/auth/SocialButton';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!trimmedEmail || !cleanUsername || !password) {
      Alert.alert("Missing Fields", "Please fill in email, username, and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(trimmedEmail, password, cleanUsername);
      // App.tsx automatically detects the new session and transitions to MainNavigator!
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMock = (providerName: string) => {
    Alert.alert(providerName, `${providerName} sign-up can be connected in Firebase Console.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Logo */}
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>LOCKIN</Text>
            </View>
          </View>

          {/* Watermelon UI auth-01 Outer Card (rounded-4xl, bg-muted, border-border, p-2) */}
          <View style={styles.outerCard}>
            
            {/* Watermelon UI auth-01 Inner Inset Card (rounded-3xl, bg-background, px-2 py-6, shadow) */}
            <View style={styles.innerCard}>
              
              {/* Header */}
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Make the pact</Text>
                <Text style={styles.subtitle}>
                  Join your circle, build streaks, and conquer your goals.
                </Text>
              </View>

              {/* Form Input Fields */}
              <View style={styles.formContainer}>
                <AuthInput
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconType="email"
                />

                <AuthInput
                  placeholder="Username (e.g. farhan)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  iconType="user"
                />

                <AuthInput
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  iconType="lock"
                />

                {/* Primary Submit Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.submitButtonPressed,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#000000" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create pact account</Text>
                  )}
                </Pressable>
              </View>

              {/* Separator / Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login 3-Column Grid */}
              <View style={styles.socialGrid}>
                <SocialButton
                  label="Google"
                  iconText="G"
                  onPress={() => handleSocialMock("Google")}
                />
                <SocialButton
                  label="Apple"
                  iconText=""
                  onPress={() => handleSocialMock("Apple")}
                />
                <SocialButton
                  label="GitHub"
                  iconText="⌘"
                  onPress={() => handleSocialMock("GitHub")}
                />
              </View>

            </View>

            {/* Watermelon UI auth-01 Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerPrompt}>
                Already locked in?{' '}
                <Text 
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign in here
                </Text>
              </Text>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  brandBadgeText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  
  // Watermelon UI auth-01: Outer Card Container
  outerCard: {
    backgroundColor: '#18181b', // bg-muted in dark mode
    borderWidth: 1,
    borderColor: '#27272a',     // border-border
    borderRadius: 32,          // rounded-4xl
    padding: 8,                // p-2
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },

  // Watermelon UI auth-01: Inner Inset Card
  innerCard: {
    backgroundColor: '#09090b', // bg-background
    borderRadius: 24,          // rounded-3xl
    paddingHorizontal: 18,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#1f1f23',
  },

  // Header Typography
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fafafa',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#ffffff',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#27272a',
  },
  dividerText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 10,
  },

  // Social Grid
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },

  // Watermelon UI auth-01 Footer
  footerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerPrompt: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  footerLink: {
    color: '#fafafa',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
