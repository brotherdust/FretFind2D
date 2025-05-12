/*
    Copyright (C) 2004, 2005, 2010, 2024 Aaron C Spike
    (Portions of this code were previously in fretfind.js)

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

// Initializes the ff (FretFind) namespace and provides core utility functions.
var ff = {
    precision: 5,

    getPrecision: function() {
        return this.precision;
    },

    setPrecision: function(x) {
        this.precision = x;
    },

    // Rounds a float to the current precision or a specified number of decimal places.
    // If intDecimal is not provided, ff.precision is used.
    roundFloat: function(fltValue, intDecimal) {
        var p = (typeof intDecimal !== 'undefined') ? intDecimal : this.precision;
        if (isNaN(fltValue) || fltValue === null) return NaN; // Handle non-numeric inputs gracefully
        // Correct rounding for negative numbers and prevent floating point inaccuracies with toFixed
        var factor = Math.pow(10, p);
        return Math.round(fltValue * factor) / factor;
    },

    // Removes whitespace from both ends of a string.
    strip: function(str) {
        if (typeof str !== 'string') return ''; // Handle non-string inputs
        return str.replace(/^\s+|\s+$/g, '');
    },

    getInt: function(id) {
        const element = document.getElementById(id);
        // parseInt will return NaN if element.value is not a number, or if element is null.
        // Added radix 10 for clarity and to prevent octal interpretation for strings starting with '0'
        return element ? parseInt(element.value, 10) : NaN;
    }
};

// Expose ff to the global window object
if (typeof window !== 'undefined') {
    window.ff = ff;
}
