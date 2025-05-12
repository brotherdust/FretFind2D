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
// Depends on fretboardCalculator.js for ff.getExtents
// Assumes jsPDF is available globally

(function(ff) {
    'use strict';

    ff.getPDF = function(guitar, displayOptions) {
        if (!guitar || !displayOptions || typeof jsPDF === 'undefined') {
            console.error("getPDF: Missing guitar, displayOptions, or jsPDF library.");
            return "";
        }
        var x = ff.getExtents(guitar);
        if (x.width <= 0 || x.height <= 0) { // Prevent invalid PDF dimensions
             console.warn("getPDF: Invalid guitar extents for PDF generation.", x);
             return ""; // Or throw error
        }

        var unitMult = 1;
        if (guitar.units === 'cm') {
            unitMult = 2.54;
        } else if (guitar.units === 'mm') {
            unitMult = 25.4;
        }
        var margin = 0.5 * unitMult;
        // Ensure page dimensions are positive
        var pageWidth = Math.max(0.1, x.maxx + (2 * margin)); 
        var pageHeight = Math.max(0.1, x.maxy + (2 * margin));

        var doc = new jsPDF('p', guitar.units, [pageWidth, pageHeight]); // Use 'p' for portrait
        var lineWidth = (1 / 72) * unitMult;
        var intersect = guitar.doPartials ? 0 : .02 * unitMult; // Scale intersect by unitMult

        doc.setLineWidth(lineWidth);

        if (displayOptions.showMetas && guitar.center !== undefined) {
            doc.line(guitar.center + margin, margin, guitar.center + margin, x.maxy + margin); // Adjusted y coordinates for margin
        }

        if (displayOptions.showStrings && guitar.strings) {
            for (var i = 0; i < guitar.strings.length; i++) {
                var string = guitar.strings[i];
                if (string && string.end1 && string.end2) {
                    doc.line(
                        string.end1.x + margin,
                        string.end1.y + margin,
                        string.end2.x + margin,
                        string.end2.y + margin
                    );
                }
            }
        }

        if (displayOptions.showFretboardEdges && guitar.edge1 && guitar.edge2) {
             if (guitar.edge1.end1 && guitar.edge1.end2) {
                doc.line(
                    guitar.edge1.end1.x + margin,
                    guitar.edge1.end1.y + margin,
                    guitar.edge1.end2.x + margin,
                    guitar.edge1.end2.y + margin
                );
            }
            if (guitar.edge2.end1 && guitar.edge2.end2) {
                doc.line(
                    guitar.edge2.end1.x + margin,
                    guitar.edge2.end1.y + margin,
                    guitar.edge2.end2.x + margin,
                    guitar.edge2.end2.y + margin
                );
            }
        }

        if (displayOptions.showBoundingBox) {
            var bbox = ff.getExtents(guitar);
            if (bbox.width > 0 && bbox.height > 0) {
                 doc.rect(bbox.minx + margin, bbox.miny + margin, bbox.width, bbox.height);
            }
        }

        if (guitar.frets) {
            for (var i = 0; i < guitar.frets.length; i++) {
                if (guitar.frets[i]) {
                    for (var j = 0; j < guitar.frets[i].length; j++) {
                        var fretData = guitar.frets[i][j];
                        if (fretData && fretData.fret && fretData.fret.end1 && fretData.fret.end2) {
                            doc.line(
                                fretData.fret.end1.x + intersect + margin,
                                fretData.fret.end1.y + margin,
                                fretData.fret.end2.x - intersect + margin,
                                fretData.fret.end2.y + margin
                            );
                        }
                    }
                }
            }
        }


        if (displayOptions.extendFrets && guitar.extendedFretEnds) {
            for (var i = 0; i < guitar.extendedFretEnds.length; i++) {
                var extFret = guitar.extendedFretEnds[i];
                if (extFret && extFret.end1 && extFret.end2) {
                    doc.line(
                        extFret.end1.x + intersect + margin,
                        extFret.end1.y + margin,
                        extFret.end2.x - intersect + margin,
                        extFret.end2.y + margin);
                }
            }
        }

        return doc.output();
    };

    ff.getPDFMultipage = function(guitar, displayOptions, pagesize) {
        if (!guitar || !displayOptions || typeof jsPDF === 'undefined') {
            console.error("getPDFMultipage: Missing guitar, displayOptions, or jsPDF library.");
            return "";
        }
        var x = ff.getExtents(guitar);
         if (x.width <= 0 || x.height <= 0) {
             console.warn("getPDFMultipage: Invalid guitar extents for PDF generation.", x);
             return "";
        }

        var rawPageWidth, rawPageHeight;
        if (pagesize === 'a4') {
            rawPageWidth = 210 / 25.4; // inches
            rawPageHeight = 297 / 25.4; // inches
        } else if (pagesize === 'legal') {
            rawPageWidth = 8.5; // inches
            rawPageHeight = 14; // inches
        } else { // Default to letter
            pagesize = 'letter';
            rawPageWidth = 8.5; // inches
            rawPageHeight = 11; // inches
        }

        var unitMult = 1; // Assuming guitar.units is 'in'
        if (guitar.units === 'cm') {
            unitMult = 2.54; // Convert inches to cm for page size
        } else if (guitar.units === 'mm') {
            unitMult = 25.4; // Convert inches to mm for page size
        }
        
        // Page dimensions in guitar.units
        var pageWidthInUnits = rawPageWidth * (guitar.units === 'in' ? 1 : (guitar.units === 'cm' ? 2.54 : 25.4));
        var pageHeightInUnits = rawPageHeight * (guitar.units === 'in' ? 1 : (guitar.units === 'cm' ? 2.54 : 25.4));


        var pdf = new jsPDF('p', guitar.units, pagesize);
        var lineWidth = (1 / 72) * (guitar.units === 'in' ? 1 : (guitar.units === 'cm' ? 2.54 : 25.4)); // lineWidth in guitar.units
        var pageOverlap = 0.5 * (guitar.units === 'in' ? 1 : (guitar.units === 'cm' ? 2.54 : 25.4)); // overlap in guitar.units
        
        var printableHeight = pageHeightInUnits - (2 * pageOverlap);
        var printableWidth = pageWidthInUnits - (2 * pageOverlap);

        if (printableWidth <=0 || printableHeight <=0) {
            console.error("getPDFMultipage: Printable area is zero or negative. Check page size and overlap.");
            return "";
        }

        var yPages = Math.ceil(x.height / printableHeight);
        var xPages = Math.ceil(x.width / printableWidth);
        var intersect = guitar.doPartials ? 0 : .02 * (guitar.units === 'in' ? 1 : (guitar.units === 'cm' ? 2.54 : 25.4));


        for (var i = 0; i < yPages; i++) {
            for (var j = 0; j < xPages; j++) {
                var yDrawOffset = (pageHeightInUnits * i) - (pageOverlap * (i === 0 ? 1 : (1 + (2 * i)) ));
                var xDrawOffset = (pageWidthInUnits * j) - (pageOverlap * (j === 0 ? 1 : (1 + (2 * j)) ));
                
                // Adjust offsets for drawing: elements are drawn relative to page top-left (0,0)
                // So, if an element's model coordinate is (mx, my),
                // its coordinate on the current page tile is (mx - xTileStart, my - yTileStart)
                // where xTileStart, yTileStart are the model coordinates of the top-left of the current tile's printable area.
                var xTileModelStart = j * printableWidth;
                var yTileModelStart = i * printableHeight;


                if (i > 0 || j > 0) {
                    pdf.addPage();
                }
                pdf.setLineWidth(lineWidth);
                pdf.setDrawColor(192, 192, 192); // RGB for grey
                pdf.rect(pageOverlap, pageOverlap, printableWidth, printableHeight);
                pdf.setDrawColor(0, 0, 0); // RGB for black

                // Transform function from model coordinates to current page coordinates
                function modelToPageCoords(modelX, modelY) {
                    return {
                        x: modelX - xTileModelStart + pageOverlap,
                        y: modelY - yTileModelStart + pageOverlap
                    };
                }

                if (displayOptions.showMetas && guitar.center !== undefined) {
                    var p1 = modelToPageCoords(guitar.center, x.miny); // Use x.miny and x.maxy for full height
                    var p2 = modelToPageCoords(guitar.center, x.maxy);
                    pdf.line(p1.x, p1.y, p2.x, p2.y);
                }

                if (displayOptions.showStrings && guitar.strings) {
                    for (var k = 0; k < guitar.strings.length; k++) {
                        var string = guitar.strings[k];
                        if (string && string.end1 && string.end2) {
                            var p1 = modelToPageCoords(string.end1.x, string.end1.y);
                            var p2 = modelToPageCoords(string.end2.x, string.end2.y);
                            pdf.line(p1.x, p1.y, p2.x, p2.y);
                        }
                    }
                }

                if (displayOptions.showFretboardEdges && guitar.edge1 && guitar.edge2) {
                    if (guitar.edge1.end1 && guitar.edge1.end2) {
                        var p1 = modelToPageCoords(guitar.edge1.end1.x, guitar.edge1.end1.y);
                        var p2 = modelToPageCoords(guitar.edge1.end2.x, guitar.edge1.end2.y);
                        pdf.line(p1.x, p1.y, p2.x, p2.y);
                    }
                     if (guitar.edge2.end1 && guitar.edge2.end2) {
                        var p1 = modelToPageCoords(guitar.edge2.end1.x, guitar.edge2.end1.y);
                        var p2 = modelToPageCoords(guitar.edge2.end2.x, guitar.edge2.end2.y);
                        pdf.line(p1.x, p1.y, p2.x, p2.y);
                    }
                }

                if (displayOptions.showBoundingBox) {
                    var bbox = ff.getExtents(guitar);
                    var p_rect = modelToPageCoords(bbox.minx, bbox.miny);
                    if (bbox.width > 0 && bbox.height > 0) {
                         pdf.rect(p_rect.x, p_rect.y, bbox.width, bbox.height);
                    }
                }

                if (guitar.frets) {
                    for (var k = 0; k < guitar.frets.length; k++) {
                        if (guitar.frets[k]) {
                            for (var l = 0; l < guitar.frets[k].length; l++) {
                                var fretData = guitar.frets[k][l];
                                if (fretData && fretData.fret && fretData.fret.end1 && fretData.fret.end2) {
                                    var p1 = modelToPageCoords(fretData.fret.end1.x + intersect, fretData.fret.end1.y);
                                    var p2 = modelToPageCoords(fretData.fret.end2.x - intersect, fretData.fret.end2.y);
                                    pdf.line(p1.x, p1.y, p2.x, p2.y);
                                }
                            }
                        }
                    }
                }
                
                if (displayOptions.extendFrets && guitar.extendedFretEnds) {
                    for (var k = 0; k < guitar.extendedFretEnds.length; k++) {
                        var extFret = guitar.extendedFretEnds[k];
                        if (extFret && extFret.end1 && extFret.end2) {
                             var p1 = modelToPageCoords(extFret.end1.x + intersect, extFret.end1.y);
                             var p2 = modelToPageCoords(extFret.end2.x - intersect, extFret.end2.y);
                             pdf.line(p1.x, p1.y, p2.x, p2.y);
                        }
                    }
                }
            }
        }
        return pdf.output();
    };

}(window.ff || {}));
