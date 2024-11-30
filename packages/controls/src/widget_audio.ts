// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { DOMWidgetView } from '@jupyter-widgets/base';

import { CoreDOMWidgetModel } from './widget_core';

export class AudioModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'AudioModel',
      _view_name: 'AudioView',
      format: 'mp3',
      autoplay: true,
      loop: true,
      controls: true,
      current_time: 0,
      value: new DataView(new ArrayBuffer(0)),
    };
  }

  static serializers = {
    ...CoreDOMWidgetModel.serializers,
    value: {
      serialize: (value: any): DataView => {
        return new DataView(value.buffer.slice(0));
      },
    },
  };
}

export class AudioView extends DOMWidgetView {
  render(): void {
    /**
     * Called when view is rendered.
     */
    super.render();
    this.luminoWidget.addClass('jupyter-widgets');
    this.update(); // Set defaults.
  }

  update(): void {
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */

    let url;
    const format = this.model.get('format');
    const value = this.model.get('value');
    if (format !== 'url') {
      const blob = new Blob([value], {
        type: `audio/${this.model.get('format')}`,
      });
      url = URL.createObjectURL(blob);
    } else {
      url = new TextDecoder('utf-8').decode(value.buffer);
    }

    // Clean up the old objectURL
    const oldurl = this.el.src;
    this.el.src = url;
    if (oldurl) {
      URL.revokeObjectURL(oldurl);
    }

    // Audio attributes
    this.el.loop = this.model.get('loop');
    this.el.autoplay = this.model.get('autoplay');
    this.el.controls = this.model.get('controls');
    this.el.currentTime = this.model.get('current_time');

    return super.update();
  }

  remove(): void {
    if (this.el.src) {
      URL.revokeObjectURL(this.el.src);
    }
    super.remove();
  }

  preinitialize() {
    // Must set this before the initialize method creates the element
    this.tagName = 'audio';
  }

  el: HTMLAudioElement;
}
