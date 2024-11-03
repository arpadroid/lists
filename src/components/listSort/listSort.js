/**
 * @typedef {import('../list-item/listItemInterface.d.ts').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../../../form/components/fields/searchField/searchField.js').default} SearchField
 * @typedef {import('../../../form/components/fields/selectCombo/selectCombo.js').default} SelectCombo
 * @typedef {import('@arpadroid/application/src/resources/listResource/listFilter').default} ListFilter
 */

import { mapHTML, attr } from '@arpadroid/tools';
import { Context } from '@arpadroid/application';
import { ArpaElement } from '@arpadroid/ui';
const html = String.raw;
class ListSort extends ArpaElement {
    //////////////////////////////
    // #region INITIALIZATION
    /////////////////////////////

    getDefaultConfig() {
        this.bind('update', '_onRouteChange', '_onSortBySelected');
        this.i18nKey = 'lists.listSort';
        return {
            iconAsc: 'keyboard_double_arrow_up',
            iconDesc: 'keyboard_double_arrow_down',
            iconSort: 'sort',
            paramAsc: 'asc',
            paramDesc: 'desc'
        };
    }

    async initializeProperties() {
        /** @type {List} */
        this.list = this.closest('.arpaList');
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
        Context?.Router?.on('route_changed', this._onRouteChange);
    }

    _onRouteChange() {
        this.updateSortLink();
    }

    updateSortLink(sortLink = this.sortLink) {
        const sortDir = this.getSortDir();
        sortLink?.querySelector('arpa-icon')?.setIcon(this.getSortDirIcon());
        sortLink?.setAttribute('param-value', sortDir === 'asc' ? 'desc' : 'asc');
        sortLink?.querySelector('arpa-tooltip')?.setContent(this.getSortDirTooltip());
    }

    /////////////////////////////
    // #endregion LIFECYCLE
    ////////////////////////////

    ///////////////////////////
    // #region RENDERING
    //////////////////////////

    render() {
        const sortDir = this.listResource?.getSortDirection() === 'asc' ? 'desc' : 'asc';
        this.innerHTML = html`
            <icon-menu class="sortMenu" icon="sort_by_alpha" tooltip="Sort" zone="sort-options">
                ${mapHTML(this.list?.getSortOptions(), ({ value, icon, label }) => {
                    return html`<nav-link link="${value}" icon-left="${icon}" label="${label}"></nav-link>`;
                })}
            </icon-menu>
            <nav-link
                class="sortDirButton iconButton"
                param-name="${this.list?.getParamName('sortDir')}"
                param-value="${sortDir}"
                param-clear="${this.list?.getParamName('page')}"
                icon="${this.getSortDirIcon()}"
                use-router
            >
                <zone name="tooltip-content">${this.getSortDirTooltip()}</zone>
            </nav-link>
        `;
        this.sortLink = this.querySelector('.sortDirButton');
        this._initializeNav();
    }

    _initializeNav() {
        this.sortByMenu = this.querySelector('icon-menu');
        this.sortByMenu?.onRenderReady(() => {
            this.sortNav = this.sortByMenu?.navigation;
            attr(this.sortNav, {
                'param-name': this.list?.getParamName('sortBy'),
                'use-router': '',
                'param-clear': this.list?.getParamName('page')
            });
            this.sortNav.on('selected', this._onSortBySelected, this._unsubscribes);
        });
    }

    _onSortBySelected(item) {
        const icon = item.getProperty('icon') || item.getProperty('icon-right');
        this.sortByMenu.setIcon(icon);
        this.sortByMenu.setTooltip(
            html`<span>${this.i18n('lblSortedBy')}</span> <strong>${item.getLabelText()}</strong>`
        );
    }
    //////////////////////////
    // #endregion RENDERING
    //////////////////////////
}

customElements.define('list-sort', ListSort);

export default ListSort;
