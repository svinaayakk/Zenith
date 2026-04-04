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

export default function WelcomePage({ onContinue }) {
  const [name, setName] = useState('')
  const [showForm, setShowForm] = useState(false)

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

  const showFormAnimated = () => {
    setShowForm(true)
    Animated.parallel([
      Animated.timing(formFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(formSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start()
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    Animated.timing(exitFade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onContinue(name.trim()))
  }

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

        {!showForm ? (
          <Animated.View
            style={{ width: '100%', opacity: btnFade, transform: [{ scale: btnScale }] }}
          >
            <Pressable style={styles.btn} onPress={showFormAnimated}>
              <Text style={styles.btnText}>Get Started</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={50}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <Pressable
              style={[styles.btn, !name.trim() && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim()}
            >
              <Text style={styles.btnText}>Continue</Text>
            </Pressable>

            <Text style={styles.footer}>
              By pressing "Continue" you agree to our{' '}
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
    backgroundColor: '#000',
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
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 16,
    marginBottom: 14,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
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
