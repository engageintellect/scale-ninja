import React from "react";
import {
  ScaleKind,
  Position,
  Position5,
  PositionCAGED,
  POSITION_LABELS,
  CAGED_LABELS,
  NOTE_NAMES_SHARP,
  NOTE_NAMES_FLAT,
  SCALE_STEPS,
} from "./types";

interface KeyDisplayProps {
  selectedKey: string;
  selectedScale: ScaleKind;
  selectedMode: "3nps" | "full" | "pent5" | "hex5" | "caged" | "bonamassa" | "triads";
  selectedPosition: Position;
  selectedBox: Position5;
  selectedCAGEDShape: PositionCAGED;
  useFlats: boolean;
}

export function KeyDisplay({
  selectedKey,
  selectedScale,
  selectedMode,
  selectedPosition,
  selectedBox,
  selectedCAGEDShape,
  useFlats,
}: KeyDisplayProps) {
  // Helper function to get relative major/minor key
  const getRelativeKey = (key: string, scale: ScaleKind): string => {
    const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
    const keyIndex = noteNames.findIndex(note => note === key);
    
    if (keyIndex === -1) return key; // Fallback if key not found
    
    if (scale === "major") {
      // Relative minor is 3 semitones down (9 semitones up in 12-tone system)
      const relativeIndex = (keyIndex + 9) % 12;
      return noteNames[relativeIndex];
    } else if (scale === "minor" || scale === "harmonic_minor" || scale === "melodic_minor" || scale === "blues") {
      // Relative major is 3 semitones up
      const relativeIndex = (keyIndex + 3) % 12;
      return noteNames[relativeIndex];
    } else {
      return key; // Fallback
    }
  };

  // Get scale formula and notes
  const getScaleInfo = (key: string, scale: ScaleKind) => {
    const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
    const keyIndex = noteNames.findIndex(note => note === key);
    const steps = SCALE_STEPS[scale];
    
    const notes = steps.map(step => {
      const noteIndex = (keyIndex + step) % 12;
      return noteNames[noteIndex];
    });
    
    const formula = scale === "major" 
      ? "1 - 2 - 3 - 4 - 5 - 6 - 7"
      : scale === "harmonic_minor"
      ? "1 - 2 - ♭3 - 4 - 5 - ♭6 - 7"
      : scale === "melodic_minor"
      ? "1 - 2 - ♭3 - 4 - 5 - 6 - 7"
      : scale === "blues"
      ? "1 - ♭3 - 4 - ♭5 - 5 - ♭7"
      : "1 - 2 - ♭3 - 4 - 5 - ♭6 - ♭7";
    
    return { notes, formula };
  };

  // Get mode-specific information
  const getModeInfo = () => {
    const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
    const keyIndex = noteNames.findIndex(note => note === selectedKey);
    
    if (selectedMode === "pent5") {
      if (selectedScale === "major") {
        // Major pentatonic: 1, 2, 3, 5, 6
        const pentSteps = [0, 2, 4, 7, 9];
        const notes = pentSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - 2 - 3 - 5 - 6",
          description: "Major Pentatonic",
          notes
        };
      } else {
        // Minor pentatonic: 1, ♭3, 4, 5, ♭7
        const pentSteps = [0, 3, 5, 7, 10];
        const notes = pentSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - ♭3 - 4 - 5 - ♭7",
          description: "Minor Pentatonic",
          notes
        };
      }
    } else if (selectedMode === "hex5") {
      if (selectedScale === "major") {
        // Major hexatonic: 1, 2, 3, 4, 5, 6
        const hexSteps = [0, 2, 4, 5, 7, 9];
        const notes = hexSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - 2 - 3 - 4 - 5 - 6",
          description: "Major Hexatonic",
          notes
        };
      } else {
        // Minor hexatonic: 1, 2, ♭3, 4, 5, ♭7
        const hexSteps = [0, 2, 3, 5, 7, 10];
        const notes = hexSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - 2 - ♭3 - 4 - 5 - ♭7",
          description: "Minor Hexatonic",
          notes
        };
      }
    } else if (selectedMode === "caged") {
      if (selectedScale === "major") {
        // Major CAGED: major pentatonic + major chord tones
        const pentSteps = [0, 2, 4, 5, 7, 9];
        const notes = pentSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - 2 - 3 - 4 - 5 - 6",
          description: "CAGED Major (1-3-5)",
          notes
        };
      } else {
        // Minor CAGED: minor pentatonic + minor chord tones
        const pentSteps = [0, 3, 5, 7, 10];
        const notes = pentSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - ♭3 - 4 - 5 - ♭7",
          description: "CAGED Minor (1-♭3-5)",
          notes
        };
      }
    } else if (selectedMode === "bonamassa") {
      // Bonamassa blues: 1, 2, ♭3, 3, 4, ♭5, 5, 6, ♭7
      const bonamassaSteps = [0, 2, 3, 4, 5, 6, 7, 9, 10];
      const notes = bonamassaSteps.map(step => {
        const noteIndex = (keyIndex + step) % 12;
        return noteNames[noteIndex];
      });
      return {
        formula: "1 - 2 - ♭3 - 3 - 4 - ♭5 - 5 - 6 - ♭7",
        description: "Bonamassa Blues Scale",
        notes
      };
    } else if (selectedMode === "triads") {
      if (selectedScale === "major") {
        // Major triad: 1, 3, 5
        const triadSteps = [0, 4, 7];
        const notes = triadSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - 3 - 5",
          description: "Major Triad",
          notes
        };
      } else {
        // Minor triad: 1, ♭3, 5
        const triadSteps = [0, 3, 7];
        const notes = triadSteps.map(step => {
          const noteIndex = (keyIndex + step) % 12;
          return noteNames[noteIndex];
        });
        return {
          formula: "1 - ♭3 - 5",
          description: "Minor Triad",
          notes
        };
      }
    } else {
      return {
        ...getScaleInfo(selectedKey, selectedScale),
        description: selectedMode === "3nps" ? "Modal Position" : 
                    selectedMode === "full" ? "All Positions" : "Box Pattern"
      };
    }
  };

  const relativeKey = getRelativeKey(selectedKey, selectedScale);
  const relativeScale = selectedScale === "major" ? "minor" : "major";
  const currentScaleInfo = getScaleInfo(selectedKey, selectedScale);
  const modeInfo = getModeInfo();

  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700 mb-6">
      {/* Mobile/Tablet Layout */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between">
          {/* Left side - Key information */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {selectedKey}
              </div>
              <div className="text-lg font-semibold text-emerald-300 mt-1">
                {selectedScale === "major" ? "Major" : "Minor"}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Current Key
              </div>
            </div>
            
            <div className="text-neutral-600 text-3xl font-light">|</div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-300">
                {relativeKey}
              </div>
              <div className="text-lg font-semibold text-neutral-400 mt-1">
                {relativeScale === "major" ? "Major" : "Minor"}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Relative {relativeScale === "major" ? "Major" : "Minor"}
              </div>
            </div>
          </div>

          {/* Right side - Mode information */}
          <div className="text-right">
            <div className="text-lg font-semibold text-neutral-300">
              {selectedMode === "3nps" && `Position ${selectedPosition + 1}`}
              {(selectedMode === "pent5" || selectedMode === "hex5" || selectedMode === "bonamassa") && `Box ${selectedBox + 1}`}
              {selectedMode === "caged" && `${CAGED_LABELS[selectedCAGEDShape]}`}
              {selectedMode === "triads" && `${CAGED_LABELS[selectedCAGEDShape]}`}
              {selectedMode === "full" && "Full Neck"}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {selectedMode === "3nps" && POSITION_LABELS[selectedPosition]}
              {selectedMode === "pent5" && "Pentatonic Scale"}
              {selectedMode === "hex5" && "Hexatonic Scale"}
              {selectedMode === "bonamassa" && "Bonamassa Blues"}
              {selectedMode === "caged" && "CAGED System"}
              {selectedMode === "triads" && "Triad Shapes"}
              {selectedMode === "full" && "Complete Fretboard"}
            </div>
            <div className="text-xs text-neutral-500 mt-1 capitalize">
              {selectedMode === "3nps" ? "3 Notes Per String" : selectedMode === "caged" ? "Chord Shape" : selectedMode === "triads" ? "Chord Tones" : selectedMode.replace(/\d/, " ")} Mode
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Compact Version */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-5 gap-6 items-center">
          {/* Left - Current Scale */}
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {selectedKey}
            </div>
            <div className="text-lg font-semibold text-emerald-300">
              {selectedScale === "major" ? "Major" : "Minor"}
            </div>
            <div className="text-xs text-neutral-500">
              Current Key
            </div>
          </div>

          {/* Scale Formula & Notes */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-neutral-400">Formula:</div>
              <div className="text-base font-mono text-neutral-200">
                {modeInfo.formula}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-400">Notes:</div>
              <div className="flex gap-1 flex-wrap">
                {(modeInfo.notes || currentScaleInfo.notes).map((note, i) => (
                  <span key={i} className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                    i === 0 ? 'bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-200'
                  }`}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mode Information */}
          <div className="text-center border-x border-neutral-700 px-4">
            <div className="text-lg font-semibold text-neutral-300">
              {selectedMode === "3nps" && `Position ${selectedPosition + 1}`}
              {(selectedMode === "pent5" || selectedMode === "hex5" || selectedMode === "bonamassa") && `Box ${selectedBox + 1}`}
              {selectedMode === "caged" && `${CAGED_LABELS[selectedCAGEDShape]}`}
              {selectedMode === "triads" && `${CAGED_LABELS[selectedCAGEDShape]}`}
              {selectedMode === "full" && "Full Neck"}
            </div>
            <div className="text-sm text-neutral-400">
              {selectedMode === "3nps" && POSITION_LABELS[selectedPosition]}
              {selectedMode === "pent5" && "Pentatonic"}
              {selectedMode === "hex5" && "Hexatonic"}
              {selectedMode === "bonamassa" && "Bonamassa Blues"}
              {selectedMode === "caged" && "CAGED"}
              {selectedMode === "triads" && "Triad Shapes"}
              {selectedMode === "full" && "All Positions"}
            </div>
            <div className="text-xs text-neutral-500">
              {modeInfo.description}
            </div>
          </div>

          {/* Right - Relative Scale */}
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-300">
              {relativeKey}
            </div>
            <div className="text-base font-semibold text-neutral-400">
              {relativeScale === "major" ? "Major" : "Minor"}
            </div>
            <div className="text-xs text-neutral-500">
              Relative {relativeScale === "major" ? "Major" : "Minor"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
