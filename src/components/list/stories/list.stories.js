/**
 * @typedef {import('../list.js').default} List
 * @typedef {import('@arpadroid/resources/src/resources/listResource/listResource.js').default} ListResource
 */
import artists from '../../../mockData/artists.json';
import { attrString, formatDate } from '@arpadroid/tools';
import { within } from '@storybook/test';

const html = String.raw;
const ListStory = {
    title: 'List',
    tags: [],
    args: {
        id: 'static-list',
        title: '',
        hasMultiSelect: false,
        hasItemsTransition: true,
        hasInfo: true,
        hasResource: true
    },
    getArgTypes: (category = 'List Props') => {
        return {
            id: { control: { type: 'text' }, table: { category } },
            title: { control: { type: 'text' }, table: { category } },
            hasMultiSelect: { control: { type: 'boolean' }, table: { category, subcategory: 'Controls' } },
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
        id: 'static-list',
        title: 'List',
        itemsPerPage: 10,
        hasResource: true,
        hasSelection: true
    },
    initializeList: async (id, payload = artists) => {
        const list = document.getElementById(id);
        /** @type {ListResource} */
        const resource = list.listResource;
        resource?.mapItem(item => {
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
        return html`<template template-id="list-item-template" image="{portraitURL}" truncate-content="50">
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
    renderSimple: args => {
        return html`<arpa-list ${attrString(args)}>${Default.renderItemTemplate(args)}</arpa-list>`;
    },
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

export default ListStory;
