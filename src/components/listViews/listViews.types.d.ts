import { NavLinkConfigType } from '@arpadroid/navigation/src/components/navLink/navLink.types';
import { ArpaElementConfigType } from '@arpadroid/ui/dist/@types/components/arpaElement/arpaElement.types';

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
}