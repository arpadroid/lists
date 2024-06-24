import alias from '@rollup/plugin-alias';
import { getBuild } from '@arpadroid/arpadroid/src/rollup/builds/rollup-builds.mjs';
const cwd = process.cwd();
const SLIM = process.env['slim'] === 'true';
const { build, plugins } = getBuild('lists', 'uiComponent');
const aliases = [{ find: '@arpadroid/lists', replacement: cwd + '/src/index.js' }];
!SLIM && plugins.push(alias({ entries: aliases }));
export default build;
