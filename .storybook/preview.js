// @ts-ignore
import { bootstrapDecorator } from '@arpadroid/module/storybook/decorators';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';
import { mergeObjects } from '@arpadroid/tools';
import defaultConfig from '@arpadroid/module/storybook/preview';
/** @type { import('@storybook/web-components-vite').Preview } */
const config = mergeObjects(
    defaultConfig,
    {
        decorators: [
            bootstrapDecorator(() => {
                // @ts-ignore
                setService('router', new Router()); // @ts-ignore
                setService('apiService', APIService);
            })
        ]
    },
    true
);

export default { ...config };
