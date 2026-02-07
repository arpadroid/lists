// @ts-ignore
import { bootstrapDecorator } from '@arpadroid/module/storybook/decorators';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';

export default {
    decorators: [
        bootstrapDecorator(() => {// @ts-ignore
            setService('router', new Router());// @ts-ignore
            setService('apiService', APIService);
        })
    ]
};
