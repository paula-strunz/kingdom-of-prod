"use client";

import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { startAmbience, type Ambience } from "../audio/ambience";
import { endings, quests } from "../content";
import { WHISPER_MAX_LENGTH } from "../content/schema";
import { endingFor, initialState, reduce, reputation } from "../engine/engine";
import type { Action, GameState, Tier } from "../engine/types";
import styles from "./Game.module.css";
import { requestVerdict } from "./judgeClient";
import { Lanterns } from "./Lanterns";
import { Scene } from "./Scene";

const reducer = (state: GameState, action: Action) => reduce(state, action, quests);

export function Game() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [whisper, setWhisper] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ambienceRef = useRef<Ambience | null>(null);

  const quest = quests[state.questIndex];
  const lastTier: Tier | undefined = state.tiers[state.questIndex];

  // Move focus to the heading on each new beat so keyboard and screen reader users follow along.
  useEffect(() => {
    if (state.phase !== "title") headingRef.current?.focus();
  }, [state.phase, state.questIndex]);

  useEffect(() => {
    ambienceRef.current?.setMuted(state.muted);
  }, [state.muted]);

  useEffect(() => () => ambienceRef.current?.stop(), []);

  function begin() {
    ambienceRef.current ??= startAmbience(state.muted);
    dispatch({ type: "begin" });
  }

  async function submitWhisper(event: FormEvent) {
    event.preventDefault();
    const answer = whisper.trim();
    if (!quest || !answer) return;
    dispatch({ type: "whisper" });
    const tier = await requestVerdict(quest.id, answer);
    setWhisper("");
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
        <section className={`${styles.card} ${styles.titleCard}`}>
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

      {quest && state.phase !== "title" && state.phase !== "ending" && (
        <section className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.kicker}>
              Quest {state.questIndex + 1} of {quests.length}
            </p>
            <h1 className={styles.title} tabIndex={-1} ref={headingRef}>
              {quest.title}
            </h1>
          </div>

          {state.phase === "scene" && (
            <div className={styles.beat}>
              <div className={styles.plate}>
                <Scene id={quest.scene.id} alt={quest.scene.alt} />
              </div>
              <div className={styles.story}>
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
                      onClick={() => dispatch({ type: "choose", choiceId: choice.id })}
                    >
                      {choice.label}
                    </button>
                  </li>
                ))}
              </ul>
              {!state.whisperBlocked && (
                <form className={styles.whisper} onSubmit={submitWhisper}>
                  <label htmlFor="whisper">Or whisper your own answer</label>
                  <textarea
                    id="whisper"
                    rows={3}
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
                {state.questIndex + 1 < quests.length ? "Continue" : "See what became of Hollowmere"}
              </button>
            </div>
          )}
        </section>
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
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  dispatch: (action: Action) => void;
}) {
  const id = endingFor(reputation(state.tiers));
  const ending = endings[id];
  return (
    <section className={`${styles.card} ${styles.endingCard}`} data-ending={id}>
      <div className={styles.beat}>
        <h1 className={`${styles.title} ${styles.endingTitle}`} tabIndex={-1} ref={headingRef}>
          {ending.title}
        </h1>
        <div className={styles.plate}>
          <Scene id={`ending-${id}`} alt={ending.title} />
        </div>
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
    </section>
  );
}
