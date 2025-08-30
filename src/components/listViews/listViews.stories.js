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
        itemsPerPage: 40,
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

export const CustomView = {
    args: {
        ...Default.args,
        id: 'custom-view',
        title: 'Custom View',
        titleIcon: 'dashboard',
        defaultView: 'custom-view',
        views: 'list,custom-view',
        truncateContent: 0
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { listNode } = setup;
        await step('Sets list to custom view', async () => {
            await listNode?.setView('custom-view');
            expect(listNode).toHaveClass('listView--custom-view');
        });
    },
    /**
     * Renders the list component.
     * @param {Record<string, unknown>} args
     * @returns {string}
     */
    render(args) {
        return html`
            <arpa-list ${attrString(args)}>
                <zone name="messages">
                    <info-message>
                        This example demonstrates how to create a custom view for the list component. The custom view is
                        defined as a template with the type "view" and an id of our choice e.g. "custom-view". The
                        template can be styled using CSS and can include any HTML elements or components.
                        <br />
                    </info-message>
                </zone>

                <!-- Custom View Template -->

                <template
                    type="view"
                    id="custom-view"
                    label="Custom View"
                    icon="dashboard"
                    element-title-icon="dashboard"
                >
                    <div class="listItem__main">
                        {image}
                        <div class="listItem__customView__content">
                            <div class="listItem__customView__header">{titleContainer}{nav}</div>
                            {children}{tags}
                        </div>
                    </div>
                </template>

                ${ListStory.renderItemTemplate({ elementTruncateContent: 180, elementTitleIcon: 'dashboard' })}
            </arpa-list>

            <!-- Custom View Styles -->

            <style>
                #storybook-root {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .listItem--custom-view {
                    overflow: visible;
                    margin: 1rem 0;

                    .listItem__content {
                        display: block;
                    }

                    .listItem__image {
                        float: right;
                        margin: 0rem 0 1.5rem 1.5rem;
                        width: 100px;
                    }

                    .listItem__main {
                        flex: none;
                        display: block;
                        
                        margin-top: 10px;
                        max-width: 100%;
                    }

                    .listItem__customView__header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0.5rem;
                        gap: 1rem;
                    }

                    .listItem__nav {
                        align-self: flex-start;
                        margin-left: 0;
                        margin-right: 0.5rem;

                        .iconButton {
                            --icon-button-size: 1.5rem;
                        }
                    }

                    
                }
            </style>
        `;
    }
};

export default Default;
