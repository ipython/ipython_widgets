# Using the HTML widget manager

## Description

This is an example project showing how to embed widgets in an HTML document.

We use the local `index.built.js` that we build to make sure this example
reflects the current state of the source repository. To use the latest release
of the HTML widget manager in your own project, copy the `index.html` file and
replace

`<script src="./built/index.built.js"></script>`

with

`<script src="https://cdn.jsdelivr.net/npm/@jupyter-widgets/html-manager/dist/embed.js" crossorigin="anonymous"></script>`

If you need a specific version of the HTML widget manager, you can include a
semver range. For example:

`<script src="https://cdn.jsdelivr.net/npm/@jupyter-widgets/html-manager@^0.8.0/dist/embed.js" crossorigin="anonymous"></script>`

The widget data in this example was generated from the following code:

```python
from ipywidgets import VBox, jsdlink, IntSlider, Button

s1, s2 = IntSlider(max=200, value=100), IntSlider(value=40)
b = Button(icon='legal')
jsdlink((s1, 'value'), (s2, 'max'))
VBox([s1, s2, b])
```

## Try it

1. Start with a repository checkout, and run `yarn install` in the root directory.
2. Run `yarn build:examples` in the root directory.
3. Open the `index.html` file in this directory.
