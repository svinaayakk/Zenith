import { useState } from 'react'
import CalendarPopup from './CalendarPopup'
import {
  View,
  Text,
  TextInput,
  Pressable,
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
  const [showCalendar, setShowCalendar] = useState(false)
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

  if (!visible) return null

  return (
    <View style={s.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.kvWrap}
      >
        <Pressable style={s.backdrop} onPress={handleClose} />
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
                <View style={s.typeIconWrap}>
                  <View style={s.sprintBolt1} />
                  <View style={s.sprintBolt2} />
                </View>
                <View style={s.typeInfo}>
                  <Text style={s.typeTitle}>Sprint</Text>
                  <Text style={s.typeDesc}>
                    One-time goal with a deadline
                  </Text>
                </View>
                <View style={s.arrowIndicator}>
                  <View style={s.arrowIndicatorLine} />
                  <View style={s.arrowIndicatorHead} />
                </View>
              </Pressable>

              <Pressable
                style={s.typeCard}
                onPress={() => handlePickType('consistency')}
              >
                <View style={s.typeIconWrap}>
                  <View style={s.loopRing} />
                  <View style={s.loopDot} />
                </View>
                <View style={s.typeInfo}>
                  <Text style={s.typeTitle}>Consistency</Text>
                  <Text style={s.typeDesc}>
                    Recurring habit to build over time
                  </Text>
                </View>
                <View style={s.arrowIndicator}>
                  <View style={s.arrowIndicatorLine} />
                  <View style={s.arrowIndicatorHead} />
                </View>
              </Pressable>
            </View>
          ) : (
            /* ── Step 2: details ── */
            <View style={s.content}>
              <Pressable style={s.backRow} onPress={() => setStep('type')}>
                <View style={s.backArrow}>
                  <View style={s.backArrowLine} />
                  <View style={s.backArrowHead} />
                </View>
                <Text style={s.backTxt}>Back</Text>
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
                <>
                  <Pressable
                    style={[s.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={{ color: deadline ? TXT : TXT2 }}>
                      {deadline ? deadline : 'Pick a due date'}
                    </Text>
                    <Text style={{ color: TXT2, fontSize: 18, marginLeft: 8 }}>📅</Text>
                  </Pressable>
                  <CalendarPopup
                    visible={showCalendar}
                    onSelect={(date) => { setDeadline(date); setShowCalendar(false) }}
                    onClose={() => setShowCalendar(false)}
                    initialDate={deadline}
                  />
                </>
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
    </View>
  )
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  kvWrap: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    width: 390,
    maxWidth: '100%',
    marginBottom: 0,
    zIndex: 101,
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
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: WHITE20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprintBolt1: { width: 10, height: 3, backgroundColor: TXT, borderRadius: 1.5, transform: [{ rotate: '-30deg' }], marginBottom: 1 },
  sprintBolt2: { width: 10, height: 3, backgroundColor: TXT, borderRadius: 1.5, transform: [{ rotate: '30deg' }], marginTop: -1 },
  loopRing: { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: TXT },
  loopDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: TXT, position: 'absolute', top: 6, right: 6 },
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
  arrowIndicator: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  arrowIndicatorLine: { position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: TXT2 },
  arrowIndicatorHead: { position: 'absolute', right: 2, width: 8, height: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: TXT2, transform: [{ rotate: '45deg' }] },

  /* details form */
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  backArrowLine: { position: 'absolute', width: 10, height: 2, borderRadius: 1, backgroundColor: TXT2 },
  backArrowHead: { position: 'absolute', left: 0, width: 7, height: 7, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: TXT2, transform: [{ rotate: '45deg' }] },
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
