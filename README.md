# FretFind2D

FretFind2D is a fretboard designer for microtonal and multi-scaled stringed instruments.

## Using Online

The [latest version of FretFind2D](https://brotherdust.github.io/FretFind2D/src/fretfind.html) is available for your use online. 

## Using Offline

Because FretFind2D does everything right in your browser, you can also download it to your computer for offline use. Please note, however, that FretFind2D will only be able to generate files if it is accessed through a web server. Thankfully there are a number of relatively easy ways to serve FretFind2D locally.

If you use the Chrome browser, I would recommend the [Web Server for Chrome extension](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en). Users of other browsers can follow these [instructions for setting up a local server with Python](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) from the Mozilla Developer Network.

# Roadmap

As of May 2025, this app is now under active development.

The roadmap below is not exhaustive, just stuff I can think of right now that I want to fix, change or add. It's subject to change.

See 'memory-bank/progress.md' for more detail

## Short Term: Technical Debt & Core UX Improvements
Based on "Next Development Priorities" in `memory-bank/progress.md`.

- [x] Implement AI-assisted coding to speed development (Completed)
- [ ] **Technical Modernization:**
    - [ ] Migrate core dependencies:
        - [ ] Migrate from Raphael.js (no longer maintained) to a modern SVG library (e.g., SVG.js)
        - [ ] Update jQuery to the latest version (currently on 1.4.2, needs update)
        - [ ] Update other outdated dependencies
    - [ ] Refactor code to use modern JavaScript patterns
- [ ] **User Experience (UI/UX) Enhancements:**
    - [ ] Modernize the user interface and implement responsive design for better mobile/tablet usability
    - [ ] Improve overall visual appeal and ease of understanding for the fretboard visualization
    - [ ] Streamline parameter input, especially for common use cases
    - [ ] Support fractional inches for input and output
    - [ ] Implement a precision setting to control the number of decimal places in measurements
    - [ ] Make data tables more usable (e.g., initially hidden, searchable, sortable)
- [ ] Add a library of preset designs for popular instrument types

## Medium Term: Feature Enhancements & Stability
Further items from "Potential Enhancements" and "Next Development Priorities" in `memory-bank/progress.md`.

- [ ] Finalize and stabilize the "individual string scaling" feature (currently experimental)
- [ ] Implement undo/redo functionality for design changes
- [ ] Add more comprehensive parameter validation
- [ ] Explore additional temperament and scale options
- [ ] Implement a basic sound preview feature based on design parameters
- [ ] Consider additional visualization options (e.g., simplified 3D view, instrument body preview)

## Long Term: Advanced Functionality & Project Evolution
Ambitious features for future consideration.

- [ ] Implement a generic string tension calculator
- [ ] Develop vendor-specific string tension libraries (potentially pulling from public datasheets)
- [ ] Create offline tooling to normalize and ingest string vendor data
- [ ] Implement vendor-aware string tension modeling
- [ ] Build a "best-fit" solver to recommend string gauges based on target tension or feel
- [ ] Evaluate renaming the project if functionality significantly expands beyond fretboard design
