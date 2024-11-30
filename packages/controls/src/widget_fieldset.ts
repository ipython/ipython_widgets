// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetView,
    unpack_models,
    ViewList,
    JupyterLuminoPanelWidget,
    reject,
    WidgetModel,
    WidgetView,
} from '@jupyter-widgets/base';

import { CoreDOMWidgetModel } from './widget_core';

import { ArrayExt } from '@lumino/algorithm';

import { MessageLoop } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

import $ from 'jquery';

export class FieldsetModel extends CoreDOMWidgetModel {
    defaults(): Backbone.ObjectHash {
        return {
            ...super.defaults(),
            _view_name: 'FieldsetView',
            _model_name: 'FieldsetModel',
            children: [],
            box_style: '',
        };
    }

    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        children: { deserialize: unpack_models },
    };
}


export class FieldsetView extends DOMWidgetView {
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

    initialize(parameters: WidgetView.IInitializeParameters): void {
        super.initialize(parameters);
        this.children_views = new ViewList(this.add_child_model, null, this);
        this.listenTo(this.model, 'change:children', this.update_children);
        this.listenTo(this.model, 'change:fieldset_style', this.update_fieldset_style);

        this.luminoWidget.addClass('jupyter-widgets');
        this.luminoWidget.addClass('widget-container');
    }

    render(): void {
        super.render();
        this.update_children();
        this.set_fieldset_style();
    }

    update_children(): void {
        this.children_views
            ?.update(this.model.get('children'))
            .then((views: DOMWidgetView[]) => {
                // Notify all children that their sizes may have changed.
                views.forEach((view) => {
                    MessageLoop.postMessage(
                        view.luminoWidget,
                        Widget.ResizeMessage.UnknownSize
                    );
                });
            });
    }

    update_fieldset_style(): void {
        this.update_mapped_classes(FieldsetView.class_map, 'fieldset_style');
    }

    set_fieldset_style(): void {
        this.set_mapped_classes(FieldsetView.class_map, 'fieldset_style');
    }

    add_child_model(model: WidgetModel): Promise<DOMWidgetView> {
        // we insert a dummy element so the order is preserved when we add
        // the rendered content later.
        const dummy = new Widget();
        this.luminoWidget.addWidget(dummy);

        return this.create_child_view(model)
            .then((view: DOMWidgetView) => {
                // replace the dummy widget with the new one.
                const i = ArrayExt.firstIndexOf(this.luminoWidget.widgets, dummy);
                this.luminoWidget.insertWidget(i, view.luminoWidget);
                dummy.dispose();
                return view;
            })
            .catch(reject('Could not add child view to fieldset', true));
    }

    remove(): void {
        this.children_views = null;
        super.remove();
    }

    children_views: ViewList<DOMWidgetView> | null;
    luminoWidget: JupyterLuminoPanelWidget;

    static class_map = {
        success: ['alert', 'alert-success'],
        info: ['alert', 'alert-info'],
        warning: ['alert', 'alert-warning'],
        danger: ['alert', 'alert-danger'],
    };
}
