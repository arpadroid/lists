/**
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 */

import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent, within, waitFor, expect } from '@storybook/test';

const Default = {
    ...ListStory,
    title: 'Lists/Controls/Views',
    args: {
        ...ListStory.args,
        controls: 'views',
        id: 'list-views',
        title: 'List Views'
    },
    render: ListStory.renderSimple
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-views',
        title: 'List Views Test',
        defaultView: 'list',
        views: 'list,grid'
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas, listNode } = setup;
        listNode?.setView('list');

        /** @type {IconMenu | null} */
        const iconMenu = canvasElement.querySelector('list-views icon-menu');
        const viewsMenu = /** @type {HTMLElement | null} */ (iconMenu?.navigation);
        if (!viewsMenu) {
            throw new Error('Views menu not found');
        }
        await step('Renders the menu with the expected views', async () => {
            expect(viewsMenu).toBeInTheDocument();

            const listView = within(viewsMenu).getByText('List');
            const gridView = within(viewsMenu).getByText('Grid');
            expect(listView).toBeInTheDocument();
            expect(gridView).toBeInTheDocument();
            expect(viewsMenu?.querySelectorAll('nav-link')).toHaveLength(2);
        });

        await step('Opens the Views menu and verifies the list item is selected', async () => {
            const viewsButton = canvas.getByRole('button', { name: /Views/i });
            userEvent.click(viewsButton);
            const listView = within(viewsMenu).getByText('List').closest('button');
            await waitFor(() => {
                expect(listView).toHaveAttribute('aria-current', 'location');
            });
            expect(listNode).toHaveClass('listView--list');
        });

        await new Promise(resolve => setTimeout(resolve, 300));

        await step('Clicks on the Grid view and verifies the list item is selected', async () => {
            const gridView = within(viewsMenu).getByText('Grid').closest('button');
            gridView && userEvent.click(gridView);
            await waitFor(() => {
                expect(gridView).toHaveAttribute('aria-current', 'location');
                expect(listNode).toHaveClass('listView--grid');
            });
        });
    }
};

export default Default;
