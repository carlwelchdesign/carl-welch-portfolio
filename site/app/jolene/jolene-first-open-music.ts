import { Midi } from '@tonejs/midi';

export const JOLENE_INTRO_MUSIC_STORAGE_KEY = 'jolene-first-open-music-played-v1';
export const JOLENE_INTRO_MUSIC_SOURCE = '/jolene/audio/nine-to-five.mid';

const EXCERPT_START_SECONDS = 9.230752;
const EXCERPT_DURATION_SECONDS = 10;
const FADE_DURATION_SECONDS = 1;
const MASTER_VOLUME = 0.055;

type MusicState = 'idle' | 'loading' | 'playing';
type StateListener = (state: MusicState) => void;

let activeContext: AudioContext | null = null;
let activeMasterGain: GainNode | null = null;
let stopTimer: number | null = null;
let currentState: MusicState = 'idle';

function publish(listener: StateListener, state: MusicState) {
  currentState = state;
  listener(state);
}

function closeActiveContext() {
  if (stopTimer !== null) window.clearTimeout(stopTimer);
  stopTimer = null;
  const context = activeContext;
  activeContext = null;
  activeMasterGain = null;
  if (context && context.state !== 'closed') void context.close();
}

export function stopFirstOpenJoleneMusic(listener: StateListener) {
  const context = activeContext;
  const masterGain = activeMasterGain;
  if (!context) {
    publish(listener, 'idle');
    return;
  }
  if (!masterGain) {
    closeActiveContext();
    publish(listener, 'idle');
    return;
  }

  const now = context.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0, now + 0.2);
  if (stopTimer !== null) window.clearTimeout(stopTimer);
  stopTimer = window.setTimeout(() => {
    closeActiveContext();
    publish(listener, 'idle');
  }, 225);
}

export async function playFirstOpenJoleneMusic(listener: StateListener): Promise<boolean> {
  if (currentState !== 'idle' || window.localStorage.getItem(JOLENE_INTRO_MUSIC_STORAGE_KEY)) {
    return false;
  }

  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return false;

  publish(listener, 'loading');
  const context = new AudioContextConstructor();
  activeContext = context;

  try {
    await context.resume();
    const response = await fetch(JOLENE_INTRO_MUSIC_SOURCE);
    if (!response.ok) throw new Error(`Unable to load Jolene intro MIDI: ${response.status}`);
    const midi = new Midi(await response.arrayBuffer());
    if (activeContext !== context) return false;

    const masterGain = context.createGain();
    activeMasterGain = masterGain;
    masterGain.gain.setValueAtTime(MASTER_VOLUME, context.currentTime);
    masterGain.connect(context.destination);

    const excerptEnd = EXCERPT_START_SECONDS + EXCERPT_DURATION_SECONDS;
    const playbackStart = context.currentTime + 0.05;
    for (const [trackIndex, track] of midi.tracks.entries()) {
      for (const note of track.notes) {
        const noteEnd = note.time + note.duration;
        if (noteEnd <= EXCERPT_START_SECONDS || note.time >= excerptEnd) continue;

        const startOffset = Math.max(0, note.time - EXCERPT_START_SECONDS);
        const endOffset = Math.min(EXCERPT_DURATION_SECONDS, noteEnd - EXCERPT_START_SECONDS);
        const noteStart = playbackStart + startOffset;
        const noteEndTime = playbackStart + Math.max(startOffset + 0.035, endOffset);
        const oscillator = context.createOscillator();
        const voiceGain = context.createGain();
        oscillator.type = trackIndex === 0 ? 'square' : 'triangle';
        oscillator.frequency.setValueAtTime(440 * (2 ** ((note.midi - 69) / 12)), noteStart);
        voiceGain.gain.setValueAtTime(0, noteStart);
        voiceGain.gain.linearRampToValueAtTime(Math.max(0.015, note.velocity * 0.12), noteStart + 0.008);
        voiceGain.gain.setValueAtTime(Math.max(0.01, note.velocity * 0.09), Math.max(noteStart + 0.009, noteEndTime - 0.025));
        voiceGain.gain.linearRampToValueAtTime(0, noteEndTime);
        oscillator.connect(voiceGain);
        voiceGain.connect(masterGain);
        oscillator.start(noteStart);
        oscillator.stop(noteEndTime + 0.01);
      }
    }

    const fadeStart = playbackStart + EXCERPT_DURATION_SECONDS - FADE_DURATION_SECONDS;
    const playbackEnd = playbackStart + EXCERPT_DURATION_SECONDS;
    masterGain.gain.setValueAtTime(MASTER_VOLUME, fadeStart);
    masterGain.gain.linearRampToValueAtTime(0, playbackEnd);
    window.localStorage.setItem(JOLENE_INTRO_MUSIC_STORAGE_KEY, 'true');
    publish(listener, 'playing');
    stopTimer = window.setTimeout(() => {
      closeActiveContext();
      publish(listener, 'idle');
    }, (EXCERPT_DURATION_SECONDS + 0.1) * 1_000);
    return true;
  } catch {
    closeActiveContext();
    publish(listener, 'idle');
    return false;
  }
}
