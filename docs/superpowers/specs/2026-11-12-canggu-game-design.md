# Canggu: turning "Live it" into an open-world game

Design for Phases 2 (game foundations) and 3 (the Canggu district). Written 2026-11-12.
Status: approved by Atharv on 2026-11-12, with yes to all four questions in section 12. Lines marked **(my call)** are decisions Claude made; everything else under "What Atharv decided" is his.

Research this rests on, all in `docs/superpowers/research/`:
`2026-11-12-bali-places.md`, `2026-11-12-bali-people.md`, `2026-11-12-bali-culture.md`.

## 1. Intent

Today the portfolio's "Live it" mode is one villa, one lane and a strip of beach. Atharv wants it to grow into a real game: a Bali you can travel through, where you walk, run, swim and drive, and where the people around you are true to the place: travellers, surfers, people training, founders, and the Balinese and Indonesian people who live and work there.

Why: the portfolio becomes something people play, come back to and share, and it becomes the base for accounts, other players and more of Bali later. Atharv moves to Bali in January 2027, so the game can grow alongside his real life there.

## 2. What Atharv decided

- Do the research (done), the game foundations and the first full district, Canggu.
- Leave player accounts ("make your own ID") and multiplayer for later; they need a backend and more thought.
- More districts of Bali come after Canggu, one at a time.
- It should feel realistic, "posh and proper", and like a proper game: travel, the beach, swimming, driving, people working out, a gym at the beach.
- Earlier decisions that still stand: no XP bar or quest panel, keep the UI light; no AI-generated images; all art is built in code and Blender; no licensed audio.

## 3. Goals

1. **A district, not a plot.** A compressed, fictional Canggu about 750 m along the coast and 400 m inland (the real one is about 5 km of coast), made of regions that load as you travel.
2. **Real movement.** Walk, run, swim, ride the scooter, take the jet ski, all on a map generated from the 3D model instead of hand-typed rectangles.
3. **A place that is alive.** People with jobs and routines by the hour, traffic, parked scooters, tide, weather and sound that change through the real Bali day.
4. **Things to do that are true to Canggu.** Eight activities drawn from the research (section 7).
5. **Local life shown accurately and with respect** (section 9).
6. **Every milestone is playable and can ship on its own** (section 10).

## 4. Non-goals

- Accounts, sign-up, multiplayer, chat, leaderboards across players, any backend. Progress is saved in the browser only.
- Other districts (Uluwatu, Ubud, Nusa Penida). The map's edges should leave room for them.
- Real-scale geography, photoreal console graphics, combat, money or a shop, an XP system.
- A separate codebase. **(my call)** The game stays in this repo and reuses the current engine.

## 5. Anti-goals: what would make this a failure even if it works

- **The portfolio gets slower.** What story mode ("Watch my day") downloads before the title screen appears must not grow past today's (about 15 MB, worst loader freeze about 0.15 s). See 6.4 for what story mode loads.
- **Phones can't play it.** Target 30 fps on a mid-range phone, 60 fps on an M-series laptop.
- **Culture as a gimmick.** Anything on the "never" list in section 9.
- **Made-up facts on screen.** Text marked "(unverified)" in the research stays out until checked.
- **Glamour that lies.** Canggu's traffic, construction and vanished rice fields are part of the picture, shown without comment.
- **Losing the point.** A visitor must always be one tap from "Book a call", and the laptop (Atharv OS) stays the heart of the villa.

## 6. The world

### 6.1 Orientation

Keep today's coordinates: the villa at the origin, the sea to the east (+x). The sun already sets over the water, which matches the real west-facing coast.

### 6.2 Regions

Each region is its own Blender script, its own compressed model, its own walkable-map file and its own list of people and stations. Regions load when the player comes near and unload when far. A cheap, always-loaded "horizon" model (coastline, Mount Agung, far villas) keeps the distance from looking empty.

| # | Region | What is there | Source in research |
|---|---|---|---|
| 1 | **The villa** | As today: pool, gym bale, studio, the laptop. Cut out of the current single file. | existing |
| 2 | **The lane** | As today: gate, warung, kopi, parked scooters. | existing |
| 3 | **The Shortcut** | A narrow raised lane, a drop on each side, villa walls with a few leftover paddies, one field shrine, a farmer, ducks after harvest. Jammed with scooters in late afternoon. | places 3, culture 3–5, people 18 |
| 4 | **Jalan Pantai** (the beach road) | A dead-end road to the sea: cafés, a coworking space, an open-air gym and recovery club (sauna barrel, cold plunge), a surf shop, scooter rental, a kilo laundry, a warung, a bale banjar, a parking lot with an attendant. | places 13, 15, 16; people 2, 5, 6, 12, 14, 17 |
| 5 | **The beach** | Black sand, a sea temple on a rock seen from outside, surf-rental shacks, a lifeguard tower with red and yellow flags, rows of bean bags facing the sunset, pull-up and parallel bars on the sand with an open-air beach gym behind them, a beach club with a pool on the ocean edge, a beginner surf break. | places 1, 4, 5, 9–14; people 8, 9, 15 |
| 6 | **The fishing beach and river mouth** | The quiet north edge: painted outrigger boats above the tide line, fishermen at dusk, a river mouth you can wade at low tide. The map's soft boundary. | places 7, 8, 25 |

The beach gym is an invention: the research found open-air gyms and beach calisthenics bars in Bali, but no gym on the sand in Canggu. The game's "About this world" page says so.

**Naming (my call):** the district is called Canggu and public beaches keep their real names. Businesses are invented. Temples, banjars and subaks get no real or real-sounding names; they are "the sea temple", "the bale banjar".

### 6.3 The map (my call)

Game directions: the sea is east (+x); "up the coast" is −z. Distances are metres.

```
 inland                                                      sea →
 x = -220        x = -60                 x = 150      x = 190
   │               │                        │ sand       │
   │  ┌────────────┴── Jalan Pantai ────────┤ THE BEACH  │   z = -250
   │  │ cafés, coworking, gym club, warung  │ temple rock│
 main │            │                        │ gym, club  │
 road │        THE SHORTCUT                 │            │
 (edge)            │  paddies, villa walls  │            │
   │  │            │                        │            │
   │  └────────────┴──── the lane ──────────┤ quiet end  │   z = 16
   │               VILLA (0, 0)             │ of the sand│
                                            │            │
   up the coast (z ≈ -450 to -550): the fishing beach, then the river mouth
```

- The villa's lane stays as it is and still reaches the sand: that is the quiet south end of the same beach. Walking the sand north is the fast way to the main beach, as in the real Canggu.
- The Shortcut runs north from the lane's west end to Jalan Pantai.
- The inland main road is the map's edge: jammed traffic you can see, not a road you can take. The river mouth is the edge up the coast; the sand simply empties out down the coast.
- What stands at the lane's end today (the small beach club, the surf rack, the outriggers) stays until M3 rebuilds the beach, then is folded into it.

### 6.4 What story mode loads (my call)

There is one beach, not a frozen copy for the story. Story mode loads the villa and the lane before the title screen, as today, and fetches the beach region in the background afterwards, because the "run" chapter films it. If the beach hasn't arrived when that chapter comes up, the chapter holds on the villa gate for a moment. The other regions load only in Live it.

### 6.5 Time, tide and weather

- **Time (my call):** the game has its own clock that the player controls. It starts on real Bali time ("Bali now"), and the sky button also offers four set hours: dawn 06:15, midday, golden hour 17:15 and night. People, traffic and activities follow the game clock, so nothing is ever shut to a visitor because of their time zone. A station that is closed says when it opens and offers to jump there ("The run club meets at 06:15. Go to 06:15?").
- **Weather:** real Canggu weather in "Bali now", as built (cloud, rain); clear at the set hours.
- **Ceremony days (my call):** scripted on the game clock, not the real calendar: one in every few game days has a road closure or a procession. Festival weeks (penjor) and Nyepi are out of scope for now.
- **Tide (my call):** a simple twice-a-day rise and fall of about 2 m, not real tide tables. High tide narrows the sand to a strip; low tide uncovers firm sand, reef shelf and the river crossing. The About page says the tide is approximate.
- **Flags:** the lifeguard flies red when it rains or the tide is high and running; swimming and the surf lesson are then closed and the lifeguard says why. Choosing a set hour clears the weather, so there is always a way to play them.

## 7. Things to do

Each activity is a small set of pure rules with tests (the pattern `trial.ts`, `hyrox.ts` and `tour.ts` already follow) plus one glass card on screen. Nothing gives points. Each ends in a line of conversation, a note in the phone, or a time to beat.

| # | Activity | Where, when | How it plays | Why it's true |
|---|---|---|---|---|
| 1 | **Run club** | Beach road café, mornings | Join the pack along the sand; stay inside the pace band; coffee conversation after | Clubs meet 6:00–7:00, coffee is where people network |
| 2 | **Surf lesson** | Beginner break, before 10:00 and after 15:00 | Paddle, then pop up as the wave lifts: a timing game | Lesson groups at 08:00; wind arrives about 10:00 |
| 3 | **Swim to the buoy** | Between the flags | Free swimming out and back; closed on red-flag days | Lifeguards and flags are real; the coast is rough |
| 4 | **Beach gym session** | Bars on the sand, sled lane behind | The existing HYROX sim moves here; add a short bars set | HYROX in Bali is training and sims, not a race |
| 5 | **Contrast round** | Recovery club | Hold a breathing rhythm for three minutes at 4°C, then the sauna | Standard at Canggu gyms |
| 6 | **Deep-work block** | Coworking space | Sit down before the 3 pm Europe call; the laptop opens Atharv OS and one real VelyxLabs project | Time zones shape the working day |
| 7 | **Warung lunch** | Beach road warung | Order in Indonesian by choosing phrases; learned phrases collect in the phone | Research gives the exchange and prices |
| 8 | **Sunset** | Bean bags, 17:00 onward | Sit; founders, surfers and run-club people drift in; one invites you to a founder dinner, which leads to "Book a call" | The sunset ritual, and small founder dinners, are real |

Kept from today: the six medals, the beach run, the jet ski, photo mode, the Canggu tour (its stops move to the new map).

**What happens to today's stations (my call):** the villa keeps its home moments (HIIT set in the gym bale, ice bath, kitchen, sofa, studio, pool mastermind, work wall, gate). The HYROX sim leaves the villa gym for the beach gym in M3. The lane's warung becomes the place where you order in Indonesian in M4 (no second warung activity); the kopi stays a one-line stop. Station ids stay stable so saved progress carries over, and the phone's "Today" list shows the stations of the region you are in.

**Moments, not activities** (no card, no reward beyond a line of dialogue or a journal note):
- The morning round: someone places offerings at each doorway from about 6:30; they fade through the day and are swept at dusk.
- A road closed for a ceremony: a pecalang raises a hand, scooters idle, nobody honks; two minutes later the road opens.
- A procession crossing the sand to the sea on a ceremony day; surfers wait.
- Gamelan practice heard from the bale banjar at dusk.

## 8. People

- **Who:** the 18 archetypes in the people report (section "Most game-usable details"), each with a place, hours, an animation and two or three lines. The lines there are invented for fictional characters and can be used as written.
- **Named locals explain things.** Tap a prop (a penjor, a poleng-wrapped statue, the split gate) and a neighbour says what it means to them in a line or two. No pop-up quiz.
- **Language (from research):** Indonesian is the default greeting language, since many people working in Canggu are from Java, Sumba and elsewhere. Balinese greetings come from Balinese characters.
- **How many (my call):** up to about 40 animated people in view on a laptop and 15 on a phone, with simple far-away stand-ins beyond that. These numbers are starting points; M1's measurements (section 10, item 9) set the real ones.
- **Animation and clothing (my call):** CC0 motion clips and CC0 MakeHuman clothing are allowed, on the same footing as the CC0 MakeHuman bodies already in use. Nothing with a licence that needs attribution or forbids redistribution, and nothing AI-generated.
- **Cast variety (Atharv, 2026-11-12):** a mixed, clothed cast for the district; his founder friends at the pool stay as they are.

## 9. Showing local life: rules

From the culture report's do/don't list; the full list is binding and lives there. The short version:

**Never:** sacred objects as pickups, currency or things that can be knocked over; a ceremony as a mini-game; the player performing rituals or gaining anything from offerings; entering a temple's inner courts; cremation as spectacle; spirits, trance or priests played for laughs or horror; sacred imagery on UI, merchandise or surfboards; temple dress as a costume; Balinese people as mystical props or comic relief; real, identifiable temples or compounds copied.

**Fine as ambient life:** people placing offerings, sweeping, praying at a shopfront shrine; incense, gamelan heard from the street; penjor in festival weeks; temple gates and walls seen from outside; farmers, ducks, egrets; a pecalang directing traffic; a procession passing.

**Built into the engine:** the player and vehicles route around offerings on the ground and cannot touch them.

**One existing thing changes:** medal 1 currently spins next to the villa's family shrine. A prize beside a shrine reads as a pickup at a sacred spot. It moves to the daybed bale.

**Honest framing:**
- An "About this world" page: this is a compressed, fictional Canggu; real Canggu is living villages with their own banjars, temples and subaks; ceremonies are simplified; the beach gym and the tide are inventions; mistakes are the author's, who is a guest there.
- A phone journal, "What you saw", that uses the real word first (canang sari, penjor, banjar, subak, pecalang) and then a plain gloss.
- Before cultural text goes live, a Balinese reader checks it, is paid, and is credited by name if they agree. Until then, cultural text is limited to items the research could source. Atharv will find and pay a reader once he is in Bali.

## 10. Foundations (Phase 2)

What has to exist under the district. The builder chooses file formats and module boundaries.

1. **Regions that load as you move.** One manifest per region (bounds, model, walkable map, neighbours). Loading is spread over frames the way the loader now uploads textures, so no single frame takes more than about 50 ms. Budget per region **(my call)**: 4 MB compressed, 150,000 triangles.
2. **A generated walkable map.** A grid per region (about 0.5 m cells) that says, for each cell: blocked, walkable, road, sand, shallow water or deep water, plus ground height. It is produced by the Blender build from the model. It replaces the rectangle lists in `play.ts`. The rules that read it are pure and tested.
3. **Movement by surface.** On foot anywhere walkable; wading in shallow water (exists); swimming in deep water; the scooter on roads, lanes and sand; the jet ski on deep water.
4. **People and traffic.** A routine system (who is where at which hour, doing what) and scooters following the roads, both driven by Bali time.
5. **Stations, generalised.** Today's stations plus dialogue, "ask about this" explanations and activity starts, defined per region.
6. **One save module.** Everything remembered (medals, best times, phrases, journal) goes through a single versioned module in the browser's storage, shaped so it can later sync to an account.
7. **Sound by region.** Roosters at dawn, frogs and geckos at night, surf, scooters, a beach bar's bass carrying inland, gamelan at dusk. Synthesised, as now.
8. **Realism pass.** Fix the glowing eyes; add clothed and varied characters; waves that break on the sand, foam and wet sand; denser street props; the villa's finish kept as the standard for everything else.
9. **Performance guard.** A benchmark that walks a fixed route through the district and fails if the frame rate or the story-mode download grows past the targets in section 5. "A mid-range phone" is measured by proxy **(my call)**: Chrome at 390×844, 2× pixel density, CPU throttled 4×, plus caps on draw calls and triangles in view. M1 starts by measuring today's build on that proxy; those numbers become the floor, and later milestones may not fall more than 10% below it. Atharv also tries each milestone on his own phone before it ships.

## 11. Milestones

Each one is its own implementation plan and ends in something Atharv can play and post.

| # | Milestone | You can… |
|---|---|---|
| M1 | **Foundation** on the existing map: regions, generated walkable map, save module, swimming | swim off the beach; nothing else looks different, but the rectangle lists are gone |
| M2 | **People and traffic** on the existing map, with the character realism fixes | see the lane and beach busy by the hour |
| M3 | **The beach**, rebuilt: temple rock, surf shacks, lifeguard, bean bags, beach gym, beach club, tide | surf, swim to the buoy, train on the sand, watch the sunset |
| M4 | **Jalan Pantai**: cafés, coworking, recovery club, warung, rental, bale banjar | do a deep-work block, a contrast round, order lunch in Indonesian |
| M5 | **The Shortcut**, the fishing beach, the run club, the ceremony moments, the journal and About page | run with the club, wait for a procession, read what you saw |
| M6 | **Polish**: water, sound, phones, new clips for X | play the whole district on a phone |

## 12. Questions only Atharv can answer

Answered 2026-11-12: yes to all four. The cast is mixed and clothed; the game also gets its own address, `/play`, which drops people straight in; the 11–12 November work is committed and pushed to the branch first; he will find a Balinese reader in Bali.

1. **The cast.** Until now everyone in the world is a shirtless, athletic man, by your choice. A true Canggu has women (the run-club leader, the warung owner, the coworking manager, the woman placing offerings) and clothed people (Gojek drivers in green jackets, pecalang in sarong and udeng, farmers, baristas). I recommend a mixed, clothed cast for the district and keeping your founder friends at the pool as they are. Yes?
2. **Entry.** Should the game stay behind "Live it" on your portfolio, or also get its own address (for example `/play`) that drops people straight in?
3. **Saving the current work.** About 2,000 lines from 11–12 November are uncommitted. Commit and push them to the branch before the rebuild starts?
4. **A Balinese reader.** Once you're in Bali, can you find and pay someone to check the cultural text? Until then I keep it to what the research could source.

## 13. Left to the builder

File formats for regions and the walkable grid; how Blender bakes the grid; module layout under `src/life` or a new folder; how far-away people are drawn; UI layout of activity cards within the existing glass style; the order of work inside a milestone.
