import { Rocket } from "lucide-react";

/**
 * Animated illustrations for the process step cards. One per step, each a
 * loose visual metaphor for the work in that step. Pure CSS/SVG — every
 * animation is disabled by the reduced-motion rules in index.css.
 */

const FRAME = "relative mx-auto h-44 w-full max-w-[340px] overflow-hidden";

/** Step 1 — a radar sweeping concentric rings, looking for the shape of the work. */
function RadarGraphic() {
  return (
    <div className={FRAME} aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2">
        {[176, 132, 88, 44].map((size) => (
          <span
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.08]"
            style={{ height: size, width: size }}
          />
        ))}

        {/* expanding pings */}
        {[0, 1.6].map((delay) => (
          <span
            key={delay}
            className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(59,130,246,0.45)]"
            style={{ animation: `radar-ping 3.2s ease-out ${delay}s infinite` }}
          />
        ))}

        {/* rotating sweep wedge */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(59,130,246,0.38), rgba(59,130,246,0.06) 55deg, transparent 80deg)",
            animation: "radar-spin 4s linear infinite",
          }}
        />

        {/* centre blip */}
        <span
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(37,99,235)]"
          style={{ animation: "radar-blip 2s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}

const CODE_LINES = [
  'import { agent } from "@/core";',
  "export function run(input) {",
  "  return agent.plan(input);",
];

/** Step 2 — an editor typing out the blueprint. */
function EditorGraphic() {
  return (
    <div className={FRAME} aria-hidden>
      <div className="absolute inset-x-0 bottom-0 top-3 overflow-hidden rounded-t-xl bg-white shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)] ring-1 ring-foreground/[0.06]">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-foreground/[0.06] bg-[#fafafa] px-3 py-2.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-auto h-2 w-20 rounded-full bg-foreground/[0.08]" />
        </div>

        <div className="flex h-full">
          {/* file rail */}
          <div className="flex w-9 flex-col gap-2.5 border-r border-foreground/[0.06] bg-[#fafafa] px-2 py-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-3.5 w-full rounded-[3px] bg-foreground/[0.08]" />
            ))}
          </div>

          {/* typed code */}
          <div className="flex-1 space-y-2 px-3 py-3">
            {CODE_LINES.map((line, i) => (
              <div key={line} className="flex items-center">
                <span
                  className="overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none text-foreground/70"
                  style={{ animation: `code-type 6s steps(${line.length}) ${i * 0.55}s infinite` }}
                >
                  {line}
                </span>
                {i === CODE_LINES.length - 1 && (
                  <span
                    className="ml-0.5 inline-block h-3 w-[1.5px] bg-[rgb(37,99,235)]"
                    style={{ animation: "code-caret 1s steps(1) infinite" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TICKS = Array.from({ length: 27 }, (_, i) => -78 + (i * 156) / 26);
const SWEEP = "4.5s cubic-bezier(0.45, 0, 0.25, 1) infinite alternate";

/** Step 3 — a gauge sweeping as the build is measured. */
function GaugeGraphic() {
  return (
    <div className={FRAME} aria-hidden>
      <div className="absolute left-1/2 top-[86%] h-0 w-0 -translate-x-1/2">
        {/* dashed outer arc */}
        <svg
          viewBox="0 0 220 220"
          className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="110"
            cy="110"
            r="102"
            fill="none"
            stroke="rgba(59,130,246,0.35)"
            strokeWidth="1.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
            transform="rotate(-168 110 110)"
            pathLength={100}
            style={{ strokeDasharray: "0.55 3.2", strokeDashoffset: 0 }}
            strokeDashoffset={0}
            // only the top 156° of the ring is drawn
            clipPath="url(#gauge-clip)"
          />
          <defs>
            <clipPath id="gauge-clip">
              <rect x="0" y="0" width="220" height="112" />
            </clipPath>
          </defs>
        </svg>

        {/* inactive ticks */}
        <div className="absolute left-0 top-0">
          {TICKS.map((angle) => (
            <span
              key={angle}
              className="absolute left-0 top-0 h-[11px] w-[2px] rounded-full bg-foreground/20"
              style={{ transform: `rotate(${angle}deg) translate(-50%, -88px)` }}
            />
          ))}
        </div>

        {/* active ticks, revealed in step with the needle */}
        <div
          className="absolute left-0 top-0"
          style={{
            WebkitMaskImage:
              "conic-gradient(from 282deg, #000 var(--gauge-sweep), transparent 0)",
            maskImage: "conic-gradient(from 282deg, #000 var(--gauge-sweep), transparent 0)",
            animation: `gauge-fill ${SWEEP}`,
          }}
        >
          {TICKS.map((angle) => (
            <span
              key={angle}
              className="absolute left-0 top-0 h-[11px] w-[2px] rounded-full bg-[rgb(37,99,235)]"
              style={{ transform: `rotate(${angle}deg) translate(-50%, -88px)` }}
            />
          ))}
        </div>

        {/* hub + needle */}
        <span className="absolute left-1/2 top-1/2 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.05]" />
        <span
          className="absolute bottom-0 left-1/2 block h-[84px] w-[2px] -translate-x-1/2 origin-bottom rounded-full bg-[rgb(37,99,235)]"
          style={{ animation: `gauge-needle ${SWEEP}` }}
        />
        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(37,99,235)] bg-white" />
      </div>
    </div>
  );
}

/** Step 4 — the launch. */
function LaunchGraphic() {
  return (
    <div className={FRAME} aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
        <span
          className="absolute inset-0 rounded-full border border-[rgba(79,70,229,0.18)]"
          style={{ animation: "rocket-orbit 4s ease-in-out infinite" }}
        />
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.12),transparent_65%)]" />

        <div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "rocket-lift 4s ease-in-out infinite" }}
        >
          <Rocket size={44} strokeWidth={1.4} className="text-[rgb(79,70,229)] -rotate-45" />
        </div>

        {/* exhaust */}
        {[
          { x: -14, delay: 0, size: 5 },
          { x: 0, delay: 0.45, size: 7 },
          { x: 13, delay: 0.9, size: 4 },
          { x: 5, delay: 1.35, size: 5 },
        ].map(({ x, delay, size }) => (
          <span
            key={`${x}-${delay}`}
            className="absolute left-1/2 top-[58%] rounded-full bg-[rgba(59,130,246,0.55)]"
            style={{
              height: size,
              width: size,
              marginLeft: x,
              animation: `rocket-exhaust 2.2s ease-out ${delay}s infinite`,
            }}
          />
        ))}

        {/* horizon */}
        <svg viewBox="0 0 160 40" className="absolute inset-x-0 bottom-6 h-8 w-full">
          <path
            d="M4 26 C 30 6, 54 34, 80 22 S 132 8, 156 24"
            fill="none"
            stroke="rgba(12,10,9,0.14)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

const graphics: Record<string, () => JSX.Element> = {
  call: RadarGraphic,
  blueprint: EditorGraphic,
  build: GaugeGraphic,
  launch: LaunchGraphic,
};

export default function StepGraphic({ name }: { name: string }) {
  const Graphic = graphics[name] ?? RadarGraphic;
  return <Graphic />;
}
