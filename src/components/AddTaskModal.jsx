import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'

const TXT = '#2b2d1f'
const TXT2 = 'rgba(43,45,31,0.45)'
const BG = '#a8ab8e'
const CARD_BG = 'rgba(190,194,172,0.85)'
const WHITE20 = 'rgba(255,255,255,0.22)'
const ACCENT = '#c8e64a'

const FREQUENCIES = ['daily', 'weekly', 'monthly']

export default function AddTaskModal({ visible, onClose, onAddGoal, onAddHabit }) {
  const [step, setStep] = useState('type') // 'type' | 'details'
  const [taskType, setTaskType] = useState(null) // 'sprint' | 'consistency'
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [frequency, setFrequency] = useState('daily')

  const reset = () => {
    setStep('type')
    setTaskType(null)
    setTitle('')
    setDeadline('')
    setFrequency('daily')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handlePickType = (type) => {
    setTaskType(type)
    setStep('details')
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    if (taskType === 'sprint') {
      onAddGoal({ title: title.trim(), deadline })
    } else {
      onAddHabit({ title: title.trim(), frequency })
    }
    handleClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={s.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.kvWrap}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            {/* drag handle */}
            <View style={s.handleRow}>
              <View style={s.handle} />
            </View>

            {step === 'type' ? (
              /* ── Step 1: pick type ── */
              <View style={s.content}>
                <Text style={s.heading}>What kind of task?</Text>

                <Pressable
                  style={s.typeCard}
                  onPress={() => handlePickType('sprint')}
                >
                  <Text style={s.typeIcon}>⚡</Text>
                  <View style={s.typeInfo}>
                    <Text style={s.typeTitle}>Sprint</Text>
                    <Text style={s.typeDesc}>
                      One-time goal with a deadline
                    </Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </Pressable>

                <Pressable
                  style={s.typeCard}
                  onPress={() => handlePickType('consistency')}
                >
                  <Text style={s.typeIcon}>🔁</Text>
                  <View style={s.typeInfo}>
                    <Text style={s.typeTitle}>Consistency</Text>
                    <Text style={s.typeDesc}>
                      Recurring habit to build over time
                    </Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </Pressable>
              </View>
            ) : (
              /* ── Step 2: details ── */
              <View style={s.content}>
                <Pressable onPress={() => setStep('type')}>
                  <Text style={s.backTxt}>← Back</Text>
                </Pressable>

                <Text style={s.heading}>
                  {taskType === 'sprint'
                    ? 'New Sprint Goal'
                    : 'New Consistency Habit'}
                </Text>

                <TextInput
                  style={s.input}
                  placeholder="Name your task…"
                  placeholderTextColor={TXT2}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />

                {taskType === 'sprint' ? (
                  <TextInput
                    style={s.input}
                    placeholder="Deadline (YYYY-MM-DD)"
                    placeholderTextColor={TXT2}
                    value={deadline}
                    onChangeText={setDeadline}
                  />
                ) : (
                  <View>
                    <Text style={s.fieldLabel}>How often?</Text>
                    <View style={s.freqRow}>
                      {FREQUENCIES.map((f) => (
                        <Pressable
                          key={f}
                          style={[
                            s.freqChip,
                            frequency === f && s.freqChipActive,
                          ]}
                          onPress={() => setFrequency(f)}
                        >
                          <Text
                            style={[
                              s.freqChipTxt,
                              frequency === f && s.freqChipTxtActive,
                            ]}
                          >
                            {f}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                <Pressable
                  style={[s.submitBtn, !title.trim() && s.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!title.trim()}
                >
                  <Text style={s.submitBtnTxt}>
                    {taskType === 'sprint' ? 'Add Sprint' : 'Add Habit'}
                  </Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  kvWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(43,45,31,0.25)',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: TXT,
    marginBottom: 4,
  },

  /* type picker cards */
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: WHITE20,
    gap: 14,
  },
  typeIcon: {
    fontSize: 28,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TXT,
  },
  typeDesc: {
    fontSize: 13,
    color: TXT2,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: TXT2,
  },

  /* details form */
  backTxt: {
    fontSize: 15,
    color: TXT2,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(43,45,31,0.14)',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: TXT,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TXT2,
    marginBottom: 6,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 10,
  },
  freqChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: WHITE20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  freqChipActive: {
    backgroundColor: TXT,
    borderColor: TXT,
  },
  freqChipTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: TXT2,
    textTransform: 'capitalize',
  },
  freqChipTxtActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: TXT,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
