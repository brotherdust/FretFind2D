/*
    Copyright (C) 2004, 2005, 2010, 2024 Aaron C Spike
    (This code was previously in fretfind.js)

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

// Depends on ff_setup.js for ff namespace
// Depends on geometry.js for ff.Point, ff.Segment

(function(ff) {
    'use strict';

    //extend guitar object with frets and other calculated information
    ff.fretGuitar = function(guitar) {
        if (!guitar || !guitar.strings || !guitar.edge1 || !guitar.edge2 || !guitar.scale || !guitar.tuning) {
            console.error("fretGuitar: Invalid guitar object provided.", guitar);
            // Potentially return a modified guitar object indicating an error state
            // or throw an error, depending on desired error handling strategy.
            // For now, let's try to proceed but expect NaNs or issues.
            // A more robust approach would be to ensure guitar structure is valid before calling.
            return guitar; // Or a new object: { ...guitar, error: "Invalid input" };
        }

        var threshold = 0.0000000001;
        var numStrings = guitar.strings.length;
        var doPartials = true;
        var parallelFrets = true;

        // Ensure edge1, edge2, and strings have valid Point and Segment objects
        // This is a defensive measure; ideally, the input `guitar` object is already well-formed.
        var nut = new ff.Segment(guitar.edge1.end1.copy(), guitar.edge2.end1.copy());
        var bridge = new ff.Segment(guitar.edge1.end2.copy(), guitar.edge2.end2.copy());
        var midline = new ff.Segment(nut.midpoint(), bridge.midpoint());

        var meta = [guitar.edge1.copy()];
        for (var i = 0; i < numStrings - 1; i++) {
            if (guitar.strings[i+1] && guitar.strings[i]) { // Check strings exist
                 meta.push(
                    new ff.Segment(
                        guitar.strings[i + 1].end1.midway(guitar.strings[i].end1),
                        guitar.strings[i + 1].end2.midway(guitar.strings[i].end2)
                    )
                );
            } else {
                // Handle missing strings if necessary, e.g., by adding a placeholder or logging an error
                meta.push(new ff.Segment(new ff.Point(NaN,NaN), new ff.Point(NaN,NaN))); // Placeholder
            }
        }
        meta.push(guitar.edge2.copy());

        for (var i = 0; i < numStrings; i++) {
            if (!guitar.strings[i] || !guitar.strings[i].end1 || !guitar.strings[i].end2) { // Check string validity
                doPartials = false; // Cannot do partials if string data is incomplete
                break;
            }
            if ((nut.distanceToPoint(guitar.strings[i].end1) > threshold) ||
                (bridge.distanceToPoint(guitar.strings[i].end2) > threshold)) {
                doPartials = false;
                break;
            }
        }

        var denom = ((bridge.end2.y - bridge.end1.y) * (nut.end2.x - nut.end1.x)) -
            ((bridge.end2.x - bridge.end1.x) * (nut.end2.y - nut.end1.y));
        if (Math.abs(denom) > threshold) { // Use threshold for floating point comparison
            parallelFrets = false;
        }

        var stringsData = []; // Renamed from 'strings' to avoid conflict with outer scope 'numStrings'
        var tones = guitar.scale.steps.length - 1;
        var totalWidth = []; // This seems to be intended as an array of sums, initialize elements
        var scaleSteps = guitar.scale.steps; // Renamed from 'scale'

        for (var i = 0; i < numStrings; i++) {
            if (!guitar.strings[i]) continue; // Skip if string is missing

            var base = guitar.tuning[i] || 0;
            var frets = [];
            frets[0] = {};
            frets[0].fret = doPartials ? new ff.Segment(meta[i].end1.copy(), meta[i + 1].end1.copy()) :
                new ff.Segment(guitar.strings[i].end1.copy(), guitar.strings[i].end1.copy());
            frets[0].bridgeDist = guitar.strings[i].length();
            frets[0].nutDist = 0;
            frets[0].pFretDist = 0; // Distance from previous fret (nut for the first one)
            frets[0].width = doPartials ? frets[0].fret.length() : 0;
            frets[0].angle = doPartials ? frets[0].fret.angle() : NaN;
            frets[0].intersection = guitar.strings[i].end1.copy(); // Ensure it's a copy
            frets[0].midline_intersection = doPartials ? midline.intersect(frets[0].fret) :
                new ff.Point(NaN, NaN);
            
            var tempSegToMidlineEnd = new ff.Segment(midline.end2, frets[0].midline_intersection);
            frets[0].midline_bridgeDist = doPartials ? tempSegToMidlineEnd.length() : NaN;
            frets[0].midline_nutDist = doPartials ? 0 : NaN; // Nut is at 0 distance from nut along midline
            frets[0].midline_pFretDist = doPartials ? 0 : NaN; // No previous fret for nut
            frets[0].totalRatio = 0;

            if (typeof totalWidth[0] === 'undefined') totalWidth[0] = 0;
            totalWidth[0] += frets[0].width;

            for (var j = 1; j <= guitar.fret_count; j++) {
                frets[j] = {};
                var stepIndex = ((base + (j - 1)) % tones) + 1;
                // Ensure scaleSteps[stepIndex] and scaleSteps[stepIndex-1] are valid
                if (!scaleSteps[stepIndex] || !scaleSteps[stepIndex-1] || 
                    isNaN(scaleSteps[stepIndex][0]) || isNaN(scaleSteps[stepIndex][1]) ||
                    isNaN(scaleSteps[stepIndex-1][0]) || isNaN(scaleSteps[stepIndex-1][1]) ||
                    scaleSteps[stepIndex][0] === 0 || scaleSteps[stepIndex-1][1] === 0 ) { // Avoid division by zero
                    
                    // Handle error: invalid scale step data
                    frets[j].intersection = new ff.Point(NaN, NaN);
                    frets[j].bridgeDist = NaN;
                    frets[j].nutDist = NaN;
                    frets[j].pFretDist = NaN;
                    frets[j].totalRatio = NaN;
                    // ... set other properties to NaN or default error values
                } else {
                    var ratio = 1 - (
                        (scaleSteps[stepIndex][1] * scaleSteps[stepIndex - 1][0]) /
                        (scaleSteps[stepIndex][0] * scaleSteps[stepIndex - 1][1])
                    );
                    if (isNaN(ratio)) ratio = 0; // Default ratio if calculation failed

                    var prevIntersection = frets[j-1].intersection;
                    var stringEnd = guitar.strings[i].end2;
                    
                    var x = prevIntersection.x + (ratio * (stringEnd.x - prevIntersection.x));
                    var y = prevIntersection.y + (ratio * (stringEnd.y - prevIntersection.y));
                    frets[j].intersection = new ff.Point(x, y);
                }
                
                var tempSegToBridge = new ff.Segment(stringEnd, frets[j].intersection);
                frets[j].bridgeDist = tempSegToBridge.length();
                var tempSegToNut = new ff.Segment(guitar.strings[i].end1, frets[j].intersection);
                frets[j].nutDist = tempSegToNut.length();
                var tempSegToPrevFret = new ff.Segment(frets[j - 1].intersection, frets[j].intersection);
                frets[j].pFretDist = tempSegToPrevFret.length();
                
                var stringLength = guitar.strings[i].length();
                frets[j].totalRatio = (stringLength > threshold) ? (frets[j].nutDist / stringLength) : 0;


                if (doPartials) {
                    var fretLine; // The line representing the full fret across the neck
                    if (parallelFrets) {
                        // For parallel frets, the fret line is parallel to the nut/bridge
                        // and passes through the fret's intersection point on the current string.
                        // This seems to be what nut.createParallel(frets[j].intersection) implies.
                        // However, the original code used guitar.strings[0] and guitar.strings[numStrings-1]
                        // for non-parallel, which suggests a different approach for parallel.
                        // Let's assume parallel means parallel to nut.
                        fretLine = nut.createParallel(frets[j].intersection);

                    } else {
                        // For non-parallel (fanned) frets, the fret line is determined by
                        // points on the outermost strings at the same proportional distance.
                        var firstStringPt = guitar.strings[0].pointAtRatio(frets[j].totalRatio);
                        var lastStringPt = guitar.strings[numStrings - 1].pointAtRatio(frets[j].totalRatio);
                        fretLine = new ff.Segment(firstStringPt, lastStringPt);
                    }
                    // The actual fretlet on the current string is the portion of fretLine
                    // between the meta lines for this string.
                    frets[j].fret = new ff.Segment(fretLine.intersect(meta[i]),
                        fretLine.intersect(meta[i + 1]));


                    frets[j].width = frets[j].fret.length();
                    frets[j].angle = frets[j].fret.angle();
                    frets[j].midline_intersection = midline.intersect(frets[j].fret);
                    
                    tempSegToMidlineEnd = new ff.Segment(midline.end2, frets[j].midline_intersection);
                    frets[j].midline_bridgeDist = tempSegToMidlineEnd.length();
                    tempSegToNut = new ff.Segment(midline.end1, frets[j].midline_intersection);
                    frets[j].midline_nutDist = tempSegToNut.length();
                    tempSegToPrevFret = new ff.Segment(frets[j - 1].midline_intersection, frets[j].midline_intersection);
                    frets[j].midline_pFretDist = tempSegToPrevFret.length();
                } else {
                    frets[j].fret = new ff.Segment(frets[j].intersection.copy(), frets[j].intersection.copy());
                    frets[j].width = 0;
                    frets[j].angle = NaN;
                    frets[j].midline_intersection = new ff.Point(NaN, NaN);
                    frets[j].midline_bridgeDist = NaN;
                    frets[j].midline_nutDist = NaN;
                    frets[j].midline_pFretDist = NaN;
                }
                if (typeof totalWidth[j] === 'undefined') totalWidth[j] = 0;
                totalWidth[j] += frets[j].width;
            }
            stringsData.push(frets);
        }

        var extendedFretEnds = [];
        // Calculate extended fret ends only if there's at least one string and fret data
        if (stringsData.length > 0 && stringsData[0].length > 0) {
            var lastStringIndex = stringsData.length - 1; // Index for the last string's data
            var overallMaxX = Math.max(guitar.edge1.end1.x, guitar.edge1.end2.x, guitar.edge2.end1.x, guitar.edge2.end2.x);
            var overallMinX = Math.min(guitar.edge1.end1.x, guitar.edge1.end2.x, guitar.edge2.end1.x, guitar.edge2.end2.x);
            // Use actual fretboard edges for extension targets if available and sensible
            var leftEdgeTargetX = guitar.edge2.end1.x; // Assuming edge2 is 'left' (lower X)
            var rightEdgeTargetX = guitar.edge1.end1.x; // Assuming edge1 is 'right' (higher X)
            // Ensure left is actually left of right
            if (leftEdgeTargetX > rightEdgeTargetX) [leftEdgeTargetX, rightEdgeTargetX] = [rightEdgeTargetX, leftEdgeTargetX];


            for (var j = 0; j <= guitar.fret_count; j++) {
                // Ensure fret data exists for this fret index on the relevant strings
                if (!stringsData[0][j] || !stringsData[lastStringIndex][j]) continue;

                var firstStringFret = stringsData[0][j].fret; // Fretlet on the first string (e.g. high E)
                var lastStringFret = stringsData[lastStringIndex][j].fret; // Fretlet on the last string (e.g. low E)

                // The full fret line can be defined by two points on the outermost string fretlets.
                // For parallel frets, these points will have same Y. For fanned, they differ.
                // Let's use the endpoints of the fretlets on the outermost strings.
                // Assuming stringsData[0] is the "rightmost" in drawing (often high E)
                // and stringsData[lastStringIndex] is the "leftmost" (often low E).
                // The fret object itself (e.g. firstStringFret) is a Segment.
                
                // Define the full fret line based on the outermost fretlets
                // This assumes fretlets are oriented consistently.
                // Point on "right" side of neck, Point on "left" side of neck
                var pRight = firstStringFret.end1; // Or .end2 depending on orientation
                var pLeft = lastStringFret.end2;   // Or .end1

                // If fretlets are just points (individual scale, no partials), use those points
                if (firstStringFret.length() < threshold) pRight = firstStringFret.end1;
                if (lastStringFret.length() < threshold) pLeft = lastStringFret.end1;


                var fullFretLine = new ff.Segment(pLeft, pRight);
                if (fullFretLine.length() < threshold && !doPartials) { // Single point fret
                     extendedFretEnds.push(new ff.Segment(pLeft.copy(), pLeft.copy()));
                     extendedFretEnds.push(new ff.Segment(pRight.copy(), pRight.copy()));
                } else if (fullFretLine.length() < threshold && doPartials) { // Should not happen if doPartials
                    // Fallback for unexpected zero-length fullFretLine when partials are expected
                    extendedFretEnds.push(new ff.Segment(guitar.edge2.pointAtRatio(j/guitar.fret_count), pLeft));
                    extendedFretEnds.push(new ff.Segment(pRight, guitar.edge1.pointAtRatio(j/guitar.fret_count)));
                }
                else {
                    // Extend this fullFretLine to the actual fretboard edges (guitar.edge1 and guitar.edge2)
                    var extendedLeft = fullFretLine.intersect(guitar.edge2); // edge2 is typically 'left'
                    var extendedRight = fullFretLine.intersect(guitar.edge1); // edge1 is typically 'right'

                    // Check if intersections are valid points
                    if (isNaN(extendedLeft.x) || isNaN(extendedLeft.y)) extendedLeft = pLeft.copy();
                    if (isNaN(extendedRight.x) || isNaN(extendedRight.y)) extendedRight = pRight.copy();
                    
                    // Segment from left edge to the start of the drawn fretlets
                    extendedFretEnds.push(new ff.Segment(extendedLeft, pLeft));
                    // Segment from the end of the drawn fretlets to the right edge
                    extendedFretEnds.push(new ff.Segment(pRight, extendedRight));
                }
            }
        }


        guitar.frets = stringsData;
        guitar.fretWidths = totalWidth;
        guitar.midline = midline;
        guitar.nut = nut;
        guitar.bridge = bridge;
        guitar.meta = meta;
        guitar.doPartials = doPartials;
        guitar.extendedFretEnds = extendedFretEnds;
        return guitar;
    };

    ff.getExtents = function(guitar) {
        if (!guitar || !guitar.meta || guitar.meta.length === 0) {
            // Return a default or error bounding box if guitar or meta is invalid
            return { minx: 0, maxx: 0, miny: 0, maxy: 0, height: 0, width: 0 };
        }

        var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;

        // Consider fretboard edges (meta[0] and meta[last])
        // and also actual string ends if they extend beyond meta lines (though typically they shouldn't)
        // Also consider fret ends if extendFrets is true.

        function updateBoundsWithSegment(segment) {
            if (segment && segment.end1 && segment.end2) {
                minx = Math.min(minx, segment.end1.x, segment.end2.x);
                maxx = Math.max(maxx, segment.end1.x, segment.end2.x);
                miny = Math.min(miny, segment.end1.y, segment.end2.y);
                maxy = Math.max(maxy, segment.end1.y, segment.end2.y);
            }
        }
        
        // Include meta lines (which include fretboard edges)
        for (var i = 0; i < guitar.meta.length; i++) {
            updateBoundsWithSegment(guitar.meta[i]);
        }

        // If frets are extended, their ends might define the true extents
        if (guitar.extendedFretEnds && guitar.extendedFretEnds.length > 0) {
            for (var i = 0; i < guitar.extendedFretEnds.length; i++) {
                 updateBoundsWithSegment(guitar.extendedFretEnds[i]);
            }
        } else if (guitar.frets) { // Otherwise, consider the calculated fretlet ends
            for (var i=0; i<guitar.frets.length; i++) {
                for (var j=0; j<guitar.frets[i].length; j++) {
                    if (guitar.frets[i][j] && guitar.frets[i][j].fret) {
                        updateBoundsWithSegment(guitar.frets[i][j].fret);
                    }
                }
            }
        }
        
        // Ensure nut and bridge are included
        if (guitar.nut) updateBoundsWithSegment(guitar.nut);
        if (guitar.bridge) updateBoundsWithSegment(guitar.bridge);


        // Handle cases where no valid points were found
        if (minx === Infinity || maxx === -Infinity || miny === Infinity || maxy === -Infinity) {
            return { minx: 0, maxx: 0, miny: 0, maxy: 0, height: 0, width: 0 };
        }

        return {
            minx: minx,
            maxx: maxx,
            miny: miny,
            maxy: maxy,
            height: maxy - miny,
            width: maxx - minx
        };
    };

}(window.ff || {}));
