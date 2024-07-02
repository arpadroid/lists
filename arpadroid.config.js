const html = String.raw;
const config = {
    storybookPreviewHead: () => {
        return html`
            <link rel="stylesheet" href="/material-symbols/outlined.css" />
            <link rel="stylesheet" href="/themes/default/default.bundled.final.css" />
            <script type="module" src="/arpadroid-lists.js"></script>
        `;
    }
};

export default config;
