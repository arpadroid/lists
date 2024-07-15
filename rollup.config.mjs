import { getBuild, isSlim } from '@arpadroid/arpadroid/src/rollup/builds/rollup-builds.mjs';
const { build } = getBuild('lists', 'uiComponent', {
    external: isSlim() && ['forms']
});
export default build;
