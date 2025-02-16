import { ListItemConfigType } from '../../../listItem/listItem.types';
import { OnDeleteCallbackType } from '../tagList.types';

export type TagItemConfigType = ListItemConfigType & {
    id?: string;
    text?: string;
    value?: string;
    tooltip?: string;
    label?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    onDelete?: OnDeleteCallbackType;
};
