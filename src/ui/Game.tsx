"use client";

import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { cuesFor, placeFor, type Beat } from "../audio/cues";
import { startSound, type Sound } from "../audio/sound";
import { endings, quests } from "../content";
import { WHISPER_MAX_LENGTH } from "../content/schema";
import { endingFor, initialState, reduce, reputation } from "../engine/engine";
import type { Action, EndingId, GameState, Tier } from "../engine/types";
import styles from "./Game.module.css";
import { requestVerdict } from "./judgeClient";
import { Lanterns } from "./Lanterns";
import { Scene, TravelMap } from "./Scene";

const reducer = (state: GameState, action: Action) => reduce(state, action, quests);

export function Game() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [whisper, setWhisper] = useState("");
  const [whisperOpen, setWhisperOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const soundRef = useRef<Sound | null>(null);
  const lastBeat = useRef("");

  const quest = quests[state.questIndex];
  const lastTier: Tier | undefined = state.tiers[state.questIndex];

  // Move focus to the heading on each new beat so keyboard and screen reader users follow along.
  useEffect(() => {
    if (state.phase !== "title") headingRef.current?.focus();
  }, [state.phase, state.questIndex]);

  useEffect(() => {
    soundRef.current?.setMuted(state.muted);
  }, [state.muted]);

  useEffect(() => () => soundRef.current?.stop(), []);

  const inQuest = quest !== undefined && state.phase !== "title" && state.phase !== "ending";
  const atPlace = inQuest && state.phase !== "travel";
  const decided = state.phase === "reaction" || state.phase === "lore";
  const place = inQuest ? quest.scene.id : undefined;

  // The page takes a color from the place the keeper is in (see app/globals.css).
  useEffect(() => {
    if (place) document.body.dataset.place = place;
    else delete document.body.dataset.place;
    return () => {
      delete document.body.dataset.place;
    };
  }, [place]);

  // Once a scene is up, the page's own moon sets: every scene has one (see atmosphere.module.css).
  const onStage = state.phase !== "title";
  useEffect(() => {
    if (onStage) document.body.dataset.stage = "on";
    else delete document.body.dataset.stage;
    return () => {
      delete document.body.dataset.stage;
    };
  }, [onStage]);

  // Sound follows the beat: the ambience of the place, then the effects that mark what happened.
  const beatKey = `${state.phase}:${state.questIndex}`;
  useEffect(() => {
    if (lastBeat.current === beatKey) return;
    lastBeat.current = beatKey;
    const sound = soundRef.current;
    if (!sound) return;
    const beat: Beat = {
      phase: state.phase,
      place,
      tier: lastTier,
      ending: state.phase === "ending" ? endingFor(reputation(state.tiers)) : undefined,
    };
    sound.setPlace(placeFor(beat));
    for (const cue of cuesFor(beat)) sound.play(cue);
  }, [beatKey, state.phase, state.tiers, place, lastTier]);

  function begin() {
    soundRef.current ??= startSound(state.muted);
    dispatch({ type: "begin" });
  }

  function choose(choiceId: string) {
    soundRef.current?.play("select");
    setWhisperOpen(false);
    dispatch({ type: "choose", choiceId });
  }

  async function submitWhisper(event: FormEvent) {
    event.preventDefault();
    const answer = whisper.trim();
    if (!quest || !answer) return;
    soundRef.current?.play("select");
    dispatch({ type: "whisper" });
    const tier = await requestVerdict(quest.id, answer);
    setWhisper("");
    setWhisperOpen(false);
    dispatch(tier ? { type: "judged", tier } : { type: "judgeFailed" });
  }

  return (
    <main className={styles.page}>
      <header className={styles.bar}>
        {state.phase === "title" ? <span /> : <Lanterns tiers={state.tiers} total={quests.length} />}
        <button
          type="button"
          className={styles.mute}
          aria-pressed={state.muted}
          onClick={() => dispatch({ type: "toggleMute" })}
        >
          {state.muted ? "Sound off" : "Sound on"}
        </button>
      </header>

      {state.phase === "title" && (
        <section className={styles.titleScreen}>
          <div className={`${styles.beat} ${styles.titleBeat}`}>
            <h1 className={`${styles.title} ${styles.hero}`}>Kingdom of Prod</h1>
            <p className={styles.intro}>
              You are the new keeper of Hollowmere, a foggy village at harvest time. Five strange
              problems are waiting for you.
            </p>
            <button type="button" className={styles.primary} onClick={begin}>
              Begin
            </button>
          </div>
        </section>
      )}

      {inQuest && state.phase === "travel" && (
        <World
          id="map"
          kicker={`Stop ${state.questIndex + 1} of ${quests.length}`}
          title={quest.place.name}
          headingRef={headingRef}
          scene={
            <TravelMap
              index={state.questIndex}
              tiers={state.tiers}
              alt={`Map of Hollowmere. The keeper walks to ${quest.place.name}, stop ${state.questIndex + 1} of ${quests.length}.`}
            />
          }
        >
          <div className={styles.beat}>
            <p className={styles.road}>{quest.place.road}</p>
            <button type="button" className={styles.primary} onClick={() => dispatch({ type: "arrive" })}>
              Arrive
            </button>
          </div>
        </World>
      )}

      {atPlace && (
        <World
          id={quest.scene.id}
          kicker={`Quest ${state.questIndex + 1} of ${quests.length}`}
          title={quest.title}
          headingRef={headingRef}
          scene={
            // The scene is the world, and stays for the whole quest. Only the dialogue box changes.
            <Scene
              id={quest.scene.id}
              alt={quest.scene.alt}
              outcome={decided ? lastTier : undefined}
              thinking={state.phase === "decision" || state.phase === "judging"}
            />
          }
        >
          {state.phase === "scene" && (
            <div className={styles.beat}>
              <div className={`${styles.story} ${styles.spoken}`}>
                {quest.story.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button
                type="button"
                className={styles.primary}
                onClick={() => dispatch({ type: "showDecision" })}
              >
                What will you do?
              </button>
            </div>
          )}

          {state.phase === "decision" && (
            <div className={styles.beat}>
              {state.whisperBlocked && (
                <p role="alert" className={styles.notice}>
                  The fog swallowed your words. Choose one of the three paths.
                </p>
              )}
              <ul className={styles.choices}>
                {quest.choices.map((choice) => (
                  <li key={choice.id}>
                    <button
                      type="button"
                      className={styles.choice}
                      onClick={() => choose(choice.id)}
                    >
                      {choice.label}
                    </button>
                  </li>
                ))}
              </ul>
              {!state.whisperBlocked && !whisperOpen && (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => setWhisperOpen(true)}
                >
                  Whisper your own answer
                </button>
              )}
              {!state.whisperBlocked && whisperOpen && (
                <form className={styles.whisper} onSubmit={submitWhisper}>
                  <label htmlFor="whisper">Or whisper your own answer</label>
                  <textarea
                    id="whisper"
                    rows={3}
                    autoFocus
                    maxLength={WHISPER_MAX_LENGTH}
                    value={whisper}
                    onChange={(event) => setWhisper(event.target.value)}
                    aria-describedby="whisper-note"
                  />
                  <p id="whisper-note" className={styles.small}>
                    Your answer is sent to an AI model to be judged. It is not saved.
                  </p>
                  <button type="submit" className={styles.secondary} disabled={!whisper.trim()}>
                    Whisper
                  </button>
                </form>
              )}
            </div>
          )}

          {state.phase === "judging" && (
            <div className={styles.beat}>
              <p role="status" className={`${styles.notice} ${styles.listening}`}>
                The village listens…
              </p>
            </div>
          )}

          {state.phase === "reaction" && lastTier && (
            <div className={styles.beat}>
              <p role="status" className={styles.reaction}>
                {quest.reactions[lastTier]}
              </p>
              <button
                type="button"
                className={styles.primary}
                onClick={() => dispatch({ type: "showLore" })}
              >
                Read the lore
              </button>
            </div>
          )}

          {state.phase === "lore" && (
            <div className={styles.beat}>
              <p className={styles.lore}>{quest.lore.line}</p>
              <p className={styles.small}>
                From{" "}
                <a href={quest.lore.sourceUrl} target="_blank" rel="noreferrer">
                  {quest.lore.sourceTitle}
                </a>
              </p>
              <button
                type="button"
                className={styles.primary}
                onClick={() => dispatch({ type: "continue" })}
              >
                {state.questIndex + 1 < quests.length
                  ? "Continue"
                  : "See what became of Hollowmere"}
              </button>
            </div>
          )}
        </World>
      )}

      {state.phase === "ending" && <Ending state={state} headingRef={headingRef} dispatch={dispatch} />}
    </main>
  );
}

function Ending({
  state,
  headingRef,
  dispatch,
}: {
  state: GameState;
  headingRef: RefObject<HTMLHeadingElement | null>;
  dispatch: (action: Action) => void;
}) {
  const id = endingFor(reputation(state.tiers));
  const ending = endings[id];
  return (
    <World
      id={`ending-${id}`}
      ending={id}
      kicker="The end"
      title={ending.title}
      headingRef={headingRef}
      scene={<Scene id={`ending-${id}`} alt={ending.title} />}
    >
      <div className={styles.beat}>
        <div className={styles.story}>
          {ending.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className={styles.learned}>
          <h2 className={styles.kicker}>What you learned</h2>
          <ul className={styles.recap}>
            {quests.map((quest) => (
              <li key={quest.id}>{quest.lore.line}</li>
            ))}
          </ul>
        </div>
        <button type="button" className={styles.primary} onClick={() => dispatch({ type: "restart" })}>
          Play again
        </button>
      </div>
    </World>
  );
}

/**
 * One full screen of the game: the heading, the place drawn from edge to edge,
 * and the dialogue box on the ground in front of it. The map, every quest and
 * the ending share this layout.
 */
function World({
  id,
  ending,
  kicker,
  title,
  headingRef,
  scene,
  children,
}: {
  id: string;
  ending?: EndingId;
  kicker: string;
  title: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  scene: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.world} data-world={id} data-ending={ending}>
      <div className={styles.heading}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={styles.title} tabIndex={-1} ref={headingRef}>
          {title}
        </h1>
      </div>
      <div className={styles.land}>
        <div className={styles.stage}>{scene}</div>
      </div>
      <div className={styles.ground}>
        <div className={styles.dialogue}>{children}</div>
      </div>
    </section>
  );
}
