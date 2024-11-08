import { DummyManager, MockComm } from './dummy-manager';

import { expect } from 'chai';

import { IBackboneModelOptions } from '../../lib/';
import * as widgets from '../../lib/';
const WidgetModel = widgets.WidgetModel;

import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('unpack_models', function () {
  beforeEach(async function () {
    this.manager = new DummyManager();
    this.widgetA = await this.manager.new_widget({
      model_name: 'WidgetModel',
      model_module: '@jupyter-widgets/base',
      model_module_version: '1.2.0',
      view_name: 'WidgetView',
      view_module: '@jupyter-widgets/base',
      view_module_version: '1.2.0',
      model_id: 'widgetA',
    });
    this.widgetB = await this.manager.new_widget({
      model_name: 'WidgetModel',
      model_module: '@jupyter-widgets/base',
      model_module_version: '1.2.0',
      view_name: 'WidgetView',
      view_module: '@jupyter-widgets/base',
      view_module_version: '1.2.0',
      model_id: 'widgetB',
    });
  });
  it('unpacks strings', async function () {
    const serialized = 'IPY_MODEL_widgetA';
    const deserialized = this.widgetA;
    const value = await widgets.unpack_models(serialized, this.manager);
    expect(value).to.deep.equal(deserialized);
  });
  it('recurses in arrays', async function () {
    const serialized = [
      'IPY_MODEL_widgetA',
      'IPY_MODEL_widgetB',
      'IPY_MODEL_widgetA',
    ];
    const deserialized = [this.widgetA, this.widgetB, this.widgetA];
    const value = await widgets.unpack_models(serialized, this.manager);
    expect(value).to.deep.equal(deserialized);
  });
  it('recurses in objects', async function () {
    const serialized = { a: 'IPY_MODEL_widgetA', b: 'IPY_MODEL_widgetB' };
    const deserialized = { a: this.widgetA, b: this.widgetB };
    const value = await widgets.unpack_models(serialized, this.manager);
    expect(value).to.deep.equal(deserialized);
  });
  it('recurses in nested objects', async function () {
    const serialized = {
      a: 'IPY_MODEL_widgetA',
      b: ['IPY_MODEL_widgetA', 'IPY_MODEL_widgetB', 'IPY_MODEL_widgetA'],
      c: { d: ['IPY_MODEL_widgetA'], e: 'IPY_MODEL_widgetB' },
    };
    const deserialized = {
      a: this.widgetA,
      b: [this.widgetA, this.widgetB, this.widgetA],
      c: { d: [this.widgetA], e: this.widgetB },
    };
    const value = await widgets.unpack_models(serialized, this.manager);
    expect(value).to.deep.equal(deserialized);
  });
});

describe('serialize/deserialize', function () {
  before(async function () {
    this.manager = new DummyManager();
    this.widgetChild = await this.manager.new_widget({
      model_name: 'WidgetModel',
      model_module: '@jupyter-widgets/base',
      model_module_version: '1.2.0',
      view_name: 'WidgetView',
      view_module: '@jupyter-widgets/base',
      view_module_version: '1.2.0',
      model_id: 'widgetChild',
    });

    this.widgetChild2 = await this.manager.new_widget({
      model_name: 'WidgetModel',
      model_module: '@jupyter-widgets/base',
      model_module_version: '1.2.0',
      view_name: 'WidgetView',
      view_module: '@jupyter-widgets/base',
      view_module_version: '1.2.0',
      model_id: 'widgetChild2',
    });

    this.widgetContainer = await this.manager.new_widget(
      {
        model_name: 'ContainerWidget',
        model_module: 'test-widgets',
        model_module_version: '1.2.0',
        view_name: 'ContainerWidgetView',
        view_module: 'test-widgets',
        view_module_version: '1.2.0',
        model_id: 'widgetContainer',
      },
      { children: [`IPY_MODEL_${this.widgetChild.model_id}`] }
    );
  });
  it('serializes', function () {
    const state = this.widgetContainer.get_state(false);
    const serializedState = this.widgetContainer.serialize(state);
    expect(serializedState).to.deep.equal({
      _model_module: 'test-widgets',
      _model_module_version: '1.0.0',
      _model_name: 'ContainerWidget',
      _view_count: null,
      _view_module: 'test-widgets',
      _view_module_version: '1.0.0',
      _view_name: 'ContainerWidgetView',
      children: ['IPY_MODEL_widgetChild'],
    });
  });
  it('deserializes', async function () {
    const serializedState = { children: ['IPY_MODEL_widgetChild2'] };
    const state = await (
      this.widgetContainer.constructor as typeof WidgetModel
    )._deserialize_state(serializedState, this.manager);
    await this.widgetContainer.set_state(state);
    expect(this.widgetContainer.get('children')).to.deep.equal([
      this.widgetChild2,
    ]);
  });
});

describe('WidgetModel', function () {
  before(async function () {
    this.setup = async function (): Promise<void> {
      this.manager = new DummyManager();
      this.comm = new MockComm();
      sinon.spy(this.comm, 'send');
      this.widget = new WidgetModel({}, {
        model_id: 'widget',
        widget_manager: this.manager,
        comm: this.comm,
      } as IBackboneModelOptions);
      // Create some dummy deserializers.  One returns synchronously, and the
      // other asynchronously using a promise.
      this.serializeToJSON = sinon.spy(() => {
        return 'serialized';
      });
      this.widget.constructor.serializers = {
        times3: {
          deserialize: (value: number, manager: any): number => {
            return value * 3.0;
          },
        },
        halve: {
          deserialize: (value: number, manager: any): Promise<number> => {
            return Promise.resolve(value / 2.0);
          },
        },
        spy: {
          deserialize: sinon.spy((value: any, manager: any) => {
            return 'deserialized';
          }),
          serialize: sinon.spy((value: any, widget: any) => {
            return {
              toJSON: this.serializeToJSON,
            };
          }),
        },
      };
      sinon.reset();
    };
    await this.setup();
    sinon.spy(this.widget.constructor, '_deserialize_state');
  });

  describe('constructor', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('can take initial state', function () {
      const widget = new WidgetModel({ a: 1, b: 'b state' }, {
        model_id: 'widget',
        widget_manager: this.manager,
      } as IBackboneModelOptions);
      expect(widget.attributes).to.deep.equal({
        ...widget.defaults(),
        a: 1,
        b: 'b state',
      });
    });

    it('sets the widget_manager, id, comm, properties', function () {
      const widgetNoComm = new WidgetModel({}, {
        model_id: 'noComm',
        widget_manager: this.manager,
      } as IBackboneModelOptions);
      expect(widgetNoComm.model_id).to.equal('noComm');
      expect(widgetNoComm.widget_manager).to.equal(this.manager);
      expect(widgetNoComm.comm).to.be.undefined;
      expect(widgetNoComm.comm_live).to.be.false;

      const comm = new MockComm();
      const widgetLive = new WidgetModel({}, {
        model_id: 'widgetLive',
        widget_manager: this.manager,
        comm: comm,
      } as IBackboneModelOptions);
      expect(widgetLive.model_id).to.equal('widgetLive');
      expect(widgetLive.widget_manager).to.equal(this.manager);
      expect(widgetLive.comm).to.equal(comm);
      expect(widgetLive.comm_live).to.be.true;
    });

    it('initializes state_change and views attributes', async function () {
      const widget = new WidgetModel({ a: 1, b: 'b state' }, {
        model_id: 'widget',
        widget_manager: this.manager,
      } as IBackboneModelOptions);
      const x = await widget.state_change;
      expect(x).to.be.undefined;
      expect(widget.views).to.deep.equal({});
    });
  });

  describe('send', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('sends custom messages with the right format', function () {
      const comm = new MockComm();
      const send = sinon.spy(comm, 'send');
      const widget = new WidgetModel({}, {
        model_id: 'widget',
        widget_manager: this.manager,
        comm: comm,
      } as IBackboneModelOptions);
      const data1 = { a: 1, b: 'state' };
      const data2 = { a: 2, b: 'state' };
      const callbacks = { iopub: {} };
      const buffers = [new Int8Array([1, 2, 3])];

      // send two messages to make sure the throttle does not affect sending.
      widget.send(data1, callbacks, buffers);
      widget.send(data2, callbacks, buffers);
      expect(send).to.be.calledTwice;
      expect(send.getCall(0)).to.be.calledWithExactly(
        { method: 'custom', content: data1 },
        callbacks,
        {},
        buffers
      );
      expect(send.getCall(1)).to.be.calledWithExactly(
        { method: 'custom', content: data2 },
        callbacks,
        {},
        buffers
      );
    });
  });

  describe('close', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('calls destroy', function () {
      const destroyed = sinon.spy();
      this.widget.on('destroy', destroyed);
      this.widget.close();
      expect(destroyed).to.be.calledOnce;
    });

    it('deletes the reference to the comm', function () {
      this.widget.close();
      expect(this.widget.comm).to.be.undefined;
    });

    it('removes views', function () {
      this.widget.close();
      expect(this.widget.views).to.be.undefined;
    });

    it('closes and deletes the comm', function () {
      const close = sinon.spy(this.comm, 'close');
      this.widget.close();
      expect(close).to.be.calledOnce;
      expect(this.widget.comm).to.be.undefined;
    });

    it('triggers a destroy event', function () {
      const destroyEventCallback = sinon.spy();
      this.widget.on('destroy', destroyEventCallback);
      this.widget.close();
      expect(destroyEventCallback).to.be.calledOnce;
    });

    it('can be called twice', function () {
      this.widget.close();
      this.widget.close();
    });
  });

  describe('_handle_comm_closed', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('closes model', function () {
      const closeSpy = sinon.spy(this.widget, 'close');
      this.widget._handle_comm_closed({});
      expect(closeSpy).to.be.calledOnce;
    });

    it('listens to the widget close event', function () {
      const closeSpy = sinon.spy(this.widget, 'close');
      this.widget.comm.close();
      expect(closeSpy).to.be.calledOnce;
    });

    it('triggers a comm:close model event', function () {
      const closeEventCallback = sinon.spy();
      this.widget.on('comm:close', closeEventCallback);
      this.widget._handle_comm_closed({});
      expect(closeEventCallback).to.be.calledOnce;
    });
  });

  describe('_handle_comm_msg', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('listens to widget messages', async function () {
      await this.widget.comm._process_msg({
        content: {
          data: {
            method: 'update',
            state: { a: 5 },
          },
        },
      });
      console.log(this.widget.get('a'));
      expect(this.widget.get('a')).to.equal(5);
    });

    it('handles update messages', async function () {
      const deserialize = this.widget.constructor._deserialize_state;

      const setState = sinon.spy(this.widget, 'set_state');
      const state_change = this.widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: { a: 5 },
          },
        },
      });
      expect(this.widget.state_change).to.equal(state_change);
      await state_change;
      expect(deserialize).to.be.calledOnce;
      expect(setState).to.be.calledOnce;
      expect(deserialize).to.be.calledBefore(setState);
      expect(this.widget.get('a')).to.equal(5);
    });

    it('updates handle various types of binary buffers', async function () {
      const buffer1 = new Uint8Array([1, 2, 3]);
      const buffer2 = new Float64Array([2.3, 6.4]);
      const buffer3 = new Int16Array([10, 20, 30]);
      await this.widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: { a: 5, c: ['start', null, {}] },
            buffer_paths: [['b'], ['c', 1], ['c', 2, 'd']],
          },
        },
        buffers: [buffer1, buffer2.buffer, new DataView(buffer3.buffer)],
      });
      expect(this.widget.get('a')).to.equal(5);
      expect(this.widget.get('b')).to.deep.equal(new DataView(buffer1.buffer));
      expect(this.widget.get('c')).to.deep.equal([
        'start',
        new DataView(buffer2.buffer),
        { d: new DataView(buffer3.buffer) },
      ]);
    });

    it('handles custom deserialization', async function () {
      await this.widget._handle_comm_msg({
        content: {
          data: {
            method: 'update',
            state: { halve: 10, times3: 4 },
          },
        },
      });
      expect(this.widget.get('halve')).to.equal(5);
      expect(this.widget.get('times3')).to.equal(12);
    });

    it('handles custom messages', function () {
      const customEventCallback = sinon.spy();
      this.widget.on('msg:custom', customEventCallback);
      this.widget._handle_comm_msg({
        content: {
          data: { method: 'custom' },
        },
      });
      expect(customEventCallback).to.be.calledOnce;
    });

    it('ignores echo_update messages when there is an expected echo_update', async function () {
      const send = sinon.spy(this.widget, 'send_sync_message');
      // Set a value, generating an update message, get the message id from the comm?
      this.widget.set('a', 'original value');
      this.widget.save_changes();

      // Get the msg id
      const msgId = send.returnValues[0];

      // Inject a echo_update message from another client
      await this.widget._handle_comm_msg({
        parent_header: {
          msg_id: 'other-client',
        },
        content: {
          data: {
            method: 'echo_update',
            state: { a: 'other client update 1' },
          },
        },
      });

      expect(this.widget.get('a')).to.equal('original value');

      // Process a kernel update message, which should set the value
      await this.widget._handle_comm_msg({
        parent_header: {
          msg_id: 'from-kernel',
        },
        content: {
          data: {
            method: 'update',
            state: { a: 'kernel update' },
          },
        },
      });

      expect(this.widget.get('a')).to.equal('kernel update');

      // Inject an echo_update message from us, resetting our value
      await this.widget._handle_comm_msg({
        parent_header: {
          msg_id: msgId,
        },
        content: {
          data: {
            method: 'echo_update',
            state: { a: 'original value' },
          },
        },
      });

      expect(this.widget.get('a')).to.equal('original value');

      // Inject another echo_update message from another client, which also updates us
      await this.widget._handle_comm_msg({
        parent_header: {
          msg_id: 'other-client-2',
        },
        content: {
          data: {
            method: 'echo_update',
            state: { a: 'other client update 2' },
          },
        },
      });

      expect(this.widget.get('a')).to.equal('other client update 2');
    });
  });

  describe('_deserialize_state', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('deserializes simple JSON state', async function () {
      const state = await this.widget.constructor._deserialize_state(
        { a: 10, b: [{ c: 'test1', d: ['test2'] }, 20] },
        this.manager
      );
      expect(state.a).to.equal(10);
      expect(state.b).to.deep.equal([{ c: 'test1', d: ['test2'] }, 20]);
    });

    it('respects custom serializers', async function () {
      const state = await this.widget.constructor._deserialize_state(
        { times3: 2.0, halve: 2.0, c: 2.0 },
        this.manager
      );
      expect(state.times3).to.equal(6.0);
      expect(state.halve).to.equal(1.0);
      expect(state.c).to.equal(2.0);
    });

    it('calls the deserializer with appropriate arguments', async function () {
      await this.widget.constructor._deserialize_state(
        { spy: 'value' },
        this.manager
      );
      const spy = this.widget.constructor.serializers.spy.deserialize;
      expect(spy).to.be.calledOnce;
      expect(spy).to.be.calledWithExactly('value', this.manager);
    });
  });

  describe('serialize', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('does simple serialization by copying values', function () {
      const b = { c: 'start' };
      const state = {
        a: 5,
        b: b,
      };
      const serialized_state = this.widget.serialize(state);
      // b state was copied
      expect(serialized_state.b).to.not.equal(b);
      expect(serialized_state).to.deep.equal({ a: 5, b: b });
    });

    it('serializes null values', function () {
      const state_with_null = {
        a: 5,
        b: null as any,
      };
      const serialized_state = this.widget.serialize(state_with_null);
      expect(serialized_state.b).to.equal(null);
    });

    it('calls custom serializers with appropriate arguments', function () {
      this.widget.serialize({ spy: 'value' });
      const spy = this.widget.constructor.serializers.spy.serialize;
      expect(spy).to.be.calledWithExactly('value', this.widget);
    });

    it('calls toJSON method if possible', function () {
      const serialized_state = this.widget.serialize({ spy: 'value' });
      const spy = this.serializeToJSON;
      expect(spy).to.be.calledOnce;
      expect(serialized_state).to.deep.equal({ spy: 'serialized' });
    });
  });

  describe('set_state', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('sets the state of the widget', function () {
      expect(this.widget.get('a')).to.be.undefined;
      expect(this.widget.get('b')).to.be.undefined;
      this.widget.set_state({ a: 2, b: 3 });
      expect(this.widget.get('a')).to.equal(2);
      expect(this.widget.get('b')).to.equal(3);
    });
  });

  describe('set', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('triggers change events', async function () {
      const changeA = sinon.spy(function changeA() {
        return;
      });
      const change = sinon.spy(function change() {
        return;
      });
      this.widget.on('change:a', changeA);
      this.widget.on('change', change);
      this.widget.set('a', 100);
      expect(changeA).to.be.calledOnce;
      expect(changeA).to.be.calledWith(this.widget, 100);
      expect(changeA).to.be.calledBefore(change);
      expect(change).to.be.calledWith(this.widget);
    });
    it('triggers change events after exception', async function () {
      const changeA = sinon.spy(function changeA() {
        return;
      });
      const changeB = sinon.spy(function changeB() {
        throw 'error';
      });
      const change = sinon.spy(function change() {
        return;
      });
      this.widget.on('change:a', changeA);
      this.widget.on('change:b', changeB);
      this.widget.on('change', change);
      // first we trigger a set that causes an exception
      try {
        this.widget.set('b', 42);
      } catch {
        // empty
      }
      expect(change).to.not.be.called;
      // from now on this test is similar to 'triggers change events'
      this.widget.set('a', 100);
      expect(changeA).to.be.calledOnce;
      expect(changeA).to.be.calledWith(this.widget, 100);
      expect(changeA).to.be.calledBefore(change);
      expect(change).to.be.calledWith(this.widget);
    });
    it('handles multiple values to set', function () {
      expect(this.widget.get('a')).to.be.undefined;
      expect(this.widget.get('b')).to.be.undefined;
      this.widget.set({ a: 2, b: 3 });
      expect(this.widget.get('a')).to.equal(2);
      expect(this.widget.get('b')).to.equal(3);
    });
  });

  describe('save_changes', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('remembers changes across multiple set calls', function () {
      sinon.spy(this.widget, 'save');
      expect(this.widget.get('a')).to.be.undefined;
      expect(this.widget.get('b')).to.be.undefined;
      this.widget.set('a', 2);
      this.widget.set('b', 5);
      this.widget.save_changes();
      expect(this.widget.save).to.be.calledWith({ a: 2, b: 5 });
    });

    it('will not sync changes done by set_state', function () {
      sinon.spy(this.widget, 'save');
      expect(this.widget.get('a')).to.be.undefined;
      expect(this.widget.get('b')).to.be.undefined;
      this.widget.on('change:a', () => {
        this.widget.set('b', 15);
      });
      this.widget.set_state({ a: 10 });
      expect(this.widget.get('a')).to.equal(10);
      expect(this.widget.get('b')).to.equal(15);
      this.widget.save_changes();
      expect(this.widget.save).to.be.calledWith({ b: 15 });
    });
  });

  describe('get_state', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('gets all of the state', function () {
      this.widget.set('a', 'get_state test');
      expect(this.widget.get_state()).to.deep.equal({
        _model_module: '@jupyter-widgets/base',
        _model_name: 'WidgetModel',
        _model_module_version: '2.0.0',
        _view_module: '@jupyter-widgets/base',
        _view_name: null,
        _view_module_version: '2.0.0',
        _view_count: null,
        a: 'get_state test',
      });
    });

    it('drop_defaults is respected', function () {
      this.widget.set('a', 'get_state test');
      expect(this.widget.get_state(true)).to.deep.equal({
        a: 'get_state test',
      });
    });
  });

  describe('callbacks', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('returns a blank object', function () {
      expect(this.widget.callbacks()).to.deep.equal({});
    });
  });

  describe('sync', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('respects the message throttle', function () {
      // reuse the callback, similar to .touch in views, which will
      // expose an bug of calling onstatus multiple times
      const callbacks = this.widget.callbacks();
      this.widget.set('a', 'sync test');
      expect(this.widget._pending_msgs).to.equal(0);
      this.widget.save_changes(callbacks);
      expect(this.widget._pending_msgs).to.equal(1);
      this.widget.set('a', 'another sync test');
      this.widget.set('b', 'change b');
      this.widget.save_changes(callbacks);
      this.widget.set('b', 'change b again');
      this.widget.save_changes(callbacks);
      expect(this.widget._pending_msgs).to.equal(1);

      // check that one sync message went through
      expect(this.comm.send).to.be.calledOnce;
      expect(this.comm.send).to.be.calledWith({
        method: 'update',
        state: { a: 'sync test' },
        buffer_paths: [],
      });
      expect(this.widget._msg_buffer).to.deep.equal({
        a: 'another sync test',
        b: 'change b again',
      });
      expect(this.widget._msg_buffer_callbacks).to.not.equals(null);
      // have the comm send a status idle message
      this.comm.send.lastCall.args[1].iopub.status({
        content: {
          execution_state: 'idle',
        },
      });
      // we directly get a new pending message
      expect(this.widget._pending_msgs).to.equal(1);
      expect(this.widget._msg_buffer).to.equal(null);
      expect(this.widget._msg_buffer_callbacks).to.equals(null);

      // check that the other sync message went through with the updated values
      expect(this.comm.send.secondCall).to.be.calledWith({
        method: 'update',
        state: {
          a: 'another sync test',
          b: 'change b again',
        },
        buffer_paths: [],
      });
      this.comm.send.lastCall.args[1].iopub.status({
        content: {
          execution_state: 'idle',
        },
      });
      expect(this.widget._pending_msgs).to.equal(0);

      // repeat again
      this.comm.send.resetHistory();

      this.widget.set('a', 'sync test - 2');
      this.widget.save_changes(callbacks);
      expect(this.widget._pending_msgs).to.equal(1);
      this.widget.set('a', 'another sync test - 2');
      this.widget.set('b', 'change b - 2');
      this.widget.save_changes(callbacks);
      this.widget.set('b', 'change b again - 2');
      this.widget.save_changes(callbacks);
      expect(this.widget._pending_msgs).to.equal(1);
      expect(this.comm.send).to.be.calledOnce;
      expect(this.comm.send).to.be.calledWith({
        method: 'update',
        state: { a: 'sync test - 2' },
        buffer_paths: [],
      });
      this.comm.send.lastCall.args[1].iopub.status({
        content: {
          execution_state: 'idle',
        },
      });
      // again, directly a new message
      expect(this.widget._pending_msgs).to.equal(1);

      expect(this.comm.send.secondCall).to.be.calledWith({
        method: 'update',
        state: {
          a: 'another sync test - 2',
          b: 'change b again - 2',
        },
        buffer_paths: [],
      });
      this.comm.send.lastCall.args[1].iopub.status({
        content: {
          execution_state: 'idle',
        },
      });
      expect(this.widget._pending_msgs).to.equal(0);
    });

    it('Initial values are *not* sent on creation', function () {
      expect(this.comm.send.callCount).to.equal(0);
    });
  });

  describe('send_sync_message', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('sends a message', function () {
      this.widget.send_sync_message(
        {
          a: 'send sync message',
          b: 'b value',
        },
        {}
      );
      expect(this.comm.send).to.be.calledWith({
        method: 'update',
        state: {
          a: 'send sync message',
          b: 'b value',
        },
        buffer_paths: [],
      });
    });

    it('handles buffers in messages', function () {
      const buffer = new Uint8Array([1, 2, 3]);
      this.widget.send_sync_message({
        a: buffer,
      });
      expect(this.comm.send.args[0][0]).to.deep.equal({
        method: 'update',
        state: {},
        buffer_paths: [['a']],
      });
      expect(this.comm.send.args[0][3]).to.deep.equal([buffer.buffer]);
    });
  });

  describe('on_some_change', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('is called once for multiple change notifications', async function () {
      const changeCallback = sinon.spy();
      const someChangeCallback = sinon.spy();
      this.widget.on('change:a change:b', changeCallback);
      this.widget.on_some_change(['a', 'b'], someChangeCallback);
      this.widget.set_state({ a: true, b: true });
      expect(changeCallback.callCount).to.equal(2);
      expect(someChangeCallback).to.be.calledOnce;
    });
  });

  describe('toJSON', function () {
    beforeEach(async function () {
      await this.setup();
    });

    it('encodes the widget', function () {
      expect(this.widget.toJSON()).to.equal(
        `IPY_MODEL_${this.widget.model_id}`
      );
    });
  });
});
