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

// Depends on ff_setup.js for ff namespace and ff.strip

(function(ff) {
    'use strict';

    function Scale() {
        // initial step 0 or 1/1 is implicit
        this.steps = [[1, 1]];
        this.title = '';
        this.errors = 0;
        this.errorstrings = [];
    }
    Scale.prototype.addError = function(str) {
        this.errors++;
        this.errorstrings.push(str);
        return this;
    };
    Scale.prototype.addStep = function(num, denom) {
        if (isNaN(num) || isNaN(denom) || denom === 0) {
            this.addError('Error: Invalid step ratio ' + num + '/' + denom);
            this.steps.push([NaN, NaN]); // Add NaN to indicate error but maintain step count
        } else {
            this.steps.push([num, denom]);
        }
        return this;
    };

    ff.Scale = Scale;

    ff.etScale = function(tones, octave) {
        if (typeof octave === 'undefined') {
            octave = 2;
        }
        var scale = new ff.Scale();
        if (tones === 0 || isNaN(tones)) { // Added NaN check for tones
            scale.addError('Error: Number of tones must be non-zero and numeric!');
        } else {
            var ratio = Math.pow(octave, 1 / tones);
            scale.addStep(ratio, 1);
            scale.title = tones.toString() + ' root of ' + octave.toString() + ' Equal Temperament';
        }
        return scale;
    };

    ff.scalaScale = function(scalaInput) {
        var scale = new ff.Scale();
        if (typeof scalaInput !== 'string') {
            scale.addError('Error: Scala input must be a string.');
            return scale;
        }

        // split lines
        var rawlines = ff.strip(scalaInput).split(/[\n\r]+/);
        // strip whitespace from all lines
        // discard comments, lines beginning with !
        var alllines = [];
        var comment = /^!/;
        for (var i = 0; i < rawlines.length; i++) {
            var line = ff.strip(rawlines[i]);
            if (!comment.test(line)) {
                alllines.push(line);
            }
        }

        if (alllines.length < 2) {
            scale.addError('Error: Scala input is too short. Missing title or tone count.');
            return scale;
        }

        // first line may be blank and contains the title
        scale.title = alllines.shift();

        // second line indicates the number of note lines that should follow
        var expected = parseInt(alllines.shift(), 10);
        if (isNaN(expected)) {
            scale.addError('Error: Expected number of tones is not a valid number.');
            return scale;
        }


        // discard blank lines and anything following whitespace
        var lines = [];
        for (var i = 0; i < alllines.length; i++) {
            var line = alllines[i];
            if (line.length > 0) {
                lines.push(line.split(/\s+/)[0]);
            }
        }

        if (lines.length !== expected) {
            scale.addError('Error: expected ' + expected.toString() + ' more tones but found ' + lines.length.toString() + '!');
        } else {
            for (var i = 0; i < lines.length; i++) {
                var l = lines[i];
                var num = 0;
                var denom = 1;
                if (/\./.test(l)) { // interpret any line containing a dot as cents
                    num = Math.pow(2, parseFloat(l) / 1200);
                    if (isNaN(num)) { // Check if parseFloat result was valid
                        scale.addError('Error at "' + l + '": Invalid cents value.');
                        num = NaN; denom = NaN; // Mark as invalid
                    }
                } else if (/\//.test(l)) { // ratio
                    var parts = l.split(/\//);
                    num = parseInt(parts[0], 10);
                    denom = parseInt(parts[1], 10);
                    if (isNaN(num) || isNaN(denom)) {
                         scale.addError('Error at "' + l + '": Invalid ratio component.');
                         num = NaN; denom = NaN;
                    }
                } else { // integer (assumed to be ratio over 1, or cents if it's the only format)
                    num = parseInt(l, 10);
                     if (isNaN(num)) {
                         scale.addError('Error at "' + l + '": Invalid integer value.');
                         num = NaN; denom = NaN;
                    }
                    // Scala spec is a bit ambiguous here. If it's an integer, it could be cents or a ratio.
                    // Common practice: if no dots or slashes, it's cents if others are cents, or ratio N/1.
                    // FretFind's original logic implies it's N/1.
                }
                scale.addStep(num, denom); // addStep now handles NaN checks

                if (num < 0 || denom <= 0) { // This check might be redundant if addStep handles it
                    if (!isNaN(num) && !isNaN(denom)) { // Only add error if not already caught by addStep's NaN check
                        scale.addError('Error at "' + l + '": Negative or zero/undefined ratios are not allowed!');
                    }
                }
            }
        }
        return scale;
    };

}(window.ff || {}));
