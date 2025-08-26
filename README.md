# 🎸 Scale Ninja

An interactive web application for visualizing and learning guitar scales across the entire fretboard. Master guitar scales with intuitive fretboard patterns, CAGED system visualization, realistic audio playback, and multiple learning modes. Built with Next.js, React, and TypeScript.

![Guitar Scale Explorer Screenshot](public/screenshot.png)

## ✨ Features

### 🎵 **Interactive Audio**
- **Clickable Note Playback** - Click any note on the fretboard to hear realistic guitar tones
- **Authentic Guitar Sound** - Multi-harmonic synthesis with proper filtering and envelope shaping
- **Web Audio API** - High-quality audio generation with plucked-string characteristics
- **Natural Decay** - Notes fade naturally like real guitar strings

### 🎸 **Professional Fretboard**
- **Authentic Fret Markers** - Traditional guitar inlay dots on frets 3, 5, 7, 9, 12, 15, 17, 19, 21, 24
- **Double Dots on 12th Fret** - Properly spaced octave markers like real guitars
- **String Names Display** - Shows tuning (E-A-D-G-B-E) for easy reference
- **Full-Width Mobile Layout** - Always spans complete viewport width on mobile devices
- **Responsive Sizing** - Dynamic fret and note sizing for optimal touch interaction

### 🎼 **Scale Types & Modes**
- **Major (Ionian) and Natural Minor (Aeolian)** scales
- **Harmonic Minor** - Minor scale with natural 7th (1-2-♭3-4-5-♭6-7) - Available in 3NPS mode only
- **Melodic Minor** - Minor scale with natural 6th and 7th (1-2-♭3-4-5-6-7) - Available in 3NPS mode only
- **Minor Pentatonic** (5 boxes) with authentic note patterns
- **Minor Hexatonic** (Minor Pentatonic + 2nd degree)
- **Multiple Viewing Modes**:
  - **CAGED System** - 5 chord shapes with triad chord tones highlighted over pentatonic patterns
  - **Pentatonic Boxes** - 5 classic pentatonic positions
  - **3 Notes Per String (3NPS)** - 7 modal positions (Ionian through Locrian) + Harmonic/Melodic Minor
  - **Hexatonic Boxes** - 5 pentatonic boxes with added 2nd degree
  - **Full Neck View** - All notes in the scale across the entire fretboard (works with all scale types)

### 🎯 **Smart Controls**
- **12 Musical Keys** with enharmonic equivalents (C, C#/Db, D, etc.)
- **Smart Notation Toggle** - Automatically converts between sharps and flats
- **Note Names vs Scale Degrees** - Switch between absolute and relative notation
- **Real-time Key Display** - Shows current key and relative major/minor
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### 🎨 **Enhanced UI/UX**
- **Scale Formulas** - Shows interval patterns (1-2-♭3-4-5-♭6-♭7) for each mode
- **Complete Note Display** - All scale notes shown with root note highlighting
- **Compact Desktop Layout** - Efficient use of screen space with comprehensive information
- **Mobile-First Design** - Touch-optimized controls and full-width fretboard
- **Visual Feedback** - Hover effects and smooth transitions throughout
- **Professional Styling** - Modern dark theme with emerald accent colors

### 🔧 **CAGED System Features**
- **5 Classic Chord Shapes** - E, D, C, A, G positions
- **Triad Chord Tones** - Root, 3rd, 5th highlighted within pentatonic patterns
- **Visual Distinction** - Clear separation between chord tones and scale tones
- **Chord-Scale Relationships** - Perfect for understanding how chords and scales connect

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/engageintellect/scale-ninja.git
   cd scale-ninja
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select a Key**: Choose from all 12 musical keys with enharmonic equivalents
2. **Choose a Scale**: 
   - Major and Minor scales (available in all modes)
   - Harmonic Minor and Melodic Minor (3NPS mode only)
3. **Select View Mode**:
   - 3NPS: Shows 3-notes-per-string patterns (7 positions) + supports all scale types
   - Full Neck: Displays all notes in the scale across the entire fretboard
   - Pentatonic: Shows 5 pentatonic box positions (Major/Minor only)
   - Hexatonic: Shows pentatonic boxes with added 2nd degree (Major/Minor only)
4. **Customize Display**:
   - Toggle between note names and scale degrees
   - Switch between sharp (#) and flat (♭) notation

## Architecture

The application is built with a modular component architecture for maintainability and reusability:

- **Components**:
  - `Header` - Application title and branding
  - `ControlPanel` - Interactive controls for key, scale, mode, and notation selection
  - `KeyDisplay` - Real-time display of current key, relative key, and mode context
  - `Fretboard` - Dynamic SVG fretboard with responsive note bubble rendering
  - `Field` - Reusable form field wrapper component

- **Core Logic**:
  - `ScaleEngine` - Scale generation algorithms for all modes (3NPS, pentatonic, hexatonic, full neck)
  - `types` - TypeScript definitions and musical constants

## Technology Stack

- [Next.js 15](https://nextjs.org/) - React framework with App Router and Turbopack
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [React 19](https://reactjs.org/) - UI library
- [Iconify](https://iconify.design/) - Comprehensive icon library
- SVG - Scalable vector graphics for fretboard rendering
- [Vercel](https://vercel.com/) - Deployment platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by various guitar scale visualization tools and music theory resources
- Built with the help of the amazing open-source community

---

Developed with ❤️ by [@engageintellect](https://github.com/engageintellect)
You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
