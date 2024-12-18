/**
 * @typedef {import('../list-item/listItemInterface.d.ts').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/resources/src').ListResource} ListResource
 * @typedef {import('@arpadroid/forms').SearchField} SearchField
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/resources/src').ListFilter} ListFilter
 */

import { editURL, attrString, SearchTool } from '@arpadroid/tools';
import { Context } from '@arpadroid/application';
import { ArpaElement } from '@arpadroid/ui';
import { I18nTool } from '@arpadroid/i18n';
const html = String.raw;
class ListSearch extends ArpaElement {
    //////////////////////////
    // #region INITIALIZATION
    //////////////////////////

    getDefaultConfig() {
        this.bind('_onSubmit');
        return {
            hasMiniSearch: true,
            searchSelector: '.listItem__title'
        };
    }

    async initializeProperties() {
        /** @type {List} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        /** @type {ListFilter} searchFilter */
        this.searchFilter = this?.listResource?.getSearchFilter();
        /** @type {ListFilter} sortDirFilter */
        this.urlParam = this.searchFilter?.getUrlName();
        return true;
    }

    async onReady() {
        return await customElements.whenDefined('arpa-form');
    }

    async _initializeNodes() {
        this.form = this.querySelector('form');
        await customElements.whenDefined('arpa-form');
        this.form.onSubmit(this._onSubmit);
        /** @type {SearchField} */
        this.searchField = this.form.getField('search');
        this.initializeSearch();
    }

    async initializeSearch() {
        if (!this.searchFilter) {
            return;
        }
        this.search = new SearchTool(this.searchField.input, {
            container: this.list.itemsNode,
            searchSelector: this.getProperty('search-selector'),
            onSearch: this.onSearch,
            debounceDelay: this.getProperty('debounce-search'),
            hideNonMatches: false,
            getNodes: () => Array.from(this.list?.itemsNode?.querySelectorAll('.listItem'))
        });

        this.searchField.setValue(this.searchFilter.getValue());
        this.searchFilter.on('value', value => this.searchField.setValue(value));
    }

    // #endregion

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getFiltersWrapper() {
        return this.listComponent?.node?.querySelector('.list__filtersMenu');
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    render() {
        const searchAttr = attrString({
            'has-mini-search': this.getProperty('has-mini-search'),
            placeholder: this.list.getProperty('search-placeholder')
        });
        this.innerHTML = I18nTool.processTemplate(
            html`<form id="{formId}" is="arpa-form" variant="mini">
                <search-field id="search" ${searchAttr}></search-field>
            </form>`,
            this.getTemplateVars()
        );
        this.listSort = this.querySelector('list-sort');
    }

    getTemplateVars() {
        return {
            id: this.id,
            formId: `${this.list.getId()}-list-search-form`
        };
    }

    // #endregion

    _onSubmit() {
        this._onSearch();
        const searchValue = this.searchField.getValue();
        if (typeof this._config.onSubmit === 'function') {
            this._config.onSubmit(searchValue);
        }
    }

    async _onSearch() {
        if (this.searchFilter) {
            const searchValue = this.searchField.getValue() || '';
            this.searchFilter.setValue(searchValue);
            await Context.Router.go(
                editURL(Context.Router.getRoute(), {
                    [this.list.getParamName('search')]: searchValue,
                    [this.list.getParamName('page')]: 1
                })
            );
            this.list?.fetchPromise && (await this.list.fetchPromise);
            this.search.doSearch();
        }
    }
}

customElements.define('list-search', ListSearch);

export default ListSearch;
