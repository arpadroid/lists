import alias from './node_modules/@arpadroid/arpadroid/node_modules/@rollup/plugin-alias/dist/cjs/index.js';
import { getBuild } from '@arpadroid/arpadroid/src/rollup/builds/rollup-builds.mjs';
const cwd = process.cwd();
const { build, plugins, buildConfig } = getBuild('lists', 'uiComponent');
const aliases = [{ find: '@arpadroid/lists', replacement: cwd + '/src/index.js' }];
!buildConfig.slim && plugins.push(alias({ entries: aliases }));
export default build;
