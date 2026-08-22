/**
 * @typedef {import('../list.js').default} List
 * @typedef {import('../list.types.js').ListConfigType} ListConfigType
 * @typedef {import('../../listItem/listItem.js').default} ListItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@storybook/web-components-vite').Meta<ListConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListConfigType>} Story
 */

import { attrString } from '@arpadroid/tools';
import { expect, waitFor, userEvent } from 'storybook/test';
import { formatDate } from '@arpadroid/tools';
import artists from '../../../mockData/artists.json';

const html = String.raw;

/** @type {Meta} */
const ListStory = {
    title: 'Lists/List',
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
        controls: [],
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
export const DataDrivenList = {
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        id: 'static-list',
        title: 'List Component',
        itemsPerPage: 5,
        hasResource: true
    },

    render: args => {
        return html`
            <arpa-list ${attrString(args)}>
                <template
                    template-type="list-item"
                    template-mode="append"
                    truncate-content="100"
                    image="{portraitURL}"
                    title="{firstName} {lastName}"
                    truncate-button
                    has-selection
                >
                    <arpa-zone name="tags">
                        <tag-item icon="calendar_month">{date}</tag-item>
                        <tag-item icon="palette">{movement}</tag-item>
                    </arpa-zone>
                    <arpa-zone name="content">{legacy}</arpa-zone>
                </template>
            </arpa-list>
        `;
    },
    play: async ({ canvasElement, step, canvas, args }) => {
        /** @type {List | null} */
        const listNode = canvasElement.querySelector('arpa-list');
        await listNode?.promise;
        listNode && (await initializeList(listNode?.id));

        await step('Sets page to 1 and renders items', async () => {
            await new Promise(resolve => setTimeout(resolve, 100));

            const button = canvas.queryByRole('link', { name: '1' });
            button && (await userEvent?.click(button));
        });

        await step('Renders list items from the resource', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Phidias')).toBeInTheDocument();
                const items = listNode?.listResource?.getItems() || [];
                expect(canvas.getByText(items[0].legacy)).toBeInTheDocument();
                expect(canvas.getByText('Classical Greek')).toBeInTheDocument();
            });
        });

        await step('Changes page and renders new items', async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            const page2Button = canvas.getByRole('link', { name: '2' });
            await userEvent.click(page2Button);
            await waitFor(() => {
                const items = listNode?.listResource?.getItems() || [];
                expect(canvas.getByText(items[args.itemsPerPage || 0].legacy)).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const Test200 = {
    args: {
        title: 'List Component - 200 items',
        id: 'test-200',
        itemsPerPage: 200
    },
    render: DataDrivenList.render,
    play: async ({ canvasElement }) => {
        /** @type {List | null} */
        const listNode = canvasElement.querySelector('arpa-list');
        await listNode?.promise;
        listNode && (await initializeList(listNode?.id));
    }
};

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
