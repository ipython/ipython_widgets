# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Fieldset widget.

This widget is used to group other control widgets into a fieldset.
"""

from .widget import register, widget_serialization, Widget
from .domwidget import DOMWidget
from .widget_core import CoreWidget
from .docutils import doc_subst
from .trait_types import TypedTuple
from traitlets import Unicode, CaselessStrEnum, Instance


_doc_snippets = {}
_doc_snippets[
    "box_params"
] = """
    children: iterable of Widget instances
        list of widgets to display

    box_style: str
        one of 'success', 'info', 'warning' or 'danger', or ''.
        Applies a predefined style to the box. Defaults to '',
        which applies no pre-defined style.
"""


@register
@doc_subst(_doc_snippets)
class Fieldset(DOMWidget, CoreWidget):
    """Displays controls grouped together, optionally with a caption.

    The widgets are laid out horizontally.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> slider = widgets.IntSlider()
    >>> widgets.Fieldset(legend="Fieldset Example", children=[slider])
    """

    _model_name = Unicode("FieldsetModel").tag(sync=True)
    _view_name = Unicode("FieldsetView").tag(sync=True)

    # Child widgets in the container.
    # Using a tuple here to force reassignment to update the list.
    # When a proper notifying-list trait exists, use that instead.
    children = TypedTuple(trait=Instance(Widget), help="List of widget children").tag(
        sync=True, **widget_serialization
    )

    box_style = CaselessStrEnum(
        values=["success", "info", "warning", "danger", ""],
        default_value="",
        help="""Use a predefined styling for the box.""",
    ).tag(sync=True)

    def __init__(self, legend="", children=(), **kwargs):
        kwargs["legend"] = legend
        kwargs["children"] = children
        super().__init__(**kwargs)
