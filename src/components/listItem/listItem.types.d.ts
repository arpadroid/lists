import List from '../list/list';
import ListItem from './listItem';
import { ArpaElementConfigType, ImageConfigType } from '@arpadroid/ui';
import { TagItemConfigType } from '../lists/tagList/tagItem/tagItem.types';
import { BaseNavListConfigType } from '../../@types/base.types';

export type ListItemImageTypes =
    | 'adaptive'
    | 'list_compact'
    | 'list'
    | 'small'
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
    // dialogContext?: DialogContext;
    action?: (event: Event, item: ListItem) => void;
    content?: string;
    hasSelection?: boolean;
    hasImageThumbnail?: boolean;
    icon?: string;
    iconRight?: string;
    id?: string;
    image?: string;
    imageAlt?: string;
    imageConfig?: ImageConfigType;
    imageSize?: string | ListItemImageSizesType;
    defaultImageSize?: ListItemImageTypes | 'string';
    imagePosition?: string;
    imageSizes?: ListItemImageSizesType;
    imagePreview?: boolean,
    lazyLoad?: boolean;
    lazyLoadImage?: boolean;
    link?: string;
    list?: List;
    listSelector?: string;
    nav?: BaseNavListConfigType;
    onImageError?: (event: Event, item: ListItem) => void;
    onImageLoaded?: (event: Event, item: ListItem) => void;
    previewControls?: string[];
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
    truncateButton?: boolean | string;
    wrapperComponent?: string;
};


export type ListItemViewConfigType = {
    id: string;
    label?: string;
    icon?: string;
    template?: string;
    show?: boolean;
    className?: string;
    onSelect?: (event: Event, item: ListItem) => void;
};