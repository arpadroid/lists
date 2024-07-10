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
        delete args.text;
        return html`
            <arpa-list ${attrString(args)} views="grid, list">
                <slot name="batch-operations">
                    <batch-operation value="delete" icon="delete" confirm> Delete </batch-operation>
                </slot>
            </arpa-list>
            <script type="module">
                import { editURL, getInitials } from '/arpadroid-tools.js';
                customElements.whenDefined('arpa-list').then(() => {
                    const sortOptions = [
                        { label: 'Name', value: 'name', icon: 'sort_by_alpha' },
                        { label: 'Date', value: 'date', icon: 'calendar_month' }
                    ];
                    const list = document.getElementById('resource-list');
                    list.setSortOptions(sortOptions, 'date');
                    const resource = list.listResource;
                    resource.setUrl('/api/gallery/item/get-items?&galleryList-perPage=10');
                    resource.mapItem(item => {
                        const { id, title } = item;
                        const author = item.author_name + ' ' + item.author_surname;
                        const tags = [
                            { label: getInitials(author), icon: 'person' },
                            { label: item.date ?? '?', icon: 'calendar_month' }
                        ];
                        const links = [
                            { content: 'View', link: '/gallery/' + item.id, iconRight: 'visibility' },
                            { content: 'Edit', link: '/gallery/' + item.id + '/edit', iconRight: 'edit' }
                        ];
                        const image = editURL('/api/image/convert', {
                            source: item.image_url,
                            width: 400,
                            height: 400,
                            quality: 70
                        });
                        return { id, title, nav: { links }, image, tags };
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
