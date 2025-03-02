import { getBuild } from '@arpadroid/module';
const { build = {} } = getBuild('lists', 'uiComponent', { external: ['forms'] }) || {};
export default build;
