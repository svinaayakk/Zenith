import { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, Dimensions, StyleSheet } from 'react-native'
import ZenithLogo from './ZenithLogo'
import BottomTabBar from './BottomTabBar'

const { width: SCREEN_W } = Dimensions.get('window')

const BG = '#a8ab8e'
const CARD_BG = 'rgba(190,194,172,0.52)'
const CARD_BORDER = 'rgba(255,255,255,0.22)'
const TXT = '#2b2d1f'
const TXT2 = 'rgba(43,45,31,0.45)'
const ACCENT = '#c8e64a'
const WHITE20 = 'rgba(255,255,255,0.22)'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* intensity → colour */
function heatColor(level) {
  if (level === 0) return WHITE20
  if (level === 1) return 'rgba(200,230,74,0.30)'
  if (level === 2) return 'rgba(200,230,74,0.55)'
  if (level === 3) return 'rgba(200,230,74,0.80)'
  return ACCENT
}

/* ── calendar heat-map for the current month ── */
function MonthHeatMap({ goals, habits }) {
  const { year, monthName, grid, today } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const todayDate = now.getDate()
    const name = now.toLocaleString('default', { month: 'long' })

    const firstDay = new Date(y, m, 1)
    const daysInMonth = new Date(y, m + 1, 0).getDate()

    /* Monday = 0 … Sunday = 6 */
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    /* build 7-column grid; null = empty cell */
    const cells = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    /* chunk into weeks (rows) */
    const rows = []
    for (let i = 0; i < cells.length; i += 7)
      rows.push(cells.slice(i, i + 7))

    /* simulated activity level per day (0-4) */
    const total = goals.length + habits.length
    const doneCount =
      goals.filter((g) => g.completed).length +
      habits.filter((h) => h.completed).length

    const levels = {}
    for (let d = 1; d <= daysInMonth; d++) {
      if (d > todayDate) {
        levels[d] = 0
      } else if (d === todayDate) {
        levels[d] = total ? Math.min(4, Math.round((doneCount / total) * 4)) : 0
      } else {
        /* past days get pseudo-random but deterministic levels */
        const seed = (d * 7 + m * 13 + y) % 5
        levels[d] = seed
      }
    }

    return { year: y, monthName: name, grid: rows, today: todayDate, levels }
  }, [goals, habits])

  /* compute levels outside of useMemo (it's returned inside) — pull from closure */
  const { levels } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const todayDate = now.getDate()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const total = goals.length + habits.length
    const doneCount =
      goals.filter((g) => g.completed).length +
      habits.filter((h) => h.completed).length

    const lvl = {}
    for (let d = 1; d <= daysInMonth; d++) {
      if (d > todayDate) {
        lvl[d] = 0
      } else if (d === todayDate) {
        lvl[d] = total ? Math.min(4, Math.round((doneCount / total) * 4)) : 0
      } else {
        lvl[d] = (d * 7 + m * 13 + y) % 5
      }
    }
    return { levels: lvl }
  }, [goals, habits])

  return (
    <View>
      <Text style={s.monthTitle}>
        {monthName} {year}
      </Text>

      {/* day-of-week header */}
      <View style={s.heatRow}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={s.heatHeaderCell}>
            <Text style={s.heatHeaderTxt}>{d}</Text>
          </View>
        ))}
      </View>

      {/* weeks */}
      {grid.map((week, wi) => (
        <View key={wi} style={s.heatRow}>
          {week.map((day, di) => (
            <View key={di} style={s.heatCellWrap}>
              {day != null ? (
                <View
                  style={[
                    s.heatCell,
                    { backgroundColor: heatColor(levels[day] ?? 0) },
                    day === today && s.heatCellToday,
                  ]}
                >
                  <Text
                    style={[
                      s.heatCellTxt,
                      day === today && s.heatCellTxtToday,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ) : (
                <View style={s.heatCellEmpty} />
              )}
            </View>
          ))}
        </View>
      ))}

      {/* legend */}
      <View style={s.legendRow}>
        <Text style={s.legendLabel}>Less</Text>
        {[0, 1, 2, 3, 4].map((l) => (
          <View
            key={l}
            style={[s.legendBox, { backgroundColor: heatColor(l) }]}
          />
        ))}
        <Text style={s.legendLabel}>More</Text>
      </View>
    </View>
  )
}

/* ── Consistency Score ring ── */
function ConsistencyScore({ goals, habits }) {
  const score = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const todayDate = now.getDate()
    const total = goals.length + habits.length

    /* today's completion rate (0-1) */
    const doneCount =
      goals.filter((g) => g.completed).length +
      habits.filter((h) => h.completed).length
    const todayRate = total ? doneCount / total : 0

    /* past-day active ratio: count days with level >= 1 */
    let activeDays = 0
    for (let d = 1; d < todayDate; d++) {
      const lvl = (d * 7 + m * 13 + y) % 5
      if (lvl >= 1) activeDays++
    }
    const pastRate = todayDate > 1 ? activeDays / (todayDate - 1) : 0

    /* weighted blend: 40 % today completion, 60 % past activity */
    const raw = todayDate === 1 ? todayRate : todayRate * 0.4 + pastRate * 0.6
    return Math.round(raw * 100)
  }, [goals, habits])

  const label =
    score >= 80
      ? 'Excellent'
      : score >= 60
        ? 'Good'
        : score >= 40
          ? 'Decent'
          : score >= 20
            ? 'Needs work'
            : 'Just starting'

  const RING_SIZE = 110
  const STROKE = 10

  /* Build two half-circle "clips" to simulate a ring progress */
  const pct = score / 100
  const rightDeg = pct <= 0.5 ? pct * 360 : 180
  const leftDeg = pct <= 0.5 ? 0 : (pct - 0.5) * 360

  return (
    <View style={s.scoreWrap}>
      <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        {/* track ring */}
        <View style={{
          position: 'absolute', width: RING_SIZE, height: RING_SIZE,
          borderRadius: RING_SIZE / 2, borderWidth: STROKE, borderColor: WHITE20,
        }} />
        {/* right half */}
        <View style={{
          position: 'absolute', width: RING_SIZE / 2, height: RING_SIZE,
          left: RING_SIZE / 2, overflow: 'hidden',
        }}>
          <View style={{
            width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
            borderWidth: STROKE, borderColor: ACCENT, left: -RING_SIZE / 2,
            transform: [{ rotateZ: `${rightDeg}deg` }],
            borderLeftColor: 'transparent', borderBottomColor: 'transparent',
          }} />
        </View>
        {/* left half */}
        <View style={{
          position: 'absolute', width: RING_SIZE / 2, height: RING_SIZE,
          left: 0, overflow: 'hidden',
        }}>
          <View style={{
            width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
            borderWidth: STROKE, borderColor: ACCENT,
            transform: [{ rotateZ: `${leftDeg}deg` }],
            borderRightColor: 'transparent', borderTopColor: 'transparent',
          }} />
        </View>
        <Text style={s.scoreNum}>{score}</Text>
      </View>
      <View style={s.scoreMeta}>
        <Text style={s.scoreTitle}>Consistency Score</Text>
        <Text style={s.scoreLabel}>{label}</Text>
        <Text style={s.scoreHint}>Based on task completion & daily activity</Text>
      </View>
    </View>
  )
}

/* ================================================================ */

export default function AnalyticsPage({
  userName,
  goals,
  habits,
  onTabChange,
  activeTab,
  bellCount,
}) {
  const doneGoals = goals.filter((g) => g.completed).length
  const doneHabits = habits.filter((h) => h.completed).length
  const total = goals.length + habits.length
  const done = doneGoals + doneHabits
  const remaining = total - done

  return (
    <View style={s.root}>
      {/* ---- top bar ---- */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <ZenithLogo size={38} color="#fff" />
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
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

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Heat Map card ── */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardLabel}>Activity Heat Map</Text>
          </View>
          <MonthHeatMap goals={goals} habits={habits} />
        </View>

        {/* ── Consistency Score card ── */}
        <View style={s.card}>
          <ConsistencyScore goals={goals} habits={habits} />
        </View>

        {/* ── Summary card ── */}
        <View style={s.card}>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{done}</Text>
              <Text style={s.summaryLabel}>Completed</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{remaining}</Text>
              <Text style={s.summaryLabel}>Remaining</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{total}</Text>
              <Text style={s.summaryLabel}>Total</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} badge={bellCount} />
    </View>
  )
}

/* ================================================================ */

const s = StyleSheet.create({
  root: { width: SCREEN_W, flex: 1, backgroundColor: BG },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 14,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: TXT },
  bellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(43,45,31,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#e05a5a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  scroll: { flex: 1 },
  scrollInner: { padding: 16, paddingBottom: 100, gap: 14 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 24,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 17, fontWeight: '600', color: TXT },

  /* month heat map */
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TXT,
    marginBottom: 12,
  },
  heatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heatHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  heatHeaderTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: TXT2,
  },
  heatCellWrap: {
    flex: 1,
    alignItems: 'center',
  },
  heatCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatCellToday: {
    borderWidth: 2,
    borderColor: TXT,
  },
  heatCellEmpty: {
    width: 36,
    height: 36,
  },
  heatCellTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: TXT2,
  },
  heatCellTxtToday: {
    color: TXT,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: TXT2,
    fontWeight: '600',
  },

  /* summary */
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '700', color: TXT },
  summaryLabel: { fontSize: 12, color: TXT2, marginTop: 2 },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(43,45,31,0.15)',
  },

  /* consistency score */
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreNum: {
    fontSize: 30,
    fontWeight: '800',
    color: TXT,
  },
  scoreMeta: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TXT,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
    marginBottom: 4,
  },
  scoreHint: {
    fontSize: 11,
    color: TXT2,
  },
})
