import { Default as ListStory } from '../list/stories/list.stories.js';

import { within, userEvent, expect, waitFor, fireEvent } from '@storybook/test';

const Default = {
    ...ListStory,
    title: 'Components/Filters',
    args: {
        ...ListStory.args,
        id: 'list-filters',
        controls: 'filters',
        title: 'List Filters'
    },
    render: ListStory.renderSimple
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-filters'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;
        const filtersBtn = canvas.getByRole('button', { name: /Filters/i });
        const filtersNode = filtersBtn.closest('icon-menu');
        const filtersCombo = filtersNode.navigation;
        const combo = within(filtersCombo);
        const filtersForm = filtersCombo.querySelector('form');

        await step('Renders the filters menu control', async () => {
            expect(filtersBtn).toBeInTheDocument();
            expect(filtersBtn).toHaveTextContent('Filters');
        });

        await step('Clicks on filters menu and opens the filters panel', async () => {
            userEvent.click(filtersBtn);
            await waitFor(() => {
                expect(filtersCombo).toBeVisible();
            });
        });

        await step('Renders the filters panel with the pagination controls', async () => {
            const pagination = combo.getByText(/Pagination/i);
            expect(pagination).toBeInTheDocument();
            const perPageInput = combo.getByLabelText(/Per page/i);
            const pageInput = combo.getByLabelText('Page');
            expect(perPageInput).toBeInTheDocument();
            expect(pageInput).toBeInTheDocument();
        });

        await step('Changes the page, submits the form and verifies the page change', async () => {
            const pageInput = combo.getByLabelText('Page');
            const pageField = pageInput.closest('number-field');
            pageField.setValue(2);
            fireEvent.submit(filtersForm);
            await waitFor(() => {
                expect(setup.listResource.getPage()).toEqual(2);
                const currPage = canvas.getByLabelText('Current page');
                expect(currPage).toHaveAttribute('value', '2');
            });
        });

        await step('Changes the per page, submits the form and verifies the per page change', async () => {
            const perPageInput = combo.getByLabelText(/Per page/i);
            const perPageField = perPageInput.closest('select-combo');

            perPageInput.click();
            // await waitFor(() => {
            //     expect(perPageField.optionsNode).toBeInTheDocument();
            // });

            /**
             * @todo Complete the test.
             */

            // const options = within(perPageField.optionsNode);
            // expect(perPageField.getValue()).toEqual('10');
            // const option50 = options.getByText( '5').closest('button');

            // await new Promise((resolve) => setTimeout(resolve, 500));
            // option50.click();
            // await userEvent.click(option50);

            // expect(canvas.getAllByRole('listitem')).toHaveLength(10);
            // perPageField.setValue(50);
            // fireEvent.submit(filtersForm);
            // await waitFor(() => {
            //     expect(setup.listResource.getPerPage()).toEqual(50);
            //     const currPage = canvas.getByLabelText('Current page');
            //     expect(currPage).toHaveAttribute('value', '1');
            // });
        });
    }
};

export default Default;
