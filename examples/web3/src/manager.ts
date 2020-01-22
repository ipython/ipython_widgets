import * as base from '@jupyter-widgets/base';
import * as pWidget from '@lumino/widgets';

import { Kernel } from '@jupyterlab/services';

import { HTMLManager } from '@jupyter-widgets/html-manager';

import './widgets.css';
import { DOMWidgetView } from '@jupyter-widgets/base';

export class WidgetManager extends HTMLManager {
  constructor(kernel: Kernel.IKernelConnection, el: HTMLElement) {
    super();
    this.kernel = kernel;
    this.el = el;

    kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
      const oldComm = new base.shims.services.Comm(comm);
      await this.handle_comm_open(oldComm, msg);
    });
  }

  display_view(
    msg: any,
    view: DOMWidgetView,
    options: any
  ): Promise<HTMLElement> {
    return Promise.resolve(view).then(view => {
      pWidget.Widget.attach(view.pWidget, this.el);
      view.on('remove', function() {
        console.log('view removed', view);
      });
      // We will resolve this lie in another PR.
      return view as any;
    });
  }

  /**
   * Create a comm.
   */
  async _create_comm(
    target_name: string,
    model_id: string,
    data?: any,
    metadata?: any
  ): Promise<base.shims.services.Comm> {
    const comm = this.kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata);
    }
    return Promise.resolve(new base.shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info(): Promise<any> {
    return this.kernel
      .requestCommInfo({ target_name: this.comm_target_name })
      .then(reply => (reply.content as any).comms);
  }

  kernel: Kernel.IKernelConnection;
  el: HTMLElement;
}
