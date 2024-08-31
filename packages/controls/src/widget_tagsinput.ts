// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as d3Color from 'd3-color';
import * as d3Format from 'd3-format';

import { CoreDOMWidgetModel } from './widget_core';

import { DOMWidgetView, Dict, uuid } from '@jupyter-widgets/base';

/**
 * Returns a new string after removing any leading and trailing whitespaces.
 * The original string is left unchanged.
 */
function trim(value: string): string {
  return value.replace(/^\s+|\s+$/g, '');
}

/**
 * Clamp a number between min and max and return the result.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Remove children from an HTMLElement
 */
function removeChildren(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * Selection class which keeps track on selected indices.
 */
class Selection {
  constructor(start: number, dx: number, max: number) {
    this.start = start;
    this.dx = dx;
    this.max = max;
  }

  /**
   * Check if a given index is currently selected.
   */
  isSelected(index: number): boolean {
    let min: number;
    let max: number;
    if (this.dx >= 0) {
      min = this.start;
      max = this.start + this.dx;
    } else {
      min = this.start + this.dx;
      max = this.start;
    }
    return min <= index && index < max;
  }

  /**
   * Update selection
   */
  updateSelection(dx: number): void {
    this.dx += dx;

    if (this.start + this.dx > this.max) {
      this.dx = this.max - this.start;
    }
    if (this.start + this.dx < 0) {
      this.dx = -this.start;
    }
  }

  private start: number;
  private dx: number;
  private max: number;
}

class TagsInputBaseModel extends CoreDOMWidgetModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      value: [],
      placeholder: '\u200b',
      allowed_tags: null,
      allow_duplicates: true,
    };
  }
}

abstract class TagsInputBaseView extends DOMWidgetView {
  /**
   * Called when view is rendered.
   */
  render(): void {
    super.render();

    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('jupyter-widget-tagsinput');

    this.taginputWrapper = document.createElement('div');

    // The taginput is hidden until the user focuses on the widget
    // Unless there is no value
    if (this.model.get('value').length) {
      this.taginputWrapper.style.display = 'none';
    } else {
      this.taginputWrapper.style.display = 'inline-block';
    }

    this.datalistID = uuid();

    this.taginput = document.createElement('input');
    this.taginput.classList.add('jupyter-widget-tag');
    this.taginput.classList.add('jupyter-widget-taginput');
    this.taginput.setAttribute('list', this.datalistID);
    this.taginput.setAttribute('type', 'text');

    this.autocompleteList = document.createElement('datalist');
    this.autocompleteList.id = this.datalistID;

    this.updateAutocomplete();
    this.model.on('change:allowed_tags', this.updateAutocomplete.bind(this));

    this.updatePlaceholder();
    this.model.on('change:placeholder', this.updatePlaceholder.bind(this));

    this.taginputWrapper.classList.add('widget-text');
    this.taginputWrapper.appendChild(this.taginput);
    this.taginputWrapper.appendChild(this.autocompleteList);

    this.el.onclick = this.focus.bind(this);
    this.el.ondrop = (event: DragEvent): void => {
      // Put the tag at the end of the list if there is no currently hovered tag
      const index =
        this.hoveredTagIndex == null ? this.tags.length : this.hoveredTagIndex;
      return this.ondrop(event, index);
    };
    this.el.ondragover = this.ondragover.bind(this);

    this.taginput.onchange = this.handleValueAdded.bind(this);
    this.taginput.oninput = this.resizeInput.bind(this);
    this.taginput.onkeydown = this.handleKeyEvent.bind(this);
    this.taginput.onblur = this.loseFocus.bind(this);
    this.resizeInput();

    this.inputIndex = this.model.get('value').length;

    this.selection = null;
    this.preventLoosingFocus = false;

    this.update();
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed. The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update(): void {
    // Prevent hiding the input element and clearing the selection when updating everything
    this.preventLoosingFocus = true;

    removeChildren(this.el);
    this.tags = [];

    const value: Array<any> = this.model.get('value');
    this.inputIndex = value.length;
    for (const idx in value) {
      const index = parseInt(idx);

      const tag = this.createTag(
        value[index],
        index,
        this.selection != null && this.selection.isSelected(index)
      );

      // Drag and drop
      tag.draggable = true;
      tag.ondragstart = ((index: number, value: any) => {
        return (event: DragEvent): void => {
          this.ondragstart(event, index, value, this.model.model_id);
        };
      })(index, value[index]);
      tag.ondrop = ((index: number) => {
        return (event: DragEvent): void => {
          this.ondrop(event, index);
        };
      })(index);
      tag.ondragover = this.ondragover.bind(this);
      tag.ondragenter = ((index: number) => {
        return (event: DragEvent): void => {
          this.ondragenter(event, index);
        };
      })(index);
      tag.ondragend = this.ondragend.bind(this);

      this.tags.push(tag);
      this.el.appendChild(tag);
    }

    this.el.insertBefore(
      this.taginputWrapper,
      this.el.children[this.inputIndex]
    );

    // The taginput is hidden until the user focuses on the widget
    // Unless there is no value
    if (this.model.get('value').length) {
      this.taginputWrapper.style.display = 'none';
    } else {
      this.taginputWrapper.style.display = 'inline-block';
    }

    this.preventLoosingFocus = false;

    return super.update();
  }

  /**
   * Update the auto-completion list
   */
  updateAutocomplete(): void {
    removeChildren(this.autocompleteList);

    const allowedTags = this.model.get('allowed_tags');

    for (const tag of allowedTags) {
      const option = document.createElement('option');
      option.value = tag;
      this.autocompleteList.appendChild(option);
    }
  }

  /**
   * Update the auto-completion list
   */
  updatePlaceholder(): void {
    this.taginput.placeholder = this.model.get('placeholder');
    this.resizeInput();
  }

  /**
   * Update the tags, called when the selection has changed and we need to update the tags CSS
   */
  updateTags(): void {
    const value: Array<any> = this.model.get('value');

    for (const idx in this.tags) {
      const index = parseInt(idx);

      this.updateTag(
        this.tags[index],
        value[index],
        index,
        this.selection != null && this.selection.isSelected(index)
      );
    }
  }

  /**
   * Handle a new value is added from the input element
   */
  handleValueAdded(event: Event): void {
    const newTagValue = trim(this.taginput.value);
    const tagIndex = this.inputIndex;

    if (newTagValue == '') {
      return;
    }

    this.inputIndex++;

    const tagAdded = this.addTag(tagIndex, newTagValue);

    if (tagAdded) {
      // Clear the input and keep focus on it allowing the user to add more tags
      this.taginput.value = '';
      this.resizeInput();
      this.focus();
    }
  }

  /**
   * Add a new tag with a value of `tagValue` at the `index` position
   * Return true if the tag was correctly added, false otherwise
   */
  addTag(index: number, tagValue: string): boolean {
    const value: Array<any> = this.model.get('value');

    let newTagValue: any;
    try {
      newTagValue = this.validateValue(tagValue);
    } catch (error) {
      return false;
    }

    const allowedTagValues = this.model.get('allowed_tags');
    if (allowedTagValues.length && !allowedTagValues.includes(newTagValue)) {
      // Do nothing for now, maybe show a proper error message?
      return false;
    }

    if (!this.model.get('allow_duplicates') && value.includes(newTagValue)) {
      // Do nothing for now, maybe add an animation to highlight the tag?
      return false;
    }

    // Clearing the current selection before setting the new value
    this.selection = null;

    // Making a copy so that backbone sees the change, and insert the new tag
    const newValue = [...value];
    newValue.splice(index, 0, newTagValue);

    this.model.set('value', newValue);
    this.model.save_changes();

    return true;
  }

  /**
   * Resize the input element
   */
  resizeInput(): void {
    let content: string;

    if (this.taginput.value.length != 0) {
      content = this.taginput.value;
    } else {
      content = this.model.get('placeholder');
    }

    const size = content.length + 1;
    this.taginput.setAttribute('size', String(size));
  }

  /**
   * Handle key events on the input element
   */
  handleKeyEvent(event: KeyboardEvent): void {
    const valueLength = this.model.get('value').length;

    // Do nothing if the user is typing something
    if (this.taginput.value.length) {
      return;
    }

    const currentElement: number = this.inputIndex;
    switch (event.key) {
      case 'ArrowLeft':
        if (event.ctrlKey && event.shiftKey) {
          this.select(currentElement, -currentElement);
        }
        if (!event.ctrlKey && event.shiftKey) {
          this.select(currentElement, -1);
        }

        if (event.ctrlKey) {
          this.inputIndex = 0;
        } else {
          this.inputIndex--;
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey && event.shiftKey) {
          this.select(currentElement, valueLength - currentElement);
        }
        if (!event.ctrlKey && event.shiftKey) {
          this.select(currentElement, 1);
        }

        if (event.ctrlKey) {
          this.inputIndex = valueLength;
        } else {
          this.inputIndex++;
        }
        break;
      case 'Backspace':
        if (this.selection) {
          this.removeSelectedTags();
        } else {
          this.removeTag(this.inputIndex - 1);
        }
        break;
      case 'Delete':
        if (this.selection) {
          this.removeSelectedTags();
        } else {
          this.removeTag(this.inputIndex);
        }
        break;
      default:
        // Do nothing by default
        return;
        break;
    }

    // Reset selection is shift key is not pressed
    if (!event.shiftKey) {
      this.selection = null;
    }

    this.inputIndex = clamp(this.inputIndex, 0, valueLength);

    this.update();
    this.focus();
  }

  /**
   * Function that gets called when a tag with a given `value` is being dragged.
   */
  ondragstart(
    event: DragEvent,
    index: number,
    tagValue: any,
    origin: string
  ): void {
    if (event.dataTransfer == null) {
      return;
    }
    event.dataTransfer.setData('index', String(index));
    event.dataTransfer.setData('tagValue', String(tagValue));
    event.dataTransfer.setData('origin', origin);
  }

  /**
   * Function that gets called when a tag has been dragged on the tag at the `index` position.
   */
  ondrop(event: DragEvent, index: number): void {
    if (event.dataTransfer == null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const draggedTagValue: string = event.dataTransfer.getData('tagValue');
    const draggedTagindex: number = parseInt(
      event.dataTransfer.getData('index')
    );
    const sameOrigin =
      event.dataTransfer.getData('origin') == this.model.model_id;

    // If something else than a tag was dropped, draggedTagindex should be NaN
    if (isNaN(draggedTagindex)) {
      return;
    }

    // If it's the same origin, the drag and drop results in a reordering
    if (sameOrigin) {
      const value: Array<any> = this.model.get('value');

      const newValue = [...value];

      // If the old position is on the left of the new position, we need to re-index the new position
      // after removing the tag at the old position
      if (draggedTagindex < index) {
        index--;
      }

      newValue.splice(draggedTagindex, 1); // Removing at the old position
      newValue.splice(index, 0, draggedTagValue); // Adding at the new one

      this.model.set('value', newValue);
      this.model.save_changes();

      return;
    }

    // Else we add a new tag with the given draggedTagValue
    this.addTag(index, draggedTagValue);
  }

  ondragover(event: DragEvent): void {
    // This is needed for the drag and drop to work
    event.preventDefault();
  }

  ondragenter(event: DragEvent, index: number): void {
    if (this.hoveredTag != null && this.hoveredTag != this.tags[index]) {
      this.hoveredTag.style.marginLeft = '1px';
    }

    this.hoveredTag = this.tags[index];
    this.hoveredTagIndex = index;
    this.hoveredTag.style.marginLeft = '30px';
  }

  ondragend(): void {
    if (this.hoveredTag != null) {
      this.hoveredTag.style.marginLeft = '1px';
    }
    this.hoveredTag = null;
    this.hoveredTagIndex = null;
  }

  /**
   * Select tags from `start` to `start + dx` not included.
   */
  select(start: number, dx: number): void {
    const valueLength = this.model.get('value').length;

    if (!this.selection) {
      this.selection = new Selection(start, dx, valueLength);
    } else {
      this.selection.updateSelection(dx);
    }
  }

  /**
   * Remove all the selected tags.
   */
  removeSelectedTags(): void {
    const value: Array<string> = [...this.model.get('value')];
    const valueLength = value.length;

    // It is simpler to remove from right to left
    for (let idx = valueLength - 1; idx >= 0; idx--) {
      if (this.selection != null && this.selection.isSelected(idx)) {
        value.splice(idx, 1);

        // Move the input to the left if we remove a tag that is before the input
        if (idx < this.inputIndex) {
          this.inputIndex--;
        }
      }
    }

    this.model.set('value', value);
    this.model.save_changes();
  }

  /**
   * Remove a tag given its index in the list
   */
  removeTag(tagIndex: number): void {
    const value: Array<string> = [...this.model.get('value')];

    value.splice(tagIndex, 1);

    // Move the input to the left if we remove a tag that is before the input
    if (tagIndex < this.inputIndex) {
      this.inputIndex--;
    }

    this.model.set('value', value);
    this.model.save_changes();
  }

  /**
   * Focus on the input element
   */
  focus(): void {
    this.taginputWrapper.style.display = 'inline-block';
    this.taginput.focus();
  }

  /**
   * Lose focus on the input element
   */
  loseFocus(): void {
    if (this.preventLoosingFocus) {
      return;
    }

    // Only hide the input if we have tags displayed
    if (this.model.get('value').length) {
      this.taginputWrapper.style.display = 'none';
    }

    this.selection = null;
    this.updateTags();
  }

  preinitialize() {
    // Must set this before the initialize method creates the element
    this.tagName = 'div';
  }

  /**
   * Validate an input tag typed by the user, returning the correct tag type. This should be overridden in subclasses.
   */
  validateValue(value: string): any {
    return value;
  }

  abstract createTag(value: any, index: number, selected: boolean): HTMLElement;
  abstract updateTag(
    tag: HTMLElement,
    value: any,
    index: number,
    selected: boolean
  ): void;

  el: HTMLDivElement;
  taginputWrapper: HTMLDivElement;
  taginput: HTMLInputElement;
  autocompleteList: HTMLDataListElement;
  tags: HTMLElement[];
  hoveredTag: HTMLElement | null = null;
  hoveredTagIndex: number | null = null;
  datalistID: string;
  inputIndex: number;
  selection: null | Selection;
  preventLoosingFocus: boolean;

  model: TagsInputBaseModel;
}

export class TagsInputModel extends TagsInputBaseModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      value: [],
      tag_style: '',
      _view_name: 'TagsInputView',
      _model_name: 'TagsInputModel',
    };
  }
}

export class TagsInputView extends TagsInputBaseView {
  /**
   * Create the string tag
   */
  createTag(value: string, index: number, selected: boolean): HTMLDivElement {
    const tag = document.createElement('div');
    const style: string = this.model.get('tag_style');

    tag.classList.add('jupyter-widget-tag');
    tag.classList.add(TagsInputView.class_map[style]);

    if (selected) {
      tag.classList.add('mod-active');
    }

    tag.appendChild(document.createTextNode(this.getTagText(value)));

    const i = document.createElement('i');
    i.classList.add('fa');
    i.classList.add('fa-times');
    i.classList.add('jupyter-widget-tag-close');
    tag.appendChild(i);

    i.onmousedown = ((index: number) => {
      return (): void => {
        this.removeTag(index);
        this.loseFocus();
      };
    })(index);

    return tag;
  }

  /**
   * Returns the text that should be displayed in the tag element
   */
  getTagText(value: string): string {
    return value;
  }

  /**
   * Update a given tag
   */
  updateTag(
    tag: HTMLDivElement,
    value: any,
    index: number,
    selected: boolean
  ): void {
    if (selected) {
      tag.classList.add('mod-active');
    } else {
      tag.classList.remove('mod-active');
    }
  }

  model: TagsInputModel;

  static class_map: Dict<string> = {
    primary: 'mod-primary',
    success: 'mod-success',
    info: 'mod-info',
    warning: 'mod-warning',
    danger: 'mod-danger',
  };
}

export class ColorsInputModel extends TagsInputBaseModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      value: [],
      _view_name: 'ColorsInputView',
      _model_name: 'ColorsInputModel',
    };
  }
}

export class ColorsInputView extends TagsInputBaseView {
  /**
   * Create the Color tag
   */
  createTag(value: string, index: number, selected: boolean): HTMLDivElement {
    const tag = document.createElement('div');
    const color = value;
    const darkerColor: string = d3Color.color(value)!.darker().toString();

    tag.classList.add('jupyter-widget-tag');
    tag.classList.add('jupyter-widget-colortag');

    if (!selected) {
      tag.style.backgroundColor = color;
    } else {
      tag.classList.add('mod-active');
      tag.style.backgroundColor = darkerColor;
    }

    const i = document.createElement('i');
    i.classList.add('fa');
    i.classList.add('fa-times');
    i.classList.add('jupyter-widget-tag-close');
    tag.appendChild(i);

    i.onmousedown = ((index: number) => {
      return (): void => {
        this.removeTag(index);
        this.loseFocus();
      };
    })(index);

    return tag;
  }

  /**
   * Update a given tag
   */
  updateTag(
    tag: HTMLDivElement,
    value: any,
    index: number,
    selected: boolean
  ): void {
    const color = value;
    const darkerColor: string = d3Color.color(value)!.darker().toString();

    if (!selected) {
      tag.classList.remove('mod-active');
      tag.style.backgroundColor = color;
    } else {
      tag.classList.add('mod-active');
      tag.style.backgroundColor = darkerColor;
    }
  }

  /**
   * Validate an input tag typed by the user, returning the correct tag type. This should be overridden in subclasses.
   */
  validateValue(value: string): any {
    if (d3Color.color(value) == null) {
      throw value + ' is not a valid Color';
    }

    return value;
  }

  model: ColorsInputModel;
}

abstract class NumbersInputModel extends TagsInputModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      min: null,
      max: null,
    };
  }
}

abstract class NumbersInputView extends TagsInputView {
  render(): void {
    // Initialize text formatter
    this.model.on('change:format', () => {
      this.formatter = d3Format.format(this.model.get('format'));
      this.update();
    });
    this.formatter = d3Format.format(this.model.get('format'));

    super.render();
  }

  /**
   * Returns the text that should be displayed in the tag element
   */
  getTagText(value: string): string {
    return this.formatter(this.parseNumber(value));
  }

  /**
   * Validate an input tag typed by the user, returning the correct tag type. This should be overridden in subclasses.
   */
  validateValue(value: string): any {
    const parsed = this.parseNumber(value);
    const min: number | null = this.model.get('min');
    const max: number | null = this.model.get('max');

    if (
      isNaN(parsed) ||
      (min != null && parsed < min) ||
      (max != null && parsed > max)
    ) {
      throw (
        value +
        ' is not a valid number, it should be in the range [' +
        min +
        ', ' +
        max +
        ']'
      );
    }

    return parsed;
  }

  abstract parseNumber(value: string): number;

  formatter: (value: number) => string;
}

export class FloatsInputModel extends NumbersInputModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'FloatsInputView',
      _model_name: 'FloatsInputModel',
      format: '.1f',
    };
  }
}

export class FloatsInputView extends NumbersInputView {
  parseNumber(value: string): number {
    return parseFloat(value);
  }

  model: FloatsInputModel;
}

export class IntsInputModel extends NumbersInputModel {
  defaults(): Backbone.ObjectHash {
    return {
      ...super.defaults(),
      _view_name: 'IntsInputView',
      _model_name: 'IntsInputModel',
      format: 'd',
    };
  }
}

export class IntsInputView extends NumbersInputView {
  parseNumber(value: string): number {
    const int = parseInt(value);
    if (int != parseFloat(value)) {
      throw value + ' should be an integer';
    }

    return int;
  }

  model: IntsInputModel;
}
