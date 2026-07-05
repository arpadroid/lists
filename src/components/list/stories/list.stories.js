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
import { playSetup, renderItemTemplate } from './list.stories.utils.js';

const html = String.raw;

/** @type {Meta} */
const ListStory = {
    title: 'Lists/List',
    tags: ['docs'],
    component: 'arpa-list',
    parameters: {
        layout: 'padded'
    },
    args: {
        id: 'static-list',
        title: '',
        hasMessages: true,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true,
        controls: [],
        views: ['grid', 'list', 'list-compact', 'grid-compact']
    },
    render: args => {
        // delete args.text;
        return html`
            <arpa-list ${attrString(args)} views="grid, list">
                <list-item title="Some title" title-link="/some-link" image="/some-image.jpg">
                    A Demo list item.
                </list-item>
            </arpa-list>
            <script>
                // http://museovaquero.local/api/gallery/item/get-items?galleryList-search=&galleryList-sortBy=modified_date&galleryList-sortDir=desc&galleryList-state=&galleryList-page=2&galleryList-perPage=50&public=
                customElements.whenDefined('arpa-list').then(() => {
                    /** @type {List} */
                    const list = document.getElementById('test-list');
                });
            </script>
        `;
    }
};

/** @type {Story} */
export const DataDrivenList = {
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        ...ListStory.args,
        id: 'static-list',
        title: 'List Component',
        itemsPerPage: 10,
        hasResource: true
    },
    play: async ({ canvasElement }) => {
        await playSetup(canvasElement);
    },
    render: args => {
        return html` <arpa-list ${attrString(args)}> ${renderItemTemplate()} </arpa-list> `;
    }
};

/** @type {Story} */
export const EmptyList = {
    // name: 'Empty List',
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
    play: async ({ canvasElement, step }) => {
        const { canvas } = await playSetup(canvasElement, false);
        step('Renders an empty list', async () => {
            await waitFor(() => {
                expect(canvas.getByText('No items found.')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const Test200 = {
    ...DataDrivenList,
    args: {
        ...DataDrivenList.args,
        id: 'test-200',
        itemsPerPage: 200
    }
};

export default ListStory;
