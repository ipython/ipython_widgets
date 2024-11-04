// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { WidgetModel, unpack_models } from '@jupyter-widgets/base';

import { CoreWidgetModel } from './widget_core';

export class DirectionalLinkModel extends CoreWidgetModel {
  static serializers = {
    ...CoreWidgetModel.serializers,
    target: { deserialize: unpack_models },
    source: { deserialize: unpack_models },
  };

  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      target: undefined,
      source: undefined,
      _model_name: 'DirectionalLinkModel',
    };
  }

  initialize(
    attributes: Backbone.ObjectHash,
    options: { model_id: string; comm: any; widget_manager: any }
  ): void {
    super.initialize(attributes, options);
    this.on('change', this.updateBindings, this);
    this.updateBindings();
  }

  updateValue(
    sourceModel: WidgetModel,
    sourceAttr: string,
    targetModel: WidgetModel,
    targetAttr: string
  ): void {
    if (this._updating) {
      return;
    }
    this._updating = true;
    try {
      if (targetModel) {
        targetModel.set(targetAttr, sourceModel.get(sourceAttr));
        targetModel.save_changes();
      }
    } finally {
      this._updating = false;
    }
  }

  updateBindings(): void {
    this.cleanup();
    [this.sourceModel, this.sourceAttr] = this.get('source') || [null, null];
    [this.targetModel, this.targetAttr] = this.get('target') || [null, null];
    if (this.sourceModel) {
      this.listenTo(this.sourceModel, 'change:' + this.sourceAttr, () => {
        this.updateValue(
          this.sourceModel,
          this.sourceAttr,
          this.targetModel,
          this.targetAttr
        );
      });
      this.updateValue(
        this.sourceModel,
        this.sourceAttr,
        this.targetModel,
        this.targetAttr
      );
      this.listenToOnce(this.sourceModel, 'destroy', this.cleanup);
    }
    if (this.targetModel) {
      this.listenToOnce(this.targetModel, 'destroy', this.cleanup);
    }
  }

  cleanup(): void {
    // Stop listening to 'change' and 'destroy' events of the source and target
    if (this.sourceModel) {
      this.stopListening(
        this.sourceModel,
        'change:' + this.sourceAttr,
        undefined
      );
      this.stopListening(this.sourceModel, 'destroy', undefined);
      this.set('source', [null, '']);
    }
    if (this.targetModel) {
      this.stopListening(this.targetModel, 'destroy', undefined);
      this.set('target', [null, '']);
      this.save_changes();
    }
  }

  sourceModel: WidgetModel;
  sourceAttr: string;
  targetModel: WidgetModel;
  targetAttr: string;

  private _updating: boolean;
}

export class LinkModel extends DirectionalLinkModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _model_name: 'LinkModel',
    };
  }

  updateBindings(): void {
    super.updateBindings();
    if (this.targetModel) {
      this.listenTo(this.targetModel, 'change:' + this.targetAttr, () => {
        this.updateValue(
          this.targetModel,
          this.targetAttr,
          this.sourceModel,
          this.sourceAttr
        );
      });
    }
  }

  cleanup(): void {
    super.cleanup();
    if (this.targetModel) {
      this.stopListening(
        this.targetModel,
        'change:' + this.targetAttr,
        undefined
      );
    }
  }
}
