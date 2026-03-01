/**
 * @typedef {import('./listItem.js').default} ListItem
 * @typedef {import('../list/stories/list.stories.types').ListPlaySetupResponseType} ListPlaySetupResponseType
 */
import { within } from 'storybook/test';

/**
 * Sets up the test scenario.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<ListPlaySetupResponseType>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    /** @type {ListItem | null} */
    const listItem = canvasElement.querySelector('list-item');
    await customElements.whenDefined('arpa-list');
    await customElements.whenDefined('list-item');
    await listItem?.promise;
    return { canvas, listItem };
}
