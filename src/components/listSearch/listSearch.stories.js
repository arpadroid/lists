/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { userEvent, expect } from '@storybook/test';

const Default = {
    ...ListStory,
    title: 'Components/Search',
    parameters: {},
    args: {
        ...ListStory.args,
        controls: 'search',
        id: 'list-search',
        title: null,
        hasInfo: true,
        hasSelection: null,
        searchPlaceholder: 'List Search'
    },
    render: ListStory.renderSimple
};

export const Render = Default;

export const Test = {
    args: {
        ...Default.args,
        id: 'test-search',
        searchPlaceholder: 'List Search Test'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;
        const input = canvas.getByRole('searchbox');
        await step('Renders the search', async () => {
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('placeholder', 'List Search Test');
        });

        await step('Types a search term and expects matching item to be highlighted', async () => {
            await userEvent.type(input, 'Leo');
            const searchMatch = canvasElement.querySelector('.searchMatch');
            expect(searchMatch).toHaveTextContent('Leo');
            expect(searchMatch.parentNode).toHaveTextContent('Leonardo da Vinci');
        });
    }
};

export default Default;
