# Developer Install

The core Jupyter Widgets packages are developed in the
[https://github.com/jupyter-widgets/ipywidgets](https://github.com/jupyter-widgets/ipywidgets) git repository.

## Prerequisites

To install ipywidgets from git, you will need:

- [yarn](https://yarnpkg.com/) package manager ** version 3.0 or later **

- the latest [Jupyter Notebook development release](https://github.com/jupyter/notebook/releases)

  - Everything in the ipywidgets repository is developed using Jupyter
    notebook's `main` branch.
  - If you want to have a copy of ipywidgets that works against a stable
    version of the notebook, checkout the appropriate tag.
  - See the
    [Compatibility table](https://github.com/jupyter-widgets/ipywidgets#compatibility)

- the latest [JupyterLab release](https://github.com/jupyterlab/jupyterlab/releases)

### Installing With Conda

```bash
conda create -c conda-forge -n ipywidgets yarn notebook jupyterlab
conda activate ipywidgets
ipython kernel install --name ipywidgets --display-name "ipywidgets" --sys-prefix
git clone https://github.com/jupyter-widgets/ipywidgets.git
cd ipywidgets
./dev-install.sh
```

### Installing with pip

To do an editable install of the python ipywidgets package into the user site directory with pip, please navigate into the sub-folder `python/ipywidgets` with

```bash
cd python/ipywidgets
```

and run

```bash
pip install --prefix=$(python -m site --user-base) -e .
```

Using `pip install --user -e .` will not work due to a bug in pip. See https://github.com/pypa/pip/issues/7953 for more details.

## Rebuilding after making changes

To build and test changes, run the following commands in the ipywidgets repository root directory, empty your browser's cache, and refresh the page.

        yarn clean
        yarn build

If your changes are confined to one package (for example, just in the widgetsnbextension package), then it may be sufficient to just run `yarn build` in that specific directory.

## Tips and troubleshooting

- If you have any problems with the above install procedure, make sure that
  permissions on npm and pip related install directories are correct.

- Sometimes, it helps to clear cached files too by running `git clean -dfx`
  from the root of the cloned repository.

- When you make changes to the Javascript and you're not seeing the changes,
  it could be your browser is caching aggressively. Try clearing the browser's
  cache. Try also using "incognito" or "private" browsing tabs to avoid
  caching.

- If troubleshooting an upgrade and its build, you may need to do the
  following process:

  - Deep clean of the cloned repository:

    ```
    git clean -dfx .
    ```

  - Remove anything with `widgetsnbextension` in the name of files within
    the `conda` directory

  - Try reinstalling ipywidgets

## Updating widget model specification

To update the widget model specification with changes, do something like this in the repo root:

```
python ./packages/schema/generate-spec.py -f json-pretty packages/schema/jupyterwidgetmodels.latest.json
python ./packages/schema/generate-spec.py -f markdown packages/schema/jupyterwidgetmodels.latest.md
```

## Releasing new versions

See [dev_release.md](dev_release.md) for a details on how to release new versions of ipywidgets to PyPI and jupyter-widgets-controls on npm.

## Testing

See [dev_testing.md](dev_testing.md) for a details on how to run Python and Javascript tests.

## Building documentation

See [dev_docs.md](dev_docs.md) for a details on how to build the docs.
