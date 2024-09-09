/**
 * @typedef {import('../list-item/listItemInterface.d.ts').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../../resources/listResource.js').default} ListResource
 * @typedef {import('../../../form/components/fields/searchField/searchField.js').default} SearchField
 * @typedef {import('../../../form/components/fields/selectCombo/selectCombo.js').default} SelectCombo
 * @typedef {import('@arpadroid/application/src/resources/listResource/listFilter').default} ListFilter
 */

import { editURL, attrString } from '@arpadroid/tools';
import { Context } from '@arpadroid/application';
import { ArpaElement } from '@arpadroid/ui';
import { I18nTool } from '@arpadroid/i18n';
const html = String.raw;
class ListSearch extends ArpaElement {
    //////////////////////////
    // #region INITIALIZATION
    //////////////////////////
    _bindMethods() {
        super._bindMethods();
        this._onSubmit = this._onSubmit.bind(this);
    }

    getDefaultConfig() {
        return {
            hasMiniSearch: true
        };
    }

    async initializeProperties() {
        this.list = this.closest('.arpaList');
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

    async _onInitialized() {
        await this.onReady();
        this.form = this.querySelector('form');
        this.searchField = this.form.getField('search');
        if (this.searchFilter) {
            this.searchField.setValue(this.searchFilter.getValue());
            this.searchFilter.listen('value', value => this.searchField.setValue(value));
        }
        this.form.onSubmit(this._onSubmit);
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
            'has-mini-search': this.getProperty('has-mini-search')
        });
        this.innerHTML = I18nTool.processTemplate(
            html`<form id="{formId}" is="arpa-form" variant="mini">
                ${this.list?.hasSearch() ? html`<search-field id="search" ${searchAttr}></search-field>` : ''}
                ${this.list?.hasSort() ? html`<list-sort></list-sort>` : ''}
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

    _onSearch() {
        if (this.searchFilter) {
            const searchValue = this.searchField.getValue() || '';
            this.searchFilter.setValue(searchValue);
            const url = editURL(Context.Router.getRoute(), {
                [this.list.getParamName('search')]: searchValue,
                [this.list.getParamName('page')]: 1
            });
            window.history.pushState({}, '', url);
            this.listResource?.fetch();
        }
    }
}

customElements.define('list-search', ListSearch);

export default ListSearch;
