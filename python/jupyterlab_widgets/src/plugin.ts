// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import * as nbformat from '@jupyterlab/nbformat';

import {
  IConsoleTracker,
  CodeConsole,
  ConsolePanel,
} from '@jupyterlab/console';

import {
  INotebookModel,
  INotebookTracker,
  Notebook,
  NotebookPanel,
} from '@jupyterlab/notebook';

import {
  JupyterFrontEndPlugin,
  JupyterFrontEnd,
} from '@jupyterlab/application';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { ILoggerRegistry, LogLevel } from '@jupyterlab/logconsole';

import { CodeCell } from '@jupyterlab/cells';

import { filter } from '@lumino/algorithm';

import { DisposableDelegate } from '@lumino/disposable';

import { WidgetRenderer } from './renderer';

import {
  WidgetManager,
  WIDGET_VIEW_MIMETYPE,
  KernelWidgetManager,
} from './manager';

import { OutputModel, OutputView, OUTPUT_WIDGET_VERSION } from './output';

import * as base from '@jupyter-widgets/base';

// We import only the version from the specific module in controls so that the
// controls code can be split and dynamically loaded in webpack.
import { JUPYTER_CONTROLS_VERSION } from '@jupyter-widgets/controls/lib/version';

import '@jupyter-widgets/base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';
import { KernelMessage } from '@jupyterlab/services';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { ISessionContext } from '@jupyterlab/apputils';

const WIDGET_REGISTRY: base.IWidgetRegistryData[] = [];

/**
 * The cached settings.
 */
const SETTINGS: WidgetManager.Settings = { saveState: false };

/**
 * Iterate through all widget renderers in a notebook.
 */
function* notebookWidgetRenderers(
  nb: Notebook
): Generator<WidgetRenderer, void, unknown> {
  for (const cell of nb.widgets) {
    if (cell.model.type === 'code') {
      for (const codecell of (cell as CodeCell).outputArea.widgets) {
        // We use Array.from instead of using Lumino 2 (JLab 4) iterator
        // This is to support Lumino 1 (JLab 3) as well
        for (const output of Array.from(codecell.children())) {
          if (output instanceof WidgetRenderer) {
            yield output;
          }
        }
      }
    }
  }
}

/**
 * Iterate through all widget renderers in a console.
 */
function* consoleWidgetRenderers(
  console: CodeConsole
): Generator<WidgetRenderer, void, unknown> {
  for (const cell of Array.from(console.cells)) {
    if (cell.model.type === 'code') {
      for (const codecell of (cell as unknown as CodeCell).outputArea.widgets) {
        for (const output of Array.from(codecell.children())) {
          if (output instanceof WidgetRenderer) {
            yield output;
          }
        }
      }
    }
  }
}

/**
 * Iterate through all matching linked output views
 */
function* outputViews(
  app: JupyterFrontEnd,
  path: string
): Generator<WidgetRenderer, void, unknown> {
  const linkedViews = filter(
    app.shell.widgets(),
    (w) => w.id.startsWith('LinkedOutputView-') && (w as any).path === path
  );
  // We use Array.from instead of using Lumino 2 (JLab 4) iterator
  // This is to support Lumino 1 (JLab 3) as well
  for (const view of Array.from(linkedViews)) {
    for (const outputs of Array.from(view.children())) {
      for (const output of Array.from(outputs.children())) {
        if (output instanceof WidgetRenderer) {
          yield output;
        }
      }
    }
  }
}

function* chain<T>(
  ...args: IterableIterator<T>[]
): Generator<T, void, undefined> {
  for (const it of args) {
    yield* it;
  }
}

const NO_KERNEL_SESSION_CONTEXT_IDS = new WeakMap<ISessionContext, string>();

/**
 * Get the kernel id of current notebook or console panel, this value
 * is used as key for `Private.widgetManagerProperty` to store the widget
 * manager of current notebook or console panel.
 *
 * @param {ISessionContext} sessionContext The session context of notebook or
 * console panel.
 */
async function getWidgetManagerOwner(
  sessionContext: ISessionContext
): Promise<Private.IWidgetManagerOwner> {
  await sessionContext.ready;
  let id = sessionContext.session?.kernel?.id;
  if (id === undefined) {
    id = NO_KERNEL_SESSION_CONTEXT_IDS.get(sessionContext);
    if (id === undefined) {
      id = 'no-kernel-' + base.uuid();
      NO_KERNEL_SESSION_CONTEXT_IDS.set(sessionContext, id);
    }
  }
  return id;
}

/**
 * Common handler for registering both notebook and console
 * `WidgetManager`
 *
 * @param {(Notebook | CodeConsole)} content Context of panel.
 * @param {ISessionContext} sessionContext Session context of panel.
 * @param {IRenderMimeRegistry} rendermime Rendermime of panel.
 * @param {IterableIterator<WidgetRenderer>} renderers Iterator of
 * `WidgetRenderer` inside panel
 * @param {(() => WidgetManager | KernelWidgetManager)} widgetManagerFactory
 * function to create widget manager.
 */
async function registerWidgetHandler(
  content: Notebook | CodeConsole,
  sessionContext: ISessionContext,
  rendermime: IRenderMimeRegistry,
  renderers: IterableIterator<WidgetRenderer>,
  widgetManagerFactory: () => WidgetManager | KernelWidgetManager
): Promise<DisposableDelegate> {
  const wManagerOwner = await getWidgetManagerOwner(sessionContext);
  let wManager = Private.widgetManagerProperty.get(wManagerOwner);
  let currentOwner: string;

  if (!wManager) {
    wManager = widgetManagerFactory();
    WIDGET_REGISTRY.forEach((data) => wManager!.register(data));
    Private.widgetManagerProperty.set(wManagerOwner, wManager);
    currentOwner = wManagerOwner;
    content.disposed.connect((_) => {
      const currentwManager = Private.widgetManagerProperty.get(currentOwner);
      if (currentwManager) {
        Private.widgetManagerProperty.delete(currentOwner);
      }
    });

    sessionContext.kernelChanged.connect((_, args) => {
      const { newValue } = args;
      if (newValue) {
        const newKernelId = newValue.id;
        const oldwManager = Private.widgetManagerProperty.get(currentOwner);

        if (oldwManager) {
          Private.widgetManagerProperty.delete(currentOwner);
          Private.widgetManagerProperty.set(newKernelId, oldwManager);
        }
        currentOwner = newKernelId;
      }
    });
  }

  for (const r of renderers) {
    r.manager = wManager;
  }

  // Replace the placeholder widget renderer with one bound to this widget
  // manager.
  rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
  rendermime.addFactory(
    {
      safe: false,
      mimeTypes: [WIDGET_VIEW_MIMETYPE],
      createRenderer: (options) => new WidgetRenderer(options, wManager),
    },
    -10
  );

  return new DisposableDelegate(() => {
    if (rendermime) {
      rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
    }
    wManager!.dispose();
  });
}

// Kept for backward compat ipywidgets<=8, but not used here anymore
export function registerWidgetManager(
  context: DocumentRegistry.IContext<INotebookModel>,
  rendermime: IRenderMimeRegistry,
  renderers: IterableIterator<WidgetRenderer>
): DisposableDelegate {
  let wManager: WidgetManager;
  const managerReady = getWidgetManagerOwner(context.sessionContext).then(
    (wManagerOwner) => {
      const currentManager = Private.widgetManagerProperty.get(
        wManagerOwner
      ) as WidgetManager;
      if (!currentManager) {
        wManager = new WidgetManager(context, rendermime, SETTINGS);
        WIDGET_REGISTRY.forEach((data) => wManager!.register(data));
        Private.widgetManagerProperty.set(wManagerOwner, wManager);
      } else {
        wManager = currentManager;
      }

      for (const r of renderers) {
        r.manager = wManager;
      }

      // Replace the placeholder widget renderer with one bound to this widget
      // manager.
      rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
      rendermime.addFactory(
        {
          safe: false,
          mimeTypes: [WIDGET_VIEW_MIMETYPE],
          createRenderer: (options) => new WidgetRenderer(options, wManager),
        },
        -10
      );
    }
  );

  return new DisposableDelegate(async () => {
    await managerReady;
    if (rendermime) {
      rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
    }
    wManager!.dispose();
  });
}

export async function registerNotebookWidgetManager(
  panel: NotebookPanel,
  renderers: IterableIterator<WidgetRenderer>
): Promise<DisposableDelegate> {
  const content = panel.content;
  const context = panel.context;
  const sessionContext = context.sessionContext;
  const rendermime = content.rendermime;
  const widgetManagerFactory = () =>
    new WidgetManager(context, rendermime, SETTINGS);

  return registerWidgetHandler(
    content,
    sessionContext,
    rendermime,
    renderers,
    widgetManagerFactory
  );
}

export async function registerConsoleWidgetManager(
  panel: ConsolePanel,
  renderers: IterableIterator<WidgetRenderer>
): Promise<DisposableDelegate> {
  const content = panel.console;
  const sessionContext = content.sessionContext;
  const rendermime = content.rendermime;
  const widgetManagerFactory = () =>
    new KernelWidgetManager(sessionContext.session!.kernel!, rendermime);

  return registerWidgetHandler(
    content,
    sessionContext,
    rendermime,
    renderers,
    widgetManagerFactory
  );
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
  tracker: INotebookTracker | null,
  consoleTracker: IConsoleTracker | null,
  settingRegistry: ISettingRegistry | null,
  menu: IMainMenu | null,
  loggerRegistry: ILoggerRegistry | null,
  translator: ITranslator | null
): base.IJupyterWidgetRegistry {
  const { commands } = app;
  const trans = (translator ?? nullTranslator).load('jupyterlab_widgets');

  const bindUnhandledIOPubMessageSignal = async (
    nb: NotebookPanel
  ): Promise<void> => {
    if (!loggerRegistry) {
      return;
    }
    const wManagerOwner = await getWidgetManagerOwner(
      nb.context.sessionContext
    );
    const wManager = Private.widgetManagerProperty.get(wManagerOwner);

    if (wManager) {
      wManager.onUnhandledIOPubMessage.connect(
        (
          sender: WidgetManager | KernelWidgetManager,
          msg: KernelMessage.IIOPubMessage
        ) => {
          const logger = loggerRegistry.getLogger(nb.context.path);
          let level: LogLevel = 'warning';
          if (
            KernelMessage.isErrorMsg(msg) ||
            (KernelMessage.isStreamMsg(msg) && msg.content.name === 'stderr')
          ) {
            level = 'error';
          }
          const data: nbformat.IOutput = {
            ...msg.content,
            output_type: msg.header.msg_type,
          };
          logger.rendermime = nb.content.rendermime;
          logger.log({ type: 'output', data, level });
        }
      );
    }
  };
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

  // Add a placeholder widget renderer.
  rendermime.addFactory(
    {
      safe: false,
      mimeTypes: [WIDGET_VIEW_MIMETYPE],
      createRenderer: (options) => new WidgetRenderer(options),
    },
    -10
  );

  if (tracker !== null) {
    const rendererIterator = (panel: NotebookPanel) =>
      chain(
        notebookWidgetRenderers(panel.content),
        outputViews(app, panel.context.path)
      );
    tracker.forEach(async (panel) => {
      await registerNotebookWidgetManager(panel, rendererIterator(panel));
      bindUnhandledIOPubMessageSignal(panel);
    });
    tracker.widgetAdded.connect(async (sender, panel) => {
      await registerNotebookWidgetManager(panel, rendererIterator(panel));
      bindUnhandledIOPubMessageSignal(panel);
    });
  }

  if (consoleTracker !== null) {
    const rendererIterator = (panel: ConsolePanel) =>
      chain(consoleWidgetRenderers(panel.console));

    consoleTracker.forEach(async (panel) => {
      await registerConsoleWidgetManager(panel, rendererIterator(panel));
    });
    consoleTracker.widgetAdded.connect(async (sender, panel) => {
      await registerConsoleWidgetManager(panel, rendererIterator(panel));
    });
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
      WIDGET_REGISTRY.push(data);
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
  requires: [base.IJupyterWidgetRegistry],
  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    registry: base.IJupyterWidgetRegistry
  ): void => {
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
namespace Private {
  /**
   * A type alias for keys of `widgetManagerProperty` .
   */
  export type IWidgetManagerOwner = string;

  /**
   * A type alias for values of `widgetManagerProperty` .
   */
  export type IWidgetManagerValue =
    | WidgetManager
    | KernelWidgetManager
    | undefined;

  /**
   * A private map for a widget manager.
   */
  export const widgetManagerProperty = new Map<
    IWidgetManagerOwner,
    IWidgetManagerValue
  >();
}
