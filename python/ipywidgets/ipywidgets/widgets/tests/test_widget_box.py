# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import gc
import weakref

import pytest
from traitlets import TraitError

import ipywidgets as widgets


def test_box_construction():
    box = widgets.Box()
    assert box.get_state()["children"] == []


def test_box_construction_with_children():
    html = widgets.HTML("some html")
    slider = widgets.IntSlider()
    box = widgets.Box([html, slider])
    children_state = box.get_state()["children"]
    assert children_state == [
        widgets.widget._widget_to_json(html, None),
        widgets.widget._widget_to_json(slider, None),
    ]


def test_box_construction_style():
    box = widgets.Box(box_style="warning")
    assert box.get_state()["box_style"] == "warning"


def test_construction_invalid_style():
    with pytest.raises(TraitError):
        widgets.Box(box_style="invalid")


def test_box_validate_mode():
    slider = widgets.IntSlider()
    closed_button = widgets.Button()
    closed_button.close()
    with pytest.raises(TraitError, match="Invalid or closed items found.*"):
        widgets.Box(
        children=[closed_button, slider, "Not a widget"]
        )
    box = widgets.Box(
        children=[closed_button, slider, "Not a widget"],
        validate_mode="log_error",
    )
    assert len (box.children) == 1, "Invalid items should be dropped."
    assert slider in box.children

    box.validate_mode = "raise"
    with pytest.raises(TraitError):
        box.children += ("Not a widget", closed_button)


def test_box_gc():
    widgets.enable_weakreference()
    # Test Box gc collected and children lifecycle managed.
    try:
        deleted = False

        class TestButton(widgets.Button):
            def my_click(self, b):
                pass

        button = TestButton(description="button")
        button.on_click(button.my_click)

        b = widgets.VBox(children=[button])

        def on_delete():
            nonlocal deleted
            deleted = True

        weakref.finalize(b, on_delete)
        del b
        gc.collect()
        assert deleted
    finally:
        widgets.disable_weakreference()
