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
            hasSearch: false,
            hasSort: false,
            hasViews: false,
            allControls: true
        };
    },
    getArgTypes: (category = 'List Props') => {
        return {
            id: { control: { type: 'text' }, table: { category } },
            allControls: { control: { type: 'boolean' }, table: { category } },
            hasSearch: { control: { type: 'boolean' }, table: { category } },
            hasViews: { control: { type: 'boolean' }, table: { category } },
            hasSort: { control: { type: 'boolean' }, table: { category } }
        };
    },
    render: args => {
        delete args.text;
        return html`
            <arpa-list ${attrString(args)} views="grid, list">
                <list-item
                    title-link="http://museovaquero.local/api/image/convert?source=%2Fcmsx%2Fassets%2Fhqrvutmy_museovaquero_assets%2Fgallery%2Fimages%2F449.jpg&width=400&height=400&quality=70"
                    image="http://museovaquero.local/api/image/convert?source=%2Fcmsx%2Fassets%2Fhqrvutmy_museovaquero_assets%2Fgallery%2Fimages%2F449.jpg&width=400&height=400&quality=70"
                    title="Some title"
                    has-selection
                    sub-title="test subtitle"
                >
                    Some message
                </list-item>
            </arpa-list>
            <script>
                customElements.whenDefined('arpa-list').then(() => {
                    /** @type {List} */
                    const list = document.getElementById('test-list');
                    list.setSortOptions([
                        {
                            label: 'Name',
                            value: 'name',
                            icon: 'sort_by_alpha'
                        },
                        {
                            label: 'Date',
                            value: 'date',
                            icon: 'calendar_month'
                        }
                    ]);
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
