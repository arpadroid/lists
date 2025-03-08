/* eslint-disable sonarjs/no-nested-template-literals */
/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').Field} Field
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('./listInfo.types').ListInfoConfigType} ListInfoConfigType
 */
import { ArpaElement } from '@arpadroid/ui';
import { mergeObjects, bind, renderNode, defineCustomElement } from '@arpadroid/tools';
const html = String.raw;
class ListInfo extends ArpaElement {
    /** @type {ListInfoConfigType} */
    _config = this._config;

    /**
     * Default component config.
     * @returns {ListInfoConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'lists.list';
        bind(this, 'reRender', 'updateText');
        /** @type {ListInfoConfigType} */
        const conf = {
            className: 'listInfo',
            hasPrevNext: true,
            hasRefresh: true
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List | null} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this.listResource?.on('items', this.updateText);
        /** @type {ListFilter} */
        this.searchFilter = this.listResource?.getSearchFilter();
        return true;
    }

    updateText() {
        this.textNode = this.querySelector('.listInfo__text');
        const infoText = this.renderInfoText();
        if (!infoText) return;
        const newNode = renderNode(infoText);
        this.textNode ? this.textNode.replaceWith(newNode) : this.prepend(newNode);
        this.textNode = newNode;
        const buttons = this.querySelectorAll('.listInfo__next, .listInfo__previous');
        buttons.forEach(button => {
            if ((this.listResource?.getTotalPages() || 0) <= 1) {
                button.setAttribute('disabled', 'disabled');
            } else {
                button.removeAttribute('disabled');
            }
        });
    }

    hasRefresh() {
        return this.getProperty('has-refresh');
    }

    hasPrevNext() {
        return this.getProperty('has-prev-next');
    }

    render() {
        if (!this.listResource) return;
        this.innerHTML = this.renderInfoText() + this.renderButtons();
        this.handleRefresh();
        this.handlePreviousPage();
        this.handleNextPage();
        this.textNode = this.querySelector('.listInfo__text');
    }

    renderInfoText() {
        const hasSearchResults = this.listResource?.hasResults();
        const query = /** @type {string} */ (this.searchFilter?.getValue() || '');
        if (this.listResource) {
            if (query?.length) {
                return !hasSearchResults ? this.renderNoResults() : this.renderSearchResults();
            }
            return this.renderResults();
        }
        return '';
    }

    handlePreviousPage() {
        this.previousBtn = this.querySelector('.listInfo__previous');
        this.previousBtn?.addEventListener('click', () => {
            this.listResource?.previousPage();
        });
    }

    handleNextPage() {
        this.nextBtn = this.querySelector('.listInfo__next');
        this.nextBtn?.addEventListener('click', () => this.listResource?.nextPage());
    }

    handleRefresh() {
        this.refreshBtn = this.querySelector('.listInfo__refresh');
        this.refreshBtn?.addEventListener('click', () => this.listResource?.refresh());
    }

    renderButtons() {
        return html`<div class="listInfo__buttons">${this.renderRefresh()}${this.renderPrevNext()}</div>`;
    }

    renderRefresh() {
        if (!this.hasRefresh()) return '';
        return html`<button class="listInfo__refresh" is="icon-button" icon="refresh">
            <zone name="tooltip-content">${this.i18n('txtRefresh')}</zone>
        </button>`;
    }

    renderPrevNext() {
        if (!this.hasPrevNext()) return '';
        return html`
            <button class="listInfo__previous" is="icon-button" icon="skip_previous">
                <zone name="tooltip-content">${this.i18n('txtPrevPage')}</zone>
            </button>
            <button class="listInfo__next" is="icon-button" icon="skip_next">
                <zone name="tooltip-content">${this.i18n('txtNextPage')}</zone>
            </button>
        `;
    }

    /**
     * Render the results text.
     * @param {number[]} range
     * @param {number} total
     * @returns {string}
     */
    renderResults(range = this.listResource?.getItemRange() ?? [], total = this.listResource?.getTotalItems()) {
        const { showResultsText } = this.list?.getConfig() ?? {};
        const [fistItem, lastItem] = range;
        if (!showResultsText || !range[0] || !range[1]) return '';
        return html`
            <i18n-text key="${this.i18nKey}.txtAllResults" class="listInfo__text">
                <i18n-replace name="resultCount"><strong>${total}</strong></i18n-replace>
                <i18n-replace name="pageCount"><strong>${fistItem} - ${lastItem}</strong></i18n-replace>
            </i18n-text>
        `;
    }

    /**
     * Renders the search results text.
     * @param {number} resultTotal
     * @param {string} query
     * @returns {string}
     */
    renderSearchResults(
        resultTotal = this.listResource?.getTotalItems(),
        query = String(this.searchFilter?.getValue() || '')
    ) {
        return html`
            <i18n-text key="${this.i18nKey}.txtSearchResults" class="listInfo__text">
                <i18n-replace name="resultCount"><strong>${resultTotal}</strong></i18n-replace>
                <i18n-replace name="result"><strong>${query}</strong></i18n-replace>
            </i18n-text>
        `;
    }

    /**
     * Renders the no results text.
     * @param {string} query
     * @returns {string}
     */
    renderNoResults(query = String(this.searchFilter?.getValue() || '')) {
        return html`
            <i18n-text key="${this.i18nKey}.txtNoResults" class="listInfo__text">
                <i18n-replace name="result"><strong>${query}</strong></i18n-replace>
            </i18n-text>
        `;
    }
}

defineCustomElement('list-info', ListInfo);

export default ListInfo;
