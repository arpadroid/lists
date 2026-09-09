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

/**
 * Initializes the list with the provided payload.
 * @param {HTMLElement} canvasElement
 * @param {any[]} [payload]
 * @returns {Promise<List | null>} The initialized list element.
 */
export async function initializeList(canvasElement, payload = artists) {
    const list = /** @type {List} */ (canvasElement.querySelector('arpa-list'));
    await list?.onRendered();
    await list?.onNodesReady();
    // const list = /** @type {List | null} */ (document.getElementById(id));
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
    await resource?.setItems(payload);
    return list;
}

/** @type {Meta} */
const DataDrivenListStory = {
    title: 'Lists/DataDriven',
    tags: ['docs'],
    component: 'arpa-list',
    excludeStories: ['initializeList'],
    parameters: {
        layout: 'flexColumn'
    },
    beforeEach: async ({ canvasElement }) => {
        await initializeList(canvasElement);
    },
    args: {
        id: 'data-driven-list',
        title: 'List Component',
        itemsPerPage: 5,
        hasResource: true,
        hasItemsTransition: true
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
    play: async ({ canvasElement }) => {
        await initializeList(canvasElement);
    }
};

/** @type {Story} */
export const Render = {
    args: {
        itemsPerPage: 1
    }
};

/** @type {Story} */
export const Test300 = {
    args: {
        title: 'List Component - 300 items',
        id: 'test-300',
        itemsPerPage: 300
    },
    play: async ({ canvasElement, step }) => {
        const listNode = await initializeList(canvasElement);
        await listNode?.onNodesReady();
        await new Promise(resolve => setTimeout(resolve, 100));
        const resource = /** @type {ListResource | undefined} */ (listNode?.listResource);
        await step('Expect all items to be rendered', async () => {
            await waitFor(() => {
                expect(canvasElement.querySelectorAll('.listItem__title')).toHaveLength(resource?.getTotalItems());
            });
        });
    }
};

/** @type {Story} */
export const Test = {
    args: {
        id: 'data-driven-list-test'
    },
    play: async ({ canvasElement, step, canvas, args }) => {
        /** @type {List | null} */

        const listNode = await initializeList(canvasElement);
        await listNode?.onNodesReady();

        await step('Sets page to 1 and renders items', async () => {
            const button = await waitFor(() => canvas.queryByRole('link', { name: '1' }));
            button && (await userEvent?.click(button));
        });

        await step('Renders list items from the resource', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Phidias')).toBeInTheDocument();
                const items = listNode?.listResource?.getItems() || [];
                expect(canvas.getByText(items[1].legacy)).toBeInTheDocument();
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

export default DataDrivenListStory;
