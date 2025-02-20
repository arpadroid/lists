/**
 * @typedef {import('../listItem/listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('../list/list.types').ListConfigType} ListConfigType
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('./listSearch.types').ListSearchConfigType} ListSearchConfigType
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/forms').SearchField} SearchField
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/services').Router} Router
 */

import { editURL, attrString, SearchTool, processTemplate, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';

const html = String.raw;
class ListSearch extends ArpaElement {
    /** @type {ListSearchConfigType} */ // @ts-ignore
    _config = this._config;
    //////////////////////////
    // #region INITIALIZATION
    //////////////////////////

    /**
     * Default component config.
     * @returns {ListSearchConfigType}
     */
    getDefaultConfig() {
        this.bind('_onSubmit', '_onSearch');
        return {
            hasMiniSearch: true,
            searchSelector: '.listItem__title'
        };
    }

    initializeProperties() {
        /** @type {List | null} */
        this.list = this.closest('.arpaList');
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        /** @type {ListFilter} searchFilter */
        this.searchFilter = this?.listResource?.getSearchFilter();
        this.urlParam = this.searchFilter?.getUrlName();
        return true;
    }

    /**
     * Returns a promise that must be resolved before the component is ready.
     * @returns {Promise<any>}
     */
    async onReady() {
        return await customElements.whenDefined('arpa-form');
    }

    async _initializeNodes() {
        /** @type {FormComponent | null} */
        this.form = /** @type {FormComponent | null} */ (this.querySelector('form'));
        await customElements.whenDefined('arpa-form');
        this.form?.onSubmit(this._onSubmit);
        /** @type {SearchField | null} */
        this.searchField = /** @type {SearchField | null} */ (this.form?.getField('search'));
        this.initializeSearch();
    }

    async initializeSearch() {
        if (!this.searchFilter) {
            return;
        }
        // @ts-ignore
        this.search = new SearchTool(this.searchField?.input, {
            container: this.list?.itemsNode,
            searchSelector: this.getProperty('search-selector'),
            // onSearch: this._onSearch,
            debounceDelay: this.getProperty('debounce-search'),
            hideNonMatches: false,
            getNodes: () => Array.from(this.list?.itemsNode?.querySelectorAll('.listItem') || [])
        });

        this.searchField?.setValue(this.searchFilter.getValue());
        this.searchFilter.on('value', value => this.searchField?.setValue(value));
    }

    // #endregion

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getFiltersWrapper() {
        return this.list?.querySelector('.list__filtersMenu');
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    render() {
        const searchAttr = attrString({
            'has-mini-search': this.getProperty('has-mini-search'),
            placeholder: this.list?.getProperty('search-placeholder'),
            value: this.searchFilter?.getValue()
        });
        this.innerHTML = processTemplate(
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
            formId: `${this.list?.getId()}-list-search-form`
        };
    }

    // #endregion
    /**
     * Called when the form is submitted.
     * @type {import('@arpadroid/forms').FormSubmitType}
     */
    _onSubmit() {
        this._onSearch();
        const searchValue = this.searchField?.getValue() || '';
        if (typeof this._config.onSubmit === 'function') {
            this._config.onSubmit(String(searchValue));
        }
        return true;
    }

    async _onSearch() {
        if (this.searchFilter) {
            const searchValue = this.searchField?.getValue() || '';
            this.searchFilter.setValue(searchValue);
            if (this.router) {
                const url = editURL(this.router.getRoute(), {
                    [this.list?.getParamName('search') || 'search']: searchValue,
                    [this.list?.getParamName('page') || 'page']: 1
                });
                await this.router.go(url);
            }

            this.list?.fetchPromise && (await this.list.fetchPromise);
            setTimeout(() => this.search?.doSearch(), 10);
        }
    }
}
defineCustomElement('list-search', ListSearch);

export default ListSearch;
