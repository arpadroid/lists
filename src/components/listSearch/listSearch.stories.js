/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { expect } from '@storybook/test';

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
        /** @todo Fix this test in the pipeline */
        // await step('Types a search term and expects matching item to be highlighted', async () => {
        //     input.value = 'Leo';

        //     await waitFor(() => {
        //         const searchMatch = canvas.getByRole('mark');
        //         console.log('searchMatch', searchMatch);
        //         expect(searchMatch).toBeInTheDocument();
        //         expect(searchMatch).toHaveTextContent('Leo');
        //         expect(searchMatch?.parentNode).toHaveTextContent('Leonardo da Vinci');
        //     });
        // });
    }
};

export default Default;
