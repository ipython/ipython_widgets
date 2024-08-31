// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { maxSatisfying } from 'semver';
import * as base from '@jupyter-widgets/base';
import * as outputWidgets from './output';
import { ManagerBase } from '@jupyter-widgets/base-manager';
import { MessageLoop } from '@lumino/messaging';

import * as LuminoWidget from '@lumino/widgets';
import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';

import { WidgetRenderer, WIDGET_MIMETYPE } from './output_renderers';
import { WidgetModel, WidgetView, DOMWidgetView } from '@jupyter-widgets/base';

export class HTMLManager extends ManagerBase {
  constructor(options?: {
    loader?: (moduleName: string, moduleVersion: string) => Promise<any>;
  }) {
    super();
    this.loader = options?.loader;
    this.renderMime = new RenderMimeRegistry({
      initialFactories: standardRendererFactories,
    });
    this.renderMime.addFactory(
      {
        safe: false,
        mimeTypes: [WIDGET_MIMETYPE],
        createRenderer: (options) => new WidgetRenderer(options, this),
      },
      0
    );

    this._viewList = new Set<DOMWidgetView>();
    window.addEventListener('resize', () => {
      this._viewList.forEach((view) => {
        MessageLoop.postMessage(
          view.luminoWidget || view.pWidget,
          LuminoWidget.Widget.ResizeMessage.UnknownSize
        );
      });
    });
  }
  /**
   * Display the specified view. Element where the view is displayed
   * is specified in the `options.el` argument.
   */
  async display_view(
    view: Promise<DOMWidgetView> | DOMWidgetView,
    el: HTMLElement
  ): Promise<void> {
    let v: DOMWidgetView;
    try {
      v = await view;
    } catch (error) {
      const msg = `Could not create a view for ${view}`;
      console.error(msg);
      const ModelCls = base.createErrorWidgetModel(error, msg);
      const errorModel = new ModelCls();
      v = new base.ErrorWidgetView({
        model: errorModel,
      });
      v.render();
    }

    LuminoWidget.Widget.attach(v.luminoWidget || v.pWidget, el);
    this._viewList.add(v);
    v.once('remove', () => {
      this._viewList.delete(v);
    });
  }

  /**
   * Placeholder implementation for _get_comm_info.
   */
  _get_comm_info(): Promise<{}> {
    return Promise.resolve({});
  }

  /**
   * Placeholder implementation for _create_comm.
   */
  _create_comm(
    comm_target_name: string,
    model_id: string,
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Promise<any> {
    return Promise.resolve({
      on_close: () => {
        return;
      },
      on_msg: () => {
        return;
      },
      close: () => {
        return;
      },
    });
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView> {
    return new Promise((resolve, reject) => {
      if (
        moduleName === '@jupyter-widgets/base' ||
        moduleName === '@jupyter-widgets/controls'
      ) {
        moduleVersion = `^${moduleVersion}`;
      }

      if (moduleName === '@jupyter-widgets/base') {
        const best = maxSatisfying(['1.2.0', '2.0.0'], moduleVersion);

        if (best === '1.2.0') {
          // ipywidgets 7 model
          resolve(require('@jupyter-widgets/base7'));
        } else {
          // ipywidgets 8 model
          resolve(require('@jupyter-widgets/base'));
        }
      } else if (moduleName === '@jupyter-widgets/controls') {
        const best = maxSatisfying(['1.5.0', '2.0.0'], moduleVersion);

        if (best === '1.5.0') {
          // ipywidgets 7 controls JS and CSS
          require('@jupyter-widgets/controls7/css/widgets-base.css');

          // If lab variables are not found, we set them (we don't want to reset the variables if they are already defined)
          if (
            getComputedStyle(document.documentElement).getPropertyValue(
              '--jp-layout-color0'
            ) === ''
          ) {
            require('@jupyter-widgets/controls7/css/labvariables.css');
          }
          resolve(require('@jupyter-widgets/controls7'));
        } else {
          // ipywidgets 8 controls JS and CSS
          require('@jupyter-widgets/controls/css/widgets-base.css');

          // If lab variables are not found, we set them (we don't want to reset the variables if they are already defined)
          if (
            getComputedStyle(document.documentElement).getPropertyValue(
              '--jp-layout-color0'
            ) === ''
          ) {
            require('@jupyter-widgets/controls/css/labvariables.css');
          }

          resolve(require('@jupyter-widgets/controls'));
        }
      } else if (moduleName === '@jupyter-widgets/output') {
        resolve(outputWidgets);
      } else if (this.loader !== undefined) {
        resolve(this.loader(moduleName, moduleVersion));
      } else {
        reject(`Could not load module ${moduleName}@${moduleVersion}`);
      }
    }).then((module) => {
      if ((module as any)[className]) {
        return (module as any)[className];
      } else {
        return Promise.reject(
          `Class ${className} not found in module ${moduleName}@${moduleVersion}`
        );
      }
    });
  }

  /**
   * Renderers for contents of the output widgets
   *
   * Defines how outputs in the output widget should be rendered.
   */
  renderMime: RenderMimeRegistry;

  /**
   * A loader for a given module name and module version, and returns a promise to a module
   */
  loader:
    | ((moduleName: string, moduleVersion: string) => Promise<any>)
    | undefined;

  private _viewList: Set<DOMWidgetView>;
}
