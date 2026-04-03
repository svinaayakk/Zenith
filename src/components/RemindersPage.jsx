import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native'
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

  const handleAdd = () => {
    if (!title.trim() || !date.trim()) return
    /* basic date validation YYYY-MM-DD */
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return
    onAdd({ id: Date.now(), title: title.trim(), date: date.trim() })
    setTitle('')
    setDate('')
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={s.modalBg} onPress={onClose}>
        <Pressable style={s.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={s.modalTitle}>New Reminder</Text>

          <Text style={s.inputLabel}>Event name</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Project deadline"
            placeholderTextColor={TXT2}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={s.inputLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={s.input}
            placeholder="2026-04-10"
            placeholderTextColor={TXT2}
            value={date}
            onChangeText={setDate}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            maxLength={10}
          />

          <View style={s.modalBtns}>
            <Pressable style={s.modalCancel} onPress={onClose}>
              <Text style={s.modalCancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable style={s.modalAdd} onPress={handleAdd}>
              <Text style={s.modalAddTxt}>Add</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
        <View style={s.topLeft}>
          <ZenithLogo size={38} color="#fff" />
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
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
  },
  emptyBell: { width: 40, height: 42, alignItems: 'center', marginBottom: 12 },
  emptyBellDome: { width: 26, height: 24, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: TXT2 },
  emptyBellBase: { width: 34, height: 6, borderRadius: 3, backgroundColor: TXT2, marginTop: -2 },
  emptyBellClapper: { width: 8, height: 4, borderRadius: 2, backgroundColor: TXT2, marginTop: 2 },
  emptyTxt: { fontSize: 14, color: TXT2, textAlign: 'center', paddingHorizontal: 32 },

  /* modal */
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: TXT, marginBottom: 18 },
  inputLabel: { fontSize: 13, color: TXT2, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: CARD_BG,
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
    backgroundColor: WHITE20,
    alignItems: 'center',
  },
  modalCancelTxt: { fontSize: 15, fontWeight: '600', color: TXT },
  modalAdd: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: TXT,
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
    backgroundColor: TXT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  fabCross: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  fabH: { position: 'absolute', width: 20, height: 2.5, borderRadius: 1.25, backgroundColor: '#fff' },
  fabV: { position: 'absolute', width: 2.5, height: 20, borderRadius: 1.25, backgroundColor: '#fff' },
})
