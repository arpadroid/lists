import List from '../list/list';
import ListItem from './listItem';
import { ArpaElementConfigType, ImageConfigType } from '@arpadroid/ui';
import { TagItemConfigType } from '../lists/tagList/tagItem/tagItem.types';
import { NavListConfigType } from '@arpadroid/navigation';

export type ListItemImageTypes =
    | 'list_compact'
    | 'list'
    | 'grid'
    | 'grid_compact'
    | 'grid_large'
    | 'thumbnail'
    | 'thumbnail_vertical'
    | 'full_screen';

export type ListItemImageSizeType = {
    width?: number | 'auto';
    height?: number | 'auto';
};

export type ListItemImageSizesType = Record<
    ListItemImageTypes | string,
    ListItemImageSizeType | (() => ListItemImageSizeType)
>;

export type ListItemConfigType = ArpaElementConfigType & {
    // defaultImage?: string;
    // dialogContext?: DialogContext;
    // nav?: IconMenuInterface;
    action?: (event: Event, item: ListItem) => void;
    content?: string;
    hasSelection?: boolean;
    icon?: string;
    id?: string;
    image?: string;
    imageAlt?: string;
    imageConfig?: ImageConfigType;
    imageSize?: 'string' | ListItemImageSizesType;
    imageSizes?: ListItemImageSizesType;
    lazyLoad?: boolean;
    lazyLoadImage?: boolean;
    link?: string;
    list?: List;
    listSelector?: string;
    nav?: NavListConfigType;
    onImageError?: (event: Event, item: ListItem) => void;
    onImageLoaded?: (event: Event, item: ListItem) => void;
    renderMode?: 'minimal' | 'full';
    rhsContent?: string;
    role?: string;
    selectedClass?: string;
    subTitle?: string;
    tags?: TagItemConfigType[];
    template?: HTMLTemplateElement | undefined;
    title?: string;
    titleIcon?: string;
    titleLink?: string;
    titleTag?: string;
    truncateContent?: number;
    wrapperComponent?: string;
};
