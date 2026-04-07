import { useMemo, useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'

const TXT = '#1E1E2E'
const TXT2 = '#9CA3AF'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E7EB'
const WHITE20 = 'rgba(139,92,246,0.08)'
const ACCENT = '#A3E635'

/* ── animated row with bounce on toggle ── */
function HabitRow({ habit, onToggle }) {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(habit.completed ? 0.7 : 1)).current
  const checkScale = useRef(new Animated.Value(habit.completed ? 1 : 0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: habit.completed ? 0.7 : 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.spring(checkScale, { toValue: habit.completed ? 1 : 0, useNativeDriver: true, tension: 60, friction: 5 }),
    ]).start()
  }, [habit.completed])

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 100, friction: 5 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 }),
    ]).start()
    onToggle(habit.id)
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[s.row, { opacity, transform: [{ scale }] }]}>
        <View style={[s.check, habit.completed && s.checked]}>
          <Animated.View style={[s.tickMark, { transform: [{ scale: checkScale }] }]}>
            <View style={s.tickShort} />
            <View style={s.tickLong} />
          </Animated.View>
        </View>
        <View style={s.info}>
          <Text style={[s.itemTxt, habit.completed && s.struck]}>{habit.title}</Text>
          <Text style={s.meta}>{habit.frequency}</Text>
        </View>
      </Animated.View>
    </Pressable>
  )
}

export default function HabitCard({ habits, onToggle }) {

  const done = habits.filter((h) => h.completed).length

  /* waveform heights (stable) */
  const wave = useMemo(
    () => Array.from({ length: 14 }, () => 10 + Math.random() * 30),
    [],
  )

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.label}>Consistency Track</Text>
      </View>

      <Text style={s.hero}>
        {done}
        <Text style={s.heroSup}>{` +${habits.length - done}`}</Text>
      </Text>

      {/* waveform */}
      <View style={s.waveRow}>
        {wave.map((h, i) => (
          <View
            key={i}
            style={[
              s.waveBar,
              { height: h },
              i < done && s.waveBarDone,
            ]}
          />
        ))}
      </View>

      {habits.map((h) => (
        <HabitRow key={h.id} habit={h} onToggle={onToggle} />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: { fontSize: 17, fontWeight: '600', color: TXT },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: WHITE20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeChar: { fontSize: 18, color: TXT2 },
  hero: { fontSize: 52, fontWeight: '800', color: TXT, marginBottom: 8 },
  heroSup: { fontSize: 18, fontWeight: '600', color: TXT2 },

  /* waveform */
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
    marginBottom: 16,
  },
  waveBar: {
    width: 7,
    borderRadius: 3.5,
    backgroundColor: '#E5E7EB',
  },
  waveBarDone: { backgroundColor: ACCENT },

  /* form */
  form: { marginBottom: 14, gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: TXT,
    backgroundColor: '#F9FAFB',
  },
  freqPick: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#F9FAFB',
  },
  freqTxt: { fontSize: 15, color: TXT, textTransform: 'capitalize' },
  addBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  addBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },

  /* items */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checked: { backgroundColor: '#A3E635', borderColor: '#A3E635' },
  tickMark: { flexDirection: 'row', alignItems: 'flex-end', width: 12, height: 10 },
  tickShort: { width: 2, height: 5, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '-40deg' }] },
  tickLong: { width: 2, height: 10, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '25deg' }], marginLeft: 1 },
  info: { flex: 1 },
  itemTxt: { fontSize: 15, color: TXT },
  struck: { textDecorationLine: 'line-through', color: TXT2 },
  meta: { fontSize: 12, color: TXT2, marginTop: 2, textTransform: 'capitalize' },
})
