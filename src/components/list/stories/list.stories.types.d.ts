import { within } from 'storybook/test';
import { ListResource } from '@arpadroid/resources';
import List from '../../list/list.js';
import ListItem from '../../listItem/listItem.js';

export type ListPlaySetupPayloadType = {
    listResource?: ListResource;
    listNode?: List | null;
    listItem?: ListItem | null;
};

export type ListPlaySetupResponseType = {
    canvas?: ReturnType<typeof within>;
    listNode?: List | null;
    listItem?: ListItem | null;
    listResource?: ListResource | null;
};
