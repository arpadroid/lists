import { TagItemInterface } from '../lists/tagList/tagItem/tagItemInterface';

export interface ListItemInterface {
    id?: string;
    link?: string;
    action?: () => void;
    title?: string;
    titleLink?: string;
    titleIcon?: string;
    subTitle?: string;
    icon?: string;
    image?: string;
    imageAlt?: string;
    hasSelection?: boolean;
    rhsContent?: string;
    // dialogContext?: DialogContext;
    // defaultImage?: string;
    // nav?: IconMenuInterface;
    tags?: TagItemInterface[];
    onImageLoaded?: (event: Event, image: HTMLElement) => void;
    onImageError?: (event: Event, image: HTMLElement) => void;
}
