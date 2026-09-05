/**
 * @typedef {import('./tagList.types.js').TagListConfigType} TagListConfigType
 * @typedef {import('./tagList.js').default} TagList
 * @typedef {import('@storybook/web-components-vite').StoryObj<TagListConfigType>} Story
 * @typedef {import('@storybook/web-components-vite').Meta<TagListConfigType>} Meta
 */
import { $attr } from '@arpadroid/tools';
import { within, userEvent, waitFor, expect, fn } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
const html = String.raw;
const onDelete = fn();

/** @type {Meta} */
const TagListStory = {
    title: 'Lists/Tag List',
    component: 'tag-list',
    parameters: defaultParams,
    args: {
        id: 'tag-list',
        title: 'Tag List',
        hasInfo: true,
        itemsPerPage: 5
    },
    render: args => {
        return html`<tag-list ${$attr(args)}>
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
        id: 'tag-list-test',
        title: 'Tag List Test'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        /** @type {TagList | null} */
        const tagList = canvasElement.querySelector('tag-list');
        await tagList?.promise;
        tagList?.on('delete_tag', onDelete);

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

            const deleteButton = await waitFor(() => within(tag).getByRole('button'));
            expect(deleteButton).toBeInTheDocument();
            await userEvent.click(deleteButton);
            await waitFor(() => {
                expect(onDelete).toHaveBeenCalledWith(tag, undefined, undefined);
            });
        });
    }
};

export default TagListStory;
