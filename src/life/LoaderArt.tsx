/**
 * The loader's drawing: the villa on the beach in line, drawing itself stroke
 * by stroke as the world loads, while the sun comes up behind it.
 */

// the drawing, in order: ground, palms, house, roof bale, windows, door, the sea
const STROKES = [
  "M8 170 H312",
  "M44 170 Q48 132 62 102",
  "M62 102 q-20 -2 -32 10 M62 102 q-12 -15 -30 -14 M62 102 q8 -17 28 -16 M62 102 q20 0 28 15",
  "M276 170 Q272 136 258 108",
  "M258 108 q20 -2 32 10 M258 108 q12 -15 30 -14 M258 108 q-8 -17 -28 -16 M258 108 q-20 0 -28 15",
  "M92 170 V126 H228 V170",
  "M82 126 H238 M96 126 V90 H224 V126",
  "M86 90 H234 M86 90 V80 H234 V90",
  "M128 80 L160 56 L192 80",
  "M108 140 H140 V162 H108 Z M178 98 H210 V118 H178 Z",
  "M150 170 V140 H168 V170",
  "M70 184 H250 M96 192 H224",
];

export default function LoaderArt({ progress }: { progress: number }) {
  const k = Math.min(1, Math.max(0, progress / 100));
  return (
    <svg className="life__loader-art" viewBox="0 0 320 200" aria-hidden="true">
      <defs>
        <clipPath id="loader-sky">
          <rect x="0" y="0" width="320" height="170" />
        </clipPath>
      </defs>
      <g clipPath="url(#loader-sky)">
        {/* rising up and to the right, into clear sky above the roof */}
        <circle className="life__loader-sun" cx={200 + k * 34} cy={190 - k * 152} r="15" />
      </g>
      {STROKES.map((d, i) => {
        // each stroke draws in its own slice of the progress, overlapping the next
        const from = (i / STROKES.length) * 0.85;
        const t = Math.min(1, Math.max(0, (k - from) / 0.2));
        return <path key={i} d={d} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />;
      })}
    </svg>
  );
}
