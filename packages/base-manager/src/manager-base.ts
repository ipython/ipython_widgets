// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as services from '@jupyterlab/services';
import * as widgets from '@jupyter-widgets/base';

import {
  JSONObject,
  PartialJSONObject,
  PromiseDelegate,
} from '@lumino/coreutils';

import {
  DOMWidgetView,
  WidgetModel,
  WidgetView,
  DOMWidgetModel,
  IClassicComm,
  ICallbacks,
  put_buffers,
  remove_buffers,
  resolvePromisesDict,
  ISerializedState,
  reject,
  uuid,
  PROTOCOL_VERSION,
  IWidgetManager,
  IModelOptions,
  IWidgetOptions,
  IBackboneModelOptions,
} from '@jupyter-widgets/base';

import { base64ToBuffer, bufferToBase64, hexToBuffer } from './utils';
import { removeMath, replaceMath } from './latex';
import sanitize from 'sanitize-html';

const PROTOCOL_MAJOR_VERSION = PROTOCOL_VERSION.split('.', 1)[0];

/**
 * The control comm target name.
 */
export const CONTROL_COMM_TARGET = 'jupyter.widget.control';

/**
 * The supported version for the control comm channel.
 */
export const CONTROL_COMM_PROTOCOL_VERSION = '1.0.0';

/**
 * Time (in ms) after which we consider the control comm target not responding.
 */
export const CONTROL_COMM_TIMEOUT = 4000;

/**
 * Sanitize HTML-formatted descriptions.
 */
function default_inline_sanitize(s: string): string {
  const allowedTags = [
    'a',
    'abbr',
    'b',
    'code',
    'em',
    'i',
    'img',
    'li',
    'ol',
    'span',
    'strong',
    'ul',
  ];
  const allowedAttributes = {
    '*': ['aria-*', 'class', 'style', 'title'],
    a: ['href'],
    img: ['src'],
    style: ['media', 'type'],
  };
  return sanitize(s, {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes,
  });
}

export interface IState extends PartialJSONObject {
  buffers?: IBase64Buffers[];
  model_name: string;
  model_module: string;
  model_module_version: string;
  state: JSONObject;
}

export interface IManagerStateMap extends PartialJSONObject {
  [key: string]: IState;
}

/**
 * Widget manager state.
 *
 * The JSON schema for this is in @jupyter-widgets/schema/v2/state.schema.json.
 */
export interface IManagerState extends PartialJSONObject {
  version_major: number;
  version_minor: number;
  state: IManagerStateMap;
}

export interface IBase64Buffers extends PartialJSONObject {
  data: string;
  path: (string | number)[];
  encoding: 'base64';
}

/**
 * Make all properties in K (of T) required
 */
export type RequiredSome<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Manager abstract base class
 */
export abstract class ManagerBase implements IWidgetManager {
  /**
   * Modifies view options. Generally overloaded in custom widget manager
   * implementations.
   */
  setViewOptions(options: any = {}): any {
    return options;
  }

  /**
   * Creates a promise for a view of a given model
   *
   * #### Notes
   * The implementation must trigger the Lumino 'after-attach' and 'after-show' events when appropriate, which in turn will trigger the view's 'displayed' events.
   *
   * Make sure the view creation is not out of order with
   * any state updates.
   *
   */
  create_view<VT extends DOMWidgetView = DOMWidgetView>(
    model: DOMWidgetModel,
    options?: any
  ): Promise<VT>;
  create_view<VT extends WidgetView = WidgetView>(
    model: WidgetModel,
    options?: any
  ): Promise<VT>;
  create_view<VT extends WidgetView = WidgetView>(
    model: WidgetModel,
    options = {}
  ): Promise<VT> {
    const id = uuid();
    const viewPromise = (model.state_change = model.state_change.then(
      async () => {
        const _view_name = model.get('_view_name');
        const _view_module = model.get('_view_module');
        try {
          const ViewType = (await this.loadViewClass(
            _view_name,
            _view_module,
            model.get('_view_module_version')
          )) as typeof WidgetView;
          const view = new ViewType({
            model: model,
            options: this.setViewOptions(options),
          });
          view.listenTo(model, 'destroy', view.remove);
          await view.render();

          // This presumes the view is added to the list of model views below
          view.once('remove', () => {
            if (model.views) {
              delete model.views[id];
            }
          });

          return view;
        } catch (e) {
          console.error(
            `Could not create a view for model id ${model.model_id}`
          );
          const msg = `Failed to create view for '${_view_name}' from module '${_view_module}' with model '${model.name}' from module '${model.module}'`;
          const ModelCls = widgets.createErrorWidgetModel(e, msg);
          const errorModel = new ModelCls();
          const view = new widgets.ErrorWidgetView({
            model: errorModel,
            options: this.setViewOptions(options),
          });
          await view.render();

          return view;
        }
      }
    ));
    if (model.views) {
      model.views[id] = viewPromise;
    }
    return viewPromise;
  }

  /**
   * callback handlers specific to a view
   */
  callbacks(view?: WidgetView): ICallbacks {
    return {};
  }

  /**
   * Get a promise for a model by model id.
   *
   * #### Notes
   * If the model is not found, the returned Promise object is rejected.
   *
   * If you would like to synchronously test if a model exists, use .has_model().
   */
  async get_model(model_id: string): Promise<WidgetModel> {
    const modelPromise = this._models[model_id];
    if (modelPromise === undefined) {
      throw new Error('widget model not found');
    }
    return modelPromise;
  }

  /**
   * Returns true if the given model is registered, otherwise false.
   *
   * #### Notes
   * This is a synchronous way to check if a model is registered.
   */
  has_model(model_id: string): boolean {
    return this._models[model_id] !== undefined;
  }

  /**
   * Handle when a comm is opened.
   */
  handle_comm_open(
    comm: IClassicComm,
    msg: services.KernelMessage.ICommOpenMsg
  ): Promise<WidgetModel> {
    const protocolVersion = ((msg.metadata || {})['version'] as string) || '';
    if (protocolVersion.split('.', 1)[0] !== PROTOCOL_MAJOR_VERSION) {
      const error = `Wrong widget protocol version: received protocol version '${protocolVersion}', but was expecting major version '${PROTOCOL_MAJOR_VERSION}'`;
      console.error(error);
      return Promise.reject(error);
    }
    const data = msg.content.data as unknown as ISerializedState;
    const buffer_paths = data.buffer_paths || [];
    const buffers = msg.buffers || [];
    put_buffers(data.state, buffer_paths, buffers);
    return this.new_model(
      {
        model_name: data.state['_model_name'] as string,
        model_module: data.state['_model_module'] as string,
        model_module_version: data.state['_model_module_version'] as string,
        comm: comm,
      },
      data.state
    ).catch(reject('Could not create a model.', true));
  }

  /**
   * Create a comm and new widget model.
   * @param  options - same options as new_model but comm is not
   *                          required and additional options are available.
   * @param  serialized_state - serialized model attributes.
   */
  new_widget(
    options: IWidgetOptions,
    serialized_state: JSONObject = {}
  ): Promise<WidgetModel> {
    let commPromise;
    // we check to make sure the view information is provided, to help catch
    // backwards incompatibility errors.
    if (
      options.view_name === undefined ||
      options.view_module === undefined ||
      options.view_module_version === undefined
    ) {
      return Promise.reject(
        'new_widget(...) must be given view information in the options.'
      );
    }
    // If no comm is provided, a new comm is opened for the jupyter.widget
    // target.
    if (options.comm) {
      commPromise = Promise.resolve(options.comm);
    } else {
      commPromise = this._create_comm(
        this.comm_target_name,
        options.model_id,
        {
          state: {
            _model_module: options.model_module,
            _model_module_version: options.model_module_version,
            _model_name: options.model_name,
            _view_module: options.view_module,
            _view_module_version: options.view_module_version,
            _view_name: options.view_name,
          },
        },
        { version: PROTOCOL_VERSION }
      );
    }
    // The options dictionary is copied since data will be added to it.
    const options_clone = { ...options };
    // Create the model. In the case where the comm promise is rejected a
    // comm-less model is still created with the required model id.
    return commPromise.then(
      (comm) => {
        // Comm Promise Resolved.
        options_clone.comm = comm;
        const widget_model = this.new_model(options_clone, serialized_state);
        return widget_model.then((model) => {
          model.sync('create', model);
          return model;
        });
      },
      () => {
        // Comm Promise Rejected.
        if (!options_clone.model_id) {
          options_clone.model_id = uuid();
        }
        return this.new_model(options_clone, serialized_state);
      }
    );
  }

  register_model(model_id: string, modelPromise: Promise<WidgetModel>): void {
    this._models[model_id] = modelPromise;
    modelPromise.then((model) => {
      model.once('comm:close', () => {
        delete this._models[model_id];
      });
    });
  }

  /**
   * Create and return a promise for a new widget model
   *
   * @param options - the options for creating the model.
   * @param serialized_state - attribute values for the model.
   *
   * @example
   * widget_manager.new_model({
   *      model_name: 'IntSlider',
   *      model_module: '@jupyter-widgets/controls',
   *      model_module_version: '1.0.0',
   *      model_id: 'u-u-i-d'
   * }).then((model) => { console.log('Create success!', model); },
   *  (err) => {console.error(err)});
   *
   */
  async new_model(
    options: IModelOptions,
    serialized_state: any = {}
  ): Promise<WidgetModel> {
    const model_id = options.model_id ?? options.comm?.comm_id;
    if (!model_id) {
      throw new Error(
        'Neither comm nor model_id provided in options object. At least one must exist.'
      );
    }
    options.model_id = model_id;
    const modelPromise = this._make_model(
      options as RequiredSome<IModelOptions, 'model_id'>,
      serialized_state
    );
    // this call needs to happen before the first `await`, see note in `set_state`:
    this.register_model(model_id, modelPromise);
    return await modelPromise;
  }

  /**
   * Fetch all widgets states from the kernel using the control comm channel
   * If this fails (control comm handler not implemented kernel side),
   * it will fall back to `_loadFromKernelModels`.
   *
   * This is a utility function that can be used in subclasses.
   */
  protected async _loadFromKernel(): Promise<void> {
    // Try fetching all widget states through the control comm
    let data: any;
    let buffers: any;
    let timeoutID: number | undefined;
    const comm_ids = await this._get_comm_info();
    if (Object.keys(comm_ids).length === 0) {
      // There is nothing to load, either a new kernel or no widgets in the kernel.
      return Promise.resolve();
    }
    try {
      const initComm = await this._create_comm(
        CONTROL_COMM_TARGET,
        uuid(),
        {},
        { version: CONTROL_COMM_PROTOCOL_VERSION }
      );
      await new Promise((resolve, reject) => {
        let succeeded = false;
        initComm.on_msg((msg: any) => {
          data = msg['content']['data'];

          if (data.method !== 'update_states') {
            console.warn(`
              Unknown ${data.method} message on the Control channel
            `);
            return;
          }

          buffers = (msg.buffers || []).map((b: any) => {
            if (b instanceof DataView) {
              return b;
            } else {
              return new DataView(b instanceof ArrayBuffer ? b : b.buffer);
            }
          });
          succeeded = true;
          clearTimeout(timeoutID);
          resolve(null);
        });

        initComm.on_close(() => {
          if (!succeeded) reject('Control comm was closed too early');
        });

        // Send a states request msg
        initComm.send({ method: 'request_states' }, {});

        // Reject if we didn't get a response in time
        timeoutID = window.setTimeout(
          () => reject('Control comm did not respond in time'),
          CONTROL_COMM_TIMEOUT
        );
      });
      initComm.close();
    } catch (error) {
      console.warn(
        'Failed to fetch ipywidgets through the "jupyter.widget.control" comm channel, fallback to fetching individual model state. Reason:',
        error
      );
      clearTimeout(timeoutID);
      // Fall back to the old implementation for old ipywidgets backend versions (ipywidgets<=7.6)
      return this._loadFromKernelModels();
    }

    const states: any = data.states;
    const bufferPaths: any = {};
    const bufferGroups: any = {};

    // Group buffers and buffer paths by widget id
    for (let i = 0; i < data.buffer_paths.length; i++) {
      const [widget_id, ...path] = data.buffer_paths[i];
      const b = buffers[i];
      if (!bufferPaths[widget_id]) {
        bufferPaths[widget_id] = [];
        bufferGroups[widget_id] = [];
      }
      bufferPaths[widget_id].push(path);
      bufferGroups[widget_id].push(b);
    }

    // Create comms for all new widgets.
    const widget_comms = await Promise.all(
      Object.keys(states).map(async (widget_id) => {
        const comm = this.has_model(widget_id)
          ? undefined
          : await this._create_comm('jupyter.widget', widget_id);
        return { widget_id, comm };
      })
    );

    await Promise.all(
      widget_comms.map(async ({ widget_id, comm }) => {
        const state = states[widget_id];
        // Put binary buffers
        if (widget_id in bufferPaths) {
          put_buffers(state, bufferPaths[widget_id], bufferGroups[widget_id]);
        }
        try {
          if (comm) {
            // This must be the first await in the code path that
            // reaches here so that registering the model promise in
            // new_model can register the widget promise before it may
            // be required by other widgets.
            await this.new_model(
              {
                model_name: state.model_name,
                model_module: state.model_module,
                model_module_version: state.model_module_version,
                model_id: widget_id,
                comm: comm,
              },
              state.state
            );
          } else {
            // model already exists here
            const model = await this.get_model(widget_id);
            const deserializedState = await (
              model.constructor as typeof WidgetModel
            )._deserialize_state(state.state, this);
            model!.set_state(deserializedState);
          }
        } catch (error) {
          // Failed to create a widget model, we continue creating other models so that
          // other widgets can render
          console.error(error);
        }
      })
    );
  }

  /**
   * Old implementation of fetching widget models one by one using
   * the request_state message on each comm.
   *
   * This is a utility function that can be used in subclasses.
   */
  protected async _loadFromKernelModels(): Promise<void> {
    const comm_ids = await this._get_comm_info();

    // For each comm id that we do not know about, create the comm, and request the state.
    const widgets_info = await Promise.all(
      Object.keys(comm_ids).map(async (comm_id) => {
        if (this.has_model(comm_id)) {
          return;
        }

        const comm = await this._create_comm(this.comm_target_name, comm_id);

        let msg_id = '';
        const info = new PromiseDelegate<Private.ICommUpdateData>();
        comm.on_msg((msg: services.KernelMessage.ICommMsgMsg) => {
          if (
            (msg.parent_header as any).msg_id === msg_id &&
            msg.header.msg_type === 'comm_msg' &&
            msg.content.data.method === 'update'
          ) {
            const data = msg.content.data as any;
            const buffer_paths = data.buffer_paths || [];
            const buffers = msg.buffers || [];
            put_buffers(data.state, buffer_paths, buffers);
            info.resolve({ comm, msg });
          }
        });
        msg_id = comm.send(
          {
            method: 'request_state',
          },
          this.callbacks(undefined)
        );

        return info.promise;
      })
    );

    // We put in a synchronization barrier here so that we don't have to
    // topologically sort the restored widgets. `new_model` synchronously
    // registers the widget ids before reconstructing their state
    // asynchronously, so promises to every widget reference should be available
    // by the time they are used.
    await Promise.all(
      widgets_info.map(async (widget_info) => {
        if (!widget_info) {
          return;
        }
        const content = widget_info.msg.content as any;
        await this.new_model(
          {
            model_name: content.data.state._model_name,
            model_module: content.data.state._model_module,
            model_module_version: content.data.state._model_module_version,
            comm: widget_info.comm,
          },
          content.data.state
        );
      })
    );
  }

  async _make_model(
    options: RequiredSome<IModelOptions, 'model_id'>,
    serialized_state: any = {}
  ): Promise<WidgetModel> {
    const model_id = options.model_id;
    const model_promise = this.loadModelClass(
      options.model_name,
      options.model_module,
      options.model_module_version
    );
    let ModelType: typeof WidgetModel;

    const makeErrorModel = (error: any, msg: string) => {
      const Cls = widgets.createErrorWidgetModel(error, msg);
      const widget_model = new Cls();
      return widget_model;
    };

    try {
      ModelType = await model_promise;
    } catch (error) {
      const msg = 'Could not instantiate widget';
      console.error(msg);
      return makeErrorModel(error, msg);
    }

    if (!ModelType) {
      const msg = 'Could not instantiate widget';
      console.error(msg);
      const error = new Error(
        `Cannot find model module ${options.model_module}@${options.model_module_version}, ${options.model_name}`
      );
      return makeErrorModel(error, msg);
    }
    let widget_model: WidgetModel;
    try {
      const attributes = await ModelType._deserialize_state(
        serialized_state,
        this
      );
      const modelOptions: IBackboneModelOptions = {
        widget_manager: this,
        model_id: model_id,
        comm: options.comm,
      };

      widget_model = new ModelType(attributes, modelOptions);
    } catch (error) {
      console.error(error);
      const msg = `Model class '${options.model_name}' from module '${options.model_module}' is loaded but can not be instantiated`;
      widget_model = makeErrorModel(error, msg);
    }
    widget_model.name = options.model_name;
    widget_model.module = options.model_module;
    return widget_model;
  }

  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  clear_state(): Promise<void> {
    return resolvePromisesDict(this._models).then((models) => {
      Object.keys(models).forEach((id) => models[id].close());
      this._models = Object.create(null);
    });
  }

  /**
   * Asynchronously get the state of the widget manager.
   *
   * This includes all of the widget models, and follows the format given in
   * the @jupyter-widgets/schema package.
   *
   * @param options - The options for what state to return.
   * @returns Promise for a state dictionary
   */
  get_state(options: IStateOptions = {}): Promise<IManagerState> {
    const modelPromises = Object.keys(this._models).map(
      (id) => this._models[id]
    );
    return Promise.all(modelPromises).then((models) => {
      return serialize_state(models, options);
    });
  }

  /**
   * Set the widget manager state.
   *
   * @param state - a Javascript object conforming to the application/vnd.jupyter.widget-state+json spec.
   *
   * Reconstructs all of the widget models in the state, merges that with the
   * current manager state, and then attempts to redisplay the widgets in the
   * state.
   */
  set_state(state: IManagerState): Promise<WidgetModel[]> {
    // Check to make sure that it's the same version we are parsing.
    if (!(state.version_major && state.version_major <= 2)) {
      throw 'Unsupported widget state format';
    }
    const models = state.state as any;
    // Recreate all the widget models for the given widget manager state.
    const all_models = this._get_comm_info().then((live_comms) => {
      /* Note: It is currently safe to just loop over the models in any order,
               given that the following holds (does at the time of writing):
               1: any call to `new_model` with state registers the model promise (e.g. with `register_model`)
                  synchronously (before it's first `await` statement).
               2: any calls to a model constructor or the `set_state` method on a model,
                  happens asynchronously (in a `then` clause, or after an `await` statement).

              Without these assumptions, one risks trying to set model state with a reference
              to another model that doesn't exist yet!
            */
      return Promise.all(
        Object.keys(models).map((model_id) => {
          // First put back the binary buffers
          const decode: { [s: string]: (s: string) => ArrayBuffer } = {
            base64: base64ToBuffer,
            hex: hexToBuffer,
          };
          const model = models[model_id];
          const modelState = model.state;
          if (model.buffers) {
            const bufferPaths = model.buffers.map((b: any) => b.path);
            // put_buffers expects buffers to be DataViews
            const buffers = model.buffers.map(
              (b: any) => new DataView(decode[b.encoding](b.data))
            );
            put_buffers(model.state, bufferPaths, buffers);
          }

          // If the model has already been created, set its state and then
          // return it.
          if (this.has_model(model_id)) {
            return this.get_model(model_id)!.then((model) => {
              // deserialize state
              return (model.constructor as typeof WidgetModel)
                ._deserialize_state(modelState || {}, this)
                .then((attributes) => {
                  model.set_state(attributes); // case 2
                  return model;
                });
            });
          }

          const modelCreate: IModelOptions = {
            model_id: model_id,
            model_name: model.model_name,
            model_module: model.model_module,
            model_module_version: model.model_module_version,
          };
          if (Object.prototype.hasOwnProperty.call(live_comms, 'model_id')) {
            // live comm
            // This connects to an existing comm if it exists, and
            // should *not* send a comm open message.
            return this._create_comm(this.comm_target_name, model_id).then(
              (comm) => {
                modelCreate.comm = comm;
                return this.new_model(modelCreate); // No state, so safe wrt. case 1
              }
            );
          } else {
            return this.new_model(modelCreate, modelState); // case 1
          }
        })
      );
    });

    return all_models;
  }

  /**
   * Disconnect the widget manager from the kernel, setting each model's comm
   * as dead.
   */
  disconnect(): void {
    Object.keys(this._models).forEach((i) => {
      this._models[i].then((model) => {
        model.comm_live = false;
      });
    });
  }

  /**
   * Resolve a URL relative to the current notebook location.
   *
   * The default implementation just returns the original url.
   */
  resolveUrl(url: string): Promise<string> {
    return Promise.resolve(url);
  }

  inline_sanitize(source: string): string {
    const parts = removeMath(source);
    // Sanitize tags for inline output.
    const sanitized = default_inline_sanitize(parts['text']);
    return replaceMath(sanitized, parts['math']);
  }

  /**
   * The comm target name to register
   */
  readonly comm_target_name = 'jupyter.widget';

  /**
   * Load a class and return a promise to the loaded object.
   */
  protected abstract loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel | typeof WidgetView>;

  protected async loadModelClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetModel> {
    try {
      const promise: Promise<typeof WidgetModel> = this.loadClass(
        className,
        moduleName,
        moduleVersion
      ) as Promise<typeof WidgetModel>;
      await promise;
      return promise;
    } catch (error) {
      console.error(error);
      const msg = `Failed to load model class '${className}' from module '${moduleName}'`;
      return widgets.createErrorWidgetModel(error, msg);
    }
  }

  protected async loadViewClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof WidgetView> {
    try {
      const promise: Promise<typeof WidgetView> = this.loadClass(
        className,
        moduleName,
        moduleVersion
      ) as Promise<typeof WidgetView>;
      await promise;
      return promise;
    } catch (error) {
      console.error(error);
      const msg = `Failed to load view class '${className}' from module '${moduleName}'`;
      return widgets.createErrorWidgetView(error, msg);
    }
  }

  /**
   * Create a comm which can be used for communication for a widget.
   *
   * If the data/metadata is passed in, open the comm before returning (i.e.,
   * send the comm_open message). If the data and metadata is undefined, we
   * want to reconstruct a comm that already exists in the kernel, so do not
   * open the comm by sending the comm_open message.
   *
   * @param comm_target_name Comm target name
   * @param model_id The comm id
   * @param data The initial data for the comm
   * @param metadata The metadata in the open message
   */
  protected abstract _create_comm(
    comm_target_name: string,
    model_id?: string,
    data?: JSONObject,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[]
  ): Promise<IClassicComm>;
  protected abstract _get_comm_info(): Promise<{}>;

  /**
   * Filter serialized widget state to remove any ID's already present in manager.
   *
   * @param {*} state Serialized state to filter
   *
   * @returns {*} A copy of the state, with its 'state' attribute filtered
   */
  protected filterExistingModelState(serialized_state: any): any {
    let models = serialized_state.state;
    models = Object.keys(models)
      .filter((model_id) => !this.has_model(model_id))
      .reduce<IManagerStateMap>((res, model_id) => {
        res[model_id] = models[model_id];
        return res;
      }, {});
    return { ...serialized_state, state: models };
  }

  /**
   * Dictionary of model ids and model instance promises
   */
  private _models: { [key: string]: Promise<WidgetModel> } =
    Object.create(null);
}

export interface IStateOptions {
  /**
   * Drop model attributes that are equal to their default value.
   *
   * @default false
   */
  drop_defaults?: boolean;
}

/**
 * Serialize an array of widget models
 *
 * #### Notes
 * The return value follows the format given in the
 * @jupyter-widgets/schema package.
 */
export function serialize_state(
  models: WidgetModel[],
  options: IStateOptions = {}
): IManagerState {
  const state: IManagerStateMap = {};
  models.forEach((model) => {
    const model_id = model.model_id;
    const split = remove_buffers(
      model.serialize(model.get_state(options.drop_defaults))
    );
    const buffers: IBase64Buffers[] = split.buffers.map((buffer, index) => {
      return {
        data: bufferToBase64(buffer),
        path: split.buffer_paths[index],
        encoding: 'base64',
      };
    });
    state[model_id] = {
      model_name: model.name,
      model_module: model.module,
      model_module_version: model.get('_model_module_version'),
      state: split.state,
    };
    // To save space, only include the buffers key if we have buffers
    if (buffers.length > 0) {
      state[model_id].buffers = buffers;
    }
  });
  return { version_major: 2, version_minor: 0, state: state };
}

namespace Private {
  /**
   * Data promised when a comm info request resolves.
   */
  export interface ICommUpdateData {
    comm: IClassicComm;
    msg: services.KernelMessage.ICommMsgMsg;
  }
}
