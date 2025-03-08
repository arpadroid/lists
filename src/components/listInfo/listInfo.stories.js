/**
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 */

import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent, fireEvent, waitFor, expect } from '@storybook/test';

const Default = {
    ...ListStory,
    title: 'Lists/Components/List Info',
    args: {
        ...ListStory.args,
        id: 'list-info',
        title: 'List Info',
        controls: 'search',
        hasInfo: true,
        itemsPerPage: 5
    },
    render: ListStory.renderSimple
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-list-info',
        title: 'List Info Test'
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas, listNode } = setup;
        const prevBtn = canvas.getByText(/Previous page/i).closest('button');
        const nextBtn = canvas.getByText(/Next page/i).closest('button');
        const refreshBtn = canvas.getByText(/Refresh list/i).closest('button');
        const listInfoClass = '.listInfo__text';
        await step('Renders the list info', async () => {
            expect(refreshBtn).toBeInTheDocument();
            expect(prevBtn).toBeInTheDocument();
            expect(nextBtn).toBeInTheDocument();
            const listInfo = canvasElement.querySelector(listInfoClass);
            expect(listInfo).toHaveTextContent(
                `Showing 1 - 5 out of ${listNode?.listResource?.getTotalItems()} results`
            );
        });

        await step('Clicks on the next page button and verifies the list info', async () => {
            userEvent.click(nextBtn);
            await waitFor(() => {
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent(
                    `Showing 6 - 10 out of ${listNode?.listResource?.getTotalItems()} results`
                );
            });
        });

        await step('Searches for non-existing term and shows no results message.', async () => {
            const input = canvas.getByRole('searchbox');
            const form = input.closest('form');
            form?._config && (form._config.debounce = false);
            await customElements.whenDefined('field-input');
            input.value = 'Some search term';
            await fireEvent.submit(form);
            await waitFor(() => {
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent('No results found for Some search term');
            });
        });

        await step('Searches for "Leon" and expects 1 result to be produced with appropriate message.', async () => {
            const input = canvas.getByRole('searchbox');
            const form = input.closest('form');
            form?._config && (form._config.debounce = false);
            await customElements.whenDefined('field-input');
            input.value = 'Leon';
            await fireEvent.submit(form);
            await waitFor(() => {
                const listInfo = canvasElement.querySelector(listInfoClass);
                expect(listInfo).toHaveTextContent('Found 1 search results for Leon');
            });
            expect(prevBtn).toBeDisabled();
            expect(nextBtn).toBeDisabled();
        });
    }
};

export default Default;
