/**
 * @typedef {import('../list.js').default} List
 * @typedef {import('../../listItem/listItem.js').default} ListItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('./list.stories.types').ListPlaySetupPayloadType} ListPlaySetupPayloadType
 * @typedef {import('./list.stories.types').ListPlaySetupResponseType} ListPlaySetupResponseType
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 */

import artists from '../../../mockData/artists.json';
import { attrString, formatDate, mergeObjects } from '@arpadroid/tools';
import { within, expect, waitFor } from '@storybook/test';

const html = String.raw;
const ListStory = {
    title: 'Lists/List',
    tags: ['docs'],
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        id: 'static-list',
        title: '',
        hasMessages: true,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true,
        controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
        views: ['grid', 'list', 'list-compact', 'grid-compact']
    },
    getArgTypes: (category = 'List Props') => {
        return {
            ////////////////////////
            // General
            ////////////////////////
            id: {
                description: 'A required unique identifier for the list.',
                control: { type: 'text' },
                table: { category, subcategory: 'General' }
            },
            hasItemsTransition: {
                description: 'If true triggers a smooth transition when navigating between pages.',
                control: { type: 'boolean' },
                table: {
                    defaultValue: { summary: 'true' },
                    category,
                    subcategory: 'General'
                }
            },
            ///////////////////////////////
            // Content
            ///////////////////////////////
            title: {
                description: 'The list title',
                control: { type: 'text' },
                table: { category, subcategory: 'Content' }
            },
            heading: {
                description: 'The list heading',
                control: { type: 'text' },
                table: { category, subcategory: 'Content' }
            },
            ////////////////////////
            // Controls
            ////////////////////////
            controls: {
                description: html`The list of controls to display, defined as a comma-separated list, they map to
                    different UI components. They are all enabled by default and can be sorted as per definition e.g.
                    <strong>'controls="filters,views,sort"</strong>`,
                control: { type: 'multi-select' },
                options: ['search', 'sort', 'views', 'multiselect', 'filters'],
                table: {
                    defaultValue: {
                        summary: 'search,sort,views,multiselect,filters'
                    },
                    category,
                    subcategory: 'Components'
                }
            },
            hasInfo: {
                description: html`If true displays information associated with the number of items in the list, current
                page, and search results. It also includes a refresh button to reload the list, and previous and next
                page buttons if hasPager is enabled.`,
                control: { type: 'boolean' },
                table: {
                    defaultValue: { summary: 'false' },
                    category,
                    subcategory: 'Components'
                }
            },
            ////////////////////////
            // Views
            ////////////////////////
            views: {
                description: 'The list of views to display, defined as a comma-separated list.',
                control: { type: 'multi-select' },
                options: ['grid', 'list', 'list-compact', 'grid-compact'],
                table: {
                    category,
                    subcategory: 'Components'
                }
            },

            ////////////////////////
            // Pagination
            ////////////////////////
            hasPager: {
                description: 'When enabled it displays a pager control to navigate between pages.',
                control: { type: 'boolean' },
                table: {
                    defaultValue: { summary: 'false' },
                    category,
                    subcategory: 'Pagination'
                }
            },
            itemsPerPage: {
                description: 'The number of items to display per page.',
                control: { type: 'number' },
                table: {
                    defaultValue: { summary: 50 },
                    category,
                    subcategory: 'Pagination'
                }
            },
            pageParam: {
                description: 'The query parameter used to set the current page.',
                control: { type: 'text' },
                table: {
                    defaultValue: { summary: 'page' },
                    category,
                    subcategory: 'Pagination'
                }
            },
            perPageParam: {
                description: 'The query parameter used to set the number of items per page.',
                control: { type: 'text' },
                table: {
                    defaultValue: { summary: 'perPage' },
                    category,
                    subcategory: 'Pagination'
                }
            },
            ///////////////////////////////
            // Resource
            ///////////////////////////////
            hasResource: {
                description: html`If true it uses a resource class to manage the list items and associated data. These
                can be fetched from a URL configured via the url attribute or handled statically via the addItems and
                similar methods in the list component. The resource class can be interfaced with via the listResource
                property in the list component or the list component's public methods.`,
                control: { type: 'boolean' },
                table: {
                    defaultValue: { summary: 'false' },
                    category,
                    subcategory: 'Resource'
                }
            },
            url: {
                description: html`The URL used by the list resource to fetch the list items. It is not required to
                define a URL for static lists where items are added manually via the list component.`,
                control: { type: 'text' },
                table: { category, subcategory: 'Resource' }
            },
            paramNamespace: {
                description: html`The namespace used to prefix the query parameters for the list filters. List filters
                are dynamic and can be created, configured and added to the list, which managed via the listResource.`,
                control: { type: 'text' },
                table: { category, subcategory: 'Resource' }
            }
            ///////////////////////////////
            // Callbacks
            //////////////////////////////
        };
    },
    /**
     * Renders the list component.
     * @param {Record<string, unknown>} args
     * @returns {string}
     */
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
    parameters: {
        layout: 'flexColumn'
    },
    args: {
        ...ListStory.args,
        id: 'static-list',
        title: 'List',
        itemsPerPage: 10,
        hasResource: true
    },
    /**
     * Initializes the list with the provided payload.
     * @param {string} id
     * @param {any[]} [payload]
     */
    initializeList: async (id, payload = artists) => {
        const list = /** @type {List | null} */ (document.getElementById(id));
        /** @type {ListResource | undefined} */
        const resource = list?.listResource;
        resource?.mapItem((/** @type {Record<string, any>} */ item) => {
            const dob = formatDate(item.dateOfBirth, 'YYYY');
            const dod = formatDate(item.dateOfDeath, 'YYYY');
            const lived = `${dob} - ${dod}` || dob;
            return {
                ...item,
                title: `${item.firstName} ${item.lastName}`,
                date: lived
            };
        });
        resource?.setItems(payload);
    },
    /**
     * Sets up the test scenario.
     * @param {HTMLElement} canvasElement
     * @param {boolean} [initializeList]
     * @param {(payload: ListPlaySetupPayloadType) => void} [preRenderCallback]
     * @returns {Promise<ListPlaySetupResponseType>}
     */
    playSetup: async (canvasElement, initializeList = true, preRenderCallback) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        const canvas = within(canvasElement);
        /** @type {List | null} */
        const listNode = canvasElement.querySelector('arpa-list');
        /** @type {ListItem | null} */
        const listItem = canvasElement.querySelector('list-item');
        const listResource = listNode?.listResource;
        typeof preRenderCallback === 'function' && preRenderCallback({ listResource, listNode, listItem });
        await listNode?.promise;
        listNode?.messages?.addMessage({
            text: 'This is a demo message'
        });
        listNode?.id && initializeList && (await Default.initializeList(listNode?.id));
        await new Promise(resolve => setTimeout(resolve, 50));
        return { canvas, listNode, listItem, listResource };
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement }) => {
        await Default.playSetup(canvasElement);
    },
    renderItemTemplate: (_attr = {}) => {
        const attr = mergeObjects(
            {
                elementTruncateContent: 50,
                type: 'list-item',
                elementImage: '{portraitURL}',
                elementTruncateButton: true
            },
            _attr
        );
        return html` <!-- List Item Template -->
            <template type="list-item" ${attrString(attr)}>
                <zone name="tags">
                    <tag-item label="{date}" icon="calendar_month"></tag-item>
                    <tag-item label="{movement}" icon="palette"></tag-item>
                </zone>
                <zone name="item-nav">
                    <nav-link link="javascript:void(0)" icon-right="visibility">View</nav-link>
                    <nav-link link="javascript:void(0)" icon-right="edit">Edit</nav-link>
                </zone>
                <zone name="content">{legacy}</zone>
            </template>`;
    },
    /**
     * Renders the list component.
     * @param {Record<string, unknown>} args
     * @returns {string}
     */
    renderSimple: args => {
        return html`<arpa-list ${attrString(args)}>${Default.renderItemTemplate()}</arpa-list>`;
    },
    /**
     * Renders the list component.
     * @param {Record<string, unknown>} args
     * @returns {string}
     */
    render: args => {
        return html`
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

export const Test200 = {
    ...Default,
    args: {
        ...Default.args,
        id: 'test-200',
        itemsPerPage: 200
    }
};

export const EmptyList = {
    title: 'Lists/Empty List',
    args: {
        id: 'static-list-test',
        title: 'Empty List',
        controls: ' '
    },
    parameters: {
        layout: 'centered'
    },
    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list ${attrString(args)}></arpa-list>`;
    },
    /**
     * Sets up the test scenario.
     * @param {HTMLElement} canvasElement
     * @returns {Promise<{ canvas: any, listNode: HTMLElement | null }>}
     */
    playSetup: async (/** @type {HTMLElement} */ canvasElement) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        const canvas = within(canvasElement);
        /** @type {List | null} */
        const listNode = canvasElement.querySelector('arpa-list');
        /** @type {ListResource | undefined} */

        return { canvas, listNode };
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const { canvas } = await EmptyList.playSetup(canvasElement);
        step('Renders an empty list', async () => {
            await waitFor(() => {
                expect(canvas.getByText('No items found.')).toBeInTheDocument();
            });
        });
    }
};

export default ListStory;
