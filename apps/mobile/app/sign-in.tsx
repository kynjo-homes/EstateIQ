import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  Pressable,
  Linking,
} from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, getWebBaseUrl, radius } from '@/lib/theme'

const webBase = getWebBaseUrl()

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError('')
    const err = await signIn(email.trim(), password.trim())
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    router.replace('/(drawer)')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Kynjo.Homes"
            />
          </View>

          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Sign in to your Kynjo.Homes account</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => void Linking.openURL(`${webBase}/forgot-password`)}
                hitSlop={8}
              >
                <Text style={styles.linkSmall}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputPw]}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.gray[400]}
                secureTextEntry={!showPw}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPw(p => !p)}
                accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.gray[400]}
                />
              </Pressable>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || !email.trim() || !password.trim()) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || !email.trim() || !password.trim()}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.buttonInner}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.buttonText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            No account?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => void Linking.openURL(`${webBase}/sign-up`)}
            >
              Create one
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 32,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 231,
    height: 66,
    maxWidth: '100%',
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    color: colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: colors.red[50],
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.red[700],
  },
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 6,
  },
  linkSmall: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.brand[600],
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    color: colors.gray[900],
  },
  inputPw: {
    paddingRight: 44,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.button,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.white,
  },
  footer: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 24,
  },
  footerLink: {
    color: colors.brand[600],
    fontFamily: fonts.sansMedium,
  },
})
