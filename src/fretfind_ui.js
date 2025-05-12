//<![CDATA[

// Helper functions (getLengths, setLengths, getGauges, setGauges) are now part of the ff object in fretfind.js

// computes string offsets along the nut itself, assuming that width does not include the overhang (it's already accounted for)
// if "proportional" is not selected, gauges will all be 0 and this will simply return
// the offsets along the nut. 
var computeOffsets = function(strings, gauges, actual_length, perp_width, spacingMode) {
    var offsets = [0];
    const corrected_gauges = spacingMode === 'proportional' ? gauges : new Array(strings).fill(0);
    const working_area = perp_width - corrected_gauges.reduce((tot, cur) => tot + cur); 
    const perp_gap = working_area / (strings - 1);
    for (var i=1; i<strings-1; i++) {
        half_adjacent_strings = (corrected_gauges[i-1] + corrected_gauges[i]) / 2.0;
        next_space = perp_gap + half_adjacent_strings; 
        offsets.push(offsets[i-1] + next_space * actual_length / perp_width);
    }
    return offsets;
};

// get the user-selected display options for on-screen display and all output options (i.e. SVG, PDF).
var getDisplayOptions = function() {
    return {
        showStrings: document.getElementById("showStrings").checked,
        showFretboardEdges: document.getElementById("showFretboardEdges").checked,
        showMetas: document.getElementById("showMetas").checked,
        showBoundingBox: document.getElementById("showBoundingBox").checked,
        extendFrets: document.getElementById("extendFrets").checked
    };
}

// output a guitar (scale, tuning and strings (with fretboard edges))
// based upon form values
var getGuitar = function() {
    //get form values
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
    var units = unitsElement ? unitsElement.value : 'in'; // Default to 'in' if none selected

    var gauges = ff.getGauges('igauges'); // Use ff.getGauges
    var lengths = ff.getLengths('ilengths'); // Use ff.getLengths
    if (lengthMode === 'individual') {
      scaleLengthF = lengths[0];
      scaleLengthL = lengths[lengths.length-1];
      perp = ff.getFlt('ipDist');
    }
    var frets = ff.getInt('numFrets');
    var tuning = ff.getTuning('tuning');
    var oNF;
    var oNL;
    var oBF;
    var oBL;
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
    }
    var scale;
    if (ff.getAlt('scale') === 'et') {
        var tones = ff.getFlt('root');
        scale = ff.etScale(tones,2);
    } else {
        var scala = ff.getStr('scl');
        scale = ff.scalaScale(scala);
    }

    //choose an x value for the center line
    var nutHalf = nutWidth / 2;
    var bridgeHalf = bridgeWidth / 2;
    var nutCandidateCenter = (nutHalf) + oNL;
    var bridgeCandidateCenter = (bridgeHalf) + oBL;
    var xcenter = bridgeCandidateCenter >= nutCandidateCenter ? bridgeCandidateCenter : nutCandidateCenter;
    
    //find x values for fretboard edges
    var fbnxf = xcenter + nutHalf + oNF;
    var fbbxf = xcenter + bridgeHalf + oBF;
    var fbnxl = xcenter - (nutHalf + oNL);
    var fbbxl = xcenter - (bridgeHalf + oBL);

    //find x values for first and last strings
    var snxf = xcenter + nutHalf;
    var sbxf = xcenter + bridgeHalf;
    var snxl = xcenter - nutHalf;
    var sbxl = xcenter - bridgeHalf;

    //find the slope of the strings
    var fdeltax = sbxf - snxf;
    var ldeltax = sbxl - snxl;
    var fdeltay;
    var ldeltay;
    if (lengthMode === 'single') {
        fdeltay = ldeltay = scaleLength;
    } else {
        fdeltay = Math.sqrt((scaleLengthF * scaleLengthF) - (fdeltax * fdeltax));
        ldeltay = Math.sqrt((scaleLengthL * scaleLengthL) - (ldeltax * ldeltax));
    }

    //temporarily place first and last strings
    var first = new ff.Segment(new ff.Point(snxf, 0), new ff.Point(sbxf, fdeltay));
    var last = new ff.Segment(new ff.Point(snxl, 0), new ff.Point(sbxl, ldeltay));

    var perp_y = 0;
    if (lengthMode === 'multiple' || lengthMode === 'individual') {
        //translate so that perpendicular distance lines up
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
        //overhang measurements are now converted from delta x to along line lengths
        oNF = (oNF * nut.length()) / nutWidth;
        oNL = (oNL * nut.length()) / nutWidth;
        oBF = (oBF * bridge.length()) / bridgeWidth;
        oBL = (oBL * bridge.length()) / bridgeWidth;
    }
    
    //place fretboard edges;
    var fbf = new ff.Segment(nut.pointAt(-oNF), bridge.pointAt(-oBF));
    var fbl = new ff.Segment(nut.pointAt(nut.length() + oNL), bridge.pointAt(bridge.length() + oBL));
    
    //normalize values into the first quadrant via translate
    if (fbf.end1.y < 0 || fbl.end1.y < 0)
    {
      var move = fbf.end1.y <= fbl.end1.y ? -fbf.end1.y : -fbl.end1.y;

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
    for (var i=1; i<=(strings-2); i++)
    {
      var n = nut.pointAt(nutOffsets[i]);
      var b = bridge.pointAt(bridgeOffsets[i]);
      
      if (lengthMode === 'individual') {
        var l = lengths[i];
        var nx = n.x;
        var bx = b.x;
        var deltax = Math.abs(nx - bx);
        var deltay = Math.sqrt((l * l) - (deltax * deltax));
        var n = new ff.Point(nx,0)
        var b = new ff.Point(bx,deltay);
        var perpy = perp * deltay;
        var perpy_diff = perp_y - perpy;
        n.translate(0, perpy_diff);
        b.translate(0, perpy_diff);
      }
      lines.push(new ff.Segment(n, b));
    }
    lines.push(last);

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
        // Only include if value is not empty, to keep URL cleaner
        if (item.value !== "") {
            params[item.id] = item.value;
        }
    });
    // Ensure specific params are handled even if their inputs might be empty initially
    // For example, if nutStringSpacing is calculated and populated, it should be in the link.
    // The querySelectorAll already gets all inputs with IDs.
    // We need to ensure that if an ID is expected (like nutStringSpacing), its value is captured.
    // The current loop does this. Let's add specific keys for new spacing params if not already captured by the loop.
    if (document.getElementById('nutStringSpacing').value) {
        params.nssn = document.getElementById('nutStringSpacing').value; // nut string spacing nut
    }
    if (document.getElementById('bridgeStringSpacing').value) {
        params.nssb = document.getElementById('bridgeStringSpacing').value; // nut string spacing bridge
    }

    params.t = ff.getTuning('tuning');
    params.il = ff.getLengths('ilengths'); // Use ff.getLengths
    params.ig = ff.getGauges('igauges');   // Use ff.getGauges
    
    const unitsElement = document.querySelector("input[name='units']:checked");
    params.u = unitsElement ? unitsElement.value : 'in';

    params.sl = ff.getAlt('length');
    params.ns = ff.getAlt('spacing');
    params.scale = ff.getAlt('scale');
    params.o = ff.getAlt('overhang');
    
    var baseLocation = window.location.href.split('#')[0];
    return baseLocation + '#' + new URLSearchParams(params).toString();
};

//surface for drawing fretboard
var drawSurface; 

var processChanges = false;
var onChange = function() {
    if (processChanges) {
        var guitar = getGuitar();
        guitar = ff.fretGuitar(guitar);
        ff.drawGuitar(drawSurface, guitar, getDisplayOptions());
        document.getElementById('tables').innerHTML = ff.getTable(guitar);
        document.getElementById('bookmark').href = getLink();
    }
};

var updateFormFromHash = function() {
    const hash = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(hash);
    const params = {};

    for (const [key, value] of urlParams.entries()) {
        // This basic parsing won't handle arrays from BBQ like t[], il[], ig[] correctly.
        // For now, it takes the last value if a key is repeated, or treats it as a string.
        // A more robust solution would be needed if complex array/object structures were common in old URLs.
        // Given the usage (t, il, ig are specifically handled later), this might be okay for other params.
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
            // If param was an array from BBQ, this would take the array as string.
            // Assuming simple values for most inputs.
            item.value = Array.isArray(params[item.id]) ? params[item.id].join(',') : params[item.id];
        }
    });

    // Handle specific array-like parameters from BBQ if they exist
    // jQuery BBQ might serialize arrays like t[]=0&t[]=7...
    // URLSearchParams will parse this as 't[]': ['0', '7']. We need to handle this.
    // Or if it was t=0,7,3... then params.t would be "0,7,3..."
    
    let p_il = [];
    if (params['il']) p_il = Array.isArray(params['il']) ? params['il'].map(Number) : params['il'].toString().split(',').map(Number);
    else if (urlParams.has('il[]')) p_il = urlParams.getAll('il[]').map(Number);
    
    let p_ig = [];
    if (params['ig']) p_ig = Array.isArray(params['ig']) ? params['ig'].map(Number) : params['ig'].toString().split(',').map(Number);
    else if (urlParams.has('ig[]')) p_ig = urlParams.getAll('ig[]').map(Number);

    let p_t = [];
    if (params['t']) p_t = Array.isArray(params['t']) ? params['t'].map(Number) : params['t'].toString().split(',').map(Number);
    else if (urlParams.has('t[]')) p_t = urlParams.getAll('t[]').map(Number);


    ff.setLengths('ilengths','numStrings', onChange, p_il); // Use ff.setLengths
    ff.setGauges('igauges', 'numStrings', onChange, p_ig);   // Use ff.setGauges
    ff.setTuning('tuning','numStrings', onChange, p_t);

    const unitValue = params['u'] || 'in';
    const unitRadio = document.querySelector("input[name='units'][value='" + unitValue + "']");
    if (unitRadio) unitRadio.checked = true; // .click() might trigger onChange too early

    // For alternative selectors, we need to ensure the elements exist before clicking
    if (params.sl && document.getElementById(params.sl)) document.getElementById(params.sl).click();
    if (params.ns && document.getElementById(params.ns)) document.getElementById(params.ns).click();
    if (params.scale && document.getElementById(params.scale)) document.getElementById(params.scale).click();
    if (params.o && document.getElementById(params.o)) document.getElementById(params.o).click();

    // Populate new string spacing fields if present in URL
    if (params.nssn && document.getElementById('nutStringSpacing')) {
        document.getElementById('nutStringSpacing').value = params.nssn;
    }
    if (params.nssb && document.getElementById('bridgeStringSpacing')) {
        document.getElementById('bridgeStringSpacing').value = params.nssb;
    }
    
    // After populating from URL, establish consistency
    // Prioritize spacing if available from URL, otherwise calculate spacing from width
    const numStringsVal = ff.getInt('numStrings'); // get numStrings once

    if (document.getElementById('nutStringSpacing') && document.getElementById('nutStringSpacing').value !== "" && numStringsVal >=2) {
        ff.updateWidthFromSpacing('nutStringSpacing', 'nutWidth', 'numStrings');
    } else if (document.getElementById('nutWidth') && document.getElementById('nutWidth').value !== "" && numStringsVal >=2) {
        ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
    }

    if (document.getElementById('bridgeStringSpacing') && document.getElementById('bridgeStringSpacing').value !== "" && numStringsVal >=2) {
        ff.updateWidthFromSpacing('bridgeStringSpacing', 'bridgeWidth', 'numStrings');
    } else if (document.getElementById('bridgeWidth') && document.getElementById('bridgeWidth').value !== "" && numStringsVal >=2) {
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
            // Per requirement, when numStrings changes, spacing takes precedence.
            // Update widths based on current spacing values.
            ff.updateWidthFromSpacing('nutStringSpacing', 'nutWidth', 'numStrings');
            ff.updateWidthFromSpacing('bridgeStringSpacing', 'bridgeWidth', 'numStrings');
            
            // Original tasks for numStrings change
            ff.setTuning('tuning', 'numStrings', onChange);
            ff.setLengths('ilengths','numStrings', onChange);
            ff.setGauges('igauges', 'numStrings', onChange);
            onChange(); // Trigger full recalculation
        });
    }

    if (nutWidthElement) {
        nutWidthElement.addEventListener('input', function() { // Use 'input' for more responsive updates
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

    // General change listener for other inputs (like radio buttons, dropdowns not covered above)
    // The specific input listeners above will handle their direct updates and then call onChange.
    // This ensures that other inputs still trigger a general update.
    document.getElementById('worksheet').querySelectorAll('input[type="radio"], input[type="checkbox"], textarea, select').forEach(el => {
        // Avoid adding duplicate listeners to elements already handled
        if (el.id !== 'numStrings' && el.id !== 'nutWidth' && el.id !== 'bridgeWidth' && el.id !== 'nutStringSpacing' && el.id !== 'bridgeStringSpacing') {
            el.addEventListener('change', onChange);
        }
    });
    // Add listener for text inputs not explicitly handled above, using 'change' to avoid firing too often during typing.
    document.getElementById('worksheet').querySelectorAll('input[type="text"]').forEach(el => {
        if (el.id !== 'numStrings' && el.id !== 'nutWidth' && el.id !== 'bridgeWidth' && el.id !== 'nutStringSpacing' && el.id !== 'bridgeStringSpacing' && 
            !el.closest('#tuning') && !el.closest('#ilengths') && !el.closest('#igauges') ) { // Exclude dynamically generated inputs
             el.addEventListener('change', onChange);
        }
    });


    ff.setTuning('tuning', 'numStrings', onChange);
    ff.setLengths('ilengths','numStrings', onChange);
    ff.setGauges('igauges', 'numStrings', onChange);
    
    updateFormFromHash(); // This will populate from URL and apply initial consistency

    // After updateFormFromHash and initial dynamic inputs are set up,
    // ensure consistency for any remaining defaults before first draw.
    const numStringsValInit = ff.getInt('numStrings');
    if (document.getElementById('nutWidth').value && !document.getElementById('nutStringSpacing').value && numStringsValInit >=2) {
        ff.updateSpacingFromWidth('nutWidth', 'nutStringSpacing', 'numStrings');
    }
    if (document.getElementById('bridgeWidth').value && !document.getElementById('bridgeStringSpacing').value && numStringsValInit >=2) {
        ff.updateSpacingFromWidth('bridgeWidth', 'bridgeStringSpacing', 'numStrings');
    }
    
    const diagramElement = document.getElementById('diagram');
    var diagramWidth = diagramElement ? diagramElement.offsetWidth : 600; // Default width
    var diagramHeight = Math.max(500, window.innerHeight * 0.6);
    if (diagramElement) diagramElement.style.height = diagramHeight + 'px';
    
    drawSurface = SVG().addTo('#diagram').size(diagramWidth, diagramHeight); 
    
    window.addEventListener('resize', function() {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function() {
            const currentDiagramElement = document.getElementById('diagram'); // Re-fetch in case it was re-rendered
            if (currentDiagramElement) {
                 var newDiagramHeight = Math.max(500, window.innerHeight * 0.6);
                 currentDiagramElement.style.height = newDiagramHeight + 'px';
                 // SVG.js might need explicit resize on the surface too, or redraw
                 // drawSurface.size(currentDiagramElement.offsetWidth, newDiagramHeight); // If SVG.js surface needs resize
            }
            onChange(); // This will redraw with new dimensions
        }, 250);
    });
    
    // updateFormFromHash(); // Removed redundant call
    processChanges = true;
    onChange();

    var isFileSaverSupported = false;
    try {
        isFileSaverSupported = !!new Blob;
    } catch (e) {}

    var dl = document.getElementById('downloads');
    if (isFileSaverSupported && dl){
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
                        fileContent = d.getter(guitar, getDisplayOptions ? getDisplayOptions() : guitar); // getDisplayOptions for most, getCSV/TAB/HTML don't need it
                    }
                    var blob = new Blob([fileContent], {type: d.type});
                    saveAs(blob, "fretboard." + d.id.replace('pdfm', 'pdf'));
                });
            }
        });
    
    } else if (dl) {
        dl.insertAdjacentHTML('beforeend', '<dd><b>Buttons missing?<br/>Downloads require a modern browser that supports <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob#Browser_compatibility">the Blob constructor API</a>.</b></dd>');
    }
});

//]]>
