import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'

const TXT = '#1E1E2E'
const TXT2 = '#9CA3AF'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E7EB'
const WHITE20 = 'rgba(139,92,246,0.08)'
const ACCENT = '#8B5CF6'

/* ── animated row with bounce on toggle ── */
function GoalRow({ goal, onToggle }) {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(goal.completed ? 0.7 : 1)).current
  const checkScale = useRef(new Animated.Value(goal.completed ? 1 : 0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: goal.completed ? 0.7 : 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.spring(checkScale, { toValue: goal.completed ? 1 : 0, useNativeDriver: true, tension: 60, friction: 5 }),
    ]).start()
  }, [goal.completed])

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 100, friction: 5 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 }),
    ]).start()
    onToggle(goal.id)
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[s.row, { opacity, transform: [{ scale }] }]}>
        <View style={[s.check, goal.completed && s.checked]}>
          <Animated.View style={[s.tickMark, { transform: [{ scale: checkScale }] }]}>
            <View style={s.tickShort} />
            <View style={s.tickLong} />
          </Animated.View>
        </View>
        <View style={s.info}>
          <Text style={[s.itemTxt, goal.completed && s.struck]}>{goal.title}</Text>
          {goal.deadline ? <Text style={s.meta}>Due {goal.deadline}</Text> : null}
        </View>
      </Animated.View>
    </Pressable>
  )
}

export default function GoalCard({ goals, onToggle }) {

  const done = goals.filter((g) => g.completed).length

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.label}>Sprint Track</Text>
      </View>

      <Text style={s.hero}>
        {done}
        <Text style={s.heroSup}>{` +${goals.length - done}`}</Text>
      </Text>

      <View style={s.twoCol}>
        <Text style={s.dim}>Completed</Text>
        <Text style={s.dim}>Pending</Text>
      </View>

      {/* mini bar per goal */}
      <View style={s.barsRow}>
        {goals.map((g) => (
          <View
            key={g.id}
            style={[s.miniBar, g.completed && s.miniBarDone]}
          />
        ))}
      </View>

      {goals.map((g) => (
        <GoalRow key={g.id} goal={g} onToggle={onToggle} />
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
  hero: { fontSize: 52, fontWeight: '800', color: TXT, marginBottom: 4 },
  heroSup: { fontSize: 18, fontWeight: '600', color: TXT2 },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dim: { fontSize: 13, color: TXT2 },

  /* mini bars */
  barsRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  miniBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  miniBarDone: { backgroundColor: ACCENT },

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
  checked: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  tickMark: { flexDirection: 'row', alignItems: 'flex-end', width: 12, height: 10 },
  tickShort: { width: 2, height: 5, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '-40deg' }] },
  tickLong: { width: 2, height: 10, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '25deg' }], marginLeft: 1 },
  info: { flex: 1 },
  itemTxt: { fontSize: 15, color: TXT },
  struck: { textDecorationLine: 'line-through', color: TXT2 },
  meta: { fontSize: 12, color: TXT2, marginTop: 2 },
})
