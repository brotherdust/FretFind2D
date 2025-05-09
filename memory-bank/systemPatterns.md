# System Patterns: FretFind2D

## Architecture Overview

FretFind2D is structured as a pure client-side JavaScript application with a modular design that separates concerns between:

1. **Core Geometric Primitives** - Basic building blocks for spatial calculations
2. **Fretboard Modeling** - Mathematical models for fretboard construction
3. **Scale Systems** - Mathematical interpretation of musical scales
4. **Rendering Systems** - Visual representation and export systems
5. **UI Layer** - User interface and interaction components

The application uses a functional approach with a central "ff" object that contains most functionality, using the Module pattern for namespacing.

## Key Components

### Geometric Primitives
- `Point`: Represents a 2D point with x,y coordinates
- `Segment`: Represents a line segment between two points
- `Scale`: Represents a musical scale with steps and ratios

These primitives include comprehensive methods for:
- Geometric calculations (distance, midpoint, intersection)
- Transformations (translation, scaling)
- Utility functions (toString, copy)

### Fretboard Model
Core classes and functions:
- `fretGuitar`: Main function that calculates all fretboard geometry from parameters
- `getExtents`: Calculates the bounding box of all fretboard elements
- `getGuitar`: Creates the basic guitar object from user input parameters

### Output Systems
Multiple rendering systems for different output formats:
- SVG generation via `getSVG`
- PDF generation via `getPDF` and `getPDFMultipage`
- DXF generation via `getDXF`
- HTML table generation via `getTable` and `getHTML`
- CSV export via `getCSV`
- TAB delimited output via `getTAB`

### Interactive Visualization
- Real-time rendering using Raphael.js
- `drawGuitar`: Main function for displaying fretboard in browser

## Data Flow Patterns

### 1. Configuration Flow
```
User Input → Form Values → Parameter Object → Guitar Object → Fretted Guitar → Visualization/Output
```

### 2. Scale Calculation Flow
```
Scale Definition (ET or Scala) → Scale Object → Ratio Calculations → Fret Positions
```

### 3. Rendering Flow
```
Guitar Object → Calculate Extents → Transform to Output Format → Generate Output File
```

### 4. User Interaction Flow
```
UI Event → Update Parameters → Recalculate Fretboard → Update Visualization → Update Data Tables
```

## Design Patterns Used

### Module Pattern
The core functionality is encapsulated in the `ff` namespace, created using an IIFE (Immediately Invoked Function Expression) to avoid polluting the global namespace.

### Factory Pattern
Functions like `etScale`, `scalaScale`, and `fretGuitar` act as factories that create and return complex objects.

### Observer Pattern
The UI uses event listeners to update the model and view when user input changes.

### Builder Pattern
Guitar objects are built step by step through parameter collection and processing.

## Critical Implementation Paths

### Fretboard Calculation
1. Convert user inputs to a guitar object with string positions
2. Calculate fret positions based on scale system
3. Generate partial frets across the fretboard
4. Calculate meta information like string widths, angles, etc.

### Scale Interpretation
1. Process scale definition (either ET or Scala format)
2. Create normalized scale ratios
3. Apply scale steps to calculate fret positions

### Visual Rendering
1. Calculate bounding box and scaling
2. Generate string, fret, and edge line segments
3. Apply display options (show/hide elements)
4. Render to SVG or export formats

### URL Parameter Handling
1. Serialize form values to URL parameters
2. Parse URL parameters on load
3. Restore form state from parameters
4. Trigger recalculation and redraw

## Interface Relationships

### User Input ↔ Model
Form values are translated into a comprehensive model through parameter parsing functions like `getInt`, `getFlt`, and `getAlt`.

### Model ↔ View
The model is rendered to both visual (SVG/canvas) and data (tables) views through dedicated render functions.

### View ↔ User
Interactive elements provide immediate feedback as users adjust parameters, with real-time updates to visualization.
