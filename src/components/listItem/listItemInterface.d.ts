// import List from '../list/list.js';
// import DialogContext from '../../../dialog/contexts/dialogContext';
// import { IconMenuInterface } from '../../../navigation/components/iconMenu/iconMenu';
// import ListItem from './listItem.js';
import { TagInterface } from '../../../../components/tag/tagInterface';

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
    tags?: TagInterface[];
    onImageLoaded?: (event: Event, image: HTMLElement) => void;
    onImageError?: (event: Event, image: HTMLElement) => void;
}
