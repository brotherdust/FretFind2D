/*
    Copyright (C) 2004, 2005, 2010, 2024 Aaron C Spike
    (Portions of this code were previously in fretfind.js and fretfind_ui.js)

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

// Depends on ff_setup.js for ff namespace and ff.getInt, ff.getPrecision

(function(ff) {
    'use strict';

    ff.getAlt = function(id) {
        const element = document.getElementById(id);
        if (element) {
            const selectedDt = element.querySelector('dt.selected-alt');
            return selectedDt ? selectedDt.id : null;
        }
        return null;
    };

    ff.getStr = function(id) {
        const element = document.getElementById(id);
        return element ? element.value : "";
    };

    ff.getFlt = function(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) : NaN;
    };

    // ff.getInt is already in ff_setup.js, but it's used by other functions here.
    // Ensure it's available or re-declare if ff_setup.js isn't loaded first (though it should be).
    // For safety, let's assume ff.getInt is available from ff_setup.js.
    // If it were not, it would be:
    // ff.getInt = function(id) {
    //     const element = document.getElementById(id);
    //     return element ? parseInt(element.value, 10) : NaN;
    // };


    ff.getTuning = function(id) {
        var tunings = [];
        const parentElement = document.getElementById(id);
        if (parentElement) {
            parentElement.querySelectorAll('input').forEach(item => {
                tunings.push(parseInt(item.value, 10));
            });
        }
        return tunings;
    };

    ff.setTuning = function(tuning_id, string_count_id, change_callback, tunings) {
        var strings = ff.getInt(string_count_id);
        if (isNaN(strings) || strings < 0) strings = 0; // Handle invalid string count

        if (typeof tunings === 'undefined' || !Array.isArray(tunings)) {
            tunings = ff.getTuning(tuning_id);
        }
        var output = '';
        for (var i = 0; i < strings; i++) {
            output += 'string ' + (i + 1) + ' <input type="text" value="' + (tunings[i] || 0) + '" /><br />';
        }
        const tuningElement = document.getElementById(tuning_id);
        if (tuningElement) {
            tuningElement.innerHTML = output;
            tuningElement.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', change_callback);
            });
        }
    };

    ff.getLengths = function(id) {
        var lengths = [];
        const parentElement = document.getElementById(id);
        if (parentElement) {
            parentElement.querySelectorAll('input').forEach(item => {
                lengths.push(parseFloat(item.value));
            });
        }
        return lengths;
    };

    ff.setLengths = function(length_id, string_count_id, change_callback, lengths) {
        var strings = ff.getInt(string_count_id);
        if (isNaN(strings) || strings < 0) strings = 0;

        if (typeof lengths === 'undefined' || !Array.isArray(lengths)) {
            lengths = ff.getLengths(length_id);
        }
        var output = '';
        for (var i = 0; i < strings; i++) {
            // Default length calculation: 25 for first string, increasing by 0.5 for subsequent
            var defaultLength = 25 + (i * 0.5);
            output += 'string ' + (i + 1) + ' <input type="text" value="' + (lengths[i] !== undefined && !isNaN(lengths[i]) ? lengths[i] : defaultLength) + '" /><br />';
        }
        const lengthElement = document.getElementById(length_id);
        if (lengthElement) {
            lengthElement.innerHTML = output;
            lengthElement.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', change_callback);
            });
        }
    };

    ff.getGauges = function(id) {
        var gauges = [];
        const parentElement = document.getElementById(id);
        if (parentElement) {
            parentElement.querySelectorAll('input').forEach(item => {
                gauges.push(parseFloat(item.value));
            });
        }
        return gauges;
    };

    ff.setGauges = function(gauge_id, string_count_id, change_callback, gauges) {
        var strings = ff.getInt(string_count_id);
         if (isNaN(strings) || strings < 0) strings = 0;

        if (typeof gauges === 'undefined' || !Array.isArray(gauges)) {
            gauges = ff.getGauges(gauge_id);
        }
        var output = '';
        for (var i = 0; i < strings; i++) {
            output += 'string ' + (i + 1) + ' <input type="text" value="' + (gauges[i] !== undefined && !isNaN(gauges[i]) ? gauges[i] : 0.0) + '" /><br />';
        }
        const gaugeElement = document.getElementById(gauge_id);
        if (gaugeElement) {
            gaugeElement.innerHTML = output;
            gaugeElement.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', change_callback);
            });
        }
    };
    
    ff.initHelp = function(form_id) {
        const form = document.getElementById(form_id);
        if (form) {
            form.querySelectorAll('dd.help').forEach(helpDd => {
                const dtElement = helpDd.previousElementSibling;
                // Ensure previousElementSibling is a DT and there's another DT before that one.
                if (dtElement && dtElement.tagName === 'DT' && dtElement.previousElementSibling && dtElement.previousElementSibling.tagName === 'DT') {
                    const targetDt = dtElement.previousElementSibling;

                    const helpLink = document.createElement('a');
                    helpLink.className = 'help';
                    helpLink.href = '#';
                    helpLink.textContent = '?';
                    helpLink.setAttribute('role', 'button'); // Accessibility
                    helpLink.setAttribute('aria-expanded', 'false'); // Initial state
                    helpLink.setAttribute('aria-controls', helpDd.id || (helpDd.id = 'help-' + Math.random().toString(36).substr(2, 9)));


                    targetDt.appendChild(document.createTextNode(' ['));
                    targetDt.appendChild(helpLink);
                    targetDt.appendChild(document.createTextNode(']'));

                    helpLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        const isExpanded = helpDd.style.display === 'block';
                        helpDd.style.display = isExpanded ? 'none' : 'block';
                        helpLink.setAttribute('aria-expanded', !isExpanded);
                    });
                }
            });
        }
    };

    ff.initAlternatives = function(form_id, change_callback) {
        const form = document.getElementById(form_id);
        if (form) {
            form.querySelectorAll('dl.alternative').forEach(dlAlternative => {
                const dts = Array.from(dlAlternative.children).filter(child => child.tagName === 'DT');
                const dds = Array.from(dlAlternative.children).filter(child => child.tagName === 'DD');

                dts.forEach(dtElement => {
                    let altDd = dtElement.nextElementSibling;
                    while(altDd && altDd.tagName !== 'DD') { // Find the associated DD
                        altDd = altDd.nextElementSibling;
                    }

                    if (altDd && altDd.tagName === 'DD') {
                        dtElement.setAttribute('role', 'tab'); // Accessibility
                        dtElement.setAttribute('aria-selected', 'false');
                        if (altDd.id) dtElement.setAttribute('aria-controls', altDd.id);
                        else altDd.id = 'alt-dd-' + Math.random().toString(36).substr(2,9);
                        dtElement.setAttribute('aria-controls', altDd.id);


                        dtElement.addEventListener('click', function() {
                            dts.forEach(d => {
                                d.classList.remove('selected-alt');
                                d.setAttribute('aria-selected', 'false');
                            });
                            this.classList.add('selected-alt');
                            this.setAttribute('aria-selected', 'true');
                            
                            dds.forEach(dd => {
                                dd.style.display = 'none';
                                dd.setAttribute('aria-hidden', 'true');
                            });
                            altDd.style.display = 'block';
                            altDd.setAttribute('aria-hidden', 'false');
                            
                            if (typeof change_callback === 'function') {
                                change_callback();
                            }
                        });
                    }
                });
                
                // Reorder dt elements to the top of their dlAlternative parent
                // This was part of original logic, might be important for layout/styling
                dts.slice().reverse().forEach(dtElement => { 
                    dlAlternative.insertBefore(dtElement, dlAlternative.firstChild);
                });
                
                const firstDt = dlAlternative.querySelector('dt');
                if (firstDt) {
                    firstDt.click(); // Initialize first dt as selected
                }
            });
        }
    };

    ff.updateWidthFromSpacing = function(spacingInputId, widthInputId, numStringsId) {
        const spacingInput = document.getElementById(spacingInputId);
        const widthInput = document.getElementById(widthInputId);
        const numStrings = ff.getInt(numStringsId);

        if (!spacingInput || !widthInput || isNaN(numStrings) || numStrings < 2) {
            if (numStrings < 2 && widthInput) widthInput.value = (0).toFixed(ff.getPrecision());
            return;
        }

        const spacingValue = parseFloat(spacingInput.value);
        if (isNaN(spacingValue) || spacingValue <= 0) {
            return;
        }

        const newWidth = (numStrings - 1) * spacingValue;
        if (Math.abs(parseFloat(widthInput.value) - newWidth) > 0.00001 || widthInput.value === "") {
            widthInput.value = newWidth.toFixed(ff.getPrecision());
        }
    };

    ff.updateSpacingFromWidth = function(widthInputId, spacingInputId, numStringsId) {
        const widthInput = document.getElementById(widthInputId);
        const spacingInput = document.getElementById(spacingInputId);
        const numStrings = ff.getInt(numStringsId);

        if (!widthInput || !spacingInput || isNaN(numStrings)) { // Allow numStrings = 0 or 1 for width input
            if (numStrings < 2 && spacingInput) spacingInput.value = (0).toFixed(ff.getPrecision());
            return;
        }
        
        const widthValue = parseFloat(widthInput.value);
        if (isNaN(widthValue) || widthValue < 0) {
            return;
        }
        
        if (numStrings < 2) { // If 0 or 1 string, spacing is 0 or not applicable.
            spacingInput.value = (0).toFixed(ff.getPrecision());
            return;
        }

        const newSpacing = widthValue / (numStrings - 1);
        if (Math.abs(parseFloat(spacingInput.value) - newSpacing) > 0.00001 || spacingInput.value === "") {
            spacingInput.value = newSpacing.toFixed(ff.getPrecision());
        }
    };


}(window.ff || {}));
