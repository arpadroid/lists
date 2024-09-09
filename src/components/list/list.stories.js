/**
 * @typedef {import('./list.js').default} List
 */
import { attrString } from '@arpadroid/tools';
// import { waitFor, expect, within } from '@storybook/test';

const html = String.raw;
const ListStory = {
    title: 'Modules/List/List',
    tags: [],
    getArgs: () => {
        return {
            id: 'test-list',
            title: '',
            hasSearch: false,
            hasSort: false,
            hasViews: false,
            allControls: false,
            hasMultiSelect: false
        };
    },
    getArgTypes: (category = 'List Props') => {
        return {
            id: { control: { type: 'text' }, table: { category } },
            title: { control: { type: 'text' }, table: { category } },
            allControls: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasSearch: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasMultiSelect: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasViews: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasSort: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } }
        };
    },
    render: args => {
        delete args.text;
        return html`
            <arpa-list ${attrString(args)} views="grid, list">
                <list-item
                    title="Some title"
                    title-link="http://museovaquero.local/api/image/convert?source=%2Fcmsx%2Fassets%2Fhqrvutmy_museovaquero_assets%2Fgallery%2Fimages%2F449.jpg&width=400&height=400&quality=70"
                    image="http://museovaquero.local/api/image/convert?source=%2Fcmsx%2Fassets%2Fhqrvutmy_museovaquero_assets%2Fgallery%2Fimages%2F449.jpg&width=400&height=400&quality=70"
                >
                    A Demo list item.
                </list-item>
            </arpa-list>
            <script>
                // http://museovaquero.local/api/gallery/item/get-items?galleryList-search=&galleryList-sortBy=modified_date&galleryList-sortDir=desc&galleryList-state=&galleryList-page=2&galleryList-perPage=50&public=
                customElements.whenDefined('arpa-list').then(() => {
                    /** @type {List} */
                    const list = document.getElementById('test-list');
                });
            </script>
        `;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: ListStory.getArgTypes(),
    args: { ...ListStory.getArgs(), id: 'test-list' }
};

export const ResourceDriven = {
    name: 'Resource Driven',
    parameters: {},
    argTypes: ListStory.getArgTypes(),
    args: { ...ListStory.getArgs(), id: 'resource-list', allControls: true, title: 'Resource Driven List' },
    render: args => {
        return html`
            <arpa-list
                ${attrString(args)}
                views="grid,list"
                url="api/gallery/item/get-items"
                filter-namespace="galleryList-"
            >
                <slot name="batch-operations">
                    <batch-operation value="delete" icon="delete" confirm> Delete </batch-operation>
                </slot>

                <slot name="sort-options">
                    <select-option value="name" icon="sort_by_alpha"> Name </select-option>
                    <select-option value="date" icon="calendar_month" default> Date </select-option>
                </slot>

                <slot name="list-filters">
                    <text-field id="advanced search" label="Search" icon="search" placeholder="Search"></text-field>
                </slot>

                <template
                    id="{id}"
                    template-id="list-item-template"
                    image="/api/image/convert?source={image_url}&width=400&height=400&quality=70'"
                >
                    <slot name="tags">
                        <tag-item label="{author_initials}" icon="person"></tag-item>
                        <tag-item label="{date}" icon="calendar_month"></tag-item>
                    </slot>

                    <slot name="nav">
                        <nav-link link="/gallery/{id}" icon-right="visibility">View</nav-link>
                        <nav-link link="/gallery/{id}/edit" icon-right="edit">Edit</nav-link>
                    </slot>
                </template>
            </arpa-list>

            <script type="module">
                import { editURL, getInitials } from '/arpadroid-tools.js';
                customElements.whenDefined('arpa-list').then(() => {
                    const list = document.getElementById('resource-list');
                    const resource = list.listResource;
                    resource.mapItem(item => {
                        item.author_initials = getInitials(item.author_name + ' ' + item.author_surname);
                        item.date = item.date ?? '?';
                        return item;
                    });
                    resource.fetch();
                });
            </script>
        `;
    }
};

export const Test = {
    args: Default.args,
    parameters: {},
    args: {
        ...Default.args
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    }
    // playSetup: async canvasElement => {
    //     const canvas = within(canvasElement);
    //     await customElements.whenDefined('arpa-list');
    //     const listNode = canvasElement.querySelector('arpa-list');
    //     return { canvas, listNode };
    // }
    // play: async ({ canvasElement, step }) => {
    //     const setup = await Test.playSetup(canvasElement);
    //     const { canvas, listNode } = setup;
    //     console.log('listNode', listNode);
    // }
};

export default ListStory;
