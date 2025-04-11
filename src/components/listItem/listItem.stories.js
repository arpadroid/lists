/**
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 */

import { attrString } from '@arpadroid/tools';

const html = String.raw;

const Default = {
    title: 'Lists/List Item',
    args: {},
    parameters: {
        layout: 'padded'
    },

    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list id="list-item-list" title="List Item" controls=" ">
            <list-item ${attrString(args)}>
                <zone name="title">Morning Motivation</zone>
                <zone name="subtitle"> Start your day with a burst of energy! </zone>
                <truncate-text max-length="170" has-read-more-button>
                    Morning motivation is key to setting a positive tone for the day. Starting your morning with an
                    energizing mindset can enhance focus, boost productivity, and improve overall well-being. When you
                    take time in the morning to set goals or engage in uplifting activities, it strengthens mental
                    resilience and prepares you to handle challenges. This initial boost also impacts mood, helping
                    maintain a positive outlook. Consistently practicing morning motivation can gradually lead to more
                    fulfilling days and a healthier lifestyle.
                </truncate-text>
            </list-item></arpa-list
        >`;
    }
};

export const SingleItem = {
    ...Default,
    args: {
        titleIcon: 'auto_awesome',
        titleLink: '#test-link'
    }
};

export const ItemWithTemplate = {
    ...Default,
    args: {
        subTitle: 'Sub title',
        title: 'Item with template',
        image: '/assets/artists/phidias.jpg'
    },
    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list id="item-with-template-list" controls=" ">
            <list-item ${attrString(args)}>
                template content
                <template type="content"> {image} {title} {subTitle} {children}</template>
            </list-item>
        </arpa-list>`;
    }
};

export default Default;
