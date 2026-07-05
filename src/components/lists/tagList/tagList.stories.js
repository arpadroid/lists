/**
 * @typedef {import('./tagList.types.js').TagListConfigType} TagListConfigType
 * @typedef {import('./tagList.js').default} TagList
 * @typedef {import('@storybook/web-components-vite').StoryObj<TagListConfigType>} Story
 * @typedef {import('@storybook/web-components-vite').Meta<TagListConfigType>} Meta
 */
import { attrString } from '@arpadroid/tools';
import { DataDrivenList as ListStory } from '../../list/stories/list.stories.js';
import { within, userEvent, waitFor, expect, fn } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
const html = String.raw;

/** @type {Meta} */
const TagListStory = {
    ...ListStory,
    title: 'Lists/Tag List',
    parameters: defaultParams,
    args: {
        ...ListStory.args,
        id: 'tag-list',
        title: 'Tag List',
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

/** @type {Story} */
export const Test = {
    args: {
        ...TagListStory.args,
        id: 'tag-list-test',
        title: 'Tag List Test'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, args, canvas }) => {
        await customElements.whenDefined('tag-list');
        await customElements.whenDefined('tag-item');
        /** @type {TagList | null} */
        const tagList = canvasElement.querySelector('tag-list');
        // @ts-ignore
        tagList?.on('delete_tag', args.onDelete);

        await step('Renders the tag list', async () => {
            expect(tagList).toBeInTheDocument();
            await waitFor(() => {
                const tags = canvas.getAllByRole('listitem');
                expect(tags).toHaveLength(3);
                expect(canvas.getByText('Tag 1')).toBeInTheDocument();
                expect(canvas.getByText('Tag 2')).toBeInTheDocument();
                expect(canvas.getByText('Tag 3')).toBeInTheDocument();
            });
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
