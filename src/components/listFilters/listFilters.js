/* eslint-disable sonarjs/no-duplicate-string */
/**
 * @typedef {import('@arpadroid/resources/src').ListResource} ListResource
 * @typedef {import('@arpadroid/resources/src').ListFilter} ListFilter
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').Field} Field
 * @typedef {import('../list/list.js').default} List
 */
import { ListFilter } from '@arpadroid/resources/src';
import { mergeObjects, attrString, mapHTML, editURL } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';
import { Context } from '@arpadroid/application';

const html = String.raw;
class ListFilters extends ArpaElement {
    _bindings = ['onSubmit'];
    // #region INITIALIZATION
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'filter_list',
            perPageOptions: [5, 10, 25, 50, 100, 200],
            btnLabel: 'Filters'
        });
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        this.listResource?.listen('PAYLOAD', () => this.update());
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
        this.menuNode = this.querySelector('icon-menu');
        this._hasRendered = true;
        await customElements.whenDefined('icon-menu');
        await this.menuNode.promise;
        const itemsNode = this.menuNode?.navigation?.itemsNode;
        itemsNode?.setAttribute('slot', 'list-filters');
        /** @type {FormComponent} */
        this.form = this.querySelector('.listFilters__form');
        this.form?.onSubmit(this.onSubmit);
        /** @type {Field} */
        this.pageField = this.form.getField('page');

        /** @type {Field} */
        this.perPageField = this.form.getField('perPage');
        this.perPageField.listen('onChange', (value, field, event) => this.form.submitForm(event));
    }

    /**
     * Renders the form for the list filters.
     * @param {ListFilter} pageFilter
     * @param {ListFilter} perPageFilter
     * @returns {string} The form HTML.
     */
    renderForm(pageFilter = this.pageFilter, perPageFilter = this.perPageFilter) {
        /** @type {ListFilter} */
        const perPageOptions = this.getArrayProperty('per-page-options');
        const page = pageFilter?.getValue();
        const perPage = perPageFilter?.getValue();
        return html`<form
            id="${this.list.getId()}-filters-form"
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
                <select-combo id="perPage" label="Per page" value="${perPage ?? ''}" variant="small">
                    ${mapHTML(
                        perPageOptions,
                        value => html`<select-option label="${value}" value="${value}"></select-option>`
                    )}
                </select-combo>
                <number-field
                    icon=""
                    id="page"
                    label="Page"
                    ${attrString({ min: 1, max: this.listResource?.getTotalPages()})}
                    value="${page}"
                    variant="small"
                ></number-field>
            </group-field>
        </form>`;
    }

    /**
     * Updates the list filters.
     * @param {ListResource} listResource
     */
    async update(listResource = this.listResource) {
        await this.promise;
        this.pageField?.setValue(listResource?.getPage());
        this.pageField?.setMax(listResource?.getTotalPages());
        this.perPageField?.setValue(listResource?.getPerPage());
    }

    onSubmit(payload) {
        const newURL = editURL(window.location.href, {
            [this.list.getParamName('page')]: payload.page,
            [this.list.getParamName('perPage')]: payload.perPage
        });
        Context.Router.go(newURL);
    }

    // #endregion

    // #region ACCESSORS

    // #endregion
}

customElements.define('list-filters', ListFilters);

export default ListFilters;
