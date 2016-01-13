require('./node_modules/jupyter-js-widgets/static/components/bootstrap/css/bootstrap.css')
require('./node_modules/jquery-ui/themes/smoothness/jquery-ui.min.css')

var jpywidgets = require('jupyter-js-widgets');
console.info('jupyter-js-widgets loaded successfully');

var WidgetManager = exports.WidgetManager = function(el) {
    //  Call the base class.
    jpywidgets.ManagerBase.call(this);
    this.el = el;
};
WidgetManager.prototype = Object.create(jpywidgets.ManagerBase.prototype);

WidgetManager.prototype.display_view = function(msg, view, options) {
    var that = this;
    return Promise.resolve(view).then(function(view) {
        that.el.appendChild(view.el);
        view.on('remove', function() {
            console.log('View removed', view);
        });
        return view;
    });
};

WidgetManager.prototype._get_comm_info = function() {
    return Promise.resolve({});
};
