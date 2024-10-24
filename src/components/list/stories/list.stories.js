/**
 * @typedef {import('../list.js').default} List
 */
import { attrString, getInitials } from '@arpadroid/tools';
import { within, userEvent } from '@storybook/test';

const html = String.raw;
const ListStory = {
    title: 'Resource List',
    tags: [],
    args: {
        id: 'static-list',
        title: '',
        hasSearch: false,
        hasSort: false,
        hasViews: false,
        allControls: false,
        hasMultiSelect: false,
        hasItemsTransition: true
    },
    getArgTypes: (category = 'List Props') => {
        return {
            id: { control: { type: 'text' }, table: { category } },
            title: { control: { type: 'text' }, table: { category } },
            allControls: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasSearch: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasMultiSelect: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasViews: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasSort: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            hasItemsTransition: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
            url: { control: { type: 'text' }, table: { category, subcategory: 'Resource' } },
            itemsPerPage: { control: { type: 'number' }, table: { category, subcategory: 'Resource' } },
            paramNamespace: { control: { type: 'text' }, table: { category, subcategory: 'Resource' } }
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
    argTypes: ListStory.getArgTypes(),
    args: {
        // ...ListStory.getArgs(),
        id: 'resource-driven-list',
        allControls: true,
        title: 'Resource Driven List',
        url: 'api/gallery/item/get-items',
        paramNamespace: 'galleryList-',
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
        await resource?.fetch();
    },
    playSetup: async canvasElement => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        const canvas = within(canvasElement);
        const listNode = canvasElement.querySelector('arpa-list');
        await listNode.promise;
        await Default.initializeList(listNode.id);
        return { canvas, listNode };
    },
    play: async ({ canvasElement }) => {
        await Default.playSetup(canvasElement);
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
                        <arpa-dialog title="Delete Itemsss" icon="delete">
                            <zone name="header"> Delete this </zone>
                            <zone name="content"> Are you sure you want to delete the selected items? </zone>
                            <zone name="footer">lola</zone>
                        </arpa-dialog>
                    </select-option>
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

                    <zone name="item-nav">
                        <nav-link link="/gallery/{id}" icon-right="visibility">View</nav-link>
                        <nav-link link="/gallery/{id}/edit" icon-right="edit">Edit</nav-link>
                    </zone>
                </template>
            </arpa-list>
        `;
    }
};

const testParams = {
    controls: { disable: true },
    usage: { disable: true },
    options: { selectedPanel: 'storybook/interactions/panel' }
};

export const TestFilters = {
    ...Default,
    parameters: testParams,
    args: {
        ...Default.args,
        id: 'test-filters'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Clicks on filters menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Filters/i });
            userEvent.click(filtersMenu);
        });
    }
};

export const TestBatchOperations = {
    ...Default,
    parameters: testParams,
    args: {
        ...Default.args,
        id: 'test-batch-operations',
        allControls: false,
        hasResource: true,
        hasSelection: true,
        hasControls: true,
        itemsPerPage: 1
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Opens Batch Operations', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /No items selected/i });
            await userEvent.click(filtersMenu);
            const button = canvas.getByText('Select an action');
            await userEvent.click(canvas.getByText(/Select all/i));
            await new Promise(resolve => setTimeout(resolve, 100));
            userEvent.click(button);
        });
    }
};

export const TestViews = {
    ...Default,
    parameters: testParams,
    args: {
        ...Default.args,
        id: 'test-views',
        allControls: false,
        hasResource: true,
        hasSelection: false,
        hasControls: true,
        hasViews: true
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Opens the Views menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Views/i });
            userEvent.click(filtersMenu);
        });
    }
};

export const TestSort = {
    ...Default,
    args: {
        ...Default.args,
        id: 'test-sort',
        allControls: false,
        hasResource: true,
        hasSelection: false,
        hasControls: true,
        hasViews: false,
        hasSort: true
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { canvas } = setup;

        await step('Opens the sort menu', async () => {
            const filtersMenu = canvas.getByRole('button', { name: /Sort/i });
            userEvent.click(filtersMenu);
        });
    }
};

export const TestItem = {
    ...Default,
    parameters: {},
    args: {
        ...Default.args,
        id: 'test-item',
        allControls: false,
        hasResource: true,
        itemsPerPage: 1
    }
};

export const Test200 = {
    ...Default,
    args: {
        ...Default.args,
        id: 'test-200',
        itemsPerPage: 200
    }
};

// export const StressTest = {
//     ...Default,
//     args: {
//         ...Default.args,
//         id: 'stressed-list',
//         itemsPerPage: 600
//     }
// };

export default ListStory;
