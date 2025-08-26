/** Type definitions and constants for Scale Ninja */

export type ScaleKind = "major" | "minor" | "harmonic_minor" | "melodic_minor";
export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Ionian..Locrian (3NPS)
export type Position5 = 0 | 1 | 2 | 3 | 4; // 5-box sets
export type PositionCAGED = 0 | 1 | 2 | 3 | 4; // C, A, G, E, D shapes

export const NOTE_NAMES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const NOTE_NAMES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

// Standard tuning low→high: E2 A2 D3 G3 B3 E4
export const OPEN_STRINGS_MIDI = [40, 45, 50, 55, 59, 64] as const;
export const OPEN_STRINGS_PC = OPEN_STRINGS_MIDI.map(
  (m) => ((m % 12) + 12) % 12
) as number[];

// Scale steps (semitones from tonic)
export const SCALE_STEPS: Record<ScaleKind, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], // Ionian
  minor: [0, 2, 3, 5, 7, 8, 10], // Aeolian (natural minor)
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11], // Harmonic minor (minor with natural 7th)
  melodic_minor: [0, 2, 3, 5, 7, 9, 11], // Melodic minor (minor with natural 6th and 7th)
};

// Pentatonic and hexatonic sets for 5-box modes
export const MINOR_PENT_STEPS = [0, 3, 5, 7, 10]; // 1 b3 4 5 b7
export const MAJOR_PENT_STEPS = [0, 2, 4, 7, 9]; // 1 2 3 5 6
export const MINOR_HEX_STEPS = [0, 2, 3, 5, 7, 10]; // 1 2 b3 4 5 b7
export const MAJOR_HEX_STEPS = [0, 2, 4, 5, 7, 9]; // 1 2 3 4 5 6

// Intervals between adjacent strings in semitones (E→A=5, A→D=5, D→G=5, G→B=4, B→e=5)
export const STRING_INTERVALS = [5, 5, 5, 4, 5];

// UI data
export const ALL_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];

export const POSITION_LABELS = [
  "Ionian",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Aeolian",
  "Locrian",
];

export const CAGED_LABELS = [
  "E Shape",
  "D Shape", 
  "C Shape",
  "A Shape",
  "G Shape",
];

// Scale point type
export interface ScalePoint {
  string: number;   // 0-5 (low E to high E)
  fret: number;     // 0-24
  pc: number;       // pitch class 0-11
  degreeIdx: number; // index into the scale steps array
  isChordTone?: boolean; // true if this note is part of the chord triad (for CAGED mode)
}
