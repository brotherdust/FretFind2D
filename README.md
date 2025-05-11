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
## Short Term

- [x] Implement AI-assisted coding to speed development
- [x] Migrate to latest jQuery
- [ ] Migrate from Raphael (no longer maintained) to SVG.js
- [ ] Migrate other dependencies
- [ ] Optimize UI/UX (more detail on this later)

    - [ ] Make the visualization prettier and easier to understand
    - [ ] Support fractional inches input and output
    - [ ] Implement precision setting to reduce length of measurement numbers)
    - [ ] Implement more usable tables: they shouldn't be visible by default, and should be searchable

## Long Term

- [ ] Implement a generic string tension calculator
- [ ] Rename project to something that more accurately reflects new functions
- [ ] Implement vendor-specific string tension libraries pulling from publicly available datasheets
- [ ] Implement offline tooling to normalize and ingest vendor data
- [ ] Implement vendor-aware string tension modeling
- [ ] Implement best-fit solver to make recommendations of string gauges, given a target per-string tension or feel
