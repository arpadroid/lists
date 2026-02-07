/**
 * @typedef {import('../../list/list.js').default} List
 * @typedef {import('../../list/list.types').ListConfigType} ListConfigType
 * @typedef {import('./tagList.js').default} TagList
 */
import { attrString } from '@arpadroid/tools';
import { Default as ListStory } from '../../list/stories/stories.util.js';
import { within, userEvent, waitFor, expect, fn } from 'storybook/test';
const html = String.raw;

/** @type {import('@storybook/web-components-vite').Meta} */
const Default = {
    ...ListStory,
    title: 'Lists/Lists/Tag List',
    parameters: {},
    argTypes: {
        id: { control: 'text' },
        title: { control: 'text' },
        controls: { control: 'text' },
        hasInfo: { control: 'boolean' },
        itemsPerPage: { control: 'number' },
        onDelete: { action: 'delete_tag' }
    },
    args: {
        ...ListStory.args,
        id: 'tag-list',
        title: 'Tag List',
        controls: 'search',
        hasInfo: true,
        itemsPerPage: 5,
        onDelete: fn()
    },
    render: (/** @type {ListConfigType} */ args) => {
        return html`<tag-list ${attrString(args)}>
            <template template-type="list-item" has-delete></template>
            <tag-item icon="restaurant">Tag 1</tag-item>
            <tag-item icon="lunch_dining">Tag 2</tag-item>
            <tag-item icon="nightlife">Tag 3</tag-item>
        </tag-list>`;
    }
};

export const Render = Default;

/** @type {import('@storybook/web-components-vite').StoryObj} */
export const Test = {
    args: {
        ...Default.args,
        id: 'tag-list-test',
        title: 'Tag List Test'
    },
    playSetup: async (/** @type {HTMLElement} */ canvasElement) => {
        await customElements.whenDefined('tag-list');
        await customElements.whenDefined('tag-item');
        /** @type {TagList | null} */
        const tagList = canvasElement.querySelector('tag-list');
        return { tagList, canvas: /** @type {any} */ within(canvasElement) };
    },
    play: async (
        /** @type {import('@storybook/web-components-vite').StoryContext} */ { canvasElement, step, args }
    ) => {
        const setup = await Test.playSetup(canvasElement);
        const { canvas, tagList } = setup;
        tagList?.on('delete_tag', args.onDelete);

        await step('Renders the tag list', async () => {
            expect(tagList).toBeInTheDocument();
            const tags = canvas.getAllByRole('listitem');
            expect(tags).toHaveLength(3);
            expect(canvas.getByText('Tag 1')).toBeInTheDocument();
            expect(canvas.getByText('Tag 2')).toBeInTheDocument();
            expect(canvas.getByText('Tag 3')).toBeInTheDocument();
        });

        await step('Sets an event listener on delete and receives callback when delete tag is clicked.', async () => {
            const tag = canvas.getByText('Tag 1').closest('tag-item');
            const deleteButton = within(tag).getByRole('button');
            expect(deleteButton).toBeInTheDocument();
            userEvent.click(deleteButton);
            await waitFor(() => {
                expect(args.onDelete).toHaveBeenCalledWith(tag, undefined, undefined);
            });
        });
    }
};

export default Default;
