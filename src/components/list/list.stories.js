/**
 * @typedef {import('./list.js').default} List
 */
import { attrString } from '@arpadroid/tools';
import { within, userEvent } from '@storybook/test';

const html = String.raw;
const ListStory = {
    title: 'Modules/List/List',
    tags: [],
    getArgs: () => {
        return {
            id: 'static-list',
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
                <list-item title="Some title" title-link="/some-link" image="/some-image.jpg">
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
    args: {
        ...ListStory.getArgs(),
        id: 'resource-driven-list',
        allControls: true,
        title: 'Resource Driven List',
        url: 'api/gallery/item/get-items',
        paramNamespace: 'galleryList-',
        itemsPerPage: 50
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
                    <batch-operation value="delete" icon="delete" confirm> Delete </batch-operation>
                </zone>

                <zone name="sort-options">
                    <nav-link param-value="title" icon-right="sort_by_alpha"> Title </nav-link>
                    <nav-link param-value="date" icon-right="calendar_month" default> Date </nav-link>
                </zone>

                <zone name="list-filters"> </zone>

                <template
                    id="{id}"
                    template-id="list-item-template"
                    image="/api/image/convert?width=[width]&height=[height]&quality=[quality]&source={image_url}"
                >
                    <zone name="tags">
                        <tag-item label="{author_initials}" icon="person"></tag-item>
                        <tag-item label="{date}" icon="calendar_month"></tag-item>
                    </zone>

                    <zone name="nav">
                        <nav-link link="/gallery/{id}" icon-right="visibility">View</nav-link>
                        <nav-link link="/gallery/{id}/edit" icon-right="edit">Edit</nav-link>
                    </zone>
                </template>
            </arpa-list>

            <script type="module">
                import { editURL, getInitials } from '/arpadroid-tools.js';
                customElements.whenDefined('arpa-list').then(() => {
                    const id = '${args.id}';
                    const list = document.getElementById(id);
                    const resource = list.listResource;
                    resource?.mapItem(item => {
                        item.author_initials = getInitials(item.author_name + ' ' + item.author_surname);
                        item.date = new Date(item.date)?.getFullYear() ?? '?';
                        return item;
                    });
                    resource?.fetch();
                });
            </script>
        `;
    }
};

export const ResourceDrivenTest = {
    ...ResourceDriven,
    parameters: {},
    args: {
        ...ResourceDriven.args,
        id: 'resource-driven-test-list'
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-list');
        const listNode = canvasElement.querySelector('arpa-list');
        await listNode.promise;
        await new Promise(resolve => setTimeout(resolve, 10));
        return { canvas, listNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await ResourceDrivenTest.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Clicks on filters menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Filters/i });
            userEvent.click(filtersMenu);
        });
    }
};

export const TestMultiActions = {
    ...ResourceDriven,
    parameters: {},
    args: {
        ...ResourceDriven.args,
        id: 'test-list-multiactions',
        allControls: false,
        hasResource: true,
        hasSelection: true,
        hasControls: true,
    },
    play: async ({ canvasElement, step }) => {
        const setup = await ResourceDrivenTest.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Clicks on multi select menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /No items selected/i });
            userEvent.click(filtersMenu);
        });
    }
};

export const TestItem = {
    ...ResourceDriven,
    parameters: {},
    args: {
        ...ResourceDriven.args,
        id: 'test-list-item',
        allControls: false,
        hasResource: true
    }
};

export const Test = {
    args: Default.args,
    parameters: {},
    args: {
        ...Default.args,
        id: 'test-list'
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-list');
        const listNode = canvasElement.querySelector('arpa-list');
        return { canvas, listNode };
    }
};

export default ListStory;
