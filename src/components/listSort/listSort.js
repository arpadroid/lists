/**
 * @typedef {import('@arpadroid/ui').Icon} Icon
 * @typedef {import('@arpadroid/ui').Tooltip} Tooltip
 * @typedef {import('@arpadroid/forms').SearchField} SearchField
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').FieldOptionConfigType} FieldOptionConfigType
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('../listItem/listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('../list/list.types').ListConfigType} ListConfigType
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../multiSelect/multiSelect.js').IconMenu} IconMenu
 * @typedef {import('../listItem/listItem.js').default} ListItem
 * @typedef {import('./listSort.types').ListSortConfigType} ListSortConfigType
 * @typedef {import('@arpadroid/navigation').NavList} NavList
 */

import { mapHTML, attr, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';

const html = String.raw;
class ListSort extends ArpaElement {
    /** @type {ListSortConfigType} */
    _config = this._config;
    //////////////////////////////
    // #region INITIALIZATION
    /////////////////////////////

    /**
     * Returns the default configuration for the list sort component.
     * @returns {ListSortConfigType} The default configuration object.
     */
    getDefaultConfig() {
        this.bind('update', '_onRouteChange', '_onSortBySelected', '_isItemSelected');
        this.i18nKey = 'lists.listSort';
        return {
            iconAsc: 'keyboard_double_arrow_up',
            iconDesc: 'keyboard_double_arrow_down',
            iconSort: 'sort',
            paramAsc: 'asc',
            paramDesc: 'desc'
        };
    }

    initializeProperties() {
        /** @type {List | null} */
        this.list = this.closest('.arpaList');
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        /** @type {ListFilter} sortDirFilter */
        this.sortDirFilter = this.listResource?.getSortDirFilter();
        /** @type {ListFilter} sortDirFilter */
        this.sortFilter = this.listResource?.getSortFilter();
        return true;
    }
    ////////////////////////////////
    // #endregion INITIALIZATION
    ///////////////////////////////

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getSortDir() {
        return this.listResource?.getSortDirection() || 'asc';
    }

    getSortDirIcon(dir = this.getSortDir()) {
        return dir === 'asc' ? this.getProperty('icon-asc') : this.getProperty('icon-desc');
    }

    getSortDirTooltip(dir = this.getSortDir()) {
        return this.i18n(dir === 'asc' ? 'lblSortAsc' : 'lblSortDesc');
    }
    ///////////////////////////////
    // #endregion ACCESSORS
    //////////////////////////////

    /////////////////////////////
    // #region LIFECYCLE
    ////////////////////////////

    _onConnected() {
        this.router?.on('route_changed', this._onRouteChange);
    }

    _onRouteChange() {
        this.updateSortLink();
    }

    updateSortLink(sortLink = this.sortLink) {
        const sortDir = this.getSortDir();
        /** @type {Icon | null | undefined} */
        const icon = sortLink?.querySelector('arpa-icon');
        icon?.setIcon(this.getSortDirIcon());
        sortLink?.setAttribute('param-value', sortDir === 'asc' ? 'desc' : 'asc');
        /** @type {Tooltip | null | undefined} */
        const tooltip = sortLink?.querySelector('arpa-tooltip');
        tooltip?.setContent(this.getSortDirTooltip());
    }

    /////////////////////////////
    // #endregion LIFECYCLE
    ////////////////////////////

    ///////////////////////////
    // #region RENDERING
    //////////////////////////

    render() {
        const sortDir = this.listResource?.getSortDirection() === 'asc' ? 'desc' : 'asc';
        // @ts-ignore
        const links = mapHTML(this.list?.getSortOptions() || [], payload => {
            const { value = '', icon = '', label = '' } = payload;
            return html`<nav-link link="${value}" icon-left="${icon}" label="${label}"></nav-link>`;
        });
        this.innerHTML = html`<icon-menu
                class="sortMenu"
                icon="sort_by_alpha"
                tooltip="${this.i18nText('lblSortBy')}"
                zone="sort-options"
            >
                ${links}
            </icon-menu>
            <nav-link
                class="sortDirButton iconButton__button"
                param-name="${this.list?.getParamName('sortDir')}"
                param-value="${sortDir}"
                param-clear="${this.list?.getParamName('page')}"
                icon="${this.getSortDirIcon()}"
                label="${this.i18nText('lblSortOrder')}"
                use-router
            >
                <zone name="tooltip-content">${this.getSortDirTooltip()}</zone>
            </nav-link>`;
        this.sortLink = this.querySelector('.sortDirButton');
        this._initializeNav();
    }

    _initializeNav() {
        /** @type {IconMenu | null} */
        this.sortByMenu = this.querySelector('icon-menu');
        this.sortByMenu &&
            this.sortByMenu?.onRenderReady(async () => {
                await customElements.whenDefined('nav-list');
                /** @type {NavList | null} */
                this.sortNav = this.sortByMenu?.navigation;
                if (this.sortNav) {
                    if (this.sortNav?._config && typeof this._isItemSelected === 'function') {
                        this.sortNav._config.isItemSelected = this._isItemSelected;
                    }

                    attr(this.sortNav, {
                        'param-name': this.list?.getParamName('sortBy'),
                        'use-router': '',
                        'param-clear': this.list?.getParamName('page')
                    });
                    this.sortNav.on('selected', this._onSortBySelected, this._unsubscribes);
                }
            });
    }

    /**
     * Checks if the item is selected.
     * @param {import('@arpadroid/navigation').SelectedCallbackPayloadType} payload
     * @returns {boolean}
     */
    _isItemSelected(payload) {
        const sortByValue = this.sortFilter?.getValue();
        if (!sortByValue) return false;
        const itemValue = payload?.node?.getAttribute('param-value');
        return itemValue === sortByValue;
    }

    /**
     * When a sort option is selected.
     * @param {ListItem} item
     */
    _onSortBySelected(item) {
        const icon = item.getProperty('icon') || item.getProperty('icon-right');
        this.sortByMenu?.setIcon(icon);
        this.sortByMenu?.setTooltip(
            html`<span>${this.i18n('lblSortedBy')}</span> <strong>${item.getLabelText()}</strong>`
        );
    }
    //////////////////////////
    // #endregion RENDERING
    //////////////////////////
}
defineCustomElement('list-sort', ListSort);

export default ListSort;
