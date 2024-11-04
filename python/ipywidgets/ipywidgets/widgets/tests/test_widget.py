# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Widget."""

import copy
import gc
import weakref

import pytest
from IPython.core.interactiveshell import InteractiveShell
from IPython.display import display
from IPython.utils.capture import capture_output

import ipywidgets as ipw

from ..widget import Widget
from ..widget_button import Button


def test_no_widget_view():
    # ensure IPython shell is instantiated
    # otherwise display() just calls print
    shell = InteractiveShell.instance()

    with capture_output() as cap:
        w = Widget()
        display(w)

    assert len(cap.outputs) == 1, "expect 1 output"
    mime_bundle = cap.outputs[0].data
    assert mime_bundle["text/plain"] == repr(w), "expected plain text output"
    assert (
        "application/vnd.jupyter.widget-view+json" not in mime_bundle
    ), "widget has no view"
    assert cap.stdout == "", repr(cap.stdout)
    assert cap.stderr == "", repr(cap.stderr)


def test_widget_view():
    # ensure IPython shell is instantiated
    # otherwise display() just calls print
    shell = InteractiveShell.instance()

    with capture_output() as cap:
        w = Button()
        display(w)

    assert len(cap.outputs) == 1, "expect 1 output"
    mime_bundle = cap.outputs[0].data
    assert mime_bundle["text/plain"] == repr(w), "expected plain text output"
    assert (
        "application/vnd.jupyter.widget-view+json" in mime_bundle
    ), "widget should have have a view"
    assert cap.stdout == "", repr(cap.stdout)
    assert cap.stderr == "", repr(cap.stderr)


def test_close_all():
    # create a couple of widgets
    widgets = [Button() for i in range(10)]

    assert len(Widget._instances) > 0, "expect active widgets"
    assert Widget._instances[widgets[0].model_id] is widgets[0]
    # close all the widgets
    Widget.close_all()

    assert len(Widget._instances) == 0, "active widgets should be cleared"


def test_widget_copy():
    button = Button()
    with pytest.raises(NotImplementedError):
        copy.copy(button)
    with pytest.raises(NotImplementedError):
        copy.deepcopy(button)


def test_widget_open():
    button = Button()
    model_id = button.model_id
    assert model_id in Widget._instances
    spec = button.get_view_spec()
    assert list(spec) == ["version_major", "version_minor", "model_id"]
    assert spec["model_id"]
    button.close()
    assert model_id not in Widget._instances
    with pytest.raises(RuntimeError, match="Widget is closed"):
        button.open()
    with pytest.raises(RuntimeError, match="Widget is closed"):
        button.get_view_spec()


@pytest.mark.parametrize(
    "class_name",
    [
        "Accordion",
        "AppLayout",
        "Audio",
        "BoundedFloatText",
        "BoundedIntText",
        "Box",
        "Button",
        "ButtonStyle",
        "Checkbox",
        "ColorPicker",
        "ColorsInput",
        "Combobox",
        "Controller",
        "CoreWidget",
        "DOMWidget",
        "DatePicker",
        "DatetimePicker",
        "Dropdown",
        "FileUpload",
        "FloatLogSlider",
        "FloatProgress",
        "FloatRangeSlider",
        "FloatSlider",
        "FloatText",
        "FloatsInput",
        "GridBox",
        "HBox",
        "HTML",
        "HTMLMath",
        "Image",
        "IntProgress",
        "IntRangeSlider",
        "IntSlider",
        "IntText",
        "IntsInput",
        "Label",
        "Layout",
        "NaiveDatetimePicker",
        "Output",
        "Password",
        "Play",
        "RadioButtons",
        "Select",
        "SelectMultiple",
        "SelectionRangeSlider",
        "SelectionSlider",
        "SliderStyle",
        "Stack",
        "Style",
        "Tab",
        "TagsInput",
        "Text",
        "Textarea",
        "TimePicker",
        "ToggleButton",
        "ToggleButtons",
        "ToggleButtonsStyle",
        "TwoByTwoLayout",
        "VBox",
        "Valid",
        "ValueWidget",
        "Video",
        "Widget",
    ],
)
@pytest.mark.parametrize("enable_weakref", [True, False])
def test_weakreference(class_name, enable_weakref):
    # Ensure the base instance of all widgets can be deleted / garbage collected.
    if enable_weakref:
        ipw.enable_weakreference()
    cls = getattr(ipw, class_name)
    if class_name in ['SelectionRangeSlider', 'SelectionSlider']:
        kwgs = {"options": [1, 2, 4]}
    else:
        kwgs = {}
    try:
        w = cls(**kwgs)
        deleted = False
        def on_delete():
            nonlocal deleted
            deleted = True
        weakref.finalize(w, on_delete)
        # w should be the only strong ref to the widget.
        # calling `del` should invoke its immediate deletion calling the `__del__` method.
        if not enable_weakref:
            w.close()
        del w
        gc.collect()
        assert deleted
    finally:
        if enable_weakref:
            ipw.disable_weakreference()


@pytest.mark.parametrize("weakref_enabled", [True, False])
def test_button_weakreference(weakref_enabled: bool):
    try:
        click_count = 0
        deleted = False

        def on_delete():
            nonlocal deleted
            deleted = True

        class TestButton(Button):
            def my_click(self, b):
                nonlocal click_count
                click_count += 1

        b = TestButton(description="button")
        weakref.finalize(b, on_delete)
        b_ref = weakref.ref(b)
        assert b in Widget._instances.values()

        b.on_click(b.my_click)
        b.on_click(lambda x: setattr(x, "clicked", True))

        b.click()
        assert click_count == 1

        if weakref_enabled:
            ipw.enable_weakreference()
            assert b in Widget._instances.values(), "Instances not transferred"
            ipw.disable_weakreference()
            assert b in Widget._instances.values(), "Instances not transferred"
            ipw.enable_weakreference()
            assert b in Widget._instances.values(), "Instances not transferred"

        b.click()
        assert click_count == 2
        assert getattr(b, "clicked")

        del b
        gc.collect()
        if weakref_enabled:
            assert deleted
        else:
            assert not deleted
            assert b_ref() in Widget._instances.values()
            b_ref().close()
            gc.collect()
            assert deleted, "Closing should remove the last strong reference."

    finally:
        ipw.disable_weakreference()
