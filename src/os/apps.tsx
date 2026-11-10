import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile, work } from "@/content/site";
import { Icon } from "./mac-art";

/**
 * The apps inside Atharv OS, laid out the way their Mac counterparts are. All
 * content is real: Atharv's story, client products, the design lab on
 * velyxlabs.in and the ways to reach him.
 */

export type AppId = "finder" | "notes" | "safari" | "messages" | "terminal" | "photos" | "about" | "trash";

export interface Open {
  (app: AppId, opts?: { url?: string; title?: string; tab?: string }): void;
}

const VELYX = "https://www.velyxlabs.in";

const DESIGNS = [
  ["northloop", "Northloop", "Landing page"],
  ["plotline", "Plotline", "Landing page"],
  ["saffra", "Saffra", "Landing page"],
  ["contour", "Contour", "Dashboard"],
  ["kiln", "Kiln Studio", "Landing page"],
  ["nocta", "Nocta Card", "Hero"],
  ["looply", "Looply", "Landing page"],
  ["northloop-agents", "Northloop Agents", "Dashboard"],
  ["inkwell", "Inkwell", "Landing page"],
  ["tapline", "Tapline", "Hero"],
  ["driftline", "Driftline", "Landing page"],
  ["rackline", "Rackline", "Dashboard"],
  ["ridgeline", "Ridgeline", "Landing page"],
  ["lunea", "Lunea Homes", "Hero"],
  ["ryu-anime", "Ryu", "Hero"],
] as const;

const STORY = [
  { year: "2023", title: "Got into NIT Hamirpur", text: "Engineering, the way everyone around me said it should go." },
  { year: "Then", title: "Saw the rat race up close", text: "I didn't like the job culture or the system: everyone running the same race. So I decided to build something of my own instead." },
  { year: "2025", title: "Started freelancing", text: "First clients, first products shipped. Then I realised one person taking projects doesn't scale." },
  { year: "2026", title: "Started VelyxLabs", text: "An AI agency that helps businesses scale with agents, SaaS products and websites. 35+ brands and clients across the globe so far." },
  { year: "Now", title: "Building, every day", text: "VelyxLabs, Tech Lead at Getlandy AI, and my own products: Estatico and Eavesdrop." },
];

const Chevrons = () => (
  <span className="mac-nav" aria-hidden="true">
    <svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" /></svg>
    <svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" /></svg>
  </span>
);

/* ---------------- Finder ---------------- */

type Place = "clients" | "designs" | "trash";

export function Finder({ open, tab = "clients" }: { open: Open; tab?: string }) {
  const [place, setPlace] = useState<Place>(tab as Place);
  const items: { key: string; name: string; sub: string; img?: string; url?: string }[] =
    place === "clients"
      ? work.items.map((w) => ({ key: w.name, name: w.name.split(" – ")[0], sub: w.name.split(" – ")[1] ?? "", img: w.image, url: w.href }))
      : place === "designs"
        ? DESIGNS.map(([slug, name, kind]) => ({ key: slug, name, sub: kind, img: `${VELYX}/designs/heroes/${slug}.webp`, url: `${VELYX}/designs/${slug}/index.html` }))
        : [
            { key: "rat", name: "rat-race.zip", sub: "Deleted for good" },
            { key: "9to5", name: "9-to-5.app", sub: "Never opened" },
            { key: "later", name: "someday.txt", sub: "Replaced by today" },
          ];
  const label = place === "clients" ? "Client Products" : place === "designs" ? "Design Lab" : "Trash";
  const side = (p: Place, text: string, glyph: string) => (
    <button type="button" className={place === p ? "is-on" : ""} onClick={() => setPlace(p)}>
      <span className="mac-side__g">{glyph}</span>
      {text}
    </button>
  );
  return (
    <div className="mac-split">
      <aside className="mac-side">
        <p>Favourites</p>
        {side("clients", "Client Products", "◎")}
        {side("designs", "Design Lab", "◇")}
        <button type="button" onClick={() => open("notes")}><span className="mac-side__g">✎</span>About Me</button>
        <button type="button" onClick={() => open("safari", { url: VELYX, title: "VelyxLabs" })}><span className="mac-side__g">◍</span>velyxlabs.in</button>
        <p>Locations</p>
        {side("trash", "Trash", "⌫")}
        <p>Tags</p>
        <span className="mac-tag"><i style={{ background: "#ff5f57" }} />Shipped</span>
        <span className="mac-tag"><i style={{ background: "#28c840" }} />Live</span>
        <span className="mac-tag"><i style={{ background: "#0a84ff" }} />AI agents</span>
      </aside>
      <section className="mac-main">
        <header className="mac-toolbar">
          <Chevrons />
          <strong>{label}</strong>
          <span className="mac-toolbar__count">{items.length} items</span>
        </header>
        <div className="mac-files">
          {items.map((it) => (
            <button key={it.key} type="button" className="mac-file" onClick={() => it.url && open("safari", { url: it.url, title: it.name })}>
              <span className="mac-file__thumb">{it.img ? <img src={it.img} alt="" loading="lazy" /> : <Icon id="doc" />}</span>
              <strong>{it.name}</strong>
              <span>{it.sub}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Notes ---------------- */

const NOTES = [
  { id: "about", title: "about me", date: "Today", preview: "hey, I'm Atharv 👋" },
  { id: "story", title: "my story", date: "Yesterday", preview: "2023: got into NIT Hamirpur…" },
  { id: "work", title: "how I work", date: "Monday", preview: "fixed price, you own everything…" },
  { id: "contact", title: "say hi", date: "Sunday", preview: "the fastest way to reach me" },
];

export function Notes({ open }: { open: Open }) {
  const [id, setId] = useState("about");
  return (
    <div className="mac-split mac-split--notes">
      <aside className="mac-side mac-side--notes">
        <p>iCloud</p>
        <button type="button" className="is-on"><span className="mac-side__g">▤</span>All iCloud<em>{NOTES.length}</em></button>
        <button type="button"><span className="mac-side__g">▤</span>Notes<em>{NOTES.length}</em></button>
      </aside>
      <div className="mac-notelist">
        <p className="mac-notelist__head">Pinned</p>
        {NOTES.map((n) => (
          <button key={n.id} type="button" className={id === n.id ? "is-on" : ""} onClick={() => setId(n.id)}>
            <strong>{n.title}</strong>
            <span>
              <b>{n.date}</b> {n.preview}
            </span>
          </button>
        ))}
      </div>
      <div className="mac-notepane">
      <header className="mac-toolbar mac-toolbar--notes" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" /></svg>
        <span className="mac-toolbar__gap" />
        <b>Aa</b>
        <svg viewBox="0 0 24 24"><path d="M4 7l2 2 3-3M4 15l2 2 3-3M12 8h8M12 16h8" /></svg>
        <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16M10 10v9" /></svg>
        <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M5 17l5-4 3 2 3-3 4 4" /></svg>
        <span className="mac-toolbar__gap" />
        <svg viewBox="0 0 24 24"><path d="M12 4v11M8 8l4-4 4 4M6 13v6h12v-6" /></svg>
        <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></svg>
      </header>
      <article className="mac-note">
        <p className="mac-note__date">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        {id === "about" && (
          <>
            <h2>hey, I'm Atharv 👋</h2>
            <p>Welcome to my little corner of the internet.</p>
            <ul>
              <li>founder of <a href={VELYX} target="_blank" rel="noopener noreferrer">VelyxLabs</a>, an AI agency: 35+ brands and clients across the globe</li>
              <li>Tech Lead at Getlandy AI</li>
              <li>NIT Hamirpur, but the rat race was never for me</li>
              <li>run most mornings, a little calisthenics, cook my own food</li>
              <li>post what I build on <a href="https://x.com/Atharv_Golait" target="_blank" rel="noopener noreferrer">X</a></li>
            </ul>
            <p className="mac-note__links">
              <button type="button" onClick={() => setId("story")}>read my story →</button>
              <button type="button" onClick={() => open("finder")}>see the work →</button>
            </p>
          </>
        )}
        {id === "story" && (
          <>
            <h2>my story</h2>
            {STORY.map((s) => (
              <p key={s.year}>
                <b>{s.year}</b> · <b>{s.title}.</b> {s.text}
              </p>
            ))}
          </>
        )}
        {id === "work" && (
          <>
            <h2>how I work</h2>
            <ul>
              <li><b>fixed price, no surprises.</b> scope and price agreed before any code.</li>
              <li><b>you own everything.</b> full source, your infrastructure, no lock-in.</li>
              <li><b>human in the loop.</b> every agent ships with a trace and a gate.</li>
              <li><b>weeks, not quarters.</b> a first automation live in 2–3 weeks.</li>
              <li><b>one person accountable.</b> you talk to me, from scope call to handover.</li>
            </ul>
          </>
        )}
        {id === "contact" && (
          <>
            <h2>say hi</h2>
            <ul>
              <li>book a call: <a href={profile.booking} target="_blank" rel="noopener noreferrer">cal.com/atharvgolait</a></li>
              <li>email: <a href={`mailto:${profile.email}`}>{profile.email}</a></li>
              <li>whatsapp: <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer">message me</a></li>
              <li>x: <a href="https://x.com/Atharv_Golait" target="_blank" rel="noopener noreferrer">@Atharv_Golait</a></li>
            </ul>
          </>
        )}
      </article>
      </div>
    </div>
  );
}

/* ---------------- Safari ---------------- */

export function Safari({ url }: { url: string }) {
  return (
    <div className="mac-safari">
      <header className="mac-toolbar mac-toolbar--safari">
        <Chevrons />
        <span className="mac-safari__url">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z" /></svg>
          {url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/index\.html$/, "")}
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open in a new tab">↗</a>
      </header>
      <iframe src={url} title={url} loading="lazy" />
    </div>
  );
}

/* ---------------- Messages ---------------- */

export function Messages() {
  const [sent, setSent] = useState<string | null>(null);
  const replies = [
    { label: "I want to build something", reply: "Love that. Grab 30 minutes and tell me about it 👇" },
    { label: "Just looking around", reply: "Take your time. I'm one message away when you're ready 👇" },
  ];
  const chosen = replies.find((r) => r.label === sent);
  return (
    <div className="mac-split mac-split--msg">
      <aside className="mac-side mac-side--msg">
        <span className="mac-search">Search</span>
        <button type="button" className="is-on mac-convo">
          <span className="mac-avatar">AG</span>
          <span>
            <strong>Atharv Golait</strong>
            <em>building something?</em>
          </span>
        </button>
      </aside>
      <section className="mac-main mac-chat">
        <header className="mac-toolbar mac-chat__to">
          <span>To:</span> <strong>Atharv Golait</strong>
        </header>
        <div className="mac-chat__log">
          <p className="mac-chat__day">iMessage · Today</p>
          <p className="bubble bubble--them">hey 👋 thanks for spending the day with me</p>
          <p className="bubble bubble--them">building something?</p>
          {sent && <p className="bubble bubble--me">{sent}</p>}
          {chosen && (
            <>
              <p className="bubble bubble--them">{chosen.reply}</p>
              <div className="mac-chat__actions">
                <a href={profile.booking} target="_blank" rel="noopener noreferrer">Book a call</a>
                <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href={`mailto:${profile.email}`}>Email</a>
              </div>
            </>
          )}
        </div>
        <div className="mac-chat__input">
          {!sent ? (
            replies.map((r) => (
              <button key={r.label} type="button" onClick={() => setSent(r.label)}>
                {r.label}
              </button>
            ))
          ) : (
            <span>iMessage</span>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Terminal ---------------- */

const HELP = "commands: whoami  story  projects  clients  stack  contact  hire  clear";

function answer(cmd: string): ReactNode {
  const c = cmd.trim().toLowerCase();
  if (!c) return null;
  if (c === "help" || c === "ls") return HELP;
  if (c === "whoami") return "atharv golait — founder @ velyxlabs, tech lead @ getlandy ai.\nbuilds ai agents for businesses that want to scale.";
  if (c === "story") return STORY.map((s) => `${s.year.padEnd(5)} ${s.title}`).join("\n");
  if (c === "projects") return work.items.map((w) => `• ${w.name}`).join("\n");
  if (c === "clients") return "35+ brands and clients across the globe.";
  if (c === "stack") return "typescript · react · next · node · python · supabase · claude & openai · n8n · three.js";
  if (c === "contact") return `email  ${profile.email}\ncal    ${profile.booking}\nx      x.com/Atharv_Golait`;
  if (c === "hire" || c === "hire atharv" || c === "sudo hire atharv")
    return (
      <>
        permission granted. →{" "}
        <a href={profile.booking} target="_blank" rel="noopener noreferrer">book a 30-min call</a>
      </>
    );
  if (c === "rat race" || c === "rm -rf rat-race") return "already deleted. check the trash.";
  if (c === "sudo") return "nice try.";
  return `zsh: command not found: ${c}`;
}

export function Terminal() {
  const [lines, setLines] = useState<{ cmd: string; out: ReactNode }[]>([]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // types "whoami" once on open, the way a person would
  useEffect(() => {
    const word = "whoami";
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyping(word.slice(0, i));
      if (i === word.length) {
        clearInterval(id);
        setTimeout(() => {
          setTyping("");
          setLines([{ cmd: word, out: answer(word) }, { cmd: "", out: HELP }]);
        }, 350);
      }
    }, 110);
    return () => clearInterval(id);
  }, []);

  // keep the newest line in view, scrolling only the window (never the page)
  useEffect(() => {
    const box = rootRef.current?.parentElement;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  const run = () => {
    const cmd = value;
    setValue("");
    if (cmd.trim().toLowerCase() === "clear") return setLines([]);
    setLines((l) => [...l, { cmd, out: answer(cmd) }]);
  };

  const ps = <span className="mac-term__ps">atharv@Atharvs-MacBook ~ %</span>;
  return (
    <div className="mac-term" ref={rootRef} onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <p className="mac-term__dim">Last login: {new Date().toDateString()} on ttys000</p>
      {lines.map((l, i) => (
        <div key={i}>
          {l.cmd && <p>{ps} {l.cmd}</p>}
          {l.out && <pre>{l.out}</pre>}
        </div>
      ))}
      <p className="mac-term__line">
        {ps}
        {typing ? (
          <span> {typing}</span>
        ) : (
          <input ref={inputRef} value={value} aria-label="Terminal input" spellCheck={false} autoCapitalize="off" onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} />
        )}
      </p>
    </div>
  );
}

/* ---------------- Photos ---------------- */

export function Photos({ open }: { open: Open }) {
  return (
    <div className="mac-split">
      <aside className="mac-side">
        <p>Photos</p>
        <button type="button" className="is-on"><span className="mac-side__g">▦</span>Library</button>
        <p>Albums</p>
        <button type="button"><span className="mac-side__g">◇</span>Designs</button>
      </aside>
      <section className="mac-main">
        <header className="mac-toolbar">
          <strong>Library</strong>
          <span className="mac-toolbar__count">{DESIGNS.length} photos</span>
        </header>
        <div className="mac-photos">
          {DESIGNS.map(([slug, name]) => (
            <button key={slug} type="button" onClick={() => open("safari", { url: `${VELYX}/designs/${slug}/index.html`, title: name })} aria-label={name}>
              <img src={`${VELYX}/designs/heroes/${slug}.webp`} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- About This Mac ---------------- */

export function AboutMac() {
  const rows = [
    ["Name", "Atharv Golait"],
    ["Role", "Founder, VelyxLabs"],
    ["Clients", "35+ brands worldwide"],
    ["Building since", "2025"],
    ["Education", "NIT Hamirpur"],
    ["Runs on", "Morning runs, home-cooked food"],
  ];
  return (
    <div className="mac-aboutmac">
      <div className="mac-aboutmac__art">
        <Icon id="finder" />
      </div>
      <h2>Atharv OS</h2>
      <p className="mac-aboutmac__ver">Version 26.0</p>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <a className="mac-btn" href={profile.booking} target="_blank" rel="noopener noreferrer">Book a call…</a>
    </div>
  );
}
