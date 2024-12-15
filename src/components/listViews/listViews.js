/**
 * @typedef {import('@arpadroid/resources/src').ListResource} ListResource
 * @typedef {import('../list/list.js').default} List
 */
import { mergeObjects, attrString, clearLazyQueue } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';
import { Context } from '@arpadroid/application';

export const LIST_VIEW_GRID = 'grid';
export const LIST_VIEW_GRID_COMPACT = 'grid-compact';
export const LIST_VIEW_LIST = 'list';
export const LIST_VIEW_LIST_COMPACT = 'list-compact';
const html = String.raw;
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
                    iconRight: 'grid_view',
                    value: LIST_VIEW_GRID
                },
                {
                    title: 'Grid Compact',
                    iconRight: 'view_module',
                    value: LIST_VIEW_GRID_COMPACT
                }
            ]
        });
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
        /** @type {List} */
        this.list = this.closest('.arpaList, .gallery');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this._initializeViewFilter();
        this._initializeViewsConfig();

        this.viewClasses = this._config.links.map(link => 'listView--' + link.value);
        this.itemViewClasses = this._config.links.map(link => 'listItem--' + link.value);
        Context.Router.on('route_changed', () => this.initializeView());
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

    getOptions() {
        const { options, defaultOptions } = this._config;
        return (options ?? defaultOptions ?? []).filter(link => this.getViewsConfig().includes(link.value));
    }

    getDefaultOptions() {
        return this.list?._config?.viewOptions ?? this._config?.defaultOptions;
    }

    getViewsConfig() {
        return this.list.getArrayProperty('views') ?? this.getArrayProperty('views') ?? [];
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
            view = this?.viewFilter?.getDefaultValue();
        }
        clearLazyQueue();
        this?.viewFilter?.setValue(view);
        this.applyView(view);
    }

    viewExists(view) {
        return Boolean(this._config.links.find(link => link.value === view));
    }

    applyView(view) {
        this.list?.classList.remove(...this.viewClasses);
        this.list?.classList.add('listView--' + view);
        view === 'grid-compact' && this.list?.classList.add('listView--grid');
        this.list?.getItems().forEach(item => {
            item?.node?.classList.remove(...this.itemViewClasses);
            item?.node?.classList.add('listItem--' + view);
        });
        const prevSelected = this.navigation?.querySelectorAll('[aria-current]');
        prevSelected?.forEach(node => node.removeAttribute('aria-current'));
        const selected = this.navigation?.querySelector(`[data-value="${view}"]`);
        selected?.setAttribute('aria-current', 'location');
    }

    async _onConnected() {
        super._onConnected();
        await customElements.whenDefined('icon-menu');
        this.iconMenu = this.querySelector('icon-menu');
        if (this.iconMenu) {
            this.iconMenu.setLinks(this._config.links);
            return this.iconMenu?.onRendered(() => {
                this.navigation = this.iconMenu.navigation;
                this.initializeView();
                return true;
            });
        } else {
            this.initializeView();
        }
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
