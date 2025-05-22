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

    // Helper function to get the active tab ID within an alternative container
    ff.getAlt = function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            // Query for the button with data-state="active"
            const selectedButton = container.querySelector('.tab-button[data-state="active"]');
            return selectedButton ? selectedButton.id : null;
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

    // ff.getInt is assumed to be available from ff_setup.js

    ff.getTuning = function(id) {
        var tunings = [];
        const parentElement = document.getElementById(id);
        if (parentElement) {
            parentElement.querySelectorAll('input[type="text"]').forEach(item => {
                tunings.push(parseInt(item.value, 10));
            });
        }
        return tunings;
    };

    ff.setTuning = function(tuning_id, string_count_id, change_callback, tunings) {
        var strings = ff.getInt(string_count_id);
        if (isNaN(strings) || strings < 0) strings = 0;

        if (typeof tunings === 'undefined' || !Array.isArray(tunings)) {
            tunings = ff.getTuning(tuning_id);
        }
        
        const tuningElement = document.getElementById(tuning_id);
        if (tuningElement) {
            tuningElement.innerHTML = ''; // Clear previous inputs
            for (var i = 0; i < strings; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mb-2 flex items-center';
                
                const label = document.createElement('label');
                label.htmlFor = `tuning-string-${i+1}`;
                label.textContent = `String ${i + 1}:`;
                label.className = 'mr-2 text-sm text-muted-foreground';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `tuning-string-${i+1}`;
                input.value = (tunings[i] || 0);
                // Using more generic input classes consistent with shadcn/ui
                input.className = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
                input.addEventListener('change', change_callback);

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                tuningElement.appendChild(wrapper);
            }
        }
    };

    ff.getLengths = function(id) {
        var lengths = [];
        const parentElement = document.getElementById(id);
        if (parentElement) {
            parentElement.querySelectorAll('input[type="text"]').forEach(item => {
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
        
        const lengthElement = document.getElementById(length_id);
        if (lengthElement) {
            lengthElement.innerHTML = ''; // Clear previous inputs
            for (var i = 0; i < strings; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mb-2 flex items-center';

                const label = document.createElement('label');
                label.htmlFor = `length-string-${i+1}`;
                label.textContent = `String ${i + 1}:`;
                label.className = 'mr-2 text-sm text-muted-foreground';

                var defaultLength = 25 + (i * 0.5); // Original default logic
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `length-string-${i+1}`;
                input.value = (lengths[i] !== undefined && !isNaN(lengths[i]) ? lengths[i] : defaultLength);
                input.className = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
                input.addEventListener('change', change_callback);

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                lengthElement.appendChild(wrapper);
            }
        }
    };

    ff.getGauges = function(id) {
        var gauges = [];
        const parentElement = document.getElementById(id);
        if (parentElement) {
            parentElement.querySelectorAll('input[type="text"]').forEach(item => {
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
        
        const gaugeElement = document.getElementById(gauge_id);
        if (gaugeElement) {
            gaugeElement.innerHTML = ''; // Clear previous inputs
            for (var i = 0; i < strings; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mb-2 flex items-center';

                const label = document.createElement('label');
                label.htmlFor = `gauge-string-${i+1}`;
                label.textContent = `String ${i + 1}:`;
                label.className = 'mr-2 text-sm text-muted-foreground';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `gauge-string-${i+1}`;
                input.value = (gauges[i] !== undefined && !isNaN(gauges[i]) ? gauges[i] : 0.0);
                input.className = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
                input.addEventListener('change', change_callback);

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                gaugeElement.appendChild(wrapper);
            }
        }
    };
    
    ff.initHelp = function(form_id) {
        const form = document.getElementById(form_id);
        if (form) {
            const helpDivs = form.querySelectorAll('.help');
            helpDivs.forEach((helpDiv, index) => {
                const helpId = helpDiv.id || `help-content-${index}`;
                helpDiv.id = helpId;
                helpDiv.style.display = 'none'; 

                let targetParent = helpDiv.closest('.mb-4, .mt-4, .mb-6'); // Common parent containers for form field groups
                let targetElement = null;
                if (targetParent) {
                     targetElement = targetParent.querySelector('label, h2, h3');
                } else { // Fallback if not in a typical group
                    targetElement = helpDiv.previousElementSibling;
                }


                if (targetElement) {
                    const helpLink = document.createElement('button');
                    helpLink.className = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline h-auto p-0 ml-1';
                    helpLink.textContent = '[?]'; // More explicit than just '?'
                    helpLink.setAttribute('type', 'button'); 
                    helpLink.setAttribute('aria-expanded', 'false');
                    helpLink.setAttribute('aria-controls', helpId);

                    targetElement.classList.add('inline-flex', 'items-center'); 
                    targetElement.appendChild(helpLink);
                    
                    helpLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        const isExpanded = helpDiv.style.display === 'block';
                        helpDiv.style.display = isExpanded ? 'none' : 'block';
                        helpLink.setAttribute('aria-expanded', String(!isExpanded));
                    });
                }
            });
        }
    };

    ff.initAlternatives = function(form_id, change_callback) {
        const form = document.getElementById(form_id);
        if (form) {
            form.querySelectorAll('div.alternative').forEach(altContainer => {
                const tabButtons = altContainer.querySelectorAll('.tab-button');
                const tabContents = Array.from(altContainer.querySelectorAll('.tab-content'));

                if (tabButtons.length === 0 || tabContents.length === 0) return;

                tabButtons.forEach((button, index) => {
                    const contentPane = tabContents[index];
                    if (!contentPane) return;

                    button.setAttribute('role', 'tab');
                    button.setAttribute('data-state', 'inactive'); // Initialize all to inactive
                    button.setAttribute('aria-selected', 'false');
                    button.setAttribute('aria-controls', contentPane.id || (contentPane.id = `tab-content-${altContainer.id}-${button.id || index}`));
                    contentPane.setAttribute('role', 'tabpanel');
                    contentPane.setAttribute('aria-labelledby', button.id);
                    contentPane.classList.add('hidden'); // Ensure all content panes are initially hidden

                    button.addEventListener('click', function() {
                        // Deactivate all buttons and hide all panes in this group
                        tabButtons.forEach(btn => {
                            btn.setAttribute('data-state', 'inactive');
                            btn.setAttribute('aria-selected', 'false');
                        });
                        tabContents.forEach(pane => {
                            pane.classList.add('hidden');
                            pane.setAttribute('aria-hidden', 'true');
                        });

                        // Activate clicked button and show its pane
                        this.setAttribute('data-state', 'active');
                        this.setAttribute('aria-selected', 'true');
                        
                        contentPane.classList.remove('hidden');
                        contentPane.setAttribute('aria-hidden', 'false');
                        
                        if (typeof change_callback === 'function') {
                            change_callback();
                        }
                    });
                });
                
                // Initialize the first tab as active, if any
                const firstButton = tabButtons[0];
                if (firstButton) {
                    // Manually set first tab to active and show its content
                    firstButton.setAttribute('data-state', 'active');
                    firstButton.setAttribute('aria-selected', 'true');
                    const firstContentPane = tabContents[0];
                    if (firstContentPane) {
                        firstContentPane.classList.remove('hidden');
                        firstContentPane.setAttribute('aria-hidden', 'false');
                    }
                    // Do not call firstButton.click() here to avoid double-triggering change_callback on init
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

        if (!widthInput || !spacingInput || isNaN(numStrings)) {
            if (spacingInput) spacingInput.value = (0).toFixed(ff.getPrecision());
            return;
        }
        
        const widthValue = parseFloat(widthInput.value);
        if (isNaN(widthValue) || widthValue < 0) {
            return;
        }
        
        if (numStrings < 2) { 
            spacingInput.value = (0).toFixed(ff.getPrecision());
            return;
        }

        const newSpacing = widthValue / (numStrings - 1);
        if (Math.abs(parseFloat(spacingInput.value) - newSpacing) > 0.00001 || spacingInput.value === "") {
            spacingInput.value = newSpacing.toFixed(ff.getPrecision());
        }
    };

}(window.ff || (window.ff = {})));
