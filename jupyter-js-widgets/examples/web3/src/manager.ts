import * as widgets from 'jupyter-js-widgets';
import 'phosphor/styles/base.css';
import './widgets.css';
import * as PWidget from 'phosphor/lib/ui/widget';


export
class WidgetManager extends widgets.ManagerBase<HTMLElement> {
    constructor(kernel, el) {
        super();
        this.kernel = kernel;
        this.el = el;

        // Create a comm manager shim
        this.commManager = new widgets.shims.services.CommManager(kernel);

        // Register the comm target
        this.commManager.register_target(this.comm_target_name, this.handle_comm_open.bind(this));
    }

    display_view(msg, view, options) {
        return Promise.resolve(view).then((view) => {
            PWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any> {
        if (moduleName === 'jupyter-js-widgets') {
            if (widgets[className]) {
                return Promise.resolve(widgets[className]);
            } else {
                return Promise.reject(`Cannot find class ${className}`)
            }
        } else {
            return Promise.reject(`Cannot find module ${moduleName}`);
        }
    }

    _create_comm(targetName, id, metadata) {
        return this.commManager.new_comm(targetName, metadata, id);
    }

    _get_comm_info() {
        return Promise.resolve({});
    }

    /**
     * Takes a requirejs success handler and returns a requirejs error handler
     * that attempts loading the module from unpkg.
     */
    require_error(success_callback, version : string) {
        return function(err) : any {
            var failedId = err.requireModules && err.requireModules[0];
            if (failedId) {
                // TODO: Get typing to work for requirejs
                (window as any).require(['https://unpkg.com/' + failedId + '@' + version + '/dist/index.js'], success_callback);
            } else {
                throw err;
            }
        };
    }

    kernel: any;
    el: HTMLElement;
    commManager: any;
}
