# System Patterns: FretFind2D

## Architecture Overview

FretFind2D is structured as a pure client-side JavaScript application. The JavaScript codebase has been refactored (May 2025) into a more granular modular structure, enhancing separation of concerns:

1.  **Setup (`ff_setup.js`)**: Initializes the `ff` namespace and provides core utilities (e.g., `precision`, `roundFloat`, `strip`).
2.  **Core Logic (`src/core/`)**:
    *   `geometry.js`: Defines `Point` and `Segment` classes for 2D geometric calculations.
    *   `scale.js`: Defines the `Scale` class and scale calculation functions (`etScale`, `scalaScale`).
    *   `fretboardCalculator.js`: Contains the main `fretGuitar` logic for fretboard construction and `getExtents` for bounding box calculation.
3.  **Output Generation (`src/output/`)**:
    *   `svgOutput.js`: Handles SVG drawing (`drawGuitar`) for in-browser visualization and SVG export (`getSVG`).
    *   `pdfOutput.js`: Manages PDF export functions (`getPDF`, `getPDFMultipage`).
    *   `dxfOutput.js`: Responsible for DXF export (`getDXF`).
    *   `textOutput.js`: Generates HTML table (`getTable`, `getHTML`), CSV (`getCSV`), and TAB (`getTAB`) outputs.
4.  **UI Layer (`src/ui/`)**:
    *   `domHelpers.js`: Provides functions for DOM interaction, getting/setting form values, and initializing UI components (e.g., `getFlt`, `setTuning`, `initHelp`, `updateWidthFromSpacing`).
    *   `main.js`: Orchestrates the main UI logic, including event handling (`DOMContentLoaded`, `onChange`), data gathering from forms (`getGuitar`, `getDisplayOptions`), URL parameter processing (`getLink`, `updateFormFromHash`), and coordinating updates between the model and view.

The application uses a functional approach with a central `ff` object (namespace) that encapsulates most functionality. Each module is wrapped in an IIFE to extend the `ff` namespace.

## Key Components (Detailed by Module)

### `ff_setup.js`
- Initializes `ff` namespace.
- Core utilities: `precision`, `getPrecision`, `setPrecision`, `roundFloat`, `strip`.

### `core/geometry.js`
- `ff.Point`: Represents a 2D point (x,y) with methods for translation, copying, equality testing, midpoint calculation.
- `ff.Segment`: Represents a line segment with methods for delta calculations, slope, intercept, distance, angle, length, point along segment, intersection, translation, equality, SVG path generation.

### `core/scale.js`
- `ff.Scale`: Represents a musical scale with steps, title, and error handling. Methods: `addError`, `addStep`.
- `ff.etScale`: Factory for equal temperament scales.
- `ff.scalaScale`: Factory for scales from Scala (.scl) format.

### `core/fretboardCalculator.js`
- `ff.fretGuitar`: Main function to calculate all fretboard geometry (frets, meta lines, etc.) from a `guitar` object.
- `ff.getExtents`: Calculates the bounding box of all fretboard elements.

### `output/svgOutput.js`
- `ff.drawGuitar`: Renders the fretboard to an SVG surface in the browser using SVG.js.
- `ff.getSVG`: Generates an SVG file string for export.

### `output/pdfOutput.js`
- `ff.getPDF`: Generates a single-page PDF output using jsPDF.
- `ff.getPDFMultipage`: Generates a multi-page PDF output using jsPDF.

### `output/dxfOutput.js`
- `ff.getDXF`: Generates a DXF file string for CAD applications.

### `output/textOutput.js`
- `ff.getTable`: Generates an HTML string for the data tables.
- `ff.getHTML`: Generates a full HTML document containing the data tables.
- `ff.getDelimited`: Core function for generating delimited text.
- `ff.getCSV`: Generates CSV output.
- `ff.getTAB`: Generates TAB-separated output.

### `ui/domHelpers.js`
- Form input getters: `getAlt`, `getStr`, `getFlt`, `getInt` (from `ff_setup`), `getTuning`, `getLengths`, `getGauges`.
- Dynamic form element setters: `setTuning`, `setLengths`, `setGauges`.
- UI initializers: `initHelp`, `initAlternatives`.
- Width/spacing converters: `updateWidthFromSpacing`, `updateSpacingFromWidth`.

### `ui/main.js`
- `getGuitar` (UI specific): Collects all form values and constructs the initial `guitar` object.
- `getDisplayOptions` (UI specific): Gets display checkbox states.
- `getLink`: Generates a shareable URL with current design parameters.
- `updateFormFromHash`: Parses URL hash and updates form inputs.
- `onChange`: Central callback for form changes; triggers recalculation and redraw.
- `DOMContentLoaded` listener: Initializes the application, sets up event listeners, and performs initial draw.
- `computeOffsets`: Local utility for string spacing calculations (used by `getGuitar`).
- Manages `drawSurface` (SVG.js instance) and `processChanges` flag.
- Handles download button setup and file generation via FileSaver.js.

## Data Flow Patterns

Unchanged from previous state, but now clearer where each step resides:

### 1. Configuration Flow
```
User Input (ui/main.js) → Form Values (ui/domHelpers.js, ui/main.js) → Parameter Object (ui/main.js getGuitar) → Guitar Object (ui/main.js getGuitar) → Fretted Guitar (core/fretboardCalculator.js ff.fretGuitar) → Visualization/Output (output/*.js, ui/main.js onChange)
```

### 2. Scale Calculation Flow
```
Scale Definition (ui/domHelpers.js getStr, ui/main.js getGuitar) → Scale Object (core/scale.js ff.etScale/ff.scalaScale) → Ratio Calculations (core/fretboardCalculator.js ff.fretGuitar) → Fret Positions (core/fretboardCalculator.js ff.fretGuitar)
```

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
- Real-time rendering using SVG.js
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
