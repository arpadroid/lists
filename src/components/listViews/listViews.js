/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('@arpadroid/navigation').NavLink} NavLink
 * @typedef {import('@arpadroid/navigation').NavLinkConfigType} NavLinkConfigType
 * @typedef {import('./listViews.types').ListViewConfigType} ListViewConfigType
 * @typedef {import('./listViews.types').ListViewsConfigType} ListViewsConfigType
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 */
import { mergeObjects, attrString, clearLazyQueue, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';

export const LIST_VIEW_GRID = 'grid';
export const LIST_VIEW_GRID_COMPACT = 'grid-compact';
export const LIST_VIEW_LIST = 'list';
export const LIST_VIEW_LIST_COMPACT = 'list-compact';
const html = String.raw;
class ListViews extends ArpaElement {
    /** @type {ListViewsConfigType} */
    _config = this._config;
    // #region INITIALIZATION
    getDefaultConfig() {
        this.onChange = this.onChange.bind(this);
        /** @type {ListViewsConfigType} */
        const conf = {
            icon: 'visibility',
            label: 'Views',
            views: [LIST_VIEW_LIST, LIST_VIEW_LIST_COMPACT, LIST_VIEW_GRID, LIST_VIEW_GRID_COMPACT],
            links: [],
            options: undefined,
            defaultOptions: [
                {
                    title: 'List',
                    iconRight: 'view_list',
                    value: LIST_VIEW_LIST
                },
                {
                    title: 'List Compact',
                    iconRight: 'reorder',
                    value: LIST_VIEW_LIST_COMPACT
                },
                {
                    title: 'Grid',
                    iconRight: 'grid_view',
                    value: LIST_VIEW_GRID
                },
                {
                    title: 'Grid Compact',
                    iconRight: 'view_module',
                    value: LIST_VIEW_GRID_COMPACT
                }
            ]
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }
    render() {
        const views = this.getViewsConfig();
        if (views.length < 2) {
            this.remove();
            return;
        }
        const { label, icon } = this.getProperties('icon', 'label');
        this.innerHTML = html`<icon-menu ${attrString({ tooltip: label, icon })}></icon-menu>`;
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List | null} */
        this.list = this.closest('.arpaList, .gallery');
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this._initializeViewFilter();
        this._initializeViewsConfig();
        const { links = [] } = this._config;
        this.viewClasses = links.map(link => 'listView--' + link.value);
        this.itemViewClasses = links.map(link => 'listItem--' + link.value);
        this.router?.on('route_changed', () => this.initializeView());
        return true;
    }

    _initializeViewsConfig() {
        this.getOptions().forEach(view => this.addView(view));
    }

    _initializeViewFilter() {
        const defaultView = this.list?.getDefaultView();
        this.viewFilter = this.listResource?.getViewFilter({
            defaultValue: defaultView ?? 'list'
        });
    }

    // #endregion

    // #region ACCESSORS

    /**
     * Returns the options.
     * @returns {ListViewConfigType[]}
     */
    getOptions() {
        const { options, defaultOptions } = this._config;
        const opt = Array.from(options ?? defaultOptions ?? []);
        return opt?.filter(link => link.value && this.getViewsConfig()?.includes(link.value));
    }

    getDefaultOptions() {
        return this.list?._config?.viewOptions ?? this._config?.defaultOptions;
    }

    /**
     * Returns the views config.
     * @returns {string[]}
     */
    getViewsConfig() {
        const rv = this.list?.getArrayProperty('views') ?? this.getArrayProperty('views') ?? [];
        return Array.isArray(rv) ? rv : [];
    }

    /**
     * Adds a view.
     * @param {ListViewConfigType} view
     */
    addView(view) {
        const defaults = {
            selected: this.viewFilter?.getValue() === view.value,
            action: this.onChange,
            handlerAttributes: {
                'data-value': view.value
            }
        };
        const link = mergeObjects(defaults, view);
        this._config.links?.push(link);
    }

    /**
     * Sets the view.
     * @param {string} view
     */
    async setView(view) {
        const viewExists = this.viewExists(view);
        if (!viewExists) {
            view = String(this?.viewFilter?.getDefaultValue() || '');
        }
        clearLazyQueue();
        this?.viewFilter?.setValue(view);
        this.applyView(view);
    }

    /**
     * Checks if the view exists.
     * @param {string} view
     * @returns {boolean}
     */
    viewExists(view) {
        return Boolean(this._config?.links?.find((/** @type {ListViewConfigType} */ link) => link.value === view));
    }

    /**
     * Applies the view.
     * @param {string} view
     */
    applyView(view) {
        this.list?.classList.remove(...(this.viewClasses || []));
        this.list?.classList.add('listView--' + view);
        view === 'grid-compact' && this.list?.classList.add('listView--grid');
        this.list?.getItemNodes()?.forEach(item => {
            item?.classList.remove(...(this.itemViewClasses || []));
            item?.classList.add('listItem--' + view);
        });
        const prevSelected = this.navigation?.querySelectorAll('[aria-current]');
        prevSelected?.forEach((/** @type {import('@arpadroid/tools').ElementType} */ node) =>
            node.removeAttribute('aria-current')
        );
        const selected = this.navigation?.querySelector(`[data-value="${view}"]`);
        selected?.setAttribute('aria-current', 'location');
    }

    async _onConnected() {
        super._onConnected();
        await customElements.whenDefined('icon-menu');
        /** @type {IconMenu | null} */
        this.iconMenu = this.querySelector('icon-menu');
        if (this.iconMenu) {
            this._config.links && this.iconMenu.setLinks(this._config.links);
            return this.iconMenu?.onRendered(() => {
                /** @type {HTMLElement | null} */
                this.navigation = /** @type {HTMLElement | null} */ (this.iconMenu?.navigation);
                this.initializeView();
                return true;
            });
        } else {
            this.initializeView();
        }
    }

    /**
     * Initializes the view.
     * @param {string} [view]
     */
    initializeView(view = String(this.viewFilter?.getValue() || '')) {
        this.setView(view);
    }

    // #endregion

    // #region EVENTS

    /**
     * On change view callback.
     * @param {Event} event
     * @param {NavLink} navLink
     */
    onChange(event, navLink) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const value = navLink.linkNode?.getAttribute('data-value');
        value && this.setView(value);
    }

    // #endregion
}
defineCustomElement('list-views', ListViews);

export default ListViews;
