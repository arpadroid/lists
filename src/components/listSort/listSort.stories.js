/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { within, waitFor, expect } from '@storybook/test';
import { attrString } from '@arpadroid/tools';

const html = String.raw;

const Default = {
    ...ListStory,
    title: 'Components/Sort',
    parameters: {},
    args: {
        ...ListStory.args,
        id: 'list-sort',
        controls: 'sort',
        title: 'List Sort',
        currentPage: 1
    },
    render: args => {
        return html`<arpa-list ${attrString(args)}>
            <zone name="sort-options">
                <nav-link param-value="title" icon-right="sort_by_alpha" default> Title </nav-link>
                <nav-link param-value="date" icon-right="calendar_month"> Date </nav-link>
            </zone>
            ${Default.renderItemTemplate(args)}
        </arpa-list>`;
    }
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-sort'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement, true, ({ listResource }) => {
            listResource.setSort('title', 'asc');
        });
        const { canvas } = setup;
        const sortByButton = canvas.getByRole('button', { name: /Sort by/i });
        const sortOrderButton = canvas.getByLabelText('Sort order');
        const sortByMenu = sortByButton.closest('icon-menu');
        const sortByCombo = sortByMenu.navigation;
        sortByCombo && (await sortByCombo.promise);
        const combo = within(sortByCombo);

        await step('Renders the sort controls.', async () => {
            expect(sortByButton).toBeInTheDocument();
            const sortedBy = canvas.getByText('Sorted by:');
            expect(sortedBy).toBeInTheDocument();
            expect(sortedBy.parentNode.parentNode).toHaveTextContent('Sorted by: Title');
            expect(sortOrderButton).toHaveTextContent('Sorted ascending');
        });

        await step('Opens the sort menu and verifies "title" sort is selected.', async () => {
            sortByButton.click();
            expect(sortByCombo.querySelector('a[aria-current="page"]')).toHaveTextContent('Title');
            expect(sortByCombo).toBeVisible();
        });

        await step('Verifies items are sorted by title ascending by default.', async () => {
            const items = canvas.getAllByRole('listitem');
            expect(items[0]).toHaveTextContent('Ai Weiwei');
            expect(items[1]).toHaveTextContent('Alexander Calder');
            expect(items[2]).toHaveTextContent('Andy Warhol');
            expect(items[3]).toHaveTextContent('Ansel Adams');
        });

        await step('Sorts item descending by title and verifies items.', async () => {
            sortOrderButton.click();
            await waitFor(() => {
                expect(sortOrderButton).toHaveTextContent('Sorted descending');
                const items = canvas.getAllByRole('listitem');
                expect(items[0]).toHaveTextContent('Zaha Hadid');
                expect(items[1]).toHaveTextContent('Yayoi Kusama');
                expect(items[2]).toHaveTextContent('William Blake');
                expect(items[3]).toHaveTextContent('Wassily Kandinsky');
            });
        });

        await step('Selects "Date" sort option and verifies items', async () => {
            combo.getByText('Date').click();
            await waitFor(() => {
                const sortedBy = canvas.getByText('Sorted by:');
                expect(sortedBy.parentNode.parentNode).toHaveTextContent('Sorted by: Date');
            });
            sortOrderButton.click();
            await waitFor(() => {
                const items = canvas.getAllByRole('listitem');
                expect(items[0]).toHaveTextContent('Leonardo da Vinci');
                expect(items[1]).toHaveTextContent('Michelangelo Buonarroti');
                expect(items[2]).toHaveTextContent('Raphael');
                expect(items[3]).toHaveTextContent('El Greco');
            });
        });
    }
};

export default Default;
