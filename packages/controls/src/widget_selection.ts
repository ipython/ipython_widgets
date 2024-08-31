// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { WidgetView } from '@jupyter-widgets/base';

import { CoreDescriptionModel } from './widget_core';

import { DescriptionStyleModel, DescriptionView } from './widget_description';

import { uuid } from './utils';

import noUiSlider from 'nouislider';
import * as utils from './utils';

export class SelectionModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'SelectionModel',
      index: '',
      _options_labels: [],
      disabled: false,
    };
  }
}

export class SelectionView extends DescriptionView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render(); // Incl. setting some defaults.
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    super.update();

    // Disable listbox if needed
    if (this.listbox) {
      this.listbox.disabled = this.model.get('disabled');
    }

    // Set tabindex
    this.updateTabindex();
    this.updateTooltip();
  }

  updateTabindex(): void {
    if (!this.listbox) {
      return; // we might be constructing the parent
    }
    const tabbable = this.model.get('tabbable');
    if (tabbable === true) {
      this.listbox.setAttribute('tabIndex', '0');
    } else if (tabbable === false) {
      this.listbox.setAttribute('tabIndex', '-1');
    } else if (tabbable === null) {
      this.listbox.removeAttribute('tabIndex');
    }
  }

  updateTooltip(): void {
    if (!this.listbox) return; // we might be constructing the parent
    const title = this.model.get('tooltip');
    if (!title) {
      this.listbox.removeAttribute('title');
    } else if (this.model.get('description').length === 0) {
      this.listbox.setAttribute('title', title);
    }
  }

  listbox: HTMLSelectElement;
}

export class DropdownModel extends SelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'DropdownModel',
      _view_name: 'DropdownView',
      button_style: '',
    };
  }
}

// TODO: Make a Lumino dropdown control, wrapped in DropdownView. Also, fix
// bugs in keyboard handling. See
// https://github.com/jupyter-widgets/ipywidgets/issues/1055 and
// https://github.com/jupyter-widgets/ipywidgets/issues/1049
// For now, we subclass SelectView to provide DropdownView
// For the old code, see commit f68bfbc566f3a78a8f3350b438db8ed523ce3642

export class DropdownView extends SelectionView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();

    this.el.classList.add('widget-dropdown');

    this.listbox = document.createElement('select');
    this.listbox.id = this.label.htmlFor = uuid();
    this.el.appendChild(this.listbox);
    this._updateOptions();
    this.update();
  }

  /**
   * Update the contents of this view
   */
  update(options?: { updated_view?: DropdownView }): void {
    // Debounce set calls from ourselves:
    if (options?.updated_view !== this) {
      const optsChanged = this.model.hasChanged('_options_labels');
      if (optsChanged) {
        // Need to update options:
        this._updateOptions();
      }
    }
    // Select the correct element
    const index = this.model.get('index');
    this.listbox.selectedIndex = index === null ? -1 : index;
    return super.update();
  }

  _updateOptions(): void {
    this.listbox.textContent = '';
    const items = this.model.get('_options_labels');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const option = document.createElement('option');
      option.textContent = item.replace(/ /g, '\xa0'); // space -> &nbsp;
      option.setAttribute('data-value', encodeURIComponent(item));
      option.value = item;
      this.listbox.appendChild(option);
    }
  }

  events(): { [e: string]: string } {
    return {
      'change select': '_handle_change',
    };
  }

  /**
   * Handle when a new value is selected.
   */
  _handle_change(): void {
    this.model.set(
      'index',
      this.listbox.selectedIndex === -1 ? null : this.listbox.selectedIndex,
      { updated_view: this }
    );
    this.touch();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do === 'focus') {
      this.listbox.focus();
    } else if (content.do === 'blur') {
      this.listbox.blur();
    }
  }
}

export class SelectModel extends SelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'SelectModel',
      _view_name: 'SelectView',
      rows: 5,
    };
  }
}

export class SelectView extends SelectionView {
  /**
   * Public constructor.
   */
  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    // Create listbox here so that subclasses can modify it before it is populated in render()
    this.listbox = document.createElement('select');
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-select');

    this.listbox.id = this.label.htmlFor = uuid();
    this.el.appendChild(this.listbox);
    this._updateOptions();
    this.update();
    this.updateSelection();
  }

  /**
   * Update the contents of this view
   */
  update(options?: { updated_view?: WidgetView }): void {
    // Don't update options/index on set calls from ourselves:
    if (options?.updated_view !== this) {
      const optsChange = this.model.hasChanged('_options_labels');
      const idxChange = this.model.hasChanged('index');
      if (optsChange || idxChange) {
        // Stash the index to guard against change events
        const idx = this.model.get('index');
        if (optsChange) {
          this._updateOptions();
        }
        this.updateSelection(idx);
      }
    }
    super.update();
    let rows = this.model.get('rows');
    if (rows === null) {
      rows = '';
    }
    this.listbox.setAttribute('size', rows);
  }

  updateSelection(index?: null | number): void {
    index = index || (this.model.get('index') as null | number);
    this.listbox.selectedIndex = index === null ? -1 : index;
  }

  _updateOptions(): void {
    this.listbox.textContent = '';
    const items = this.model.get('_options_labels');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const option = document.createElement('option');
      option.textContent = item.replace(/ /g, '\xa0'); // space -> &nbsp;
      option.setAttribute('data-value', encodeURIComponent(item));
      option.value = item;
      this.listbox.appendChild(option);
    }
  }

  events(): { [e: string]: string } {
    return {
      'change select': '_handle_change',
    };
  }

  /**
   * Handle when a new value is selected.
   */
  _handle_change(): void {
    this.model.set('index', this.listbox.selectedIndex, { updated_view: this });
    this.touch();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do == 'focus') {
      this.listbox.focus();
    } else if (content.do == 'blur') {
      this.listbox.blur();
    }
  }
}

export class RadioButtonsModel extends SelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'RadioButtonsModel',
      _view_name: 'RadioButtonsView',
      tooltips: [],
      icons: [],
      button_style: '',
      orientation: 'vertical',
    };
  }
}

export class RadioButtonsView extends DescriptionView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();

    this.el.classList.add('widget-radio');

    this.container = document.createElement('div');
    this.el.appendChild(this.container);
    this.container.classList.add('widget-radio-box');

    this.update();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    if (this.model.get('orientation') === 'vertical') {
      this.container.classList.remove('widget-radio-box-horizontal');
      this.container.classList.add('widget-radio-box-vertical');
    } else {
      this.container.classList.remove('widget-radio-box-vertical');
      this.container.classList.add('widget-radio-box-horizontal');
    }
    const items: string[] = this.model.get('_options_labels');
    const radios = Array.from(
      this.container.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    ).map((x) => x.value);
    let stale = items.length !== radios.length;

    if (!stale) {
      for (let i = 0, len = items.length; i < len; ++i) {
        if (radios[i] !== items[i]) {
          stale = true;
          break;
        }
      }
    }

    if (stale && (options === undefined || options.updated_view !== this)) {
      // Add items to the DOM.
      this.container.textContent = '';
      items.forEach((item: any, index: number) => {
        const label = document.createElement('label');
        label.textContent = item;
        this.container.appendChild(label);

        const radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.value = index.toString();
        radio.setAttribute('data-value', encodeURIComponent(item));
        label.appendChild(radio);
      });
    }
    items.forEach((item: any, index: number) => {
      const item_query = 'input[data-value="' + encodeURIComponent(item) + '"]';
      const radio =
        this.container.querySelectorAll<HTMLInputElement>(item_query);
      if (radio.length > 0) {
        const radio_el = radio[0];
        radio_el.checked = this.model.get('index') === index;
        radio_el.disabled = this.model.get('disabled');
      }
    });

    // Schedule adjustPadding asynchronously to
    // allow dom elements to be created properly
    setTimeout(this.adjustPadding, 0, this);

    return super.update(options);
  }

  /**
   * Adjust Padding to Multiple of Line Height
   *
   * Adjust margins so that the overall height
   * is a multiple of a single line height.
   *
   * This widget needs it because radio options
   * are spaced tighter than individual widgets
   * yet we would like the full widget line up properly
   * when displayed side-by-side with other widgets.
   */
  adjustPadding(e: this): void {
    // Vertical margins on a widget
    const elStyles = window.getComputedStyle(e.el);
    const margins =
      parseInt(elStyles.marginTop, 10) + parseInt(elStyles.marginBottom, 10);

    // Total spaces taken by a single-line widget
    const lineHeight = e.label.offsetHeight + margins;

    // Current adjustment value on this widget
    const cStyles = window.getComputedStyle(e.container);
    const containerMargin = parseInt(cStyles.marginBottom, 10);

    // How far we are off from a multiple of single windget lines
    const diff = (e.el.offsetHeight + margins - containerMargin) % lineHeight;

    // Apply the new adjustment
    const extraMargin = diff === 0 ? 0 : lineHeight - diff;
    e.container.style.marginBottom = extraMargin + 'px';
  }

  events(): { [e: string]: string } {
    return {
      'click input[type="radio"]': '_handle_click',
    };
  }

  /**
   * Handle when a value is clicked.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  _handle_click(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.model.set('index', parseInt(target.value, 10), { updated_view: this });
    this.touch();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do == 'focus') {
      const firstItem = this.container.firstElementChild as HTMLElement;
      firstItem.focus();
    } else if (content.do == 'blur') {
      for (let i = 0; i < this.container.children.length; i++) {
        const item = this.container.children[i] as HTMLElement;
        item.blur();
      }
    }
  }

  container: HTMLDivElement;
}

export class ToggleButtonsStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ToggleButtonsStyleModel',
    };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    button_width: {
      selector: '.widget-toggle-button',
      attribute: 'width',
      default: null as any,
    },
    font_weight: {
      selector: '.widget-toggle-button',
      attribute: 'font-weight',
      default: '',
    },
  };
}

export class ToggleButtonsModel extends SelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ToggleButtonsModel',
      _view_name: 'ToggleButtonsView',
    };
  }
}

export class ToggleButtonsView extends DescriptionView {
  initialize(options: WidgetView.IInitializeParameters): void {
    this._css_state = {};
    super.initialize(options);
    this.listenTo(this.model, 'change:button_style', this.update_button_style);
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();

    this.el.classList.add('widget-toggle-buttons');

    this.buttongroup = document.createElement('div');
    this.el.appendChild(this.buttongroup);

    this.update();
    this.set_button_style();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    const items: string[] = this.model.get('_options_labels');
    const icons = this.model.get('icons') || [];
    const previous_icons = this.model.previous('icons') || [];
    const previous_bstyle =
      (ToggleButtonsView.classMap as any)[
        this.model.previous('button_style')
      ] || '';
    const tooltips = this.model.get('tooltips') || [];
    const disabled = this.model.get('disabled');
    const buttons = this.buttongroup.querySelectorAll('button');
    const values = Array.from(buttons).map((x) => x.value);
    let stale = false;

    for (let i = 0, len = items.length; i < len; ++i) {
      if (values[i] !== items[i] || icons[i] !== previous_icons[i]) {
        stale = true;
        break;
      }
    }

    if (stale && (options === undefined || options.updated_view !== this)) {
      // Add items to the DOM.
      this.buttongroup.textContent = '';
      items.forEach((item: any, index: number) => {
        let item_html;
        const empty =
          item.trim().length === 0 &&
          (!icons[index] || icons[index].trim().length === 0);
        if (empty) {
          item_html = '&nbsp;';
        } else {
          item_html = utils.escape_html(item);
        }

        const icon = document.createElement('i');
        const button = document.createElement('button');
        if (icons[index]) {
          icon.className = 'fa fa-' + icons[index];
        }
        button.setAttribute('type', 'button');
        button.className = 'widget-toggle-button jupyter-button';
        if (previous_bstyle) {
          button.classList.add(previous_bstyle);
        }
        button.innerHTML = item_html;
        button.setAttribute('data-value', encodeURIComponent(item));
        button.setAttribute('value', index.toString());
        button.appendChild(icon);
        button.disabled = disabled;
        if (tooltips[index]) {
          button.setAttribute('title', tooltips[index]);
        }
        this.update_style_traits(button);
        this.buttongroup.appendChild(button);
      });
    }

    // Select active button.
    items.forEach((item: any, index: number) => {
      const item_query = '[data-value="' + encodeURIComponent(item) + '"]';
      const button = this.buttongroup.querySelector(item_query)!;
      if (this.model.get('index') === index) {
        button.classList.add('mod-active');
      } else {
        button.classList.remove('mod-active');
      }
    });

    this.stylePromise.then(function (style) {
      if (style) {
        style.style();
      }
    });
    return super.update(options);
  }

  update_style_traits(button?: HTMLButtonElement): void {
    for (const name in this._css_state as string[]) {
      if (Object.prototype.hasOwnProperty.call(this._css_state, 'name')) {
        if (name === 'margin') {
          this.buttongroup.style[name] = this._css_state[name];
        } else if (name !== 'width') {
          if (button) {
            button.style[name] = this._css_state[name];
          } else {
            const buttons = this.buttongroup.querySelectorAll('button');
            if (buttons.length) {
              buttons[0].style[name] = this._css_state[name];
            }
          }
        }
      }
    }
  }

  update_button_style(): void {
    const buttons = this.buttongroup.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
      this.update_mapped_classes(
        ToggleButtonsView.classMap,
        'button_style',
        buttons[i]
      );
    }
  }

  set_button_style(): void {
    const buttons = this.buttongroup.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
      this.set_mapped_classes(
        ToggleButtonsView.classMap,
        'button_style',
        buttons[i]
      );
    }
  }

  events(): { [e: string]: string } {
    return {
      'click button': '_handle_click',
    };
  }

  /**
   * Handle when a value is clicked.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  _handle_click(event: Event): void {
    const target = event.target as HTMLButtonElement;
    this.model.set('index', parseInt(target.value, 10), { updated_view: this });
    this.touch();
    // We also send a clicked event, since the value is only set if it changed.
    // See https://github.com/jupyter-widgets/ipywidgets/issues/763
    this.send({ event: 'click' });
  }

  private _css_state: any;
  buttongroup: HTMLDivElement;
}

export namespace ToggleButtonsView {
  export const classMap = {
    primary: ['mod-primary'],
    success: ['mod-success'],
    info: ['mod-info'],
    warning: ['mod-warning'],
    danger: ['mod-danger'],
  };
}

export class SelectionSliderModel extends SelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'SelectionSliderModel',
      _view_name: 'SelectionSliderView',
      orientation: 'horizontal',
      readout: true,
      continuous_update: true,
    };
  }
}

export class SelectionSliderView extends DescriptionView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();

    this.el.classList.add('widget-hslider');
    this.el.classList.add('widget-slider');

    // Creating noUiSlider instance and scaffolding
    this.$slider = document.createElement('div');
    this.$slider.classList.add('slider');

    // Put the slider in a container
    this.slider_container = document.createElement('div');
    this.slider_container.classList.add('slider-container');
    this.slider_container.appendChild(this.$slider);
    this.el.appendChild(this.slider_container);

    this.readout = document.createElement('div');
    this.el.appendChild(this.readout);
    this.readout.classList.add('widget-readout');
    this.readout.style.display = 'none';

    // noUiSlider constructor and event handlers
    this.createSlider();

    // Event handlers
    this.model.on('change:orientation', this.regenSlider, this);
    this.model.on('change:index', this.updateSliderValue, this);

    // Set defaults.
    this.update();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: { updated_view?: WidgetView }): void {
    if (options?.updated_view !== this) {
      this.updateSliderOptions(this.model);
      const orientation = this.model.get('orientation');
      const disabled = this.model.get('disabled');
      if (disabled) {
        this.readout.contentEditable = 'false';
        this.$slider.setAttribute('disabled', true);
      } else {
        this.readout.contentEditable = 'true';
        this.$slider.removeAttribute('disabled');
      }

      // Use the right CSS classes for vertical & horizontal sliders
      if (orientation === 'vertical') {
        this.el.classList.remove('widget-hslider');
        this.el.classList.remove('widget-inline-hbox');
        this.el.classList.add('widget-vslider');
        this.el.classList.add('widget-inline-vbox');
      } else {
        this.el.classList.remove('widget-vslider');
        this.el.classList.remove('widget-inline-vbox');
        this.el.classList.add('widget-hslider');
        this.el.classList.add('widget-inline-hbox');
      }

      const readout = this.model.get('readout');
      if (readout) {
        // this.$readout.show();
        this.readout.style.display = '';
      } else {
        // this.$readout.hide();
        this.readout.style.display = 'none';
      }
      this.updateSelection();
    }
    return super.update(options);
  }

  regenSlider(e: any): void {
    this.$slider.noUiSlider.destroy();
    this.createSlider();
  }

  createSlider(): void {
    const labels = this.model.get('_options_labels');
    const min = 0;
    const max = labels.length - 1;
    const orientation = this.model.get('orientation');
    const behavior = this.model.get('behavior');

    noUiSlider.create(this.$slider, {
      start: this.model.get('index'),
      connect: true,
      behaviour: behavior,
      range: {
        min: min,
        max: max,
      },
      step: 1,
      animate: false,
      orientation: orientation,
      direction: orientation === 'horizontal' ? 'ltr' : 'rtl',
      format: {
        from: (value: string): number => Number(value),
        to: (value: number): number => Math.round(value),
      },
    });

    // Using noUiSlider's 'update' and 'change' events.
    // See reference: https://refreshless.com/nouislider/events-callbacks/
    this.$slider.noUiSlider.on('update', (values: number[], handle: number) => {
      this.handleSliderUpdateEvent(values, handle);
    });

    this.$slider.noUiSlider.on('change', (values: number[], handle: number) => {
      this.handleSliderChangeEvent(values, handle);
    });
  }

  events(): { [e: string]: string } {
    return {
      slide: 'handleSliderChange',
      slidestop: 'handleSliderChanged',
    };
  }

  updateSelection(): void {
    const index = this.model.get('index');
    this.updateReadout(index);
  }

  updateReadout(index: any): void {
    const value = this.model.get('_options_labels')[index];
    this.readout.textContent = value;
  }

  /**
   * Called whilst the slider is dragged, tapped or moved by the arrow keys.
   */
  handleSliderUpdateEvent(values: number[], handle: number): void {
    const index = values[0];
    this.updateReadout(index);

    // Only persist the value while sliding if the continuous_update
    // trait is set to true.
    if (this.model.get('continuous_update')) {
      this.handleSliderChanged(values, handle);
    }
  }

  /**
   * Called when the slider handle is released after dragging,
   * or by tapping or moving by the arrow keys.
   */
  handleSliderChangeEvent(values: number[], handle: number): void {
    const index = values[0];
    this.updateReadout(index);

    this.handleSliderChanged(values, handle);
  }

  /**
   * Called when the slider value has changed.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  handleSliderChanged(values: number[], handle: number): void {
    const index = values[0];
    this.updateReadout(index);
    this.model.set('index', index, { updated_view: this });
    this.touch();
  }

  updateSliderOptions(e: any): void {
    const labels = this.model.get('_options_labels');
    const min = 0;
    const max = labels.length - 1;

    this.$slider.noUiSlider.updateOptions({
      start: this.model.get('index'),
      range: {
        min: min,
        max: max,
      },
      step: 1,
    });
  }

  updateSliderValue(model: any, _: any, options: any): void {
    if (options.updated_view === this) {
      return;
    }

    const prev_index = this.$slider.noUiSlider.get();
    const index = this.model.get('index');
    if (prev_index !== index) {
      this.$slider.noUiSlider.set(index);
    }
  }

  $slider: any;
  slider_container: HTMLDivElement;
  readout: HTMLDivElement;
}

export class MultipleSelectionModel extends SelectionModel {
  defaults(): Backbone.ObjectHash {
    return { ...super.defaults(), _model_name: 'MultipleSelectionModel' };
  }
}

export class SelectMultipleModel extends MultipleSelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'SelectMultipleModel',
      _view_name: 'SelectMultipleView',
      rows: null,
    };
  }
}

export class SelectMultipleView extends SelectView {
  /**
   * Public constructor.
   */
  initialize(parameters: WidgetView.IInitializeParameters): void {
    super.initialize(parameters);
    this.listbox.multiple = true;
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-select-multiple');
  }

  updateSelection(): void {
    const selected = this.model.get('index') || [];
    const listboxOptions = this.listbox.options;
    // Clear the selection
    this.listbox.selectedIndex = -1;
    // Select the appropriate options
    selected.forEach((i: number) => {
      listboxOptions[i].selected = true;
    });
  }

  /**
   * Handle when a new value is selected.
   */
  _handle_change(): void {
    const index = Array.prototype.map.call(
      this.listbox.selectedOptions || [],
      function (option: HTMLOptionElement) {
        return option.index;
      }
    );
    this.model.set('index', index, { updated_view: this });
    this.touch();
  }
}

export class SelectionRangeSliderModel extends MultipleSelectionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'SelectionSliderModel',
      _view_name: 'SelectionSliderView',
      orientation: 'horizontal',
      readout: true,
      continuous_update: true,
    };
  }
}

export class SelectionRangeSliderView extends SelectionSliderView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
  }

  updateSelection(index?: number[]): void {
    index = index || (this.model.get('index') as number[]);
    this.updateReadout(index);
  }

  updateReadout(index: number[]): void {
    const labels = this.model.get('_options_labels');
    const minValue = labels[index[0]];
    const maxValue = labels[index[1]];
    this.readout.textContent = `${minValue}-${maxValue}`;
  }

  /**
   * Called when the slider value is changing.
   */
  handleSliderUpdateEvent(values: number[], handle: any): void {
    const intValues = values.map(Math.trunc);
    this.updateReadout(intValues);

    // Only persist the value while sliding if the continuous_update
    // trait is set to true.
    if (this.model.get('continuous_update')) {
      this.handleSliderChanged(values, handle);
    }
  }

  /**
   * Called when the slider value has changed.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  handleSliderChanged(values: number[], handle: number): void {
    const intValues = values.map(Math.round);
    this.updateReadout(intValues);

    // set index to a snapshot of the values passed by the slider
    this.model.set('index', intValues.slice(), { updated_view: this });
    this.touch();
  }

  updateSliderValue(model: any, _: any, options: any): void {
    if (options.updated_view === this) {
      return;
    }

    // Rounding values to avoid floating point precision error for the if statement below
    const prev_index = this.$slider.noUiSlider.get().map(Math.round);
    const index = this.model.get('index').map(Math.round);

    if (prev_index[0] !== index[0] || prev_index[1] !== index[1]) {
      this.$slider.noUiSlider.set(index);
    }
  }

  $slider: any;
  slider_container: HTMLDivElement;
  readout: HTMLDivElement;
}
