/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent } from '@storybook/test';

// const html = String.raw;

const Default = {
    ...ListStory,
    title: 'Components/Sort',
    parameters: {},
    args: {
        ...ListStory.args,
        id: 'list-sort',
        allControls: false,
        hasSort: true,
        title: 'List sort',
    }
};

export const Render = Default;

export const Test = {
    ...Default,
    args: {
        ...Default.args,
        id: 'test-sort',
        allControls: false,
        hasResource: true,
        hasSort: true
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
