/**
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../listItem/listItem.js').default} ListItem
 * @typedef {import('@arpadroid/module').StepFunction} StepFunction
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 */

import { waitFor, expect, userEvent, within } from 'storybook/test';
import { attrString } from '@arpadroid/tools';

const html = String.raw;

const Default = {
    title: 'Lists/List Item',
    args: {},
    /**
     * Sets up the test scenario.
     * @param {HTMLElement} canvasElement
     * @returns {Promise<import('../list/stories/list.stories.types.js').ListPlaySetupResponseType>}
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        /** @type {ListItem | null} */
        const listItem = canvasElement.querySelector('list-item');
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        await listItem?.promise;
        return { canvas, listItem };
    },
    parameters: {
        layout: 'centered'
    }
};

export const Render = {
    args: {
        icon: 'list',
        iconRight: 'chevron_right',
        title: 'List item',
        subtitle: 'Test subtitle',
        image: '/test-assets/artists/phidias.jpg'
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction, args: Record<string, any> }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const { listItem, canvas } = await Default.playSetup(canvasElement);
        const icon = canvasElement.querySelector('list-item arpa-icon');

        await step('Renders the list item with the expected content', async () => {
            expect(canvas.getByText('List item')).toBeInTheDocument();
            expect(canvas.getByText('Test subtitle')).toBeInTheDocument();
            expect(icon).toHaveTextContent('list');
            expect(icon).toHaveClass('icon--list');
            expect(canvas.getByText('chevron_right')).toHaveClass('icon--chevron_right');
            expect(canvas.getByText('test content')).toBeInTheDocument();
        });
    },
    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list id="list-item-list" controls=" ">
            <list-item ${attrString(args)}> test content </list-item>
        </arpa-list>`;
    }
};

const longText =
    'Morning motivation is key to setting a positive tone for the day. Starting your morning with an energizing mindset can enhance focus, boost productivity, and improve overall well-being. When you take time in the morning to set goals or engage in uplifting activities, it strengthens mental resilience and prepares you to handle challenges. This initial boost also impacts mood, helping maintain a positive outlook. Consistently practicing morning motivation can gradually lead to more fulfilling days and a healthier lifestyle.';

export const WithZones = {
    args: {
        titleIcon: 'auto_awesome',
        titleLink: '#test-link',
        truncateContent: 100,
        truncateButton: true,
        image: '/test-assets/artists/phidias.jpg'
    },
    params: {
        layout: 'padded'
    },
    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list id="list-item-list" title="List Item" controls=" ">
            <list-item ${attrString(args)}>
                <zone name="title"><strong>Morning Motivation</strong></zone>
                <zone name="subtitle">Start your day with a burst of energy!</zone>
                ${longText}
            </list-item></arpa-list
        >`;
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction, args: Record<string, any> }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const { canvas } = await Default.playSetup(canvasElement);
        await step('Renders the list item with the expected zones', async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for truncation to apply
            expect(canvas.getByText('Morning Motivation')).toBeInTheDocument();
            expect(canvas.getByText('Start your day with a burst of energy!')).toBeInTheDocument();
            expect(canvas.getByText('auto_awesome')).toHaveClass('icon--auto_awesome');
            const titleLink = canvas.getByRole('link', { name: /Morning Motivation/i });
            expect(titleLink).toHaveAttribute('href', '#test-link');
            const content = canvasElement.querySelector('.truncateText__content');
            expect(content).toBeInTheDocument();
            expect(content?.textContent).toHaveLength(103);
        });

        await step('Expands the content when the Read more button is clicked', async () => {
            const readMoreButton = canvas.getByRole('button', { name: /Read more/i });
            expect(readMoreButton).toBeInTheDocument();
            await userEvent.click(readMoreButton);
            await waitFor(() => {
                expect(readMoreButton).toHaveTextContent('Read less');
                expect(canvas.getByText(longText)).toBeInTheDocument();
            });
        });
    }
};

export const WithTemplate = {
    args: {
        subtitle: 'Test sub title',
        title: 'Item with template',
        image: '/test-assets/artists/phidias.jpg'
    },
    render: (/** @type {Record<string, any>} */ args) => {
        return html`<arpa-list id="item-with-template-list" controls=" ">
            <template template-type="list-item">
                <div class="customContent">
                    {image}
                    <div class="listItem__contentHeader">{icon}{titleContainer}</div>
                    {tags} {children} {iconRight}
                </div>
                {rhs}
            </template>
            <list-item ${attrString(args)}> </list-item>
        </arpa-list>`;
    },
    /**
     * Plays the test scenario.
     * @param {{ canvasElement: HTMLElement, step: StepFunction, args: Record<string, any> }} options
     * @returns {Promise<void>}
     */
    play: async ({ canvasElement, step }) => {
        const { canvas, listItem } = await Default.playSetup(canvasElement);
        await step('Renders the list item with the expected template', async () => {
            expect(canvas.getByText('Item with template')).toBeInTheDocument();
            expect(canvas.getByText('Test sub title')).toBeInTheDocument();
            expect(listItem?.querySelector('.customContent')).toBeInTheDocument();
            await waitFor(() => {
                expect(listItem?.querySelector('img')).toHaveAttribute('src', '/test-assets/artists/phidias.jpg');
            });
        });
    }
};

export default Default;
