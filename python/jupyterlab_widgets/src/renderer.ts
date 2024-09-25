// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PromiseDelegate } from '@lumino/coreutils';

import { IDisposable } from '@lumino/disposable';

import { Widget as LuminoWidget, Panel } from '@lumino/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { DOMWidgetModel } from '@jupyter-widgets/base';

import { KernelWidgetManager } from './manager';

/**
 * A renderer for widgets.
 *
 * Default behavior is to search for the manager, unless the manager
 * has already been set.
 *
 * If `pendingManagerMessage` is a non-empty string, no attempt will
 * be made to search for the wiget manager, and the manager must be
 * waiting for a manager to be set.
 *
 * pendingManagerMessage: A message to post when rendering whilst
 * awaiting the when manager.
 *
 * Omitting a message means a manager will be searched for.
 *
 */
export class WidgetRenderer
  extends Panel
  implements IRenderMime.IRenderer, IDisposable
{
  constructor(
    options: IRenderMime.IRendererOptions,
    manager?: KernelWidgetManager,
    pendingManagerMessage = ''
  ) {
    super();
    this.mimeType = options.mimeType;
    this._pendingManagerMessage = pendingManagerMessage;
    this.manager = manager;
  }

  /**
   * The widget manager.
   *
   * Will accept the first non-null manager and ignore anything afterwards.
   */

  set manager(value: KernelWidgetManager | undefined) {
    if (value && !this._managerIsSet) {
      // Can only set the manager once
      this._manager.resolve(value);
      this._managerIsSet = true;
      value.restored.connect(this.rerender, this);
      this.disposed.connect(() =>
        value.restored.disconnect(this.rerender, this)
      );
    }
  }

  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const source: any = model.data[this.mimeType];

    // If there is no model id, the view was removed, so hide the node.
    if (source.model_id === '') {
      this.hide();
      return;
    }
    if (!this._pendingManagerMessage && !this._managerIsSet) {
      try {
        this.manager = await KernelWidgetManager.getManager(source.model_id);
      } catch {
        this.node.textContent = `KernelWidgetManager not found for model: ${model.data['text/plain']}`;
        return;
      }
    }
    this.node.textContent = `${
      this._pendingManagerMessage || model.data['text/plain']
    }`;
    const manager = await this._manager.promise;
    this._rerenderMimeModel = model;

    let wModel: DOMWidgetModel;
    try {
      // Presume we have a DOMWidgetModel. Should we check for sure?
      wModel = (await manager.get_model(source.model_id)) as DOMWidgetModel;
    } catch (err) {
      if (this._pendingManagerMessage === 'No kernel') {
        this.node.textContent = `Model not found: ${model.data['text/plain']}`;
      } else if (manager.restoredStatus) {
        // The manager has been restored, so this error won't be going away.
        this.node.textContent = 'Error displaying widget: model not found';
        this.addClass('jupyter-widgets');
        console.error(err);
      }
      // Store the model for a possible rerender
      return;
    }
    let widget: LuminoWidget;
    try {
      const view = await manager.create_view(wModel);
      widget = view.luminoWidget || view.pWidget;
    } catch (err) {
      this.node.textContent = 'Error displaying widget';
      this.addClass('jupyter-widgets');
      console.error(err);
      return;
    }

    // Clear any previous loading message.
    this.node.textContent = '';
    this.addWidget(widget);
    this.show();

    // When the widget is disposed, hide this container and make sure we
    // change the output model to reflect the view was closed.
    widget.disposed.connect(() => {
      this.hide();
    });
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._manager = null!;
    this._rerenderMimeModel = null;
    super.dispose();
  }

  rerender(): void {
    // TODO: Add conditions for when re-rendering should occur.
    if (this._rerenderMimeModel && !this.children.length) {
      // Clear the error message
      this.node.textContent = '';
      this.removeClass('jupyter-widgets');

      // Attempt to rerender.
      this.renderModel(this._rerenderMimeModel);
    }
  }

  /**
   * The mimetype being rendered.
   */
  readonly mimeType: string;
  private _manager = new PromiseDelegate<KernelWidgetManager>();
  private _managerIsSet = false;
  private _pendingManagerMessage: string;
  private _rerenderMimeModel: IRenderMime.IMimeModel | null = null;
}
