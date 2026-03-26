import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import ParticleField from './ParticleCanvas'

export default function WelcomePage({ onContinue }) {
  const [name, setName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = () => {
    if (name.trim()) onContinue(name.trim())
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.particleArea}>
        <ParticleField />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Your journey starts from here</Text>

        {!showForm ? (
          <Pressable style={styles.btn} onPress={() => setShowForm(true)}>
            <Text style={styles.btnText}>Get Started</Text>
          </Pressable>
        ) : (
          <>
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
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  particleArea: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
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
