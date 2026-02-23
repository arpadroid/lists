import { BaseLinkConfigType } from '../../@types/base.types';
import { ArpaElementConfigType } from '@arpadroid/ui';

export type ListViewsConfigType = ArpaElementConfigType & {
    icon?: string;
    label?: string;
    views?: string[];
    links?: ListViewConfigType[];
    options?: ListViewConfigType[];
    defaultOptions?: ListViewConfigType[];
};

export type ListViewConfigType = BaseLinkConfigType & {
    value?: string;
    iconRight?: string;
    title?: string;
};
