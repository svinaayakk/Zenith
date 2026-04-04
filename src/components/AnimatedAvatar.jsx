import { useRef, useEffect, useState } from 'react'
import { View, Text, Animated, Easing, StyleSheet, Pressable } from 'react-native'

const TXT = '#2b2d1f'
const SIZE = 32
const INNER_COUNT = 8
const INNER_RADIUS = 19
const OUTER_COUNT = 12
const OUTER_RADIUS = 26

function buildDots(count, radius, isOuter) {
  const result = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const dotSize = isOuter
      ? (i % 3 === 0 ? 2.5 : 1.8)
      : (i % 2 === 0 ? 3 : 2)
    const opacity = isOuter
      ? 0.15 + (i / count) * 0.35
      : 0.25 + (i / count) * 0.5
    result.push({ x, y, dotSize, opacity })
  }
  return result
}

const innerDots = buildDots(INNER_COUNT, INNER_RADIUS, false)
const outerDots = buildDots(OUTER_COUNT, OUTER_RADIUS, true)

export default function AnimatedAvatar({ letter }) {
  const spinInner = useRef(new Animated.Value(0)).current
  const spinOuter = useRef(new Animated.Value(0)).current
  const hoverAnim = useRef(new Animated.Value(1)).current
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinInner, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
    Animated.loop(
      Animated.timing(spinOuter, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  useEffect(() => {
    Animated.timing(hoverAnim, {
      toValue: hovered ? 1.18 : 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [hovered])

  const rotateInner = spinInner.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  // outer ring spins opposite direction
  const rotateOuter = spinOuter.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  })

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <Animated.View style={[s.wrap, { transform: [{ scale: hoverAnim }] }]}>
        {/* outer ring */}
        <Animated.View style={[s.ring, { transform: [{ rotate: rotateOuter }] }]}>
          {outerDots.map((d, i) => (
            <View
              key={`o${i}`}
              style={[
                s.dot,
                {
                  width: d.dotSize,
                  height: d.dotSize,
                  borderRadius: d.dotSize / 2,
                  opacity: d.opacity,
                  left: SIZE / 2 + d.x - d.dotSize / 2,
                  top: SIZE / 2 + d.y - d.dotSize / 2,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* inner ring */}
        <Animated.View style={[s.ring, { transform: [{ rotate: rotateInner }] }]}>
          {innerDots.map((d, i) => (
            <View
              key={`i${i}`}
              style={[
                s.dot,
                {
                  width: d.dotSize,
                  height: d.dotSize,
                  borderRadius: d.dotSize / 2,
                  opacity: d.opacity,
                  left: SIZE / 2 + d.x - d.dotSize / 2,
                  top: SIZE / 2 + d.y - d.dotSize / 2,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* avatar circle */}
        <View style={s.avatar}>
          <Text style={s.letter}>{letter}</Text>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const LAYOUT = 40

const s = StyleSheet.create({
  wrap: {
    width: LAYOUT,
    height: LAYOUT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  dot: {
    position: 'absolute',
    backgroundColor: TXT,
  },
  avatar: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 14,
    fontWeight: '700',
    color: TXT,
  },
})
