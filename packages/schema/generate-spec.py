# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import argparse
import json
from operator import itemgetter
import pathlib
import sys

from traitlets import (
    CaselessStrEnum,
    Unicode,
    Tuple,
    List,
    Bool,
    CFloat,
    Float,
    CInt,
    Int,
    Instance,
    Dict,
    Bytes,
    Any,
    Union,
)

import ipywidgets as widgets
from ipywidgets import Color
from ipywidgets.widgets.trait_types import TypedTuple, ByteMemoryView
from ipywidgets.widgets.widget_link import Link

HEADER = '''# Model State

This is a description of the model state for each widget in the core Jupyter
widgets library. The model ID of a widget is the id of the comm object the
widget is using. A reference to a widget is serialized to JSON as a string of
the form `"IPY_MODEL_<MODEL_ID>"`, where `<MODEL_ID>` is the model ID of a
previously created widget of the specified type.

This model specification is for ipywidgets 8.

## Model attributes

Each widget in the Jupyter core widgets is represented below. The heading
represents the model name, module, and version, view name, module, and version
that the widget is registered with.

'''

NUMBER_MAP = {
    'int': 'number (integer)',
    'float': 'number (float)',
    'bool': 'boolean',
    'bytes': 'Bytes'
}


def trait_type(trait, widget_list):
    attributes = {}
    if isinstance(trait, CaselessStrEnum):
        w_type = 'string'
        attributes['enum'] = trait.values
    elif isinstance(trait, Unicode):
        w_type = 'string'
    elif isinstance(trait, (Tuple, List)):
        w_type = 'array'
    elif isinstance(trait, TypedTuple):
        w_type = 'array'
        attributes['items'] = trait_type(trait._trait, widget_list)
    elif isinstance(trait, Bool):
        w_type = 'bool'
    elif isinstance(trait, (CFloat, Float)):
        w_type = 'float'
    elif isinstance(trait, (CInt, Int)):
        w_type = 'int'
    elif isinstance(trait, Color):
        w_type = 'color'
    elif isinstance(trait, Dict):
        w_type = 'object'
    elif isinstance(trait, Union):
        union_attributes = []
        union_types = []
        for ut in trait.trait_types:
            ua = trait_type(ut, widget_list)
            union_attributes.append(ua)
            union_types.append(ua['type'])
        w_type = union_types
        attributes['union_attributes'] = union_attributes
    elif isinstance(trait, (Bytes, ByteMemoryView)):
        w_type = 'bytes'
    elif isinstance(trait, Instance) and issubclass(trait.klass,
                                                     widgets.Widget):
        w_type = 'reference'
        attributes['widget'] = trait.klass.__name__
    elif isinstance(trait, Any):
        # In our case, these all happen to be values that are converted to
        # strings
        w_type = 'label'
    else:
        w_type = trait.__class__.__name__
    attributes['type'] = w_type
    if trait.allow_none:
        attributes['allow_none'] = True
    return attributes


def jsdefault(trait):
    if isinstance(trait, Instance):
        default = trait.make_dynamic_default()
        if issubclass(trait.klass, widgets.Widget):
            return 'reference to new instance'
    else:
        try:
            # traitlets 5
            default = trait.default()
        except AttributeError:
            # traitlets 4 - can be deleted when we depend only on traitlets 5
            if isinstance(trait, Union):
                default = trait.make_dynamic_default()
            else:
                default = trait.default_value
        if isinstance(default, bytes) or isinstance(default, memoryview):
            default = trait.default_value_repr()
    return default


def mddefault(attribute):
    default = attribute['default']
    is_ref = isinstance(default, str) and default.startswith('reference')
    if default is None:
        default = 'null'
    elif isinstance(default, bool):
        default = str(default).lower()
    elif not is_ref and attribute['type'] != 'bytes':
        default = "{!r}".format(default)
    if not is_ref:
        default = '`{}`'.format(default)
    return default


def mdtype(attribute):
    md_type = attribute['type']
    if 'union_attributes' in attribute and isinstance(md_type, (list, tuple)):
        md_type = ' or '.join(
            mdtype(ua) for ua in attribute['union_attributes']
        )
    if md_type in NUMBER_MAP:
        md_type = NUMBER_MAP[md_type]
    if attribute.get('allow_none'):
        md_type = '`null` or {}'.format(md_type)
    if 'enum' in attribute:
        md_type = '{} (one of {})'.format(
            md_type, ', '.join('`{!r}`'.format(n) for n in attribute['enum'])
        )
    if 'items' in attribute:
        md_type = '{} of {}'.format(md_type, mdtype(attribute['items']))
    if 'widget' in attribute:
        md_type = '{} to {} widget'.format(md_type, attribute['widget'])
    return md_type


def format_widget(widget):
    out = []
    fmt = '%(name)s (%(module)s, %(version)s)'
    out.append('### %s; %s' % (fmt % widget['model'], fmt % widget['view']))
    out.append('')
    out.append('{name: <16} | {typing: <16} | {default: <16} | {help}'.format(
        name='Attribute', typing='Type', default='Default', help='Help')
    )
    out.append('{0:-<16}-|-{0:-<16}-|-{0:-<16}-|----'.format('-'))

    for attribute in sorted(widget['attributes'], key=itemgetter('name')):
        s = '{name: <16} | {type: <16} | {default: <16} | {help}'.format(
            name='`{}`'.format(attribute['name']),
            default=mddefault(attribute),
            type=mdtype(attribute),
            help=attribute['help']
        )
        out.append(s)
    out.append('')
    return '\n'.join(out)


def jsonify(identifier, widget, widget_list):
    model = dict(zip(['module', 'version', 'name'], identifier[:3]))
    view = dict(zip(['module', 'version', 'name'], identifier[3:]))
    attributes = []
    for name, trait in widget.traits(sync=True).items():
        if name == '_view_count':
            # don't document this since it is totally experimental at this point
            continue

        attribute = dict(
            name=name,
            help=trait.help or '',
            default=jsdefault(trait)
        )
        attribute.update(trait_type(trait, widget_list))
        attributes.append(attribute)

    return dict(model=model, view=view, attributes=attributes)


def create_spec(widget_list):
    widget_data = []
    for widget_name, widget_cls in widget_list:
        if issubclass(widget_cls, Link):
            widget = widget_cls((widgets.IntSlider(), 'value'),
                                (widgets.IntSlider(), 'value'))
        elif issubclass(widget_cls, (widgets.SelectionRangeSlider,
                                     widgets.SelectionSlider)):
            widget = widget_cls(options=[1])
        else:
            widget = widget_cls()

        widget_data.append(jsonify(widget_name, widget, widget_list))
    return widget_data


def create_markdown(spec):
    output = [HEADER]
    for widget in spec:
        output.append(format_widget(widget))
    return '\n'.join(output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Description of your program')
    parser.add_argument('-f', '--format', choices=['json', 'json-pretty', 'markdown'],
        help='Format to generate', default='json')
    parser.add_argument('output', nargs='?', type=pathlib.Path)
    args = parser.parse_args()
    format = args.format

    widgets_to_document = sorted(widgets.Widget._widget_types.items())
    spec = create_spec(widgets_to_document)

    if args.output:
        args.output.parent.mkdir(exist_ok=True)
        output = open(args.output, mode='w', encoding='utf8')
    else:
        output = sys.stdout

    try:
        if format == 'json':
            try:
                json.dump(spec, output, sort_keys=True)
            except TypeError:
                print('Encountered error when converting spec to JSON. Here is the spec:')
                print(spec)
                raise
        elif format == 'json-pretty':
            json.dump(spec, output, sort_keys=True,
                indent=2, separators=(',', ': '))
        elif format == 'markdown':
            # We go through the json engine to convert tuples to lists, etc.
            output.write(create_markdown(json.loads(json.dumps(spec))))
        output.write('\n')
    finally:
        if args.output:
            output.close()
