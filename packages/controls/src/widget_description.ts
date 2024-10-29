// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  StyleModel,
} from '@jupyter-widgets/base';

import { typeset } from './utils';

import { JUPYTER_CONTROLS_VERSION } from './version';

export class DescriptionStyleModel extends StyleModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'DescriptionStyleModel',
      _model_module: '@jupyter-widgets/controls',
      _model_module_version: JUPYTER_CONTROLS_VERSION,
    };
  }

  public static styleProperties = {
    description_width: {
      selector: '.widget-label',
      attribute: 'width',
      default: null as any,
    },
  };
}

export class DescriptionModel extends DOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'DescriptionModel',
      _view_name: 'DescriptionView',
      _view_module: '@jupyter-widgets/controls',
      _model_module: '@jupyter-widgets/controls',
      _view_module_version: JUPYTER_CONTROLS_VERSION,
      _model_module_version: JUPYTER_CONTROLS_VERSION,
      description: '',
      description_allow_html: false,
    };
  }
}

export class DescriptionView extends DOMWidgetView {
  render(): void {
    this.label = document.createElement('label');
    this.el.appendChild(this.label);
    this.label.className = 'widget-label';
    this.label.style.display = 'none';

    this.listenTo(this.model, 'change:description', this.updateDescription);
    this.listenTo(
      this.model,
      'change:description_allow_html',
      this.updateDescription
    );
    this.listenTo(this.model, 'change:tabbable', this.updateTabindex);
    this.updateDescription();
    this.updateTabindex();
    this.updateTooltip();
  }

  typeset(element: HTMLElement, text?: string): void {
    this.displayed.then(() => {
      const widget_manager: any = this.model.widget_manager;
      const latexTypesetter = widget_manager._rendermime?.latexTypesetter;
      if (latexTypesetter) {
        if (text !== void 0) {
          element.textContent = text;
        }
        latexTypesetter.typeset(element);
      } else {
        return typeset(element, text);
      }
    });
  }

  updateDescription(): void {
    const description = this.model.get('description');
    if (description.length === 0) {
      this.label.style.display = 'none';
    } else {
      if (this.model.get('description_allow_html')) {
        this.label.innerHTML =
          this.model.widget_manager.inline_sanitize(description);
      } else {
        this.label.textContent = description;
      }
      this.typeset(this.label);
      this.label.style.display = '';
    }
  }

  updateTooltip(): void {
    if (!this.label) return;
    this.label.title = this.model.get('tooltip');
  }

  label: HTMLLabelElement;
}

/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionModel instead.
 */
export class LabeledDOMWidgetModel extends DescriptionModel {}

/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionView instead.
 */
export class LabeledDOMWidgetView extends DescriptionView {}
