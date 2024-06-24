import { AbstractContentInterface } from '../../../../types';
import { ListResource } from '@arpadroid/application';
import { NavLinkInterface } from '../../../navigation/components/navLink/navLinkInterface';

export interface ListInterface extends AbstractComponentInterface {
    isCollapsed?: boolean;
    canCollapse?: boolean;
    hasSearch?: boolean;
    hasPager?: boolean;
    listResource?: ListResource;
    heading?: string;
    onSearch?: (value: string) => void;
    filters?: AbstractContentInterface;
    preProcessItem?: (item) => void;
    renderMode?: 'minimal' | 'full';
    views?: string[],
    viewOptions?: NavLinkInterface[];
}
