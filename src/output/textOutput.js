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

// Depends on ff_setup.js for ff namespace and ff.roundFloat

(function(ff) {
    'use strict';

    ff.getTable = function(guitar) {
        if (!guitar || !guitar.nut || !guitar.meta || !guitar.midline || !guitar.bridge || !guitar.strings || !guitar.frets) {
            console.error("getTable: Invalid guitar object provided.");
            return "<p>Error: Could not generate table due to invalid guitar data.</p>";
        }
        var i = 0;
        var output = ['<table class="foundfrets">' +
            '<tr><td colspan="4">Neck</td></tr>' +
            '<tr><td> </td><td>endpoints</td><td>length</td><td>angle</td></tr>' +
            '<tr><td>Nut</td><td>' + guitar.nut.toString() + '</td><td>' +
            ff.roundFloat(guitar.nut.length()) + '</td><td>' + ff.roundFloat(guitar.nut.angle()) + '</td></tr>' + // Added rounding
            '<tr><td>Edge 1</td><td>' + guitar.meta[0].toString() + '</td><td>' +
            ff.roundFloat(guitar.meta[0].length()) + '</td><td>' + ff.roundFloat(guitar.meta[0].angle()) + '</td></tr>' +
            '<tr><td>Midline</td><td>' + guitar.midline.toString() + '</td><td>' +
            ff.roundFloat(guitar.midline.length()) + '</td><td>' + ff.roundFloat(guitar.midline.angle()) + '</td></tr>' +
            '<tr><td>Edge 2</td><td>' + guitar.meta[guitar.meta.length - 1].toString() + '</td><td>' +
            ff.roundFloat(guitar.meta[guitar.meta.length - 1].length()) + '</td><td>' + ff.roundFloat(guitar.meta[guitar.meta.length - 1].angle()) + '</td></tr>' +
            '<tr><td>Bridge</td><td>' + guitar.bridge.toString() + '</td><td>' +
            ff.roundFloat(guitar.bridge.length()) + '</td><td>' + ff.roundFloat(guitar.bridge.angle()) + '</td></tr>' +
            '</table><br /><br />\n'];
        output.push('<table class="foundfrets">' +
            '<tr><td colspan="4">Strings</td></tr>' +
            '<tr><td> </td><td>endpoints</td><td>length</td><td>angle</td></tr>');
        for (i = 0; i < guitar.strings.length; i++) {
            var currentString = guitar.strings[i];
            if (currentString) { // Check if string exists
                output.push('<tr><td>String ' + (i + 1) + '</td><td>' + currentString.toString() + '</td><td>' +
                ff.roundFloat(currentString.length()) + '</td><td>' + ff.roundFloat(currentString.angle()) + '</td></tr>');
            }
        }
        output.push('</table><br /><br />\n');
        output.push('<table class="foundfrets">');
        for (i = 0; i < guitar.frets.length; i++) {
            if (!guitar.frets[i]) continue; // Skip if fret data for this string is missing

            output.push('<tr><td colspan="11">String ' + (i + 1) + ' Frets</td></tr>' +
                '<tr><td>#</td><td>to nut</td><td>to fret</td><td>to bridge</td>' +
                '<td>intersection point</td>');
            if (guitar.doPartials) {
                output.push('<td>partial width</td><td>angle</td>' +
                    '<td>mid to nut</td><td>mid to fret</td><td>mid to bridge</td><td>mid intersection</td>');
            }
            output.push('</tr>\n');
            for (var j = 0; j < guitar.frets[i].length; j++) {
                var fretData = guitar.frets[i][j];
                if (!fretData) continue; // Skip if this specific fret data is missing

                output.push('<tr><td>' + (j === 0 ? 'n' : j) + '</td><td>');
                output.push(ff.roundFloat(fretData.nutDist));
                output.push('</td><td>');
                output.push(ff.roundFloat(fretData.pFretDist));
                output.push('</td><td>');
                output.push(ff.roundFloat(fretData.bridgeDist));
                output.push('</td><td>');
                output.push(fretData.intersection ? fretData.intersection.toString() : 'N/A');
                output.push('</td>');
                if (guitar.doPartials) {
                    output.push('<td>');
                    output.push(ff.roundFloat(fretData.width));
                    output.push('</td><td>');
                    output.push(ff.roundFloat(fretData.angle));
                    output.push('</td><td>');
                    output.push(ff.roundFloat(fretData.midline_nutDist));
                    output.push('</td><td>');
                    output.push(ff.roundFloat(fretData.midline_pFretDist));
                    output.push('</td><td>');
                    output.push(ff.roundFloat(fretData.midline_bridgeDist));
                    output.push('</td><td>');
                    output.push(fretData.midline_intersection ? fretData.midline_intersection.toString() : 'N/A');
                    output.push('</td>');
                }
                output.push('</tr>\n');
            }
        }
        output.push('</table>');
        return output.join('');
    };

    ff.getHTML = function(guitar) {
        if (!guitar) return "";
        var tableContent = ff.getTable(guitar); // ff.getTable already handles some error checking
        if (tableContent.includes("Error:")) return tableContent; // Propagate error message

        var output = '<html><head><title>FretFind</title><style type="text/css">\n' +
            'table.foundfrets {border-collapse: collapse;}\n' +
            'table.foundfrets td {border:1px solid black;padding: 0px 5px 0px 5px;}\n' +
            '</style></head><body>\n' +
            tableContent +
            '</body></html>';
        return output;
    };

    ff.getDelimited = function(guitar, sep, wrap) {
        if (!guitar || !guitar.midline || !guitar.frets) {
            console.error("getDelimited: Invalid guitar object provided.");
            return "Error: Invalid guitar data for delimited output.";
        }
        if (typeof wrap === 'undefined') {
            wrap = function(x) { return x; };
        }
        var output = [wrap('Midline') + '\n' + wrap('endpoints') + sep + wrap('length') + sep + wrap('angle') + '\n' +
            wrap(guitar.midline.toString()) + sep + ff.roundFloat(guitar.midline.length()) + sep + ff.roundFloat(guitar.midline.angle()) + '\n\n']; // Added rounding
        
        for (var i = 0; i < guitar.frets.length; i++) {
            if (!guitar.frets[i]) continue;

            output.push(wrap('String ' + (i + 1)) + '\n' +
                wrap('#') + sep + wrap('to nut') + sep + wrap('to fret') + sep + wrap('to bridge') + sep +
                wrap('intersection point') + sep + wrap('partial width') + sep + wrap('angle') + sep +
                wrap('mid to nut') + sep + wrap('mid to fret') + sep + wrap('mid to bridge') + sep + wrap('mid intersection') +
                '\n');
            for (var j = 0; j < guitar.frets[i].length; j++) {
                var fretData = guitar.frets[i][j];
                if (!fretData) continue;

                output.push(wrap(j === 0 ? 'n' : j) + sep);
                output.push(ff.roundFloat(fretData.nutDist) + sep);
                output.push(ff.roundFloat(fretData.pFretDist) + sep);
                output.push(ff.roundFloat(fretData.bridgeDist) + sep);
                output.push(wrap(fretData.intersection ? fretData.intersection.toString() : 'N/A') + sep);
                output.push(ff.roundFloat(fretData.width) + sep);
                output.push(ff.roundFloat(fretData.angle) + sep);
                output.push(ff.roundFloat(fretData.midline_nutDist) + sep);
                output.push(ff.roundFloat(fretData.midline_pFretDist) + sep);
                output.push(ff.roundFloat(fretData.midline_bridgeDist) + sep);
                output.push(wrap(fretData.midline_intersection ? fretData.midline_intersection.toString() : 'N/A'));
                output.push('\n');
            }
        }
        return output.join('');
    };

    ff.getCSV = function(guitar) {
        if (!guitar) return "";
        return ff.getDelimited(guitar, ',', function(x) { return '"' + String(x).replace(/"/g, '""') + '"'; }); // Handle quotes in data
    };

    ff.getTAB = function(guitar) {
        if (!guitar) return "";
        return ff.getDelimited(guitar, '\t', function(x) { return String(x); }); // Ensure x is string
    };

}(window.ff || {}));
