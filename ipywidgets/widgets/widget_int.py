"""Int class.

Represents an unbounded int using a widget.
"""

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .domwidget import DOMWidget
from .widget import register
from .trait_types import Color
from traitlets import Unicode, CInt, Bool, CaselessStrEnum, Tuple, TraitError


_int_doc_t = """
Parameters
----------
value: integer
    The initial value.
"""

_bounded_int_doc_t = """
Parameters
----------
value: integer
    The initial value.
min: integer
    The lower limit for the value.
max: integer
    The upper limit for the value.
step: integer
    The step between allowed values.
"""

def _int_doc(cls):
    """Add int docstring template to class init."""
    def __init__(self, value=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        super(cls, self).__init__(**kwargs)

    __init__.__doc__ = _int_doc_t
    cls.__init__ = __init__
    return cls

def _bounded_int_doc(cls):
    """Add bounded int docstring template to class init."""
    def __init__(self, value=None, min=None, max=None, step=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        if min is not None:
            kwargs['min'] = min
        if max is not None:
            kwargs['max'] = max
        if step is not None:
            kwargs['step'] = step
        super(cls, self).__init__(**kwargs)

    __init__.__doc__ = _bounded_int_doc_t
    cls.__init__ = __init__
    return cls


class _Int(DOMWidget):
    """Base class for widgets that represent an integer."""
    value = CInt(0, help="Int value").tag(sync=True)
    disabled = Bool(False, help="Enable or disable user changes").tag(sync=True)
    description = Unicode(help="Description of the value this widget represents").tag(sync=True)

    def __init__(self, value=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        super(_Int, self).__init__(**kwargs)


class _BoundedInt(_Int):
    """Base class for widgets that represent an integer bounded from above and below.
    """
    step = CInt(1, help="Minimum step to increment the value (ignored by some views)").tag(sync=True)
    max = CInt(100, help="Max value").tag(sync=True)
    min = CInt(0, help="Min value").tag(sync=True)

    def __init__(self, value=None, min=None, max=None, step=None, **kwargs):
        if value is not None:
            kwargs['value'] = value
        if min is not None:
            kwargs['min'] = min
        if max is not None:
            kwargs['max'] = max
        if step is not None:
            kwargs['step'] = step
        super(_BoundedInt, self).__init__(**kwargs)

    def _value_validate(self, value, trait):
        """Cap and floor value"""
        if self.min > value or self.max < value:
            value = min(max(value, self.min), self.max)
        return value

    def _min_validate(self, min, trait):
        """Enforce min <= value <= max"""
        if min > self.max:
            raise TraitError("Setting min > max")
        if min > self.value:
            self.value = min
        return min

    def _max_validate(self, max, trait):
        """Enforce min <= value <= max"""
        if max < self.min:
            raise TraitError("setting max < min")
        if max < self.value:
            self.value = max
        return max

@register('Jupyter.IntText')
@_int_doc
class IntText(_Int):
    """Textbox widget that represents an integer."""
    _view_name = Unicode('IntTextView').tag(sync=True)
    _model_name = Unicode('IntTextModel').tag(sync=True)


@register('Jupyter.BoundedIntText')
@_bounded_int_doc
class BoundedIntText(_BoundedInt):
    """Textbox widget that represents an integer bounded from above and below.
    """
    _view_name = Unicode('IntTextView').tag(sync=True)
    _model_name = Unicode('IntTextModel').tag(sync=True)


@register('Jupyter.IntSlider')
@_bounded_int_doc
class IntSlider(_BoundedInt):
    """Slider widget that represents an integer bounded from above and below.
    """
    _view_name = Unicode('IntSliderView').tag(sync=True)
    _model_name = Unicode('IntSliderModel').tag(sync=True)
    orientation = CaselessStrEnum(values=['horizontal', 'vertical'],
        default_value='horizontal', help="Vertical or horizontal.").tag(sync=True)
    _range = Bool(False, help="Display a range selector").tag(sync=True)
    readout = Bool(True, help="Display the current value of the slider next to it.").tag(sync=True)
    slider_color = Color(None, allow_none=True).tag(sync=True)
    continuous_update = Bool(True, help="Update the value of the widget as the user is sliding the slider.").tag(sync=True)


@register('Jupyter.IntProgress')
@_bounded_int_doc
class IntProgress(_BoundedInt):
    """Progress bar that represents an integer bounded from above and below.
    """
    _view_name = Unicode('ProgressView').tag(sync=True)
    _model_name = Unicode('ProgressModel').tag(sync=True)

    orientation = CaselessStrEnum(values=['horizontal', 'vertical'],
        default_value='horizontal', help="Vertical or horizontal.").tag(sync=True)

    bar_style = CaselessStrEnum(
        values=['success', 'info', 'warning', 'danger', ''], default_value='',
        help="""Use a predefined styling for the progess bar.""").tag(sync=True)


class _IntRange(_Int):
    value = Tuple(CInt(), CInt(), default_value=(0, 1), help="Tuple of (lower, upper) bounds").tag(sync=True)
    lower = CInt(0, help="Lower bound")
    upper = CInt(1, help="Upper bound")

    def __init__(self, *pargs, **kwargs):
        value_given = 'value' in kwargs
        lower_given = 'lower' in kwargs
        upper_given = 'upper' in kwargs
        if value_given and (lower_given or upper_given):
            raise ValueError("Cannot specify both 'value' and 'lower'/'upper' for range widget")
        if lower_given != upper_given:
            raise ValueError("Must specify both 'lower' and 'upper' for range widget")

        super(_IntRange, self).__init__(*pargs, **kwargs)

        # ensure the traits match, preferring whichever (if any) was given in kwargs
        if value_given:
            self.lower, self.upper = self.value
        else:
            self.value = (self.lower, self.upper)

        self.on_trait_change(self._validate, ['value', 'upper', 'lower'])

    def _validate(self, name, old, new):
        if name == 'value':
            self.lower, self.upper = min(new), max(new)
        elif name == 'lower':
            self.value = (new, self.value[1])
        elif name == 'upper':
            self.value = (self.value[0], new)

class _BoundedIntRange(_IntRange):
    step = CInt(1, help="Minimum step that the value can take (ignored by some views)").tag(sync=True)
    max = CInt(100, help="Max value").tag(sync=True)
    min = CInt(0, help="Min value").tag(sync=True)

    def __init__(self, *pargs, **kwargs):
        any_value_given = 'value' in kwargs or 'upper' in kwargs or 'lower' in kwargs
        _IntRange.__init__(self, *pargs, **kwargs)

        # ensure a minimal amount of sanity
        if self.min > self.max:
            raise ValueError("min must be <= max")

        if any_value_given:
            # if a value was given, clamp it within (min, max)
            self._validate("value", None, self.value)
        else:
            # otherwise, set it to 25-75% to avoid the handles overlapping
            self.value = (0.75 * self.min + 0.25 * self.max,
                          0.25 * self.min + 0.75 * self.max)
        # callback already set for 'value', 'lower', 'upper'
        self.on_trait_change(self._validate, ['min', 'max'])

    def _validate(self, name, old, new):
        if name == "min":
            if new > self.max:
                raise ValueError("setting min > max")
        elif name == "max":
            if new < self.min:
                raise ValueError("setting max < min")

        low, high = self.value
        if name == "value":
            low, high = min(new), max(new)
        elif name == "upper":
            if new < self.lower:
                raise ValueError("setting upper < lower")
            high = new
        elif name == "lower":
            if new > self.upper:
                raise ValueError("setting lower > upper")
            low = new

        low = max(self.min, min(low, self.max))
        high = min(self.max, max(high, self.min))

        # determine the order in which we should update the
        # lower, upper traits to avoid a temporary inverted overlap
        lower_first = high < self.lower

        self.value = (low, high)
        if lower_first:
            self.lower = low
            self.upper = high
        else:
            self.upper = high
            self.lower = low

@register('Jupyter.IntRangeSlider')
class IntRangeSlider(_BoundedIntRange):
    """Slider widget that represents a pair of ints bounded by minimum and maximum value.

    Parameters
    ----------
    lower: int
        The lower bound of the range
    upper: int
        The upper bound of the range
    min: int
        The lowest allowed value for `lower`
    max: int
        The highest allowed value for `upper`
    """
    _view_name = Unicode('IntSliderView').tag(sync=True)
    _model_name = Unicode('IntSliderModel').tag(sync=True)
    orientation = CaselessStrEnum(values=['horizontal', 'vertical'],
        default_value='horizontal', help="Vertical or horizontal.").tag(sync=True)
    _range = Bool(True, help="Display a range selector").tag(sync=True)
    readout = Bool(True, help="Display the current value of the slider next to it.").tag(sync=True)
    slider_color = Color(None, allow_none=True).tag(sync=True)
    continuous_update = Bool(True, help="Update the value of the widget as the user is sliding the slider.").tag(sync=True)
