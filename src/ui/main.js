/*
    Copyright (C) 2004, 2005, 2010, 2024 Aaron C Spike
    (This code was previously in fretfind_ui.js)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Depends on ff_setup.js for ff namespace and ff.getInt, ff.getFlt, ff.getStr, ff.getPrecision
// Depends on domHelpers.js for ff.getAlt, ff.getTuning, ff.getLengths, ff.getGauges, ff.setTuning, ff.setLengths, ff.setGauges,
// ff.initHelp, ff.initAlternatives, ff.updateWidthFromSpacing, ff.updateSpacingFromWidth
// Depends on core/scale.js for ff.etScale, ff.scalaScale
// Depends on core/fretboardCalculator.js for ff.fretGuitar
// Depends on output/svgOutput.js for ff.drawGuitar, ff.getSVG
// Depends on output/textOutput.js for ff.getTable, ff.getCSV, ff.getHTML, ff.getTAB
// Depends on output/pdfOutput.js for ff.getPDF, ff.getPDFMultipage
// Depends on output/dxfOutput.js for ff.getDXF
// Assumes SVG.js, FileSaver.js are available globally.

(function(ff) {
    'use strict';

    function computeOffsets(strings, gauges, actual_length, perp_width, spacingMode) {
        var offsets = [0]; 
        if (strings <= 1) return offsets;

        const corrected_gauges = spacingMode === 'proportional' ? gauges.map(g => isNaN(g) ? 0 : g) : new Array(strings).fill(0);
        
        const totalGaugeThickness = corrected_gauges.reduce((tot, cur) => tot + cur, 0);
        
        let working_area;
        if (spacingMode === 'proportional') {
             working_area = perp_width - totalGaugeThickness;
        } else { // 'equal'
             working_area = perp_width;
        }
        
        // Avoid division by zero if strings <= 1 (already handled) or working_area is negative (e.g. gauges > perp_width)
        if (strings -1 <= 0 || working_area < 0) { 
            // Fill remaining offsets if any, perhaps with 0 or an error indicator, 
            // for now, just return what we have, or fill with 0s.
            for (let i = 1; i < strings; i++) offsets.push(offsets[i-1]); // or push 0s
            return offsets;
        }

        const gap_unit = working_area / (strings - 1);

        for (var i = 1; i < strings; i++) {
            let next_space_center_to_center;
            if (spacingMode === 'proportional') {
                const g_prev = corrected_gauges[i-1];
                const g_curr = corrected_gauges[i];
                next_space_center_to_center = (g_prev / 2.0) + gap_unit + (g_curr / 2.0);
            } else { 
                next_space_center_to_center = gap_unit;
            }
            // The offset is along the nut/bridge line.
            // Avoid NaN if actual_length or perp_width is zero
            const scaleFactor = (perp_width !== 0) ? actual_length / perp_width : 1;
            offsets.push(offsets[i - 1] + (next_space_center_to_center * scaleFactor));
        }
        return offsets;
    }

    var getDisplayOptions = function() {
        return {
            showStrings: document.getElementById("showStrings").checked,
            showFretboardEdges: document.getElementById("showFretboardEdges").checked,
            showMetas: document.getElementById("showMetas").checked,
            showBoundingBox: document.getElementById("showBoundingBox").checked,
            extendFrets: document.getElementById("extendFrets").checked
        };
    };

    var getGuitar = function() {
        var lengthMode = ff.getAlt('length'); // ID of the alternative container
        var spacingMode = ff.getAlt('spacing');
        var scaleMode = ff.getAlt('scale');
        var overhangMode = ff.getAlt('overhang');

        var scaleLength = 0, scaleLengthF = 0, scaleLengthL = 0, perp = 0;
        if (lengthMode === 'single') {
            scaleLength = ff.getFlt('len');
        } else if (lengthMode === 'multiple') {
            scaleLengthF = ff.getFlt('lenF');
            scaleLengthL = ff.getFlt('lenL');
            perp = ff.getFlt('pDist');
        } else if (lengthMode === 'individual') {
            // Handled below with lengths array
            perp = ff.getFlt('ipDist');
        }
        
        var nutWidth = ff.getFlt('nutWidth');
        var bridgeWidth = ff.getFlt('bridgeWidth');
        var strings = ff.getInt('numStrings');
        var unitsElement = document.querySelector("input[name='units']:checked");
        var units = unitsElement ? unitsElement.value : 'in';

        var gauges = (spacingMode === 'proportional') ? ff.getGauges('igauges') : new Array(strings || 0).fill(0);
        var lengths = (lengthMode === 'individual') ? ff.getLengths('ilengths') : new Array(strings || 0).fill(0);

        if (lengthMode === 'individual' && lengths.length > 0) {
            scaleLengthF = lengths[0]; // First string
            scaleLengthL = lengths[lengths.length - 1]; // Last string
        } else if (lengthMode === 'single') {
             scaleLengthF = scaleLength;
             scaleLengthL = scaleLength;
        }
        // If multiple, scaleLengthF and scaleLengthL are already set

        var frets = ff.getInt('numFrets');
        var tuning = ff.getTuning('tuning');
        var oNF=0, oNL=0, oBF=0, oBL=0;

        switch (overhangMode) {
            case 'equal':
                oNF = oNL = oBF = oBL = ff.getFlt('oE');
                break;
            case 'nutbridge':
                oNF = oNL = ff.getFlt('oN');
                oBF = oBL = ff.getFlt('oB');
                break;
            case 'firstlast':
                oNF = oBF = ff.getFlt('oF');
                oBL = oNL = ff.getFlt('oL');
                break;
            case 'all':
                oNF = ff.getFlt('oNF');
                oBF = ff.getFlt('oBF');
                oNL = ff.getFlt('oNL');
                oBL = ff.getFlt('oBF'); // Corrected from oBF to oBL for the last assignment from previous code state
                oBL = ff.getFlt('oBL'); // Corrected: was oBF, should be oBL
                break;
            default: 
                 oNF = oNL = oBF = oBL = ff.getFlt('oE') || 0;
                 break;
        }
        var scale;
        if (scaleMode === 'et') {
            var tones = ff.getFlt('root');
            scale = ff.etScale(tones, 2);
        } else { // 'scala'
            var scalaText = ff.getStr('scl');
            scale = ff.scalaScale(scalaText);
        }

        var nutHalf = nutWidth / 2.0;
        var bridgeHalf = bridgeWidth / 2.0;
        
        // Determine overall width for centering calculations
        // This logic determines the maximum extent to one side (e.g. right) considering overhangs
        var nutMaxExtent = nutHalf + Math.max(oNF, oNL); // Max extent from center at nut
        var bridgeMaxExtent = bridgeHalf + Math.max(oBF, oBL); // Max extent from center at bridge
        var xcenter = Math.max(nutMaxExtent, bridgeMaxExtent); // This 'xcenter' is more like a max_half_width_for_centering

        // These are absolute X coordinates assuming the fretboard's centerline is at xcenter
        var fbnxf = xcenter + nutHalf + oNF; // Fretboard Nut X First string side
        var fbbxf = xcenter + bridgeHalf + oBF; // Fretboard Bridge X First string side
        var fbnxl = xcenter - (nutHalf + oNL); // Fretboard Nut X Last string side
        var fbbxl = xcenter - (bridgeHalf + oBL); // Fretboard Bridge X Last string side

        // String anchor points X coordinates
        var snxf = xcenter + nutHalf;   // String Nut X First
        var sbxf = xcenter + bridgeHalf;  // String Bridge X First
        var snxl = xcenter - nutHalf;   // String Nut X Last
        var sbxl = xcenter - bridgeHalf;  // String Bridge X Last

        var fdeltax = sbxf - snxf;
        var ldeltax = sbxl - snxl;
        var fdeltay, ldeltay;

        if (lengthMode === 'single') {
            fdeltay = ldeltay = scaleLength;
        } else { // 'multiple' or 'individual'
            fdeltay = Math.sqrt(Math.max(0, (scaleLengthF * scaleLengthF) - (fdeltax * fdeltax)));
            ldeltay = Math.sqrt(Math.max(0, (scaleLengthL * scaleLengthL) - (ldeltax * ldeltax)));
        }
        
        var first = new ff.Segment(new ff.Point(snxf, 0), new ff.Point(sbxf, fdeltay));
        var last = new ff.Segment(new ff.Point(snxl, 0), new ff.Point(sbxl, ldeltay));
        
        var perp_y_offset = 0; // This will be the Y value of the perpendicular line after adjustments
        if (lengthMode === 'multiple' || lengthMode === 'individual') {
            var f_perp_y_at_ratio = perp * fdeltay; // y-coord on first string at perp ratio
            var l_perp_y_at_ratio = perp * ldeltay; // y-coord on last string at perp ratio
            
            // Adjust so the perpendicular line is horizontal
            if (fdeltay <= ldeltay) { // last string is longer or equal at perp point
                first.translate(0, (l_perp_y_at_ratio - f_perp_y_at_ratio));
                perp_y_offset = l_perp_y_at_ratio;
            } else { // first string is longer at perp point
                last.translate(0, (f_perp_y_at_ratio - l_perp_y_at_ratio));
                perp_y_offset = f_perp_y_at_ratio;
            }
        }

        var nut = new ff.Segment(first.end1.copy(), last.end1.copy());
        var bridge = new ff.Segment(first.end2.copy(), last.end2.copy());
        
        // Recalculate overhangs as absolute distances along the (potentially angled) nut/bridge
        // This part was problematic in original; overhang should be perpendicular to centerline ideally.
        // Sticking to original logic for now, which scales it by nut/bridge length vs width.
        var oNFactor = (nutWidth > 0) ? nut.length() / nutWidth : 0;
        var oBFactor = (bridgeWidth > 0) ? bridge.length() / bridgeWidth : 0;

        var abs_oNF = oNF * ((lengthMode === 'multiple' || lengthMode === 'individual') ? oNFactor : 1);
        var abs_oNL = oNL * ((lengthMode === 'multiple' || lengthMode === 'individual') ? oNFactor : 1);
        var abs_oBF = oBF * ((lengthMode === 'multiple' || lengthMode === 'individual') ? oBFactor : 1);
        var abs_oBL = oBL * ((lengthMode === 'multiple' || lengthMode === 'individual') ? oBFactor : 1);

        var fbf = new ff.Segment(nut.pointAt(-abs_oNF), bridge.pointAt(-abs_oBF));
        var fbl = new ff.Segment(nut.pointAt(nut.length() + abs_oNL), bridge.pointAt(bridge.length() + abs_oBL));

        // Ensure lowest y-coordinate is 0 (or slightly above for margin)
        var minY = Math.min(fbf.end1.y, fbl.end1.y, first.end1.y, last.end1.y);
        if (minY < 0) {
            var moveUp = -minY;
            first.translate(0, moveUp);
            last.translate(0, moveUp);
            nut.translate(0, moveUp);
            bridge.translate(0, moveUp);
            fbf.translate(0, moveUp);
            fbl.translate(0, moveUp);
            perp_y_offset += moveUp; // Adjust perp_y_offset if everything moved
        }

        var nutOffsets = computeOffsets(strings, gauges, nut.length(), nutWidth, spacingMode);
        var bridgeOffsets = computeOffsets(strings, gauges, bridge.length(), bridgeWidth, spacingMode);

        var lines = [];
        if (strings > 0) lines.push(first);

        for (var i = 1; i < strings - 1; i++) { // Iterate for intermediate strings
            var n_pt = nut.pointAt(nutOffsets[i]);
            var b_pt = bridge.pointAt(bridgeOffsets[i]);

            if (lengthMode === 'individual') {
                var current_L = lengths[i] || 0; // Fallback to 0 if undefined
                var current_deltax = Math.abs(n_pt.x - b_pt.x);
                var current_deltay = Math.sqrt(Math.max(0, (current_L * current_L) - (current_deltax * current_deltax)));
                
                n_pt = new ff.Point(n_pt.x, 0); // Reset Y for this string's own calculation
                b_pt = new ff.Point(b_pt.x, current_deltay);
                
                var current_string_perp_y_at_ratio = perp * current_deltay;
                var y_translation_for_this_string = perp_y_offset - current_string_perp_y_at_ratio;
                
                n_pt.translate(0, y_translation_for_this_string);
                b_pt.translate(0, y_translation_for_this_string);
            }
            lines.push(new ff.Segment(n_pt, b_pt));
        }
        if (strings > 1) lines.push(last);


        return {
            scale: scale,
            tuning: tuning,
            strings: lines,
            edge1: fbf,
            edge2: fbl,
            center: xcenter, // This is the calculated center based on max overhangs
            fret_count: frets,
            units: units
        };
    };

    var getLink = function() {
        var params = {};
        // Query all relevant input elements within the worksheet section
        document.getElementById('worksheet').querySelectorAll('input[id][type="text"], input[id][type="checkbox"]:checked, input[id][type="radio"]:checked, textarea[id]').forEach(item => {
             if (item.type === 'checkbox') {
                params[item.id] = item.checked ? "true" : "false"; // Or just item.checked.toString()
            } else if (item.type === 'radio') {
                if (item.checked) params[item.name] = item.value;
            }
            else if (item.value !== "" || item.type === 'textarea') { // Keep textarea even if empty for scl
                params[item.id] = item.value;
            }
        });
        
        // Handle specific cases not covered by the general selector, or that need special formatting
        params.t = ff.getTuning('tuning').join(','); // Assuming getTuning returns an array
        params.il = ff.getLengths('ilengths').join(',');
        params.ig = ff.getGauges('igauges').join(',');

        const unitsElement = document.querySelector("input[name='units']:checked");
        params.u = unitsElement ? unitsElement.value : 'in';

        params.sl = ff.getAlt('length');
        params.ns = ff.getAlt('spacing');
        params.scale = ff.getAlt('scale');
        params.o = ff.getAlt('overhang');
        
        // Remove empty params to keep URL clean
        for (const key in params) {
            if (params[key] === "" || params[key] === null || (Array.isArray(params[key]) && params[key].length === 0)) {
                delete params[key];
            }
        }

        var baseLocation = window.location.href.split('#')[0];
        return baseLocation + '#' + new URLSearchParams(params).toString();
    };

    var drawSurface;
    var processChanges = false; // Flag to prevent processing during initial setup
    var onChange = function() {
        if (!processChanges) return;

        var guitar = getGuitar();
        guitar = ff.fretGuitar(guitar); 
        
        if (drawSurface) { // Ensure drawSurface is initialized
             ff.drawGuitar(drawSurface, guitar, getDisplayOptions());
        }
        
        var tablesElement = document.getElementById('tables');
        if (tablesElement) tablesElement.innerHTML = ff.getTable(guitar);
        
        var bookmarkElement = document.getElementById('bookmark');
        if (bookmarkElement) bookmarkElement.href = getLink();
    };

    var updateFormFromHash = function() {
        processChanges = false; // Don't trigger onChange during hash processing
        const hash = window.location.hash.substring(1);
        if (!hash) {
            processChanges = true; // Re-enable changes if no hash
            return; 
        }

        const urlParams = new URLSearchParams(hash);

        // Set values for simple inputs and textareas
        urlParams.forEach((value, key) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = (value === "true");
                } else if (element.type === 'radio') {
                    //This is handled by name attribute later
                }
                else {
                    element.value = value;
                }
            }
        });
        
        // Handle radio buttons (like units)
        const unitValue = urlParams.get('u') || 'in';
        const unitRadio = document.querySelector(`input[name="units"][value="${unitValue}"]`);
        if (unitRadio) unitRadio.checked = true;

        // Handle alternative tabs
        const altParams = { sl: 'length', ns: 'spacing', scale: 'scale', o: 'overhang' };
        for (const paramKey in altParams) {
            const tabId = urlParams.get(paramKey);
            if (tabId) {
                const tabButton = document.getElementById(tabId);
                if (tabButton && tabButton.classList.contains('tab-button')) {
                    tabButton.click(); // Simulate click to activate tab
                }
            }
        }

        // Handle dynamically generated fields (tuning, lengths, gauges)
        // Ensure numStrings is set first if it's in the hash, as setFunctions depend on it.
        if (urlParams.has('numStrings')) {
            document.getElementById('numStrings').value = urlParams.get('numStrings');
        }

        const p_il = urlParams.has('il') ? urlParams.get('il').split(',').map(Number) : [];
        const p_ig = urlParams.has('ig') ? urlParams.get('ig').split(',').map(Number) : [];
        const p_t = urlParams.has('t') ? urlParams.get('t').split(',').map(Number) : [];

        ff.setLengths('ilengths', 'numStrings', onChange, p_il);
        ff.setGauges('igauges', 'numStrings', onChange, p_ig);
        ff.setTuning('tuning', 'numStrings', onChange, p_t);
        
        // Handle width/spacing fields after numStrings and potentially other values are set
        const numStringsVal = ff.getInt('numStrings'); // Get potentially updated numStrings

        if (urlParams.has('nutStringSpacing')) {
             document.getElementById('nutStringSpacing').value = urlParams.get('nutStringSpacing');
        }
        if (urlParams.has('nutWidth')) { // If nutWidth is also in hash, it takes precedence for calculation trigger
            document.getElementById('nutWidth').value = urlParams.get('nutWidth');
            if (numStringsVal >= 2) ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
        } else if (urlParams.has('nutStringSpacing') && numStringsVal >=2) {
            if (numStringsVal >= 2) ff.updateWidthFromSpacing('nutStringSpacing', 'nutWidth', 'numStrings');
        }


        if (urlParams.has('bridgeStringSpacing')) {
             document.getElementById('bridgeStringSpacing').value = urlParams.get('bridgeStringSpacing');
        }
        if (urlParams.has('bridgeWidth')) {
            document.getElementById('bridgeWidth').value = urlParams.get('bridgeWidth');
            if (numStringsVal >= 2) ff.updateSpacingFromWidth('bridgeWidth', 'bridgeStringSpacing', 'numStrings');
        } else if (urlParams.has('bridgeStringSpacing') && numStringsVal >=2) {
             if (numStringsVal >= 2) ff.updateWidthFromSpacing('bridgeStringSpacing', 'bridgeWidth', 'numStrings');
        }
        
        processChanges = true; // Re-enable changes after hash processing
        onChange(); // Trigger a final update based on loaded hash values
    };

    document.addEventListener('DOMContentLoaded', function() {
        ff.initHelp('worksheet'); // Pass the ID of the container for help elements
        ff.initAlternatives('worksheet', onChange); // Pass the ID of the main form/container

        // Handle custom radio button interactions for "Units"
        const customRadioButtons = document.querySelectorAll('div[role="radiogroup"][aria-labelledby="units-label"] button[role="radio"]');
        const hiddenRadioInputs = document.querySelectorAll('input[name="units"].sr-only');

        customRadioButtons.forEach(button => {
            button.addEventListener('click', function() {
                const clickedValue = this.getAttribute('data-value');
                let newlyCheckedInput = null;

                hiddenRadioInputs.forEach(input => {
                    input.checked = (input.value === clickedValue);
                    if (input.checked) {
                        newlyCheckedInput = input;
                    }
                });

                customRadioButtons.forEach(btn => {
                    const isChecked = (btn.getAttribute('data-value') === clickedValue);
                    btn.setAttribute('aria-checked', isChecked ? 'true' : 'false');
                    const indicatorSpan = btn.querySelector('span');
                    if (indicatorSpan) {
                        indicatorSpan.setAttribute('data-state', isChecked ? 'checked' : 'unchecked');
                        if (isChecked) {
                            indicatorSpan.classList.add('bg-primary');
                        } else {
                            indicatorSpan.classList.remove('bg-primary');
                        }
                    }
                });

                if (newlyCheckedInput) {
                    // Dispatch change event on the hidden input to trigger existing listeners
                    newlyCheckedInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
        
        // Sync visual custom radio buttons when value is set from hash (after hidden inputs are updated)
        const originalUpdateFormFromHash = updateFormFromHash; // Keep a reference if needed, or integrate directly
        // For now, we assume updateFormFromHash sets the .checked on hidden inputs correctly.
        // We need to ensure the visual state reflects this after updateFormFromHash runs.
        // This can be done by calling a sync function or by having updateFormFromHash trigger the 'change' on the hidden input.
        // The current updateFormFromHash already sets .checked on hidden input.
        // The 'change' event dispatched by custom radio logic will call onChange, which is what we want.
        // When updateFormFromHash sets a radio, we need to ensure its visual part updates too.
        // We can modify updateFormFromHash or add a specific call here.
        // Let's add a small utility to sync visual state of radios from hidden inputs.
        const syncCustomRadiosVisual = () => {
            hiddenRadioInputs.forEach(input => {
                customRadioButtons.forEach(btn => {
                    if (btn.getAttribute('data-value') === input.value) {
                        const isChecked = input.checked;
                        btn.setAttribute('aria-checked', isChecked ? 'true' : 'false');
                        const indicatorSpan = btn.querySelector('span');
                        if (indicatorSpan) {
                            indicatorSpan.setAttribute('data-state', isChecked ? 'checked' : 'unchecked');
                            if (isChecked) {
                                indicatorSpan.classList.add('bg-primary');
                            } else {
                                indicatorSpan.classList.remove('bg-primary');
                            }
                        }
                    }
                });
            });
        };

        // After updateFormFromHash runs, it should have set the correct hidden input.
        // We'll call sync after it, and also ensure its own logic triggers onChange.
        const oldUpdateFormFromHash = updateFormFromHash;
        window.updateFormFromHash = () => { // Overriding global for simplicity here, or pass sync function
            oldUpdateFormFromHash();
            syncCustomRadiosVisual();
            // Find the currently checked hidden radio and trigger its change event
            // so that onChange() runs if hash changed the radio selection.
            const checkedHiddenRadio = document.querySelector('input[name="units"].sr-only:checked');
            if (checkedHiddenRadio && processChanges) { // only if processChanges is true
                 // dispatchEvent was already good in the click handler.
                 // Here, we just need to ensure onChange is called if hash changed it.
                 // The main onChange will be called at the end of original updateFormFromHash.
            }
        };


        const numStringsElement = document.getElementById('numStrings');
        const nutWidthElement = document.getElementById('nutWidth');
        const bridgeWidthElement = document.getElementById('bridgeWidth');
        const nutStringSpacingElement = document.getElementById('nutStringSpacing');
        const bridgeStringSpacingElement = document.getElementById('bridgeStringSpacing');

        if (numStringsElement) {
            numStringsElement.addEventListener('change', function() { // 'change' is better than 'input' for discrete number changes
                ff.updateWidthFromSpacing('nutStringSpacing', 'nutWidth', 'numStrings');
                ff.updateWidthFromSpacing('bridgeStringSpacing', 'bridgeWidth', 'numStrings');
                ff.setTuning('tuning', 'numStrings', onChange);
                ff.setLengths('ilengths', 'numStrings', onChange);
                ff.setGauges('igauges', 'numStrings', onChange);
                onChange();
            });
        }

        if (nutWidthElement) {
            nutWidthElement.addEventListener('input', function() {
                ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
                onChange();
            });
        }
        if (nutStringSpacingElement) {
            nutStringSpacingElement.addEventListener('input', function() {
                ff.updateWidthFromSpacing('nutStringSpacing', 'nutWidth', 'numStrings');
                onChange();
            });
        }

        if (bridgeWidthElement) {
            bridgeWidthElement.addEventListener('input', function() {
                ff.updateSpacingFromWidth('bridgeWidth', 'bridgeStringSpacing', 'numStrings');
                onChange();
            });
        }
        if (bridgeStringSpacingElement) {
            bridgeStringSpacingElement.addEventListener('input', function() {
                ff.updateWidthFromSpacing('bridgeStringSpacing', 'bridgeWidth', 'numStrings');
                onChange();
            });
        }
        
        // General change listener for other inputs within #worksheet
        // This targets inputs that aren't explicitly handled above or part of dynamic content areas
        document.getElementById('worksheet').querySelectorAll(
            'input[type="radio"], input[type="checkbox"], textarea, input[type="text"]:not(#numStrings):not(#nutWidth):not(#bridgeWidth):not(#nutStringSpacing):not(#bridgeStringSpacing)'
        ).forEach(el => {
             // Exclude inputs within dynamically generated content already handled by setX functions
            if (!el.closest('#tuning') && !el.closest('#ilengths') && !el.closest('#igauges')) {
                 el.addEventListener('change', onChange);
            }
        });
        
        // Initial population of dynamic fields
        ff.setTuning('tuning', 'numStrings', onChange);
        ff.setLengths('ilengths', 'numStrings', onChange);
        ff.setGauges('igauges', 'numStrings', onChange);

        updateFormFromHash(); // This will also call onChange() at the end

        // One final check for width/spacing consistency after hash load, if not explicitly set by hash
        const numStringsValInit = ff.getInt('numStrings');
        if (document.getElementById('nutWidth').value && !document.getElementById('nutStringSpacing').value && numStringsValInit >= 2) {
            ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
        }
        if (document.getElementById('bridgeWidth').value && !document.getElementById('bridgeStringSpacing').value && numStringsValInit >= 2) {
            ff.updateSpacingFromWidth('bridgeWidth', 'bridgeStringSpacing', 'numStrings');
        }


        const diagramElement = document.getElementById('diagram');
        var diagramWidth = diagramElement ? diagramElement.offsetWidth : 600;
        // Ensure diagramHeight is reasonable, especially if window.innerHeight is small.
        var diagramHeight = Math.max(diagramElement ? diagramElement.offsetHeight : 500, window.innerHeight * 0.5, 400);
        if (diagramElement) diagramElement.style.height = diagramHeight + 'px';


        if (typeof SVG !== 'undefined' && diagramElement) {
            // Ensure #diagram is empty before adding SVG to prevent duplicates on hot-reload scenarios
            while (diagramElement.firstChild) {
                diagramElement.removeChild(diagramElement.firstChild);
            }
            drawSurface = SVG().addTo('#diagram').size(diagramWidth, diagramHeight);
        } else {
            console.error("SVG.js library not loaded or #diagram element not found.");
        }
        
        window.addEventListener('resize', function() {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(function() {
                const currentDiagramElement = document.getElementById('diagram');
                if (currentDiagramElement && drawSurface) {
                    var newDiagramHeight = Math.max(currentDiagramElement.offsetHeight, window.innerHeight * 0.5, 400);
                    var newDiagramWidth = currentDiagramElement.offsetWidth;
                    currentDiagramElement.style.height = newDiagramHeight + 'px';
                    drawSurface.size(newDiagramWidth, newDiagramHeight); 
                }
                onChange(); // Redraw on resize
            }, 250);
        });

        if (!processChanges) { // If hash processing didn't enable it and call onChange
            processChanges = true;
            onChange();
        }


        var isFileSaverSupported = false;
        try {
            isFileSaverSupported = !!new Blob();
        } catch (e) {}

        var dlContainer = document.getElementById('downloads'); // Changed from dl to section
        if (isFileSaverSupported && dlContainer) {
            // The previous structure was dt/dd, now it's h2 and divs.
            // Assuming we want to append to the existing #downloads section.
            // Let's create a new dl for the download links for structure.
            let dl = dlContainer.querySelector('dl');
            if (!dl) {
                dl = document.createElement('dl');
                dl.className = "mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"; // Tailwind for list
                // Find the h2 and insert dl after it, or just append if no h2
                const h2 = dlContainer.querySelector('h2');
                if (h2 && h2.nextSibling) {
                    dlContainer.insertBefore(dl, h2.nextSibling);
                } else if (h2) {
                     dlContainer.appendChild(dl);
                } else {
                    dlContainer.prepend(dl); // Or append, depending on desired position
                }
            }


            const downloads = [
                { id: 'dxf', name: 'DXF', type: 'image/vnd.dxf', getter: ff.getDXF },
                {
                    id: 'pdfm', name: 'PDF (multi-page)', type: 'application/pdf', getter: ff.getPDFMultipage,
                    optionsHtml: '<div class="text-sm"><label class="mr-2"><input type="radio" name="pdfm_pagesize" value="letter" checked="checked"/>letter</label>' +
                        '<label class="mr-2"><input type="radio" name="pdfm_pagesize" value="a4" />A4</label>' +
                        '<label><input type="radio" name="pdfm_pagesize" value="legal" />legal</label></div>'
                },
                { id: 'pdf', name: 'PDF (single page)', type: 'application/pdf', getter: ff.getPDF },
                { id: 'svg', name: 'SVG', type: 'image/svg+xml', getter: ff.getSVG },
                { id: 'csv', name: 'CSV', type: 'text/csv', getter: ff.getCSV },
                { id: 'html', name: 'HTML', type: 'text/html', getter: ff.getHTML },
                { id: 'tab', name: 'TAB', type: 'text/tab-separated-values', getter: ff.getTAB }
            ];

            downloads.forEach(d => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'p-2 border rounded bg-muted/50';

                const title = document.createElement('h4');
                title.className = 'font-semibold text-foreground';
                title.textContent = d.name;
                itemContainer.appendChild(title);

                if (d.optionsHtml) {
                    const optionsDiv = document.createElement('div');
                    optionsDiv.className = 'my-1';
                    optionsDiv.innerHTML = d.optionsHtml;
                    itemContainer.appendChild(optionsDiv);
                }

                const button = document.createElement('button');
                button.id = 'download_' + d.id;
                button.textContent = 'Download ' + d.name;
                button.className = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-1'; // Added mt-1 for spacing
                itemContainer.appendChild(button);
                
                dl.appendChild(itemContainer);


                button.addEventListener('click', function() {
                    var guitar = getGuitar();
                    guitar = ff.fretGuitar(guitar);
                    let fileContent;
                    if (d.id === 'pdfm') {
                        const pagesizeElement = document.querySelector("input[name='pdfm_pagesize']:checked");
                        const pagesize = pagesizeElement ? pagesizeElement.value : 'letter';
                        fileContent = d.getter(guitar, getDisplayOptions(), pagesize);
                    } else {
                        fileContent = d.getter(guitar, getDisplayOptions());
                    }
                    if (typeof saveAs !== 'undefined' && fileContent) {
                        var blob = new Blob([fileContent], { type: d.type + ";charset=utf-8" });
                        saveAs(blob, "fretboard." + d.id.replace('pdfm', 'pdf'));
                    } else {
                         console.error("FileSaver.js (saveAs) is not available or file content is empty.");
                    }
                });
            });

        } else if (dlContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'p-2 border rounded bg-destructive text-destructive-foreground';
            errorDiv.innerHTML = '<b>Buttons missing?</b><br/>Downloads require a modern browser that supports <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob#Browser_compatibility" class="underline">the Blob constructor API</a> and FileSaver.js.';
            dlContainer.appendChild(errorDiv);
        }
    });

}(window.ff || (window.ff = {}))); // Ensure ff namespace exists
