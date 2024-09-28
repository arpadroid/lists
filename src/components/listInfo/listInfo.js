/* eslint-disable sonarjs/no-nested-template-literals */
/**
 * @typedef {import('@arpadroid/resources/src').ListResource} ListResource
 * @typedef {import('@arpadroid/resources/src').ListFilter} ListFilter
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').Field} Field
 * @typedef {import('../list/list.js').default} List
 */
import { ArpaElement } from '@arpadroid/ui';
import { mergeObjects } from '@arpadroid/tools';
const html = String.raw;
class ListInfo extends ArpaElement {
    getDefaultConfig() {
        this.i18nKey = 'modules.list';
        return mergeObjects(super.getDefaultConfig(), {
            className: 'listInfo',
            hasPrevNext: true,
            hasRefresh: true,
            i18nAllResults: 'txtAllResults',
            i18nSearchResults: 'txtSearchResults',
            i18nNoResults: 'txtNoResults'
        });
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this.listResource?.on('payload', () => this.reRender());
        /** @type {ListFilter} */
        this.searchFilter = this.listResource?.searchFilter;
        return true;
    }

    hasRefresh() {
        return this.getProperty('has-refresh');
    }

    hasPrevNext() {
        return this.getProperty('has-prev-next');
    }

    render() {
        this.innerHTML = '';
        if (!this.listResource) {
            return;
        }
        const hasSearchResults = this.listResource?.hasResults();
        const query = this.searchFilter?.getValue();
        let _html = '';
        if (this.listResource) {
            if (query?.length) {
                _html += !hasSearchResults ? this.renderNoResults() : this.renderSearchResults();
            } else {
                _html += this.renderResults();
            }
        }
        this.innerHTML = _html + this.renderButtons();
        this.handleRefresh();
        this.handlePreviousPage();
        this.handleNextPage();
    }

    handlePreviousPage() {
        this.previousBtn = this.querySelector('.listInfo__previous');
        this.previousBtn?.addEventListener('click', () => {
            this.listResource?.previousPage();
        });
    }

    handleNextPage() {
        this.nextBtn = this.querySelector('.listInfo__next');
        this.nextBtn?.addEventListener('click', () => {
            this.listResource?.nextPage();
        });
    }

    handleRefresh() {
        this.refreshBtn = this.querySelector('.listInfo__refresh');
        this.refreshBtn?.addEventListener('click', () => {
            this.listResource?.refresh();
        });
    }

    renderButtons() {
        return html`
            <div class="listInfo__buttons">
                ${(this.hasRefresh() &&
                    html`<button class="listInfo__refresh" is="icon-button" icon="refresh"></button>`) ||
                ''}
                ${(this.hasPrevNext() &&
                    html`<button class="listInfo__previous" is="icon-button" icon="skip_previous"></button>
                        <button class="listInfo__next" is="icon-button" icon="skip_next"></button> `) ||
                ''}
            </div>
        `;
    }

    /**
     * Render the results text.
     * @param {number[]} range
     * @param {number} total
     * @returns {string}
     */
    renderResults(range = this.listResource?.getItemRange() ?? [], total = this.listResource?.getTotalItems()) {
        const { showResultsText } = this.list.getConfig();
        const [fistItem, lastItem] = range;
        const { i18nAllResults } = this._config;
        return showResultsText && range[0] && range[1]
            ? html`<i18n-text key="${this.i18nKey}.${i18nAllResults}">
                  <i18n-replace name="resultCount"><strong>${total}</strong></i18n-replace>
                  <i18n-replace name="pageCount"><strong>${fistItem} - ${lastItem}</strong></i18n-replace>
              </i18n-text>`
            : '';
    }

    /**
     * Renders the search results text.
     * @param {number} resultTotal
     * @param {string} query
     * @returns {string}
     */
    renderSearchResults(resultTotal = this.listResource?.getTotalItems(), query = this.searchFilter?.getValue()) {
        const { i18nSearchResults } = this._config;
        return html`<i18n-text key="${this.i18nKey}.${i18nSearchResults}">
            <i18n-replace name="resultCount"><strong>${resultTotal}</strong></i18n-replace>
            <i18n-replace name="result"><strong>${query}</strong></i18n-replace>
        </i18n-text>`;
    }

    /**
     * Renders the no results text.
     * @param {string} query
     * @returns {string}
     */
    renderNoResults(query = this.searchFilter?.getValue()) {
        const { i18nNoResults } = this._config;
        return html`<i18n-text key="${this.i18nKey}.${i18nNoResults}">
            <i18n-replace name="result"><strong>${query}</strong></i18n-replace>
        </i18n-text>`;
    }
}

customElements.define('list-info', ListInfo);

export default ListInfo;
