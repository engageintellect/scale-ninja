"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { ControlPanel } from "./components/ControlPanel";
import { KeyDisplay } from "./components/KeyDisplay";
import { Fretboard } from "./components/Fretboard";
import { Footer } from "./components/Footer";
import { ScaleKind, Position, Position5, PositionCAGED, ScalePoint, SCALE_STEPS } from "./components/types";
import {
  keyToPc,
  build3NPS,
  buildPent5,
  buildHex5,
  buildCAGED,
  buildFullNeckScale,
  buildBonamassaExtended,
  buildBonamassaFullNeck,
} from "./components/ScaleEngine";

/** Tailwind-only • Player view (low-E at bottom) • Correct 3NPS • 7 positions
 *  Plus Pent/Hex 5-box modes (minor-based), Box 1 anchored with root on low E
 */

export default function Page() {
  const [selectedKey, setSelectedKey] = useState("A");
  const [selectedScale, setSelectedScale] = useState<ScaleKind>("minor");
  const [selectedMode, setSelectedMode] = useState<
    "3nps" | "pent5" | "hex5" | "caged" | "bonamassa"
  >("3nps");
  const [selectedPosition, setSelectedPosition] = useState<Position>(0);
  const [selectedBox, setSelectedBox] = useState<Position5>(0);
  const [selectedCAGEDShape, setSelectedCAGEDShape] = useState<PositionCAGED>(0);
  const [labelMode, setLabelMode] = useState<"note" | "degree">("note");
  const [useFlats, setUseFlats] = useState(false);
  const [fullNeck, setFullNeck] = useState(false);

  // Auto-switch scale when changing modes
  useEffect(() => {
    if ((selectedScale === "harmonic_minor" || selectedScale === "melodic_minor") && selectedMode !== "3nps") {
      setSelectedScale("minor");
    }
    if (selectedMode === "bonamassa" && selectedScale !== "blues") {
      setSelectedScale("blues");
    }
  }, [selectedMode, selectedScale]);

  const keyPc = keyToPc(selectedKey);

  const { points, minFret, maxFret } = useMemo(() => {
    let pts: ScalePoint[] = [];
    
    if (fullNeck) {
      // Full neck mode: show all scale notes across the entire 24-fret range
      if (selectedMode === "3nps") {
        // Use correct scale steps based on selected scale type
        const steps = SCALE_STEPS[selectedScale];
        pts = buildFullNeckScale(keyPc, steps);
      } else if (selectedMode === "pent5") {
        // Use pentatonic steps for complete neck coverage
        const steps = selectedScale === "major" ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
        pts = buildFullNeckScale(keyPc, steps);
      } else if (selectedMode === "hex5") {
        // Use hexatonic steps for complete neck coverage
        const steps = selectedScale === "major" ? [0, 2, 4, 5, 7, 9] : [0, 2, 3, 5, 7, 10];
        pts = buildFullNeckScale(keyPc, steps);
      } else if (selectedMode === "caged") {
        // Use pentatonic steps for CAGED (since CAGED is based on pentatonic + chord tones)
        const steps = selectedScale === "major" ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
        pts = buildFullNeckScale(keyPc, steps);
        
        // Add chord tone information
        const triadIntervals = selectedScale === "major" ? [0, 4, 7] : [0, 3, 7];
        pts = pts.map(note => {
          const interval = (note.pc - keyPc + 12) % 12;
          const isChordTone = triadIntervals.includes(interval);
          return { ...note, isChordTone };
        });
      } else if (selectedMode === "bonamassa") {
        // Use Bonamassa full neck pattern
        pts = buildBonamassaFullNeck(keyPc);
      }
    } else {
      // Single mode: show selected position/box/shape
      if (selectedMode === "3nps") {
        pts = build3NPS(keyPc, selectedScale, selectedPosition);
      } else if (selectedMode === "pent5") {
        pts = buildPent5(keyPc, selectedBox, selectedScale);
      } else if (selectedMode === "hex5") {
        pts = buildHex5(keyPc, selectedBox, selectedScale);
      } else if (selectedMode === "caged") {
        pts = buildCAGED(keyPc, selectedScale, selectedCAGEDShape);
      } else if (selectedMode === "bonamassa") {
        pts = buildBonamassaExtended(keyPc, selectedBox);
      }
    }
    
    const minF = Math.min(...pts.map((p) => p.fret));
    const maxF = Math.max(...pts.map((p) => p.fret));
    return { points: pts, minFret: minF, maxFret: maxF };
  }, [keyPc, selectedScale, selectedMode, selectedPosition, selectedBox, selectedCAGEDShape, fullNeck]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <ControlPanel
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
            selectedScale={selectedScale}
            setSelectedScale={setSelectedScale}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            selectedBox={selectedBox}
            setSelectedBox={setSelectedBox}
            selectedCAGEDShape={selectedCAGEDShape}
            setSelectedCAGEDShape={setSelectedCAGEDShape}
            labelMode={labelMode}
            setLabelMode={setLabelMode}
            useFlats={useFlats}
            setUseFlats={setUseFlats}
            fullNeck={fullNeck}
            setFullNeck={setFullNeck}
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <KeyDisplay
            selectedKey={selectedKey}
            selectedScale={selectedScale}
            selectedMode={selectedMode}
            selectedPosition={selectedPosition}
            selectedBox={selectedBox}
            selectedCAGEDShape={selectedCAGEDShape}
            useFlats={useFlats}
          />
        </div>

        <div className="bg-neutral-800 p-2 md:p-6 rounded-lg animate-slide-up shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Fretboard
            points={points}
            minFret={minFret}
            maxFret={maxFret}
            keyPc={keyPc}
            scale={selectedScale}
            labelMode={labelMode}
            useFlats={useFlats}
            mode={selectedMode}
            fullNeck={fullNeck}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
