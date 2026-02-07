/**
 * @typedef {import('../list.js').default} List
 * @typedef {import('../../listItem/listItem.js').default} ListItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('./list.stories.types').ListPlaySetupPayloadType} ListPlaySetupPayloadType
 * @typedef {import('./list.stories.types').ListPlaySetupResponseType} ListPlaySetupResponseType
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 */

import { attrString } from '@arpadroid/tools';
import { within, expect, waitFor } from 'storybook/test';
import { Story, DefaultStory } from '../stories/stories.util.js';

const html = String.raw;
const ListStory = { ...Story };

export const Default = { ...DefaultStory };

export const Test200 = {
    ...Default,
    args: {
        ...Default.args,
        id: 'test-200',
        itemsPerPage: 200
    }
};

export const EmptyList = {
    title: 'Lists/Empty List',
    args: {
        id: 'static-list-test',
        title: 'Empty List',
        controls: ' '
    },
    parameters: {
        layout: 'padded'
    },
    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list ${attrString(args)}></arpa-list>`;
    },
    /**
     * Sets up the test scenario.
     * @param {HTMLElement} canvasElement
     * @returns {Promise<{ canvas: any, listNode: HTMLElement | null }>}
     */
    playSetup: async (/** @type {HTMLElement} */ canvasElement) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        const canvas = within(canvasElement);
        /** @type {List | null} */
        const listNode = canvasElement.querySelector('arpa-list');
        /** @type {ListResource | undefined} */

        return { canvas, listNode };
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const { canvas } = await EmptyList.playSetup(canvasElement);
        step('Renders an empty list', async () => {
            await waitFor(() => {
                expect(canvas.getByText('No items found.')).toBeInTheDocument();
            });
        });
    }
};

export default ListStory;
