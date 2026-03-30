/**
 * Zenith "Z✦" logo – serif Z with two 4‑pointed sparkle stars.
 * Rendered as a pure SVG so it stays crisp at any size.
 */
export default function ZenithLogo({ size = 36, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* ── Serif Z ── */}
      <path
        d="M22 22 H72 L24 78 H78"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* top serif */}
      <path
        d="M22 22 V32"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* bottom serif */}
      <path
        d="M78 78 V68"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* ── Upper‑left sparkle ✦ ── */}
      <path
        d="M16 12 C16 12 20 18 16 24 C16 24 12 18 16 12 Z
           M16 12 C16 12 22 16 28 12 C28 12 22 16 16 12 Z
           M16 24 C16 24 22 20 28 24 C28 24 22 20 16 24 Z
           M8 18 C8 18 12 16 16 12 C16 12 12 16 8 18 Z
           M8 18 C8 18 12 20 16 24 C16 24 12 20 8 18 Z
           M28 18 C28 18 24 16 16 12 Z
           M28 18 C28 18 24 20 16 24 Z"
        fill={color}
      />
      {/* simplified sparkle: 4‑point star */}
      <path
        d="M16 6 L18.5 15 L16 24 L13.5 15 Z"
        fill={color}
      />
      <path
        d="M6 15 L15 12.5 L24 15 L15 17.5 Z"
        fill={color}
      />

      {/* ── Lower‑right sparkle ✦ ── */}
      <path
        d="M84 76 L86.5 85 L84 94 L81.5 85 Z"
        fill={color}
      />
      <path
        d="M74 85 L83 82.5 L92 85 L83 87.5 Z"
        fill={color}
      />
    </svg>
  )
}
