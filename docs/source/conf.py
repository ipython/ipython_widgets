#!/usr/bin/env python3
#

import os
from packaging.version import Version

# silence debug messages
os.environ["PYDEVD_DISABLE_FILE_VALIDATION"] = "1"

# -- Sphinx extensions and configuration ------------------------

extensions = [
    'myst_nb',
    'sphinx.ext.autosectionlabel',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'sphinx_autodoc_typehints',
    'sphinx_copybutton',
    'sphinx.ext.viewcode',
    'IPython.sphinxext.ipython_console_highlighting',
]

intersphinx_mapping = {
    'python': ('https://docs.python.org/3', None),
    'ipython': ('https://ipython.readthedocs.io/en/stable/', None),
    'nbconvert': ('https://nbconvert.readthedocs.io/en/stable', None),
    'nbformat': ('https://nbformat.readthedocs.io/en/stable', None),
    'traitlets': ('https://traitlets.readthedocs.io/en/stable', None),
}


# -- General information -------

_release = {}
exec(compile(open('../../python/ipywidgets/ipywidgets/_version.py').read(), '../../python/ipywidgets/ipywidgets/_version.py', 'exec'), _release)
v = Version(_release['__version__'])
version = f'{v.major}.{v.minor}'
release = _release['__version__']

# Add any paths that contain templates here, relative to this directory.
# templates_path = ['_templates']

master_doc = 'index'
project = 'Jupyter Widgets'
copyright = '2017-2023 Project Jupyter'
author = 'Jupyter Team'

language = "en"
exclude_patterns = [
    '**.ipynb_checkpoints',
    'examples.md',
    'examples/Beat Frequencies.ipynb',
    'examples/Controller.ipynb',
    'examples/Exploring Graphs.ipynb',
    'examples/Export As (nbconvert).ipynb',
    'examples/Factoring.ipynb',
    'examples/Imag*',
    'examples/Index.ipynb',
    'examples/Lorenz Differential Equations.ipynb',
    'examples/Media widgets.ipynb',
    'examples/Variable Inspector.ipynb',
    'examples/Widget Alignment.ipynb',
    '_contents'
]
pygments_style = 'sphinx'
todo_include_todos = False

myst_enable_extensions = [
    "amsmath",
    "colon_fence",
    "deflist",
    "dollarmath",
    "html_image",
]

nb_execution_mode = "cache"

nb_ipywidgets_js = {
    "require.js": {},
    "embed-amd.js": {}
}

# -- html --------------------------
html_theme = 'pydata_sphinx_theme'

html_static_path = [
    # '_static',
    "../../packages/html-manager/dist",
    '../lite/_output',
    '../../node_modules/requirejs/require.js',
]
htmlhelp_basename = 'ipywidgetsdoc'


# -- latex -------------------------

latex_elements = {}
latex_documents = [
  (master_doc, 'ipywidgets.tex', 'ipywidgets Documentation',
   'https://jupyter.org', 'manual'),
]


# -- tex ---------------------------

texinfo_documents = [
  (master_doc, 'ipywidgets', 'ipywidgets Documentation',
   author, 'ipywidgets', 'Interactive Widgets for Jupyter.',
   'Miscellaneous'),
]


# -- epub --------------------------

# Bibliographic Dublin Core info.
epub_title = project
epub_author = author
epub_publisher = author
epub_copyright = copyright


def on_config_inited(*args):
    import subprocess
    from pathlib import Path
    HERE = Path(__file__).parent
    LITE = HERE.parent / "lite"
    ROOT = HERE.parent.parent
    JLW = ROOT / "python/jupyterlab_widgets"
    IPYW = ROOT / "python/ipywidgets"
    WIDG = ROOT / "python/widgetsnbextension"

    def run(args, cwd):
        print(f"in {cwd}...")
        print(">>>", " ".join(args))
        subprocess.check_call(args, cwd=str(cwd))

    run(["jlpm"], ROOT)
    run(["jlpm", "build"], ROOT)

    for pkg_root in [IPYW, WIDG, JLW]:
        run(["pyproject-build"], pkg_root)

    run(["jupyter", "lite", "build"], LITE)

def setup(app):
    app.connect("config-inited", on_config_inited)
