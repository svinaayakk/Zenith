import { useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native'
import GoalCard from './GoalCard'
import HabitCard from './HabitCard'
import BottomTabBar from './BottomTabBar'
import AnimatedAvatar from './AnimatedAvatar'
import AddTaskModal from './AddTaskModal'

const SCREEN_W = 390

/* ---- palette (clean modern) ---- */
const BG = '#F5F5F7'
const CARD_BG = '#FFFFFF'
const CARD_DARK = '#1E1E2E'
const CARD_BORDER = '#E5E7EB'
const TXT = '#1E1E2E'
const TXT2 = '#9CA3AF'
const ACCENT = '#8B5CF6'
const ACCENT_LIGHT = 'rgba(139,92,246,0.10)'
const GREEN = '#A3E635'

/* ---- tiny arrow‑badge ---- */
function ArrowBadge() {
  return (
    <View style={s.arrowBadge}>
      <View style={s.arrowLine} />
      <View style={s.arrowHead} />
    </View>
  )
}

/* ---- dotted arc connector (like the flight route arc) ---- */
function DottedArc() {
  const dots = 12
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, gap: 4 }}>
      {Array.from({ length: dots }, (_, i) => {
        const progress = i / (dots - 1)
        const y = -Math.sin(progress * Math.PI) * 10
        return (
          <View
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: i < dots / 2 ? ACCENT : TXT2,
              opacity: 0.6,
              transform: [{ translateY: y }],
            }}
          />
        )
      })}
    </View>
  )
}

/* ---- slider‑style progress bar ---- */
function SliderBar({ ratio }) {
  const pct = Math.max(0, Math.min(ratio, 1))
  return (
    <View style={s.sliderWrap}>
      {/* handle */}
      <View style={[s.sliderDot, { left: `${pct * 100}%` }]} />
      {/* track */}
      <View style={s.sliderTrack}>
        <View style={[s.sliderFill, { flex: pct || 0.001 }]} />
        <View style={{ flex: 1 - pct || 0.001 }} />
      </View>
      {/* tick marks */}
      <View style={s.tickRow}>
        {Array.from({ length: 18 }, (_, i) => (
          <View key={i} style={s.tick} />
        ))}
      </View>
    </View>
  )
}

/* ---- waveform bars ---- */
function WaveformBars({ count, highlightIndex }) {
  const heights = useMemo(
    () => Array.from({ length: count }, () => 10 + Math.random() * 32),
    [count],
  )
  return (
    <View style={s.waveRow}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[
            s.waveBar,
            { height: h },
            i === highlightIndex && s.waveBarActive,
          ]}
        />
      ))}
    </View>
  )
}

/* ---- pill badge ---- */
function PillBadge({ label, color }) {
  return (
    <View style={[s.pillBadge, { backgroundColor: color || ACCENT }]}>
      <Text style={s.pillBadgeText}>{label}</Text>
    </View>
  )
}

/* ---- calendar week strip ---- */
function CalendarStrip() {
  const days = useMemo(() => {
    const now = new Date()
    const today = now.getDay()
    const result = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - today + i)
      result.push({
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        date: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
      })
    }
    return result
  }, [])

  return (
    <View style={s.calStrip}>
      {days.map((d, i) => (
        <View key={i} style={[s.calCell, d.isToday && s.calCellToday]}>
          <Text style={[s.calDay, d.isToday && s.calDayToday]}>{d.day}</Text>
          <Text style={[s.calDate, d.isToday && s.calDateToday]}>{d.date}</Text>
        </View>
      ))}
    </View>
  )
}

/* ---- status chip row under top bar ---- */
function StatusChips({ goals, habits }) {
  const totalGoals = goals.length
  const doneGoals = goals.filter(g => g.completed).length
  const totalHabits = habits.length
  const doneHabits = habits.filter(h => h.completed).length
  return (
    <View style={s.chipRow}>
      <View style={s.chip}>
        <View style={[s.chipDot, { backgroundColor: ACCENT }]} />
        <Text style={s.chipText}>{doneGoals}/{totalGoals} Goals</Text>
      </View>
      <View style={s.chip}>
        <View style={[s.chipDot, { backgroundColor: GREEN }]} />
        <Text style={s.chipText}>{doneHabits}/{totalHabits} Habits</Text>
      </View>
    </View>
  )
}

/* ================================================================ */

export default function HomePage({
  userName,
  goals,
  habits,
  onToggleGoal,
  onToggleHabit,
  onAddGoal,
  onAddHabit,
  onBack,
  activeTab,
  onTabChange,
  bellCount,
}) {
  const doneGoals = goals.filter((g) => g.completed).length
  const doneHabits = habits.filter((h) => h.completed).length
  const total = goals.length + habits.length
  const done = doneGoals + doneHabits
  const ratio = total ? done / total : 0
  const [showAdd, setShowAdd] = useState(false)

  /* ── entrance animations ── */
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current
  const cardSlides = useRef([0, 1, 2, 3].map(() => new Animated.Value(30))).current
  const fabScale = useRef(new Animated.Value(0)).current
  const fabPressScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const stagger = cardAnims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 400, delay: i * 100, useNativeDriver: true }),
        Animated.spring(cardSlides[i], { toValue: 0, tension: 50, friction: 8, delay: i * 100, useNativeDriver: true }),
      ]),
    )
    Animated.parallel([
      ...stagger,
      Animated.spring(fabScale, { toValue: 1, tension: 60, friction: 6, delay: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabPressScale, { toValue: 0.85, useNativeDriver: true, tension: 100, friction: 5 }),
      Animated.spring(fabPressScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 }),
    ]).start()
    setShowAdd(true)
  }

  return (
    <View style={s.root}>
      {/* ---- top bar ---- */}
      <View style={s.topBar}>
        <Pressable onPress={onBack} style={s.backBtn}>
          <View style={s.backArrowLine} />
          <View style={s.backArrowHead} />
        </Pressable>
        <View style={s.brandCenter}>
          <Text style={s.brandTitle}>Zenith</Text>
        </View>
        <Pressable style={s.bellCircle} onPress={() => onTabChange('reminders')}>
          <View style={s.bellShape}>
            <View style={s.bellDome} />
            <View style={s.bellBase} />
            <View style={s.bellClapper} />
          </View>
          {bellCount > 0 && (
            <View style={s.bellBadge}>
              <Text style={s.bellBadgeText}>{bellCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <StatusChips goals={goals} habits={habits} />
      <CalendarStrip />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ── card 1 : Progress (dark card like featured flight) ── */}
        <Animated.View style={[s.cardDark, { opacity: cardAnims[0], transform: [{ translateY: cardSlides[0] }] }]}>
          <View style={s.cardHead}>
            <Text style={s.cardLabelLight}>Progress</Text>
            <PillBadge label={ratio >= 0.5 ? 'On track' : 'Keep going'} color={ratio >= 0.5 ? GREEN : ACCENT} />
          </View>
          <DottedArc />
          <Text style={s.heroNumLight}>
            {(ratio * 100).toFixed(0)}%
            <Text style={s.heroSupLight}>{`  ${done}/${total}`}</Text>
          </Text>
          <View style={s.twoCol}>
            <Text style={s.dimLabelLight}>Done</Text>
            <Text style={s.dimLabelLight}>Remaining</Text>
          </View>
          <SliderBar ratio={ratio} />
        </Animated.View>
            <Text style={s.dimLabel}>Done</Text>
            <Text style={s.dimLabel}>Remaining</Text>
          </View>
          <SliderBar ratio={ratio} />
        </Animated.View>

        {/* ── card 2 : Goals ── */}
        <Animated.View style={{ opacity: cardAnims[1], transform: [{ translateY: cardSlides[1] }] }}>
          <GoalCard goals={goals} onToggle={onToggleGoal} />
        </Animated.View>

        {/* ── card 3 : Habits ── */}
        <Animated.View style={{ opacity: cardAnims[2], transform: [{ translateY: cardSlides[2] }] }}>
          <HabitCard
            habits={habits}
            onToggle={onToggleHabit}
          />
        </Animated.View>

        {/* ── card 4 : Activity ── */}
        <Animated.View style={[s.card, { opacity: cardAnims[3], transform: [{ translateY: cardSlides[3] }] }]}>
          <View style={s.cardHead}>
            <Text style={s.cardLabel}>Activity</Text>
            <PillBadge label="This week" color={ACCENT_LIGHT} />
          </View>
          <Text style={s.heroNum}>
            {done}
            <Text style={s.heroSup}>{` +${total - done}`}</Text>
          </Text>
          <WaveformBars count={16} highlightIndex={13} />
        </Animated.View>
      </ScrollView>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        badge={bellCount}
      />

      {/* FAB */}
      <Pressable onPress={handleFabPress}>
        <Animated.View style={[s.fab, { transform: [{ scale: Animated.multiply(fabScale, fabPressScale) }] }]}>
          <View style={s.fabCross}>
            <View style={s.fabH} />
            <View style={s.fabV} />
          </View>
        </Animated.View>
      </Pressable>

      <AddTaskModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAddGoal={onAddGoal}
        onAddHabit={onAddHabit}
      />
    </View>
  )
}

/* ================================================================ */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  /* ---- top bar ---- */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  backArrowLine: { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: TXT },
  backArrowHead: { position: 'absolute', left: 10, width: 8, height: 8, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: TXT, transform: [{ rotate: '45deg' }] },
  brandCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 58,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TXT,
    letterSpacing: 1.5,
  },
  bellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  bellShape: { width: 18, height: 18, alignItems: 'center' },
  bellDome: { width: 12, height: 11, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: TXT },
  bellBase: { width: 16, height: 3, borderRadius: 1.5, backgroundColor: TXT, marginTop: -1 },
  bellClapper: { width: 4, height: 2.5, borderRadius: 1.25, backgroundColor: TXT, marginTop: 1 },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  /* ---- status chips ---- */
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: TXT2 },

  /* ---- calendar strip ---- */
  calStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  calCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  calCellToday: {
    backgroundColor: CARD_DARK,
    borderColor: CARD_DARK,
  },
  calDay: {
    fontSize: 11,
    fontWeight: '600',
    color: TXT2,
    marginBottom: 4,
  },
  calDayToday: {
    color: 'rgba(255,255,255,0.6)',
  },
  calDate: {
    fontSize: 18,
    fontWeight: '700',
    color: TXT,
  },
  calDateToday: {
    color: '#fff',
  },

  /* ---- scroll ---- */
  scroll: { flex: 1 },
  scrollInner: { padding: 16, paddingBottom: 100, gap: 14 },

  /* ---- card (light) ---- */
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
  /* ---- card (dark) ---- */
  cardDark: {
    backgroundColor: CARD_DARK,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLabel: { fontSize: 17, fontWeight: '600', color: TXT },
  cardLabelLight: { fontSize: 17, fontWeight: '600', color: '#fff' },

  /* pill badge */
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pillBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  /* arrow badge */
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLine: { width: 2, height: 12, backgroundColor: TXT2, borderRadius: 1, transform: [{ rotate: '-45deg' }], position: 'absolute' },
  arrowHead: { width: 6, height: 6, borderTopWidth: 2, borderRightWidth: 2, borderColor: TXT2, transform: [{ rotate: '-45deg' }], position: 'absolute', top: 4, right: 8 },

  /* hero number (dark card) */
  heroNumLight: { fontSize: 46, fontWeight: '800', color: '#fff', marginBottom: 8 },
  heroSupLight: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },

  /* hero number (light card) */
  heroNum: { fontSize: 52, fontWeight: '800', color: TXT, marginBottom: 8 },
  heroSup: { fontSize: 18, fontWeight: '600', color: TXT2 },

  /* two-column labels */
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dimLabel: { fontSize: 13, color: TXT2 },
  dimLabelLight: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },

  /* slider progress bar */
  sliderWrap: {
    height: 26,
    justifyContent: 'center',
    marginTop: 2,
  },
  sliderDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    top: 4,
    marginLeft: -9,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sliderTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  sliderFill: {
    backgroundColor: ACCENT,
    borderRadius: 4,
  },
  tickRow: {
    position: 'absolute',
    right: 0,
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 26,
  },
  tick: {
    width: 1.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  /* waveform */
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 46,
    marginTop: 6,
  },
  waveBar: {
    width: 7,
    borderRadius: 3.5,
    backgroundColor: '#E5E7EB',
  },
  waveBarActive: {
    backgroundColor: ACCENT,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  fabCross: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  fabH: { position: 'absolute', width: 20, height: 2.5, borderRadius: 1.25, backgroundColor: '#fff' },
  fabV: { position: 'absolute', width: 2.5, height: 20, borderRadius: 1.25, backgroundColor: '#fff' },
})
