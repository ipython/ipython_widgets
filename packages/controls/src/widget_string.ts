// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CoreDescriptionModel } from './widget_core';

import { DescriptionStyleModel, DescriptionView } from './widget_description';

import { uuid } from './utils';

import { JUPYTER_CONTROLS_VERSION } from './version';

/**
 * Class name for a combobox with an invalid value.
 */
const INVALID_VALUE_CLASS = 'jpwidgets-invalidComboValue';

class StringStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'StringStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    background: {
      selector: '',
      attribute: 'background',
      default: null as any,
    },
    font_size: {
      selector: '',
      attribute: 'font-size',
      default: '',
    },
    text_color: {
      selector: '',
      attribute: 'color',
      default: '',
    },
  };
}

export class HTMLStyleModel extends StringStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'HTMLStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    ...StringStyleModel.styleProperties,
  };
}

export class HTMLMathStyleModel extends StringStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'HTMLMathStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    ...StringStyleModel.styleProperties,
  };
}

export class LabelStyleModel extends StringStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'LabelStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    ...StringStyleModel.styleProperties,
    font_family: {
      selector: '',
      attribute: 'font-family',
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
    text_decoration: {
      selector: '',
      attribute: 'text-decoration',
      default: '',
    },
  };
}

export class TextStyleModel extends DescriptionStyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'TextStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    ...DescriptionStyleModel.styleProperties,
    background: {
      selector: '.widget-input',
      attribute: 'background',
      default: null as any,
    },
    font_size: {
      selector: '.widget-input',
      attribute: 'font-size',
      default: '',
    },
    text_color: {
      selector: '.widget-input',
      attribute: 'color',
      default: '',
    },
  };
}

export class StringModel extends CoreDescriptionModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      value: '',
      disabled: false,
      placeholder: '\u200b',
      _model_name: 'StringModel',
    };
  }
}

export class StringView extends DescriptionView {
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

  content: HTMLDivElement;
}

export class HTMLModel extends StringModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'HTMLView',
      _model_name: 'HTMLModel',
    };
  }
}

export class HTMLView extends StringView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-html');
    this.content = document.createElement('div');
    this.content.classList.add('widget-html-content');
    this.el.appendChild(this.content);
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    this.content.innerHTML = this.model.get('value');
    return super.update();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do === 'focus') {
      this.content.focus();
    } else if (content.do === 'blur') {
      this.content.blur();
    }
  }

  content: HTMLDivElement;
}

export class HTMLMathModel extends StringModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'HTMLMathView',
      _model_name: 'HTMLMathModel',
    };
  }
}

export class HTMLMathView extends StringView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-htmlmath');
    this.content = document.createElement('div');
    this.content.classList.add('widget-htmlmath-content');
    this.el.appendChild(this.content);
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   */
  update(): void {
    this.content.innerHTML = this.model.get('value');
    this.typeset(this.content);
    return super.update();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do === 'focus') {
      this.content.focus();
    } else if (content.do === 'blur') {
      this.content.blur();
    }
  }

  content: HTMLDivElement;
}

export class LabelModel extends StringModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'LabelView',
      _model_name: 'LabelModel',
    };
  }
}

export class LabelView extends StringView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-label');
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    this.typeset(this.el, this.model.get('value'));
    return super.update();
  }
}

export class TextareaModel extends StringModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'TextareaView',
      _model_name: 'TextareaModel',
      rows: null,
      continuous_update: true,
    };
  }
}

export class TextareaView extends StringView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-textarea');

    this.textbox = document.createElement('textarea');
    this.textbox.setAttribute('rows', '5');
    this.textbox.id = this.label.htmlFor = uuid();
    this.textbox.classList.add('widget-input');
    this.el.appendChild(this.textbox);

    this.update(); // Set defaults.

    this.listenTo(this.model, 'change:placeholder', (model, value, options) => {
      this.update_placeholder(value);
    });

    this.update_placeholder();
    this.updateTooltip();
  }

  update_placeholder(value?: string): void {
    const v = value || this.model.get('placeholder');
    this.textbox.setAttribute('placeholder', v.toString());
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(options?: any): void {
    if (options === undefined || options.updated_view !== this) {
      this.textbox.value = this.model.get('value');
      let rows = this.model.get('rows');
      if (rows === null) {
        rows = '';
      }
      this.textbox.setAttribute('rows', rows);
      this.textbox.disabled = this.model.get('disabled');
    }
    this.updateTabindex();
    this.updateTooltip();
    return super.update();
  }

  updateTabindex(): void {
    if (!this.textbox) {
      return; // we might be constructing the parent
    }
    const tabbable = this.model.get('tabbable');
    if (tabbable === true) {
      this.textbox.setAttribute('tabIndex', '0');
    } else if (tabbable === false) {
      this.textbox.setAttribute('tabIndex', '-1');
    } else if (tabbable === null) {
      this.textbox.removeAttribute('tabIndex');
    }
  }

  events(): { [e: string]: string } {
    return {
      'keydown input': 'handleKeyDown',
      'keypress input': 'handleKeypress',
      'input textarea': 'handleChanging',
      'change textarea': 'handleChanged',
    };
  }

  /**
   * Handle key down
   *
   * Stop propagation so the event isn't sent to the application.
   */
  handleKeyDown(e: Event): void {
    e.stopPropagation();
  }

  /**
   * Handles key press
   *
   * Stop propagation so the keypress isn't sent to the application.
   */
  handleKeypress(e: Event): void {
    e.stopPropagation();
  }

  /**
   * Triggered on input change
   */
  handleChanging(e: Event): void {
    if (this.model.get('continuous_update')) {
      this.handleChanged(e);
    }
  }

  /**
   * Sync the value with the kernel.
   *
   * @param e Event
   */
  handleChanged(e: Event): void {
    const target = e.target as HTMLTextAreaElement;
    this.model.set('value', target.value, { updated_view: this });
    this.touch();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do === 'focus') {
      this.textbox.focus();
    } else if (content.do === 'blur') {
      this.textbox.blur();
    }
  }

  textbox: HTMLTextAreaElement;
}

export class TextModel extends StringModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'TextView',
      _model_name: 'TextModel',
      continuous_update: true,
    };
  }
}

export class TextView extends StringView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this.el.classList.add('widget-text');

    this.textbox = document.createElement('input');
    this.textbox.setAttribute('type', this.inputType);
    this.textbox.id = this.label.htmlFor = uuid();
    this.textbox.classList.add('widget-input');
    this.el.appendChild(this.textbox);

    this.update(); // Set defaults.
    this.listenTo(this.model, 'change:placeholder', (model, value, options) => {
      this.update_placeholder(value);
    });
    this.update_placeholder();
    this.updateTabindex();
    this.updateTooltip();
  }

  update_placeholder(value?: string): void {
    this.textbox.setAttribute(
      'placeholder',
      value || this.model.get('placeholder')
    );
  }

  updateTabindex(): void {
    if (!this.textbox) {
      return; // we might be constructing the parent
    }
    const tabbable = this.model.get('tabbable');
    if (tabbable === true) {
      this.textbox.setAttribute('tabIndex', '0');
    } else if (tabbable === false) {
      this.textbox.setAttribute('tabIndex', '-1');
    } else if (tabbable === null) {
      this.textbox.removeAttribute('tabIndex');
    }
  }

  update(options?: any): void {
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    if (options === undefined || options.updated_view !== this) {
      if (this.textbox.value !== this.model.get('value')) {
        this.textbox.value = this.model.get('value');
      }

      this.textbox.disabled = this.model.get('disabled');
    }
    return super.update();
  }

  events(): { [e: string]: string } {
    return {
      'keydown input': 'handleKeyDown',
      'keypress input': 'handleKeypress',
      'input input': 'handleChanging',
      'change input': 'handleChanged',
    };
  }

  /**
   * Handle key down
   *
   * Stop propagation so the keypress isn't sent to the application.
   */
  handleKeyDown(e: Event): void {
    e.stopPropagation();
  }

  /**
   * Handles text submission
   */
  handleKeypress(e: KeyboardEvent): void {
    e.stopPropagation();
    // The submit message is deprecated in widgets 7
    if (e.keyCode === 13) {
      // Return key
      this.send({ event: 'submit' });
    }
  }

  /**
   * Handles user input.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  handleChanging(e: Event): void {
    if (this.model.get('continuous_update')) {
      this.handleChanged(e);
    }
  }

  /**
   * Handles user input.
   *
   * Calling model.set will trigger all of the other views of the
   * model to update.
   */
  handleChanged(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.model.set('value', target.value, { updated_view: this });
    this.touch();
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do === 'focus') {
      this.textbox.focus();
    } else if (content.do === 'blur') {
      this.textbox.blur();
    }
  }

  protected readonly inputType: string = 'text';
  textbox: HTMLInputElement;
}

export class PasswordModel extends TextModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'PasswordView',
      _model_name: 'PasswordModel',
    };
  }
}

export class PasswordView extends TextView {
  protected readonly inputType: string = 'password';
}

/**
 * Combobox widget model class.
 */
export class ComboboxModel extends TextModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'ComboboxModel',
      _view_name: 'ComboboxView',
      options: [],
      ensure_options: false,
    };
  }
}

/**
 * Combobox widget view class.
 */
export class ComboboxView extends TextView {
  render(): void {
    this.datalist = document.createElement('datalist');
    this.datalist.id = uuid();

    super.render();

    this.textbox.setAttribute('list', this.datalist.id);
    this.el.appendChild(this.datalist);
    this.updateTooltip();
  }

  update(options?: any): void {
    super.update(options);
    if (!this.datalist) {
      return;
    }

    const valid = this.isValid(this.model.get('value'));
    this.highlightValidState(valid);

    // Check if we need to update options
    if (
      (options !== undefined && options.updated_view) ||
      (!this.model.hasChanged('options') && !this.isInitialRender)
    ) {
      // Value update only, keep current options
      return;
    }

    this.isInitialRender = false;

    const opts = this.model.get('options') as string[];
    const optionFragment = document.createDocumentFragment();
    for (const v of opts) {
      const o = document.createElement('option');
      o.value = v;
      optionFragment.appendChild(o);
    }
    this.datalist.replaceChildren(...optionFragment.children);
  }

  isValid(value: string): boolean {
    if (true === this.model.get('ensure_option')) {
      const options = this.model.get('options') as string[];
      if (options.indexOf(value) === -1) {
        return false;
      }
    }
    return true;
  }

  handleChanging(e: KeyboardEvent): void {
    // Override to validate value
    const target = e.target as HTMLInputElement;
    const valid = this.isValid(target.value);
    this.highlightValidState(valid);
    if (valid) {
      super.handleChanging(e);
    }
  }

  handleChanged(e: KeyboardEvent): void {
    // Override to validate value
    const target = e.target as HTMLInputElement;
    const valid = this.isValid(target.value);
    this.highlightValidState(valid);
    if (valid) {
      super.handleChanged(e);
    }
  }

  /**
   * Handle message sent to the front end.
   */
  handle_message(content: any): void {
    if (content.do === 'focus') {
      this.textbox.focus();
    } else if (content.do === 'blur') {
      this.textbox.blur();
    }
  }

  highlightValidState(valid: boolean): void {
    this.textbox.classList.toggle(INVALID_VALUE_CLASS, !valid);
  }

  datalist: HTMLDataListElement | undefined;

  isInitialRender = true;
}
