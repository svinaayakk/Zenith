import { useRef, useEffect } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'

const TXT = '#2b2d1f'
const TXT2 = 'rgba(43,45,31,0.45)'
const TAB_BG = 'rgba(190,194,172,0.72)'
const ACTIVE_BG = TXT
const ACTIVE_TXT = '#fff'
const INACTIVE_TXT = TXT2
const ACCENT = '#c8e64a'

/* ── minimal View-based tab indicators ── */
function FocusDot({ active }) {
  const c = active ? ACTIVE_TXT : INACTIVE_TXT
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: c, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c }} />
      </View>
    </View>
  )
}
function AnalyticsBars({ active }) {
  const c = active ? ACTIVE_TXT : INACTIVE_TXT
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 14 }}>
      <View style={{ width: 3, height: 6, borderRadius: 1.5, backgroundColor: c }} />
      <View style={{ width: 3, height: 10, borderRadius: 1.5, backgroundColor: c }} />
      <View style={{ width: 3, height: 14, borderRadius: 1.5, backgroundColor: c }} />
    </View>
  )
}
function BellShape({ active }) {
  const c = active ? ACTIVE_TXT : INACTIVE_TXT
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center' }}>
      <View style={{ width: 10, height: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: c }} />
      <View style={{ width: 14, height: 3, borderRadius: 1.5, backgroundColor: c, marginTop: -1 }} />
      <View style={{ width: 4, height: 2, borderRadius: 1, backgroundColor: c, marginTop: 1 }} />
    </View>
  )
}

const TAB_ICONS = { focus: FocusDot, analytics: AnalyticsBars, reminders: BellShape }

const TABS = [
  { key: 'focus', label: 'Focus' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'reminders', label: 'Reminders' },
]

export default function BottomTabBar({ activeTab, onTabChange, badge }) {
  const slideAnim = useRef(new Animated.Value(TABS.findIndex((t) => t.key === activeTab) || 0)).current
  const entranceFade = useRef(new Animated.Value(0)).current
  const entranceSlide = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceFade, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.spring(entranceSlide, { toValue: 0, tension: 50, friction: 8, delay: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.key === activeTab)
    Animated.spring(slideAnim, {
      toValue: idx,
      tension: 68,
      friction: 12,
      useNativeDriver: false,
    }).start()
  }, [activeTab])

  return (
    <Animated.View
      style={[s.wrap, { opacity: entranceFade, transform: [{ translateY: entranceSlide }] }]}
    >
      <View style={s.bar}>
        {/* sliding indicator */}
        <Animated.View
          style={[
            s.indicator,
            {
              left: slideAnim.interpolate({
                inputRange: [0, TABS.length - 1],
                outputRange: ['0%', `${((TABS.length - 1) / TABS.length) * 100}%`],
              }),
              width: `${100 / TABS.length}%`,
            },
          ]}
        />

        {TABS.map((tab, i) => {
          const active = activeTab === tab.key
          return (
            <Pressable
              key={tab.key}
              style={s.tab}
              onPress={() => onTabChange(tab.key)}
            >
              {(() => { const Icon = TAB_ICONS[tab.key]; return Icon ? <Icon active={active} /> : null })()}
              <Text style={[s.label, active && s.labelActive]}>
                {tab.label}
              </Text>
              {tab.key === 'reminders' && badge != null && badge > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{badge}</Text>
                </View>
              )}
            </Pressable>
          )
        })}
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: TAB_BG,
    borderRadius: 28,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 24,
    backgroundColor: ACTIVE_BG,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 24,
    gap: 4,
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: INACTIVE_TXT,
  },
  labelActive: {
    color: ACTIVE_TXT,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: TXT,
  },
})
