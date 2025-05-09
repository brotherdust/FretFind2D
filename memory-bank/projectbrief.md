# Project Brief: FretFind2D

## Overview
FretFind2D is a fretboard designer for stringed instruments, specializing in microtonal and multi-scaled (fan fretted) designs. Unlike traditional fret calculators that only provide positions along a string, FretFind2D models the entire fretboard as a system of line segments on a two-dimensional plane. This approach enables it to design complex fretboards with features like:

- Multiple scale lengths (fan frets)
- Non-parallel frets
- Custom temperaments using just intonation, equal temperament, or custom Scala scales
- Variable string spacing

## Core Use Cases
- Luthiers designing custom stringed instruments
- Musicians exploring microtonal music
- Instrument makers creating multi-scale instruments
- Experimental music technologists

## Key Features
- Visual interactive fretboard designer with real-time updates
- Support for equal temperament scales with adjustable number of tones
- Support for just intonation and custom scales via Scala (.scl) file format
- Output formats: PDF (single and multi-page), DXF, SVG, CSV, HTML, TAB
- Ability to save/share designs via URL parameters
- Various display options including fretboard edges, bounding box, and extended frets
- Adjustable units (inches, cm, mm)
- Flexible options for string spacing, scale lengths, and fretboard overhang

## Technical Requirements
- Browser-based application (pure frontend)
- Works both online and offline (when served locally)
- Mobile-friendly interface
- Standards-compliant output formats

## Constraints
- Must operate entirely client-side (no server requirements)
- Must be compatible with modern browsers
- Must maintain backward compatibility with existing design URLs
- Must adhere to GNU Affero General Public License v3.0
