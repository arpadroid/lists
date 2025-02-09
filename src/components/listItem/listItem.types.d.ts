import List from '../list/list';
import ListItem from './listItem';
import { ArpaElementConfigType, ImageConfigType } from '@arpadroid/ui';
import { TagItemConfigType } from '../lists/tagList/tagItem/tagItem.types';

export type ListItemImageSizeType = {
    width?: number | 'auto';
    height?: number | 'auto';
};

export type ListItemImageSizesType = Record<string, ListItemImageSizeType | (() => ListItemImageSizeType)>;

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
    lazyLoad?: boolean;
    link?: string;
    onImageError?: (event: Event, item: ListItem) => void;
    onImageLoaded?: (event: Event, item: ListItem) => void;
    rhsContent?: string;
    selectedClass?: string;
    truncateContent?: number;
    wrapperComponent?: string;
    role?: string;
    listSelector?: string;
    lazyLoadImage?: boolean;
    imageSize?: 'string' | ListItemImageSizesType;
    imageSizes?: ListItemImageSizesType;
    subTitle?: string;
    tags?: TagItemConfigType[];
    template?: HTMLTemplateElement;
    title?: string;
    titleIcon?: string;
    titleLink?: string;
    imageConfig?: ImageConfigType;
    list?: List;
    renderMode?: 'minimal' | 'full';
    nav?: any /** @todo Add Nav Config Type Here! */;
};
