#!/usr/bin/env python
# coding: utf-8

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

# the name of the package
name = 'ipywidgets'

LONG_DESCRIPTION = """
.. image:: https://img.shields.io/pypi/v/ipywidgets.svg
   :target: https://pypi.python.org/pypi/ipywidgets/
   :alt: Version Number

.. image:: https://img.shields.io/pypi/dm/ipywidgets.svg
   :target: https://pypi.python.org/pypi/ipywidgets/
   :alt: Number of PyPI downloads

Interactive HTML Widgets
========================

Interactive HTML widgets for Jupyter notebooks and the IPython kernel.

Usage
=====

.. code-block:: python

    from ipywidgets import IntSlider
    IntSlider()
"""

#-----------------------------------------------------------------------------
# Minimal Python version sanity check
#-----------------------------------------------------------------------------

import sys

v = sys.version_info
if v[:2] < (2,7) or (v[0] >= 3 and v[:2] < (3,3)):
    error = "ERROR: %s requires Python version 2.7 or 3.3 or above." % name
    print(error, file=sys.stderr)
    sys.exit(1)

PY3 = (sys.version_info[0] >= 3)

#-----------------------------------------------------------------------------
# get on with it
#-----------------------------------------------------------------------------

import os
from distutils import log
from distutils.core import setup, Command
from distutils.command.build_py import build_py
from distutils.command.sdist import sdist
from glob import glob
from os.path import join as pjoin
from subprocess import check_call

log.set_verbosity(log.DEBUG)
log.info('setup.py entered')
log.info('$PATH=%s' % os.environ['PATH'])

repo_root = os.path.dirname(os.path.abspath(__file__))
is_repo = os.path.exists(pjoin(repo_root, '.git'))

npm_path = os.pathsep.join([
    pjoin(repo_root, 'ipywidgets', 'node_modules', '.bin'),
    os.environ.get("PATH", os.defpath),
])

def mtime(path):
    """shorthand for mtime"""
    return os.stat(path).st_mtime

def js_prerelease(command, strict=False):
    """decorator for building minified js/css prior to another command"""
    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj('jsdeps')
            if not is_repo and all(os.path.exists(t) for t in jsdeps.targets):
                # sdist, nothing to do
                command.run(self)
                return
            
            try:
                self.distribution.run_command('jsdeps')
            except Exception as e:
                missing = [t for t in jsdeps.targets if not os.path.exists(t)]
                if strict or missing:
                    log.warn("rebuilding js and css failed")
                    if missing:
                        log.error("missing files: %s" % missing)
                    raise e
                else:
                    log.warn("rebuilding js and css failed (not a problem)")
                    log.warn(str(e))
            command.run(self)
            update_package_data(self.distribution)
    return DecoratedCommand


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj('build_py')
    # distribution.package_data = find_package_data()
    # re-init build_py options which load package_data
    build_py.finalize_options()


class NPM(Command):
    description = "install package,json dependencies using npm"

    user_options = []
    
    node_modules = pjoin(repo_root, 'ipywidgets', 'node_modules')

    targets = [
        pjoin(repo_root, 'ipywidgets', 'static', 'widgets', 'css', 'widgets.min.css')
    ]

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass
        
    def has_npm(self):
        try:
            check_call(['npm', '--version'])
            return True
        except:
            return False

    def should_run_npm_install(self):
        package_json = pjoin(repo_root, 'ipywidgets', 'package.json')
        node_modules_exists = os.path.exists(self.node_modules)
        return self.has_npm() and (not node_modules_exists or mtime(self.node_modules) < mtime(package_json))
    
    def run(self):
        has_npm = self.has_npm()
        if not has_npm:
            log.error("`npm` unavailable.  If you're running this command using sudo, make sure `npm` is available to sudo")
            
        if self.should_run_npm_install():
            log.info("Installing build dependencies with npm.  This may take a while...")
            check_call(['npm', 'install'], cwd=pjoin(repo_root, 'ipywidgets'), stdout=sys.stdout, stderr=sys.stderr)
            os.utime(self.node_modules, None)

        env = os.environ.copy()
        env['PATH'] = npm_path
        if has_npm:
            log.info("Running `npm run build`...")
            check_call(['npm', 'run', 'build'], cwd=pjoin(repo_root, 'ipywidgets'), stdout=sys.stdout, stderr=sys.stderr)
        
        for t in self.targets:
            if not os.path.exists(t):
                msg = "Missing file: %s" % t
                if not has_npm:
                    msg += '\nnpm is required to build a development version of ipywidgets'
                raise ValueError(msg)
        

        # update package data in case this created new files
        update_package_data(self.distribution)

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))
pkg_root = pjoin(here, name)

packages = []
for d, _, _ in os.walk(pjoin(here, name)):
    if os.path.exists(pjoin(d, '__init__.py')):
        packages.append(d[len(here)+1:].replace(os.path.sep, '.'))

package_data = {
    'ipywidgets': ['static/*/*/*.*', 'tests/bin/*.js', 'tests/bin/*/*.js'],
}

version_ns = {}
with open(pjoin(here, name, '_version.py')) as f:
    exec(f.read(), {}, version_ns)


setup_args = dict(
    name            = name,
    version         = version_ns['__version__'],
    scripts         = glob(pjoin('scripts', '*')),
    packages        = packages,
    package_data    = package_data,
    description     = "IPython HTML widgets for Jupyter",
    long_description = LONG_DESCRIPTION,
    author          = 'IPython Development Team',
    author_email    = 'ipython-dev@scipy.org',
    url             = 'http://ipython.org',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Interactive', 'Interpreter', 'Shell', 'Web'],
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
    ],
    cmdclass        = {
        'build_py': js_prerelease(build_py),
        'sdist': js_prerelease(sdist, strict=True),
        'jsdeps': NPM,
    },
)

if 'develop' in sys.argv or any(a.startswith('bdist') for a in sys.argv):
    import setuptools

if 'setuptools' in sys.modules:
    # setup.py develop should check for submodules
    from setuptools.command.develop import develop
    setup_args['cmdclass']['develop'] = js_prerelease(develop, strict=True)

setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'ipython>=4.0.0',
    'ipykernel>=4.2.0',
    'traitlets',
    'notebook>=4.1.0b1',
]

extras_require = setuptools_args['extras_require'] = {
    'test:python_version=="2.7"': ['mock'],
    'test': ['nose'],
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
