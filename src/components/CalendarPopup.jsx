import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

const TXT = '#1E1E2E'
const TXT2 = '#9CA3AF'
const ACCENT = '#8B5CF6'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

export default function CalendarPopup({ visible, onSelect, onClose, initialDate }) {
  const init = initialDate ? new Date(initialDate) : new Date()
  const [viewYear, setViewYear] = useState(init.getFullYear())
  const [viewMonth, setViewMonth] = useState(init.getMonth())

  if (!visible) return null

  const today = new Date().toISOString().slice(0, 10)
  const selected = initialDate || ''

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  let startDow = new Date(viewYear, viewMonth, 1).getDay() - 1
  if (startDow < 0) startDow = 6
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const extra = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let i = 0; i < extra; i++) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const pad = (n) => String(n).padStart(2, '0')
  const getDateStr = (d) => `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`

  return (
    <View style={s.overlay}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.card}>
        {/* Navigation */}
        <View style={s.nav}>
          <Pressable onPress={goPrev} style={s.navBtn}>
            <Text style={s.navTxt}>{'<'}</Text>
          </Pressable>
          <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
          <Pressable onPress={goNext} style={s.navBtn}>
            <Text style={s.navTxt}>{'>'}</Text>
          </Pressable>
        </View>

        {/* Day headers */}
        <View style={s.row}>
          {DAYS.map((d) => (
            <View key={d} style={s.hdrCell}>
              <Text style={s.hdrTxt}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Date grid */}
        {weeks.map((week, wi) => (
          <View key={wi} style={s.row}>
            {week.map((d, di) => {
              if (!d) return <View key={di} style={s.dayCell} />
              const dateStr = getDateStr(d)
              const isToday = dateStr === today
              const isSel = dateStr === selected
              return (
                <Pressable
                  key={di}
                  style={[
                    s.dayCell,
                    isToday && !isSel && s.todayCell,
                    isSel && s.selCell,
                  ]}
                  onPress={() => onSelect(dateStr)}
                >
                  <Text style={[
                    s.dayTxt,
                    isToday && !isSel && s.todayTxt,
                    isSel && s.selTxt,
                  ]}>
                    {d}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: 330,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    zIndex: 201,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTxt: {
    fontSize: 18,
    fontWeight: '600',
    color: TXT,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: TXT,
  },
  row: {
    flexDirection: 'row',
  },
  hdrCell: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  hdrTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: TXT2,
  },
  dayCell: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  todayCell: {
    backgroundColor: '#F3F4F6',
  },
  selCell: {
    backgroundColor: '#8B5CF6',
  },
  dayTxt: {
    fontSize: 14,
    fontWeight: '500',
    color: TXT,
  },
  todayTxt: {
    fontWeight: '700',
  },
  selTxt: {
    color: '#fff',
    fontWeight: '700',
  },
})
