/**
 * Mac-style artwork for Atharv OS, drawn in SVG: the rolling-hills wallpaper
 * and the dock icons. Each icon is a 64x64 squircle tile in the macOS manner,
 * built from gradients and shapes rather than Apple's own files.
 */

export type IconId =
  | "finder" | "safari" | "messages" | "mail" | "photos" | "notes"
  | "music" | "terminal" | "settings" | "trash" | "folder" | "doc";

const Tile = ({ id, from, to, children }: { id: string; from: string; to: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 64 64" className="mac-icon" aria-hidden="true">
    <defs>
      <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill={`url(#g-${id})`} />
    <rect x="3" y="3" width="58" height="58" rx="14" fill="none" stroke="rgba(0,0,0,.08)" />
    {children}
  </svg>
);

export function Icon({ id }: { id: IconId }) {
  switch (id) {
    case "finder":
      return (
        <svg viewBox="0 0 64 64" className="mac-icon" aria-hidden="true">
          <defs>
            <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fd0ff" /><stop offset="1" stopColor="#1f8ff0" /></linearGradient>
            <linearGradient id="fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f8fc" /><stop offset="1" stopColor="#cfdbe8" /></linearGradient>
            <clipPath id="fc"><rect x="3" y="3" width="58" height="58" rx="14" /></clipPath>
          </defs>
          <g clipPath="url(#fc)">
            <rect x="3" y="3" width="58" height="58" fill="url(#fr)" />
            <path d="M3 3h30c-4 9-6 18-6 27h6c0 10 1 20 3 31H3z" fill="url(#fl)" />
          </g>
          <path d="M22 22v7M43 22v7" stroke="#1d2b3a" strokeWidth="3" strokeLinecap="round" />
          <path d="M18 41c8 6 20 6 28 0" fill="none" stroke="#1d2b3a" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "safari":
      return (
        <Tile id="safari" from="#ffffff" to="#e8ecf2">
          <circle cx="32" cy="32" r="23" fill="#1f8ff0" />
          <circle cx="32" cy="32" r="20" fill="#2fa8ff" />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1="32" y1="13" x2="32" y2={i % 2 ? 15 : 17} stroke="#fff" strokeWidth="1" transform={`rotate(${i * 15} 32 32)`} />
          ))}
          <path d="M32 32l11-13-6 16z" fill="#ff3b30" />
          <path d="M32 32l-11 13 6-16z" fill="#fff" />
        </Tile>
      );
    case "messages":
      return (
        <Tile id="messages" from="#6af06f" to="#1bbf3a">
          <path d="M32 15c-11.6 0-21 7.4-21 16.5 0 5.4 3.3 10.2 8.4 13.2-.6 2.6-2.2 5.1-4.4 6.8 4.2.2 8-1.3 10.6-3.6 2 .5 4.2.8 6.4.8 11.6 0 21-7.4 21-16.7S43.6 15 32 15z" fill="#fff" />
        </Tile>
      );
    case "mail":
      return (
        <Tile id="mail" from="#5cc2ff" to="#1667ea">
          <rect x="13" y="20" width="38" height="25" rx="3" fill="#fff" />
          <path d="M14 22l18 13 18-13" fill="none" stroke="#5aa8f5" strokeWidth="2" />
        </Tile>
      );
    case "photos":
      return (
        <Tile id="photos" from="#ffffff" to="#f1f1f4">
          {["#ff9f0a", "#ffd60a", "#a8e05f", "#30d158", "#40c8e0", "#0a84ff", "#bf5af2", "#ff375f"].map((c, i) => (
            <ellipse key={c} cx="32" cy="21" rx="6.5" ry="11" fill={c} opacity="0.88" transform={`rotate(${i * 45} 32 32)`} style={{ mixBlendMode: "multiply" }} />
          ))}
        </Tile>
      );
    case "notes":
      return (
        <svg viewBox="0 0 64 64" className="mac-icon" aria-hidden="true">
          <defs>
            <clipPath id="nc"><rect x="3" y="3" width="58" height="58" rx="14" /></clipPath>
            <linearGradient id="ny" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe066" /><stop offset="1" stopColor="#ffc93c" /></linearGradient>
          </defs>
          <g clipPath="url(#nc)">
            <rect x="3" y="3" width="58" height="58" fill="#fbfbf8" />
            <rect x="3" y="3" width="58" height="16" fill="url(#ny)" />
            {[28, 36, 44, 52].map((y) => <line key={y} x1="3" y1={y} x2="61" y2={y} stroke="#d9d9d4" strokeWidth="1" />)}
            <g fill="#c9c9c4">{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={9 + i * 6.6} cy="19.5" r="1" />)}</g>
          </g>
          <rect x="3" y="3" width="58" height="58" rx="14" fill="none" stroke="rgba(0,0,0,.08)" />
        </svg>
      );
    case "music":
      return (
        <Tile id="music" from="#ff6a83" to="#fa2d48">
          <path d="M40 16v22.5a5.5 5.5 0 1 1-3-4.9V22.5l-12 3v17a5.5 5.5 0 1 1-3-4.9V20z" fill="#fff" />
        </Tile>
      );
    case "terminal":
      return (
        <Tile id="terminal" from="#3a3a3f" to="#1c1c1f">
          <rect x="9" y="12" width="46" height="40" rx="5" fill="#111" stroke="#4a4a50" />
          <path d="M16 24l7 6-7 6" fill="none" stroke="#e6e6e6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 38h10" stroke="#e6e6e6" strokeWidth="2.6" strokeLinecap="round" />
        </Tile>
      );
    case "settings":
      return (
        <Tile id="settings" from="#a9adb5" to="#6e737d">
          <circle cx="32" cy="32" r="19" fill="#3b3f46" />
          <g fill="#c7cad0">
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x="30" y="10" width="4" height="9" rx="1.5" transform={`rotate(${i * 30} 32 32)`} />)}
          </g>
          <circle cx="32" cy="32" r="14" fill="#c7cad0" />
          <circle cx="32" cy="32" r="6" fill="#5c6068" />
        </Tile>
      );
    case "trash":
      return (
        <svg viewBox="0 0 64 64" className="mac-icon" aria-hidden="true">
          <path d="M16 14h32l-3 42a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z" fill="rgba(235,238,242,.75)" stroke="rgba(255,255,255,.9)" />
          <ellipse cx="32" cy="14" rx="17" ry="4" fill="rgba(210,215,222,.95)" />
          {[24, 32, 40].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="54" stroke="rgba(120,128,140,.45)" strokeWidth="1.4" />)}
        </svg>
      );
    case "folder":
      return (
        <svg viewBox="0 0 64 64" className="mac-icon" aria-hidden="true">
          <defs><linearGradient id="fo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc4f8" /><stop offset="1" stopColor="#3a95e6" /></linearGradient></defs>
          <path d="M6 18a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v4H6z" fill="#4aa3ec" />
          <rect x="6" y="22" width="52" height="32" rx="4" fill="url(#fo)" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 64 64" className="mac-icon" aria-hidden="true">
          <path d="M16 6h22l12 12v38a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#fff" stroke="#d3d6db" />
          <path d="M38 6v12h12" fill="#eef0f3" stroke="#d3d6db" />
          {[26, 32, 38, 44].map((y) => <line key={y} x1="20" y1={y} x2="43" y2={y} stroke="#c3c7cd" strokeWidth="1.6" />)}
        </svg>
      );
  }
}

/** The menu-bar mark: the VelyxLabs "V" where a Mac shows its logo. */
export const Mark = () => (
  <svg viewBox="166 384 925 522" className="mac-mark" aria-hidden="true">
    <path transform="translate(0 1254) scale(0.1 -0.1)" fill="currentColor" d="M1897 8619 c-119 -28 -180 -119 -145 -214 8 -22 89 -155 179 -295 91 -140 202 -313 248 -385 46 -71 156 -245 245 -385 90 -140 253 -397 363 -570 110 -173 325 -511 478 -750 153 -239 377 -590 498 -780 299 -470 323 -505 392 -567 67 -60 188 -125 280 -148 77 -20 221 -19 299 1 33 9 95 33 136 55 127 66 182 119 599 579 102 113 287 315 411 450 372 406 508 570 535 649 20 60 19 137 -4 186 -25 56 -1248 1885 -1318 1972 -79 99 -238 182 -386 202 -97 14 -2753 13 -2810 0z M9175 8530 c-64 -13 -138 -44 -197 -84 -57 -38 -142 -126 -458 -475 -102 -113 -277 -306 -390 -430 -113 -124 -347 -383 -520 -576 -173 -192 -488 -541 -700 -775 -212 -234 -608 -672 -880 -975 -272 -302 -531 -586 -575 -630 -203 -202 -471 -336 -735 -367 -80 -9 -111 -8 -199 6 -62 11 -107 14 -112 9 -9 -9 92 -177 187 -310 144 -202 330 -326 555 -368 75 -14 222 -15 1295 -13 l1209 3 70 24 c146 49 221 105 384 291 518 589 674 767 885 1005 132 149 365 414 520 590 154 176 379 433 500 570 778 886 751 852 776 983 15 76 1 163 -37 233 -16 31 -217 238 -606 626 -489 486 -592 584 -643 611 -104 54 -224 73 -329 52z" />
  </svg>
);

/**
 * The desktop picture, chosen by Atharv: a black Lamborghini Huracán on the
 * driveway of a black villa at dusk.
 */
export function Wallpaper() {
  return <img className="mac-wall" src="/life/wallpaper-black-villa.webp" alt="" aria-hidden="true" decoding="async" />;
}
