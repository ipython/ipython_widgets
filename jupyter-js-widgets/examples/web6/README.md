# Using jupyter-js-widgets in non-notebook, web context + mybinder backend

## Description

This directory is an example project that shows how to use `jupyter-js-widgets`
and `ipywidgets` in a web context other than the notebook.

Similarly to the `web3` example, this example makes uses of a Python kernel.
However, it makes use of the `mybinder` service to spawn a new transient Jupyter
notebook server from which it then requests a Python kernel.

Besides, this example also displays read-only text area containing the code
provided in the `widget_code.json`, which we used to generate the widget state.
This directory is an example project that shows how you can embed the widgets in
a context other than the notebook.

## Try it

1. Start with a development install of jupyter-js-widgets by running
   `npm install` in the `jupyter-js-widgets` subfolder of the repo root
   (see the [README.md](../../../README.md) in the repo root for more details).
2. Cd into this directory and run `npm install`.
3. Now open the `index.html` file.

## Details

If you plan to reproduce this in your own project, pay careful attention to the
`package.json` file. The dependency to `jupyter-js-widgets`, which reads
`"jupyter-js-widgets": "file:../../../ipywidgets"`, **should not** point to
`"file:../../../ipywidgets"`.

Instead point it to the version you want to use on npm.

(but really, you should let npm do this for you by running

`npm install --save jupyter-js-widgets`.)
