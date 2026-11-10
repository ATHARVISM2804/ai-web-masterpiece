import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { profile } from "@/content/site";
import { AboutMac, Finder, Messages, Notes, Photos, Safari, Terminal, type AppId, type Open } from "./apps";
import { Icon, Mark, Wallpaper, type IconId } from "./mac-art";
import "./os.css";

/**
 * Atharv OS: the laptop the day ends on, dressed like a Mac. Frosted menu bar,
 * desktop widgets, a magnifying dock and windows with traffic lights. Windows
 * drag by their top edge and come forward on press; on phones they open as
 * full-width sheets.
 */

interface Win {
  id: number;
  app: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  url?: string;
  tab?: string;
}

const APPS: Record<AppId, { title: string; w: number; h: number; icon: IconId; dark?: boolean; bar?: boolean }> = {
  finder: { title: "Finder", w: 820, h: 520, icon: "finder" },
  notes: { title: "Notes", w: 820, h: 440, icon: "notes" },
  safari: { title: "Safari", w: 1000, h: 640, icon: "safari" },
  messages: { title: "Messages", w: 720, h: 500, icon: "messages" },
  terminal: { title: "atharv — -zsh — 80×24", w: 620, h: 380, icon: "terminal", dark: true, bar: true },
  photos: { title: "Photos", w: 860, h: 560, icon: "photos" },
  about: { title: "About Atharv OS", w: 300, h: 470, icon: "settings", bar: true },
  trash: { title: "Trash", w: 720, h: 440, icon: "trash" },
};

const DOCK: (AppId | "mail")[] = ["finder", "safari", "messages", "mail", "photos", "notes", "terminal", "about"];
const DOCK_NAME: Record<string, string> = { finder: "Finder", safari: "Safari", messages: "Messages", mail: "Mail", photos: "Photos", notes: "Notes", terminal: "Terminal", about: "System Settings", trash: "Trash" };

/* Edit with real numbers: km run per day this week, Monday first. */
const WEEK_KM = [5.2, 0, 6.1, 4.8, 0, 8.4, 5.0];
const WEEK_EXTRA = "4× HIIT · 3× calisthenics";

/* Today's client meetings, IST. The last slot is the visitor's. */
const MEETINGS = [
  ["11:30", "Discovery call", "AI agent for inbound leads"],
  ["14:30", "Agent demo", "Weekly build review"],
  ["16:00", "Strategy review", "SaaS MVP roadmap"],
];

const TODAY = [
  ["06:30", "Morning run", "#ff9f0a"],
  ["07:30", "HIIT", "#ff375f"],
  ["09:00", "Cook breakfast", "#30d158"],
  ["11:00", "Deep work", "#0a84ff"],
  ["14:30", "Client calls", "#bf5af2"],
  ["18:00", "Post on X", "#64d2ff"],
  ["20:30", "Meet people", "#ffd60a"],
];

/* The calendar widget shows what's next, so it reads the IST clock. */
function upNext(now: Date) {
  const [h, m] = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).split(":");
  const t = `${h.padStart(2, "0")}:${m}`;
  const i = TODAY.findIndex(([at]) => at >= t);
  return i < 0 ? TODAY.slice(0, 3) : TODAY.slice(i, i + 3);
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function AtharvOS({ onExit, active = true }: { onExit?: () => void; active?: boolean }) {
  const [booted, setBooted] = useState(false);
  const [wins, setWins] = useState<Win[]>([]);
  const [menu, setMenu] = useState(false);
  const seq = useRef(1);
  const top = useRef(10);
  const deskRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const now = useNow();
  const tz = { timeZone: "Asia/Kolkata" } as const;
  const stamp = `${now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", ...tz })}  ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", ...tz })}`;

  const open: Open = useCallback((app, opts = {}) => {
    setMenu(false);
    setWins((ws) => {
      const same = app !== "safari" && ws.find((w) => w.app === app);
      if (same) return ws.map((w) => (w === same ? { ...w, z: ++top.current, min: false, tab: opts.tab ?? w.tab } : w));
      const desk = deskRef.current;
      const W = desk?.clientWidth ?? 1280;
      const H = desk?.clientHeight ?? 760;
      const a = APPS[app];
      const w = Math.min(a.w, W - 24);
      const h = Math.min(a.h, H - 110);
      const n = seq.current++;
      // centre in the clear space between the widgets (left) and the desktop
      // icons (right) when the window fits there, then cascade like macOS
      const L = 390;
      const R = W - 120;
      const step = ws.filter((x) => !x.min).length * 24;
      const cx = (w <= R - L ? L + (R - L - w) / 2 : (W - w) / 2) + step;
      // the boot window sits low so the bridge stays in view
      const cy = n === 1 ? H - h - 96 : (H - 90 - h) / 2 + step;
      return [
        ...ws,
        {
          id: n, app, title: opts.title ?? a.title,
          x: Math.max(10, Math.min(W - w - 10, cx)), y: Math.max(8, Math.min(H - h - 90, cy)),
          w, h, z: ++top.current, min: false, max: false, url: opts.url, tab: opts.tab,
        },
      ];
    });
  }, []);

  const set = (id: number, patch: Partial<Win>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const close = (id: number) => setWins((ws) => ws.filter((w) => w.id !== id));
  const focus = (id: number) => set(id, { z: ++top.current });

  // boot once the laptop is reached, then open the note and the terminal
  useEffect(() => {
    if (!active || booted) return;
    const t = setTimeout(() => {
      setBooted(true);
      // one window on boot, low on the screen, so the bridge stays in view
      open("notes");
    }, 1700);
    return () => clearTimeout(t);
  }, [active, booted, open]);

  const drag = (id: number) => (e: RPointerEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest("button, a, input, iframe, .mac-files, .mac-note, .mac-notelist, .mac-chat__log, .mac-photos, .mac-side button")) return;
    if (window.innerWidth < 760) return;
    const w0 = wins.find((w) => w.id === id);
    if (!w0 || w0.max) return;
    // only the top band of a window (its toolbar) drags it, like a Mac
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientY - r.top > 52) return;
    focus(id);
    const sx = e.clientX;
    const sy = e.clientY;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => set(id, { x: w0.x + ev.clientX - sx, y: Math.max(0, w0.y + ev.clientY - sy) });
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  // dock magnification: each icon grows with closeness to the pointer
  const magnify = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    dockRef.current?.querySelectorAll<HTMLElement>(".mac-dock__item").forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const k = Math.max(0, 1 - d / 150);
      el.style.setProperty("--s", String(1 + 0.55 * k * k));
    });
  };
  const unmagnify = () => dockRef.current?.querySelectorAll<HTMLElement>(".mac-dock__item").forEach((el) => el.style.setProperty("--s", "1"));

  const body = (w: Win) => {
    switch (w.app) {
      case "finder":
        return <Finder open={open} tab={w.tab} />;
      case "trash":
        return <Finder open={open} tab="trash" />;
      case "notes":
        return <Notes open={open} />;
      case "safari":
        return <Safari url={w.url ?? "https://www.velyxlabs.in"} />;
      case "messages":
        return <Messages />;
      case "terminal":
        return <Terminal />;
      case "photos":
        return <Photos open={open} />;
      case "about":
        return <AboutMac />;
    }
  };

  const visible = wins.filter((w) => !w.min);
  const front = visible.reduce<Win | null>((a, w) => (!a || w.z > a.z ? w : a), null);
  const running = new Set(wins.map((w) => w.app));

  return (
    <div className="mac" data-lenis-prevent onPointerDown={(e) => !(e.target as HTMLElement).closest(".mac-menu, .mac-bar__mark") && setMenu(false)}>
      <Wallpaper />

      <div className={`mac-boot${booted ? " is-done" : ""}`} aria-hidden={booted}>
        <Mark />
        <div className="mac-boot__bar"><span /></div>
      </div>

      <header className="mac-bar">
        <button type="button" className="mac-bar__mark" aria-label="Atharv menu" onClick={() => setMenu((m) => !m)}>
          <Mark />
        </button>
        <strong>{front ? (front.app === "about" ? "System Settings" : DOCK_NAME[front.app] ?? "Finder") : "Finder"}</strong>
        {["File", "Edit", "View", "Go", "Window", "Help"].map((m) => (
          <span key={m} className="mac-bar__menu">{m}</span>
        ))}
        <span className="mac-bar__fill" />
        <span className="mac-bar__icons" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" /></svg>
          <svg viewBox="0 0 30 16" className="mac-batt"><rect x="1" y="2" width="24" height="12" rx="3.5" /><rect x="3" y="4" width="17" height="8" rx="2" className="mac-batt__lvl" /><path d="M27 6v4" /></svg>
          <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></svg>
          <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="5" rx="2.5" /><rect x="3" y="14" width="18" height="5" rx="2.5" /></svg>
        </span>
        <span className="mac-bar__time">{stamp}</span>
      </header>

      {menu && (
        <div className="mac-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => open("about")}>About Atharv OS</button>
          <hr />
          <a role="menuitem" href={profile.booking} target="_blank" rel="noopener noreferrer">Book a call…</a>
          <a role="menuitem" href="https://x.com/Atharv_Golait" target="_blank" rel="noopener noreferrer">Follow on X…</a>
          {onExit && (
            <>
              <hr />
              <button type="button" role="menuitem" onClick={onExit}>Back to the villa</button>
            </>
          )}
        </div>
      )}

      <div className="mac-desk" ref={deskRef}>
        <aside className="mac-widgets" aria-label="Widgets">
          <section className="mac-widget mac-widget--cal">
            <p className="mac-widget__day">{now.toLocaleDateString("en-GB", { weekday: "long", ...tz }).toUpperCase()}</p>
            <p className="mac-widget__date">{now.toLocaleDateString("en-GB", { day: "numeric", ...tz })}</p>
            <ul>
              {upNext(now).map(([t, label, c]) => (
                <li key={label}>
                  <i style={{ background: c }} />
                  <span>{label}</span>
                  <em>{t}</em>
                </li>
              ))}
            </ul>
          </section>
          <section className="mac-widget mac-widget--fit">
            <p className="mac-widget__label">Running · this week</p>
            <p className="mac-widget__big">
              {WEEK_KM.reduce((a, b) => a + b, 0).toFixed(1)}
              <small> km</small>
            </p>
            <div className="mac-chart" aria-label="Kilometres run per day this week">
              {WEEK_KM.map((km, i) => {
                const max = Math.max(...WEEK_KM);
                const today = (now.getDay() + 6) % 7 === i;
                return (
                  <span key={i} className={`${today ? "is-today" : ""}${km ? "" : " is-rest"}`}>
                    <i style={{ height: `${Math.max(7, (km / max) * 100)}%` }} />
                    <b>{"MTWTFSS"[i]}</b>
                  </span>
                );
              })}
            </div>
            <p className="mac-widget__sub">{WEEK_EXTRA}</p>
          </section>
          <section className="mac-widget mac-widget--wide mac-widget--meet">
            <p className="mac-widget__label">
              Client meetings<span>Today · IST</span>
            </p>
            <ul className="mac-meet">
              {MEETINGS.map(([t, title, note]) => (
                <li key={t}>
                  <em>{t}</em>
                  <strong>{title}</strong>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <a className="mac-meet__you" href={profile.booking} target="_blank" rel="noopener noreferrer">
              <span>Next open slot is yours</span>
              <strong>Book 30 min →</strong>
            </a>
          </section>
          <a className="mac-widget mac-widget--wide mac-widget--now" href="https://www.velyxlabs.in" target="_blank" rel="noopener noreferrer">
            <img src="/life/velyx-v.svg" alt="" />
            <span>
              <span className="mac-widget__label">Now building</span>
              <strong className="mac-widget__big">VelyxLabs</strong>
              <span className="mac-widget__sub">AI agents, SaaS and apps · 35+ clients worldwide</span>
            </span>
          </a>
        </aside>

        <div className="mac-desk__icons">
          {[
            { label: "Client Products", icon: "folder" as const, go: () => open("finder", { tab: "clients" }) },
            { label: "Design Lab", icon: "folder" as const, go: () => open("finder", { tab: "designs" }) },
            { label: "about-me.txt", icon: "doc" as const, go: () => open("notes") },
          ].map((d) => (
            <button key={d.label} type="button" className="mac-desk__icon" onClick={d.go}>
              <Icon id={d.icon} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {visible.map((w) => {
          const a = APPS[w.app];
          return (
            <section
              key={w.id}
              className={`mac-win mac-win--${w.app}${front?.id === w.id ? " is-front" : ""}${a.dark ? " is-dark" : ""}${w.max ? " is-max" : ""}`}
              style={w.max ? { zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
              onPointerDown={(e) => {
                focus(w.id);
                drag(w.id)(e);
              }}
              aria-label={w.title}
            >
              <div className="mac-lights">
                <button type="button" className="mac-light mac-light--close" aria-label={`Close ${w.title}`} onClick={() => close(w.id)} />
                <button type="button" className="mac-light mac-light--min" aria-label={`Minimise ${w.title}`} onClick={() => set(w.id, { min: true })} />
                <button type="button" className="mac-light mac-light--max" aria-label={`Zoom ${w.title}`} onClick={() => set(w.id, { max: !w.max })} />
              </div>
              {a.bar && <div className="mac-win__title">{w.app === "about" ? "" : w.title}</div>}
              <div className="mac-win__body">{body(w)}</div>
            </section>
          );
        })}
      </div>

      <nav className="mac-dock" ref={dockRef} aria-label="Dock" onPointerMove={magnify} onPointerLeave={unmagnify}>
        {DOCK.map((d) => (
          <button
            key={d}
            type="button"
            className="mac-dock__item"
            aria-label={DOCK_NAME[d]}
            onClick={() => (d === "mail" ? (window.location.href = `mailto:${profile.email}`) : open(d, d === "safari" ? { url: "https://www.velyxlabs.in" } : undefined))}
          >
            <Icon id={d === "about" ? "settings" : d === "mail" ? "mail" : APPS[d].icon} />
            <span className="mac-dock__tip">{DOCK_NAME[d]}</span>
            {d !== "mail" && running.has(d) && <i className="mac-dock__dot" />}
          </button>
        ))}
        <span className="mac-dock__sep" />
        <button type="button" className="mac-dock__item" aria-label="Trash" onClick={() => open("trash")}>
          <Icon id="trash" />
          <span className="mac-dock__tip">Trash</span>
        </button>
      </nav>
    </div>
  );
}
