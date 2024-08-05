// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as libembed from './libembed';

let cdn = 'https://cdn.jsdelivr.net/npm/';
let onlyCDN = false;

// find the data-cdn for any script tag, assuming it is only used for embed-amd.js
const scripts = document.getElementsByTagName('script');
Array.prototype.forEach.call(scripts, (script: HTMLScriptElement) => {
  cdn = script.getAttribute('data-jupyter-widgets-cdn') || cdn;
  onlyCDN = onlyCDN || script.hasAttribute('data-jupyter-widgets-cdn-only');
});

/**
 * Load a package using requirejs and return a promise
 *
 * @param pkg Package name or names to load
 */
const requirePromise = function (pkg: string | string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const require = (window as any).requirejs;
    if (require === undefined) {
      reject('Requirejs is needed, please ensure it is loaded on the page.');
    } else {
      require(pkg, resolve, reject);
    }
  });
};

function moduleNameToCDNUrl(
  moduleName: string,
  moduleVersion: string
): { packageRoot: string; pathGuess: string } {
  let packageName = moduleName;
  let fileName = 'index'; // default filename
  // if a '/' is present, like 'foo/bar', packageName is changed to 'foo', and path to 'bar'
  // We first find the first '/'
  let index = moduleName.indexOf('/');
  if (index != -1 && moduleName[0] == '@') {
    // if we have a namespace, it's a different story
    // @foo/bar/baz should translate to @foo/bar and baz
    // so we find the 2nd '/'
    index = moduleName.indexOf('/', index + 1);
  }
  if (index != -1) {
    fileName = moduleName.substr(index + 1);
    packageName = moduleName.substr(0, index);
  }
  if (moduleVersion.startsWith('~')) {
    moduleVersion = moduleVersion.slice(1);
  }
  return {
    packageRoot: `${cdn}${packageName}@${moduleVersion}`,
    pathGuess: `/dist/${fileName}`,
  };
}

/**
 * Load an amd module locally and fall back to specified CDN if unavailable.
 *
 * @param moduleName The name of the module to load..
 * @param version The semver range for the module, if loaded from a CDN.
 *
 * By default, the CDN service used is jsDelivr. However, this default can be
 * overridden by specifying another URL via the HTML attribute
 * "data-jupyter-widgets-cdn" on a script tag of the page.
 *
 * The semver range is only used with the CDN.
 */
export function requireLoader(
  moduleName: string,
  moduleVersion: string
): Promise<any> {
  const require = (window as any).requirejs;
  if (require === undefined) {
    throw new Error(
      'Requirejs is needed, please ensure it is loaded on the page.'
    );
  }
  function loadFromCDN(): Promise<any> {
    const conf: { paths: { [key: string]: string } } = { paths: {} };

    // First, try to resolve with the CDN.
    // We default to the previous behavior
    // of trying for a full path. NOTE: in the
    // future, we should let the CDN resolve itself
    // based on the package.json contents (the next
    // case below)
    const { packageRoot, pathGuess } = moduleNameToCDNUrl(
      moduleName,
      moduleVersion
    );

    conf.paths[moduleName] = `${packageRoot}${pathGuess}`;
    require.config(conf);
    return requirePromise([`${moduleName}`]).catch((err) => {
      // Next, if this also errors, we the root
      // and let the CDN decide
      // NOTE: the `?` is added to avoid require appending a .js
      conf.paths[moduleName] = `${packageRoot}?`;

      const failedId = err.requireModules && err.requireModules[0];
      if (failedId) {
        require.undef(failedId);
      }
      require.config(conf);
    });
  }

  if (onlyCDN) {
    console.log(`Loading from ${cdn} for ${moduleName}@${moduleVersion}`);
    return loadFromCDN();
  }
  return requirePromise([`${moduleName}`]).catch((err) => {
    const failedId = err.requireModules && err.requireModules[0];
    if (failedId) {
      require.undef(failedId);
      console.log(`Falling back to ${cdn} for ${moduleName}@${moduleVersion}`);
      return loadFromCDN();
    }
  });
}

/**
 * Render widgets in a given element.
 *
 * @param element (default document.documentElement) The element containing widget state and views.
 * @param loader (default requireLoader) The function used to look up the modules containing
 * the widgets' models and views classes. (The default loader looks them up on jsDelivr)
 */
export function renderWidgets(
  element = document.documentElement,
  loader: (
    moduleName: string,
    moduleVersion: string
  ) => Promise<any> = requireLoader
): void {
  requirePromise(['@jupyter-widgets/html-manager']).then((htmlmanager) => {
    const managerFactory = (): any => {
      return new htmlmanager.HTMLManager({ loader: loader });
    };
    libembed.renderWidgets(managerFactory, element);
  });
}
