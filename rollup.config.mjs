import { getBuild } from '@arpadroid/arpadroid/src/rollup/builds/rollup-builds.mjs';
const { build } = getBuild('lists', 'uiComponent', { external: ['forms'] });
export default build;
