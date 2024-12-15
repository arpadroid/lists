/**
 * @typedef {import('../list.js').default} List
 */
import ListStory from './list.stories.js';
import { attrString, getInitials } from '@arpadroid/tools';
import { within } from '@storybook/test';

const html = String.raw;
const ApiDrivenListStory = {
    title: 'API Resource List',
    ...ListStory
};

export const Default = {
    name: 'Render',
    argTypes: ApiDrivenListStory.getArgTypes(),
    args: {
        id: 'api-driven-list',
        allControls: true,
        title: 'List',
        url: 'api/gallery/item/get-items',
        paramNamespace: 'galleryList-',
        hasSelection: true,
        itemsPerPage: 10
    },
    initializeList: async id => {
        const list = document.getElementById(id);
        const resource = list.listResource;
        resource?.mapItem(item => {
            item.author_initials = getInitials(item.author_name + ' ' + item.author_surname);
            item.date = new Date(item.date)?.getFullYear() ?? '?';
            return item;
        });
        await resource?.fetch().catch(() => {});
    },
    playSetup: async (canvasElement, initializeList = true) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        const canvas = within(canvasElement);
        const listNode = canvasElement.querySelector('arpa-list');
        const listItem = canvasElement.querySelector('list-item');
        await listNode.promise;
        initializeList && (await Default.initializeList(listNode.id));
        return { canvas, listNode, listItem };
    },
    play: async ({ canvasElement }) => {
        await Default.playSetup(canvasElement);
    },
    renderItemTemplate: () => {
        return html` <template
            id="{id}"
            template-id="list-item-template"
            image="/api/image/convert?width=[width]&height=[height]&quality=[quality]&source={image_url}"
        >
            <zone name="tags">
                <tag-item label="{author_initials}" icon="person"></tag-item>
                <tag-item label="{date}" icon="calendar_month"></tag-item>
            </zone>

            <zone name="item-nav">
                <nav-link link="/gallery/{id}" icon-right="visibility">View</nav-link>
                <nav-link link="/gallery/{id}/edit" icon-right="edit">Edit</nav-link>
            </zone>
        </template>`;
    },
    render: args => {
        return html`
            <style>
                #storybook-root {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
            </style>

            <arpa-list ${attrString(args)}>
                <zone name="batch-operations">
                    <select-option value="delete" icon="delete">
                        Delete
                        <delete-dialog>
                            <zone name="header"> Delete items </zone>
                            <zone name="content"> Are you sure you want to delete the selected items? </zone>
                        </delete-dialog>
                    </select-option>
                </zone>

                <zone name="sort-options">
                    <nav-link param-value="title" icon-right="sort_by_alpha"> Title </nav-link>
                    <nav-link param-value="date" icon-right="calendar_month" default> Date </nav-link>
                </zone>

                <zone name="list-filters"> </zone>
                ${Default.renderItemTemplate()}
            </arpa-list>
        `;
    }
};

export default ApiDrivenListStory;
