# Kingdom of Prod V0: Tasks

Tasks follow the milestones in `plan.md`. Owners: **Fable** (Claude Fable 5.2, build), **Opus** (Claude Opus, design), **Paula** (content decisions, labels, playtests).

Each task lists what it depends on and how to tell it is done.

## M0: Scaffold

- [x] **T001** (Fable) Create the Next.js and TypeScript app with the layout in `plan.md` section 3.
  - Done when: `npm run dev` shows an empty page, and lint and type check pass.
- [x] **T002** (Fable) Add Vitest and Playwright with one passing sample test each.
  - Depends on: T001.
- [x] **T003** (Fable) Add CI that runs lint, type check, unit tests, and end-to-end tests.
  - Depends on: T002.
  - Done when: CI is green on a pull request.
- [ ] **T004** (Paula) Connect the repo to Vercel Hobby and set `ANTHROPIC_API_KEY` with a monthly spend limit.
  - Depends on: T001.
  - Done when: a preview URL loads.

## M1: Playable grey box

- [x] **T005** (Fable) Write the quest Zod schema and the `Tier` and `Quest` types.
  - Depends on: T001.
- [x] **T006** (Fable) Build the engine reducer with all phases and actions.
  - Depends on: T005.
  - Done when: unit tests cover every transition.
- [x] **T007** (Fable) Add scoring and endings, with tests for the three all-same-tier games and the boundary scores +3, +2, 0, and -1.
  - Depends on: T006.
- [x] **T008** (Fable) Draft all five quests in `src/content/quests/`: story lines, three choices, three reactions, and a placeholder lore line.
  - Depends on: T005.
  - Done when: all five pass the schema, and the choice order differs between quests.
- [x] **T009** (Fable) Draft the three endings in `src/content/endings.ts`.
  - Depends on: T005.
- [ ] **T010** (Paula) Review and edit the quest and ending copy, and confirm the tier of every choice.
  - Depends on: T008, T009.
- [x] **T011** (Fable) Write the five lore lines and attach the sources from spec section 8.1.
  - Depends on: T008.
  - Done when: every quest has its lore line and `sourceUrl`.
- [x] **T012** (Fable) Build the grey-box screens: title, scene, decision, reaction, lore, and ending, with the five-lantern row.
  - Depends on: T006, T008.
  - Done when: the game plays start to finish with written choices and placeholder art.
- [x] **T013** (Fable) Add end-to-end tests for one written-choice path per ending.
  - Depends on: T007, T012.

## M2: Judge and eval

- [x] **T014** (Fable) Write a rubric for each quest: lesson, three tier descriptions, and two examples per tier.
  - Depends on: T010.
- [x] **T015** (Fable) Build the prompt builder and the strict tier parser, with unit tests, including instruction-like answers.
  - Depends on: T014.
- [x] **T016** (Fable) Build `POST /api/judge` with input validation, the output cap, the timeout, and the in-memory rate cap. The answer is never logged.
  - Depends on: T015, T004.
- [x] **T017** (Fable, then Paula) Fable drafts 30 varied whispered answers. Paula picks 20, four per quest, and labels each one before any judge run.
  - Depends on: T014.
  - Done when: `evals/labels.jsonl` has 20 rows, and none repeats a rubric example.
- [x] **T018** (Fable) Add the whisper field, the "village listens" state, the privacy notice, and the fallback to the written choices.
  - Depends on: T012, T016.
  - Done when: end-to-end tests pass with the judge mocked and with the judge failing.
- [x] **T019** (Fable) Write `evals/run.ts`: run the labels through the shipped prompt and parser, print agreement, the confusion table, and the disagreements, and log the run to Arize Phoenix.
  - Depends on: T015, T017, and a Phoenix project and API key from Paula.
- [ ] **T020** (Paula and Fable) Run the eval. If it is under 16 of 20, read the disagreements, revise the rubrics or prompt, and run again.
  - Depends on: T019.
  - Done when: a run with the release `PROMPT_VERSION` shows at least 16 of 20 in Arize.

## M3: Design in

  - Result (12 Nov 2026): a local run (`npm run eval -- --local`) with `claude-haiku-5-5` and prompt v1 agrees on 20 of 20. Still open: `PHOENIX_ENDPOINT` is empty, so the run is not recorded in Arize.
- [x] **T021** (Opus) Deliver `tokens.css`: palette, type scale, spacing, and motion timings, with AA contrast checked.
  - Depends on: nothing. This can start on day one.
- [x] **T022** (Opus) Deliver the layout guide and one reference page.
  - Depends on: T021.
- [x] **T023** (Opus) Deliver the five quest scenes, the three ending scenes, and the lantern in three states as SVG components, each with alt text.
  - Depends on: T021, T010.
- [x] **T024** (Fable) Build the generated ambience: soft wind and a low drone with the Web Audio API.
  - Depends on: T001.
- [x] **T025** (Fable) Apply the tokens and layouts to every screen.
  - Depends on: T012, T021, T022.
- [x] **T026** (Fable) Integrate the scenes, the lanterns, and the fog and leaf animations, with the reduced-motion variants.
  - Depends on: T023, T025.
- [x] **T027** (Fable) Add the ambient sound that starts on "Begin" and the mute button on every screen.
  - Depends on: T024, T012.

## M3b: Living scenes

Added after Paula's first playtest (11 Nov 2026): the game looked lovely but felt too still. See spec section 9 and plan section 8a.

- [x] **T037** (Fable) Add the `travel` phase and the `arrive` action to the engine, with unit tests.
  - Depends on: T006.
- [x] **T038** (Fable) Add `place` (name and road line) to the quest schema and to the five quests.
  - Depends on: T005.
  - Done when: a unit test fails if two quests share a place or a scene.
- [x] **T039** (Fable) Draw the keeper as a shared part with a stepped walk cycle.
  - Depends on: T023.
- [x] **T040** (Fable) Build the map of Hollowmere for the travel beat: five places, a lantern on each finished place, and the keeper walking to the next one.
  - Depends on: T037, T038, T039.
- [x] **T041** (Fable) Keep the scene on screen through the scene, decision, reaction, and lore beats, in the adventure-game layout.
  - Depends on: T025.
- [x] **T042** (Fable) Animate the five quest scenes: the keeper walks in and the situation plays out.
  - Depends on: T039, T041.
- [x] **T043** (Fable) Draw the 15 outcome scenes, three per quest, shown in the reaction beat.
  - Depends on: T042.
  - Done when: each outcome shows what its reaction text says.
- [x] **T044** (Fable) Add a color per place to the tokens, and fade the page to it.
  - Depends on: T038.
- [x] **T045** (Fable) Add the light retro finish: pixel typeface for labels, scan lines on the scene, and story lines that appear one by one.
  - Depends on: T041.
- [x] **T046** (Fable) Replace `ambience.ts` with `sound.ts`: base ambience, a layer per place, and the effects, all under one master gain.
  - Depends on: T024.
- [x] **T047** (Fable) Write `cues.ts` and its unit tests, and play the cues from the game.
  - Depends on: T046, T037.
  - Done when: the raven caws on arrival at quest 4.
- [x] **T048** (Fable) Update and extend the end-to-end tests: travel beat, scene in every beat, 15 outcomes, five places, and reduced motion.
  - Depends on: T040, T043, T044.
- [x] **T049** (Paula) Play it again. Say whether it now feels like a game, and name any sound that is too loud or any outcome scene that is unclear.
  - Depends on: T048.

## M3c: Full screen and new characters

Added after Paula's second playtest (11 Nov 2026): "I want to be inside of the game", and the characters are too plain. See spec sections 9.1 and 9.2, and plan section 8b.

- [x] **T050** (Fable) Remove the card and the plate. Make the scene full width on the sky, with a ground band to the bottom of the screen.
  - Depends on: T041.
- [x] **T051** (Fable) Turn the text and choices into a dialogue box on the ground, and float the lanterns, mute, and title over the world.
  - Depends on: T050.
- [x] **T052** (Fable) Open the whisper field from a button, so the dialogue box stays small.
  - Depends on: T051.
- [x] **T053** (Fable) Slide the scene in on arrival.
  - Depends on: T050.
- [x] **T054** (Opus) Redesign the keeper, the villagers, and the named characters as original cute autumn creatures, with small living details.
  - Depends on: T039.
  - Done when: every scene and outcome still reads correctly in a screenshot.
- [x] **T055** (Fable) Update the end-to-end tests: no frame around the scene, the whole scene visible on phone and desktop, and the whisper button.
  - Depends on: T051, T052, T054.
- [x] **T056** (Paula) Play it again on a phone and on a laptop.
  - Depends on: T055.
  - Result (11 Nov 2026): better, but the characters are not liked, and on a laptop the game still sits in the middle of the screen.
- [x] **T057** (Opus) Redesign the characters as animal folk in clothes, from Paula's reference picture: simpler than the reference, and fitted to the scenes.
  - Depends on: T054.
- [x] **T058** (Fable) Draw side wings for every scene, the map, and the endings, so the place fills a wide screen from edge to edge.
  - Depends on: T050.
- [x] **T059** (Fable) Update the end-to-end test for the full-width scene.
  - Depends on: T058.
- [ ] **T060** (Paula) Play it again on a laptop.
  - Depends on: T057, T059.
- [x] **T061** (Fable) Review the code against good practice and add a test that checks the rules (plan.md, section 8c).
  - Depends on: T059.
- [x] **T062** (Fable) Fix what the review found: split the characters out of `parts.tsx`, one shared screen layout in `Game.tsx`, and stop fading sound layers when the sound stops.
  - Depends on: T061.
- [x] **T063** (Fable) Make every beat fit one screen with no scrolling, on phones, tablets and laptops (plan.md, section 8d). Split the ending into two steps.
  - Depends on: T058.
  - Result (12 Nov 2026): every beat of a full game fits one screen with no scrolling at seven sizes: iPhone SE, iPhone 15, iPad upright and sideways, Pixel 7, a 1280 by 720 laptop and a 1920 by 1080 screen. The whisper form now takes the place of the three choices while it is open.
- [x] **T064** (Fable) Add `tests/e2e/fit.spec.ts` and WebKit projects for an iPhone and an iPad profile.
  - Depends on: T063.
  - Result (12 Nov 2026): `tests/e2e/fit.spec.ts` runs on those seven sizes; the iPhone and iPad sizes run in WebKit. A phone held sideways is not in the list: there the dialogue box may scroll inside itself.
- [ ] **T065** (Paula) Play it on a real iPhone and an iPad.
  - Depends on: T064.

## M4: Release

- [x] **T028** (Fable) Accessibility pass: keyboard-only play, focus states, announced reactions, tap target sizes, and contrast.
  - Depends on: T026, T048.
  - Result (12 Nov 2026): `tests/e2e/a11y.spec.ts` scans every kind of screen with axe (WCAG 2.1 A and AA) on phone and desktop with no violations, checks every control is at least 44px, and checks the focus ring on every control.
- [x] **T029** (Fable) Add end-to-end checks for mute, reduced motion, and no cookies or storage after a full game.
  - Depends on: T027.
- [x] **T030** (Fable) Add a release check that requests every lore source URL.
  - Depends on: T011.
- [ ] **T031** (Paula) Timed first play on a real phone. Trim or add story lines to land between 8 and 12 minutes.
  - Depends on: T026, T027, T048. Listen to every sound effect on the phone speaker.
- [x] **T032** (Fable) Performance check on a mid-range phone profile, and fix anything over 3 seconds to interactive. Check that the scene animations stay smooth.
  - Depends on: T026, T048.
  - Result (12 Nov 2026): on a Pixel 7 profile with the CPU slowed 4 times and a slow 4G network, the game is interactive after 2.7 seconds (430 KB transferred). Every scene and outcome holds 60 frames per second.
- [ ] **T033** (Paula) Three WIP members play without help. Note where each one hesitates.
  - Depends on: T031.
- [ ] **T034** (Fable) Fix what the playtests found. Re-run the eval if a rubric or the prompt changed.
  - Depends on: T033.
- [ ] **T035** (Paula) Promote to production, and decide whether the repo goes public.
  - Depends on: T020, T028, T029, T030, T032, T034.
- [x] **T036** (Fable) Update the README with how to run the game, the tests, and the eval.
  - Depends on: T035.

## What can run in parallel

- T021 to T024 (design and sound) alongside all of M1 and M2.
- T014 to T020 (judge and eval) alongside T025 to T027 (design integration), once T012 is done.
- T010 and T011 (Paula's copy and sources) alongside T012.

## Tasks waiting on Paula

T004, T010, T020, T031, T033, T035, T060, T065.
