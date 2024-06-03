// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ConsolePanel, IConsoleTracker } from '@jupyterlab/console';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { ILoggerRegistry } from '@jupyterlab/logconsole';

import { DisposableDelegate } from '@lumino/disposable';

import { WidgetRenderer } from './renderer';

import {
  LabWidgetManager,
  WIDGET_VIEW_MIMETYPE,
  WidgetManager,
} from './manager';

import { OUTPUT_WIDGET_VERSION, OutputModel, OutputView } from './output';

import * as base from '@jupyter-widgets/base';

// We import only the version from the specific module in controls so that the
// controls code can be split and dynamically loaded in webpack.
import { JUPYTER_CONTROLS_VERSION } from '@jupyter-widgets/controls/lib/version';

import '@jupyter-widgets/base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';

/**
 * The cached settings.
 */
const SETTINGS: WidgetManager.Settings = { saveState: false };

export function registerWidgetManager(
  context: DocumentRegistry.Context,
  rendermime: IRenderMimeRegistry
): DisposableDelegate {
  const wManager = new WidgetManager(context, rendermime, SETTINGS);
  return new DisposableDelegate(() => wManager!.dispose());
}

function attachWidgetManager(panel: NotebookPanel | ConsolePanel) {
  if (panel instanceof NotebookPanel) {
    new WidgetManager(panel.context, panel.content.rendermime, SETTINGS);
  } else if (panel instanceof ConsolePanel) {
    new WidgetManager(panel.console as any, panel.console.rendermime);
  }
}

/**
 * The widget manager provider.
 */
export const managerPlugin: JupyterFrontEndPlugin<base.IJupyterWidgetRegistry> =
  {
    id: '@jupyter-widgets/jupyterlab-manager:plugin',
    requires: [IRenderMimeRegistry],
    optional: [
      INotebookTracker,
      IConsoleTracker,
      ISettingRegistry,
      IMainMenu,
      ILoggerRegistry,
      ITranslator,
    ],
    provides: base.IJupyterWidgetRegistry,
    activate: activateWidgetExtension,
    autoStart: true,
  };

function updateSettings(settings: ISettingRegistry.ISettings): void {
  SETTINGS.saveState = settings.get('saveState').composite as boolean;
}

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(
  app: JupyterFrontEnd,
  rendermime: IRenderMimeRegistry,
  widgetTracker: INotebookTracker | null,
  consoleTracker: IConsoleTracker | null,
  settingRegistry: ISettingRegistry | null,
  menu: IMainMenu | null,
  loggerRegistry: ILoggerRegistry | null,
  translator: ITranslator | null
): base.IJupyterWidgetRegistry {
  const { commands } = app;
  const trans = (translator ?? nullTranslator).load('jupyterlab_widgets');

  if (settingRegistry !== null) {
    settingRegistry
      .load(managerPlugin.id)
      .then((settings: ISettingRegistry.ISettings) => {
        settings.changed.connect(updateSettings);
        updateSettings(settings);
      })
      .catch((reason: Error) => {
        console.error(reason.message);
      });
  }
  WidgetManager.loggerRegistry = loggerRegistry;
  LabWidgetManager.globalRendermime = rendermime;
  // Add a default widget renderer.
  rendermime.addFactory(
    {
      safe: false,
      mimeTypes: [WIDGET_VIEW_MIMETYPE],
      createRenderer: (options) => new WidgetRenderer(options),
    },
    -10
  );
  for (const tracker of [widgetTracker, consoleTracker]) {
    if (tracker !== null) {
      tracker.forEach((panel) => attachWidgetManager(panel));
      tracker.widgetAdded.connect((sender, panel) =>
        attachWidgetManager(panel)
      );
    }
  }
  if (settingRegistry !== null) {
    // Add a command for automatically saving (jupyter-)widget state.
    commands.addCommand('@jupyter-widgets/jupyterlab-manager:saveWidgetState', {
      label: trans.__('Save Widget State Automatically'),
      execute: (args) => {
        return settingRegistry
          .set(managerPlugin.id, 'saveState', !SETTINGS.saveState)
          .catch((reason: Error) => {
            console.error(
              `Failed to set ${managerPlugin.id}: ${reason.message}`
            );
          });
      },
      isToggled: () => SETTINGS.saveState,
    });
  }

  if (menu) {
    menu.settingsMenu.addGroup([
      { command: '@jupyter-widgets/jupyterlab-manager:saveWidgetState' },
    ]);
  }

  return {
    registerWidget(data: base.IWidgetRegistryData): void {
      LabWidgetManager.WIDGET_REGISTRY.push(data);
    },
  };
}

/**
 * The base widgets.
 */
export const baseWidgetsPlugin: JupyterFrontEndPlugin<void> = {
  id: `@jupyter-widgets/jupyterlab-manager:base-${base.JUPYTER_WIDGETS_VERSION}`,
  requires: [base.IJupyterWidgetRegistry],
  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    registry: base.IJupyterWidgetRegistry
  ): void => {
    registry.registerWidget({
      name: '@jupyter-widgets/base',
      version: base.JUPYTER_WIDGETS_VERSION,
      exports: {
        WidgetModel: base.WidgetModel,
        WidgetView: base.WidgetView,
        DOMWidgetView: base.DOMWidgetView,
        DOMWidgetModel: base.DOMWidgetModel,
        LayoutModel: base.LayoutModel,
        LayoutView: base.LayoutView,
        StyleModel: base.StyleModel,
        StyleView: base.StyleView,
        ErrorWidgetView: base.ErrorWidgetView,
      },
    });
  },
};

/**
 * The control widgets.
 */
export const controlWidgetsPlugin: JupyterFrontEndPlugin<void> = {
  id: `@jupyter-widgets/jupyterlab-manager:controls-${JUPYTER_CONTROLS_VERSION}`,
  requires: [base.IJupyterWidgetRegistry],
  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    registry: base.IJupyterWidgetRegistry
  ): void => {
    registry.registerWidget({
      name: '@jupyter-widgets/controls',
      version: JUPYTER_CONTROLS_VERSION,
      exports: () => {
        return new Promise((resolve, reject) => {
          (require as any).ensure(
            ['@jupyter-widgets/controls'],
            (require: NodeRequire) => {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              resolve(require('@jupyter-widgets/controls'));
            },
            (err: any) => {
              reject(err);
            },
            '@jupyter-widgets/controls'
          );
        });
      },
    });
  },
};

/**
 * The output widget.
 */
export const outputWidgetPlugin: JupyterFrontEndPlugin<void> = {
  id: `@jupyter-widgets/jupyterlab-manager:output-${OUTPUT_WIDGET_VERSION}`,
  requires: [base.IJupyterWidgetRegistry, IRenderMimeRegistry],
  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    registry: base.IJupyterWidgetRegistry,
    rendermime: IRenderMimeRegistry
  ): void => {
    (OutputModel.rendermime = rendermime),
      registry.registerWidget({
        name: '@jupyter-widgets/output',
        version: OUTPUT_WIDGET_VERSION,
        exports: { OutputModel, OutputView },
      });
  },
};

export default [
  managerPlugin,
  baseWidgetsPlugin,
  controlWidgetsPlugin,
  outputWidgetPlugin,
];
