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

(function(ff) {
    'use strict';

    ff.drawGuitar = function(drawSurface, guitar, displayOptions) {
        if (!drawSurface || !guitar || !displayOptions) {
            console.error("drawGuitar: Missing required arguments.");
            return;
        }
        drawSurface.clear();

        var modelBBox = ff.getExtents(guitar);

        var diagramElement = document.getElementById('diagram');
        var containerWidth = diagramElement ? diagramElement.offsetWidth : 0;
        var containerHeight = diagramElement ? diagramElement.offsetHeight : 0;
        
        if (containerWidth <=0 || containerHeight <=0) {
            // Fallback if container dimensions are not available
            containerWidth = 600; 
            containerHeight = 400;
        }
        drawSurface.size(containerWidth, containerHeight);
        drawSurface.viewbox(0, 0, containerWidth, containerHeight);


        var pixelScale = 1.0;
        if (modelBBox.width > 0.00001 && modelBBox.height > 0.00001) {
            pixelScale = Math.min(containerWidth / modelBBox.width, containerHeight / modelBBox.height) * 0.90;
        }

        var scaledModelWidth = modelBBox.width * pixelScale;
        var scaledModelHeight = modelBBox.height * pixelScale;

        var pixelOffsetX = (containerWidth - scaledModelWidth) / 2;
        var pixelOffsetY = (containerHeight - scaledModelHeight) / 2;

        function modelToPixel(modelPoint) {
            if (!modelPoint || typeof modelPoint.x === 'undefined' || typeof modelPoint.y === 'undefined') {
                // Return a default or throw error for invalid points
                return { x: NaN, y: NaN };
            }
            var px = (modelPoint.x - modelBBox.minx) * pixelScale + pixelOffsetX;
            var py = (modelPoint.y - modelBBox.miny) * pixelScale + pixelOffsetY;
            return { x: px, y: py };
        }

        var fretClassName = guitar.doPartials ? 'fretfind-pfret' : 'fretfind-ifret';

        if (displayOptions.showStrings && guitar.strings) {
            var stringpath = '';
            for (var i = 0; i < guitar.strings.length; i++) {
                var seg = guitar.strings[i];
                if (seg && seg.end1 && seg.end2) {
                    var p1 = modelToPixel(seg.end1);
                    var p2 = modelToPixel(seg.end2);
                    if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
                        stringpath += 'M' + p1.x + ' ' + p1.y + 'L' + p2.x + ' ' + p2.y;
                    }
                }
            }
            if (stringpath) drawSurface.path(stringpath).addClass('fretfind-string');
        }

        if (displayOptions.showMetas && guitar.meta) {
            var metapath = '';
            for (var i = 0; i < guitar.meta.length; i++) {
                var seg = guitar.meta[i];
                 if (seg && seg.end1 && seg.end2) {
                    var p1 = modelToPixel(seg.end1);
                    var p2 = modelToPixel(seg.end2);
                     if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
                        metapath += 'M' + p1.x + ' ' + p1.y + 'L' + p2.x + ' ' + p2.y;
                    }
                }
            }
            if (metapath) drawSurface.path(metapath).addClass('fretfind-meta');
        }

        if (displayOptions.showFretboardEdges && guitar.edge1 && guitar.edge2) {
            var edgePath = '';
            var edge1p1 = modelToPixel(guitar.edge1.end1);
            var edge1p2 = modelToPixel(guitar.edge1.end2);
            var edge2p1 = modelToPixel(guitar.edge2.end1);
            var edge2p2 = modelToPixel(guitar.edge2.end2);
            if (![edge1p1, edge1p2, edge2p1, edge2p2].some(p => isNaN(p.x) || isNaN(p.y))) {
                edgePath = 'M' + edge1p1.x + ' ' + edge1p1.y + 'L' + edge1p2.x + ' ' + edge1p2.y;
                edgePath += 'M' + edge2p1.x + ' ' + edge2p1.y + 'L' + edge2p2.x + ' ' + edge2p2.y;
            }
            if (edgePath) drawSurface.path(edgePath).addClass('fretfind-edge');
        }
        
        var endsPath = '';
        if (guitar.nut && guitar.nut.end1 && guitar.nut.end2) {
            var nutP1 = modelToPixel(guitar.nut.end1);
            var nutP2 = modelToPixel(guitar.nut.end2);
            if(!isNaN(nutP1.x) && !isNaN(nutP1.y) && !isNaN(nutP2.x) && !isNaN(nutP2.y)) {
                endsPath += 'M' + nutP1.x + ' ' + nutP1.y + 'L' + nutP2.x + ' ' + nutP2.y;
            }
        }
        if (guitar.bridge && guitar.bridge.end1 && guitar.bridge.end2) {
            var bridgeP1 = modelToPixel(guitar.bridge.end1);
            var bridgeP2 = modelToPixel(guitar.bridge.end2);
            if(!isNaN(bridgeP1.x) && !isNaN(bridgeP1.y) && !isNaN(bridgeP2.x) && !isNaN(bridgeP2.y)) {
                 endsPath += (endsPath ? 'M' : 'M') + bridgeP1.x + ' ' + bridgeP1.y + 'L' + bridgeP2.x + ' ' + bridgeP2.y;
            }
        }
        if (endsPath) drawSurface.path(endsPath).addClass(fretClassName);

        if (guitar.frets) {
            var fretpath = [];
            for (var i = 0; i < guitar.frets.length; i++) {
                if (guitar.frets[i]) {
                    for (var j = 0; j < guitar.frets[i].length; j++) {
                        var fretData = guitar.frets[i][j];
                        if (fretData && fretData.fret && fretData.fret.end1 && fretData.fret.end2) {
                            var seg = fretData.fret;
                            var p1 = modelToPixel(seg.end1);
                            var p2 = modelToPixel(seg.end2);
                            if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
                                if (Math.abs(p1.x - p2.x) > 0.001 || Math.abs(p1.y - p2.y) > 0.001 || guitar.doPartials) {
                                    fretpath.push('M' + p1.x + ' ' + p1.y + 'L' + p2.x + ' ' + p2.y);
                                }
                            }
                        }
                    }
                }
            }
            if (fretpath.length > 0) drawSurface.path(fretpath.join('')).addClass(fretClassName);
        }


        if (displayOptions.extendFrets && guitar.extendedFretEnds) {
            var extendedFretsPath = [];
            for (var j = 0; j < guitar.extendedFretEnds.length; j++) {
                var seg = guitar.extendedFretEnds[j];
                if (seg && seg.end1 && seg.end2) {
                    var p1 = modelToPixel(seg.end1);
                    var p2 = modelToPixel(seg.end2);
                    if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
                        if (Math.abs(p1.x - p2.x) > 0.001 || Math.abs(p1.y - p2.y) > 0.001) {
                            extendedFretsPath.push('M' + p1.x + ' ' + p1.y + 'L' + p2.x + ' ' + p2.y);
                        }
                    }
                }
            }
            if (extendedFretsPath.length > 0) drawSurface.path(extendedFretsPath.join('')).addClass(fretClassName);
        }

        if (displayOptions.showBoundingBox) {
            if (!isNaN(scaledModelWidth) && !isNaN(scaledModelHeight) && !isNaN(pixelOffsetX) && !isNaN(pixelOffsetY)) {
                drawSurface.rect(scaledModelWidth, scaledModelHeight)
                    .move(pixelOffsetX, pixelOffsetY)
                    .addClass('fretfind-bbox');
            }
        }
    };

    ff.getSVG = function(guitar, displayOptions) {
        if (!guitar || !displayOptions) return "";
        var x = ff.getExtents(guitar);
        if (x.width <= 0 || x.height <= 0) { // Prevent invalid viewBox
            x.width = 1; x.height = 1; // Minimal valid size
        }
        var fret_class = guitar.doPartials ? 'pfret' : 'ifret';
        var output = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + x.minx + ' ' + x.miny + ' ' + x.width + ' ' + x.height +
            '" height="' + x.height + guitar.units + '" width="' + x.width + guitar.units + '" >\n']; // Use x.width, x.height for viewBox
        output.push('<defs><style type="text/css"><![CDATA[\n' +
            '\t.string{stroke:rgb(0,0,0);stroke-width:0.2%;}\n' +
            '\t.meta{stroke:rgb(221,221,221);stroke-width:0.2%;}\n' +
            '\t.edge{stroke:rgb(0,0,255);stroke-width:0.2%;}\n' +
            '\t.pfret{stroke:rgb(255,0,0);stroke-linecap:round;stroke-width:0.2%;}\n' +
            '\t.ifret{stroke:rgb(255,0,0);stroke-linecap:round;stroke-width:0.8%;}\n' +
            '\t.bbox{stroke:rgb(0,0,0);stroke-width:0.2%;fill:rgba(0,0,0,0)}\n' +
            ']' + ']></style></defs>\n');

        if (displayOptions.showStrings && guitar.strings) {
            for (var i = 0; i < guitar.strings.length; i++) {
                var string = guitar.strings[i];
                if (string && string.end1 && string.end2) {
                     output.push('<line x1="' + string.end1.x + '" x2="' + string.end2.x +
                        '" y1="' + string.end1.y + '" y2="' + string.end2.y + '"' +
                        ' class="string" />\n');
                }
            }
        }

        if (displayOptions.showMetas && guitar.meta) {
            for (var i = 0; i < guitar.meta.length; i++) {
                var meta = guitar.meta[i];
                 if (meta && meta.end1 && meta.end2) {
                    output.push('<line x1="' + meta.end1.x + '" x2="' + meta.end2.x +
                        '" y1="' + meta.end1.y + '" y2="' + meta.end2.y + '"' +
                        ' class="meta" />\n');
                }
            }
        }

        if (displayOptions.showFretboardEdges && guitar.edge1 && guitar.edge2) {
            if(guitar.edge1.end1 && guitar.edge1.end2)
            output.push('<line x1="' + guitar.edge1.end1.x + '" x2="' + guitar.edge1.end2.x +
                '" y1="' + guitar.edge1.end1.y + '" y2="' + guitar.edge1.end2.y + '"' + // Removed comma
                ' class="edge" />\n');
            if(guitar.edge2.end1 && guitar.edge2.end2)
            output.push('<line x1="' + guitar.edge2.end1.x + '" x2="' + guitar.edge2.end2.x +
                '" y1="' + guitar.edge2.end1.y + '" y2="' + guitar.edge2.end2.y + '"' + // Removed comma
                ' class="edge" />\n');
        }

        if (displayOptions.showBoundingBox) {
            var bbox = ff.getExtents(guitar);
            output.push('<rect x="' + bbox.minx + '" y="' + bbox.miny + '"' +
                ' width="' + bbox.width + '" height="' + bbox.height + '"' +
                ' class="bbox" />\n');
        }

        if (guitar.frets) {
            for (var i = 0; i < guitar.frets.length; i++) {
                if (guitar.frets[i]) {
                    for (var j = 0; j < guitar.frets[i].length; j++) {
                        var fretData = guitar.frets[i][j];
                        if (fretData && fretData.fret) {
                             output.push('<path d="' + fretData.fret.toSVGD() + '" class="' + fret_class + '" />\n');
                        }
                    }
                }
            }
        }


        if (displayOptions.extendFrets && guitar.extendedFretEnds) {
            for (var i = 0; i < guitar.extendedFretEnds.length; i++) {
                var extFret = guitar.extendedFretEnds[i];
                if (extFret) {
                    output.push('<path d="' + extFret.toSVGD() + '" class="' + fret_class + '" />\n');
                }
            }
        }

        output.push('</svg>');
        return output.join('');
    };

}(window.ff || {}));
