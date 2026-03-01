/**
 * @typedef {import('../../list/list.js').default} List
 * @typedef {import('../../list/list.types').ListConfigType} ListConfigType
 * @typedef {import('./tagList.js').default} TagList
 * @typedef {import('@storybook/web-components-vite').Args} Args
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 */
import { attrString } from '@arpadroid/tools';
import { DataDrivenList as ListStory } from '../../list/stories/list.stories.js';
import { within, userEvent, waitFor, expect, fn } from 'storybook/test';
const html = String.raw;

/** @type {Meta} */
const TagListStory = {
    ...ListStory,
    title: 'Lists/Tag List',
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
    render: args => {
        return html`<tag-list ${attrString(args)}>
            <template template-type="list-item" has-delete></template>
            <tag-item icon="restaurant">Tag 1</tag-item>
            <tag-item icon="lunch_dining">Tag 2</tag-item>
            <tag-item icon="nightlife">Tag 3</tag-item>
        </tag-list>`;
    }
};

export const Render = TagListStory;

async function playSetup(/** @type {HTMLElement} */ canvasElement) {
    await customElements.whenDefined('tag-list');
    await customElements.whenDefined('tag-item');
    /** @type {TagList | null} */
    const tagList = canvasElement.querySelector('tag-list');
    return { tagList, canvas: /** @type {any} */ within(canvasElement) };
}

/** @type {StoryObj} */
export const Test = {
    args: {
        ...TagListStory.args,
        id: 'tag-list-test',
        title: 'Tag List Test'
    },

    play: async ({ canvasElement, step, args }) => {
        const setup = await playSetup(canvasElement);
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
            const tag = /** @type {HTMLElement} */ (canvas.getByText('Tag 1').closest('tag-item'));
            const deleteButton = within(tag).getByRole('button');
            expect(deleteButton).toBeInTheDocument();
            userEvent.click(deleteButton);
            await waitFor(() => {
                expect(args.onDelete).toHaveBeenCalledWith(tag, undefined, undefined);
            });
        });
    }
};

export default TagListStory;
