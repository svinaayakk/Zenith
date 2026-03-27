import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'

const TXT = '#2b2d1f'
const TXT2 = 'rgba(43,45,31,0.45)'
const CARD_BG = 'rgba(190,194,172,0.52)'
const CARD_BORDER = 'rgba(255,255,255,0.22)'
const WHITE20 = 'rgba(255,255,255,0.22)'
const ACCENT = '#c8e64a'

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
          <Animated.Text style={[s.tick, { transform: [{ scale: checkScale }] }]}>
            ✓
          </Animated.Text>
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
  hero: { fontSize: 52, fontWeight: '700', color: TXT, marginBottom: 4 },
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
    backgroundColor: 'rgba(43,45,31,0.14)',
  },
  miniBarDone: { backgroundColor: ACCENT },

  /* form */
  form: { marginBottom: 14, gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(43,45,31,0.14)',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: TXT,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  addBtn: {
    backgroundColor: TXT,
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
    borderTopColor: 'rgba(43,45,31,0.07)',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(43,45,31,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checked: { backgroundColor: TXT, borderColor: TXT },
  tick: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  info: { flex: 1 },
  itemTxt: { fontSize: 15, color: TXT },
  struck: { textDecorationLine: 'line-through', color: TXT2 },
  meta: { fontSize: 12, color: TXT2, marginTop: 2 },
})
