/**
 * @typedef {import('../list.js').default} List
 * @typedef {import('../list.types.js').ListConfigType} ListConfigType
 * @typedef {import('../../listItem/listItem.js').default} ListItem
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@storybook/web-components-vite').StoryObj<ListConfigType>} Story
 * @typedef {import('@storybook/web-components-vite').Meta<ListConfigType>} Meta
 */

import { attrString } from '@arpadroid/tools';
import { expect, waitFor } from 'storybook/test';
const html = String.raw;

/** @type {Meta} */
const ContentDrivenStories = {
    title: 'Lists/Content Driven',
    component: 'arpa-list',
    args: {
        id: 'static-list-test',
        title: 'Content Driven List',
        titleIcon: 'list',
        controls: []
    },
    parameters: {
        layout: 'padded'
    },
    render: args => {
        return html`<arpa-list ${attrString(args)}>
            <arpa-zone name="heading">List heading</arpa-zone>
            <arpa-zone name="aside"> List aside</arpa-zone>
            <template template-type="list-item" truncate-content="70" truncate-button></template>
            <list-item title-link="#test-link" title-icon="auto_awesome" title="Morning Motivation">
                <arpa-zone name="title"></arpa-zone>
                <arpa-zone name="subtitle"> Start your day with a burst of energy! </arpa-zone>
                Morning motivation is key to setting a positive tone for the day. Starting your morning with an
                energizing mindset can enhance focus, boost productivity, and improve overall well-being. When you take
                time in the morning to set goals or engage in uplifting activities, it strengthens mental resilience and
                prepares you to handle challenges. This initial boost also impacts mood, helping maintain a positive
                outlook. Consistently practicing morning motivation can gradually lead to more fulfilling days and a
                healthier lifestyle.
            </list-item>

            <list-item title-link="#test-link2" title-icon="spa">
                <arpa-zone name="title">Mindful Moments</arpa-zone>
                <arpa-zone name="subtitle"> Take a pause and focus on the present. </arpa-zone>
                Practicing mindful moments is essential for managing stress and staying grounded. Taking a few moments
                to pause, breathe, and focus on the present can help reduce anxiety, improve focus, and enhance
                emotional well-being. By regularly disconnecting from distractions, we can better process our thoughts
                and emotions, making it easier to respond thoughtfully to challenges. These mindful pauses cultivate
                self-awareness, allowing us to navigate daily demands with greater clarity, patience, and resilience,
                ultimately supporting a balanced life.
            </list-item>

            <list-item title-link="#test-link2" title-icon="emoji_events">
                <arpa-zone name="title">Track Your Progress</arpa-zone>
                <arpa-zone name="subtitle"> Celebrate every milestone you reach! </arpa-zone>
                Tracking your progress is crucial for achieving goals and staying motivated. By regularly reviewing what
                you’ve accomplished, you gain a sense of direction and accountability, making it easier to stay
                committed. Celebrating each milestone, no matter how small, boosts confidence and reinforces positive
                habits. Progress tracking also helps identify areas for improvement, giving insight into adjustments
                needed for success. This habit keeps you focused, enhances productivity, and fosters a mindset of
                continuous growth and self-improvement.
            </list-item>

            <list-item title-link="#test-link2" title-icon="lightbulb">
                <arpa-zone name="title">Explore New Ideas</arpa-zone>
                <arpa-zone name="subtitle"> Feed your curiosity and discover more. </arpa-zone>
                Exploring new ideas fuels creativity, innovation, and personal growth. When you open yourself to fresh
                perspectives, you expand your understanding of the world and discover new solutions to problems. This
                habit keeps the mind agile, encourages adaptability, and can lead to breakthroughs in work and life.
                Curiosity-driven exploration can spark inspiration, reignite motivation, and help you stay engaged with
                your goals. Embracing new ideas fosters a mindset of learning, making each day an opportunity for
                discovery and self-improvement.
            </list-item>

            <list-item title-link="#test-link3" title-icon="self_improvement">
                <arpa-zone name="title">Embrace Gratitude</arpa-zone>
                <arpa-zone name="subtitle">Recognize the good in every day.</arpa-zone>
                Practicing gratitude enhances happiness and mental health. By taking a moment to reflect on what we
                appreciate, we create a positive outlook that can improve resilience and strengthen relationships. Small
                acts of gratitude, like journaling or acknowledging others, remind us of life’s positives, creating a
                foundation of optimism and peace even in challenging times.
            </list-item>

            <list-item title-link="#test-link4" title-icon="fitness_center">
                <arpa-zone name="title">Physical Well-Being</arpa-zone>
                <arpa-zone name="subtitle">Strengthen your body, energize your mind.</arpa-zone>
                Physical activity is a cornerstone of both mental and physical health. A consistent exercise routine can
                improve energy levels, boost mood, and reduce stress. Even a few minutes of movement each day promotes
                cardiovascular health, enhances focus, and builds confidence. Small steps toward fitness can lead to
                powerful, lasting improvements in overall well-being.
            </list-item>

            <list-item title-link="#test-link5" title-icon="insights">
                <arpa-zone name="title">Reflect and Grow</arpa-zone>
                <arpa-zone name="subtitle">Use self-reflection as a tool for improvement.</arpa-zone>
                Taking time to reflect on personal experiences fosters growth and resilience. Self-reflection helps us
                learn from past actions, identify strengths, and uncover areas for improvement. This practice builds
                self-awareness, allowing us to approach goals with greater clarity and purpose. Regular reflection leads
                to more intentional living and personal fulfillment.
            </list-item>

            <list-item title-link="#test-link6" title-icon="palette">
                <arpa-zone name="title">Creative Expression</arpa-zone>
                <arpa-zone name="subtitle">Find joy in the art of self-expression.</arpa-zone>
                Embracing creativity can be a powerful outlet for emotions and thoughts. Whether through art, writing,
                or another medium, creative expression encourages us to explore our inner world. This practice nurtures
                confidence, improves problem-solving skills, and enhances emotional well-being. Creativity is a vital
                aspect of a balanced life, inspiring innovation and joy.
            </list-item>
        </arpa-list>`;
    }
};

/** @type {Story} */
export const Render = {};

/** @type {Story} */
export const Test = {
    play: async ({ canvasElement, canvas, step }) => {
        /** @type {List | null} */
        const listNode = canvasElement.querySelector('arpa-list');
        await listNode?.promise;
        step('Renders the items', async () => {
            await waitFor(() => {
                expect(canvas.getAllByRole('listitem')).toHaveLength(8);
                expect(canvas.getAllByRole('button', { name: /Read more/i })).toHaveLength(8);
            });
            const items = canvas.getAllByRole('listitem');
            expect(items).toHaveLength(8);
            expect(canvas.getByText('List aside')).toBeInTheDocument();
            expect(canvas.getByText('List heading')).toBeInTheDocument();
            const textContent = items[0].querySelector('.truncateText__content');
            expect(textContent?.textContent).toHaveLength(70);
            await waitFor(() => expect(canvas.queryByText('No items found.')).not.toBeInTheDocument());
        });
    }
};

export default ContentDrivenStories;
