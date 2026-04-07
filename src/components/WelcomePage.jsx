import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native'
import ParticleField from './ParticleCanvas'

export default function WelcomePage({ onGoogleSignIn, onEmailSignUp, onEmailSignIn }) {
  const [mode, setMode] = useState(null) // null | 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  /* ── entrance animations ── */
  const titleFade = useRef(new Animated.Value(0)).current
  const titleSlide = useRef(new Animated.Value(30)).current
  const subtitleFade = useRef(new Animated.Value(0)).current
  const btnFade = useRef(new Animated.Value(0)).current
  const btnScale = useRef(new Animated.Value(0.9)).current
  const formFade = useRef(new Animated.Value(0)).current
  const formSlide = useRef(new Animated.Value(20)).current
  const exitFade = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(titleSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  const showMode = (m) => {
    setMode(m)
    setError('')
    formFade.setValue(0)
    formSlide.setValue(20)
    Animated.parallel([
      Animated.timing(formFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(formSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start()
  }

  const handleSubmit = async () => {
    setError('')
    if (!email.trim() || !password.trim()) return
    if (mode === 'signup' && !name.trim()) return
    setBusy(true)
    try {
      if (mode === 'signup') {
        await onEmailSignUp(email.trim(), password, name.trim())
      } else {
        await onEmailSignIn(email.trim(), password)
      }
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await onGoogleSignIn()
    } catch (e) {
      setError(e.message || 'Google sign-in failed')
      setBusy(false)
    }
  }

  const canSubmit =
    email.trim() && password.trim() && (mode === 'login' || name.trim())

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.particleArea}>
        <ParticleField />
      </View>

      <Animated.View style={[styles.content, { opacity: exitFade }]}>
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleFade, transform: [{ translateY: titleSlide }] },
          ]}
        >
          Welcome
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
          Your journey starts from here
        </Animated.Text>

        {!mode ? (
          <Animated.View
            style={{ width: '100%', opacity: btnFade, transform: [{ scale: btnScale }] }}
          >
            {/* Google Sign-In */}
            <Pressable style={styles.googleBtn} onPress={handleGoogle} disabled={busy}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email options */}
            <Pressable style={styles.btn} onPress={() => showMode('login')}>
              <Text style={styles.btnText}>Sign in with Email</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnOutline]}
              onPress={() => showMode('signup')}
            >
              <Text style={[styles.btnText, styles.btnOutlineText]}>Create Account</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              width: '100%',
              alignItems: 'center',
              opacity: formFade,
              transform: [{ translateY: formSlide }],
            }}
          >
            {mode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={50}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={email}
              onChangeText={setEmail}
              autoFocus={mode === 'login'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.btn, (!canSubmit || busy) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || busy}
            >
              <Text style={styles.btnText}>
                {busy ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Text>
            </Pressable>

            <Pressable onPress={() => { setMode(null); setError('') }}>
              <Text style={styles.backLink}>← Back to options</Text>
            </Pressable>

            <Text style={styles.footer}>
              By continuing you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: '100%',
  },
  particleArea: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 28,
    paddingBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 40,
  },
  googleBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    color: '#1E1E2E',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginHorizontal: 12,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnOutlineText: {
    fontWeight: '600',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  backLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: 'rgba(255,255,255,0.55)',
    textDecorationLine: 'underline',
  },
})
