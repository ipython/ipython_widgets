// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@lumino/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { HTMLManager } from './htmlmanager';

export const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

// Renderer to allow the output widget to render sub-widgets
export class WidgetRenderer extends Widget implements IRenderMime.IRenderer {
  constructor(options: IRenderMime.IRendererOptions, manager: HTMLManager) {
    super();
    this.mimeType = options.mimeType;
    this._manager = manager;
  }

  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const source: any = model.data[this.mimeType];
    if (!this._manager.has_model(source.model_id)) {
      this.node.textContent = 'Error creating widget: could not find model';
      this.addClass('jupyter-widgets');
      return;
    }
    try {
      const wModel = await this._manager.get_model(source.model_id);
      const wView = await this._manager.create_view(wModel);
      Widget.attach(wView.luminoWidget || wView.pWidget, this.node);
    } catch (err) {
      console.log('Error displaying widget');
      console.log(err);
      this.node.textContent = 'Error displaying widget';
      this.addClass('jupyter-widgets');
    }
  }

  /**
   * The mimetype being rendered.
   */
  readonly mimeType: string;
  private _manager: HTMLManager;
}
