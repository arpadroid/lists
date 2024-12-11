import { Default as ListStory } from '../list/stories/list.stories.js';

import { userEvent } from '@storybook/test';

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

        await step('Clicks on filters menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Filters/i });
            userEvent.click(filtersMenu);
        });
    }
};

export default Default;
