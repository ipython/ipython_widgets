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

import { AttachedProperty } from '@lumino/properties';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { INotebookModel, NotebookModel } from '@jupyterlab/notebook';

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
abstract class LabWidgetManager extends ManagerBase implements IDisposable {
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
    this._restoredStatus = false;
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

  static rendermime: IRenderMimeRegistry;

  protected _restored = new Signal<this, void>(this);
  protected _restoredStatus = false;

  private _isDisposed = false;
  private _registry: SemVerCache<ExportData> = new SemVerCache<ExportData>();

  private _commRegistration: IDisposable;

  private _modelsSync = new Map<string, WidgetModel>();
  private _onUnhandledIOPubMessage = new Signal<
    this,
    KernelMessage.IIOPubMessage
  >(this);
  static WIDGET_REGISTRY = new ObservableList<base.IWidgetRegistryData>();
}

/**
 * KernelWidgetManager is singleton widget manager per kernel.id.
 * This class should not be created directly or subclassed, instead use
 * the class method `KernelWidgetManager.getManager(kernel)`.
 */
export class KernelWidgetManager extends LabWidgetManager {
  constructor(kernel: Kernel.IKernelConnection) {
    if (Private.managers.has(kernel.id)) {
      throw new Error('A manager already exists!');
    }
    if (!kernel.handleComms) {
      throw new Error('Kernel does not have handleComms enabled');
    }
    super();
    Private.managers.set(kernel.id, this);
    this.loadCustomWidgetDefinitions();
    LabWidgetManager.WIDGET_REGISTRY.changed.connect(() =>
      this.loadCustomWidgetDefinitions()
    );
    this._updateKernel(kernel);
  }

  private _updateKernel(
    this: KernelWidgetManager,
    kernel: Kernel.IKernelConnection
  ) {
    if (!kernel.handleComms || this._kernel === kernel) {
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
      this._kernel.disposed.disconnect(this._onKernelDisposed, this);
    }
    this._kernel = kernel;
    kernel.statusChanged.connect(this._handleKernelStatusChange, this);
    kernel.connectionStatusChanged.connect(
      this._handleKernelConnectionStatusChange,
      this
    );
    kernel.disposed.connect(this._onKernelDisposed, this);
    this.restoreWidgets();
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
   * The default will search for a manager once prior to waiting for a manager.
   * @returns
   */
  static configureRendermime(
    rendermime?: IRenderMimeRegistry,
    manager?: KernelWidgetManager,
    pendingManagerMessage = ''
  ) {
    if (!rendermime || rendermime === LabWidgetManager.rendermime) {
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
        this.restoreWidgets();
        break;
      case 'disconnected':
        this.disconnect();
        break;
    }
  }

  /**
   * Find the KernelWidgetManager that owns the model.
   */
  static async findManager(
    model_id: string,
    delays = [100, 1000]
  ): Promise<KernelWidgetManager> {
    for (const sleepTime of delays) {
      for (const wManager of Private.managers.values()) {
        if (wManager.has_model(model_id)) {
          return wManager;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    }
    throw new Error(
      `Failed to locate the KernelWidgetManager for model_id='${model_id}'`
    );
  }

  /**
   * The correct way to get a KernelWidgetManager
   * @param kernel IKernelConnection
   * @returns
   */
  static async getManager(
    kernel: Kernel.IKernelConnection
  ): Promise<KernelWidgetManager> {
    let manager = Private.managers.get(kernel.id);
    if (!manager) {
      manager = new KernelWidgetManager(kernel);
    }
    if (kernel.handleComms) {
      manager._updateKernel(kernel);
      if (!manager.restoredStatus) {
        const restored = manager.restored;
        await new Promise((resolve) => restored.connect(resolve));
      }
    }
    return manager;
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

  async _onKernelDisposed() {
    const model = await KernelWidgetManager.kernels.findById(this.kernel?.id);
    if (model) {
      const kernel = KernelWidgetManager.kernels.connectTo({ model });
      this._updateKernel(kernel);
    }
  }

  /**
   * Restore widgets from kernel.
   */
  async restoreWidgets(): Promise<void> {
    if (this._kernelRestoreInProgress) {
      return;
    }
    this._restoredStatus = false;
    this._kernelRestoreInProgress = true;
    try {
      await this.clear_state();
      await this._loadFromKernel();
    } catch {
      /* empty */
    } finally {
      this._restoredStatus = true;
      this._kernelRestoreInProgress = false;
      this.triggerRestored();
    }
  }

  triggerRestored() {
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
    Private.managers.delete(this.kernel.id);
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
  static kernels: Kernel.IManager;
  private _kernel: Kernel.IKernelConnection;
  private _kernelRestoreInProgress = false;
}

/**
 * A single 'WidgetManager' per context.
 * It monitors the kernel of the context swapping the kernel manager when the
 * kernel is changed.
 * A better name would be `WidgetManagerChanger'. TODO: change name and context.
 */
export class WidgetManager extends Backbone.Model implements IDisposable {
  constructor(
    context: DocumentRegistry.Context,
    rendermime: IRenderMimeRegistry,
    settings?: WidgetManager.Settings
  ) {
    const instance = Private.widgetManagerProperty.get(context);
    if (instance) {
      WidgetManager._rendermimeSetFactory(rendermime, instance);
      return instance;
    }
    super();
    Private.widgetManagerProperty.set(context, this);
    this._context = context;
    this._settings = settings;
    this._renderers = new Set<WidgetRenderer>();
    WidgetManager._rendermimeSetFactory(rendermime, this);

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
        if (saveState === 'started' && settings?.saveState) {
          this._saveState();
        }
      });
    }
    this.updateWidgetManager();
  }

  /**
   * Save the widget state to the context model.
   */
  private _saveState(): void {
    if (!this.widgetManager) {
      return;
    }
    const state = this.widgetManager.get_state_sync({ drop_defaults: true });
    const model = this._context.model;
    if (model instanceof NotebookModel) {
      model.setMetadata('widgets', {
        'application/vnd.jupyter.widget-state+json': state,
      });
    }
  }

  static _rendermimeSetFactory(
    rendermime: IRenderMimeRegistry,
    manager: WidgetManager
  ) {
    if (rendermime === LabWidgetManager.rendermime) {
      return;
    }
    rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
    rendermime.addFactory(
      {
        safe: false,
        mimeTypes: [WIDGET_VIEW_MIMETYPE],
        createRenderer: manager._newWidgetRenderer.bind(manager),
      },
      -10
    );
  }

  async updateWidgetManager() {
    let wManager: KernelWidgetManager | undefined;
    await this.context.sessionContext.ready;
    if (this.kernel) {
      wManager = await KernelWidgetManager.getManager(this.kernel);
    }
    if (wManager === this._widgetManager) {
      return;
    }
    if (this._widgetManager) {
      this._widgetManager.onUnhandledIOPubMessage.disconnect(
        this.onUnhandledIOPubMessage,
        this
      );
    }
    this._widgetManager = wManager;
    if (!wManager) {
      return;
    }
    wManager.onUnhandledIOPubMessage.connect(
      this.onUnhandledIOPubMessage,
      this
    );
    if (!wManager.restored) {
      await new Promise((resolve) => {
        this._widgetManager?.restored.connect(resolve);
      });
    }
    this._renderers.forEach(
      (renderer: WidgetRenderer) => (renderer.manager = wManager)
    );
    if (await this._restoreWidgets(this._context!.model)) {
      wManager.triggerRestored();
    }
  }

  _newWidgetRenderer(options: IRenderMime.IRendererOptions) {
    const renderer = new WidgetRenderer(
      options,
      this.widgetManager,
      this.widgetManager ? 'Loading widget ...' : 'No kernel'
    );
    this._renderers.add(renderer);
    renderer.disposed.connect((renderer_: WidgetRenderer) =>
      this._renderers.delete(renderer_)
    );
    return renderer;
  }

  onUnhandledIOPubMessage(
    sender: KernelWidgetManager,
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

  get widgetManager(): KernelWidgetManager | undefined {
    return this._widgetManager;
  }

  /**
   * Restore widgets from model.
   */
  async _restoreWidgets(
    model: DocumentRegistry.IModel
  ): Promise<number | undefined> {
    try {
      if (model instanceof NotebookModel) {
        return await this._loadFromNotebook(model);
      }
    } catch (err) {
      // Do nothing if the restore did not work.
    }
  }

  /**
   * Load widget state from notebook metadata
   */
  async _loadFromNotebook(notebook: INotebookModel): Promise<number> {
    if (this.widgetManager) {
      const widget_md = notebook.getMetadata
        ? (notebook.getMetadata('widgets') as any)
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore JupyterLab 3 support
          notebook.metadata.get('widgets');
      if (widget_md && widget_md[WIDGET_STATE_MIMETYPE]) {
        let state = widget_md[WIDGET_STATE_MIMETYPE];
        state = this.widgetManager.filterModelState(state);
        const n = Object.keys(state?.state || {}).length;
        if (n) {
          // Restore any widgets from saved state that are not live
          await this.widgetManager.set_state(state);
        }
        return n;
      }
    }
    return 0;
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
    // Remove the custom factory from the rendermime. TODO: de-register the rendermime factory for this object
    KernelWidgetManager.configureRendermime(this.rendermime);
    this._renderers.forEach((renderer) => renderer.dispose());
    this._renderers = null!;
    this._context = null!;
    this._context = null!;
    this._settings = null!;
  }

  /**
   * Resolve a URL relative to the current notebook location.
   */
  async resolveUrl(url: string): Promise<string> {
    const partial = await this.context.urlResolver.resolveUrl(url);
    return this.context.urlResolver.getDownloadUrl(partial);
  }

  get context(): DocumentRegistry.Context {
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
    if (this._settings?.saveState && this._context?.model) {
      this._context.model.dirty = true;
    }
  }
  static loggerRegistry: ILoggerRegistry | null;
  private _isDisposed = false;
  private _context: DocumentRegistry.Context;
  private _rendermime: IRenderMimeRegistry;
  private _settings: WidgetManager.Settings | undefined;
  private _widgetManager: KernelWidgetManager | undefined;
  _renderers: Set<WidgetRenderer>;
}

export namespace WidgetManager {
  export type Settings = {
    saveState: boolean;
  };
}

/**
 * A namespace for private data
 */
namespace Private {
  export const managers = new Map<string, KernelWidgetManager>();

  export const widgetManagerProperty = new AttachedProperty<
    DocumentRegistry.Context,
    WidgetManager | undefined
  >({
    name: 'widgetManager',
    create: (owner: DocumentRegistry.Context): undefined => undefined,
  });
}
