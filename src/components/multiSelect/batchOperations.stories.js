/**
 * @typedef {import('../list.js').default} List
 */

import { Default as ListStory } from '../list/stories/list.stories.js';
import { within, waitFor, userEvent, expect, fireEvent } from '@storybook/test';
import { attrString } from '@arpadroid/tools';
const html = String.raw;
const Default = {
    ...ListStory,
    title: 'Components/Batch Operations',
    parameters: {},
    args: {
        ...ListStory.args,
        id: 'batch-operations',
        allControls: false,
        controls: 'multiselect',
        itemsPerPage: 4,
        title: 'Batch Operations'
    },
    render: args => {
        return html`
            <arpa-list ${attrString(args)}>
                <zone name="batch-operations">
                    <select-option value="delete" icon="delete">
                        Delete
                        <delete-dialog title="Delete items">
                            <zone name="content"> Are you sure you want to delete the selected items? </zone>
                        </delete-dialog>
                    </select-option>
                </zone>
                ${ListStory.renderItemTemplate(args)}
            </arpa-list>
        `;
    }
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-batch-operations',
        itemsPerPage: 2
    },
    play: async ({ canvasElement, step }) => {
        const setup = await ListStory.playSetup(canvasElement);
        await waitFor(() => expect(document.querySelector('.listMultiSelect__form')).toBeInTheDocument());
        const { canvas } = setup;
        const formNode = document.querySelector('.listMultiSelect__form');
        const getForm = () => within(formNode);
        const form = getForm();

        const getToggleAllCheckbox = () => formNode.querySelector('input[type="checkbox"][name="toggleAll"]');
        const getItemCheckbox = () => document.querySelector('.listItem__checkbox');

        await step('Opens and renders Batch Operations panel.', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /No items selected/i });
            await userEvent.click(filtersMenu);

            expect(form.getByText('Batch operations')).toBeInTheDocument();
            expect(form.getAllByText('No items selected')).toHaveLength(1);

            expect(form.getByText('Select all')).toBeInTheDocument();
            expect(form.getByText('Show selected only')).toBeInTheDocument();
        });

        await step('Checks an item checkbox and verifies the selected item count.', async () => {
            await waitFor(() => expect(getItemCheckbox()).toBeInTheDocument());
            const checkbox = getItemCheckbox();
            fireEvent.click(checkbox);
            await waitFor(() => expect(form.getAllByText('1 items selected')).toHaveLength(1));
        });

        await step('Clicks on Select all and verifies the selected item count.', async () => {
            await waitFor(() => expect(getToggleAllCheckbox()).toBeInTheDocument());
            getToggleAllCheckbox().click();
            await waitFor(() => expect(form.getByText('2 items selected')).toBeInTheDocument());
        });

        const selectActionButton = form.getByText('Select an action');

        await step('Clicks on "Select an action" and verifies the dropdown menu.', async () => {
            await new Promise(resolve => setTimeout(resolve, 40));
            selectActionButton.click();
        });

        await step('Clicks on "Delete" and verifies the dialog.', async () => {
            await waitFor(() => {
                const actionsField = selectActionButton.closest('select-combo');
                const options = actionsField.optionsNode;
                const button = within(options).getAllByText('Delete')[0].closest('button');
                button.click();
            });
        });
    }
};

export default Default;
