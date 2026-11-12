# Kingdom of Prod

A 10-minute spooky autumn story game where every quest is a real PM dilemma.

- Intent: [docs/PRD.md](docs/PRD.md)
- V0 spec, plan and tasks: [specs/001-v0/](specs/001-v0/)

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

The three written choices work with no setup. "Whisper your own answer" calls an AI judge and needs `ANTHROPIC_API_KEY` in `.env.local` (see `.env.example`). Without it, a whisper falls back to the written choices.

## Check it

```bash
npm run lint
npm run typecheck
npm test             # unit tests: engine, content, judge
npm run e2e          # browser tests, with the judge mocked
npm run check:sources  # every lore link still resolves
```

None of these call the model.

## Judge eval

The judge must agree with 20 hand-labelled answers at least 80% of the time.

1. `evals/candidates.jsonl` holds 30 draft answers. Pick 20, four per quest, set each `label` to `wise`, `muddled` or `poor`, and save them as `evals/labels.jsonl`. Label before running the judge.
2. `npm install --prefix evals`
3. Put `ANTHROPIC_API_KEY`, `PHOENIX_ENDPOINT` and `PHOENIX_API_KEY` in `.env.local`.
4. `npm run eval` records the run in Arize Phoenix. `npm run eval -- --local` skips Phoenix.

Each run calls the model 20 times.

## Where things are

| Path | What |
|---|---|
| `src/engine/` | Game rules: phases, scoring, endings. No React, no network. |
| `src/content/` | The five quests, their rubrics, and the endings. |
| `src/judge/` | The judge prompt, parser and model call. |
| `app/api/judge/` | The one server endpoint. |
| `src/ui/`, `src/design/` | Screens, scenes and design tokens. |
| `src/audio/` | Ambient sound, generated in the browser. |
| `evals/` | The judge eval. |
