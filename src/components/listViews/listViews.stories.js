/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent } from '@storybook/test';

const Default = {
    ...ListStory,
    title: 'Components/Views',
    parameters: {},
    args: {
        ...ListStory.args,
        controls: 'views',
        id: 'list-views',
        title: 'List Views'
    },
    render: ListStory.renderSimple
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-views',
        title: 'List Views Test'
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
