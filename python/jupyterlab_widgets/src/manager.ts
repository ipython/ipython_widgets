// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ExportData,
  ExportMap,
  ICallbacks,
  IClassicComm,
  IWidgetRegistryData,
  WidgetModel,
  WidgetView,
  shims,
} from '@jupyter-widgets/base';

import {
  IStateOptions,
  ManagerBase,
  serialize_state,
} from '@jupyter-widgets/base-manager';

import { IDisposable } from '@lumino/disposable';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { INotebookModel } from '@jupyterlab/notebook';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { ObservableList } from '@jupyterlab/observables';

import * as nbformat from '@jupyterlab/nbformat';

import { ILoggerRegistry, LogLevel } from '@jupyterlab/logconsole';

import { Kernel, KernelMessage, Session } from '@jupyterlab/services';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ISignal, Signal } from '@lumino/signaling';

import { valid } from 'semver';

import { SemVerCache } from './semvercache';

import Backbone from 'backbone';

import { WidgetRenderer } from './renderer';

import * as base from '@jupyter-widgets/base';

/**
 * The mime type for a widget view.
 */
export const WIDGET_VIEW_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

/**
 * The mime type for widget state data.
 */
export const WIDGET_STATE_MIMETYPE =
  'application/vnd.jupyter.widget-state+json';

/**
 * A widget manager that returns Lumino widgets.
 */
export abstract class LabWidgetManager
  extends ManagerBase
  implements IDisposable
{
  constructor(rendermime: IRenderMimeRegistry) {
    super();
    this._rendermime = rendermime;
  }

  /**
   * Default callback handler to emit unhandled kernel messages.
   */
  callbacks(view?: WidgetView): ICallbacks {
    return {
      iopub: {
        output: (msg: KernelMessage.IIOPubMessage): void => {
          this._onUnhandledIOPubMessage.emit(msg);
        },
      },
    };
  }

  /**
   * Register a new kernel
   */
  protected _handleKernelChanged({
    oldValue,
    newValue,
  }: Session.ISessionConnection.IKernelChangedArgs): void {
    if (oldValue) {
      oldValue.removeCommTarget(this.comm_target_name, this._handleCommOpen);
    }

    if (newValue) {
      newValue.registerCommTarget(this.comm_target_name, this._handleCommOpen);
    }
  }

  /**
   * Disconnect the widget manager from the kernel, setting each model's comm
   * as dead.
   */
  disconnect(): void {
    super.disconnect();
    this._restoredStatus = false;
  }

  protected async _loadFromKernel(): Promise<void> {
    if (!this.kernel) {
      throw new Error('Kernel not set');
    }
    if (this.kernel?.handleComms === false) {
      // A "load" for a kernel that does not handle comms does nothing.
      return;
    }
    return super._loadFromKernel();
  }

  /**
   * Create a comm.
   */
  async _create_comm(
    target_name: string,
    model_id: string,
    data?: any,
    metadata?: any,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Promise<IClassicComm> {
    const kernel = this.kernel;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    const comm = kernel.createComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata, buffers);
    }
    return new shims.services.Comm(comm);
  }

  /**
   * Get the currently-registered comms.
   */
  async _get_comm_info(): Promise<any> {
    const kernel = this.kernel;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    const reply = await kernel.requestCommInfo({
      target_name: this.comm_target_name,
    });
    if (reply.content.status === 'ok') {
      return (reply.content as any).comms;
    } else {
      return {};
    }
  }

  /**
   * Get whether the manager is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._rendermime = null!;

    if (this._commRegistration) {
      this._commRegistration.dispose();
    }
  }

  /**
   * Resolve a URL relative to the current notebook location.
   */
  async resolveUrl(url: string): Promise<string> {
    return url;
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected async loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView> {
    // Special-case the Jupyter base and controls packages. If we have just a
    // plain version, with no indication of the compatible range, prepend a ^ to
    // get all compatible versions. We may eventually apply this logic to all
    // widget modules. See issues #2006 and #2017 for more discussion.
    if (
      (moduleName === '@jupyter-widgets/base' ||
        moduleName === '@jupyter-widgets/controls') &&
      valid(moduleVersion)
    ) {
      moduleVersion = `^${moduleVersion}`;
    }

    const allVersions = this._registry.getAllVersions(moduleName);
    if (!allVersions) {
      throw new Error(`No version of module ${moduleName} is registered`);
    }
    const mod = this._registry.get(moduleName, moduleVersion);

    if (!mod) {
      const registeredVersionList = Object.keys(allVersions);
      throw new Error(
        `Module ${moduleName}, version ${moduleVersion} is not registered, however, \
        ${registeredVersionList.join(',')} ${
          registeredVersionList.length > 1 ? 'are' : 'is'
        }`
      );
    }
    let module: ExportMap;
    if (typeof mod === 'function') {
      module = await mod();
    } else {
      module = await mod;
    }
    const cls: any = module[className];
    if (!cls) {
      throw new Error(`Class ${className} not found in module ${moduleName}`);
    }
    return cls;
  }

  abstract get kernel(): Kernel.IKernelConnection | null;

  get rendermime(): IRenderMimeRegistry {
    return this._rendermime;
  }

  /**
   * A signal emitted when state is restored to the widget manager.
   *
   * #### Notes
   * This indicates that previously-unavailable widget models might be available now.
   */
  get restored(): ISignal<this, void> {
    return this._restored;
  }

  /**
   * Whether the state has been restored yet or not.
   */
  get restoredStatus(): boolean {
    return this._restoredStatus;
  }

  /**
   * A signal emitted for unhandled iopub kernel messages.
   *
   */
  get onUnhandledIOPubMessage(): ISignal<this, KernelMessage.IIOPubMessage> {
    return this._onUnhandledIOPubMessage;
  }

  register(data: IWidgetRegistryData): void {
    this._registry.set(data.name, data.version, data.exports);
  }

  /**
   * Register a widget model.
   */
  register_model(model_id: string, modelPromise: Promise<WidgetModel>): void {
    super.register_model(model_id, modelPromise);

    // Update the synchronous model map
    modelPromise.then((model) => {
      this._modelsSync.set(model_id, model);
      model.once('comm:close', () => {
        this._modelsSync.delete(model_id);
      });
    });
  }

  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  async clear_state(): Promise<void> {
    await super.clear_state();
    this._modelsSync = new Map();
  }

  /**
   * Synchronously get the state of the live widgets in the widget manager.
   *
   * This includes all of the live widget models, and follows the format given in
   * the @jupyter-widgets/schema package.
   *
   * @param options - The options for what state to return.
   * @returns A state dictionary
   */
  get_state_sync(options: IStateOptions = {}): ReadonlyPartialJSONValue {
    const models = [];
    for (const model of this._modelsSync.values()) {
      if (model.comm_live) {
        models.push(model);
      }
    }
    return serialize_state(models, options);
  }

  // _handleCommOpen is an attribute, not a method, so `this` is captured in a
  // single object that can be registered and removed
  protected _handleCommOpen = async (
    comm: Kernel.IComm,
    msg: KernelMessage.ICommOpenMsg
  ): Promise<void> => {
    const oldComm = new shims.services.Comm(comm);
    await this.handle_comm_open(oldComm, msg);
  };

  static globalRendermime: IRenderMimeRegistry;

  protected _restored = new Signal<this, void>(this);
  protected _restoredStatus = false;
  protected _kernelRestoreInProgress = false;

  private _isDisposed = false;
  private _registry: SemVerCache<ExportData> = new SemVerCache<ExportData>();
  private _rendermime: IRenderMimeRegistry;

  private _commRegistration: IDisposable;

  private _modelsSync = new Map<string, WidgetModel>();
  private _onUnhandledIOPubMessage = new Signal<
    this,
    KernelMessage.IIOPubMessage
  >(this);
  static WIDGET_REGISTRY = new ObservableList<base.IWidgetRegistryData>();
}

/**
 * A singleton widget manager per kernel for the lifecycle of the kernel.
 * The factory of the rendermime will be update to use the widgetManager
 * directly if it isn't the globalRendermime.
 */
export class KernelWidgetManager extends LabWidgetManager {
  constructor(
    kernel: Kernel.IKernelConnection,
    rendermime: IRenderMimeRegistry | null,
    pendingManagerMessage = 'Loading widget ...'
  ) {
    if (!rendermime) {
      rendermime = LabWidgetManager.globalRendermime;
    }
    const instance = Private.kernelWidgetManagers.get(kernel.id);
    if (instance) {
      instance._useKernel(kernel);
      KernelWidgetManager.configureRendermime(
        rendermime,
        instance,
        pendingManagerMessage
      );
      return instance;
    }
    if (!kernel.handleComms) {
      throw new Error('Kernel does not have handleComms enabled');
    }
    super(LabWidgetManager.globalRendermime);
    Private.kernelWidgetManagers.set(kernel.id, this);
    this.loadCustomWidgetDefinitions();
    LabWidgetManager.WIDGET_REGISTRY.changed.connect(() =>
      this.loadCustomWidgetDefinitions()
    );
    this._useKernel(kernel);
    KernelWidgetManager.configureRendermime(
      rendermime,
      this,
      pendingManagerMessage
    );
  }

  _useKernel(this: KernelWidgetManager, kernel: Kernel.IKernelConnection) {
    if (!kernel.handleComms) {
      return;
    }
    this._handleKernelChanged({
      name: 'kernel',
      oldValue: this._kernel,
      newValue: kernel,
    });
    if (this._kernel) {
      this._kernel.statusChanged.disconnect(
        this._handleKernelStatusChange,
        this
      );
      this._kernel.connectionStatusChanged.disconnect(
        this._handleKernelConnectionStatusChange,
        this
      );
    }
    this._kernel = kernel;
    this._kernel.statusChanged.connect(this._handleKernelStatusChange, this);
    this._kernel.connectionStatusChanged.connect(
      this._handleKernelConnectionStatusChange,
      this
    );
    this._restoredStatus = false;
    this._kernelRestoreInProgress = true;
    this.clear_state().then(() => this.restoreWidgets());
  }

  /**
   * Configure a non-global rendermime. Passing the global rendermine will do
   * nothing.
   *
   * @param rendermime
   * @param manager The manager to use with WidgetRenderer.
   * @param pendingManagerMessage A message that is displayed while the manager
   * has not been provided. If manager is not provided here a non-empty string
   * assumes the manager will be provided at some time in the future.
   *
   * The default will search for a manager once.
   * @returns
   */
  static configureRendermime(
    rendermime: IRenderMimeRegistry,
    manager?: KernelWidgetManager,
    pendingManagerMessage = ''
  ) {
    if (rendermime === LabWidgetManager.globalRendermime) {
      return;
    }
    rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
    rendermime.addFactory(
      {
        safe: false,
        mimeTypes: [WIDGET_VIEW_MIMETYPE],
        createRenderer: (options: IRenderMime.IRendererOptions) =>
          new WidgetRenderer(options, manager, pendingManagerMessage),
      },
      -10
    );
  }

  _handleKernelConnectionStatusChange(
    sender: Kernel.IKernelConnection,
    status: Kernel.ConnectionStatus
  ): void {
    switch (status) {
      case 'connected':
        // Only restore if we aren't currently trying to restore from the kernel
        // (for example, in our initial restore from the constructor).
        if (!this._kernelRestoreInProgress) {
          this.restoreWidgets();
        }
        break;
      case 'disconnected':
        this.disconnect();
        break;
    }
  }

  _handleKernelStatusChange(
    sender: Kernel.IKernelConnection,
    status: Kernel.Status
  ): void {
    switch (status) {
      case 'restarting':
      case 'dead':
        this.disconnect();
        break;
    }
  }
  /**
   * Restore widgets from kernel.
   */
  async restoreWidgets(): Promise<void> {
    try {
      await this._loadFromKernel();
    } catch (err) {
      // Do nothing
    }
    this._restoredStatus = true;
    this._restored.emit();
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    KernelWidgetManager.configureRendermime(this.rendermime);
    Private.kernelWidgetManagers.delete(this.kernel.id);
    this._handleKernelChanged({
      name: 'kernel',
      oldValue: this._kernel,
      newValue: null,
    });
    this._kernel = null!;
    this.clear_state();
  }

  get kernel(): Kernel.IKernelConnection {
    return this._kernel;
  }

  loadCustomWidgetDefinitions() {
    for (const data of LabWidgetManager.WIDGET_REGISTRY) {
      this.register(data);
    }
  }

  filterModelState(serialized_state: any): any {
    return this.filterExistingModelState(serialized_state);
  }

  private _kernel: Kernel.IKernelConnection;
  protected _kernelRestoreInProgress = false;
}

/**
 * Monitor kernel of the Context swapping the kernel manager on demand.
 * A better name would be `NotebookManagerSwitcher'.
 */
export class WidgetManager extends Backbone.Model implements IDisposable {
  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    rendermime: IRenderMimeRegistry,
    settings: WidgetManager.Settings,
    renderers?: IterableIterator<WidgetRenderer>
  ) {
    super();
    this._rendermime = rendermime;
    this._context = context;
    this._settings = settings;
    this._renderers = renderers;

    context.sessionContext.kernelChanged.connect(
      this._handleKernelChange,
      this
    );

    context.sessionContext.statusChanged.connect(
      this._handleStatusChange,
      this
    );

    context.sessionContext.connectionStatusChanged.connect(
      this._handleConnectionStatusChange,
      this
    );
    if (context?.saveState) {
      context.saveState.connect((sender, saveState) => {
        if (saveState === 'started' && settings.saveState) {
          this._saveState();
        }
      });
    }
    if (rendermime !== LabWidgetManager.globalRendermime) {
      // Instruct the renderer to wait for the widgetManager.
      KernelWidgetManager.configureRendermime(
        rendermime,
        undefined,
        'Waiting for kernel'
      );
    }
    if (this.kernel) {
      this.updateWidgetManager();
    }
  }

  /**
   * Save the widget state to the context model.
   */
  private _saveState(): void {
    if (!this.widgetManager) {
      return;
    }
    const state = this.widgetManager.get_state_sync({ drop_defaults: true });
    if (this._context.model.setMetadata) {
      this._context.model.setMetadata('widgets', {
        'application/vnd.jupyter.widget-state+json': state,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore JupyterLab 3 support
      this._context.model.metadata.set('widgets', {
        'application/vnd.jupyter.widget-state+json': state,
      });
    }
  }

  async updateWidgetManager() {
    if (this._widgetManager) {
      this._widgetManager.onUnhandledIOPubMessage.disconnect(
        this.onUnhandledIOPubMessage,
        this
      );
    }
    if (this.kernel) {
      await this.context.sessionContext.ready;
      this._widgetManager = new KernelWidgetManager(this.kernel, null);
      this._widgetManager.onUnhandledIOPubMessage.connect(
        this.onUnhandledIOPubMessage,
        this
      );
      if (!this._widgetManager.restoredStatus) {
        await new Promise((resolve) => {
          this._widgetManager?.restored.connect(resolve);
        });
        if (!this.restored) {
          this.restoreWidgets(this._context!.model);
        }
      }
      KernelWidgetManager.configureRendermime(
        this.rendermime,
        this._widgetManager,
        'Loading widget ...'
      );
      if (this._renderers) {
        for (const r of this._renderers) {
          r.manager = this._widgetManager;
        }
      }
    }
  }

  onUnhandledIOPubMessage(
    sender: LabWidgetManager,
    msg: KernelMessage.IIOPubMessage
  ) {
    if (WidgetManager.loggerRegistry) {
      const logger = WidgetManager.loggerRegistry.getLogger(this.context.path);
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
      // logger.rendermime = this.content.rendermime;
      logger.log({ type: 'output', data, level });
    }
  }

  _handleConnectionStatusChange(
    sender: any,
    status: Kernel.ConnectionStatus
  ): void {
    null;
  }

  _handleKernelChange(sender: any, kernel: any): void {
    this.updateWidgetManager();
    this.setDirty();
  }
  _handleStatusChange(sender: any, status: Kernel.Status): void {
    this.setDirty();
  }

  get widgetManager(): KernelWidgetManager | null {
    return this._widgetManager;
  }

  /**
   * A signal emitted when state is restored to the widget manager.
   *
   * #### Notes
   * This indicates that previously-unavailable widget models might be available now.
   */
  get restored(): ISignal<this, void> {
    return this._restored;
  }

  /**
   * Whether the state has been restored yet or not.
   */
  get restoredStatus(): boolean {
    return this._restoredStatus;
  }

  /**
   * Restore widgets from notebook and saved state.
   */
  async restoreWidgets(
    notebook: INotebookModel,
    { loadNotebook } = { loadNotebook: true }
  ): Promise<void> {
    try {
      if (loadNotebook) {
        await this._loadFromNotebook(notebook);
      }

      // If the restore worked above, then update our state.
      this._restoredStatus = true;
      this._restored.emit();
    } catch (err) {
      // Do nothing if the restore did not work.
    }
  }

  /**
   * Load widget state from notebook metadata
   */
  async _loadFromNotebook(notebook: INotebookModel): Promise<void> {
    if (!this.widgetManager) {
      return;
    }
    const widget_md = notebook.getMetadata
      ? (notebook.getMetadata('widgets') as any)
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore JupyterLab 3 support
        notebook.metadata.get('widgets');
    if (widget_md && widget_md[WIDGET_STATE_MIMETYPE]) {
      let state = widget_md[WIDGET_STATE_MIMETYPE];
      state = this.widgetManager.filterModelState(state);

      // Ensure the kernel has been restored.
      let timeoutID;
      const restored = this.widgetManager.restored;
      if (!this.widgetManager.restoredStatus) {
        await new Promise((resolve, reject) => {
          restored.connect(resolve);
          timeoutID = window.setTimeout(
            () => reject('Timeout waiting for '),
            4000
          );
        });
      }
      clearTimeout(timeoutID);
      // Restore any widgets from saved state that are not live
      await this.widgetManager.set_state(state);
    }
  }

  /**
   * Get whether the manager is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._context = null!;
    this._renderers = undefined;
    this._context = null!;
    this._rendermime = null!;
    this._settings = null!;
  }

  /**
   * Resolve a URL relative to the current notebook location.
   */
  async resolveUrl(url: string): Promise<string> {
    const partial = await this.context.urlResolver.resolveUrl(url);
    return this.context.urlResolver.getDownloadUrl(partial);
  }

  get context(): DocumentRegistry.IContext<INotebookModel> {
    return this._context;
  }

  get kernel(): Kernel.IKernelConnection | null {
    return this._context.sessionContext?.session?.kernel ?? null;
  }

  get rendermime(): IRenderMimeRegistry {
    return this._rendermime;
  }

  /**
   * Set the dirty state of the notebook model if applicable.
   *
   * TODO: perhaps should also set dirty when any model changes any data
   */
  setDirty(): void {
    if (this._settings.saveState) {
      this._context!.model.dirty = true;
    }
  }
  static loggerRegistry: ILoggerRegistry | null;
  protected _restored = new Signal<this, void>(this);
  protected _restoredStatus = false;
  private _isDisposed = false;
  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _rendermime: IRenderMimeRegistry;
  private _settings: WidgetManager.Settings;
  private _widgetManager: KernelWidgetManager | null;
  private _renderers: IterableIterator<WidgetRenderer> | undefined;
}

export namespace WidgetManager {
  export type Settings = {
    saveState: boolean;
  };
}

/**
 * Get the widgetManager that owns the model.
 */
export function getWidgetManager(model_id: string): KernelWidgetManager | null {
  for (const wManager of Private.kernelWidgetManagers.values()) {
    if (wManager.has_model(model_id)) {
      return wManager;
    }
  }
  return null;
}

/**
 * A namespace for private data
 */
namespace Private {
  export const kernelWidgetManagers = new Map<string, KernelWidgetManager>();
}
