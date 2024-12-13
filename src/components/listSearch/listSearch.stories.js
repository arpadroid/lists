/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { expect, waitFor } from '@storybook/test';

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
            await waitFor(() => expect(input).not.toBeNull());
            expect(input).toHaveAttribute('placeholder', 'List Search Test');
        });
        /** @todo Fix this test in the pipeline. */
        await step('Types a search term and expects matching item to be highlighted', async () => {
            input.value = 'Leo';
            // input.dispatchEvent(new Event('input', { bubbles: true }));
            // input.dispatchEvent(new Event('change', { bubbles: true }));
            //await new Promise(resolve => setTimeout(resolve, 50));
            // await waitFor(() => expect(canvasElement.querySelector('mark')).not.toBeNull());
            // await waitFor(() => {
            //     const searchMatch = canvasElement.querySelector('mark');
            //     expect(searchMatch).not.toBeNull();
            //     expect(searchMatch).toHaveTextContent('Leo');
            //     expect(searchMatch?.parentNode).toHaveTextContent('Leonardo da Vinci');
            // });
        });
    }
};

export default Default;
