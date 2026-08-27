/**
 * VelyxLabs mark, rebuilt as SVG so it stays crisp at any size.
 *
 * This is a reconstruction of the original artwork. To use the real file
 * instead, set `about.velyxLogo` to its URL in content/site.ts — the image
 * replaces this automatically.
 *
 * Designed for a dark tile; the strokes are cream and will disappear on white.
 */
export default function VelyxMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 240 240" width={size} height={size} role="img" aria-label="VelyxLabs">
      <path
        d="M56 60 L84 60 L120 152 L156 60 L184 60 L120 196 Z"
        fill="none"
        stroke="#F3EADB"
        strokeWidth="4"
      />
      <path d="M84 60 L104 112 L74 92 Z" fill="none" stroke="#F3EADB" strokeWidth="3.4" />
      <path d="M156 60 L146 96 L136 74 Z" fill="none" stroke="#F3EADB" strokeWidth="3.4" />
      <path d="M204 40 L126 132 L84 218 L152 110 Z" fill="#EE9A45" />
    </svg>
  );
}
