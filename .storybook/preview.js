import config from '@arpadroid/arpadroid/src/storybook/preview.ui.js';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';
setService('router', new Router());
setService('apiService', APIService);
export default {
    ...config,
    decorators: [...config.decorators]
};
