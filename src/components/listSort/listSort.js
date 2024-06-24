/**
 * @typedef {import('../list-item/listItemInterface.d.ts').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('@arpadroid/application/src/resources/listResource/listResource.js').default} ListResource
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../../../form/components/fields/searchField/searchField.js').default} SearchField
 * @typedef {import('../../../form/components/fields/selectCombo/selectCombo.js').default} SelectCombo
 * @typedef {import('@arpadroid/application/src/resources/listResource/listFilter').default} ListFilter
 */

import { editURL, renderNode } from '@arpadroid/tools';
import { Context } from '@arpadroid/application';
import { ArpaElement } from '@arpadroid/ui';
import { I18n } from '@arpadroid/i18n';
const html = String.raw;
class ListSort extends ArpaElement {
    //////////////////////////
    // #region INITIALIZATION
    //////////////////////////
    _bindings = ['renderSelectValue', 'onSelectChange', 'onRouteChanged'];

    getDefaultConfig() {
        return {
            lblNoSelection: I18n.getText('modules.list.listSort.lblNoSelection'),
            lblSortAsc: I18n.getText('modules.list.listSort.lblSortAsc'),
            lblSortDesc: I18n.getText('modules.list.listSort.lblSortDesc'),
            iconAsc: 'keyboard_double_arrow_up',
            iconDesc: 'keyboard_double_arrow_down'
        };
    }

    _initialize() {}

    _onConnected() {
        Context.Router.listen('ROUTE_CHANGED', this.onRouteChanged);
    }

    async initializeProperties() {
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        /** @type {ListFilter} sortDirFilter */
        this.sortDirFilter = this.listResource?.getSortDirFilter();
        this.sortFilter = this.listResource?.getSortFilter();
        return true;
    }

    async onReady() {
        return await customElements.whenDefined('arpa-form');
    }

    // #endregion

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getFiltersWrapper() {
        return this.listComponent?.node?.querySelector('.list__filtersMenu');
    }

    getSortDirIcon() {
        const value = this.listResource.getSortDirection();
        return value === 'asc' ? this.getProperty('icon-desc') : this.getProperty('icon-asc');
    }

    getSortDirTooltip() {
        const value = this.listResource.getSortDirection();
        const prop = value === 'asc' ? 'lbl-sort-desc' : 'lbl-sort-asc';
        return this.getProperty(prop);
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////
    onRouteChanged() {
        if (this.sortButton) {
            this.sortButton.setAttribute('label', this.getSortDirTooltip());
            this.sortButton.setAttribute('icon', this.getSortDirIcon());
        }
    }

    ////////////////////
    // #region RENDERING
    ////////////////////

    render() {
        this.selectField = this.renderSelect();
        this.append(this.selectField);
    }

    renderSortButton() {
        const button = renderNode(
            html`<button
                class="sortDirButton iconButton"
                is="icon-button"
                icon="${this.getSortDirIcon()}"
                tooltip-position="left"
                variant="minimal"
                label="${this.getSortDirTooltip()}"
            ></button>`
        );
        button.addEventListener('click', () => {
            const value = this.sortDirFilter.getValue();
            const newValue = value === 'asc' ? 'desc' : 'asc';
            const newURL = editURL(Context.Router.getRoute(), {
                [this.sortDirFilter.getUrlName()]: newValue
            });
            Context.Router.go(newURL);
        });
        return button;
    }

    renderSelect() {
        if (this.list?.getSortOptions()?.length) {
            const value = this.sortFilter?.getValue();
            /** @type {SelectCombo} */
            const select = renderNode(
                html`<select-combo
                    value="${value}"
                    id="sortBy"
                    class="sortByField"
                    icon-right="none"
                ></select-combo>`
            );
            customElements.whenDefined('select-combo').then(async () => {
                this.configureSelect(select);
                select.listen('onChange', this.onSelectChange);
                await select.onReady();
                this.sortButton = this.renderSortButton();
                select.inputMask.addRhs('sortButton', this.sortButton);
                select;
            });
            return select;
        }
    }

    configureSelect(
        field,
        options = this.list?.getSortOptions(),
        value = this.sortFilter?.getValue() ?? this.list?.getSortDefault(),
        config = {}
    ) {
        field.addConfig({
            icon: this.getProperty('sort-icon'),
            renderValue: this.renderSelectValue,
            ...config
        });
        value && field.setValue(value);
        options && field.setOptions(options);
    }

    renderSelectValue(option) {
        const icon = option?.getAttribute('icon');
        return html`
            ${icon ? html`<arpa-icon>${icon}</arpa-icon>` : ''}
            <i18n-text className="selectComboInput__label" key="modules.list.listSort.lblSortBy"></i18n-text>
            <span className="selectComboInput__title">
                ${option?.getProperty('label') ?? this.getProperty('lbl-no-selection')}
            </span>
        `;
    }

    getTemplateVars() {
        return {};
    }

    // #endregion

    onSelectChange(value) {
        this.sortFilter.setValue(value);
        const newURL = editURL(Context.Router.getRoute(), {
            [this.sortFilter.getUrlName()]: value,
            [this.listResource.pageFilter.getUrlName()]: 1
        });
        Context.Router.go(newURL);
    }
}

customElements.define('list-sort', ListSort);

export default ListSort;
