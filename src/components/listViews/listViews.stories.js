/**
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 */

import { attrString } from '@arpadroid/tools';
import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent, within, waitFor, expect } from '@storybook/test';

const html = String.raw;
const Default = {
    ...ListStory,
    title: 'Lists/Controls/Views',
    args: {
        ...ListStory.args,
        hasPager: false,
        controls: 'views',
        id: 'list-views',
        title: 'List Views',
        itemsPerPage: 10,
        hasInfo: false
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
        await listNode?.setView('list');

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

        await step('Clicks on the Grid view and verifies the list item is selected', async () => {
            const gridView = within(viewsMenu).getByText('Grid').closest('button');
            gridView && userEvent.click(gridView);
            await waitFor(() => {
                expect(gridView).toHaveAttribute('aria-current', 'location');
                expect(listNode).toHaveClass('listView--grid');
            });
        });

        await new Promise(resolve => setTimeout(resolve, 300));

        await step('Returns to the List view and verifies the list item is selected', async () => {
            const listView = within(viewsMenu).getByText('List').closest('button');
            listView && userEvent.click(listView);
            await waitFor(() => {
                expect(listView).toHaveAttribute('aria-current', 'location');
                expect(listNode).toHaveClass('listView--list');
            });
        });
    }
};

export const CustomViews = {
    args: {
        ...Default.args,
        id: 'custom-views',
        title: 'Custom Views',
        defaultView: 'custom-view',
        views: 'list,custom-view'
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    // play: async ({ canvasElement, step }) => {
    //     const setup = await Default.playSetup(canvasElement);
    //     const { canvas, listNode } = setup;
    //     listNode?.setView('list');
    //     /** @type {IconMenu | null} */
    //     const iconMenu = canvasElement.querySelector('list-views icon-menu');
    //     // const viewsMenu = /** @type {HTMLElement} */ (iconMenu?.navigation);
    //     // await step('Renders the menu with the expected views', async () => {
    //     //     expect(viewsMenu).toBeInTheDocument();
    //     //     const listView = within(viewsMenu).getByText('List');
    //     //     // const gridView = within(viewsMenu).getByText('Grid');
    //     //     expect(listView).toBeInTheDocument();
    //     //     // expect(gridView).toBeInTheDocument();
    //     //     // expect(viewsMenu?.querySelectorAll('nav-link')).toHaveLength(2);
    //     // });
    // },
    /**
     * Renders the list component.
     * @param {Record<string, unknown>} args
     * @returns {string}
     */
    render(args) {
        return html`<arpa-list ${attrString(args)}>
            ${ListStory.renderItemTemplate()}
            <template type="view" id="custom-view" label="Custom View" icon="dashboard">
                {icon} {nav}
                {contentWrapper}
                {iconRight} {image}
            </template>
        </arpa-list>`;
    }
};

export default Default;
