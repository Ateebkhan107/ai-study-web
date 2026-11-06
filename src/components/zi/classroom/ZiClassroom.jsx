"use client";

import { useEffect, useReducer, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import MathText from "@/components/MathText";
import { classroomFixtures } from "@/lib/zi/classroom/fixtures";
import { formulas, validateClassroomLesson } from "@/lib/zi/classroom/lessonSchema";
import { initialPlayback, playbackReducer } from "@/lib/zi/classroom/playback";
import ZiBoard from "./ZiBoard";
import "./classroom.css";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeToMotion(callback) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function readMotionPreference() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function prefersStaticBoard() {
  return true;
}

function LessonPicker({ current, onSelect, onClose }) {
  const [language, setLanguage] = useState(current?.language ?? "English");
  const options = classroomFixtures.filter((fixture) => fixture.language === language);
  return (
    <div className="zi-board-picker">
      <div className="zi-board-kicker">ZI VISUAL CLASSROOM</div>
      <h2>Choose a lesson</h2>
      <p>Explore a concept step by step on the whiteboard.</p>
      <label className="zi-board-language">
        Explanation language
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option>English</option>
          <option>Hinglish</option>
        </select>
      </label>
      <div className="zi-board-options">
        {options.map((fixture) => (
          <button key={fixture.lessonId} type="button" onClick={() => onSelect(fixture)}>
            <span>{fixture.subject}</span>
            <strong>{fixture.title}</strong>
            <span>{fixture.steps.length} steps <ArrowRight size={15} aria-hidden="true" /></span>
          </button>
        ))}
      </div>
      {options.length === 0 ? <p role="status">Lessons are unavailable in this language.</p> : null}
      {current ? <button className="zi-board-button" type="button" onClick={onClose}>Back to lesson</button> : null}
      <p className="zi-board-review">Local preview · Teaching copy and diagrams await subject review.</p>
    </div>
  );
}

function StepText({ step }) {
  return (
    <div className="zi-board-copy">
      <p>{step.explanation}</p>
      {step.formulaKeys?.length ? (
        <details open key={step.id}>
          <summary>Formula</summary>
          {step.formulaKeys.map((key) => <MathText key={key}>{`$$${formulas[key]}$$`}</MathText>)}
        </details>
      ) : null}
    </div>
  );
}

export default function ZiClassroom({ active, interrupted, initialLesson }) {
  const [lesson, setLesson] = useState(() => validateClassroomLesson(initialLesson));
  const [choosing, setChoosing] = useState(false);
  const [parameters, setParameters] = useState(() => lesson?.parameters ?? {});
  const [playback, dispatch] = useReducer(playbackReducer, initialPlayback);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, readMotionPreference, prefersStaticBoard);
  const step = lesson?.steps[playback.step];
  const durationMs = step?.animation.durationMs ?? 0;
  const canAnimate = active && !interrupted && !choosing && !reducedMotion && durationMs > 0;

  useEffect(() => {
    if (!playback.playing) return;
    if (!canAnimate || document.hidden) {
      dispatch({ type: "pause" });
      return;
    }

    let frame;
    let previous = performance.now();
    function tick(now) {
      dispatch({ type: "tick", deltaMs: Math.max(0, now - previous), durationMs });
      previous = now;
      frame = requestAnimationFrame(tick);
    }
    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        dispatch({ type: "pause" });
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [canAnimate, durationMs, playback.playing, playback.step]);

  const selectStep = (index) => dispatch({ type: "select", step: index });

  if (!lesson || choosing) {
    return <LessonPicker current={lesson} onClose={() => setChoosing(false)} onSelect={(fixture) => {
      setLesson(fixture);
      setParameters(fixture.parameters);
      dispatch({ type: "reset" });
      setChoosing(false);
    }} />;
  }

  const reset = () => {
    dispatch({ type: "reset" });
    setParameters(lesson.parameters);
  };
  const progress = reducedMotion || !durationMs
    ? 1
    : playback.elapsedMs / durationMs;

  return (
    <article className="zi-board" aria-label="Lesson whiteboard">
      <div className="zi-board-heading">
        <div>
          <div className="zi-board-kicker">{lesson.subject} · {lesson.exam} · {lesson.language}</div>
          <h2>{lesson.title}</h2>
        </div>
        <button type="button" className="zi-board-button" onClick={() => setChoosing(true)}>Lessons</button>
      </div>
      <div className="zi-board-step">
        <p role="status">Step {playback.step + 1} of {lesson.steps.length} · {step.title}</p>
        <progress aria-label="Lesson progress" max={lesson.steps.length} value={playback.step + 1} />
      </div>
      <div className="zi-board-actions" role="group" aria-label="Lesson playback">
        <button className="zi-board-button" type="button" onClick={() => selectStep(playback.step - 1)} disabled={!playback.step}>
          <ArrowLeft size={16} aria-hidden="true" /> Previous
        </button>
        <button className="zi-board-button zi-board-primary" type="button" disabled={!canAnimate}
          onClick={() => dispatch({ type: playback.playing ? "pause" : "play", durationMs })}>
          {playback.playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playback.playing ? "Pause" : "Play"}
        </button>
        <button className="zi-board-button" type="button" onClick={() => selectStep(playback.step + 1)}
          disabled={playback.step + 1 === lesson.steps.length}>Next <ArrowRight size={16} aria-hidden="true" /></button>
        <button className="zi-board-button" type="button" disabled={!canAnimate} onClick={() => dispatch({ type: "replay", durationMs })}>
          <RotateCcw size={16} aria-hidden="true" /> Replay
        </button>
        <button className="zi-board-button" type="button" onClick={reset}>Reset</button>
      </div>
      <ZiBoard lesson={lesson} scene={step.sceneKey} parameters={parameters} progress={progress}
        onAngle={(angleDegrees) => setParameters((current) => ({ ...current, angleDegrees }))}
        onStep={selectStep} />
      <StepText step={step} />
      <details className="zi-board-outline">
        <summary>Lesson outline</summary>
        <ol>
          {lesson.steps.map((item, index) => (
            <li key={item.id}><button type="button" aria-current={index === playback.step ? "step" : undefined}
              onClick={() => selectStep(index)}>{index + 1}. {item.title}</button></li>
          ))}
        </ol>
      </details>
      <p className="zi-board-review">Local preview · Teaching copy and diagrams await subject review.</p>
    </article>
  );
}
