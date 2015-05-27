# Interactive HTML Widgets

[![Build Status](https://travis-ci.org/ipython/ipywidgets.svg?branch=master)](https://travis-ci.org/ipython/ipywidgets) [![Join the chat at https://gitter.im/ipython/ipywidgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ipython/ipywidgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Interactive HTML widgets for Jupyter notebooks and the IPython kernel.

## Install

0. Install [notebook](https://github.com/jupyter/notebook)

1. Install the package
    
        gulp css
        pip install -e .

    gulp uses the Python interpreter to find the path for the jupyter notebook.
    If a different interpreter from the one specified in PATH is used, one may
    write

        gulp css --interpreter /path/to/python
        /path/to/pip install -e .

## Test

To run the Python tests:

    nosetests --with-coverage --cover-package=ipywidgets ipywidgets

To run the Javascript tests:

    gulp tests; python -m ipywidgets.jstest

To run the Javascript tests with all output printed:

    gulp tests; python -m ipywidgets.jstest -- --logall

Description of jstest additional arguments:
logall - If there is atleast one failure in the notebook, log information for every cell.
logsuccess - Log information for every cell in the notebook, regardless of failure.