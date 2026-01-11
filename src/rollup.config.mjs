import { getBuild } from '@arpadroid/module';
const { build = {} } = getBuild('lists', { external: ['forms', 'messages'] });
export default build;
