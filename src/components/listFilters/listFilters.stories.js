import { Default as ListStory } from '../list/stories/list.stories.js';
import { attrString } from '@arpadroid/tools';

import { userEvent } from '@storybook/test';

const html = String.raw;

const Default = {
    ...ListStory,
    title: 'Components/Filters',
    args: {
        ...ListStory.args,
        id: 'list-filters',
        allControls: false,
        hasFilters: true,
        title: 'List Filters'
    },
    render: args => {
        return html`
            <arpa-list ${attrString(args)}>
                <zone name="list-filters"> </zone>
                ${ListStory.renderItemTemplate(args)}
            </arpa-list>
        `;
    }
};

export const Render = Default;

export const Test = {
    ...Default,
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
