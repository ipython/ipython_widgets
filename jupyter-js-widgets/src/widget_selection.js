// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var _ = require('underscore');

var SelectionModel = widget.DOMWidgetModel.extend({
    defaults: _.extend({}, widget.DOMWidgetModel.prototype.defaults, {
        _model_name: 'SelectionModel',
        value: '',
        _options_labels: [],
        disabled: false,
        description: ''
    })
});

var DropdownModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'DropdownModel',
        _view_name: 'DropdownView',
        button_style: ''
    })
});

var DropdownView = widget.DOMWidgetView.extend({
    remove: function() {
        document.body.removeChild(this.droplist);
        return DropdownView.__super__.remove.call(this);
    },
    render: function() {
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-dropdown');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.buttongroup = document.createElement('div');
        this.buttongroup.className = 'widget_item';
        this.el.appendChild(this.buttongroup);

        this.droplabel = document.createElement('button');
        this.droplabel.className = 'widget-dropdown-toggle ' +
            'widget-toggle-button';
        this.droplabel.innerHTML = '&nbsp;';
        this.buttongroup.appendChild(this.droplabel);

        this.dropbutton = document.createElement('button');
        this.dropbutton.className = 'widget-dropdown-toggle ' +
            'widget-toggle-button';

        this.caret = document.createElement('i');
        this.caret.className = 'widget-caret';
        this.dropbutton.appendChild(this.caret);
        this.buttongroup.appendChild(this.dropbutton);

        this.droplist = document.createElement('ul');
        this.droplist.className = 'widget-dropdown-droplist';
        document.body.appendChild(this.droplist);
        this.droplist.addEventListener('click', this._handle_click.bind(this));

        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update_button_style();

        // Set defaults.
        this.update();
    },

    update : function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var links = _.pluck(this.droplist.querySelectorAll('a'), 'textContent');
        var disabled = this.model.get('disabled');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (links[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            this.droplist.textContent = '';
            _.each(items, function(item) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.setAttribute('href', '#');
                a.textContent = item;
                li.appendChild(a);
                view.droplist.appendChild(li);
            });
        }

        this.dropbutton.disabled = disabled;
        this.caret.disabled = disabled;

        var value = this.model.get('value') || '';
        if (value.trim().length === 0) {
            this.droplabel.innerHTML = '&nbsp;';
        } else {
            this.droplabel.textContent = value;
        }

        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.typeset(this.label, description);
            this.label.style.display = '';
        }

        return DropdownView.__super__.update.call(this);
    },

    update_button_style: function() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        this.update_mapped_classes(class_map, 'button_style', this.droplabel);
        this.update_mapped_classes(class_map, 'button_style', this.dropbutton);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name.substring(0, 6) === 'border' ||
            name === 'background' ||
            name === 'color') {
            this.droplabel.style[name] = value;
            this.dropbutton.style[name] = value;
            this.droplist.style[name] = value;
        } else {
            this.el.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'click button.widget-toggle-button': '_toggle'
    },

    _handle_click: function(event) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        // Manually hide the droplist.
        event.stopPropagation();
        event.preventDefault();
        this._toggle(event);

        var value = event.target.textContent;
        this.model.set('value', value, { updated_view: this });
        this.touch();
    },

    /**
     * Toggle the dropdown list.
     *
     * If the dropdown list doesn't fit below the dropdown label, this will
     * cause the dropdown to be dropped 'up'.
     * @param  {Event} event
     */
    _toggle: function(event) {
        event.preventDefault();
        _.each(this.buttongroup.querySelectorAll('button'), function(button) {
            button.blur();
        });

        if (this.droplist.classList.contains('mod-active')) {
            this.droplist.classList.remove('mod-active');
            return;
        }


        var buttongroupRect = this.buttongroup.getBoundingClientRect();
        var availableHeightAbove = buttongroupRect.top;
        var availableHeightBelow = window.innerHeight -
            buttongroupRect.bottom - buttongroupRect.height;
        var droplistRect = this.droplist.getBoundingClientRect();

        // Account for 1px border.
        this.droplist.style.left = (buttongroupRect.left - 1) + 'px';

        // If dropdown fits below, render below.
        if (droplistRect.height <= availableHeightBelow) {
            // Account for 1px border.
            this.droplist.style.top = (buttongroupRect.bottom - 1) + 'px';
            this.droplist.style.maxHeight = 'none';
            this.droplist.classList.add('mod-active');
            return;
        }
        // If droplist fits above, render above.
        if (droplistRect.height <= availableHeightAbove) {
            // Account for 1px border.
            this.droplist.style.top = (buttongroupRect.top -
                droplistRect.height + 1) + 'px';
            this.droplist.style.maxHeight = 'none';
            this.droplist.classList.add('mod-active');
            return;
        }
        // Otherwise, render in whichever has more space, above or below, and
        // set the maximum height of the drop list.
        if (availableHeightBelow >= availableHeightAbove) {
            // Account for 1px border.
            this.droplist.style.top = (buttongroupRect.bottom - 1) + 'px';
            this.droplist.style.maxHeight = availableHeightBelow + 'px';
            this.droplist.classList.add('mod-active');
            return;
        } else {
            // Account for 1px border.
            this.droplist.style.top = (buttongroupRect.top -
                droplistRect.height + 1) + 'px';
            this.droplist.style.maxHeight = availableHeightAbove + 'px';
            this.droplist.classList.add('mod-active');
            return;
        }
    }
});

var RadioButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'RadioButtonsModel',
        _view_name: 'RadioButtonsView',
        tooltips: [],
        icons: [],
        button_style: ''
    })
});

var RadioButtonsView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-radio');

        this.label = document.createElement('div');
        this.label.className = 'widget-label';
        this.label.style.display = 'block';
        this.el.appendChild(this.label);

        this.container = document.createElement('div');
        this.el.appendChild(this.container);
        this.container.classList.add('widget-radio-box');

        this.update();
    },

    update : function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var radios = _.pluck(
            this.container.querySelectorAll('input[type="radio"]'),
            'value'
        );
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (radios[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            // Add items to the DOM.
            this.container.textContent = '';
            _.each(items, function(item) {
                var label = document.createElement('label');
                label.textContent = item;
                view.container.appendChild(label);

                var radio = document.createElement('input');
                radio.setAttribute('type', 'radio');
                radio.value = item;
                radio.setAttribute('data-value', encodeURIComponent(item));
                label.appendChild(radio);
            });
        }
        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.label.textContent = description;
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
        _.each(items, function(item) {
            var item_query = 'input[data-value="' +
                encodeURIComponent(item) + '"]';
            var radio = view.container.querySelectorAll(item_query);
            if (radio.length > 0) {
              var radio_el = radio[0];
              radio_el.checked = view.model.get('value') === item;
              radio_el.disabled = view.model.get('disabled');
            }
        });
        return RadioButtonsView.__super__.update.call(this);
    },

    update_attr: function(name, value) {
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.el.style[name] = value;
        } else {
            this.container.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'click input[type="radio"]': '_handle_click'
    },

    _handle_click: function (event) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = event.target.value;
        this.model.set('value', value, {updated_view: this});
        this.touch();
    }
});

var ToggleButtonsModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'ToggleButtonsModel',
        _view_name: 'ToggleButtonsView'
    })
});

var ToggleButtonsView = widget.DOMWidgetView.extend({
    initialize: function() {
        this._css_state = {};
        ToggleButtonsView.__super__.initialize.apply(this, arguments);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widgets-hbox');
        this.el.classList.add('widget-toggle-buttons');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.buttongroup = document.createElement('div');
        this.el.appendChild(this.buttongroup);

        this.listenTo(this.model, 'change:button_style', this.update_button_style, this);
        this.update();
    },

    update : function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var icons = this.model.get('icons') || [];
        var previous_icons = this.model.previous('icons') || [];
        var tooltips = view.model.get('tooltips') || [];
        var disabled = this.model.get('disabled');
        var buttons = this.buttongroup.querySelectorAll('button');
        var values = _.pluck(buttons, 'value');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (values[i] !== items[i] || icons[i] !== previous_icons[i]) {
                stale = true;
                break;
            }
        }

        if (stale && options === undefined || options.updated_view !== this) {
            // Add items to the DOM.
            this.buttongroup.textContent = '';
            _.each(items, function(item, index) {
                var item_html;
                var empty = item.trim().length === 0 &&
                    (!icons[index] || icons[index].trim().length === 0);
                if (empty) {
                    item_html = '&nbsp;';
                } else {
                    item_html = utils.escape_html(item);
                }

                var icon = document.createElement('i');
                var button = document.createElement('button');
                if (icons[index]) {
                    icon.className = 'fa fa-' + icons[index];
                }
                button.setAttribute('type', 'button');
                button.className = 'widget-toggle-button';
                button.innerHTML = item_html;
                button.setAttribute('data-value', encodeURIComponent(item));
                button.setAttribute('value', item);
                button.appendChild(icon);
                button.disabled = disabled;
                if (tooltips[index]) {
                    button.setAttribute('title', tooltips[index]);
                }
                view.update_style_traits(button);
                view.buttongroup.appendChild(button);
            });
        }

        // Select active button.
        _.each(items, function(item) {
            var item_query = '[data-value="' + encodeURIComponent(item) + '"]';
            var button = view.buttongroup.querySelector(item_query);
            if (view.model.get('value') === item) {
                button.classList.add('mod-active');
            } else {
                button.classList.remove('mod-active');
            }
        });

        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.label.textContent = '';
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
        this.update_button_style();
        return ToggleButtonsView.__super__.update.call(this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.el.style[name] = value;
        } else {
            this._css_state[name] = value;
            this.update_style_traits();
        }
    },

    update_style_traits: function(button) {
        for (var name in this._css_state) {
            if (this._css_state.hasOwnProperty(name)) {
                if (name == 'margin') {
                    this.buttongroup.style[name] = this._css_state[name];
                } else if (name != 'width') {
                    if (button) {
                        button.style[name] = this._css_state[name];
                    } else {
                        var btns = this.buttongroup.querySelectorAll('button');
                        if (btns.length) {
                          btns[0].style[name] = this._css_state[name];
                        }
                    }
                }
            }
        }
    },

    update_button_style: function() {
        var class_map = {
            primary: ['mod-primary'],
            success: ['mod-success'],
            info: ['mod-info'],
            warning: ['mod-warning'],
            danger: ['mod-danger']
        };
        var view = this;
        var buttons = this.buttongroup.querySelectorAll('button');
        _.each(buttons, function(button) {
            view.update_mapped_classes(class_map, 'button_style', button);
        });
    },

    events: {
        // Dictionary of events and their handlers.
        'click button': '_handle_click'
    },

    _handle_click: function (event) {
        /**
         * Handle when a value is clicked.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = event.target.getAttribute('value');
        this.model.set('value', value, { updated_view: this });
        this.touch();
    }
});

var SelectModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'SelectModel',
        _view_name: 'SelectView'
    })
});

var SelectView = widget.DOMWidgetView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-select');

        this.label = document.createElement('div');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';

        this.listbox = document.createElement('select');
        this.listbox.className = 'widget-listbox';
        this.listbox.setAttribute('size', '6');
        this.el.appendChild(this.listbox);

        this.update();
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        var view = this;
        var items = this.model.get('_options_labels');
        var options = _.pluck(this.listbox.options, 'value');
        var stale = false;

        for (var i = 0, len = items.length; i < len; ++i) {
            if (options[i] !== items[i]) {
                stale = true;
                break;
            }
        }

        if (stale && (options === undefined || options.updated_view !== this)) {
            // Add items to the DOM.
            this.listbox.textContent = '';

            _.each(items, function(item, index) {
                var item_query = 'option[data-value="' +
                    encodeURIComponent(item) + '"]';
                var item_exists = view.listbox
                    .querySelectorAll(item_query).length !== 0;
                var option;
                if (!item_exists) {
                    option = document.createElement('option');
                    option.textContent = item.replace ?
                        item.replace(/ /g, '\xa0') : item;
                    option.setAttribute('data-value', encodeURIComponent(item));
                    option.value = item;
                    view.listbox.appendChild(option);
                }
            });

            // Disable listbox if needed
            this.listbox.disabled = this.model.get('disabled');

            // Select the correct element
            var value = view.model.get('value');
            view.listbox.selectedIndex = items.indexOf(value);

            var description = this.model.get('description');
            if (description.length === 0) {
                this.label.style.display = 'none';
            } else {
                this.typeset(this.label, description);
                this.label.style.display = '';
            }
        }
        return SelectView.__super__.update.call(this);
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'padding' || name == 'margin') {
            this.el.style[name] = value;
        } else {
            this.listbox.style[name] = value;
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'change select': '_handle_change'
    },

    _handle_change: function() {
        /**
         * Handle when a new value is selected.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */
        var value = this.listbox.options[this.listbox.selectedIndex].value;
        this.model.set('value', value, {updated_view: this});
        this.touch();
    }
});

var SelectionSliderModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'SelectionSliderModel',
        _view_name: 'SelectionSliderView',
        orientation: 'horizontal',
        readout: true
    })
});

var SelectionSliderView = widget.DOMWidgetView.extend({
    render : function() {
        /**
         * Called when view is rendered.
         */
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-hbox');
        this.el.classList.add('widget-hslider');

        this.label = document.createElement('div');
        this.label.classList.add('widget-label');
        this.label.style.display = 'none';
        this.el.appendChild(this.label);

        this.slider = document.createElement('input');
        this.slider.setAttribute('type', 'range');
        this.slider.classList.add('slider'); // TODO - is this necessary.

        // Put the slider in a container
        this.slider_container = document.createElement('div');
        this.slider_container.classList.add('slider-container');
        this.slider_container.appendChild(this.$slider[0]);
        this.$el.append(this.slider_container);

        this.readout = document.createElement('div');
        this.$el.append(this.readout);
        this.readout.classList.add('widget-readout');
        this.readout.style.display = 'none';

        this.listenTo(this.model, 'change:slider_color', function(sender, value) {
            this.$slider.find('a').css('background', value);
        }, this);
        this.listenTo(this.model, 'change:description', function(sender, value) {
            this.updateDescription();
        }, this);

        this.$slider.find('a').css('background', this.model.get('slider_color'));

        // Set defaults.
        this.update();
        this.updateDescription();
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (name == 'color') {
            this.readout.style[name] = value;
        } else if (name.substring(0, 4) == 'font') {
            this.readout.style[name] = value;
        } else if (name.substring(0, 6) == 'border') {
            var slider_items = this.slider.getElementsByClassName('a');
            if (slider_items.length) {
              slider_items[0].style[name] = value;
            }

            this.slider_container.style[name] = value;
        } else if (name == 'background') {
            this.slider_container.style[name] = value;
        } else {
            this.el.style[name] = value;
        }
    },

    updateDescription: function(options) {
        var description = this.model.get('description');
        if (description.length === 0) {
            this.label.style.display = 'none';
        } else {
            this.typeset(this.label, description);
            this.label.style.display = '';
        }
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view != this) {
            var labels = this.model.get('_options_labels');
            var max = labels.length - 1;
            var min = 0;
            // this.$slider.slider('option', 'step', 1); // DW TODO
            // this.$slider.slider('option', 'max', max); // DW TODO
            // this.$slider.slider('option', 'min', min); // DW TODO

            // WORKAROUND FOR JQUERY SLIDER BUG.
            // The horizontal position of the slider handle
            // depends on the value of the slider at the time
            // of orientation change.  Before applying the new
            // workaround, we set the value to the minimum to
            // make sure that the horizontal placement of the
            // handle in the vertical slider is always
            // consistent.
            var orientation = this.model.get('orientation');
            // this.$slider.slider('option', 'value', min); // DW TODO
            // this.$slider.slider('option', 'orientation', orientation); // DW TODO

            var value = this.model.get('value');
            var index = labels.indexOf(value);
            // this.$slider.slider('option', 'value', index);
            this.readout.textContent = value;

            // Use the right CSS classes for vertical & horizontal sliders
            if (orientation === 'vertical') {
                // this.$el
                //     .removeClass('widget-hslider')
                //     .addClass('widget-vslider');
                this.el.classList.remove('widget-hslider');
                this.el.classList.add('widget-vslider');

                // this.$el
                //     .removeClass('widget-hbox')
                //     .addClass('widget-vbox');
              this.el.classList.remove('widget-hbox');
              this.el.classList.add('widget-vbox');

            } else {
                // this.$el
                //     .removeClass('widget-vslider')
                //     .addClass('widget-hslider');
                this.el.classList.remove('widget-vslider');
                this.el.classList.add('widget-hslider');

                // this.$el
                //     .removeClass('widget-vbox')
                //     .addClass('widget-hbox');
                this.el.classList.remove('widget-vbox');
                this.el.classList.add('widget-hbox');
            }

            var readout = this.model.get('readout');
            if (readout) {
                // this.$readout.show();
                this.readout.style.display = '';
            } else {
                // this.$readout.hide();
                this.readout.style.display = 'none';
            }
        }
        return SelectionSliderView.__super__.update.call(this);
    },

    events: {
        // Dictionary of events and their handlers.
        'slide': 'handleSliderChange',
        'slidestop': 'handleSliderChanged'
    },

    /**
     * Called when the slider value is changing.
     */
    handleSliderChange: function(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var value = this.model.get('_options_labels')[actual_value];
        // this.$readout.text(value);
        this.readout.textContent = value;

        // Only persist the value while sliding if the continuous_update
        // trait is set to true.
        if (this.model.get('continuous_update')) {
            this.handleSliderChanged(e, ui);
        }
    },

    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged: function(e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        var value = this.model.get('_options_labels')[actual_value];
        // this.$readout.text(value);
        this.readout.textContent = value;
        this.model.set('value', value, {updated_view: this});
        this.touch();
    },

    _validate_slide_value: function(x) {
        /**
         * Validate the value of the slider before sending it to the back-end
         * and applying it to the other views on the page.
         *
         * Double bit-wise not truncates the decimal (int cast).
         */
        return Math.floor(x);
    }
});

var MultipleSelectionModel = SelectionModel.extend({
    defaults: _.extend({}, SelectionModel.prototype.defaults, {
        _model_name: 'MultipleSelectionModel',
    })
});

var SelectMultipleModel = MultipleSelectionModel.extend({
    defaults: _.extend({}, MultipleSelectionModel.prototype.defaults, {
        _model_name: 'SelectMultipleModel',
        _view_name: 'SelectMultipleView'
    })
});

var SelectMultipleView = SelectView.extend({
    render: function() {
        /**
         * Called when view is rendered.
         */
        SelectMultipleView.__super__.render.call(this);
        this.el.classList.remove('widget-select');
        this.el.classList.add('widget-select-multiple');
        this.listbox.multiple = true;

        this.update();
    },

    update: function() {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        SelectMultipleView.__super__.update.apply(this, arguments);
        var value = this.model.get('value');
        var values = _.map(value, encodeURIComponent);
        var options = this.listbox.options;
        for (var i = 0, len = options.length; i < len; ++i) {
            var value = options[i].getAttribute('data-value');
            options[i].selected = _.contains(values, value);
        }
    },

    events: {
        // Dictionary of events and their handlers.
        'change select': '_handle_change'
    },

    _handle_change: function() {
        /**
         * Handle when a new value is selected.
         *
         * Calling model.set will trigger all of the other views of the
         * model to update.
         */

        // In order to preserve type information correctly, we need to map
        // the selected indices to the options list.
        var items = this.model.get('_options_labels');
        var value = Array.prototype.map
            .call(this.listbox.selectedOptions || [], function(option) {
                return items[option.index];
            });

        this.model.set('value', value, {updated_view: this});
        this.touch();
    }
});

module.exports = {
    SelectionModel: SelectionModel,
    DropdownView: DropdownView,
    DropdownModel: DropdownModel,
    RadioButtonsView: RadioButtonsView,
    RadioButtonsModel: RadioButtonsModel,
    ToggleButtonsView: ToggleButtonsView,
    ToggleButtonsModel: ToggleButtonsModel,
    SelectView: SelectView,
    SelectModel: SelectModel,
    SelectionSliderView: SelectionSliderView,
    SelectionSliderModel: SelectionSliderModel,
    MultipleSelectionModel: MultipleSelectionModel,
    SelectMultipleView: SelectMultipleView,
    SelectMultipleModel: SelectMultipleModel
};
