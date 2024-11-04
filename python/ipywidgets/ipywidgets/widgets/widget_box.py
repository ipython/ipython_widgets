
# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Box widgets.

These widgets are containers that can be used to
group other widgets together and control their
relative layouts.
"""
from __future__ import annotations

import typing

from traitlets import CaselessStrEnum, TraitError, TraitType, Unicode

from .docutils import doc_subst
from .domwidget import DOMWidget
from .widget import Widget, register, widget_serialization
from .widget_core import CoreWidget

_doc_snippets = {}
_doc_snippets['box_params'] = """
    children: iterable of Widget instances
        list of widgets to display

    box_style: str
        one of 'success', 'info', 'warning' or 'danger', or ''.
        Applies a predefined style to the box. Defaults to '',
        which applies no pre-defined style.

    validate_mode: str 
        one of 'raise', 'warning', error'.
        How invalid children will be treated.
        'raise' will raise a trait error.
        'warning' and 'error' will log an error using box.log dropping
        the invalid items from children.
"""

class Children(TraitType['tuple[Widget,...]', typing.Iterable[Widget]]):
    default_value = ()

    def validate(self, obj: Box, value: typing.Iterable[Widget]):
        valid, invalid = [], []
        for v in value:
            if isinstance(v, Widget) and v._repr_mimebundle_:
                valid.append(v)
            else:
                invalid.append(v)
        if invalid:
            msg = f'Invalid or closed items found: {invalid}'
            if obj.validate_mode == 'log_warning':
                obj.log.warning(msg)
            elif obj.validate_mode == 'log_error':
                obj.log.error(msg)
            else:
                raise TraitError(msg)
        return tuple(valid)


@register
@doc_subst(_doc_snippets)
class Box(DOMWidget, CoreWidget):
    """ Displays multiple widgets in a group.

    The widgets are laid out horizontally.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> widgets.Box([title_widget, slider])
    """
    _model_name = Unicode('BoxModel').tag(sync=True)
    _view_name = Unicode("BoxView").tag(sync=True)
    validate_mode = CaselessStrEnum(['raise', 'log_warning', 'log_error'], 'raise')

    # Child widgets in the container.
    # Using a tuple here to force reassignment to update the list.
    # When a proper notifying-list trait exists, use that instead.
    children = Children(help='List of widget children').tag(
        sync=True, **widget_serialization
    )

    box_style = CaselessStrEnum(
        values=['success', 'info', 'warning', 'danger', ''], default_value='',
        help="""Use a predefined styling for the box.""").tag(sync=True)
    
    def __init__(self, children=(), **kwargs):
        if children:
            kwargs['children'] = children
        super().__init__(**kwargs)

@register
@doc_subst(_doc_snippets)
class VBox(Box):
    """ Displays multiple widgets vertically using the flexible box model.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Vertical Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> widgets.VBox([title_widget, slider])
    """
    _model_name = Unicode('VBoxModel').tag(sync=True)
    _view_name = Unicode('VBoxView').tag(sync=True)


@register
@doc_subst(_doc_snippets)
class HBox(Box):
    """ Displays multiple widgets horizontally using the flexible box model.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Horizontal Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> widgets.HBox([title_widget, slider])
    """
    _model_name = Unicode('HBoxModel').tag(sync=True)
    _view_name = Unicode('HBoxView').tag(sync=True)


@register
class GridBox(Box):
    """ Displays multiple widgets in rows and columns using the grid box model.

    Parameters
    ----------
    {box_params}

    Examples
    --------
    >>> import ipywidgets as widgets
    >>> title_widget = widgets.HTML('<em>Grid Box Example</em>')
    >>> slider = widgets.IntSlider()
    >>> button1 = widgets.Button(description='1')
    >>> button2 = widgets.Button(description='2')
    >>> # Create a grid with two columns, splitting space equally
    >>> layout = widgets.Layout(grid_template_columns='1fr 1fr')
    >>> widgets.GridBox([title_widget, slider, button1, button2], layout=layout)
    """
    _model_name = Unicode('GridBoxModel').tag(sync=True)
    _view_name = Unicode('GridBoxView').tag(sync=True)
