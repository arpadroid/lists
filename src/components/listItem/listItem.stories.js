/**
 * @typedef {import('../list.js').default} List
 */
import { Default as ListStory } from '../list/stories/list.stories.js';
import { attrString } from '@arpadroid/tools';
// import { userEvent } from '@storybook/test';

const html = String.raw;

const Default = {
    ...ListStory,
    title: 'Components/List Item',
    args: {
        ...ListStory.args,
        id: 'list-item',
        allControls: false,
        itemsPerPage: 1,
        title: 'List item'
    },
    render: args => {
        return html` <arpa-list ${attrString(args)}> ${ListStory.renderItemTemplate(args)} </arpa-list> `;
    }
};

export const Render = Default;

export const HTMLItems = {
    args: {
        ...Default.args,
        id: 'list-item-test'
    },
    render: args => {
        return html`<arpa-list ${attrString(args)}>
            <template template-id="list-item-template" truncate-content="70"></template>
            <list-item title-link="#test-link" title-icon="auto_awesome">
                <zone name="title">Morning Motivation</zone>
                <zone name="subtitle"> Start your day with a burst of energy! </zone>
                Morning motivation is key to setting a positive tone for the day. Starting your morning with an
                energizing mindset can enhance focus, boost productivity, and improve overall well-being. When you take
                time in the morning to set goals or engage in uplifting activities, it strengthens mental resilience and
                prepares you to handle challenges. This initial boost also impacts mood, helping maintain a positive
                outlook. Consistently practicing morning motivation can gradually lead to more fulfilling days and a
                healthier lifestyle.
            </list-item>

            <list-item title-link="#test-link2" title-icon="spa">
                <zone name="title">Mindful Moments</zone>
                <zone name="subtitle"> Take a pause and focus on the present. </zone>
                Practicing mindful moments is essential for managing stress and staying grounded. Taking a few moments
                to pause, breathe, and focus on the present can help reduce anxiety, improve focus, and enhance
                emotional well-being. By regularly disconnecting from distractions, we can better process our thoughts
                and emotions, making it easier to respond thoughtfully to challenges. These mindful pauses cultivate
                self-awareness, allowing us to navigate daily demands with greater clarity, patience, and resilience,
                ultimately supporting a balanced life.
            </list-item>

            <list-item title-link="#test-link2" title-icon="emoji_events">
                <zone name="title">Track Your Progress</zone>
                <zone name="subtitle"> Celebrate every milestone you reach! </zone>
                Tracking your progress is crucial for achieving goals and staying motivated. By regularly reviewing what
                you’ve accomplished, you gain a sense of direction and accountability, making it easier to stay
                committed. Celebrating each milestone, no matter how small, boosts confidence and reinforces positive
                habits. Progress tracking also helps identify areas for improvement, giving insight into adjustments
                needed for success. This habit keeps you focused, enhances productivity, and fosters a mindset of
                continuous growth and self-improvement.
            </list-item>

            <list-item title-link="#test-link2" title-icon="lightbulb">
                <zone name="title">Explore New Ideas</zone>
                <zone name="subtitle"> Feed your curiosity and discover more. </zone>
                Exploring new ideas fuels creativity, innovation, and personal growth. When you open yourself to fresh
                perspectives, you expand your understanding of the world and discover new solutions to problems. This
                habit keeps the mind agile, encourages adaptability, and can lead to breakthroughs in work and life.
                Curiosity-driven exploration can spark inspiration, reignite motivation, and help you stay engaged with
                your goals. Embracing new ideas fosters a mindset of learning, making each day an opportunity for
                discovery and self-improvement.
            </list-item>

            <list-item title-link="#test-link3" title-title-icon="self_improvement">
                <zone name="title">Embrace Gratitude</zone>
                <zone name="subtitle">Recognize the good in every day.</zone>
                Practicing gratitude enhances happiness and mental health. By taking a moment to reflect on what we
                appreciate, we create a positive outlook that can improve resilience and strengthen relationships. Small
                acts of gratitude, like journaling or acknowledging others, remind us of life’s positives, creating a
                foundation of optimism and peace even in challenging times.
            </list-item>

            <list-item title-link="#test-link4" title-icon="fitness_center">
                <zone name="title">Physical Well-Being</zone>
                <zone name="subtitle">Strengthen your body, energize your mind.</zone>
                Physical activity is a cornerstone of both mental and physical health. A consistent exercise routine can
                improve energy levels, boost mood, and reduce stress. Even a few minutes of movement each day promotes
                cardiovascular health, enhances focus, and builds confidence. Small steps toward fitness can lead to
                powerful, lasting improvements in overall well-being.
            </list-item>

            <list-item title-link="#test-link5" title-icon="insights">
                <zone name="title">Reflect and Grow</zone>
                <zone name="subtitle">Use self-reflection as a tool for improvement.</zone>
                Taking time to reflect on personal experiences fosters growth and resilience. Self-reflection helps us
                learn from past actions, identify strengths, and uncover areas for improvement. This practice builds
                self-awareness, allowing us to approach goals with greater clarity and purpose. Regular reflection leads
                to more intentional living and personal fulfillment.
            </list-item>

            <list-item title-link="#test-link6" title-icon="palette">
                <zone name="title">Creative Expression</zone>
                <zone name="subtitle">Find joy in the art of self-expression.</zone>
                Embracing creativity can be a powerful outlet for emotions and thoughts. Whether through art, writing,
                or another medium, creative expression encourages us to explore our inner world. This practice nurtures
                confidence, improves problem-solving skills, and enhances emotional well-being. Creativity is a vital
                aspect of a balanced life, inspiring innovation and joy.
            </list-item> 
        </arpa-list>`;
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement, false);
        step('Renders the item', async () => {
            console.log('Test step');
        });
    }
};

export default Default;
