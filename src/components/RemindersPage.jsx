import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  StyleSheet,
} from 'react-native'
import BottomTabBar from './BottomTabBar'
import CalendarPopup from './CalendarPopup'

const SCREEN_W = 390

const BG = '#F5F5F7'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E5E7EB'
const TXT = '#1E1E2E'
const TXT2 = '#9CA3AF'
const ACCENT = '#8B5CF6'
const WHITE20 = 'rgba(139,92,246,0.08)'

/* helper: days remaining from today */
function daysUntil(dateStr) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

/* urgency badge label */
function urgencyLabel(days) {
  if (days < 0) return { text: 'Past', color: 'rgba(200,60,60,0.85)' }
  if (days === 0) return { text: 'Today!', color: '#e05a5a' }
  if (days === 1) return { text: '1 day to go', color: '#e09a3a' }
  if (days <= 7) return { text: `${days}d to go`, color: '#d4b836' }
  return { text: `${days}d away`, color: TXT2 }
}

/* ── Add Reminder Modal ── */
function AddReminderModal({ visible, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  const handleAdd = () => {
    if (!title.trim() || !date.trim()) return
    /* basic date validation YYYY-MM-DD */
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return
    onAdd({ id: Date.now(), title: title.trim(), date: date.trim() })
    setTitle('')
    setDate('')
    onClose()
  }

  if (!visible) return null

  return (
    <View style={s.modalBg}>
      <Pressable style={s.modalBackdrop} onPress={onClose} />
      <View style={s.modalCard}>
        <View style={s.modalHandle}><View style={s.modalHandleBar} /></View>
        <Text style={s.modalTitle}>New Reminder</Text>

        <Text style={s.inputLabel}>Event name</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Project deadline"
          placeholderTextColor={TXT2}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={s.inputLabel}>Date</Text>
        <Pressable
          style={[s.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={{ color: date ? TXT : TXT2 }}>
            {date || 'Pick a date'}
          </Text>
          <Text style={{ color: TXT2, fontSize: 18 }}>📅</Text>
        </Pressable>
        <CalendarPopup
          visible={showCalendar}
          onSelect={(d) => { setDate(d); setShowCalendar(false) }}
          onClose={() => setShowCalendar(false)}
          initialDate={date}
        />

        <View style={s.modalBtns}>
          <Pressable style={s.modalCancel} onPress={onClose}>
            <Text style={s.modalCancelTxt}>Cancel</Text>
          </Pressable>
          <Pressable style={s.modalAdd} onPress={handleAdd}>
            <Text style={s.modalAddTxt}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

/* ── Single Reminder row ── */
function ReminderRow({ item, onDelete }) {
  const days = daysUntil(item.date)
  const { text, color } = urgencyLabel(days)

  return (
    <View style={s.reminderRow}>
      <View style={s.reminderLeft}>
        <View style={s.reminderDotView} />
        <View style={{ flex: 1 }}>
          <Text style={s.reminderTitle}>{item.title}</Text>
          <Text style={s.reminderDate}>{item.date}</Text>
        </View>
      </View>
      <View style={s.reminderRight}>
        <View style={[s.urgencyBadge, { backgroundColor: color }]}>
          <Text style={s.urgencyTxt}>{text}</Text>
        </View>
        <Pressable onPress={() => onDelete(item.id)} hitSlop={10} style={s.deleteBtnWrap}>
          <View style={s.delLine1} />
          <View style={s.delLine2} />
        </Pressable>
      </View>
    </View>
  )
}

/* ================================================================ */

export default function RemindersPage({
  userName,
  reminders,
  onAddReminder,
  onDeleteReminder,
  activeTab,
  onTabChange,
  bellCount,
}) {
  const [showAdd, setShowAdd] = useState(false)

  /* sort: most urgent first */
  const sorted = [...reminders].sort(
    (a, b) => daysUntil(a.date) - daysUntil(b.date),
  )

  return (
    <View style={s.root}>
      {/* ---- top bar ---- */}
      <View style={s.topBar}>
        <View style={s.backBtn}>
          <View style={s.backArrowLine} />
          <View style={s.backArrowHead} />
        </View>
        <View style={s.brandCenter}>
          <Text style={s.brandTitle}>Reminders</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Reminders</Text>
          <Text style={s.sectionSub}>
            {reminders.length === 0
              ? 'No events yet'
              : `${reminders.length} event${reminders.length > 1 ? 's' : ''}`}
          </Text>
        </View>

        {sorted.length === 0 ? (
          <View style={s.emptyCard}>
            <View style={s.emptyBell}>
              <View style={s.emptyBellDome} />
              <View style={s.emptyBellBase} />
              <View style={s.emptyBellClapper} />
            </View>
            <Text style={s.emptyTxt}>
              Tap + to add important events you don't want to forget
            </Text>
          </View>
        ) : (
          sorted.map((r) => (
            <ReminderRow key={r.id} item={r} onDelete={onDeleteReminder} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={s.fab} onPress={() => setShowAdd(true)}>
        <View style={s.fabCross}>
          <View style={s.fabH} />
          <View style={s.fabV} />
        </View>
      </Pressable>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        badge={bellCount}
      />

      <AddReminderModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={onAddReminder}
      />
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: TXT },

  scroll: { flex: 1 },
  scrollInner: { padding: 16, paddingBottom: 120, gap: 10 },

  sectionHead: { marginBottom: 6 },
  sectionTitle: { fontSize: 26, fontWeight: '800', color: TXT },
  sectionSub: { fontSize: 13, color: TXT2, marginTop: 2 },

  /* reminder row */
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  reminderDotView: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT },
  reminderTitle: { fontSize: 15, fontWeight: '600', color: TXT },
  reminderDate: { fontSize: 12, color: TXT2, marginTop: 2 },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },
  deleteBtnWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  delLine1: { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: TXT2, transform: [{ rotate: '45deg' }] },
  delLine2: { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: TXT2, transform: [{ rotate: '-45deg' }] },

  /* empty */
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyBell: { width: 40, height: 42, alignItems: 'center', marginBottom: 12 },
  emptyBellDome: { width: 26, height: 24, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: TXT2 },
  emptyBellBase: { width: 34, height: 6, borderRadius: 3, backgroundColor: TXT2, marginTop: -2 },
  emptyBellClapper: { width: 8, height: 4, borderRadius: 2, backgroundColor: TXT2, marginTop: 2 },
  emptyTxt: { fontSize: 14, color: TXT2, textAlign: 'center', paddingHorizontal: 32 },

  /* modal */
  modalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    zIndex: 101,
  },
  modalHandle: { alignItems: 'center', marginBottom: 12 },
  modalHandleBar: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: TXT, marginBottom: 18 },
  inputLabel: { fontSize: 13, color: TXT2, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
    fontSize: 15,
    color: TXT,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 22 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelTxt: { fontSize: 15, fontWeight: '600', color: TXT },
  modalAdd: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  modalAddTxt: { fontSize: 15, fontWeight: '600', color: '#fff' },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
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
