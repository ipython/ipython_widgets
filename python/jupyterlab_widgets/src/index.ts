// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import WidgetManagerProvider from './plugin';
import * as output from './output';

export default WidgetManagerProvider;

export { registerWidgetManager } from './plugin';

export { KernelWidgetManager, WidgetManager } from './manager';

export { WidgetRenderer } from './renderer';

export { output };
