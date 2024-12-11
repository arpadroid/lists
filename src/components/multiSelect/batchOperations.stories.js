/**
 * @typedef {import('../list.js').default} List
 */

import { Default as ListStory } from '../list/stories/list.stories.js';
import { within, waitFor, userEvent, expect } from '@storybook/test';
import { attrString } from '@arpadroid/tools';
const html = String.raw;
const Default = {
    ...ListStory,
    title: 'Components/Batch Operations',
    parameters: {
        
    },
    args: {
        ...ListStory.args,
        id: 'batch-operations',
        allControls: false,
        controls: 'multiselect',
        itemsPerPage: 4,
        title: 'Batch Operations',
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
        const { canvas } = setup;

        await step('Opens and renders Batch Operations panel.', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /No items selected/i });
            await userEvent.click(filtersMenu);

            expect(canvas.getByText('Batch operations')).toBeInTheDocument();
            expect(canvas.getAllByText('No items selected')).toHaveLength(2);

            expect(canvas.getByText('Select all')).toBeInTheDocument();
            expect(canvas.getByText('Show selected only')).toBeInTheDocument();
        });

        await step('Checks an item checkbox and verifies the selected item count.', async () => {
            const checkbox = document.querySelector('.listItem__checkbox');
            await userEvent.click(checkbox);
            await waitFor(() => expect(canvas.getAllByText('1 items selected')).toHaveLength(2));
        });

        await step('Clicks on Select all and verifies the selected item count.', async () => {
            await userEvent.click(canvas.getByText(/Select all/i));
            await waitFor(() => expect(canvas.getAllByText('2 items selected')).toHaveLength(2));
        });

        let selectActionButton;

        await step('Clicks on "Select an action" and verifies the dropdown menu.', async () => {
            selectActionButton = canvas.getByText('Select an action');
            await new Promise(resolve => setTimeout(resolve, 40));
            await userEvent.click(selectActionButton);
        });

        await step('Clicks on "Delete" and verifies the dialog.', async () => {
            const button = await waitFor(() => {
                const actionsField = selectActionButton.closest('select-combo');
                const options = actionsField.optionsNode;
                return within(options).getAllByText('Delete')[0].closest('button');
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            button.click();
        });
    }
};

export default Default;
