/**
 * @typedef {import('../list.js').default} List
 * @typedef {import('../list.types.js').ListConfigType} ListConfigType
 * @typedef {import('../../listItem/listItem.js').default} ListItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@storybook/web-components-vite').Meta<ListConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListConfigType>} Story
 */

import { attrString } from '@arpadroid/tools';
import { expect, waitFor } from 'storybook/test';
import { formatDate } from '@arpadroid/tools';
import artists from '../../../mockData/artists.json';

const html = String.raw;

/** @type {Meta} */
const ListStory = {
    title: 'Lists',
    tags: ['docs'],
    component: 'arpa-list',
    parameters: {
        layout: 'padded'
    },
    excludeStories: ['initializeList'],
    args: {
        id: 'static-list',
        title: '',
        hasMessages: true,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true,
        views: ['grid', 'list', 'list-compact', 'grid-compact']
    }
};

/**
 * Initializes the list with the provided payload.
 * @param {string} id
 * @param {any[]} [payload]
 */
export async function initializeList(id, payload = artists) {
    const list = /** @type {List | null} */ (document.getElementById(id));
    /** @type {ListResource | undefined} */
    const resource = list?.listResource;
    resource?.mapItem((/** @type {Record<string, any>} */ item) => {
        const dob = formatDate(item.dateOfBirth, 'YYYY');
        const dod = formatDate(item.dateOfDeath, 'YYYY');
        return {
            ...item,
            title: `${item.firstName} ${item.lastName}`,
            date: dob && dod ? `${dob} - ${dod}` : dob
        };
    });
    resource?.setItems(payload);
}

/** @type {Story} */
export const EmptyList = {
    args: {
        id: 'static-list-test',
        title: 'Empty List',
        controls: []
    },
    parameters: {
        layout: 'padded'
    },
    render: args => {
        return html`<arpa-list ${attrString(args)}></arpa-list>`;
    },
    play: async ({ step, canvas }) => {
        step('Renders an empty list', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Empty List')).toBeInTheDocument();
                expect(canvas.getByText('No items found.')).toBeInTheDocument();
            });
        });
    }
};

export default ListStory;
