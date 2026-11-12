# Kingdom of Prod V0: Plan

How V0 in `spec.md` gets built. The repo holds only docs today, so everything below is new.

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) with TypeScript | Native on Vercel, and one server route covers the judge |
| Styling | CSS Modules and CSS custom properties | The design tokens map straight onto variables, with no extra library |
| Scenes | Inline SVG with CSS animation, driven by the beat and the tier | They are code, they are small, they follow the palette, and they need no animation library |
| Content validation | Zod | One schema checks quests at build and test time |
| Judge model | `claude-haiku-5-5` through the Anthropic TypeScript SDK | A three-way classification, so the smallest current model is the starting point |
| Unit tests | Vitest | |
| End-to-end tests | Playwright | |
| Eval | A Node script that reports to Arize Phoenix through `@arizeai/phoenix-client` | Run by hand, not in CI, since it costs money |
| Sound | Web Audio API, generated in the browser: ambience, place layers, and effects | No audio file and no licence to track |
| Hosting | Vercel Hobby | From the PRD |

If the judge misses 16 of 20 on Haiku after two prompt revisions, the next step is `claude-sonnet-5-5` with the same prompt.

## 2. Architecture

The game runs in the browser. The server does one thing.

```
Browser                                   Vercel
┌───────────────────────────────┐        ┌──────────────────────────┐
│ UI (React)                    │        │ POST /api/judge          │
│   ↕                           │  whisper│   validate input         │
│ Game engine (pure reducer)    │ ───────▶│   build prompt + rubric  │──▶ Anthropic API
│   ↕                           │◀─────── │   return { tier }        │
│ Content (quests, endings)     │   tier  └──────────────────────────┘
└───────────────────────────────┘
```

- **Written choices never touch the network.** The tier is in the content file.
- **Game state lives in React memory only.** There is no storage, so a refresh restarts.
- **The judge returns a tier and nothing else.** The reaction text comes from content.

## 3. Repository layout

```
app/
  page.tsx                 the single game page
  api/judge/route.ts       the judge endpoint
src/
  engine/                  state machine, scoring, endings (no React, no I/O)
  content/
    schema.ts              Zod schema for a quest
    quests/01-lantern-pleas.ts ... 05-counting-fog.ts
    endings.ts
  judge/
    prompt.ts              prompt builder, with a PROMPT_VERSION constant
    parse.ts               strict parsing of the model output into a tier
  ui/                      screens and components
  design/
    tokens.css             palette, type, spacing, motion (from Opus), and one color per place
    scenes/                one animated SVG component per quest and per ending
      parts.tsx            shared pieces, including the keeper
      scenes.module.css    all scene and map animation
      Map.tsx              the map of Hollowmere for the travel beat
  audio/
    sound.ts               base ambience, place layers, and effects (Web Audio)
    cues.ts                which effects play for which beat (pure, unit tested)
evals/
  labels.jsonl             20 hand-labelled answers
  run.ts                   runs the judge over the labels and reports to Arize
tests/
  unit/                    engine, content, judge parsing
  e2e/                     Playwright paths
specs/001-v0/
```

## 4. Engine

A pure reducer with no I/O.

- **State:** `phase` (`title`, `travel`, `scene`, `decision`, `judging`, `reaction`, `lore`, `ending`), `questIndex`, `tiers[]` (one per finished quest), `muted`.
- **Actions:** `begin`, `arrive`, `showDecision`, `choose(choiceId)`, `whisper(text)`, `judged(tier)`, `judgeFailed`, `showLore`, `continue`, `restart`, `toggleMute`.
- **Derived values:** reputation is the sum of tier values, lanterns are `tiers[]`, and the ending comes from the thresholds in `spec.md` section 5.2.

`begin` and `continue` lead to `travel` for the next quest, and `arrive` leads to its `scene`. After the last quest, `continue` leads to `ending`.

`judgeFailed` returns the phase to `decision` with the whisper field hidden for that quest, which is the fallback in the spec.

## 5. Content model

```ts
type Tier = "wise" | "muddled" | "poor";

type Quest = {
  id: string;
  title: string;
  place: { name: string; road: string };   // shown on the travel beat
  scene: { id: string; alt: string };
  story: string[];                         // 2 or 3 lines
  choices: { id: string; label: string; tier: Tier }[];  // exactly 3, one per tier
  reactions: Record<Tier, string>;
  lore: { line: string; sourceTitle: string; sourceUrl: string };
  rubric: {
    lesson: string;
    tiers: Record<Tier, string>;
    examples: Record<Tier, string[]>;      // 2 per tier
  };
};
```

The schema enforces the counts. A unit test fails the build if a quest lacks a tier, has a duplicate tier, or has an empty source URL.

## 6. Judge

**Endpoint:** `POST /api/judge` with `{ questId, answer }`, returning `{ tier }` or an error status.

**Server steps:**

1. Reject unknown `questId`, an empty answer, or an answer over 280 characters.
2. Build the prompt: fixed instructions, the quest's rubric, and the player's answer inside a delimited block marked as untrusted content.
3. Call the model with a small output cap and constrain the answer to the three tier names.
4. Parse strictly. Anything that is not exactly one tier is an error, never a default tier.
5. Return the tier. Do not log the answer.

**Limits:**

- An 8 second timeout in the client, and a shorter one on the server call.
- A per-IP rate cap held in memory. This is best effort, since Hobby instances do not share memory and nothing may be stored.
- A monthly spend limit on the API key as the real backstop.

**Prompt versioning:** `PROMPT_VERSION` changes with any edit to the instructions. The eval records it, so a release can be tied to a passing run.

## 7. Eval

1. `evals/labels.jsonl` holds 20 rows of `{ questId, answer, label }`, four per quest, with a spread of tiers.
2. `evals/run.ts` calls the same prompt builder and parser as the endpoint, so the eval tests the shipped code path.
3. It prints agreement, a 3 by 3 confusion table, and each disagreement in full.
4. It logs the run to Arize Phoenix as a dataset and an experiment, with the model and `PROMPT_VERSION`.
5. It exits non-zero under 16 of 20.

Phoenix is Arize's open-source tool. Arize AX is its separate hosted platform, with a different client, and V0 does not use it. The eval targets a hosted Phoenix project so the result has a link to show, and falls back to Phoenix running locally. The client is still changing, so the calls are written against the current Phoenix docs at build time.

Paula labels before any judge run. If the judge disagrees and Paula changes a label after seeing its output, the change is noted in the eval file with the reason.

## 8. Design hand-off

Opus delivers these, and Fable integrates them:

| Deliverable | Form |
|---|---|
| Palette, type scale, spacing, motion timings | `src/design/tokens.css` |
| 5 quest scenes and 3 ending scenes | SVG components in `src/design/scenes/` |
| Lantern in three states (lit, dim, dark) | SVG component |
| Fog and falling leaves | CSS animations that respect reduced motion |
| Screen layouts for title, quest beats, and ending | A short written guide with one reference page |

Fable builds the game with placeholder tokens and grey-box scenes first, so the design work and the engine work run in parallel.

## 8a. Living scenes (added after the first playtest)

This section covers spec section 9.2 to 9.4.

**Layout.** In a quest, the scene sits at the top of the card and stays mounted from the scene beat to the lore beat. Only the text and buttons under it change. This is the layout of a 1990s adventure game.

**Scene components.** Each quest scene takes two props:

```ts
type SceneProps = { outcome?: Tier; thinking?: boolean };
```

- With no `outcome`, the scene draws the situation. Its entrance animations run once when it mounts: the keeper walks in, and the raven flies in.
- With an `outcome`, the scene draws that tier's result. The new pieces mount at that moment, so their entrance animations run then.
- `thinking` is true in the decision and judging beats, and shows a thought mark over the keeper.

**Animation rules.**

- CSS only, in `scenes.module.css`. No animation library and no timers in React.
- Every keyframe set animates *from* a start pose *to* the element's normal style. With animation off, each element is already in its final pose. This is how reduced motion works: the existing global rule turns all animation off, and nothing else is needed.
- Walk cycles use `steps()`, which gives the retro look.
- Loops are small: a bob, a flicker, a turning gear.

**The keeper.** One `Keeper` part in `parts.tsx`, used in the five scenes and on the map.

**The map.** `Map.tsx` draws the five places on one path. It takes the quest index and the tiers so far. Finished places show their lantern state, and the keeper walks from the last place to the next one.

**Place color.** The game sets `data-place` on `<body>`. `tokens.css` holds one color per place, and the atmosphere fades to it.

**Sound.** `sound.ts` owns one `AudioContext` and one master gain, so mute covers everything.

- `setPlace(id)` fades the place layer in or out.
- `play(cue)` plays one effect.
- `cues.ts` is a pure function from (beat, quest, tier, ending) to a list of cues. The game calls it once per beat.

**Cost.** Scenes are inline SVG and sound is generated, so the page loads no new assets. One small pixel font is added for labels.

## 8b. Full screen and new characters (added after the second playtest)

This section covers the full-screen points of spec section 9.1 and the characters of 9.2.

**Layout.** The page is two layers.

- **The world** fills the viewport. The atmosphere is the sky. The scene sits on top of it, full width, with its top edge faded into the sky. On a wide screen its width is capped so that the whole 16:9 scene fits above the dialogue box, and its side edges fade out. Below the scene, a ground band in the scene's ground color runs to the bottom of the screen.
- **The interface** floats over the world: the lanterns and mute at the top, the quest title over the sky, and the dialogue box on the ground.

The card and the inked plate are removed.

**Wide screens (third playtest).** The scene's SVG gets a viewBox wider than the 320-unit scene, and `Wings.tsx` draws more of the place on both sides: the same sky bands, ground, trees, and houses outdoors, and more wall and bench indoors. The SVG is as wide as the screen and never taller than a 16:9 scene of that width, and it uses `slice` scaling. So a phone shows exactly the 320-unit scene, a wide screen shows the scene plus as much of the wings as fits, and the scene itself is never cropped. Trees stand over the two seams.

**Ground color.** Each scene id maps to one ground color in `tokens.css`, so the ground band continues the scene.

**Arriving.** The scene slides in from the right when it mounts. Reduced motion turns this off like every other animation.

**Whisper.** The whisper field opens from a "Whisper your own answer" button, so the dialogue box stays small enough to leave the scene visible.

**Characters.** Opus redraws `Keeper` and `Villager` in `src/design/scenes/parts.tsx` and the named characters in the scenes. The component names, props, anchor point (feet on x, y), and rough size stay the same, so no scene layout changes. Fable does not edit `src/design/scenes/` while Opus works there.

## 8c. Code quality rules (added before the second commit)

These rules are checked by `tests/unit/architecture.test.ts`, which runs with the unit tests and in CI.

- **Layers.** The engine imports nothing outside itself. Content imports only content, engine types and Zod. The sound cues import only the engine. Drawings import only React, their styles and engine types. Nothing below `src/ui` imports `src/ui` or `app`.
- **Server only.** Browser code never imports `src/judge` or the model SDK. `process.env` is read only in `app/api` and `src/judge`.
- **Nothing stored.** No browser storage and no cookies anywhere in the code.
- **Hygiene.** No switched-off type checks, no `any`, no debug output, no key in the code, and no source file over 650 lines.

To keep to them: the characters live in `src/design/scenes/folk.tsx`, apart from the scenery in `parts.tsx`. The map, the quests and the ending share one layout component, `World`, in `Game.tsx`.

## 9. Testing

| Layer | What it covers |
|---|---|
| Unit: engine | Every transition, the three all-same-tier endings, the boundary scores (+3, +2, 0, -1), and the judge failure fallback |
| Unit: content | Every quest passes the schema, the choice order is not the same in all five, and no two quests share a place or a scene |
| Unit: sound cues | The raven caws on arrival at quest 4, every tier has a lantern cue, and every ending has a tune |
| Unit: judge | Prompt contains the rubric and the delimited answer, and the parser rejects anything but a tier |
| End-to-end | One path per ending with written choices, one whisper path with the judge mocked, one with the judge failing, keyboard-only play, mute, and no cookies or storage after a full game. Also: the travel beat before each quest, the scene on screen in every beat, the outcome scene for each of the 15 quest and tier pairs, five different places, and no running animation under reduced motion |
| Unit: code rules | Layers, server-only code, nothing stored, and hygiene (section 8c) |
| End-to-end: accessibility | An axe scan (WCAG 2.1 A and AA) of every kind of screen, every control at least 44px, and a visible focus ring on every control |
| Manual | Screen reader pass, reduced motion, a real phone, a timed first play, and listening to every sound effect |
| Eval | The 20 labels against the live model, by hand before release |

CI runs lint, type check, unit tests, and end-to-end tests with the judge mocked. CI never calls the model.

## 10. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Scaffold | The app deploys to a Vercel preview and CI is green |
| M1 | Playable grey box | All five quests and three endings play with written choices and placeholder art |
| M2 | Judge and eval | Whisper works end to end, and the eval passes 16 of 20 in Arize |
| M3 | Design in | Opus's tokens, scenes, motion, and sound are integrated |
| M3b | Living scenes | The keeper, the map, the five animated places with their 15 outcomes, and the sound effects are in, and the tests in section 9 pass |
| M4 | Release | Accessibility and timing checks pass, three WIP members have played, and production is live |

M2 and M3 can run at the same time after M1.

## 11. Risks

| Risk | Mitigation |
|---|---|
| The judge misses 80% | Tighten the rubrics first, then the prompt, then move up a model. Read every disagreement before changing anything. |
| 20 labels is a small set, so one answer moves the score 5 points | Report disagreements in full, and keep the labels fixed across prompt versions |
| The public endpoint gets abused | Length cap, output cap, rate cap, and a spend limit on the key |
| Prompt injection through the whisper field | The answer is delimited as untrusted, the output is limited to three tier names, and the parser rejects the rest |
| A lore source is wrong or a link dies | The sources are fixed in spec section 8.1, and a release check requests every URL |
| The game runs long or short | A timed first play in M4, with story lines cut or added to fit 8 to 12 minutes |
| The animation makes the page slow on a phone | CSS transforms and opacity only, no filters on moving parts, and the T032 performance check |
| The effects feel loud or startling | Short, quiet effects mixed under the ambience, one mute for all, and Paula listens to each one in T031 |
| A scene hints at the wise choice | Scenes show only the situation before the choice, and the outcome only after |
| The design arrives late | The grey box is shippable in structure, so the design drops in through tokens and scene components |

## 12. Configuration

| Variable | Where | Use |
|---|---|---|
| `ANTHROPIC_API_KEY` | Vercel and local | The judge |
| Phoenix endpoint and API key | Local only | The eval script |

No variable is exposed to the browser.
