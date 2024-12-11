/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent } from '@storybook/test';
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
        title: 'List Sort'
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
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Opens the sort menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Sort/i });
            userEvent.click(filtersMenu);
        });
    }
};

export default Default;
