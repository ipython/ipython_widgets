// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as libembed from './libembed';

let cdn = 'https://cdn.jsdelivr.net/npm/';
let onlyCDN = false;
const modulesCDN: { [key:string]: string } = {};

// find the data-cdn for any script tag, assuming it is only used for embed-amd.js
const scripts = document.getElementsByTagName('script');
Array.prototype.forEach.call(scripts, (script: HTMLScriptElement) => {
  cdn = script.getAttribute('data-jupyter-widgets-cdn') || cdn;
  onlyCDN = onlyCDN || script.hasAttribute('data-jupyter-widgets-cdn-only');
  if (script.hasAttribute('data-jupyter-widgets-module-cdn')) {
    const CDNTuple = script.getAttribute('data-jupyter-widgets-module-cdn');
    if (CDNTuple) {
      const [moduleName, moduleCND] = CDNTuple.split(",").map((s) => s.trim());
      if (moduleName && moduleCND) {
        modulesCDN[moduleName] = moduleCND;
      }
    }
  }
});
console.log('Modules CDNs found:', modulesCDN);

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

function moduleNameToCDNUrl(moduleName: string, moduleVersion: string): string {
  if (modulesCDN && modulesCDN[moduleName]) {
    console.log(`Loading ${moduleName} from ${modulesCDN[moduleName]}`);
    return modulesCDN[moduleName];
  }
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
  const CDNURL = `${cdn}${packageName}@${moduleVersion}/dist/${fileName}`;
  console.log(`Loading ${packageName} from ${CDNURL}`);
  return CDNURL;
}

/**
 * Load an amd module locally and fall back to specified CDN if unavailable.
 *
 * @param moduleName The name of the module to load..
 * @param version The semver range for the module, if loaded from a CDN.
 *
 * By default, the CDN service used is jsDelivr. However, this default can be
 * overriden by specifying another URL via the HTML attribute
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
    conf.paths[moduleName] = moduleNameToCDNUrl(moduleName, moduleVersion);
    require.config(conf);
    return requirePromise([`${moduleName}`]);
  }
  if (onlyCDN) {
    return loadFromCDN();
  }
  return requirePromise([`${moduleName}`])
  .then((ret) => {
    // TODO: get current directory and print?
    console.log(`Successfully loaded ${moduleName} from current directory`);
    return ret;
  })
  .catch((err) => {
    const failedId = err.requireModules && err.requireModules[0];
    if (failedId) {
      require.undef(failedId);
      return loadFromCDN();
    }
  })
  .catch((err) => {
    console.warn(`Unable to load module ${moduleName}.`, err)
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
