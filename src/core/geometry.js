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

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.toString = function() {
        return "(" + ff.roundFloat(this.x) + "," + ff.roundFloat(this.y) + ")";
    };
    Point.prototype.translate = function(x, y) {
        this.x += x;
        this.y += y;
        return this;
    };
    Point.prototype.copy = function() {
        return new ff.Point(this.x, this.y);
    };
    Point.prototype.equals = function(point) {
        // Add a check for point being null or undefined
        if (!point) return false;
        return this.x === point.x && this.y === point.y;
    };
    Point.prototype.midway = function(point) {
        if (!point) return new ff.Point(NaN, NaN); // Handle null/undefined point
        return new ff.Point((point.x + this.x) * 0.5, (point.y + this.y) * 0.5);
    };

    ff.Point = Point;


    function Segment(one, two) {
        this.end1 = one;
        this.end2 = two;
    }
    Segment.prototype.deltaX = function() {
        if (!this.end1 || !this.end2) return NaN;
        return this.end2.x - this.end1.x;
    };
    Segment.prototype.run = Segment.prototype.deltaX;
    Segment.prototype.deltaY = function() {
        if (!this.end1 || !this.end2) return NaN;
        return this.end2.y - this.end1.y;
    };
    Segment.prototype.rise = Segment.prototype.deltaY;
    Segment.prototype.slope = function() {
        var dX = this.deltaX();
        if (dX === 0 || isNaN(dX)) { // Check for NaN as well
            return NaN; // Use NaN for vertical lines or invalid segments
        }
        return this.deltaY() / dX;
    };
    Segment.prototype.intercept = function() {
        var s = this.slope();
        if (isNaN(s) || !this.end2) { // Check for NaN slope or invalid end2
            return NaN;
        }
        return this.end2.y - (this.end2.x * s);
    };
    Segment.prototype.distanceToPoint = function(point) {
        if (!point || !this.end1 || !this.end2) return NaN;
        var len = this.length();
        if (len === 0 || isNaN(len)) { // Check for NaN length
            // If segment is a point, distance is distance between the two points
            if (this.end1.equals(this.end2)) {
                return Math.sqrt(Math.pow(point.x - this.end1.x, 2) + Math.pow(point.y - this.end1.y, 2));
            }
            return NaN;
        }
        return Math.abs(((this.end2.x - this.end1.x) * (this.end1.y - point.y)) -
            ((this.end1.x - point.x) * (this.end2.y - this.end1.y))) / len;
    };
    Segment.prototype.angle = function() {
        if (isNaN(this.deltaX()) || isNaN(this.deltaY())) return NaN;
        return (180 / Math.PI) * Math.atan2(this.deltaY(), this.deltaX());
    };
    Segment.prototype.length = function() {
        if (!this.end1 || !this.end2) return NaN;
        var dX = this.deltaX();
        var dY = this.deltaY();
        if (isNaN(dX) || isNaN(dY)) return NaN;
        return Math.sqrt((dX * dX) + (dY * dY));
    };
    Segment.prototype.toString = function() {
        if (!this.end1 || !this.end2) return "(Invalid Segment)";
        return "(" + this.end1.toString() + ":" + this.end2.toString() + ")";
    };
    Segment.prototype.pointAtRatio = function(ratio) {
        if (isNaN(ratio) || !this.end1 || !this.end2 || isNaN(this.deltaX()) || isNaN(this.deltaY())) {
            return new ff.Point(NaN, NaN);
        }
        var x = this.end1.x + (ratio * this.deltaX());
        var y = this.end1.y + (ratio * this.deltaY());
        return new ff.Point(x, y);
    };
    Segment.prototype.pointAtLength = function(len) {
        if (isNaN(len)) return new ff.Point(NaN, NaN);
        var currentLength = this.length();
        if (currentLength === 0 || isNaN(currentLength)) {
            // If segment is a point, return that point if len is 0, else NaN
            return (len === 0 && this.end1) ? this.end1.copy() : new ff.Point(NaN, NaN);
        }
        var ratio = len / currentLength;
        return this.pointAtRatio(ratio);
    };
    Segment.prototype.pointAt = Segment.prototype.pointAtLength;
    Segment.prototype.midpoint = function() {
        return this.pointAtRatio(0.5);
    };
    Segment.prototype.createParallel = function(point) {
        if (!point || !this.end1 || !this.end2 || isNaN(this.deltaX()) || isNaN(this.deltaY())) {
            return new ff.Segment(new ff.Point(NaN, NaN), new ff.Point(NaN, NaN));
        }
        return new ff.Segment(new ff.Point(point.x + this.deltaX(), point.y + this.deltaY()), point.copy());
    };
    Segment.prototype.intersect = function(line) {
        if (!line || !this.end1 || !this.end2 || !line.end1 || !line.end2) {
            return new ff.Point(NaN, NaN);
        }

        var x1 = this.end1.x;
        var y1 = this.end1.y;
        var x2 = this.end2.x;
        var y2 = this.end2.y;

        var x3 = line.end1.x;
        var y3 = line.end1.y;
        var x4 = line.end2.x;
        var y4 = line.end2.y;

        // Check for NaN coordinates
        if ([x1,y1,x2,y2,x3,y3,x4,y4].some(isNaN)) return new ff.Point(NaN, NaN);

        var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

        if (denom === 0) { // Lines are parallel or collinear
            return new ff.Point(NaN, NaN); // No single intersection point
        }

        var ua_num = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
        // var ub_num = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3)); // Not needed for infinite line intersection

        var ua = ua_num / denom;
        // var ub = ub_num / denom; // For checking if intersection is within segments

        var ix = x1 + ua * (x2 - x1);
        var iy = y1 + ua * (y2 - y1);

        return new ff.Point(ix, iy);
    };
    Segment.prototype.translate = function(x, y) {
        if (isNaN(x) || isNaN(y)) return this;
        if (this.end1) this.end1.translate(x, y);
        if (this.end2) this.end2.translate(x, y);
        return this;
    };
    Segment.prototype.equals = function(line) {
        if (!line || !this.end1 || !this.end2 || !line.end1 || !line.end2) return false;
        return (this.end1.equals(line.end1) && this.end2.equals(line.end2)) ||
               (this.end1.equals(line.end2) && this.end2.equals(line.end1));
    };
    Segment.prototype.copy = function() {
        if (!this.end1 || !this.end2) return new ff.Segment(new ff.Point(NaN,NaN), new ff.Point(NaN,NaN));
        return new ff.Segment(this.end1.copy(), this.end2.copy());
    };
    Segment.prototype.toSVGD = function() {
        if (!this.end1 || !this.end2 || isNaN(this.end1.x) || isNaN(this.end1.y) || isNaN(this.end2.x) || isNaN(this.end2.y)) {
            return 'M0 0L0 0'; // Default path for invalid segment
        }
        return 'M' + ff.roundFloat(this.end1.x) + ' ' + ff.roundFloat(this.end1.y) +
               'L' + ff.roundFloat(this.end2.x) + ' ' + ff.roundFloat(this.end2.y);
    };

    ff.Segment = Segment;

}(window.ff || {})); // Pass existing ff or a new object if ff is not defined
