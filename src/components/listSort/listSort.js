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
    //////////////////////////
    // #region INITIALIZATION
    //////////////////////////
    _bindings = ['renderSelectValue', 'onSelectChange', 'update', 'onSortClick'];

    getDefaultConfig() {
        this.i18nKey = 'modules.list.listSort';
        return {
            lblNoSelection: this.i18nText('lblNoSelection'),
            lblSortAsc: this.i18n('lblSortAsc'),
            lblSortDesc: this.i18n('lblSortDesc'),
            lblSortedBy: this.i18n('lblSortedBy'),
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

    // #endregion

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
        const prop = dir === 'asc' ? 'lbl-sort-asc' : 'lbl-sort-desc';
        return this.getProperty(prop);
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    async onReady() {
        return await customElements.whenDefined('arpa-form');
    }

    _onConnected() {
        this._unsubscribes.push(Context.Router.on('route_changed', () => this.updateSortLink()));
    }

    updateSortLink() {
        const sortDir = this.getSortDir();
        this.sortLink?.querySelector('arpa-icon')?.setIcon(this.getSortDirIcon());
        this.sortLink?.setAttribute('param-value', sortDir === 'asc' ? 'desc' : 'asc');
        this.sortLink?.querySelector('arpa-tooltip')?.setContent(this.getSortDirTooltip());
    }

    ////////////////////
    // #region RENDERING
    ////////////////////

    async render() {
        const sortDir = this.listResource?.getSortDirection() === 'asc' ? 'desc' : 'asc';
        this.innerHTML = html`
            <icon-menu class="sortMenu" icon="sort_by_alpha" tooltip="Sort">
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
                <arpa-zone name="tooltip">${this.getSortDirTooltip()}</arpa-zone>
            </nav-link>
        `;
        this.sortLink = this.querySelector('.sortDirButton');
        this._initializeNav();
    }

    async _initializeNav() {
        this.sortByMenu = this.querySelector('icon-menu');
        if (!this.sortByMenu) {
            return;
        }
        this.sortByMenu?.promise && (await this.sortByMenu.promise);
        this.sortNav = this.sortByMenu.navigation;
        this.sortNav &&
            attr(this.sortNav, {
                zone: 'sort-options',
                'param-name': this.list?.getParamName('sortBy'),
                'use-router': '',
                'param-clear': this.list?.getParamName('page')
            });

        this.sortNav?.on(
            'selected',
            item => {
                const icon = item.getProperty('icon') || item.getProperty('icon-right');
                this.sortByMenu.setIcon(icon);
                const tooltip = item.getProperty('label') || item.contentNode?.innerText?.trim();
                this.sortByMenu.setTooltip(
                    html`<span>${this.getProperty('lblSortedBy')}</span> <strong>${tooltip}</strong>`
                );
            },
            this._unsubscribes
        );
    }

    // #endregion
}

customElements.define('list-sort', ListSort);

export default ListSort;
