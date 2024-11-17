import {
  WidgetModel,
  DOMWidgetModel,
  DOMWidgetView,
  WidgetView,
} from './widget';
import { JUPYTER_WIDGETS_VERSION } from './version';
import { BROKEN_FILE_SVG_ICON } from './utils';

// create a Widget Model that captures an error object
export function createErrorWidgetModel(
  error: unknown,
  msg?: string
): typeof WidgetModel {
  class ErrorWidget extends DOMWidgetModel {
    constructor(attributes: any, options: any) {
      attributes = {
        ...attributes,
        _view_name: 'ErrorWidgetView',
        _view_module: '@jupyter-widgets/base',
        _model_module_version: JUPYTER_WIDGETS_VERSION,
        _view_module_version: JUPYTER_WIDGETS_VERSION,
        msg: msg,
        error: error,
      };
      super(attributes, options);
    }
    get comm_live(): boolean {
      return true;
    }
  }
  return ErrorWidget;
}

export class ErrorWidgetView extends DOMWidgetView {
  generateErrorMessage(): { msg?: string; stack: string } {
    return {
      msg: this.model.get('msg'),
      stack: String(this.model.get('error').stack),
    };
  }
  render(): void {
    const { msg, stack } = this.generateErrorMessage();
    this.el.classList.add('jupyter-widgets');

    const content = document.createElement('div');
    content.classList.add('jupyter-widgets-error-widget', 'icon-error');
    content.innerHTML = BROKEN_FILE_SVG_ICON;
    const text = document.createElement('pre');
    text.style.textAlign = 'center';
    text.innerText = 'Click to show javascript error.';
    content.append(text);

    this.el.appendChild(content);

    let width: number;
    let height: number;
    this.el.onclick = () => {
      if (content.classList.contains('icon-error')) {
        height = height || content.clientHeight;
        width = width || content.clientWidth;
        content.classList.remove('icon-error');
        content.innerHTML = `
        <pre>[Open Browser Console for more detailed log - Double click to close this message]\n${msg}\n${stack}</pre>
        `;
        content.style.height = `${height}px`;
        content.style.width = `${width}px`;
        content.classList.add('text-error');
      }
    };
    this.el.ondblclick = () => {
      if (content.classList.contains('text-error')) {
        content.classList.remove('text-error');
        content.innerHTML = BROKEN_FILE_SVG_ICON;
        content.append(text);
        content.classList.add('icon-error');
      }
    };
  }
}

export function createErrorWidgetView(
  error?: unknown,
  msg?: string
): typeof WidgetView {
  return class InnerErrorWidgetView extends ErrorWidgetView {
    generateErrorMessage(): { msg?: string; stack: string } {
      return {
        msg,
        stack: String(error instanceof Error ? error.stack : error),
      };
    }
  };
}
