import config from '@arpadroid/module/storybook/preview';
import { bootstrapDecorator } from '@arpadroid/module/storybook/decorators';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';

export default {
    ...config,
    decorators: [
        ...config.decorators,
        bootstrapDecorator(() => {
            setService('router', new Router());
            setService('apiService', APIService);
        })
    ]
};
