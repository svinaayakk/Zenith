import { useEffect, useRef, useMemo } from 'react'
import { View, Animated, Easing, StyleSheet } from 'react-native'

const COUNT = 180
const SIZE = 300

/* -------- shape helpers -------- */

function rect(x, y, w, h, n) {
  return Array.from({ length: n }, () => ({
    x: x + Math.random() * w,
    y: y + Math.random() * h,
  }))
}

function line(x1, y1, x2, y2, n, jitter = 0) {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    return {
      x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
      y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter,
    }
  })
}

function star(cx, cy, r, n) {
  const pts = []
  const ps = Math.ceil(n / 4)
  for (let s = 0; s < 4; s++) {
    const a = s * (Math.PI / 2) - Math.PI / 2
    for (let i = 0; i < ps; i++) {
      const t = (i + 1) / ps
      pts.push({
        x: cx + Math.cos(a) * r * t + (Math.random() - 0.5) * 2,
        y: cy + Math.sin(a) * r * t + (Math.random() - 0.5) * 2,
      })
    }
  }
  return pts.slice(0, n)
}

/* -------- Z‑logo target positions -------- */

function buildTargets() {
  const p = []
  // Top bar
  p.push(...rect(75, 58, 150, 20, 28))
  // Bottom bar
  p.push(...rect(75, 222, 150, 20, 28))
  // Diagonal (top‑right → bottom‑left, thick)
  p.push(...line(218, 80, 82, 220, 50, 26))
  // Top‑left serif
  p.push(...rect(75, 78, 15, 30, 8))
  // Bottom‑right serif
  p.push(...rect(210, 192, 15, 30, 8))
  // Upper‑left sparkle ✦
  p.push(...star(66, 42, 24, 22))
  // Lower‑right sparkle ✦
  p.push(...star(234, 258, 24, 22))
  // Fill remaining inside Z bounds
  while (p.length < COUNT) {
    p.push({ x: 85 + Math.random() * 130, y: 65 + Math.random() * 170 })
  }
  return p.slice(0, COUNT)
}

/* -------- single dot -------- */

function Dot({ sx, sy, tx, ty, dotSize, baseOpacity, progress }) {
  const x = progress.interpolate({ inputRange: [0, 1], outputRange: [sx, tx] })
  const y = progress.interpolate({ inputRange: [0, 1], outputRange: [sy, ty] })
  const opacity = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.1, 0.45, baseOpacity],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: '#fff',
        opacity,
        transform: [{ translateX: x }, { translateY: y }],
      }}
    />
  )
}

/* -------- field -------- */

export default function ParticleField() {
  const progress = useRef(new Animated.Value(0)).current
  const breathe = useRef(new Animated.Value(1)).current

  const dots = useMemo(() => {
    const targets = buildTargets()
    return targets.map((t) => {
      const a = Math.random() * Math.PI * 2
      const r = 180 + Math.random() * 200
      return {
        sx: SIZE / 2 + Math.cos(a) * r,
        sy: SIZE / 2 + Math.sin(a) * r,
        tx: t.x,
        ty: t.y,
        dotSize: 1.5 + Math.random() * 3,
        baseOpacity: 0.5 + Math.random() * 0.5,
      }
    })
  }, [])

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 0.82,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    })
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: breathe }]}>
      {dots.map((d, i) => (
        <Dot key={i} {...d} progress={progress} />
      ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
  },
})
