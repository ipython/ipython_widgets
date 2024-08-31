import { expect } from 'chai';

import { RenderedText } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { HTMLManager } from '../../lib/';

import * as base from '@jupyter-widgets/base';

const newWidget = async (modelState: any): Promise<HTMLElement> => {
  const widgetTag = document.createElement('div');
  widgetTag.className = 'widget-subarea';
  document.body.appendChild(widgetTag);
  const manager = new HTMLManager();
  const modelId = 'u-u-i-d';
  const modelCreate: base.IModelOptions = {
    model_name: 'OutputModel',
    model_id: modelId,
    model_module: '@jupyter-widgets/output',
    model_module_version: '*',
  };
  const model = await manager.new_model(modelCreate, modelState);
  await manager.display_view(manager.create_view(model), widgetTag);
  return widgetTag;
};

describe('Output widget', function () {
  it('renders text output', async () => {
    const textValue = 'this-is-a-test\n';
    const modelState = {
      _view_module: '@jupyter-widgets/output',
      outputs: [
        {
          output_type: 'stream',
          name: 'stdout',
          text: textValue,
        },
      ],
    };

    const elt = await newWidget(modelState);
    expect(elt.textContent).to.equal(textValue);
  });

  it('renders data output', async function () {
    // Pandas dataframe
    const modelState = {
      _view_module: '@jupyter-widgets/output',
      outputs: [
        {
          output_type: 'display_data',
          data: {
            'text/plain': '   a  b\n0  1  4\n1  2  5\n2  3  6',
            'text/html':
              '<div>\n<table border="1" class="dataframe">\n  <thead>\n    <tr style="text-align: right;">\n      <th></th>\n      <th>a</th>\n      <th>b</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th>0</th>\n      <td>1</td>\n      <td>4</td>\n    </tr>\n    <tr>\n      <th>1</th>\n      <td>2</td>\n      <td>5</td>\n    </tr>\n    <tr>\n      <th>2</th>\n      <td>3</td>\n      <td>6</td>\n    </tr>\n  </tbody>\n</table>\n</div>',
          },
          metadata: {},
        },
      ],
    };

    const elt = await newWidget(modelState);
    expect(elt.querySelectorAll('table').length).to.equal(1);
  });

  it('renders widgets ipywidgets 7', async function () {
    const modelState = {
      _view_module: '@jupyter-widgets/output',
      outputs: [
        {
          output_type: 'display_data',
          data: {
            'application/vnd.jupyter.widget-view+json': {
              model_id: 'adffc4580a0944f6929c381463b0059b',
              version_minor: 0,
              version_major: 2,
            },
            'text/plain': 'A Jupyter Widget',
          },
          metadata: {},
        },
      ],
    };

    const elt = document.createElement('div');
    elt.className = 'widget-subarea';
    document.body.appendChild(elt);
    const manager = new HTMLManager();

    // We need to seed the manager with the state of the widgets
    const managerState = {
      adffc4580a0944f6929c381463b0059b: {
        model_name: 'IntSliderModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: '1.5.0',
        state: {
          style: 'IPY_MODEL_3b8780f457254737a83be48bc32b0613',
          _view_module: '@jupyter-widgets/controls',
          layout: 'IPY_MODEL_33cb011834fd4c9d9af512e5e98c9904',
          value: 45,
          _model_module: '@jupyter-widgets/controls',
        },
      },
      '3b8780f457254737a83be48bc32b0613': {
        model_name: 'SliderStyleModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: '1.5.0',
        state: {
          description_width: '',
          _model_module: '@jupyter-widgets/controls',
        },
      },
      '33cb011834fd4c9d9af512e5e98c9904': {
        model_name: 'LayoutModel',
        model_module: '@jupyter-widgets/base',
        model_module_version: '1.2.0',
        state: {},
      },
    };
    await manager.set_state({
      state: managerState,
      version_major: 2,
      version_minor: 0,
    });
    const modelId = 'u-u-i-d';
    const modelCreate: base.IModelOptions = {
      model_name: 'OutputModel',
      model_id: modelId,
      model_module: '@jupyter-widgets/output',
      model_module_version: '*',
    };
    const model = await manager.new_model(modelCreate, modelState);
    await manager.display_view(manager.create_view(model), elt);

    // Give the widget time to render
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    expect(elt.querySelectorAll('.slider').length).to.equal(1);
  });

  it('renders widgets', async function () {
    const modelState = {
      _view_module: '@jupyter-widgets/output',
      outputs: [
        {
          output_type: 'display_data',
          data: {
            'application/vnd.jupyter.widget-view+json': {
              model_id: 'adffc4580a0944f6929c381463b0059b',
              version_minor: 0,
              version_major: 2,
            },
            'text/plain': 'A Jupyter Widget',
          },
          metadata: {},
        },
      ],
    };

    const elt = document.createElement('div');
    elt.className = 'widget-subarea';
    document.body.appendChild(elt);
    const manager = new HTMLManager();

    // We need to seed the manager with the state of the widgets
    const managerState = {
      adffc4580a0944f6929c381463b0059b: {
        model_name: 'IntSliderModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: '2.0.0',
        state: {
          style: 'IPY_MODEL_3b8780f457254737a83be48bc32b0613',
          _view_module: '@jupyter-widgets/controls',
          layout: 'IPY_MODEL_33cb011834fd4c9d9af512e5e98c9904',
          value: 45,
          _model_module: '@jupyter-widgets/controls',
        },
      },
      '3b8780f457254737a83be48bc32b0613': {
        model_name: 'SliderStyleModel',
        model_module: '@jupyter-widgets/controls',
        model_module_version: '2.0.0',
        state: {
          description_width: '',
          _model_module: '@jupyter-widgets/controls',
        },
      },
      '33cb011834fd4c9d9af512e5e98c9904': {
        model_name: 'LayoutModel',
        model_module: '@jupyter-widgets/base',
        model_module_version: '2.0.0',
        state: {},
      },
    };
    await manager.set_state({
      state: managerState,
      version_major: 2,
      version_minor: 0,
    });
    const modelId = 'u-u-i-d';
    const modelCreate: base.IModelOptions = {
      model_name: 'OutputModel',
      model_id: modelId,
      model_module: '@jupyter-widgets/output',
      model_module_version: '*',
    };
    const model = await manager.new_model(modelCreate, modelState);
    await manager.display_view(manager.create_view(model), elt);

    // Give the widget time to render
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    expect(elt.querySelectorAll('.slider').length).to.equal(1);
  });

  it('renders custom mimetypes', async function () {
    const t = 'hello';

    // Text renderer that always renders 'something different'
    class MockTextRenderer extends RenderedText {
      /**
       * Render a mime model.
       *
       * @param model - The mime model to render.
       *
       * @returns A promise which resolves when rendering is complete.
       */
      render(model: IRenderMime.IMimeModel): Promise<void> {
        expect(model.data['text/plain']).to.equal(t);
        this.node.textContent = 'something different';
        return Promise.resolve();
      }
    }

    const widgetTag = document.createElement('div');
    widgetTag.className = 'widget-subarea';
    document.body.appendChild(widgetTag);
    const manager = new HTMLManager();

    manager.renderMime.addFactory(
      {
        safe: true,
        mimeTypes: ['text/plain'],
        createRenderer: (options) => new MockTextRenderer(options),
      },
      0
    );

    const modelId = 'u-u-i-d';
    const modelCreate: base.IModelOptions = {
      model_name: 'OutputModel',
      model_id: modelId,
      model_module: '@jupyter-widgets/output',
      model_module_version: '*',
    };

    const modelState = {
      _view_module: '@jupyter-widgets/output',
      outputs: [
        {
          output_type: 'display_data',
          data: {
            'text/plain': t,
          },
          metadata: {},
        },
      ],
    };
    const model = await manager.new_model(modelCreate, modelState);
    await manager.display_view(manager.create_view(model), widgetTag);
    expect(widgetTag.innerText).to.equal('something different');
  });

  it('renders text output', async () => {
    const manager = new HTMLManager();
    const modelId = 'u-u-i-d';
    const modelCreate: base.IModelOptions = {
      model_name: 'OutputModel',
      model_id: modelId,
      model_module: '@jupyter-widgets/output',
      model_module_version: '*',
    };

    const startingText = 'starting text';
    const endingText = 'ending text';
    const modelState = {
      _view_module: '@jupyter-widgets/output',
      outputs: [
        {
          output_type: 'stream',
          name: 'stdout',
          text: startingText,
        },
      ],
    };

    const widgetTag = document.createElement('div');
    widgetTag.className = 'widget-subarea';
    document.body.appendChild(widgetTag);
    const model = await manager.new_model(modelCreate, modelState);
    await manager.display_view(manager.create_view(model), widgetTag);
    expect(widgetTag.innerText).to.equal(startingText);

    model.set('outputs', [
      {
        output_type: 'stream',
        name: 'stdout',
        text: endingText,
      },
    ]);
    expect(widgetTag.innerText).to.equal(endingText);
  });
});
