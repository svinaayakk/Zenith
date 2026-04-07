import { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, Dimensions, StyleSheet } from 'react-native'
import BottomTabBar from './BottomTabBar'

const SCREEN_W = 390

const BG = '#F5F5F7'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E7EB'
const TXT = '#1E1E2E'
const TXT2 = '#9CA3AF'
const ACCENT = '#8B5CF6'
const WHITE20 = 'rgba(139,92,246,0.08)'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* intensity → colour */
function heatColor(level) {
  if (level === 0) return '#F3F4F6'
  if (level === 1) return 'rgba(139,92,246,0.15)'
  if (level === 2) return 'rgba(139,92,246,0.35)'
  if (level === 3) return 'rgba(139,92,246,0.60)'
  return ACCENT
}

/* ── calendar heat-map for the current month ── */
function MonthHeatMap({ completionLog }) {
  const { year, monthName, grid, today, levels } = useMemo(() => {
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

    /* activity levels from real completion log */
    const lvl = {}
    const pad = (n) => String(n).padStart(2, '0')
    for (let d = 1; d <= daysInMonth; d++) {
      if (d > todayDate) {
        lvl[d] = 0
      } else {
        const key = `${y}-${pad(m + 1)}-${pad(d)}`
        const entry = completionLog[key]
        if (!entry || entry.total === 0) {
          lvl[d] = 0
        } else {
          lvl[d] = Math.min(4, Math.round((entry.done / entry.total) * 4))
        }
      }
    }

    return { year: y, monthName: name, grid: rows, today: todayDate, levels: lvl }
  }, [completionLog])

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
function ConsistencyScore({ completionLog }) {
  const score = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const todayDate = now.getDate()
    const pad = (n) => String(n).padStart(2, '0')

    let totalRate = 0
    let loggedDays = 0

    for (let d = 1; d <= todayDate; d++) {
      const key = `${y}-${pad(m + 1)}-${pad(d)}`
      const entry = completionLog[key]
      if (entry && entry.total > 0) {
        totalRate += entry.done / entry.total
        loggedDays++
      }
    }

    if (loggedDays === 0) return 0
    return Math.round((totalRate / loggedDays) * 100)
  }, [completionLog])

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
  completionLog,
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
        <View style={s.backBtn}>
          <View style={s.backArrowLine} />
          <View style={s.backArrowHead} />
        </View>
        <View style={s.brandCenter}>
          <Text style={s.brandTitle}>Analytics</Text>
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
          <MonthHeatMap completionLog={completionLog} />
        </View>

        {/* ── Consistency Score card ── */}
        <View style={s.card}>
          <ConsistencyScore completionLog={completionLog} />
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
  root: { flex: 1, backgroundColor: BG },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 14,
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

  scroll: { flex: 1 },
  scrollInner: { padding: 16, paddingBottom: 100, gap: 14 },

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
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 17, fontWeight: '700', color: TXT },

  /* month heat map */
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
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
  summaryNum: { fontSize: 28, fontWeight: '800', color: TXT },
  summaryLabel: { fontSize: 12, color: TXT2, marginTop: 2 },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
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
    fontWeight: '800',
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
