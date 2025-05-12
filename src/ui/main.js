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

// Depends on ff_setup.js for ff namespace and ff.getInt, ff.getFlt, ff.getStr, ff.getAlt
// Depends on domHelpers.js for ff.getTuning, ff.getLengths, ff.getGauges, ff.setTuning, ff.setLengths, ff.setGauges,
// ff.initHelp, ff.initAlternatives, ff.updateWidthFromSpacing, ff.updateSpacingFromWidth
// Depends on core/scale.js for ff.etScale, ff.scalaScale
// Depends on core/fretboardCalculator.js for ff.fretGuitar
// Depends on output/svgOutput.js for ff.drawGuitar
// Depends on output/textOutput.js for ff.getTable
// Depends on output/pdfOutput.js for ff.getPDF, ff.getPDFMultipage
// Depends on output/dxfOutput.js for ff.getDXF
// Assumes SVG.js, FileSaver.js are available globally.

(function(ff) {
    'use strict';

    // This was originally in fretfind_ui.js, now part of ui/main.js
    // It's not part of the ff object, but a local utility for this module.
    function computeOffsets(strings, gauges, actual_length, perp_width, spacingMode) {
        var offsets = [0]; // Offset for the first string is always 0
        if (strings <= 1) return offsets; // No gaps if 0 or 1 string

        const corrected_gauges = spacingMode === 'proportional' ? gauges : new Array(strings).fill(0);
        
        // Sum of all gauge thicknesses
        const totalGaugeThickness = corrected_gauges.reduce((tot, cur) => tot + (isNaN(cur) ? 0 : cur), 0);
        
        // Working area is the perpendicular width minus the sum of all string gauges
        const working_area = perp_width - totalGaugeThickness;
        
        // Gap between strings (center-to-center distance if gauges were 0)
        // This is the space *between* the edges of strings if proportional, or center-to-center if equal.
        // For 'equal' spacing, this is simply perp_width / (strings - 1)
        // For 'proportional', it's more complex. The original formula seems to calculate the space *between* strings.
        
        let perp_gap;
        if (spacingMode === 'proportional') {
            // The space available for gaps is perp_width - sum_of_all_gauges
            // This available space is divided into (strings - 1) gaps.
            perp_gap = working_area / (strings - 1);
        } else { // 'equal' spacing
            // For equal center-to-center, the gap is simply total width / number of gaps
            perp_gap = perp_width / (strings - 1);
        }


        for (var i = 1; i < strings; i++) { // Loop up to strings-1 for offsets array of size 'strings'
            let next_space_center_to_center;
            if (spacingMode === 'proportional') {
                // Distance from center of string (i-1) to center of string i
                // is (gauge[i-1]/2) + perp_gap + (gauge[i]/2)
                const g_prev = isNaN(corrected_gauges[i-1]) ? 0 : corrected_gauges[i-1];
                const g_curr = isNaN(corrected_gauges[i]) ? 0 : corrected_gauges[i];
                next_space_center_to_center = (g_prev / 2.0) + perp_gap + (g_curr / 2.0);
            } else { // 'equal' spacing
                next_space_center_to_center = perp_gap;
            }
            // The offset is along the nut/bridge line, so scale by actual_length / perp_width
            // This seems to project the perpendicular spacing onto the angled nut/bridge line.
            offsets.push(offsets[i - 1] + (next_space_center_to_center * actual_length / perp_width));
        }
        return offsets;
    }


    // get the user-selected display options
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
        var lengthMode = ff.getAlt('length');
        var spacingMode = ff.getAlt('spacing');
        var scaleLength = ff.getFlt('len');
        var scaleLengthF = ff.getFlt('lenF');
        var scaleLengthL = ff.getFlt('lenL');
        var perp = ff.getFlt('pDist');
        var nutWidth = ff.getFlt('nutWidth');
        var bridgeWidth = ff.getFlt('bridgeWidth');
        var strings = ff.getInt('numStrings');
        var unitsElement = document.querySelector("input[name='units']:checked");
        var units = unitsElement ? unitsElement.value : 'in';

        var gauges = ff.getGauges('igauges');
        var lengths = ff.getLengths('ilengths');
        if (lengthMode === 'individual') {
            scaleLengthF = lengths[0];
            scaleLengthL = lengths[lengths.length - 1];
            perp = ff.getFlt('ipDist');
        }
        var frets = ff.getInt('numFrets');
        var tuning = ff.getTuning('tuning');
        var oNF, oNL, oBF, oBL;
        switch (ff.getAlt('overhang')) {
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
                oBL = ff.getFlt('oBL');
                break;
            default: // Default to equal if something is wrong
                 oNF = oNL = oBF = oBL = ff.getFlt('oE') || 0; // Ensure a fallback
                 break;
        }
        var scale;
        if (ff.getAlt('scale') === 'et') {
            var tones = ff.getFlt('root');
            scale = ff.etScale(tones, 2);
        } else {
            var scalaText = ff.getStr('scl');
            scale = ff.scalaScale(scalaText);
        }

        var nutHalf = nutWidth / 2;
        var bridgeHalf = bridgeWidth / 2;
        var nutCandidateCenter = nutHalf + oNL;
        var bridgeCandidateCenter = bridgeHalf + oBL;
        var xcenter = Math.max(bridgeCandidateCenter, nutCandidateCenter);
        
        var fbnxf = xcenter + nutHalf + oNF;
        var fbbxf = xcenter + bridgeHalf + oBF;
        var fbnxl = xcenter - (nutHalf + oNL);
        var fbbxl = xcenter - (bridgeHalf + oBL);

        var snxf = xcenter + nutHalf;
        var sbxf = xcenter + bridgeHalf;
        var snxl = xcenter - nutHalf;
        var sbxl = xcenter - bridgeHalf;

        var fdeltax = sbxf - snxf;
        var ldeltax = sbxl - snxl;
        var fdeltay, ldeltay;
        if (lengthMode === 'single') {
            fdeltay = ldeltay = scaleLength;
        } else {
            fdeltay = Math.sqrt(Math.max(0, (scaleLengthF * scaleLengthF) - (fdeltax * fdeltax))); // Ensure non-negative
            ldeltay = Math.sqrt(Math.max(0, (scaleLengthL * scaleLengthL) - (ldeltax * ldeltax)));
        }

        var first = new ff.Segment(new ff.Point(snxf, 0), new ff.Point(sbxf, fdeltay));
        var last = new ff.Segment(new ff.Point(snxl, 0), new ff.Point(sbxl, ldeltay));

        var perp_y = 0;
        if (lengthMode === 'multiple' || lengthMode === 'individual') {
            var fperp = perp * fdeltay;
            var lperp = perp * ldeltay;
            if (fdeltay <= ldeltay) {
                first.translate(0, (lperp - fperp));
                perp_y = lperp;
            } else {
                last.translate(0, (fperp - lperp));
                perp_y = fperp;
            }
        }

        var nut = new ff.Segment(first.end1.copy(), last.end1.copy());
        var bridge = new ff.Segment(first.end2.copy(), last.end2.copy());

        if (lengthMode === 'multiple' || lengthMode === 'individual') {
            if (nutWidth > 0) { // Avoid division by zero
                oNF = (oNF * nut.length()) / nutWidth;
                oNL = (oNL * nut.length()) / nutWidth;
            } else { oNF = 0; oNL = 0;}
            if (bridgeWidth > 0) {
                oBF = (oBF * bridge.length()) / bridgeWidth;
                oBL = (oBL * bridge.length()) / bridgeWidth;
            } else { oBF = 0; oBL = 0;}
        }

        var fbf = new ff.Segment(nut.pointAt(-oNF), bridge.pointAt(-oBF));
        var fbl = new ff.Segment(nut.pointAt(nut.length() + oNL), bridge.pointAt(bridge.length() + oBL));

        if (fbf.end1.y < 0 || fbl.end1.y < 0) {
            var move = Math.min(fbf.end1.y, fbl.end1.y) * -1;
            first.translate(0, move);
            last.translate(0, move);
            nut.translate(0, move);
            bridge.translate(0, move);
            fbf.translate(0, move);
            fbl.translate(0, move);
            perp_y += move;
        }

        var nutOffsets = computeOffsets(strings, gauges, nut.length(), nutWidth, spacingMode);
        var bridgeOffsets = computeOffsets(strings, gauges, bridge.length(), bridgeWidth, spacingMode);

        var lines = [first];
        for (var i = 1; i <= (strings - 2); i++) {
            var n = nut.pointAt(nutOffsets[i]);
            var b = bridge.pointAt(bridgeOffsets[i]);

            if (lengthMode === 'individual') {
                var l = lengths[i];
                var nx = n.x;
                var bx = b.x;
                var deltax = Math.abs(nx - bx);
                var deltay = Math.sqrt(Math.max(0, (l * l) - (deltax * deltax)));
                n = new ff.Point(nx, 0); // Reassign n
                b = new ff.Point(bx, deltay); // Reassign b
                var perpy_current_string = perp * deltay;
                var perpy_diff = perp_y - perpy_current_string;
                n.translate(0, perpy_diff);
                b.translate(0, perpy_diff);
            }
            lines.push(new ff.Segment(n, b));
        }
        if (strings > 1) lines.push(last); // Only add last string if more than one string

        return {
            scale: scale,
            tuning: tuning,
            strings: lines,
            edge1: fbf,
            edge2: fbl,
            center: xcenter,
            fret_count: frets,
            units: units
        };
    };

    var getLink = function() {
        var params = {};
        document.getElementById('worksheet').querySelectorAll('input[id], textarea[id]').forEach(item => {
            if (item.value !== "") {
                params[item.id] = item.value;
            }
        });
        if (document.getElementById('nutStringSpacing') && document.getElementById('nutStringSpacing').value) {
            params.nssn = document.getElementById('nutStringSpacing').value;
        }
        if (document.getElementById('bridgeStringSpacing') && document.getElementById('bridgeStringSpacing').value) {
            params.nssb = document.getElementById('bridgeStringSpacing').value;
        }

        params.t = ff.getTuning('tuning');
        params.il = ff.getLengths('ilengths');
        params.ig = ff.getGauges('igauges');

        const unitsElement = document.querySelector("input[name='units']:checked");
        params.u = unitsElement ? unitsElement.value : 'in';

        params.sl = ff.getAlt('length');
        params.ns = ff.getAlt('spacing');
        params.scale = ff.getAlt('scale');
        params.o = ff.getAlt('overhang');

        var baseLocation = window.location.href.split('#')[0];
        return baseLocation + '#' + new URLSearchParams(params).toString();
    };

    var drawSurface;
    var processChanges = false;
    var onChange = function() {
        if (processChanges) {
            var guitar = getGuitar();
            guitar = ff.fretGuitar(guitar); // This function is now in fretboardCalculator.js
            ff.drawGuitar(drawSurface, guitar, getDisplayOptions()); // This is in svgOutput.js
            var tablesElement = document.getElementById('tables');
            if (tablesElement) tablesElement.innerHTML = ff.getTable(guitar); // This is in textOutput.js
            
            var bookmarkElement = document.getElementById('bookmark');
            if (bookmarkElement) bookmarkElement.href = getLink();
        }
    };

    var updateFormFromHash = function() {
        const hash = window.location.hash.substring(1);
        if (!hash) return; // No hash, nothing to do

        const urlParams = new URLSearchParams(hash);
        const params = {};

        for (const [key, value] of urlParams.entries()) {
            // Basic parsing, might need improvement for complex array/object structures from old URLs
            if (params.hasOwnProperty(key)) {
                if (!Array.isArray(params[key])) {
                    params[key] = [params[key]];
                }
                params[key].push(value);
            } else {
                params[key] = value;
            }
        }

        document.getElementById('worksheet').querySelectorAll('input[id], textarea[id]').forEach(item => {
            if (params.hasOwnProperty(item.id)) {
                item.value = Array.isArray(params[item.id]) ? params[item.id].join(',') : params[item.id];
            }
        });
        
        let p_il = [];
        if (params['il']) p_il = Array.isArray(params['il']) ? params['il'].map(Number) : String(params['il']).split(',').map(Number);
        else if (urlParams.has('il[]')) p_il = urlParams.getAll('il[]').map(Number);
        
        let p_ig = [];
        if (params['ig']) p_ig = Array.isArray(params['ig']) ? params['ig'].map(Number) : String(params['ig']).split(',').map(Number);
        else if (urlParams.has('ig[]')) p_ig = urlParams.getAll('ig[]').map(Number);

        let p_t = [];
        if (params['t']) p_t = Array.isArray(params['t']) ? params['t'].map(Number) : String(params['t']).split(',').map(Number);
        else if (urlParams.has('t[]')) p_t = urlParams.getAll('t[]').map(Number);

        ff.setLengths('ilengths', 'numStrings', onChange, p_il);
        ff.setGauges('igauges', 'numStrings', onChange, p_ig);
        ff.setTuning('tuning', 'numStrings', onChange, p_t);

        const unitValue = params['u'] || 'in';
        const unitRadio = document.querySelector("input[name='units'][value='" + unitValue + "']");
        if (unitRadio) unitRadio.checked = true;

        if (params.sl && document.getElementById(params.sl)) document.getElementById(params.sl).click();
        if (params.ns && document.getElementById(params.ns)) document.getElementById(params.ns).click();
        if (params.scale && document.getElementById(params.scale)) document.getElementById(params.scale).click();
        if (params.o && document.getElementById(params.o)) document.getElementById(params.o).click();

        if (params.nssn && document.getElementById('nutStringSpacing')) {
            document.getElementById('nutStringSpacing').value = params.nssn;
        }
        if (params.nssb && document.getElementById('bridgeStringSpacing')) {
            document.getElementById('bridgeStringSpacing').value = params.nssb;
        }

        const numStringsVal = ff.getInt('numStrings');
        if (document.getElementById('nutStringSpacing') && document.getElementById('nutStringSpacing').value !== "" && numStringsVal >= 2) {
            ff.updateWidthFromSpacing('nutStringSpacing', 'nutWidth', 'numStrings');
        } else if (document.getElementById('nutWidth') && document.getElementById('nutWidth').value !== "" && numStringsVal >= 2) {
            ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
        }

        if (document.getElementById('bridgeStringSpacing') && document.getElementById('bridgeStringSpacing').value !== "" && numStringsVal >= 2) {
            ff.updateWidthFromSpacing('bridgeStringSpacing', 'bridgeWidth', 'numStrings');
        } else if (document.getElementById('bridgeWidth') && document.getElementById('bridgeWidth').value !== "" && numStringsVal >= 2) {
            ff.updateSpacingFromWidth('bridgeWidth', 'bridgeStringSpacing', 'numStrings');
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        ff.initHelp('worksheet');
        ff.initAlternatives('worksheet', onChange);

        const numStringsElement = document.getElementById('numStrings');
        const nutWidthElement = document.getElementById('nutWidth');
        const bridgeWidthElement = document.getElementById('bridgeWidth');
        const nutStringSpacingElement = document.getElementById('nutStringSpacing');
        const bridgeStringSpacingElement = document.getElementById('bridgeStringSpacing');

        if (numStringsElement) {
            numStringsElement.addEventListener('change', function() {
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
        
        // General change listener for other inputs
        document.getElementById('worksheet').querySelectorAll('input[type="radio"], input[type="checkbox"], textarea, select, input[type="text"]').forEach(el => {
            const handledIds = ['numStrings', 'nutWidth', 'bridgeWidth', 'nutStringSpacing', 'bridgeStringSpacing'];
            if (!handledIds.includes(el.id) && !el.closest('#tuning') && !el.closest('#ilengths') && !el.closest('#igauges')) {
                 el.addEventListener('change', onChange);
            }
        });

        ff.setTuning('tuning', 'numStrings', onChange);
        ff.setLengths('ilengths', 'numStrings', onChange);
        ff.setGauges('igauges', 'numStrings', onChange);

        updateFormFromHash();

        const numStringsValInit = ff.getInt('numStrings');
        if (document.getElementById('nutWidth').value && !document.getElementById('nutStringSpacing').value && numStringsValInit >= 2) {
            ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
        }
        if (document.getElementById('bridgeWidth').value && !document.getElementById('bridgeStringSpacing').value && numStringsValInit >= 2) {
            ff.updateSpacingFromWidth('bridgeWidth', 'bridgeStringSpacing', 'numStrings');
        }

        const diagramElement = document.getElementById('diagram');
        var diagramWidth = diagramElement ? diagramElement.offsetWidth : 600;
        var diagramHeight = Math.max(500, window.innerHeight * 0.6);
        if (diagramElement) diagramElement.style.height = diagramHeight + 'px';

        if (typeof SVG !== 'undefined' && diagramElement) { // Check if SVG function and element exist
            drawSurface = SVG().addTo('#diagram').size(diagramWidth, diagramHeight);
        } else {
            console.error("SVG.js library not loaded or #diagram element not found.");
        }
        

        window.addEventListener('resize', function() {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(function() {
                const currentDiagramElement = document.getElementById('diagram');
                if (currentDiagramElement && drawSurface) { // Check drawSurface exists
                    var newDiagramHeight = Math.max(500, window.innerHeight * 0.6);
                    var newDiagramWidth = currentDiagramElement.offsetWidth;
                    currentDiagramElement.style.height = newDiagramHeight + 'px';
                    drawSurface.size(newDiagramWidth, newDiagramHeight); 
                }
                onChange();
            }, 250);
        });

        processChanges = true;
        onChange();

        var isFileSaverSupported = false;
        try {
            isFileSaverSupported = !!new Blob();
        } catch (e) {}

        var dl = document.getElementById('downloads');
        if (isFileSaverSupported && dl) {
            const downloads = [
                { id: 'dxf', name: 'DXF', type: 'image/vnd.dxf', getter: ff.getDXF },
                {
                    id: 'pdfm', name: 'PDF (multi-page)', type: 'application/pdf', getter: ff.getPDFMultipage,
                    options: '<label><input type="radio" name="pdfm_pagesize" value="letter" checked="checked"/>letter</label><br />' +
                        '<label><input type="radio" name="pdfm_pagesize" value="a4" />A4</label><br />' +
                        '<label><input type="radio" name="pdfm_pagesize" value="legal" />legal</label>'
                },
                { id: 'pdf', name: 'PDF (single page)', type: 'application/pdf', getter: ff.getPDF },
                { id: 'svg', name: 'SVG', type: 'image/svg+xml', getter: ff.getSVG },
                { id: 'csv', name: 'CSV', type: 'text/csv', getter: ff.getCSV },
                { id: 'html', name: 'HTML', type: 'text/html', getter: ff.getHTML },
                { id: 'tab', name: 'TAB', type: 'text/tab-separated-values', getter: ff.getTAB }
            ];

            downloads.forEach(d => {
                let ddContent = '';
                if (d.options) {
                    ddContent += '<dd>' + d.options + '</dd>';
                }
                ddContent += '<dd><button id="download_' + d.id + '">Download</button></dd>';
                dl.insertAdjacentHTML('beforeend', '<dt>' + d.name + '</dt>' + ddContent);

                const button = document.getElementById('download_' + d.id);
                if (button) {
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
                        if (typeof saveAs !== 'undefined' && fileContent) { // Check saveAs and fileContent
                            var blob = new Blob([fileContent], { type: d.type + ";charset=utf-8" }); // Added charset
                            saveAs(blob, "fretboard." + d.id.replace('pdfm', 'pdf'));
                        } else {
                             console.error("FileSaver.js (saveAs) is not available or file content is empty.");
                        }
                    });
                }
            });

        } else if (dl) {
            dl.insertAdjacentHTML('beforeend', '<dd><b>Buttons missing?<br/>Downloads require a modern browser that supports <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob#Browser_compatibility">the Blob constructor API</a> and FileSaver.js.</b></dd>');
        }
    });

}(window.ff || {}));
