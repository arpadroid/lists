/**
 * @typedef {import('./listItem.js').default} ListItem
 * @typedef {import('./listItem.types.js').ListItemConfigType} ListItemConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ListItemConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListItemConfigType>} Story
 */
import { waitFor, expect, userEvent } from 'storybook/test';
import { $attr } from '@arpadroid/tools';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';

/** @type {Meta} */
const ListItemStory = {
    title: 'Lists/List Item',
    component: 'list-item',
    args: {},
    parameters: {
        layout: 'centered'
    }
};

export default ListItemStory;

const html = String.raw;

/** @type {Story} */
export const Render = {
    parameters: defaultParams,
    args: {
        content: 'Default List Item'
    }
};

/** @type {Story} */
export const Simple = {
    args: {
        icon: 'check_circle',
        content: 'Simple List Item'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');

        await step('Renders the list item with the expected content', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Simple List Item')).toBeInTheDocument();
                expect(canvas.getByText('check_circle')).toHaveClass('icon');
            });
        });
        await step('Does not render the empty content header', async () => {
            const contentHeader = canvasElement.querySelector('.listItem__contentHeader');
            expect(contentHeader).not.toBeInTheDocument();
        });
    }
};

const tags = html`<arpa-zone name="tags">
    <tag-item icon="category">Space</tag-item>
    <tag-item icon="book_2">knowledge</tag-item>
</arpa-zone>`;

/** @type {Story} */
export const Link = {
    args: {
        icon: 'link',
        content: 'Link Item',
        link: '#test-link'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');

        await step('Renders the list item with the expected content', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Link Item')).toBeInTheDocument();
                expect(canvas.getByText('link')).toHaveClass('icon--link');
                const linkNode = canvas.getByRole('link', { name: /link item/i });
                expect(linkNode).toHaveAttribute('href', '#test-link');
            });
        });
        await step('Does not render the empty content header', async () => {
            const contentHeader = canvasElement.querySelector('.listItem__contentHeader');
            expect(contentHeader).not.toBeInTheDocument();
        });
    }
};

const fullTitle = 'We live in a vast and mysterious universe full of interesting facts and wonders.';
const fullSubtitle = 'Did you know?';
const fullContent =
    'There are an estimated 3 trillion trees on Earth, which means there are more trees on our planet than there are stars in the entire Milky Way galaxy!';

/** @type {Story} */
export const FullItem = {
    args: {
        title: fullTitle,
        subtitle: fullSubtitle,
        image: '/test-assets/plane.jpg',
        content: fullContent
    },
    parameters: testParams,
    play: async ({ step, canvas }) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');

        await step('Renders the list item with the expected content', async () => {
            await waitFor(() => {
                expect(canvas.getByText(fullTitle)).toBeInTheDocument();
                expect(canvas.getByText(fullSubtitle)).toBeInTheDocument();
                expect(canvas.getByText(fullContent)).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const Template = {
    args: {
        ...FullItem.args
    },
    parameters: testParams,
    render: args => {
        const { content } = args;
        delete args.content;
        return html`
            <style>
                .myItem {
                    display: flex;
                    flex-direction: column;

                    .listItem__title {
                        max-width: 400px;
                    }

                    .listItem__image {
                        min-width: 100px;
                    }

                    .listItem__titleWrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                }
                .myItem__container {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
            </style>
            <arpa-list id="item-with-template-list">
                <template template-type="list-item" class="myItem">
                    <div class="myItem__container">
                        {image}
                        <span class="listItem__titleWrapper">{title}{subtitle}{tags}</span>
                    </div>
                    {content}
                </template>
                <list-item ${$attr(args)}> ${content} ${tags} </list-item>
            </arpa-list>
        `;
    },
    play: async ({ canvasElement, step, canvas }) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        await step('Renders the list item with the expected template', async () => {
            await waitFor(() => {
                expect(canvas.getByText(fullTitle)).toBeInTheDocument();
                expect(canvas.getByText(fullSubtitle)).toBeInTheDocument();
                const listItem = canvasElement.querySelector('.myItem');
                expect(listItem?.querySelector('.myItem__container')).toBeInTheDocument();
                expect(canvas.getByText(fullContent)).toBeInTheDocument();
                expect(listItem?.querySelector('img')).toHaveAttribute('src', '/test-assets/plane.jpg');
            });
        });

        await step('Renders the tags', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Space')).toBeInTheDocument();
                expect(canvas.getByText('knowledge')).toBeInTheDocument();
                expect(canvasElement.querySelectorAll('tag-item')).toHaveLength(2);
            });
        });
    }
};

const longText =
    'There are more stars in the observable universe than there are grains of sand on all the beaches and deserts on Earth. Estimates suggest there are over 10 sextillion (or 10 × 10²¹) stars';
const zonesTitle = 'Galactic Sandcastles';

/** @type {Story} */
export const Zones = {
    args: {
        titleIcon: 'auto_awesome',
        titleLink: '#test-link',
        truncateContent: 50,
        truncateButton: true
    },
    parameters: {
        layout: 'padded',
        ...testParams
    },
    render: args => {
        return html`
            <arpa-list id="list-item-list" controls=" ">
                <list-item ${$attr(args)}>
                    <arpa-zone name="title">${zonesTitle}</arpa-zone>
                    <arpa-zone name="subtitle">Did you know?</arpa-zone>
                    ${tags} ${longText}
                </list-item>
            </arpa-list>
        `;
    },
    play: async ({ canvasElement, step, canvas }) => {
        await customElements.whenDefined('arpa-list');
        await customElements.whenDefined('list-item');
        await step('Renders the list item with the expected zones', async () => {
            await waitFor(() => {
                expect(canvas.getByText(zonesTitle)).toBeInTheDocument();
            });
            expect(canvas.getByText('Did you know?')).toBeInTheDocument();
            expect(canvas.getByText('auto_awesome')).toHaveClass('icon--auto_awesome');
            const titleLink = canvas.getByRole('link', { name: new RegExp(zonesTitle, 'i') });
            expect(titleLink).toHaveAttribute('href', '#test-link');
            await waitFor(() => {
                const content = canvasElement.querySelector('.truncateText__content');
                expect(content).toBeInTheDocument();
                expect(content?.textContent).toHaveLength(50);
            });
        });

        await step('Expands the content when the Read more button is clicked', async () => {
            const readMoreButton = canvas.getByRole('button', { name: /read more/i });
            expect(readMoreButton).toBeInTheDocument();
            await userEvent.click(readMoreButton);
            await waitFor(() => {
                expect(readMoreButton).toHaveTextContent('read less');
                expect(canvas.getByText(longText)).toBeInTheDocument();
            });
        });

        await step('Renders the tags', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Space')).toBeInTheDocument();
                expect(canvas.getByText('knowledge')).toBeInTheDocument();
                expect(canvasElement.querySelectorAll('tag-item')).toHaveLength(2);
            });
        });
    }
};
