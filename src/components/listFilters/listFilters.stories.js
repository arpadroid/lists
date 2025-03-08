/**
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').NumberField} NumberField
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { within, userEvent, expect, waitFor, fireEvent } from '@storybook/test';

const Default = {
    ...ListStory,
    title: 'Lists/Components/Filters',
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
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas, listNode } = setup;
        const filtersBtn = canvas.getByRole('button', { name: /Filters/i });
        const filtersNode = filtersBtn.closest('icon-menu');
        const filtersCombo = filtersNode.navigation;
        const combo = within(filtersCombo);
        /** @type {FormComponent | null} */
        const filtersForm = filtersCombo.querySelector('form');
        filtersForm?._config && (filtersForm._config.debounce = 0);

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
            const pageField = /** @type {NumberField} */ (pageInput.closest('number-field'));
            pageField?.setValue(2);
            if (!filtersForm) {
                throw new Error('Filters form not found');
            }
            fireEvent.submit(filtersForm);
            await waitFor(() => {
                expect(setup.listResource?.getPage()).toEqual(2);
                const currPage = canvas.getByLabelText('Current page');
                expect(currPage).toHaveAttribute('value', '2');
            });
        });

        await step('Changes the per page, submits the form and verifies the per page change', async () => {
            const perPageInput = combo.getByLabelText(/Per page/i);

            const perPageField = /** @type {SelectCombo} */ (perPageInput.closest('select-combo'));
            perPageInput.click();
            await waitFor(() => {
                expect(perPageField?.optionsNode).toBeInTheDocument();
            });
            if (!(perPageField.optionsNode instanceof HTMLElement)) {
                throw new Error('Options node not found');
            }
            const options = within(perPageField.optionsNode);
            expect(perPageField.getValue()).toEqual('10');
            expect(listNode?.getItemNodes()).toHaveLength(10);
            const option5 = options.getByText('5').closest('button');
            if (!option5) {
                throw new Error('Option 5 not found');
            }
            await userEvent.click(option5);
            await waitFor(() => {
                expect(setup.listResource?.getPerPage()).toEqual(5);
                const currPage = canvas.getByLabelText('Current page');
                expect(currPage).toHaveAttribute('value', '1');
                expect(canvasElement.querySelectorAll('list-item')).toHaveLength(5);
            });
        });
    }
};

export default Default;
