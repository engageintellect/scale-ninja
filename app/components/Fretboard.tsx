"use client";

import React, { useState, useEffect } from 'react';
import { ScaleKind, ScalePoint, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, SCALE_STEPS, MINOR_PENT_STEPS, MINOR_HEX_STEPS, BONAMASSA_STEPS } from './types';
import { audioEngine } from './AudioEngine';

interface FretboardProps {
  points: ScalePoint[];
  minFret: number;
  maxFret: number;
  keyPc: number;
  scale: ScaleKind;
  labelMode: "note" | "degree";
  useFlats: boolean;
  mode: "3nps" | "pent5" | "hex5" | "caged" | "bonamassa" | "triads";
  fullNeck?: boolean;
}

export function Fretboard({
  points,
  minFret,
  maxFret,
  keyPc,
  scale,
  labelMode,
  useFlats,
  mode,
  fullNeck = false,
}: FretboardProps) {
  const [dimensions, setDimensions] = useState({ bubbleR: 20, fretW: 48, padL: 60, padR: 20 });

  useEffect(() => {
    const calculateOptimalSizing = () => {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') return;
      
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      
      // Calculate optimal dimensions - keep same spacing regardless of Full Neck mode
      let padL, padR, bubbleR, fretW;
      
      if (viewportWidth >= 1024) {
        // Desktop: prioritize readability
        padL = 60;
        padR = 20;
        bubbleR = 20;
        fretW = 48;
      } else if (viewportWidth >= 768) {
        // Tablet: fixed approach
        padL = 50;
        padR = 20;
        fretW = 45; // Fixed width for tablets
        bubbleR = 18; // Fixed size, slightly smaller than desktop
      } else {
        // Mobile: FIXED fret width - never changes regardless of Full Neck mode
        const stringLabelSpace = 40; // Space for string names (E, A, D, etc.)
        padL = stringLabelSpace;
        padR = 8; // Minimal right padding
        
        // FIXED fret width - never calculate based on available space or fret count
        fretW = 32; // Fixed width that works well on mobile
        bubbleR = 14; // Fixed bubble size for mobile
      }
      
      setDimensions({ bubbleR, fretW, padL, padR });
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timer = setTimeout(calculateOptimalSizing, 100);
    
    const handleResize = () => calculateOptimalSizing();
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [minFret, maxFret, mode]); // Recalculate when pattern changes

  const { bubbleR, fretW, padL, padR } = dimensions;
  const NOTE_R = bubbleR;
  const stringCount = 6;
  const padV = 30;
  const padBottom = 80;
  
  // Ensure enough vertical space so circles never overlap on Y axis
  const minStringGap = NOTE_R * 2 + 16; // diameter + even larger margin for mobile
  const baseHeight = 320;
  const requiredHeight = padV + padBottom + (stringCount - 1) * minStringGap;
  const height = Math.max(baseHeight, requiredHeight);
  
  // Calculate display parameters
  const baseFretCount = Math.max(12, maxFret) - minFret + 1;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  
  // Separate display logic from sizing logic
  const displayMinFret = fullNeck ? 0 : (isDesktop ? 0 : minFret);
  const displayFretCount = fullNeck ? 25 : (isDesktop ? 24 : baseFretCount);
  
  // Fixed width calculation - never changes based on fret count
  const innerW = displayFretCount * fretW;
  const width = padL + padR + innerW;
  const stringH = (height - padV - padBottom) / (stringCount - 1);

  const pcToName = (pc: number) =>
    useFlats ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES_SHARP[pc];
  const visY = (s: number) => (stringCount - 1 - s) * stringH + padV; // player view (low-E bottom)

  // String names for standard tuning (low to high)
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E'];

  // Handle note click for audio playback
  const handleNoteClick = async (stringIndex: number, fret: number) => {
    try {
      await audioEngine.playStringFret(stringIndex, fret);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  // Fret markers (dots) - standard guitar positions
  const getFretMarkers = () => {
    const markers = [];
    for (let fret = displayMinFret; fret <= displayMinFret + displayFretCount - 1; fret++) {
      if (fret === 0) continue; // No marker on open strings
      
      const fretIndex = fret - displayMinFret;
      const x = padL + (fretIndex + 0.5) * fretW;
      const centerY = padV + (height - padV - padBottom) / 2;
      
      // Single dots on frets 3, 5, 7, 9, 15, 17, 19, 21
      if ([3, 5, 7, 9, 15, 17, 19, 21].includes(fret)) {
        markers.push(
          <circle
            key={`dot-${fret}`}
            cx={x}
            cy={centerY}
            r={10}
            className="fill-neutral-500"
          />
        );
      }
      // Double dots on frets 12, 24 (spaced even further apart)
      else if ([12, 24].includes(fret)) {
        markers.push(
          <g key={`double-dot-${fret}`}>
            <circle
              cx={x}
              cy={centerY - 50}
              r={10}
              className="fill-neutral-500"
            />
            <circle
              cx={x}
              cy={centerY + 50}
              r={10}
              className="fill-neutral-500"
            />
          </g>
        );
      }
    }
    return markers;
  };

  const strokeNut = "#aaa",
    strokeFret = "#333",
    strokeString = "#777";

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0"
      >
        {/* Fret spaces background (shade open-string space) */}
        <g transform={`translate(${padL},0)`}>
          {Array.from({ length: displayFretCount }, (_, i) => {
            const x = i * fretW;
            const isOpenSpace = displayMinFret === 0 && i === 0;
            return (
              <rect
                key={`bg-${i}`}
                x={x}
                y={padV}
                width={fretW}
                height={height - padV - padBottom}
                className={
                  isOpenSpace ? "fill-neutral-400" : "fill-transparent"
                }
                rx={4}
              />
            );
          })}
        </g>

        {/* Frets */}
        <g transform={`translate(${padL},0)`}>
          <line
            x1={0}
            y1={padV}
            x2={0}
            y2={height - padBottom}
            stroke={strokeNut}
            strokeWidth={minFret === 0 ? 4 : 2}
          />
          {Array.from({ length: displayFretCount }, (_, i) => {
            const x = (i + 1) * fretW;
            return (
              <line
                key={i}
                x1={x}
                y1={padV}
                x2={x}
                y2={height - padBottom}
                stroke={strokeFret}
              />
            );
          })}
          {Array.from({ length: displayFretCount }, (_, i) => {
            // Label each fret space by its starting fret number (centered in the space)
            const fret = displayMinFret + i;
            const x = i * fretW + fretW / 2;
            return (
              <text
                key={i}
                x={x}
                y={height - 20}
                className="fill-neutral-300 text-xl md:text-2xl font-bold"
                textAnchor="middle"
              >
                {fret}
              </text>
            );
          })}
        </g>

        {/* Strings */}
        <g transform={`translate(${padL},0)`}>
          {Array.from({ length: stringCount }, (_, s) => (
            <line
              key={s}
              x1={0}
              y1={visY(s)}
              x2={innerW}
              y2={visY(s)}
              stroke={strokeString}
              strokeWidth={1 + (stringCount - 1 - s) * 0.2}
            />
          ))}
        </g>

        {/* Fret markers (dots) */}
        {getFretMarkers()}

        {/* String names */}
        <g>
          {stringNames.map((name, s) => (
            <text
              key={s}
              x={padL - 25}
              y={visY(s)}
              className="fill-neutral-400 text-lg font-semibold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {name}
            </text>
          ))}
        </g>

        {/* Notes moved to HTML overlay */}
      </svg>
      {/* HTML overlay for note bubbles */}
      <div
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{ width, height }}
      >
        {points.map((p, i) => {
          // Center each bubble in its fret space
          const x = padL + (p.fret - displayMinFret + 0.5) * fretW;
          const y = visY(p.string);
          const isRoot = p.pc === keyPc;
          const currentSteps =
            mode === "pent5"
              ? MINOR_PENT_STEPS
              : mode === "hex5"
              ? MINOR_HEX_STEPS
              : mode === "bonamassa"
              ? BONAMASSA_STEPS
              : SCALE_STEPS[scale];
          const label =
            labelMode === "degree"
              ? (() => {
                  const len = currentSteps.length;
                  const zeroIdx = currentSteps.indexOf(0);
                  const degNum = ((p.degreeIdx - zeroIdx + len) % len) + 1;
                  return String(degNum);
                })()
              : pcToName(p.pc);

          // In CAGED mode, make chord tones larger and with different styling
          // In Bonamassa mode, make blue notes (♭5) stand out
          // In Triads mode, differentiate root, third, and fifth
          const isChordTone = p.isChordTone;
          const isBlueNote = p.isBlueNote;
          const isThird = p.isThird;
          const isFifth = p.isFifth;
          const chordToneMultiplier = isChordTone && mode === "caged" ? 1.3 : 1;
          const triadMultiplier = mode === "triads" ? 1.2 : 1;
          const adjustedBubbleR = bubbleR * chordToneMultiplier * triadMultiplier;
          
          let borderStyle = {};
          if (isChordTone && mode === "caged") {
            borderStyle = { border: '2px solid #fff', boxShadow: '0 0 8px rgba(255,255,255,0.5)' };
          } else if (isBlueNote && mode === "bonamassa") {
            borderStyle = { border: '2px solid #3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.5)' };
          } else if (mode === "triads") {
            if (isRoot) {
              borderStyle = { border: '3px solid #10b981', boxShadow: '0 0 10px rgba(16,185,129,0.6)' };
            } else if (isThird) {
              borderStyle = { border: '2px solid #f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.5)' };
            } else if (isFifth) {
              borderStyle = { border: '2px solid #8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.5)' };
            }
          }

          return (
            <div
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-neutral-100 font-semibold select-none cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                isRoot && mode === "triads" ? "bg-emerald-600 hover:bg-emerald-500" :
                isThird && mode === "triads" ? "bg-amber-600 hover:bg-amber-500" :
                isFifth && mode === "triads" ? "bg-purple-600 hover:bg-purple-500" :
                isRoot ? "bg-emerald-500 hover:bg-emerald-400" : 
                isBlueNote && mode === "bonamassa" ? "bg-blue-500 hover:bg-blue-400" :
                "bg-zinc-600/90 hover:bg-zinc-500/90"
              }`}
              style={{ 
                left: x, 
                top: y,
                width: `${adjustedBubbleR * 2}px`,
                height: `${adjustedBubbleR * 2}px`,
                fontSize: `${Math.max(10, adjustedBubbleR * 0.7)}px`,
                ...borderStyle,
                pointerEvents: 'auto' // Enable clicks on this element
              }}
              onClick={() => handleNoteClick(p.string, p.fret)}
              title={`${pcToName(p.pc)} - String ${p.string + 1}, Fret ${p.fret}`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
