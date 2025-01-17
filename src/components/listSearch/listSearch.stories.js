/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { expect, waitFor, fireEvent } from '@storybook/test';

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
        await customElements.whenDefined('field-input');
        const { canvas } = setup;
        const input = canvas.getByRole('searchbox');
        const field = input.closest('search-field');
        const form = input.closest('form');
        form?._config && (form._config.debounce = false);
        await customElements.whenDefined('field-input');
        input.value = '';
        await fireEvent.submit(form);

        await step('Renders the search', async () => {
            expect(input).toHaveAttribute('placeholder', 'List Search Test');
        });

        await step('Searches for "Leon" and expects "Leonardo Da Vinci\'s" item to be highlighted', async () => {
            field.setValue('Leon', true);
            await fireEvent.input(input);
            await waitFor(() => {
                const searchMatch = canvasElement.querySelector('mark');
                expect(searchMatch).toHaveTextContent('Leon');
                expect(searchMatch?.parentNode).toHaveTextContent('Leonardo da Vinci');
            });
        });

        await step('Searches and submits query for "Mitch" expecting two results.', async () => {
            field.setValue('Mich', true);
            await fireEvent.input(input);
            await waitFor(() => {
                document.querySelectorAll('mark')?.forEach(element => {
                    expect(element).toHaveTextContent('Mich');
                    expect(element?.parentNode).toHaveTextContent('Michelangelo Buonarroti');
                });
            });
            await fireEvent.submit(form);
            await waitFor(() => {
                const marks = canvasElement.querySelectorAll('mark');
                expect(marks).toHaveLength(2);
                expect(marks[0]).toHaveTextContent('Mich');
                expect(marks[0]?.parentNode).toHaveTextContent('Michelangelo Buonarroti');
                expect(marks[1]).toHaveTextContent('Mich');
                expect(marks[1]?.parentNode).toHaveTextContent('Jean-Michel Basquiat');
                expect(canvasElement.querySelector('list-info')).toHaveTextContent('Found 2 search results for Mich.');
            }); 
        });
    }
};

export default Default;
