/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent } from '@storybook/test';
import { attrString } from '@arpadroid/tools';
const html = String.raw;

const Default = {
    ...ListStory,
    title: 'Components/Views',
    parameters: {},
    args: {
        ...ListStory.args,
        id: 'list-views',
        allControls: false,
        hasViews: true,
        title: 'List Views',
    },
    render: args => {
        return html` <arpa-list ${attrString(args)}> ${ListStory.renderItemTemplate(args)} </arpa-list> `;
    }
};

export const Render = Default;

export const Test = {
    ...Default,
    args: {
        ...Default.args,
        id: 'test-views'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Opens the Views menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Views/i });
            userEvent.click(filtersMenu);
        });
    }
};

export default Default;
