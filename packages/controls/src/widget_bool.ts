// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DOMWidgetView } from '@jupyter-widgets/base';

import { CoreDescriptionModel } from './widget_core';

import { DescriptionStyleModel, DescriptionView } from './widget_description';

export class CheckboxStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'CheckboxStyleModel',
    };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    background: {
      selector: '',
      attribute: 'background',
      default: null as any,
    },
  };
}

export class ToggleButtonStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ToggleButtonStyleModel',
    };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    font_family: {
      selector: '',
      attribute: 'font-family',
      default: '',
    },
    font_size: {
      selector: '',
      attribute: 'font-size',
      default: '',
    },
    font_style: {
      selector: '',
      attribute: 'font-style',
      default: '',
    },
    font_variant: {
      selector: '',
      attribute: 'font-variant',
      default: '',
    },
    font_weight: {
      selector: '',
      attribute: 'font-weight',
      default: '',
    },
    text_color: {
      selector: '',
      attribute: 'color',
      default: '',
    },
    text_decoration: {
      selector: '',
      attribute: 'text-decoration',
      default: '',
    },
  };
}

export class BoolModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      value: false,
      disabled: false,
      _model_name: 'BoolModel',
    };
  }
}

export class CheckboxModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      indent: true,
      style: null,
      _view_name: 'CheckboxView',
      _model_name: 'CheckboxModel',
    };
  }
}

export class CheckboxView extends DescriptionView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-checkbox');

    // adding a zero-width space to the label to help
    // the browser set the baseline correctly
    this.label.innerHTML = '&#8203;';

    // label containing the checkbox and description span
    this.checkboxLabel = document.createElement('label');
    this.checkboxLabel.classList.add('widget-label-basic');
    this.el.appendChild(this.checkboxLabel);

    // checkbox
    this.checkbox = document.createElement('input');
    this.checkbox.setAttribute('type', 'checkbox');
    this.checkboxLabel.appendChild(this.checkbox);

    // span to the right of the checkbox that will render the description
    this.descriptionSpan = document.createElement('span');
    this.checkboxLabel.appendChild(this.descriptionSpan);

    this.listenTo(this.model, 'change:indent', this.updateIndent);
    this.listenTo(this.model, 'change:tabbable', this.updateTabindex);

    this.update(); // Set defaults.
    this.updateDescription();
    this.updateIndent();
    this.updateTabindex();
    this.updateTooltip();
  }

  /**
   * Overridden from super class
   *
   * Update the description span (rather than the label) since
   * we want the description to the right of the checkbox.
   */
  updateDescription(): void {
    // can be called before the view is fully initialized
    if (this.checkboxLabel == null) {
      return;
    }
    const description = this.model.get('description');
    if (this.model.get('description_allow_html')) {
      this.descriptionSpan.innerHTML =
        this.model.widget_manager.inline_sanitize(description);
    } else {
      this.descriptionSpan.textContent = description;
    }
    this.typeset(this.descriptionSpan);
    this.updateTooltip();
  }

  /**
   * Update the visibility of the label in the super class
   * to provide the optional indent.
   */
  updateIndent(): void {
    const indent = this.model.get('indent');
    this.label.style.display = indent ? '' : 'none';
  }

  updateTabindex(): void {
    if (!this.checkbox) {
      return; // we might be constructing the parent
    }
    const tabbable = this.model.get('tabbable');
    if (tabbable === true) {
      this.checkbox.setAttribute('tabIndex', '0');
    } else if (tabbable === false) {
      this.checkbox.setAttribute('tabIndex', '-1');
    } else if (tabbable === null) {
      this.checkbox.removeAttribute('tabIndex');
    }
  }

  events(): { [e: string]: string } {
    return {
      'click input[type="checkbox"]': '_handle_click',
    };
  }

  /**
   * Handles when the checkbox is clicked.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  _handle_click(): void {
    const value = this.model.get('value');
    this.model.set('value', !value, { updated_view: this });
    this.touch();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed. The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    this.checkbox.checked = this.model.get('value');

    if (options === undefined || options.updated_view != this) {
      this.checkbox.disabled = this.model.get('disabled');
    }
    return super.update();
  }
  /**
   * Handle message sent to the front end.
   *
   * Used to focus or blur the widget.
   */

  handle_message(content: any): void {
    if (content.do == 'focus') {
      this.checkbox.focus();
    } else if (content.do == 'blur') {
      this.checkbox.blur();
    }
  }

  checkbox: HTMLInputElement;
  checkboxLabel: HTMLLabelElement;
  descriptionSpan: HTMLSpanElement;
}

export class ToggleButtonModel extends BoolModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'ToggleButtonView',
      _model_name: 'ToggleButtonModel',
      tooltip: '',
      icon: '',
      button_style: '',
      style: null,
    };
  }
}

export class ToggleButtonView extends DOMWidgetView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('jupyter-button');
    this.el.classList.add('widget-toggle-button');
    this.listenTo(this.model, 'change:button_style', this.update_button_style);
    this.listenTo(this.model, 'change:tabbable', this.updateTabindex);
    this.set_button_style();
    this.update(); // Set defaults.
  }

  update_button_style(): void {
    this.update_mapped_classes(ToggleButtonView.class_map, 'button_style');
  }

  set_button_style(): void {
    this.set_mapped_classes(ToggleButtonView.class_map, 'button_style');
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed. The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    if (this.model.get('value')) {
      this.el.classList.add('mod-active');
    } else {
      this.el.classList.remove('mod-active');
    }

    if (options === undefined || options.updated_view !== this) {
      this.el.disabled = this.model.get('disabled');
      this.el.setAttribute('tabbable', this.model.get('tabbable'));
      this.el.setAttribute('title', this.model.get('tooltip'));

      const description = this.model.get('description');
      const icon = this.model.get('icon');
      if (description.trim().length === 0 && icon.trim().length === 0) {
        this.el.innerHTML = '&nbsp;'; // Preserve button height
      } else {
        this.el.textContent = '';
        if (icon.trim().length) {
          const i = document.createElement('i');
          this.el.appendChild(i);
          i.classList.add('fa');
          i.classList.add('fa-' + icon);
        }
        this.el.appendChild(document.createTextNode(description));
      }
    }
    this.updateTabindex();
    return super.update();
  }

  events(): { [e: string]: string } {
    return {
      // Dictionary of events and their handlers.
      click: '_handle_click',
    };
  }

  /**
   * Handles and validates user input.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  _handle_click(event: MouseEvent): void {
    event.preventDefault();
    const value = this.model.get('value');
    this.model.set('value', !value, { updated_view: this });
    this.touch();
  }

  preinitialize() {
    // Must set this before the initialize method creates the element
    this.tagName = 'button';
  }

  el: HTMLButtonElement;

  static class_map = {
    primary: ['mod-primary'],
    success: ['mod-success'],
    info: ['mod-info'],
    warning: ['mod-warning'],
    danger: ['mod-danger'],
  };
}

export class ValidModel extends BoolModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      readout: 'Invalid',
      _view_name: 'ValidView',
      _model_name: 'ValidModel',
    };
  }
}

export class ValidView extends DescriptionView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-valid');
    this.el.classList.add('widget-inline-hbox');
    this.icon = document.createElement('i');
    this.icon.classList.add('fa', 'fa-fw');
    this.el.appendChild(this.icon);
    this.readout = document.createElement('span');
    this.readout.classList.add('widget-valid-readout');
    this.readout.classList.add('widget-readout');
    this.el.appendChild(this.readout);
    this.update();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    this.el.classList.remove('mod-valid');
    this.el.classList.remove('mod-invalid');
    this.icon.classList.remove('fa-check');
    this.icon.classList.remove('fa-times');
    this.readout.textContent = this.model.get('readout');
    if (this.model.get('value')) {
      this.el.classList.add('mod-valid');
      this.icon.classList.add('fa-check');
    } else {
      this.el.classList.add('mod-invalid');
      this.icon.classList.add('fa-times');
    }
  }
  readout: HTMLSpanElement;
  icon: HTMLElement;
}
