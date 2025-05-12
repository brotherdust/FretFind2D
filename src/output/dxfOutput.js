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
// Depends on fretboardCalculator.js for ff.getExtents

(function(ff) {
    'use strict';

    ff.getDXF = function(guitar, displayOptions) {
        if (!guitar || !displayOptions) {
            console.error("getDXF: Missing guitar or displayOptions.");
            return "";
        }

        var seg2dxf = function(seg, dot) {
            if (!seg || !seg.end1 || !seg.end2) return ""; // Skip invalid segments
            if (typeof dot === 'undefined') {
                dot = false;
            }
            var intersect = 0;
            if (dot) {
                // Scale intersect by unit if necessary, assuming model units
                var unitScale = 1; // Default if guitar.units is 'in' or undefined
                if (guitar.units === 'cm') unitScale = 1/2.54; // Convert cm to inches for a fixed 0.02 inch intersect
                else if (guitar.units === 'mm') unitScale = 1/25.4; // Convert mm to inches
                intersect = .02 * unitScale; // Assuming 0.02 is in inches
            }
            // Ensure coordinates are numbers
            var x1 = Number(seg.end1.x) + intersect;
            var y1 = Number(seg.end1.y);
            var x2 = Number(seg.end2.x) - intersect;
            var y2 = Number(seg.end2.y);

            if ([x1,y1,x2,y2].some(isNaN)) return ""; // Skip if any coordinate is NaN

            return '0\nLINE\n8\n2\n62\n4\n10\n' +
                x1 + '\n20\n' +
                y1 + '\n30\n0\n11\n' +
                x2 + '\n21\n' +
                y2 + '\n31\n0\n';
        };

        var output = [];
        output.push('999\nDXF created by FretFind2D\n');
        output.push('0\nSECTION\n2\nENTITIES\n');

        if (displayOptions.showStrings && guitar.strings) {
            for (var i = 0; i < guitar.strings.length; i++) {
                output.push(seg2dxf(guitar.strings[i]));
            }
        }

        if (displayOptions.showFretboardEdges && guitar.edge1 && guitar.edge2) {
            output.push(seg2dxf(guitar.edge1));
            output.push(seg2dxf(guitar.edge2));
        }

        if (displayOptions.showBoundingBox) {
            var bbox = ff.getExtents(guitar);
            if (bbox.width > 0 && bbox.height > 0) { // Only draw if valid
                var topLeft = new ff.Point(bbox.minx, bbox.miny);
                var bottomLeft = new ff.Point(bbox.minx, bbox.miny + bbox.height);
                var bottomRight = new ff.Point(bbox.minx + bbox.width, bbox.miny + bbox.height);
                var topRight = new ff.Point(bbox.minx + bbox.width, bbox.miny);
                
                output.push(seg2dxf(new ff.Segment(topLeft, bottomLeft)));
                output.push(seg2dxf(new ff.Segment(bottomLeft, bottomRight)));
                output.push(seg2dxf(new ff.Segment(bottomRight, topRight)));
                output.push(seg2dxf(new ff.Segment(topRight, topLeft)));
            }
        }

        if (guitar.frets) {
            for (var i = 0; i < guitar.frets.length; i++) {
                if (guitar.frets[i]) {
                    for (var j = 0; j < guitar.frets[i].length; j++) {
                         var fretData = guitar.frets[i][j];
                         if (fretData && fretData.fret) {
                            output.push(seg2dxf(fretData.fret, true));
                         }
                    }
                }
            }
        }


        if (displayOptions.extendFrets && guitar.extendedFretEnds) {
            for (var i = 0; i < guitar.extendedFretEnds.length; i++) {
                 var extFret = guitar.extendedFretEnds[i];
                 if (extFret) {
                    output.push(seg2dxf(extFret, true));
                 }
            }
        }

        output.push('0\nENDSEC\n0\nEOF\n');

        return output.join('');
    };

}(window.ff || {}));
