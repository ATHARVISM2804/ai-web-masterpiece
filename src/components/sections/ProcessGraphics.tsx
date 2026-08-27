import { Rocket } from "lucide-react";

/**
 * Animated illustrations for the process step cards — one per step, each a
 * literal picture of the work in that step. Pure CSS/SVG, no animation
 * library; the reduced-motion rules in index.css freeze all of it.
 */

/** Shared stage: soft panel, hairline grid, faint blue bloom. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-48 w-full overflow-hidden rounded-[1.25rem] ring-1 ring-foreground/[0.05]"
      style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f6f7f9 100%)" }}
      aria-hidden
    >
      {/* hairline grid, faded off at the edges */}
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(12,10,9,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(12,10,9,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(circle at 50% 45%, #000 25%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, #000 25%, transparent 80%)",
        }}
      />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(59,130,246,0.10),transparent_62%)]" />
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1 — Scope call: a radar finding the shape of the work                      */
/* -------------------------------------------------------------------------- */

/** Contacts the sweep lights up as it passes over their bearing. */
const CONTACTS = [
  { angle: 42, radius: 58 },
  { angle: 168, radius: 74 },
  { angle: 286, radius: 44 },
];

function RadarGraphic() {
  return (
    <Frame>
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
        {[160, 120, 80, 40].map((size) => (
          <span
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.09]"
            style={{ height: size, width: size }}
          />
        ))}

        {/* crosshair */}
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-foreground/[0.06]" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-foreground/[0.06]" />

        {/* expanding pings */}
        {[0, 1.6].map((delay) => (
          <span
            key={delay}
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(59,130,246,0.4)]"
            style={{ animation: `radar-ping 3.2s ease-out ${delay}s infinite` }}
          />
        ))}

        {/* rotating sweep + its leading edge */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(37,99,235,0.4), rgba(59,130,246,0.07) 52deg, transparent 78deg)",
            animation: "radar-spin 4s linear infinite",
          }}
        />
        <span className="absolute inset-0" style={{ animation: "radar-spin 4s linear infinite" }}>
          <span className="absolute bottom-1/2 left-1/2 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-transparent to-[rgba(37,99,235,0.6)]" />
        </span>

        {/* contacts */}
        {CONTACTS.map(({ angle, radius }) => (
          <span
            key={angle}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${angle}deg) translateY(-${radius}px)` }}
          >
            <span
              className="block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(37,99,235)]"
              style={{ animation: `radar-contact 4s linear ${(angle / 360) * 4}s infinite` }}
            />
          </span>
        ))}

        <span
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(37,99,235)]"
          style={{ animation: "radar-blip 2s ease-in-out infinite" }}
        />
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* 2 — Blueprint: the layout drawing itself                                   */
/* -------------------------------------------------------------------------- */

const draw = (delay: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  style: { animation: `blueprint-draw 7s ease-in-out ${delay}s infinite` },
});

const fill = (delay: number) => ({
  style: { animation: `blueprint-fill 7s ease-in-out ${delay}s infinite` },
});

function BlueprintGraphic() {
  const ink = "rgba(37,99,235,0.55)";

  return (
    <Frame>
      <svg viewBox="0 0 300 192" className="absolute inset-0 h-full w-full">
        {/* measurement guides */}
        <g stroke="rgba(12,10,9,0.18)" strokeWidth="1" strokeDasharray="3 4">
          <line x1="48" y1="30" x2="48" y2="162" {...draw(0)} />
          <line x1="62" y1="174" x2="238" y2="174" {...draw(0.1)} />
        </g>

        {/* artboard */}
        <rect
          x="62"
          y="30"
          width="176"
          height="132"
          rx="10"
          fill="none"
          stroke={ink}
          strokeWidth="1.6"
          {...draw(0.15)}
        />

        {/* block tints, then their outlines */}
        <g fill="rgba(59,130,246,0.12)">
          <rect x="74" y="42" width="152" height="18" rx="5" {...fill(0.5)} />
          <rect x="74" y="70" width="42" height="80" rx="5" {...fill(0.7)} />
          <rect x="124" y="70" width="102" height="36" rx="5" {...fill(0.9)} />
          <rect x="124" y="114" width="102" height="36" rx="5" {...fill(1.1)} />
        </g>
        <g fill="none" stroke={ink} strokeWidth="1.3">
          <rect x="74" y="42" width="152" height="18" rx="5" {...draw(0.4)} />
          <rect x="74" y="70" width="42" height="80" rx="5" {...draw(0.6)} />
          <rect x="124" y="70" width="102" height="36" rx="5" {...draw(0.8)} />
          <rect x="124" y="114" width="102" height="36" rx="5" {...draw(1)} />
        </g>

        {/* content hints */}
        <g fill="rgba(12,10,9,0.2)">
          <rect x="84" y="82" width="22" height="4" rx="2" {...fill(1.2)} />
          <rect x="84" y="94" width="16" height="4" rx="2" {...fill(1.3)} />
          <rect x="136" y="84" width="52" height="4" rx="2" {...fill(1.4)} />
          <rect x="136" y="128" width="66" height="4" rx="2" {...fill(1.5)} />
        </g>
      </svg>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* 3 — Build: an editor typing out the work                                   */
/* -------------------------------------------------------------------------- */

const CODE_LINES = [
  'import { agent } from "@/core";',
  "export function run(input) {",
  "  return agent.plan(input);",
];

function EditorGraphic() {
  return (
    <Frame>
      <div className="absolute inset-x-4 bottom-0 top-5 flex flex-col overflow-hidden rounded-t-xl bg-white shadow-[0_20px_44px_-26px_rgb(0_0_0/0.4)] ring-1 ring-foreground/[0.07]">
        <div className="flex items-center gap-1.5 border-b border-foreground/[0.06] bg-[#fafafa] px-3 py-2.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-auto h-2 w-24 rounded-full bg-foreground/[0.08]" />
        </div>

        <div className="flex flex-1">
          <div className="flex w-9 flex-col gap-2.5 border-r border-foreground/[0.06] bg-[#fafafa] px-2 py-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-3.5 w-full rounded-[3px]"
                style={{ background: i === 1 ? "rgba(59,130,246,0.2)" : "rgba(12,10,9,0.08)" }}
              />
            ))}
          </div>

          <div className="flex-1 space-y-2 px-3 py-3">
            {CODE_LINES.map((line, i) => (
              <div key={line} className="flex items-center">
                <span
                  className="overflow-hidden whitespace-pre font-mono text-[10px] leading-none text-foreground/70"
                  style={{
                    // width animates in `ch` so the caret lands on the last glyph
                    ["--chars" as string]: `${line.length}ch`,
                    animation: `code-type 6s steps(${line.length}) ${i * 0.55}s infinite`,
                  }}
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

            {/* every build lands on a staging URL */}
            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(59,130,246,0.1)] px-2.5 py-1"
              style={{ animation: "code-deploy 6s ease-in-out infinite" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[rgb(37,99,235)]" />
              <span className="font-mono text-[9px] leading-none text-[rgb(37,99,235)]">
                deployed to staging
              </span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* 4 — Integrate: your systems wired into one hub                             */
/* -------------------------------------------------------------------------- */

const WIRES = [
  "M84 46 C 112 46, 116 96, 138 96",
  "M84 96 C 108 96, 116 96, 138 96",
  "M84 146 C 112 146, 116 96, 138 96",
];
const OUT_WIRE = "M186 96 C 208 96, 214 96, 236 96";

function IntegrateGraphic() {
  return (
    <Frame>
      <svg viewBox="0 0 300 192" className="absolute inset-0 h-full w-full">
        <g fill="none" strokeWidth="1.4">
          {[...WIRES, OUT_WIRE].map((d) => (
            <path key={d} d={d} stroke="rgba(12,10,9,0.14)" />
          ))}

          {/* packets flowing along each wire */}
          {[...WIRES, OUT_WIRE].map((d, i) => (
            <path
              key={`flow-${d}`}
              d={d}
              stroke="rgb(37,99,235)"
              strokeDasharray="3 9"
              strokeLinecap="round"
              style={{ animation: `wire-flow 1.4s linear ${i * 0.28}s infinite` }}
            />
          ))}
        </g>

        {/* source systems */}
        {[46, 96, 146].map((y, i) => (
          <g key={y} style={{ animation: `node-pulse 2.8s ease-in-out ${i * 0.4}s infinite` }}>
            <rect x="24" y={y - 14} width="60" height="28" rx="9" fill="#fff" stroke="rgba(12,10,9,0.1)" />
            <circle cx="39" cy={y} r="3.5" fill="rgb(37,99,235)" />
            <rect x="48" y={y - 5} width="26" height="3.5" rx="1.75" fill="rgba(12,10,9,0.16)" />
            <rect x="48" y={y + 2} width="16" height="3.5" rx="1.75" fill="rgba(12,10,9,0.1)" />
          </g>
        ))}

        {/* hub */}
        <rect x="138" y="70" width="48" height="52" rx="15" fill="#fff" stroke="rgba(37,99,235,0.35)" strokeWidth="1.4" />
        <rect
          x="138"
          y="70"
          width="48"
          height="52"
          rx="15"
          fill="none"
          stroke="rgb(37,99,235)"
          strokeWidth="1.4"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: "hub-halo 2.4s ease-out infinite",
          }}
        />
        {[84, 96, 108].map((y, i) => (
          <rect
            key={y}
            x="150"
            y={y - 2}
            width={i === 1 ? 24 : 16}
            height="4"
            rx="2"
            fill="rgb(37,99,235)"
            fillOpacity={i === 1 ? 1 : 0.45}
            style={{ animation: `node-pulse 2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}

        {/* destination */}
        <rect x="236" y="74" width="44" height="44" rx="13" fill="#fff" stroke="rgba(12,10,9,0.1)" />
        <path
          d="M248 96 l6 7 12 -14"
          fill="none"
          stroke="rgb(37,99,235)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          style={{ animation: "check-draw 2.8s ease-in-out infinite" }}
        />
      </svg>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* 5 — Evaluate: the build measured, not assumed                              */
/* -------------------------------------------------------------------------- */

const TICKS = Array.from({ length: 27 }, (_, i) => -78 + (i * 156) / 26);
const SWEEP = "4.5s cubic-bezier(0.45, 0, 0.25, 1) infinite alternate";

function GaugeGraphic() {
  const tick = (angle: number) =>
    `translate(-50%, -50%) rotate(${angle}deg) translateY(-88px)`;

  return (
    <Frame>
      {/* everything below is positioned around this single point */}
      <div className="absolute left-1/2 top-[88%] h-0 w-0">
        <svg
          viewBox="0 0 220 220"
          className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2"
        >
          <path
            d="M10.2 88.8 A 102 102 0 0 1 209.8 88.8"
            fill="none"
            stroke="rgba(59,130,246,0.4)"
            strokeWidth="1.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
        </svg>

        {/* inactive ticks */}
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2">
          {TICKS.map((angle) => (
            <span
              key={angle}
              className="absolute left-1/2 top-1/2 h-[11px] w-[2px] rounded-full bg-foreground/20"
              style={{ transform: tick(angle) }}
            />
          ))}
        </div>

        {/* active ticks, revealed in step with the needle */}
        <div
          className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2"
          style={{
            WebkitMaskImage: "conic-gradient(from 282deg, #000 var(--gauge-sweep), transparent 0)",
            maskImage: "conic-gradient(from 282deg, #000 var(--gauge-sweep), transparent 0)",
            animation: `gauge-fill ${SWEEP}`,
          }}
        >
          {TICKS.map((angle) => (
            <span
              key={angle}
              className="absolute left-1/2 top-1/2 h-[11px] w-[2px] rounded-full bg-[rgb(37,99,235)]"
              style={{ transform: tick(angle) }}
            />
          ))}
        </div>

        {/* hub, needle, readout */}
        <span className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.14),rgba(12,10,9,0.045))]" />
        <span
          className="absolute bottom-0 left-0 block h-[82px] w-[2px] origin-bottom rounded-full bg-[rgb(37,99,235)]"
          style={{ animation: `gauge-needle ${SWEEP}` }}
        />
        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(37,99,235)] bg-white" />
        <span className="absolute left-1/2 top-[-124px] -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.2em] text-foreground/40">
          EVAL PASS RATE
        </span>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* 6 — Deployment: the launch                                                 */
/* -------------------------------------------------------------------------- */

const STARS = [
  { x: 14, y: 24, d: 0 },
  { x: 138, y: 32, d: 0.8 },
  { x: 34, y: 116, d: 1.4 },
  { x: 148, y: 100, d: 2.1 },
];

function LaunchGraphic() {
  return (
    <Frame>
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
        <span
          className="absolute inset-0 rounded-full border border-[rgba(79,70,229,0.2)]"
          style={{ animation: "rocket-orbit 4s ease-in-out infinite" }}
        />
        <span className="absolute inset-5 rounded-full border border-dashed border-[rgba(79,70,229,0.16)]" />
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.14),transparent_65%)]" />

        {STARS.map(({ x, y, d }) => (
          <span
            key={`${x}-${y}`}
            className="absolute h-1 w-1 rounded-full bg-[rgba(79,70,229,0.6)]"
            style={{ left: x, top: y, animation: `star-twinkle 3s ease-in-out ${d}s infinite` }}
          />
        ))}

        <div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "rocket-lift 4s ease-in-out infinite" }}
        >
          <Rocket size={52} strokeWidth={1.4} className="-rotate-45 text-[rgb(79,70,229)]" />
        </div>

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
    </Frame>
  );
}

const graphics: Record<string, () => JSX.Element> = {
  call: RadarGraphic,
  blueprint: BlueprintGraphic,
  build: EditorGraphic,
  integrate: IntegrateGraphic,
  evaluate: GaugeGraphic,
  launch: LaunchGraphic,
};

export default function StepGraphic({ name }: { name: string }) {
  const Graphic = graphics[name] ?? RadarGraphic;
  return <Graphic />;
}
