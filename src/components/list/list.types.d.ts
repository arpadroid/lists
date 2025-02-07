import { ListResource } from '@arpadroid/resources';
import ListItem from '../listItem/listItem.js';
import { ListItemConfigType } from '../listItem/listItem.types';
import { ArpaElementConfigType } from '@arpadroid/ui/src/components/arpaElement/arpaElement.types';
import { ListResourceItemType, Router } from './list.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { FieldOptionConfigType } from '@arpadroid/forms';

export type ListConfigType = ArpaElementConfigType & {
    allControls?: boolean;
    actions?: FieldOptionConfigType[];
    canCollapse?: boolean;
    controls?: string[];
    defaultView?: string;
    paramNamespace?: string;
    hasControls?: boolean;
    hasInfo?: boolean;
    hasMiniSearch?: boolean;
    hasPager?: boolean;
    hasResource?: boolean;
    hasSearch?: boolean;
    hasSelection?: boolean;
    hasStickyFilters?: boolean;
    heading?: string;
    id?: string;
    isCollapsed?: boolean;
    itemComponent?: typeof ListItem;
    items?: ListItemConfigType[];
    itemsPerPage?: number;
    itemTag?: string;
    listResource?: ListResource;
    noItemsContent?: string;
    noItemsIcon?: string;
    onSearch?: (value: string) => void;
    pageParam?: string;
    perPageParam?: string;
    preProcessItem?: (item: ListConfigType) => ListConfigType;
    preProcessNode?: (node?: ListItem | HTMLElement) => ListItem | HTMLElement;
    renderMode?: 'minimal' | 'full';
    resetScrollOnLoad?: boolean;
    searchParam?: string;
    showResultsText?: boolean;
    sortByParam?: string;
    sortDefault?: string;
    sortDirParam?: string;
    sortOptions?: any[];
    stickyControls?: boolean;
    router?: Router;
    template?: string;
    title?: string | null;
    /** @todo fix type below */
    // viewOptions?: NavLinkConfigType[];
    viewOptions?: Record<string, any>[];
    views?: string[];
    zoneSelector?: string;
    mapItemId?: (item: ListResourceItemType) => string;
};
