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

## M4: Release

- [ ] **T028** (Fable) Accessibility pass: keyboard-only play, focus states, announced reactions, tap target sizes, and contrast.
  - Depends on: T026.
- [x] **T029** (Fable) Add end-to-end checks for mute, reduced motion, and no cookies or storage after a full game.
  - Depends on: T027.
- [x] **T030** (Fable) Add a release check that requests every lore source URL.
  - Depends on: T011.
- [ ] **T031** (Paula) Timed first play on a real phone. Trim or add story lines to land between 8 and 12 minutes.
  - Depends on: T026, T027.
- [ ] **T032** (Fable) Performance check on a mid-range phone profile, and fix anything over 3 seconds to interactive.
  - Depends on: T026.
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

T004, T010, T017 (labels), T019 (Phoenix key), T020, T031, T033, T035.
