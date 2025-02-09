import { NavLinkConfigType } from '@arpadroid/navigation';
import { ArpaElementConfigType } from '@arpadroid/ui';

export type ListViewsConfigType = ArpaElementConfigType & {
    icon?: string;
    label?: string;
    views?: string[];
    links?: ListViewConfigType[];
    options?: ListViewConfigType[];
    defaultOptions?: ListViewConfigType[];
};

export type ListViewConfigType = NavLinkConfigType & {
    value?: string;
    iconRight?: string;
    title?: string;
};
