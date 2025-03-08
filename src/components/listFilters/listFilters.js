/* eslint-disable sonarjs/no-duplicate-string */
/**
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').Field} Field
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').NumberField} NumberField
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('./listFilters.types').ListFiltersConfigType} ListFiltersConfigType
 * @typedef {import('./listFilters.types').ListFiltersSubmitPayloadType} ListFiltersSubmitPayloadType
 * @typedef {import('@arpadroid/forms').FormSubmitType} FormSubmitType
 */
import { mergeObjects, attrString, mapHTML, editURL, defineCustomElement } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';

const html = String.raw;
class ListFilters extends ArpaElement {
    /** @type {ListFiltersConfigType} */
    _config = this._config;
    // #region INITIALIZATION
    getDefaultConfig() {
        this.bind('onSubmit');
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'filter_alt',
            perPageOptions: [5, 10, 25, 50, 100, 200],
            btnLabel: 'Filters'
        });
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List | null} */
        this.list = this.closest('.arpaList, .gallery');
        /** @type {Router} */
        this.router = this.list?.getRouter();
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this.listResource?.on('payload', () => this._hasRendered && this.update());
        /** @type {ListFilter} */
        this.pageFilter = this.listResource?.pageFilter;
        /** @type {ListFilter} */
        this.perPageFilter = this.listResource?.perPageFilter;
        return true;
    }

    getPerPage() {
        this.list?.getArrayProperty('per-page-options') || this.getArrayProperty('per-page-options');
    }

    async render() {
        const props = {
            ...this.getProperties('icon', 'label'),
            tooltip: this.getProperty('btn-label')
        };
        this.innerHTML = html`<icon-menu ${attrString(props)} nav-class="listFilters__nav">
            <div class="listFilters__content">${this.renderForm()}</div>
        </icon-menu>`;
        /** @type {IconMenu | null} */
        this.menuNode = this.querySelector('icon-menu');
        this._hasRendered = true;
        this._initializeForm();
        this._initializeIconMenu();
    }

    async _initializeIconMenu() {
        await customElements.whenDefined('icon-menu');
        await this.menuNode?.promise;
        const itemsNode = /** @type {HTMLElement | null} */ (this.menuNode?.navigation?.itemsNode);
        itemsNode?.setAttribute('zone', 'list-filters');
    }

    async _initializeForm() {
        /** @type {FormComponent | null} */
        this.form = this.querySelector('.listFilters__form');
        await this.form?.promise;
        this.form?.onSubmit(this.onSubmit);
        await customElements.whenDefined('arpa-form');
        this.pageField = /** @type {NumberField} */ (this.form?.getField('page'));
        this.perPageField = /** @type {SelectCombo} */ (this.form?.getField('perPage'));
        this.perPageField?.on(
            'change',
            (/** @type {unknown} */ value, /** @type {Field} */ field, /** @type {Event} */ event) =>
                this.form?.submitForm(event)
        );
    }

    /**
     * Renders the form for the list filters.
     * @param {ListFilter} [pageFilter]
     * @param {ListFilter} [perPageFilter]
     * @returns {string} The form HTML.
     */
    renderForm(pageFilter = this.pageFilter, perPageFilter = this.perPageFilter) {
        const opt = this.getArrayProperty('per-page-options');
        /** @type {number[]} */
        const perPageOptions = Array.isArray(opt) ? opt : [];
        const page = pageFilter?.getValue();
        const perPage = perPageFilter?.getValue();
        return html`<form
            variant="compact"
            id="${this.list?.getId()}-filters-form"
            has-submit="false"
            is="arpa-form"
            class="listFilters__form"
        >
            <group-field
                class="listFilters__pagination"
                icon="auto_stories"
                id="pagination-filters"
                label="Pagination"
                open
            >
                <select-combo id="perPage" label="Per page" value="${perPage || ''}" variant="small">
                    ${mapHTML(
                        perPageOptions,
                        (/** @type {number}*/ value) =>
                            html`<select-option label="${value}" value="${value}"></select-option>`
                    )}
                </select-combo>
                <number-field
                    icon=""
                    id="page"
                    label="Page"
                    ${attrString({ min: 1, max: this.listResource?.getTotalPages() })}
                    value="${page}"
                    variant="small"
                ></number-field>
            </group-field>
        </form>`;
    }

    /**
     * Updates the list filters.
     * @param {ListResource} [listResource]
     */
    async update(listResource = this.listResource) {
        await this.promise;
        this.pageField?.setValue(listResource?.getPage());
        this.pageField?.setMax(listResource?.getTotalPages() || 1);
        const perPage = listResource?.getPerPage();
        perPage && this.perPageField?.setValue(perPage?.toString());
    }

    /**
     * Called when the form is submitted.
     * @type {import('@arpadroid/forms').FormSubmitType}
     */
    onSubmit(payload = {}) {
        if (payload.perPage != this.perPageFilter?.getValue()) {
            payload.page = 1;
            this.pageField?.setValue(1);
        }
        if (this.router) {
            const newURL = editURL(window.location.href, {
                [this.list?.getParamName('page') || 'page']: payload.page,
                [this.list?.getParamName('perPage') || 'perPage']: payload.perPage
            });
            this.router?.go(newURL);
        }
        return false;
    }

    // #endregion
}

defineCustomElement('list-filters', ListFilters);

export default ListFilters;
