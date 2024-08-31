# Model State

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

### LayoutModel (@jupyter-widgets/base, 2.0.0); LayoutView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type                                                                                                                                                                        | Default                   | Help                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------- |
| `_model_module`         | string                                                                                                                                                                      | `'@jupyter-widgets/base'` | The namespace for the model.                                     |
| `_model_module_version` | string                                                                                                                                                                      | `'2.0.0'`                 | A semver requirement for namespace version containing the model. |
| `_model_name`           | string                                                                                                                                                                      | `'LayoutModel'`           |
| `_view_module`          | string                                                                                                                                                                      | `'@jupyter-widgets/base'` |
| `_view_module_version`  | string                                                                                                                                                                      | `'2.0.0'`                 |
| `_view_name`            | string                                                                                                                                                                      | `'LayoutView'`            |
| `align_content`         | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'space-between'`, `'space-around'`, `'space-evenly'`, `'stretch'`, `'inherit'`, `'initial'`, `'unset'`) | `null`                    | The align-content CSS attribute.                                 |
| `align_items`           | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'baseline'`, `'stretch'`, `'inherit'`, `'initial'`, `'unset'`)                                          | `null`                    | The align-items CSS attribute.                                   |
| `align_self`            | `null` or string (one of `'auto'`, `'flex-start'`, `'flex-end'`, `'center'`, `'baseline'`, `'stretch'`, `'inherit'`, `'initial'`, `'unset'`)                                | `null`                    | The align-self CSS attribute.                                    |
| `border_bottom`         | `null` or string                                                                                                                                                            | `null`                    | The border bottom CSS attribute.                                 |
| `border_left`           | `null` or string                                                                                                                                                            | `null`                    | The border left CSS attribute.                                   |
| `border_right`          | `null` or string                                                                                                                                                            | `null`                    | The border right CSS attribute.                                  |
| `border_top`            | `null` or string                                                                                                                                                            | `null`                    | The border top CSS attribute.                                    |
| `bottom`                | `null` or string                                                                                                                                                            | `null`                    | The bottom CSS attribute.                                        |
| `display`               | `null` or string                                                                                                                                                            | `null`                    | The display CSS attribute.                                       |
| `flex`                  | `null` or string                                                                                                                                                            | `null`                    | The flex CSS attribute.                                          |
| `flex_flow`             | `null` or string                                                                                                                                                            | `null`                    | The flex-flow CSS attribute.                                     |
| `grid_area`             | `null` or string                                                                                                                                                            | `null`                    | The grid-area CSS attribute.                                     |
| `grid_auto_columns`     | `null` or string                                                                                                                                                            | `null`                    | The grid-auto-columns CSS attribute.                             |
| `grid_auto_flow`        | `null` or string (one of `'column'`, `'row'`, `'row dense'`, `'column dense'`, `'inherit'`, `'initial'`, `'unset'`)                                                         | `null`                    | The grid-auto-flow CSS attribute.                                |
| `grid_auto_rows`        | `null` or string                                                                                                                                                            | `null`                    | The grid-auto-rows CSS attribute.                                |
| `grid_column`           | `null` or string                                                                                                                                                            | `null`                    | The grid-column CSS attribute.                                   |
| `grid_gap`              | `null` or string                                                                                                                                                            | `null`                    | The grid-gap CSS attribute.                                      |
| `grid_row`              | `null` or string                                                                                                                                                            | `null`                    | The grid-row CSS attribute.                                      |
| `grid_template_areas`   | `null` or string                                                                                                                                                            | `null`                    | The grid-template-areas CSS attribute.                           |
| `grid_template_columns` | `null` or string                                                                                                                                                            | `null`                    | The grid-template-columns CSS attribute.                         |
| `grid_template_rows`    | `null` or string                                                                                                                                                            | `null`                    | The grid-template-rows CSS attribute.                            |
| `height`                | `null` or string                                                                                                                                                            | `null`                    | The height CSS attribute.                                        |
| `justify_content`       | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'space-between'`, `'space-around'`, `'inherit'`, `'initial'`, `'unset'`)                                | `null`                    | The justify-content CSS attribute.                               |
| `justify_items`         | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'inherit'`, `'initial'`, `'unset'`)                                                                     | `null`                    | The justify-items CSS attribute.                                 |
| `left`                  | `null` or string                                                                                                                                                            | `null`                    | The left CSS attribute.                                          |
| `margin`                | `null` or string                                                                                                                                                            | `null`                    | The margin CSS attribute.                                        |
| `max_height`            | `null` or string                                                                                                                                                            | `null`                    | The max-height CSS attribute.                                    |
| `max_width`             | `null` or string                                                                                                                                                            | `null`                    | The max-width CSS attribute.                                     |
| `min_height`            | `null` or string                                                                                                                                                            | `null`                    | The min-height CSS attribute.                                    |
| `min_width`             | `null` or string                                                                                                                                                            | `null`                    | The min-width CSS attribute.                                     |
| `object_fit`            | `null` or string (one of `'contain'`, `'cover'`, `'fill'`, `'scale-down'`, `'none'`)                                                                                        | `null`                    | The object-fit CSS attribute.                                    |
| `object_position`       | `null` or string                                                                                                                                                            | `null`                    | The object-position CSS attribute.                               |
| `order`                 | `null` or string                                                                                                                                                            | `null`                    | The order CSS attribute.                                         |
| `overflow`              | `null` or string                                                                                                                                                            | `null`                    | The overflow CSS attribute.                                      |
| `padding`               | `null` or string                                                                                                                                                            | `null`                    | The padding CSS attribute.                                       |
| `right`                 | `null` or string                                                                                                                                                            | `null`                    | The right CSS attribute.                                         |
| `top`                   | `null` or string                                                                                                                                                            | `null`                    | The top CSS attribute.                                           |
| `visibility`            | `null` or string (one of `'visible'`, `'hidden'`, `'inherit'`, `'initial'`, `'unset'`)                                                                                      | `null`                    | The visibility CSS attribute.                                    |
| `width`                 | `null` or string                                                                                                                                                            | `null`                    | The width CSS attribute.                                         |

### AccordionModel (@jupyter-widgets/controls, 2.0.0); AccordionView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element                                                                                         |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'AccordionModel'`            |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'AccordionView'`             |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.                                                                                             |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                                                                                                           |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `selected_index`        | `null` or number (integer)                                           | `null`                        | The index of the selected page. This is either an integer selecting a particular sub-widget, or None to have no widgets selected. |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                                                                                                               |
| `titles`                | array of string                                                      | `[]`                          | Titles of the pages                                                                                                               |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                                                                                                                |

### AudioModel (@jupyter-widgets/controls, 2.0.0); AudioView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                       | Default                       | Help                                                                                |
| ----------------------- | -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `_dom_classes`          | array of string            | `[]`                          | CSS classes applied to widget DOM element                                           |
| `_model_module`         | string                     | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                     | `'2.0.0'`                     |
| `_model_name`           | string                     | `'AudioModel'`                |
| `_view_module`          | string                     | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                     | `'2.0.0'`                     |
| `_view_name`            | string                     | `'AudioView'`                 |
| `autoplay`              | boolean                    | `true`                        | When true, the audio starts when it's displayed                                     |
| `controls`              | boolean                    | `true`                        | Specifies that audio controls should be displayed (such as a play/pause button etc) |
| `format`                | string                     | `'mp3'`                       | The format of the audio.                                                            |
| `layout`                | reference to Layout widget | reference to new instance     |
| `loop`                  | boolean                    | `true`                        | When true, the audio will start from the beginning after finishing                  |
| `tabbable`              | `null` or boolean          | `null`                        | Is widget tabbable?                                                                 |
| `tooltip`               | `null` or string           | `null`                        | A tooltip caption.                                                                  |
| `value`                 | Bytes                      | `b''`                         | The media data as a memory view of bytes.                                           |

### BoundedFloatTextModel (@jupyter-widgets/controls, 2.0.0); FloatTextView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                                                                                         |
| ------------------------ | ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'BoundedFloatTextModel'`     |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'FloatTextView'`             |
| `continuous_update`      | boolean                              | `false`                       | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                               | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `max`                    | number (float)                       | `100.0`                       | Max value                                                                                                    |
| `min`                    | number (float)                       | `0.0`                         | Min value                                                                                                    |
| `step`                   | `null` or number (float)             | `null`                        | Minimum step to increment the value                                                                          |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                                                                                       |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | number (float)                       | `0.0`                         | Float value                                                                                                  |

### BoundedIntTextModel (@jupyter-widgets/controls, 2.0.0); IntTextView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                                                                                         |
| ------------------------ | ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'BoundedIntTextModel'`       |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'IntTextView'`               |
| `continuous_update`      | boolean                              | `false`                       | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                               | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `max`                    | number (integer)                     | `100`                         | Max value                                                                                                    |
| `min`                    | number (integer)                     | `0`                           | Min value                                                                                                    |
| `step`                   | number (integer)                     | `1`                           | Minimum step to increment the value                                                                          |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                                                                                       |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | number (integer)                     | `0`                           | Int value                                                                                                    |

### BoxModel (@jupyter-widgets/controls, 2.0.0); BoxView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                      |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'BoxModel'`                  |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'BoxView'`                   |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.     |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                   |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                        |

### ButtonModel (@jupyter-widgets/controls, 2.0.0); ButtonView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                              | Default                       | Help                                               |
| ----------------------- | --------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| `_dom_classes`          | array of string                                                                   | `[]`                          | CSS classes applied to widget DOM element          |
| `_model_module`         | string                                                                            | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                                            | `'2.0.0'`                     |
| `_model_name`           | string                                                                            | `'ButtonModel'`               |
| `_view_module`          | string                                                                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                                            | `'2.0.0'`                     |
| `_view_name`            | string                                                                            | `'ButtonView'`                |
| `button_style`          | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the button.           |
| `description`           | string                                                                            | `''`                          | Button label.                                      |
| `disabled`              | boolean                                                                           | `false`                       | Enable or disable user changes.                    |
| `icon`                  | string                                                                            | `''`                          | Font-awesome icon names, without the 'fa-' prefix. |
| `layout`                | reference to Layout widget                                                        | reference to new instance     |
| `style`                 | reference to ButtonStyle widget                                                   | reference to new instance     |
| `tabbable`              | `null` or boolean                                                                 | `null`                        | Is widget tabbable?                                |
| `tooltip`               | `null` or string                                                                  | `null`                        | A tooltip caption.                                 |

### ButtonStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                      |
| ----------------------- | ---------------- | ----------------------------- | ------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'ButtonStyleModel'`          |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `button_color`          | `null` or string | `null`                        | Color of the button       |
| `font_family`           | `null` or string | `null`                        | Button text font family.  |
| `font_size`             | `null` or string | `null`                        | Button text font size.    |
| `font_style`            | `null` or string | `null`                        | Button text font style.   |
| `font_variant`          | `null` or string | `null`                        | Button text font variant. |
| `font_weight`           | `null` or string | `null`                        | Button text font weight.  |
| `text_color`            | `null` or string | `null`                        | Button text color.        |
| `text_decoration`       | `null` or string | `null`                        | Button text decoration.   |

### CheckboxModel (@jupyter-widgets/controls, 2.0.0); CheckboxView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                              | Default                       | Help                                                                |
| ------------------------ | --------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| `_dom_classes`           | array of string                   | `[]`                          | CSS classes applied to widget DOM element                           |
| `_model_module`          | string                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                            | `'2.0.0'`                     |
| `_model_name`            | string                            | `'CheckboxModel'`             |
| `_view_module`           | string                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                            | `'2.0.0'`                     |
| `_view_name`             | string                            | `'CheckboxView'`              |
| `description`            | string                            | `''`                          | Description of the control.                                         |
| `description_allow_html` | boolean                           | `false`                       | Accept HTML in the description.                                     |
| `disabled`               | boolean                           | `false`                       | Enable or disable user changes.                                     |
| `indent`                 | boolean                           | `true`                        | Indent the control to align with other controls with a description. |
| `layout`                 | reference to Layout widget        | reference to new instance     |
| `style`                  | reference to CheckboxStyle widget | reference to new instance     | Styling customizations                                              |
| `tabbable`               | `null` or boolean                 | `null`                        | Is widget tabbable?                                                 |
| `tooltip`                | `null` or string                  | `null`                        | A tooltip caption.                                                  |
| `value`                  | boolean                           | `false`                       | Bool value                                                          |

### CheckboxStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'CheckboxStyleModel'`        |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `background`            | `null` or string | `null`                        | Background specifications.                           |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |

### ColorPickerModel (@jupyter-widgets/controls, 2.0.0); ColorPickerView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                              |
| ------------------------ | ------------------------------------ | ----------------------------- | ------------------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element         |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'ColorPickerModel'`          |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'ColorPickerView'`           |
| `concise`                | boolean                              | `false`                       | Display short version with just a color selector. |
| `description`            | string                               | `''`                          | Description of the control.                       |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.                   |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes.                   |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                            |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                               |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                                |
| `value`                  | string                               | `'black'`                     | The color value.                                  |

### ColorsInputModel (@jupyter-widgets/controls, 2.0.0); ColorsInputView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'ColorsInputModel'`          |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'ColorsInputView'`           |
| `allow_duplicates`       | boolean                              | `true`                        |
| `allowed_tags`           | array                                | `[]`                          |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `placeholder`            | string                               | `'\u200b'`                    |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |
| `value`                  | array                                | `[]`                          | List of string tags                       |

### ComboboxModel (@jupyter-widgets/controls, 2.0.0); ComboboxView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                          | Default                       | Help                                                                                                         |
| ------------------------ | ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string               | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                        | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                        | `'2.0.0'`                     |
| `_model_name`            | string                        | `'ComboboxModel'`             |
| `_view_module`           | string                        | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                        | `'2.0.0'`                     |
| `_view_name`             | string                        | `'ComboboxView'`              |
| `continuous_update`      | boolean                       | `true`                        | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                        | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                       | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                       | `false`                       | Enable or disable user changes                                                                               |
| `ensure_option`          | boolean                       | `false`                       | If set, ensure value is in options. Implies continuous_update=False.                                         |
| `layout`                 | reference to Layout widget    | reference to new instance     |
| `options`                | array of string               | `[]`                          | Dropdown options for the combobox                                                                            |
| `placeholder`            | string                        | `'\u200b'`                    | Placeholder text to display when nothing has been typed                                                      |
| `style`                  | reference to TextStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean             | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string              | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | string                        | `''`                          | String value                                                                                                 |

### ControllerAxisModel (@jupyter-widgets/controls, 2.0.0); ControllerAxisView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                       | Default                       | Help                                      |
| ----------------------- | -------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string            | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                     | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                     | `'2.0.0'`                     |
| `_model_name`           | string                     | `'ControllerAxisModel'`       |
| `_view_module`          | string                     | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                     | `'2.0.0'`                     |
| `_view_name`            | string                     | `'ControllerAxisView'`        |
| `layout`                | reference to Layout widget | reference to new instance     |
| `tabbable`              | `null` or boolean          | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string           | `null`                        | A tooltip caption.                        |
| `value`                 | number (float)             | `0.0`                         | The value of the axis.                    |

### ControllerButtonModel (@jupyter-widgets/controls, 2.0.0); ControllerButtonView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                       | Default                       | Help                                      |
| ----------------------- | -------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string            | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                     | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                     | `'2.0.0'`                     |
| `_model_name`           | string                     | `'ControllerButtonModel'`     |
| `_view_module`          | string                     | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                     | `'2.0.0'`                     |
| `_view_name`            | string                     | `'ControllerButtonView'`      |
| `layout`                | reference to Layout widget | reference to new instance     |
| `pressed`               | boolean                    | `false`                       | Whether the button is pressed.            |
| `tabbable`              | `null` or boolean          | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string           | `null`                        | A tooltip caption.                        |
| `value`                 | number (float)             | `0.0`                         | The value of the button.                  |

### ControllerModel (@jupyter-widgets/controls, 2.0.0); ControllerView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                | Default                       | Help                                                  |
| ----------------------- | ----------------------------------- | ----------------------------- | ----------------------------------------------------- |
| `_dom_classes`          | array of string                     | `[]`                          | CSS classes applied to widget DOM element             |
| `_model_module`         | string                              | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                              | `'2.0.0'`                     |
| `_model_name`           | string                              | `'ControllerModel'`           |
| `_view_module`          | string                              | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                              | `'2.0.0'`                     |
| `_view_name`            | string                              | `'ControllerView'`            |
| `axes`                  | array of reference to Axis widget   | `[]`                          | The axes on the gamepad.                              |
| `buttons`               | array of reference to Button widget | `[]`                          | The buttons on the gamepad.                           |
| `connected`             | boolean                             | `false`                       | Whether the gamepad is connected.                     |
| `index`                 | number (integer)                    | `0`                           | The id number of the controller.                      |
| `layout`                | reference to Layout widget          | reference to new instance     |
| `mapping`               | string                              | `''`                          | The name of the control mapping.                      |
| `name`                  | string                              | `''`                          | The name of the controller.                           |
| `tabbable`              | `null` or boolean                   | `null`                        | Is widget tabbable?                                   |
| `timestamp`             | number (float)                      | `0.0`                         | The last time the data from this gamepad was updated. |
| `tooltip`               | `null` or string                    | `null`                        | A tooltip caption.                                    |

### DOMWidgetModel (@jupyter-widgets/controls, 2.0.0); None (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                       | Default                       | Help                                      |
| ----------------------- | -------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string            | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                     | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                     | `'2.0.0'`                     |
| `_model_name`           | string                     | `'DOMWidgetModel'`            |
| `_view_module`          | string                     | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                     | `'2.0.0'`                     |
| `_view_name`            | `null` or string           | `null`                        | Name of the view.                         |
| `layout`                | reference to Layout widget | reference to new instance     |
| `tabbable`              | `null` or boolean          | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string           | `null`                        | A tooltip caption.                        |
| `value`                 | Bytes                      | `b''`                         | The media data as a memory view of bytes. |

### DatePickerModel (@jupyter-widgets/controls, 2.0.0); DatePickerView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                        | Default                       | Help                                                    |
| ------------------------ | ------------------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `_dom_classes`           | array of string                             | `[]`                          | CSS classes applied to widget DOM element               |
| `_model_module`          | string                                      | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                      | `'2.0.0'`                     |
| `_model_name`            | string                                      | `'DatePickerModel'`           |
| `_view_module`           | string                                      | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                      | `'2.0.0'`                     |
| `_view_name`             | string                                      | `'DatePickerView'`            |
| `description`            | string                                      | `''`                          | Description of the control.                             |
| `description_allow_html` | boolean                                     | `false`                       | Accept HTML in the description.                         |
| `disabled`               | boolean                                     | `false`                       | Enable or disable user changes.                         |
| `layout`                 | reference to Layout widget                  | reference to new instance     |
| `max`                    | `null` or Date                              | `null`                        |
| `min`                    | `null` or Date                              | `null`                        |
| `step`                   | number (integer) or string (one of `'any'`) | `1`                           | The date step to use for the picker, in days, or "any". |
| `style`                  | reference to DescriptionStyle widget        | reference to new instance     | Styling customizations                                  |
| `tabbable`               | `null` or boolean                           | `null`                        | Is widget tabbable?                                     |
| `tooltip`                | `null` or string                            | `null`                        | A tooltip caption.                                      |
| `value`                  | `null` or Date                              | `null`                        |

### DatetimeModel (@jupyter-widgets/controls, 2.0.0); DatetimeView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'DatetimeModel'`             |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'DatetimeView'`              |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes.           |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `max`                    | `null` or Datetime                   | `null`                        |
| `min`                    | `null` or Datetime                   | `null`                        |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |
| `value`                  | `null` or Datetime                   | `null`                        |

### DescriptionStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type   | Default                       | Help                                                 |
| ----------------------- | ------ | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string | `'2.0.0'`                     |
| `_model_name`           | string | `'DescriptionStyleModel'`     |
| `_view_module`          | string | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string | `'2.0.0'`                     |
| `_view_name`            | string | `'StyleView'`                 |
| `description_width`     | string | `''`                          | Width of the description to the side of the control. |

### DirectionalLinkModel (@jupyter-widgets/controls, 2.0.0); None (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type             | Default                       | Help                                   |
| ----------------------- | ---------------- | ----------------------------- | -------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'DirectionalLinkModel'`      |
| `_view_module`          | string           | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | `null` or string | `null`                        | Name of the view.                      |
| `source`                | array            | `[]`                          | The source (widget, 'trait_name') pair |
| `target`                | array            | `[]`                          | The target (widget, 'trait_name') pair |

### DropdownModel (@jupyter-widgets/controls, 2.0.0); DropdownView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'DropdownModel'`             |
| `_options_labels`        | array of string                      | `[]`                          | The labels for the options.               |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'DropdownView'`              |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes            |
| `index`                  | `null` or number (integer)           | `null`                        | Selected index                            |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |

### FileUploadModel (@jupyter-widgets/controls, 2.0.0); FileUploadView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                              | Default                       | Help                                              |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| `_dom_classes`           | array of string                                                                   | `[]`                          | CSS classes applied to widget DOM element         |
| `_model_module`          | string                                                                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                            | `'2.0.0'`                     |
| `_model_name`            | string                                                                            | `'FileUploadModel'`           |
| `_view_module`           | string                                                                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                            | `'2.0.0'`                     |
| `_view_name`             | string                                                                            | `'FileUploadView'`            |
| `accept`                 | string                                                                            | `''`                          | File types to accept, empty string for all        |
| `button_style`           | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the button.          |
| `description`            | string                                                                            | `''`                          | Description of the control.                       |
| `description_allow_html` | boolean                                                                           | `false`                       | Accept HTML in the description.                   |
| `disabled`               | boolean                                                                           | `false`                       | Enable or disable button                          |
| `error`                  | string                                                                            | `''`                          | Error message                                     |
| `icon`                   | string                                                                            | `'upload'`                    | Font-awesome icon name, without the 'fa-' prefix. |
| `layout`                 | reference to Layout widget                                                        | reference to new instance     |
| `multiple`               | boolean                                                                           | `false`                       | If True, allow for multiple files upload          |
| `style`                  | reference to ButtonStyle widget                                                   | reference to new instance     |
| `tabbable`               | `null` or boolean                                                                 | `null`                        | Is widget tabbable?                               |
| `tooltip`                | `null` or string                                                                  | `null`                        | A tooltip caption.                                |
| `value`                  | array of object                                                                   | `[]`                          | The file upload value                             |

### FloatLogSliderModel (@jupyter-widgets/controls, 2.0.0); FloatLogSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'FloatLogSliderModel'`       |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'FloatLogSliderView'`        |
| `base`                   | number (float)                                                           | `10.0`                        | Base for the logarithm                                            |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is holding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `max`                    | number (float)                                                           | `4.0`                         | Max value for the exponent                                        |
| `min`                    | number (float)                                                           | `0.0`                         | Min value for the exponent                                        |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current value of the slider next to it.               |
| `readout_format`         | string                                                                   | `'.3g'`                       | Format for the readout                                            |
| `step`                   | `null` or number (float)                                                 | `0.1`                         | Minimum step in the exponent to increment the value               |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |
| `value`                  | number (float)                                                           | `1.0`                         | Float value                                                       |

### FloatProgressModel (@jupyter-widgets/controls, 2.0.0); ProgressView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                           | Default                       | Help                                           |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------- |
| `_dom_classes`           | array of string                                                                | `[]`                          | CSS classes applied to widget DOM element      |
| `_model_module`          | string                                                                         | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                         | `'2.0.0'`                     |
| `_model_name`            | string                                                                         | `'FloatProgressModel'`        |
| `_view_module`           | string                                                                         | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                         | `'2.0.0'`                     |
| `_view_name`             | string                                                                         | `'ProgressView'`              |
| `bar_style`              | `null` or string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the progress bar. |
| `description`            | string                                                                         | `''`                          | Description of the control.                    |
| `description_allow_html` | boolean                                                                        | `false`                       | Accept HTML in the description.                |
| `layout`                 | reference to Layout widget                                                     | reference to new instance     |
| `max`                    | number (float)                                                                 | `100.0`                       | Max value                                      |
| `min`                    | number (float)                                                                 | `0.0`                         | Min value                                      |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                                   | `'horizontal'`                | Vertical or horizontal.                        |
| `style`                  | reference to ProgressStyle widget                                              | reference to new instance     |
| `tabbable`               | `null` or boolean                                                              | `null`                        | Is widget tabbable?                            |
| `tooltip`                | `null` or string                                                               | `null`                        | A tooltip caption.                             |
| `value`                  | number (float)                                                                 | `0.0`                         | Float value                                    |

### FloatRangeSliderModel (@jupyter-widgets/controls, 2.0.0); FloatRangeSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'FloatRangeSliderModel'`     |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'FloatRangeSliderView'`      |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is sliding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `max`                    | number (float)                                                           | `100.0`                       | Max value                                                         |
| `min`                    | number (float)                                                           | `0.0`                         | Min value                                                         |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current value of the slider next to it.               |
| `readout_format`         | string                                                                   | `'.2f'`                       | Format for the readout                                            |
| `step`                   | `null` or number (float)                                                 | `0.1`                         | Minimum step to increment the value                               |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |
| `value`                  | array                                                                    | `[0.0, 1.0]`                  | Tuple of (lower, upper) bounds                                    |

### FloatSliderModel (@jupyter-widgets/controls, 2.0.0); FloatSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'FloatSliderModel'`          |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'FloatSliderView'`           |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is holding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `max`                    | number (float)                                                           | `100.0`                       | Max value                                                         |
| `min`                    | number (float)                                                           | `0.0`                         | Min value                                                         |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current value of the slider next to it.               |
| `readout_format`         | string                                                                   | `'.2f'`                       | Format for the readout                                            |
| `step`                   | `null` or number (float)                                                 | `0.1`                         | Minimum step to increment the value                               |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |
| `value`                  | number (float)                                                           | `0.0`                         | Float value                                                       |

### FloatTextModel (@jupyter-widgets/controls, 2.0.0); FloatTextView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                                                                                         |
| ------------------------ | ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'FloatTextModel'`            |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'FloatTextView'`             |
| `continuous_update`      | boolean                              | `false`                       | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                               | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `step`                   | `null` or number (float)             | `null`                        | Minimum step to increment the value                                                                          |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                                                                                       |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | number (float)                       | `0.0`                         | Float value                                                                                                  |

### FloatsInputModel (@jupyter-widgets/controls, 2.0.0); FloatsInputView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                              | Default                       | Help                                      |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                                                                   | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                                                                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                            | `'2.0.0'`                     |
| `_model_name`            | string                                                                            | `'FloatsInputModel'`          |
| `_view_module`           | string                                                                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                            | `'2.0.0'`                     |
| `_view_name`             | string                                                                            | `'FloatsInputView'`           |
| `allow_duplicates`       | boolean                                                                           | `true`                        |
| `allowed_tags`           | array                                                                             | `[]`                          |
| `description`            | string                                                                            | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                                                                           | `false`                       | Accept HTML in the description.           |
| `format`                 | string                                                                            | `'.1f'`                       |
| `layout`                 | reference to Layout widget                                                        | reference to new instance     |
| `max`                    | `null` or number (float)                                                          | `null`                        |
| `min`                    | `null` or number (float)                                                          | `null`                        |
| `placeholder`            | string                                                                            | `'\u200b'`                    |
| `style`                  | reference to DescriptionStyle widget                                              | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                                                                 | `null`                        | Is widget tabbable?                       |
| `tag_style`              | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the tags.    |
| `tooltip`                | `null` or string                                                                  | `null`                        | A tooltip caption.                        |
| `value`                  | array                                                                             | `[]`                          | List of float tags                        |

### GridBoxModel (@jupyter-widgets/controls, 2.0.0); GridBoxView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                      |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'GridBoxModel'`              |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'GridBoxView'`               |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.     |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                   |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                        |

### HBoxModel (@jupyter-widgets/controls, 2.0.0); HBoxView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                      |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'HBoxModel'`                 |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'HBoxView'`                  |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.     |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                   |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                        |

### HTMLMathModel (@jupyter-widgets/controls, 2.0.0); HTMLMathView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                              | Default                       | Help                                                    |
| ------------------------ | --------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `_dom_classes`           | array of string                   | `[]`                          | CSS classes applied to widget DOM element               |
| `_model_module`          | string                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                            | `'2.0.0'`                     |
| `_model_name`            | string                            | `'HTMLMathModel'`             |
| `_view_module`           | string                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                            | `'2.0.0'`                     |
| `_view_name`             | string                            | `'HTMLMathView'`              |
| `description`            | string                            | `''`                          | Description of the control.                             |
| `description_allow_html` | boolean                           | `false`                       | Accept HTML in the description.                         |
| `layout`                 | reference to Layout widget        | reference to new instance     |
| `placeholder`            | string                            | `'\u200b'`                    | Placeholder text to display when nothing has been typed |
| `style`                  | reference to HTMLMathStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean                 | `null`                        | Is widget tabbable?                                     |
| `tooltip`                | `null` or string                  | `null`                        | A tooltip caption.                                      |
| `value`                  | string                            | `''`                          | String value                                            |

### HTMLMathStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'HTMLMathStyleModel'`        |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `background`            | `null` or string | `null`                        | Background specifications.                           |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |
| `font_size`             | `null` or string | `null`                        | Text font size.                                      |
| `text_color`            | `null` or string | `null`                        | Text color                                           |

### HTMLModel (@jupyter-widgets/controls, 2.0.0); HTMLView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                          | Default                       | Help                                                    |
| ------------------------ | ----------------------------- | ----------------------------- | ------------------------------------------------------- |
| `_dom_classes`           | array of string               | `[]`                          | CSS classes applied to widget DOM element               |
| `_model_module`          | string                        | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                        | `'2.0.0'`                     |
| `_model_name`            | string                        | `'HTMLModel'`                 |
| `_view_module`           | string                        | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                        | `'2.0.0'`                     |
| `_view_name`             | string                        | `'HTMLView'`                  |
| `description`            | string                        | `''`                          | Description of the control.                             |
| `description_allow_html` | boolean                       | `false`                       | Accept HTML in the description.                         |
| `layout`                 | reference to Layout widget    | reference to new instance     |
| `placeholder`            | string                        | `'\u200b'`                    | Placeholder text to display when nothing has been typed |
| `style`                  | reference to HTMLStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean             | `null`                        | Is widget tabbable?                                     |
| `tooltip`                | `null` or string              | `null`                        | A tooltip caption.                                      |
| `value`                  | string                        | `''`                          | String value                                            |

### HTMLStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'HTMLStyleModel'`            |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `background`            | `null` or string | `null`                        | Background specifications.                           |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |
| `font_size`             | `null` or string | `null`                        | Text font size.                                      |
| `text_color`            | `null` or string | `null`                        | Text color                                           |

### ImageModel (@jupyter-widgets/controls, 2.0.0); ImageView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                       | Default                       | Help                                                                     |
| ----------------------- | -------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `_dom_classes`          | array of string            | `[]`                          | CSS classes applied to widget DOM element                                |
| `_model_module`         | string                     | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                     | `'2.0.0'`                     |
| `_model_name`           | string                     | `'ImageModel'`                |
| `_view_module`          | string                     | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                     | `'2.0.0'`                     |
| `_view_name`            | string                     | `'ImageView'`                 |
| `format`                | string                     | `'png'`                       | The format of the image.                                                 |
| `height`                | string                     | `''`                          | Height of the image in pixels. Use layout.height for styling the widget. |
| `layout`                | reference to Layout widget | reference to new instance     |
| `tabbable`              | `null` or boolean          | `null`                        | Is widget tabbable?                                                      |
| `tooltip`               | `null` or string           | `null`                        | A tooltip caption.                                                       |
| `value`                 | Bytes                      | `b''`                         | The media data as a memory view of bytes.                                |
| `width`                 | string                     | `''`                          | Width of the image in pixels. Use layout.width for styling the widget.   |

### IntProgressModel (@jupyter-widgets/controls, 2.0.0); ProgressView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                 | Default                       | Help                                           |
| ------------------------ | -------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------- |
| `_dom_classes`           | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element      |
| `_model_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                               | `'2.0.0'`                     |
| `_model_name`            | string                                                               | `'IntProgressModel'`          |
| `_view_module`           | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                               | `'2.0.0'`                     |
| `_view_name`             | string                                                               | `'ProgressView'`              |
| `bar_style`              | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the progress bar. |
| `description`            | string                                                               | `''`                          | Description of the control.                    |
| `description_allow_html` | boolean                                                              | `false`                       | Accept HTML in the description.                |
| `layout`                 | reference to Layout widget                                           | reference to new instance     |
| `max`                    | number (integer)                                                     | `100`                         | Max value                                      |
| `min`                    | number (integer)                                                     | `0`                           | Min value                                      |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                         | `'horizontal'`                | Vertical or horizontal.                        |
| `style`                  | reference to ProgressStyle widget                                    | reference to new instance     |
| `tabbable`               | `null` or boolean                                                    | `null`                        | Is widget tabbable?                            |
| `tooltip`                | `null` or string                                                     | `null`                        | A tooltip caption.                             |
| `value`                  | number (integer)                                                     | `0`                           | Int value                                      |

### IntRangeSliderModel (@jupyter-widgets/controls, 2.0.0); IntRangeSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'IntRangeSliderModel'`       |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'IntRangeSliderView'`        |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is sliding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `max`                    | number (integer)                                                         | `100`                         | Max value                                                         |
| `min`                    | number (integer)                                                         | `0`                           | Min value                                                         |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current value of the slider next to it.               |
| `readout_format`         | string                                                                   | `'d'`                         | Format for the readout                                            |
| `step`                   | number (integer)                                                         | `1`                           | Minimum step that the value can take                              |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     | Slider style customizations.                                      |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |
| `value`                  | array                                                                    | `[0, 1]`                      | Tuple of (lower, upper) bounds                                    |

### IntSliderModel (@jupyter-widgets/controls, 2.0.0); IntSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'IntSliderModel'`            |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'IntSliderView'`             |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is holding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `max`                    | number (integer)                                                         | `100`                         | Max value                                                         |
| `min`                    | number (integer)                                                         | `0`                           | Min value                                                         |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current value of the slider next to it.               |
| `readout_format`         | string                                                                   | `'d'`                         | Format for the readout                                            |
| `step`                   | number (integer)                                                         | `1`                           | Minimum step to increment the value                               |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |
| `value`                  | number (integer)                                                         | `0`                           | Int value                                                         |

### IntTextModel (@jupyter-widgets/controls, 2.0.0); IntTextView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                                                                                         |
| ------------------------ | ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'IntTextModel'`              |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'IntTextView'`               |
| `continuous_update`      | boolean                              | `false`                       | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                               | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `step`                   | number (integer)                     | `1`                           | Minimum step to increment the value                                                                          |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                                                                                       |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | number (integer)                     | `0`                           | Int value                                                                                                    |

### IntsInputModel (@jupyter-widgets/controls, 2.0.0); IntsInputView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                              | Default                       | Help                                      |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                                                                   | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                                                                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                            | `'2.0.0'`                     |
| `_model_name`            | string                                                                            | `'IntsInputModel'`            |
| `_view_module`           | string                                                                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                            | `'2.0.0'`                     |
| `_view_name`             | string                                                                            | `'IntsInputView'`             |
| `allow_duplicates`       | boolean                                                                           | `true`                        |
| `allowed_tags`           | array                                                                             | `[]`                          |
| `description`            | string                                                                            | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                                                                           | `false`                       | Accept HTML in the description.           |
| `format`                 | string                                                                            | `'d'`                         |
| `layout`                 | reference to Layout widget                                                        | reference to new instance     |
| `max`                    | `null` or number (integer)                                                        | `null`                        |
| `min`                    | `null` or number (integer)                                                        | `null`                        |
| `placeholder`            | string                                                                            | `'\u200b'`                    |
| `style`                  | reference to DescriptionStyle widget                                              | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                                                                 | `null`                        | Is widget tabbable?                       |
| `tag_style`              | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the tags.    |
| `tooltip`                | `null` or string                                                                  | `null`                        | A tooltip caption.                        |
| `value`                  | array                                                                             | `[]`                          | List of int tags                          |

### LabelModel (@jupyter-widgets/controls, 2.0.0); LabelView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                           | Default                       | Help                                                    |
| ------------------------ | ------------------------------ | ----------------------------- | ------------------------------------------------------- |
| `_dom_classes`           | array of string                | `[]`                          | CSS classes applied to widget DOM element               |
| `_model_module`          | string                         | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                         | `'2.0.0'`                     |
| `_model_name`            | string                         | `'LabelModel'`                |
| `_view_module`           | string                         | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                         | `'2.0.0'`                     |
| `_view_name`             | string                         | `'LabelView'`                 |
| `description`            | string                         | `''`                          | Description of the control.                             |
| `description_allow_html` | boolean                        | `false`                       | Accept HTML in the description.                         |
| `layout`                 | reference to Layout widget     | reference to new instance     |
| `placeholder`            | string                         | `'\u200b'`                    | Placeholder text to display when nothing has been typed |
| `style`                  | reference to LabelStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean              | `null`                        | Is widget tabbable?                                     |
| `tooltip`                | `null` or string               | `null`                        | A tooltip caption.                                      |
| `value`                  | string                         | `''`                          | String value                                            |

### LabelStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'LabelStyleModel'`           |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `background`            | `null` or string | `null`                        | Background specifications.                           |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |
| `font_family`           | `null` or string | `null`                        | Label text font family.                              |
| `font_size`             | `null` or string | `null`                        | Text font size.                                      |
| `font_style`            | `null` or string | `null`                        | Label text font style.                               |
| `font_variant`          | `null` or string | `null`                        | Label text font variant.                             |
| `font_weight`           | `null` or string | `null`                        | Label text font weight.                              |
| `text_color`            | `null` or string | `null`                        | Text color                                           |
| `text_decoration`       | `null` or string | `null`                        | Label text decoration.                               |

### LinkModel (@jupyter-widgets/controls, 2.0.0); None (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type             | Default                       | Help                                   |
| ----------------------- | ---------------- | ----------------------------- | -------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'LinkModel'`                 |
| `_view_module`          | string           | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | `null` or string | `null`                        | Name of the view.                      |
| `source`                | array            | `[]`                          | The source (widget, 'trait_name') pair |
| `target`                | array            | `[]`                          | The target (widget, 'trait_name') pair |

### NaiveDatetimeModel (@jupyter-widgets/controls, 2.0.0); DatetimeView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'NaiveDatetimeModel'`        |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'DatetimeView'`              |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes.           |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `max`                    | `null` or Datetime                   | `null`                        |
| `min`                    | `null` or Datetime                   | `null`                        |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |
| `value`                  | `null` or Datetime                   | `null`                        |

### PasswordModel (@jupyter-widgets/controls, 2.0.0); PasswordView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                          | Default                       | Help                                                                                                         |
| ------------------------ | ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string               | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                        | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                        | `'2.0.0'`                     |
| `_model_name`            | string                        | `'PasswordModel'`             |
| `_view_module`           | string                        | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                        | `'2.0.0'`                     |
| `_view_name`             | string                        | `'PasswordView'`              |
| `continuous_update`      | boolean                       | `true`                        | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                        | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                       | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                       | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget    | reference to new instance     |
| `placeholder`            | string                        | `'\u200b'`                    | Placeholder text to display when nothing has been typed                                                      |
| `style`                  | reference to TextStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean             | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string              | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | string                        | `''`                          | String value                                                                                                 |

### PlayModel (@jupyter-widgets/controls, 2.0.0); PlayView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                                  |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element             |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'PlayModel'`                 |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'PlayView'`                  |
| `description`            | string                               | `''`                          | Description of the control.                           |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.                       |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes                        |
| `interval`               | number (integer)                     | `100`                         | The time between two animation steps (ms).            |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `max`                    | number (integer)                     | `100`                         | Max value                                             |
| `min`                    | number (integer)                     | `0`                           | Min value                                             |
| `playing`                | boolean                              | `false`                       | Whether the control is currently playing.             |
| `repeat`                 | boolean                              | `false`                       | Whether the control will repeat in a continuous loop. |
| `show_repeat`            | boolean                              | `true`                        | Show the repeat toggle button in the widget.          |
| `step`                   | number (integer)                     | `1`                           | Increment step                                        |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                                |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                                   |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                                    |
| `value`                  | number (integer)                     | `0`                           | Int value                                             |

### ProgressStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'ProgressStyleModel'`        |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `bar_color`             | `null` or string | `null`                        | Color of the progress bar.                           |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |

### RadioButtonsModel (@jupyter-widgets/controls, 2.0.0); RadioButtonsView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                         | Default                       | Help                                      |
| ------------------------ | -------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                              | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                                       | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                       | `'2.0.0'`                     |
| `_model_name`            | string                                       | `'RadioButtonsModel'`         |
| `_options_labels`        | array of string                              | `[]`                          | The labels for the options.               |
| `_view_module`           | string                                       | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                       | `'2.0.0'`                     |
| `_view_name`             | string                                       | `'RadioButtonsView'`          |
| `description`            | string                                       | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                                      | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                                      | `false`                       | Enable or disable user changes            |
| `index`                  | `null` or number (integer)                   | `null`                        | Selected index                            |
| `layout`                 | reference to Layout widget                   | reference to new instance     |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`) | `'vertical'`                  | Vertical or horizontal.                   |
| `style`                  | reference to DescriptionStyle widget         | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                            | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                             | `null`                        | A tooltip caption.                        |

### SelectModel (@jupyter-widgets/controls, 2.0.0); SelectView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'SelectModel'`               |
| `_options_labels`        | array of string                      | `[]`                          | The labels for the options.               |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'SelectView'`                |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes            |
| `index`                  | `null` or number (integer)           | `null`                        | Selected index                            |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `rows`                   | number (integer)                     | `5`                           | The number of rows to display.            |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |

### SelectMultipleModel (@jupyter-widgets/controls, 2.0.0); SelectMultipleView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'SelectMultipleModel'`       |
| `_options_labels`        | array of string                      | `[]`                          | The labels for the options.               |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'SelectMultipleView'`        |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes            |
| `index`                  | array of number (integer)            | `[]`                          | Selected indices                          |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `rows`                   | number (integer)                     | `5`                           | The number of rows to display.            |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |

### SelectionRangeSliderModel (@jupyter-widgets/controls, 2.0.0); SelectionRangeSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'SelectionRangeSliderModel'` |
| `_options_labels`        | array of string                                                          | `[]`                          | The labels for the options.                                       |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'SelectionRangeSliderView'`  |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is holding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `index`                  | array                                                                    | `[0, 0]`                      | Min and max selected indices                                      |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current selected label next to the slider             |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |

### SelectionSliderModel (@jupyter-widgets/controls, 2.0.0); SelectionSliderView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                     | Default                       | Help                                                              |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                          | `[]`                          | CSS classes applied to widget DOM element                         |
| `_model_module`          | string                                                                   | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                   | `'2.0.0'`                     |
| `_model_name`            | string                                                                   | `'SelectionSliderModel'`      |
| `_options_labels`        | array of string                                                          | `[]`                          | The labels for the options.                                       |
| `_view_module`           | string                                                                   | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                   | `'2.0.0'`                     |
| `_view_name`             | string                                                                   | `'SelectionSliderView'`       |
| `behavior`               | string (one of `'drag-tap'`, `'drag-snap'`, `'tap'`, `'drag'`, `'snap'`) | `'drag-tap'`                  | Slider dragging behavior.                                         |
| `continuous_update`      | boolean                                                                  | `true`                        | Update the value of the widget as the user is holding the slider. |
| `description`            | string                                                                   | `''`                          | Description of the control.                                       |
| `description_allow_html` | boolean                                                                  | `false`                       | Accept HTML in the description.                                   |
| `disabled`               | boolean                                                                  | `false`                       | Enable or disable user changes                                    |
| `index`                  | number (integer)                                                         | `0`                           | Selected index                                                    |
| `layout`                 | reference to Layout widget                                               | reference to new instance     |
| `orientation`            | string (one of `'horizontal'`, `'vertical'`)                             | `'horizontal'`                | Vertical or horizontal.                                           |
| `readout`                | boolean                                                                  | `true`                        | Display the current selected label next to the slider             |
| `style`                  | reference to SliderStyle widget                                          | reference to new instance     |
| `tabbable`               | `null` or boolean                                                        | `null`                        | Is widget tabbable?                                               |
| `tooltip`                | `null` or string                                                         | `null`                        | A tooltip caption.                                                |

### SliderStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'SliderStyleModel'`          |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |
| `handle_color`          | `null` or string | `null`                        | Color of the slider handle.                          |

### StackModel (@jupyter-widgets/controls, 2.0.0); StackView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element                                                                                         |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'StackModel'`                |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'StackView'`                 |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.                                                                                             |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                                                                                                           |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `selected_index`        | `null` or number (integer)                                           | `null`                        | The index of the selected page. This is either an integer selecting a particular sub-widget, or None to have no widgets selected. |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                                                                                                               |
| `titles`                | array of string                                                      | `[]`                          | Titles of the pages                                                                                                               |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                                                                                                                |

### TabModel (@jupyter-widgets/controls, 2.0.0); TabView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element                                                                                         |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'TabModel'`                  |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'TabView'`                   |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.                                                                                             |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                                                                                                           |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `selected_index`        | `null` or number (integer)                                           | `null`                        | The index of the selected page. This is either an integer selecting a particular sub-widget, or None to have no widgets selected. |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                                                                                                               |
| `titles`                | array of string                                                      | `[]`                          | Titles of the pages                                                                                                               |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                                                                                                                |

### TagsInputModel (@jupyter-widgets/controls, 2.0.0); TagsInputView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                              | Default                       | Help                                      |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                                                                   | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                                                                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                            | `'2.0.0'`                     |
| `_model_name`            | string                                                                            | `'TagsInputModel'`            |
| `_view_module`           | string                                                                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                            | `'2.0.0'`                     |
| `_view_name`             | string                                                                            | `'TagsInputView'`             |
| `allow_duplicates`       | boolean                                                                           | `true`                        |
| `allowed_tags`           | array                                                                             | `[]`                          |
| `description`            | string                                                                            | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                                                                           | `false`                       | Accept HTML in the description.           |
| `layout`                 | reference to Layout widget                                                        | reference to new instance     |
| `placeholder`            | string                                                                            | `'\u200b'`                    |
| `style`                  | reference to DescriptionStyle widget                                              | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                                                                 | `null`                        | Is widget tabbable?                       |
| `tag_style`              | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the tags.    |
| `tooltip`                | `null` or string                                                                  | `null`                        | A tooltip caption.                        |
| `value`                  | array                                                                             | `[]`                          | List of string tags                       |

### TextModel (@jupyter-widgets/controls, 2.0.0); TextView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                          | Default                       | Help                                                                                                         |
| ------------------------ | ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string               | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                        | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                        | `'2.0.0'`                     |
| `_model_name`            | string                        | `'TextModel'`                 |
| `_view_module`           | string                        | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                        | `'2.0.0'`                     |
| `_view_name`             | string                        | `'TextView'`                  |
| `continuous_update`      | boolean                       | `true`                        | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                        | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                       | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                       | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget    | reference to new instance     |
| `placeholder`            | string                        | `'\u200b'`                    | Placeholder text to display when nothing has been typed                                                      |
| `style`                  | reference to TextStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean             | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string              | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | string                        | `''`                          | String value                                                                                                 |

### TextStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'TextStyleModel'`            |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `background`            | `null` or string | `null`                        | Background specifications.                           |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |
| `font_size`             | `null` or string | `null`                        | Text font size.                                      |
| `text_color`            | `null` or string | `null`                        | Text color                                           |

### TextareaModel (@jupyter-widgets/controls, 2.0.0); TextareaView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                          | Default                       | Help                                                                                                         |
| ------------------------ | ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_dom_classes`           | array of string               | `[]`                          | CSS classes applied to widget DOM element                                                                    |
| `_model_module`          | string                        | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                        | `'2.0.0'`                     |
| `_model_name`            | string                        | `'TextareaModel'`             |
| `_view_module`           | string                        | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                        | `'2.0.0'`                     |
| `_view_name`             | string                        | `'TextareaView'`              |
| `continuous_update`      | boolean                       | `true`                        | Update the value as the user types. If False, update on submission, e.g., pressing Enter or navigating away. |
| `description`            | string                        | `''`                          | Description of the control.                                                                                  |
| `description_allow_html` | boolean                       | `false`                       | Accept HTML in the description.                                                                              |
| `disabled`               | boolean                       | `false`                       | Enable or disable user changes                                                                               |
| `layout`                 | reference to Layout widget    | reference to new instance     |
| `placeholder`            | string                        | `'\u200b'`                    | Placeholder text to display when nothing has been typed                                                      |
| `rows`                   | `null` or number (integer)    | `null`                        | The number of rows to display.                                                                               |
| `style`                  | reference to TextStyle widget | reference to new instance     |
| `tabbable`               | `null` or boolean             | `null`                        | Is widget tabbable?                                                                                          |
| `tooltip`                | `null` or string              | `null`                        | A tooltip caption.                                                                                           |
| `value`                  | string                        | `''`                          | String value                                                                                                 |

### TimeModel (@jupyter-widgets/controls, 2.0.0); TimeView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                      | Default                       | Help                                                       |
| ------------------------ | ----------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
| `_dom_classes`           | array of string                           | `[]`                          | CSS classes applied to widget DOM element                  |
| `_model_module`          | string                                    | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                    | `'2.0.0'`                     |
| `_model_name`            | string                                    | `'TimeModel'`                 |
| `_view_module`           | string                                    | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                    | `'2.0.0'`                     |
| `_view_name`             | string                                    | `'TimeView'`                  |
| `description`            | string                                    | `''`                          | Description of the control.                                |
| `description_allow_html` | boolean                                   | `false`                       | Accept HTML in the description.                            |
| `disabled`               | boolean                                   | `false`                       | Enable or disable user changes.                            |
| `layout`                 | reference to Layout widget                | reference to new instance     |
| `max`                    | `null` or Time                            | `null`                        |
| `min`                    | `null` or Time                            | `null`                        |
| `step`                   | number (float) or string (one of `'any'`) | `60`                          | The time step to use for the picker, in seconds, or "any". |
| `style`                  | reference to DescriptionStyle widget      | reference to new instance     | Styling customizations                                     |
| `tabbable`               | `null` or boolean                         | `null`                        | Is widget tabbable?                                        |
| `tooltip`                | `null` or string                          | `null`                        | A tooltip caption.                                         |
| `value`                  | `null` or Time                            | `null`                        |

### ToggleButtonModel (@jupyter-widgets/controls, 2.0.0); ToggleButtonView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                              | Default                       | Help                                      |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                                                                   | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                                                                            | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                            | `'2.0.0'`                     |
| `_model_name`            | string                                                                            | `'ToggleButtonModel'`         |
| `_view_module`           | string                                                                            | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                            | `'2.0.0'`                     |
| `_view_name`             | string                                                                            | `'ToggleButtonView'`          |
| `button_style`           | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the button.  |
| `description`            | string                                                                            | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                                                                           | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                                                                           | `false`                       | Enable or disable user changes.           |
| `icon`                   | string                                                                            | `''`                          | Font-awesome icon.                        |
| `layout`                 | reference to Layout widget                                                        | reference to new instance     |
| `style`                  | reference to ToggleButtonStyle widget                                             | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                                                                 | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                                                                  | `null`                        | A tooltip caption.                        |
| `value`                  | boolean                                                                           | `false`                       | Bool value                                |

### ToggleButtonStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type             | Default                       | Help                                                 |
| ----------------------- | ---------------- | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string           | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string           | `'2.0.0'`                     |
| `_model_name`           | string           | `'ToggleButtonStyleModel'`    |
| `_view_module`          | string           | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string           | `'2.0.0'`                     |
| `_view_name`            | string           | `'StyleView'`                 |
| `description_width`     | string           | `''`                          | Width of the description to the side of the control. |
| `font_family`           | `null` or string | `null`                        | Toggle button text font family.                      |
| `font_size`             | `null` or string | `null`                        | Toggle button text font size.                        |
| `font_style`            | `null` or string | `null`                        | Toggle button text font style.                       |
| `font_variant`          | `null` or string | `null`                        | Toggle button text font variant.                     |
| `font_weight`           | `null` or string | `null`                        | Toggle button text font weight.                      |
| `text_color`            | `null` or string | `null`                        | Toggle button text color                             |
| `text_decoration`       | `null` or string | `null`                        | Toggle button text decoration.                       |

### ToggleButtonsModel (@jupyter-widgets/controls, 2.0.0); ToggleButtonsView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                                                                        | Default                       | Help                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `_dom_classes`           | array of string                                                                             | `[]`                          | CSS classes applied to widget DOM element                               |
| `_model_module`          | string                                                                                      | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                                                                                      | `'2.0.0'`                     |
| `_model_name`            | string                                                                                      | `'ToggleButtonsModel'`        |
| `_options_labels`        | array of string                                                                             | `[]`                          | The labels for the options.                                             |
| `_view_module`           | string                                                                                      | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                                                                                      | `'2.0.0'`                     |
| `_view_name`             | string                                                                                      | `'ToggleButtonsView'`         |
| `button_style`           | `null` or string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the buttons.                               |
| `description`            | string                                                                                      | `''`                          | Description of the control.                                             |
| `description_allow_html` | boolean                                                                                     | `false`                       | Accept HTML in the description.                                         |
| `disabled`               | boolean                                                                                     | `false`                       | Enable or disable user changes                                          |
| `icons`                  | array of string                                                                             | `[]`                          | Icons names for each button (FontAwesome names without the fa- prefix). |
| `index`                  | `null` or number (integer)                                                                  | `null`                        | Selected index                                                          |
| `layout`                 | reference to Layout widget                                                                  | reference to new instance     |
| `style`                  | reference to ToggleButtonsStyle widget                                                      | reference to new instance     |
| `tabbable`               | `null` or boolean                                                                           | `null`                        | Is widget tabbable?                                                     |
| `tooltip`                | `null` or string                                                                            | `null`                        | A tooltip caption.                                                      |
| `tooltips`               | array of string                                                                             | `[]`                          | Tooltips for each button.                                               |

### ToggleButtonsStyleModel (@jupyter-widgets/controls, 2.0.0); StyleView (@jupyter-widgets/base, 2.0.0)

| Attribute               | Type   | Default                       | Help                                                 |
| ----------------------- | ------ | ----------------------------- | ---------------------------------------------------- |
| `_model_module`         | string | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string | `'2.0.0'`                     |
| `_model_name`           | string | `'ToggleButtonsStyleModel'`   |
| `_view_module`          | string | `'@jupyter-widgets/base'`     |
| `_view_module_version`  | string | `'2.0.0'`                     |
| `_view_name`            | string | `'StyleView'`                 |
| `button_width`          | string | `''`                          | The width of each button.                            |
| `description_width`     | string | `''`                          | Width of the description to the side of the control. |
| `font_weight`           | string | `''`                          | Text font weight of each button.                     |

### VBoxModel (@jupyter-widgets/controls, 2.0.0); VBoxView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                                                                 | Default                       | Help                                      |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `_dom_classes`          | array of string                                                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`         | string                                                               | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                                                               | `'2.0.0'`                     |
| `_model_name`           | string                                                               | `'VBoxModel'`                 |
| `_view_module`          | string                                                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                                                               | `'2.0.0'`                     |
| `_view_name`            | string                                                               | `'VBoxView'`                  |
| `box_style`             | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`                          | Use a predefined styling for the box.     |
| `children`              | array of reference to Widget widget                                  | `[]`                          | List of widget children                   |
| `layout`                | reference to Layout widget                                           | reference to new instance     |
| `tabbable`              | `null` or boolean                                                    | `null`                        | Is widget tabbable?                       |
| `tooltip`               | `null` or string                                                     | `null`                        | A tooltip caption.                        |

### ValidModel (@jupyter-widgets/controls, 2.0.0); ValidView (@jupyter-widgets/controls, 2.0.0)

| Attribute                | Type                                 | Default                       | Help                                      |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------- |
| `_dom_classes`           | array of string                      | `[]`                          | CSS classes applied to widget DOM element |
| `_model_module`          | string                               | `'@jupyter-widgets/controls'` |
| `_model_module_version`  | string                               | `'2.0.0'`                     |
| `_model_name`            | string                               | `'ValidModel'`                |
| `_view_module`           | string                               | `'@jupyter-widgets/controls'` |
| `_view_module_version`   | string                               | `'2.0.0'`                     |
| `_view_name`             | string                               | `'ValidView'`                 |
| `description`            | string                               | `''`                          | Description of the control.               |
| `description_allow_html` | boolean                              | `false`                       | Accept HTML in the description.           |
| `disabled`               | boolean                              | `false`                       | Enable or disable user changes.           |
| `layout`                 | reference to Layout widget           | reference to new instance     |
| `readout`                | string                               | `'Invalid'`                   | Message displayed when the value is False |
| `style`                  | reference to DescriptionStyle widget | reference to new instance     | Styling customizations                    |
| `tabbable`               | `null` or boolean                    | `null`                        | Is widget tabbable?                       |
| `tooltip`                | `null` or string                     | `null`                        | A tooltip caption.                        |
| `value`                  | boolean                              | `false`                       | Bool value                                |

### VideoModel (@jupyter-widgets/controls, 2.0.0); VideoView (@jupyter-widgets/controls, 2.0.0)

| Attribute               | Type                       | Default                       | Help                                                                                |
| ----------------------- | -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `_dom_classes`          | array of string            | `[]`                          | CSS classes applied to widget DOM element                                           |
| `_model_module`         | string                     | `'@jupyter-widgets/controls'` |
| `_model_module_version` | string                     | `'2.0.0'`                     |
| `_model_name`           | string                     | `'VideoModel'`                |
| `_view_module`          | string                     | `'@jupyter-widgets/controls'` |
| `_view_module_version`  | string                     | `'2.0.0'`                     |
| `_view_name`            | string                     | `'VideoView'`                 |
| `autoplay`              | boolean                    | `true`                        | When true, the video starts when it's displayed                                     |
| `controls`              | boolean                    | `true`                        | Specifies that video controls should be displayed (such as a play/pause button etc) |
| `format`                | string                     | `'mp4'`                       | The format of the video.                                                            |
| `height`                | string                     | `''`                          | Height of the video in pixels.                                                      |
| `layout`                | reference to Layout widget | reference to new instance     |
| `loop`                  | boolean                    | `true`                        | When true, the video will start from the beginning after finishing                  |
| `tabbable`              | `null` or boolean          | `null`                        | Is widget tabbable?                                                                 |
| `tooltip`               | `null` or string           | `null`                        | A tooltip caption.                                                                  |
| `value`                 | Bytes                      | `b''`                         | The media data as a memory view of bytes.                                           |
| `width`                 | string                     | `''`                          | Width of the video in pixels.                                                       |

### OutputModel (@jupyter-widgets/output, 1.0.0); OutputView (@jupyter-widgets/output, 1.0.0)

| Attribute               | Type                       | Default                     | Help                                          |
| ----------------------- | -------------------------- | --------------------------- | --------------------------------------------- |
| `_dom_classes`          | array of string            | `[]`                        | CSS classes applied to widget DOM element     |
| `_model_module`         | string                     | `'@jupyter-widgets/output'` |
| `_model_module_version` | string                     | `'1.0.0'`                   |
| `_model_name`           | string                     | `'OutputModel'`             |
| `_view_module`          | string                     | `'@jupyter-widgets/output'` |
| `_view_module_version`  | string                     | `'1.0.0'`                   |
| `_view_name`            | string                     | `'OutputView'`              |
| `layout`                | reference to Layout widget | reference to new instance   |
| `msg_id`                | string                     | `''`                        | Parent message id of messages to capture      |
| `outputs`               | array of object            | `[]`                        | The output messages synced from the frontend. |
| `tabbable`              | `null` or boolean          | `null`                      | Is widget tabbable?                           |
| `tooltip`               | `null` or string           | `null`                      | A tooltip caption.                            |
