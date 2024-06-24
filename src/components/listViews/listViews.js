/**
 * @typedef {import('@arpadroid/application/dist/index.js').ListResource} ListResource
 * @typedef {import('../list/list.js').default} List
 */
import { mergeObjects } from '@arpadroid/tools';
import { Context } from '@arpadroid/application';
// import { IconMenu } from '@arpadroid/navigation';
import { ArpaElement } from '@arpadroid/ui';

export const LIST_VIEW_GRID = 'grid';
export const LIST_VIEW_GRID_COMPACT = 'grid-compact';
export const LIST_VIEW_LIST = 'list';
export const LIST_VIEW_LIST_COMPACT = 'list-compact';
class ListViews extends ArpaElement {
    // #region INITIALIZATION
    getDefaultConfig() {
        this.onChange = this.onChange.bind(this);
        return mergeObjects(super.getDefaultConfig(), {
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
                    iconRight: 'view_module',
                    value: LIST_VIEW_GRID
                },
                {
                    title: 'Grid Compact',
                    iconRight: 'view_comfy',
                    value: LIST_VIEW_GRID_COMPACT
                }
            ]
        });
    }

    initializeProperties() {
        /** @type {List} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this._initializeViewFilter();
        this._initializeViewsConfig();
        super.initializeProperties();
        this.viewClasses = this._config.links.map(link => 'listView--' + link.value);
        Context.Router.listen('ROUTE_CHANGED', () => this.initializeView());
        return true;
    }

    _initializeViewsConfig() {
        this.getOptions().forEach(view => this.addView(view));
    }

    _initializeViewFilter() {
        const defaultView = this.list?.getDefaultView();
        this.viewFilter = this.listResource.getViewFilter({
            defaultValue: defaultView ?? 'list'
        });
    }

    // #endregion

    // #region ACCESSORS

    getOptions() {
        const { options, defaultOptions } = this._config;
        return (options ?? defaultOptions ?? []).filter(link => this.getViewsConfig().includes(link.value));
    }

    getDefaultOptions() {
        return this.list?._config?.viewOptions ?? this._config?.defaultOptions;
    }

    getViewsConfig() {
        return this.list._config?.views ?? this.getProperty('views') ?? [];
    }

    addView(view) {
        const defaults = {
            selected: this.viewFilter?.getValue() === view.value,
            action: this.onChange,
            handlerAttributes: {
                'data-value': view.value
            }
        };
        const link = mergeObjects(defaults, view);
        this._config.links.push(link);
    }

    async setView(view) {
        const viewExists = this.viewExists(view);
        if (!viewExists) {
            view = this?.viewFilter.getDefaultValue();
        }
        this?.viewFilter?.setValue(view);
        this.list && (await this.list.onReady());
        this.applyView(view);
    }

    viewExists(view) {
        return Boolean(this._config.links.find(link => link.value === view));
    }

    async applyView(view) {
        this.list?.classList.remove(...this.viewClasses);
        this.list?.classList.add('listView--' + view);
        if (view === 'grid-compact') {
            this.list?.classList.add('listView--grid');
        }
        const prevSelected = this.navigation.querySelectorAll('[aria-current]');
        prevSelected.forEach(node => node.removeAttribute('aria-current'));
        const selected = this.navigation.querySelector(`[data-value="${view}"]`);
        selected?.setAttribute('aria-current', 'location');
    }

    _onConnected() {
        super._onConnected();
        console.log('Im connected');
        // this.navigation.onRendered(() => this.initializeView());
    }

    initializeView(view = this.viewFilter?.getValue()) {
        this.setView(view);
    }

    // #endregion

    // #region EVENTS

    onChange(event, navLink) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const value = navLink.linkNode.getAttribute('data-value');
        this.setView(value);
    }

    // #endregion
}

customElements.define('list-views', ListViews);

export default ListViews;
