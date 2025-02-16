import { ListConfigType } from '../../list/list.types';
import TagItem from './tagItem/tagItem';

export type TagListConfigType = ListConfigType & {
    onDelete?: OnDeleteCallbackType;
};

export type OnDeleteCallbackType = (item: TagItem, event?: Event) => Promise<boolean> | boolean;
