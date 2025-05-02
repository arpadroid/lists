/**
 * @typedef {import("./listItem.types").ListItemViewConfigType} ListItemViewConfigType
 */
const html = String.raw;

/** @type {ListItemViewConfigType} */
export const ListView = {
    id: 'list',
    label: 'List',
    className: 'listItem--list',
    template: html`<{wrapperComponent} {wrapperAttributes}>
        {icon} {image}
        <div class="listItem__contentWrapper">
            <div class="listItem__contentHeader">
                {titleContainer}
            </div>
            {children}
            {tags}
        </div>
        {iconRight}
    </{wrapperComponent}>
    {rhs}`
};

export const ListCompactView = {
    id: 'list-compact',
    label: 'List Compact',
    className: 'listItem--compact',
    template: html`<{wrapperComponent} {wrapperAttributes}>
        {checkbox}{icon}{image}
        <div class="listItem__contentWrapper">
            <div class="listItem__contentHeader">
                {titleContainer}
            </div>
            {children}
        </div>
        {iconRight}
    </{wrapperComponent}>
    <div class="listItem__rhs" zone="rhs">
        {tags}
        {nav}
    </div>`
};

export const GridView = {
    id: 'grid',
    label: 'Grid',
    className: 'listItem--grid',
    template: html`<{wrapperComponent} {wrapperAttributes}>
        {icon} 
        <div class="listItem__contentWrapper">
            <div class="listItem__contentHeader">
                {titleContainer}
                {image}
                {tags}
            </div>
            {children}
        </div>
        {iconRight}
    </{wrapperComponent}>
    {rhs}`
};

export const GridCompactView = {
    id: 'grid-compact',
    label: 'Grid Compact',
    className: 'listItem--grid-compact',
    template: html`<{wrapperComponent} {wrapperAttributes}>
        {icon} 
        <div class="listItem__contentHeader">
            {titleContainer}
            {image}
            {tags}
        </div>
        {iconRight}
    </{wrapperComponent}>
    {rhs}`
};

/** @type {Record<string, ListItemViewConfigType>} */
const ListItemViews = {
    list: ListView,
    listCompact: ListCompactView,
    grid: GridView,
    gridCompact: GridCompactView
};

export default ListItemViews;
