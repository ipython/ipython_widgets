# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Base widget class for widgets provided in Core"""

from traitlets import Unicode

from .._version import __jupyter_widgets_controls_version__
from .widget import Widget


class CoreWidget(Widget):

    _model_module = Unicode("@jupyter-widgets/controls").tag(sync=True)
    _model_module_version = Unicode(__jupyter_widgets_controls_version__).tag(sync=True)
    _view_module = Unicode("@jupyter-widgets/controls").tag(sync=True)
    _view_module_version = Unicode(__jupyter_widgets_controls_version__).tag(sync=True)
