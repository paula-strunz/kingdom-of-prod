# Kingdom of Prod: PRD (draft v2, 11 Nov 2026)

## What it is
A 10-minute spooky autumn story game. You're the new keeper of Hollowmere, a foggy village at harvest time. Five strange problems appear. Each one is a real PM dilemma in disguise.

## The value: you learn by playing
It's a game first, and every quest teaches one PM lesson. You make a call, see what happens to the village, then find one line of "lore": the lesson in plain words, with a link to where it comes from (a Lenny's Podcast episode, a book). You finish having learned 5 real PM habits without reading a single article.

## The 5 V0 quests

| # | Quest | The dilemma | The lesson |
|---|---|---|---|
| 1 | **The Lantern Pleas** | Every villager begs for a lantern on their street. You have two. | Prioritize by impact, not by who shouts loudest. |
| 2 | **The Whispering Well** | The mayor says the village needs a bigger well. You can build it or go ask why. | Ask about the problem, not the solution. |
| 3 | **The Clockmaker's Night** | The festival clock won't be ready by the harvest moon. Delay it, cut the chimes, or rush it. | Ship a smaller thing on time. |
| 4 | **The Baron's Raven** | A raven brings the Baron's order: build his statue before the bridge. | Say no with evidence and an alternative. |
| 5 | **The Counting Fog** | The fog-counter says visitors doubled, but nobody buys pumpkins. | Watch the metric that means value, not the one that looks good. |

## How a quest plays
1. One illustrated scene and 2 or 3 lines of story.
2. Three choices, or whisper your own answer.
3. The village reacts: lanterns glow or go dark, and your reputation goes up or down.
4. One line of lore.

Your reputation picks one of 3 endings: the village thrives, it muddles on, or the fog takes it.

## How it decides
- The three choices have written outcomes in the repo, so nothing random happens.
- Only "whisper your own" uses an AI judge. It compares your answer to each quest's written rubric.
- That judge is the Arize eval use case: 20 answers you hand-label, and the judge must agree with you at least 80% of the time.

## Look and feel
A beautiful fall atmosphere, a little spooky and mysterious: fog, amber lantern light, falling leaves, deep plum and pumpkin colors, a hand-drawn storybook style. It's calm, never gory. Big readable type, one choice per tap, soft ambient sound you can mute.

## Who builds what
- **Claude Opus** designs the look: palette, scenes, type and motion.
- **Claude Fable 5.2** builds the game: quests, logic, the judge and tests.

## V0
- The 5 quests above, English only, about 10 minutes.
- Vercel Hobby, no login, nothing stored.
- Arize eval on the judge (at least 80% agreement with your labels).

## V1
- 5 more quests, so there are 10.
- A shareable end card for LinkedIn ("I kept Hollowmere alive").
- Arize tracing on every judged answer.

## V2
- Quests written by WIP Bordeaux members.
- A night mode for a WIP meetup, with a group leaderboard.

## Not in V0
French, accounts, saving progress, voice, multiplayer, anything from the Fable video game.

## Success
- You play it to the end and want to replay for a better ending.
- The judge reaches at least 80% agreement on your labels.
- Three WIP members finish it without being told how.

## Open question
1. Public repo for GitHub proof, or private first?
