// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as outputBase from '@jupyter-widgets/output';

import { JupyterLuminoPanelWidget } from '@jupyter-widgets/base';

import { Panel } from '@lumino/widgets';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { LabWidgetManager } from './manager';

import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';

import * as nbformat from '@jupyterlab/nbformat';

import { KernelMessage } from '@jupyterlab/services';

import $ from 'jquery';

export const OUTPUT_WIDGET_VERSION = outputBase.OUTPUT_WIDGET_VERSION;

export class OutputModel extends outputBase.OutputModel {
  defaults(): Backbone.ObjectHash {
    return { ...super.defaults(), msg_id: '', outputs: [] };
  }

  initialize(attributes: any, options: any): void {
    super.initialize(attributes, options);
    // The output area model is trusted since widgets are only rendered in trusted contexts.
    this._outputs = new OutputAreaModel({ trusted: true });
    this._msgHook = (msg): boolean => {
      this.add(msg);
      return false;
    };

    this.listenTo(this, 'change:msg_id', this.reset_msg_id);
    this.listenTo(this, 'change:outputs', this.setOutputs);
    this.setOutputs();
  }

  /**
   * Reset the message id.
   */
  reset_msg_id(): void {
    const kernel = this.widget_manager.kernel;
    const msgId = this.get('msg_id');
    const oldMsgId = this.previous('msg_id');

    // Clear any old handler.
    if (oldMsgId && kernel) {
      kernel.removeMessageHook(oldMsgId, this._msgHook);
    }

    // Register any new handler.
    if (msgId && kernel) {
      kernel.registerMessageHook(msgId, this._msgHook);
    }
  }

  add(msg: KernelMessage.IIOPubMessage): void {
    const msgType = msg.header.msg_type;
    switch (msgType) {
      case 'execute_result':
      case 'display_data':
      case 'stream':
      case 'error': {
        const model = msg.content as nbformat.IOutput;
        model.output_type = msgType as nbformat.OutputType;
        this._outputs.add(model);
        break;
      }
      case 'clear_output':
        this.clear_output((msg as KernelMessage.IClearOutputMsg).content.wait);
        break;
      default:
        break;
    }
    this.set('outputs', this._outputs.toJSON(), { newMessage: true });
    this.save_changes();
  }

  clear_output(wait = false): void {
    this._outputs.clear(wait);
  }

  get outputs(): OutputAreaModel {
    return this._outputs;
  }

  setOutputs(model?: any, value?: any, options?: any): void {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this._outputs.fromJSON(JSON.parse(JSON.stringify(this.get('outputs'))));
    }
  }

  widget_manager: LabWidgetManager;

  private _msgHook: (msg: KernelMessage.IIOPubMessage) => boolean;
  private _outputs: OutputAreaModel;
  static rendermime: IRenderMimeRegistry;
}

export class OutputView extends outputBase.OutputView {
  _createElement(tagName: string): HTMLElement {
    this.luminoWidget = new JupyterLuminoPanelWidget({ view: this });
    return this.luminoWidget.node;
  }

  _setElement(el: HTMLElement): void {
    if (this.el || el !== this.luminoWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error('Cannot reset the DOM element.');
    }

    this.el = this.luminoWidget.node;
    this.$el = $(this.luminoWidget.node);
  }

  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();
    this._outputView = new OutputArea({
      rendermime: OutputModel.rendermime,
      contentFactory: OutputArea.defaultContentFactory,
      model: this.model.outputs,
    });

    // TODO: why is this a readonly property now?
    // this._outputView.model = this.model.outputs;
    // TODO: why is this on the model now?
    // this._outputView.trusted = true;
    this.luminoWidget.insertWidget(0, this._outputView);

    this.luminoWidget.addClass('jupyter-widgets');
    this.luminoWidget.addClass('widget-output');
    this.update(); // Set defaults.
  }

  remove(): any {
    this._outputView.dispose();
    return super.remove();
  }

  model: OutputModel;
  _outputView: OutputArea;
  luminoWidget: Panel;
}
