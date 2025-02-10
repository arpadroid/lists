import { ListItemConfigType } from '../../../listItem/listItem.types';
import TagItem from './tagItem';

export type TagItemConfigType = ListItemConfigType & {
    id?: string;
    text?: string;
    value?: string;
    tooltip?: string;
    label?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    onDelete?: (item: TagItem, event: Event) => void;
};
