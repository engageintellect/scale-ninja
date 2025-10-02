/** Scale generation logic for Scale Ninja */

import {
  ScaleKind,
  Position,
  Position5,
  PositionCAGED,
  SCALE_STEPS,
  MINOR_PENT_STEPS,
  MINOR_HEX_STEPS,
  MAJOR_HEX_STEPS,
  BONAMASSA_STEPS,
  STRING_INTERVALS,
  OPEN_STRINGS_PC,
  ScalePoint,
} from "./types";

/* ------------------------------ helpers ------------------------------ */

export function keyToPc(key: string): number {
  const map: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  return map[key];
}

export function nearestFretForPcOnString(
  targetPc: number,
  stringIdx: number,
  approxFret: number
): number {
  const openPc = OPEN_STRINGS_PC[stringIdx];
  const base = (targetPc - openPc + 120) % 12; // 0..11
  let best = base,
    dist = Math.abs(base - approxFret);
  for (let k = -2; k <= 3; k++) {
    const f = base + 12 * k;
    if (f < 0) continue;
    const d = Math.abs(f - approxFret);
    if (d < dist) {
      dist = d;
      best = f;
    }
  }
  return best;
}

/* ------------------------------ Scale Builders ------------------------------ */

/** Build a single 3NPS shape for key/scale at modal offset `position` (0..6) */
export function build3NPS(
  keyPc: number,
  scale: ScaleKind,
  position: Position,
  anchorLowEFret = 5
): ScalePoint[] {
  const steps = SCALE_STEPS[scale];
  const degrees = Array.from({ length: 18 }, (_, j) => (position + j) % 7); // 6 strings × 3 notes

  // First note on low E close to anchor
  const firstPc = (keyPc + steps[degrees[0]]) % 12;
  const firstFret = nearestFretForPcOnString(firstPc, 0, anchorLowEFret);

  const out: ScalePoint[] = [];
  let expectedFret = firstFret;

  for (let j = 0; j < 18; j++) {
    const s = Math.floor(j / 3); // string index (0 = low E)
    const d = degrees[j];
    const pc = (keyPc + steps[d]) % 12;

    if (j > 0 && j % 3 === 0) {
      // move to next string: shift expected fret by string interval (approx position mapping)
      expectedFret -= STRING_INTERVALS[s - 1];
    } else if (j > 0) {
      // next note on same string: typically ~2 frets up
      expectedFret += 2;
    }

    const fret = nearestFretForPcOnString(pc, s, expectedFret);
    expectedFret = fret;
    out.push({ string: s, fret, pc, degreeIdx: d });
  }

  return out;
}

/** Generic builder: N-notes-per-string shape walking scale degrees in order */
export function buildNPerString(
  keyPc: number,
  steps: number[],
  startDeg: number,
  notesPerString: number,
  anchorLowEFret = 5
): ScalePoint[] {
  const totalNotes = 6 * notesPerString;
  const firstPc = (keyPc + steps[startDeg]) % 12;
  const firstFret = nearestFretForPcOnString(firstPc, 0, anchorLowEFret);
  const out: ScalePoint[] = [];
  let expectedFret = firstFret;

  for (let j = 0; j < totalNotes; j++) {
    const s = Math.floor(j / notesPerString);
    const d = (startDeg + j) % steps.length;
    const pc = (keyPc + steps[d]) % 12;
    if (j > 0 && j % notesPerString === 0) {
      expectedFret -= STRING_INTERVALS[s - 1];
    } else if (j > 0) {
      expectedFret += 2;
    }
    const fret = nearestFretForPcOnString(pc, s, expectedFret);
    expectedFret = fret;
    out.push({ string: s, fret, pc, degreeIdx: d });
  }
  return out;
}

/** Build scale notes across the entire 24-fret neck for Full Neck mode */
export function buildFullNeckScale(
  keyPc: number,
  steps: number[]
): ScalePoint[] {
  const out: ScalePoint[] = [];
  
  // For each string (0 = low E, 5 = high E)
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const openPc = OPEN_STRINGS_PC[stringIndex];
    
    // For each fret from 0 to 24
    for (let fret = 0; fret <= 24; fret++) {
      const notePc = (openPc + fret) % 12;
      
      // Check if this note is in our scale
      for (let degreeIdx = 0; degreeIdx < steps.length; degreeIdx++) {
        const scalePc = (keyPc + steps[degreeIdx]) % 12;
        
        if (notePc === scalePc) {
          out.push({
            string: stringIndex,
            fret,
            pc: notePc,
            degreeIdx,
            isChordTone: degreeIdx === 0 || degreeIdx === 2 || degreeIdx === 4
          });
          break; // Only add each fret position once
        }
      }
    }
  }
  
  return out;
}

/** Pentatonic 5-box. Box 1 starts at root on low E for minor, or relative minor root for major. */
export function buildPent5(keyPc: number, box: Position5, scale: ScaleKind = "minor", anchorLowEFret = 5): ScalePoint[] {
  // For major pentatonic, use the relative minor (3 semitones down)
  // This way C major pentatonic uses A minor pentatonic shapes
  const effectiveKeyPc = scale === "major" ? (keyPc + 9) % 12 : keyPc;
  
  // Check for problematic key/box combinations that generate wide spans
  const isProblematicCase = 
    (effectiveKeyPc === 1 && box === 1) ||  // C#/Db Box 2
    (effectiveKeyPc === 6 && box === 4) ||  // F#/Gb Box 5
    (effectiveKeyPc === 11 && box === 2);   // B Box 3
  
  // Use higher anchor for problematic cases to avoid open strings
  const adjustedAnchor = isProblematicCase ? anchorLowEFret + 5 : anchorLowEFret;
  
  const startDeg = (0 + box) % MINOR_PENT_STEPS.length;
  return buildNPerString(effectiveKeyPc, MINOR_PENT_STEPS, startDeg, 2, adjustedAnchor);
}

/** Hexatonic (pent + extra note) 5-box. Box 1 starts at root on low E for minor, or relative minor root for major.
 *  Implementation: take the pentatonic box and add the extra degree only where
 *  it naturally falls within the box's fret range (not forced onto every string).
 */
export function buildHex5(keyPc: number, box: Position5, scale: ScaleKind = "minor", anchorLowEFret = 5): ScalePoint[] {
  // For major hexatonic, use the relative minor (3 semitones down)
  // This way C major hexatonic uses A minor hexatonic shapes
  const effectiveKeyPc = scale === "major" ? (keyPc + 9) % 12 : keyPc;
  
  // Check for problematic key/box combinations that generate wide spans
  const isProblematicCase = 
    (effectiveKeyPc === 1 && box === 1) ||  // C#/Db Box 2
    (effectiveKeyPc === 6 && box === 4) ||  // F#/Gb Box 5
    (effectiveKeyPc === 11 && box === 2);   // B Box 3
  
  // Use higher anchor for problematic cases to avoid open strings
  const adjustedAnchor = isProblematicCase ? anchorLowEFret + 5 : anchorLowEFret;
  
  // Base pent box (always use minor since we're using effectiveKeyPc)
  const pent = buildPent5(effectiveKeyPc, box, "minor", adjustedAnchor);

  // Overall box fret range
  const boxMin = Math.min(...pent.map((p) => p.fret));
  let boxMax = Math.max(...pent.map((p) => p.fret));
  
  // Constrain the box range to prevent excessive spans
  const maxSpan = 8; // Maximum allowed fret span
  if (boxMax - boxMin > maxSpan) {
    boxMax = boxMin + maxSpan;
  }

  // Only extend range for Box 1 to include the 9th fret B on D string
  if (box === 0) {
    boxMax += 1; // minimal extension just for Box 1
  }

  // For minor hexatonic: add the 2nd degree
  // For major hexatonic: add the 4th degree (but we're using relative minor shapes, so still add 2nd of effective key)
  const targetPc = (effectiveKeyPc + 2) % 12; // the 2nd degree of the effective key
  const added: { string: number; fret: number; pc: number }[] = [];

  // For each string, check if the 2nd degree falls within the box range
  for (let s = 0; s < 6; s++) {
    const openPc = OPEN_STRINGS_PC[s];
    const base = (targetPc - openPc + 120) % 12; // first occurrence >=0

    // Find all possible fret positions for the 2nd degree on this string
    for (let k = 0; k <= 3; k++) {
      const fret = base + 12 * k;
      if (fret > 24) break;

      // Only add if it falls within the pentatonic box range
      if (fret >= boxMin && fret <= boxMax) {
        // Check if this note isn't already in the pentatonic set
        const alreadyExists = pent.some(
          (p) => p.string === s && p.fret === fret
        );
        if (!alreadyExists) {
          added.push({ string: s, fret, pc: targetPc });
          break; // Only add one occurrence per string
        }
      }
    }
  }

  // Choose the appropriate hex steps based on scale type
  const hexSteps = scale === "major" ? MAJOR_HEX_STEPS : MINOR_HEX_STEPS;
  const originalKeyPc = keyPc; // Keep original key for interval calculation
  
  // Merge and remap degreeIdx to hex indices for all points
  const merged = [
    ...pent.map((p) => {
      const interval = (p.pc - originalKeyPc + 12) % 12;
      const idx = hexSteps.indexOf(interval);
      return { ...p, degreeIdx: idx >= 0 ? idx : 0 };
    }),
    ...added.map((q) => {
      const interval = (q.pc - originalKeyPc + 12) % 12;
      const idx = hexSteps.indexOf(interval);
      return {
        string: q.string,
        fret: q.fret,
        pc: q.pc,
        degreeIdx: idx >= 0 ? idx : 1,
      };
    }),
  ];

  return merged;
}

/** Joe Bonamassa style blues patterns - combines minor pentatonic with strategic additions */
export function buildBonamassa5(keyPc: number, box: Position5, anchorLowEFret = 5): ScalePoint[] {
  // Check for problematic key/box combinations
  const isProblematicCase = 
    (keyPc === 1 && box === 1) ||  // C#/Db Box 2
    (keyPc === 6 && box === 4) ||  // F#/Gb Box 5
    (keyPc === 11 && box === 2);   // B Box 3
  
  const adjustedAnchor = isProblematicCase ? anchorLowEFret + 5 : anchorLowEFret;
  
  // Bonamassa uses extended patterns - start with 3-4 notes per string approach
  // Use the full Bonamassa scale with strategic note density per string
  const startDeg = (0 + box) % BONAMASSA_STEPS.length;
  
  // Build extended pattern with variable notes per string (3-4 notes)
  const notesPerString = [3, 4, 3, 4, 3, 3]; // Varies by string for optimal fingering
  const totalNotes = notesPerString.reduce((sum, n) => sum + n, 0);
  
  const firstPc = (keyPc + BONAMASSA_STEPS[startDeg]) % 12;
  const firstFret = nearestFretForPcOnString(firstPc, 0, adjustedAnchor);
  const out: ScalePoint[] = [];
  let expectedFret = firstFret;
  let noteIndex = 0;

  for (let s = 0; s < 6; s++) {
    const notesOnThisString = notesPerString[s];
    
    if (s > 0) {
      // Move to next string: adjust expected fret by string interval
      expectedFret -= STRING_INTERVALS[s - 1];
    }

    for (let n = 0; n < notesOnThisString && noteIndex < totalNotes; n++) {
      const d = (startDeg + noteIndex) % BONAMASSA_STEPS.length;
      const pc = (keyPc + BONAMASSA_STEPS[d]) % 12;
      
      if (n > 0) {
        // Next note on same string: typically 1-3 frets up depending on intervals
        const prevInterval = BONAMASSA_STEPS[(startDeg + noteIndex - 1) % BONAMASSA_STEPS.length];
        const currentInterval = BONAMASSA_STEPS[d];
        const stepSize = ((currentInterval - prevInterval + 12) % 12);
        expectedFret += stepSize <= 3 ? stepSize : 1; // Smart fret spacing
      }

      const fret = nearestFretForPcOnString(pc, s, expectedFret);
      expectedFret = fret;
      
      // Mark blue notes (♭5)
      const interval = (pc - keyPc + 12) % 12;
      const isBlueNote = interval === 6; // ♭5
      
      out.push({ 
        string: s, 
        fret, 
        pc, 
        degreeIdx: d,
        isBlueNote 
      });
      
      noteIndex++;
    }
  }

  return out;
}

/** Bonamassa 3-notes-per-string pentatonic patterns - compact box shapes */
export function buildBonamassaExtended(keyPc: number, box: Position5, anchorLowEFret = 5): ScalePoint[] {
  // Bonamassa uses 3-notes-per-string minor pentatonic patterns
  // These stay compact in one position, unlike the spreading buildNPerString approach
  
  // Check for problematic key/box combinations
  const isProblematicCase = 
    (keyPc === 1 && box === 1) ||  // C#/Db Box 2
    (keyPc === 6 && box === 4) ||  // F#/Gb Box 5
    (keyPc === 11 && box === 2);   // B Box 3
  
  const adjustedAnchor = isProblematicCase ? anchorLowEFret + 5 : anchorLowEFret;
  
  // Start with the 2NPS pentatonic pattern to get the base position
  const basePent = buildPent5(keyPc, box, "minor", adjustedAnchor);
  
  // Get the fret range of the base pattern
  const boxMin = Math.min(...basePent.map(p => p.fret));
  const boxMax = Math.max(...basePent.map(p => p.fret));
  
  // For 3NPS, we need to add one more note per string from the pentatonic scale
  // staying within a reasonable fret span (typically 4-5 frets)
  const maxSpan = 6; // Allow slightly more span for 3NPS
  const effectiveMax = Math.min(boxMax + 2, boxMin + maxSpan);
  
  const out: ScalePoint[] = [];
  
  // For each string, find 3 notes from the pentatonic scale within the box range
  for (let s = 0; s < 6; s++) {
    const openPc = OPEN_STRINGS_PC[s];
    const notesOnString: ScalePoint[] = [];
    
    // Check each fret in the box range
    for (let fret = boxMin; fret <= effectiveMax; fret++) {
      const pc = (openPc + fret) % 12;
      const interval = (pc - keyPc + 12) % 12;
      
      // Check if this note is in the minor pentatonic scale
      const degreeIdx = MINOR_PENT_STEPS.indexOf(interval);
      if (degreeIdx >= 0) {
        notesOnString.push({
          string: s,
          fret,
          pc,
          degreeIdx,
          isBlueNote: interval === 6 // Mark blue notes (♭5)
        });
      }
    }
    
    // Take exactly 3 notes per string (or however many we found)
    // Prefer notes that are evenly spaced
    if (notesOnString.length >= 3) {
      out.push(notesOnString[0], notesOnString[1], notesOnString[2]);
    } else {
      out.push(...notesOnString);
    }
  }
  
  return out;
}

/** Enhanced CAGED system - shows chord tones within pentatonic patterns */
export function buildCAGED(keyPc: number, scale: ScaleKind, shape: PositionCAGED): ScalePoint[] {
  // Get pentatonic pattern for the area
  const cagedToBoxMapping = {
    0: { box: 0, anchorFret: 0 },   // E-shape 
    1: { box: 1, anchorFret: 3 },   // D-shape 
    2: { box: 2, anchorFret: 5 },   // C-shape 
    3: { box: 3, anchorFret: 7 },   // A-shape 
    4: { box: 4, anchorFret: 10 }   // G-shape 
  };
  
  const mapping = cagedToBoxMapping[shape];
  const pentNotes = buildPent5(keyPc, mapping.box as Position5, scale, mapping.anchorFret);
  
  // Define chord tone intervals based on scale type
  const triadIntervals = scale === "major" 
    ? [0, 4, 7]  // Major triad: root, major 3rd, perfect 5th
    : [0, 3, 7]; // Minor triad: root, minor 3rd, perfect 5th
  
  // Simple approach: highlight all chord tones (1, 3, 5) in the pentatonic pattern
  return pentNotes.map(note => {
    const interval = (note.pc - keyPc + 12) % 12;
    const isChordTone = triadIntervals.includes(interval);
    
    return {
      ...note,
      isChordTone
    };
  });
}


/** Build Bonamassa-style blues patterns for full neck */
export function buildBonamassaFullNeck(keyPc: number): ScalePoint[] {
  const out: ScalePoint[] = [];
  
  // For each string (0 = low E, 5 = high E)
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const openPc = OPEN_STRINGS_PC[stringIndex];
    
    // For each fret from 0 to 24
    for (let fret = 0; fret <= 24; fret++) {
      const notePc = (openPc + fret) % 12;
      
      // Check if this note is in our Bonamassa scale
      for (let degreeIdx = 0; degreeIdx < BONAMASSA_STEPS.length; degreeIdx++) {
        const scalePc = (keyPc + BONAMASSA_STEPS[degreeIdx]) % 12;
        
        if (notePc === scalePc) {
          const interval = (notePc - keyPc + 12) % 12;
          out.push({
            string: stringIndex,
            fret,
            pc: notePc,
            degreeIdx,
            isBlueNote: interval === 6 // Mark ♭5 as blue note
          });
          break;
        }
      }
    }
  }
  
  return out;
}

/** Build full-neck set (all positions) */
export function buildFullNeck(
  keyPc: number,
  scale: ScaleKind,
  maxFret = 21
): ScalePoint[] {
  const steps = SCALE_STEPS[scale];
  const out: ScalePoint[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const pc = (OPEN_STRINGS_PC[s] + f) % 12;
      const interval = (pc - keyPc + 12) % 12;
      const degreeIdx = steps.indexOf(interval);
      if (degreeIdx >= 0) {
        out.push({ string: s, fret: f, pc, degreeIdx });
      }
    }
  }
  return out;
}
