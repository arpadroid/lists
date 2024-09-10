/**
 * @typedef {import('../list-item/listItemInterface.d.ts').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
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
    _bindings = ['renderSelectValue', 'onSelectChange', 'onRouteChanged', 'onSortClick'];

    getDefaultConfig() {
        this.i18nKey = 'modules.list.listSort';
        return {
            lblNoSelection: I18n.getText('modules.list.listSort.lblNoSelection'),
            lblSortAsc: I18n.getText('modules.list.listSort.lblSortAsc'),
            lblSortDesc: I18n.getText('modules.list.listSort.lblSortDesc'),
            iconAsc: 'keyboard_double_arrow_up',
            iconDesc: 'keyboard_double_arrow_down',
            iconSort: 'sort'
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
        this.update();
    }

    update() {
        this.sortButton?.setAttribute('label', this.getSortDirTooltip());
        this.sortButton?.setAttribute('icon', this.getSortDirIcon());
    }

    ////////////////////
    // #region RENDERING
    ////////////////////

    async render() {
        this.innerHTML = await this.renderSelect();
        this.selectField = this.querySelector('select-combo');
        await customElements.whenDefined('select-combo');
        this.selectField.onRendered(() => {
            const options = this.list.getSortOptions();
            this.selectField?.optionsNode?.setAttribute('slot', 'sort-options');
            this.configureSelect(this.selectField, options);
        });
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
        button.addEventListener('click', this.onSortClick);
        return button;
    }

    onSortClick() {
        const value = this.sortDirFilter.getValue();
        const newValue = value === 'asc' ? 'desc' : 'asc';
        const newURL = editURL(Context.Router.getRoute(), {
            [this.list.getParamName('sortDir')]: newValue
        });
        window.history.pushState({}, '', newURL);
        this.listResource.fetch();
        // Context.Router.go(newURL);
    }

    async renderSelect() {
        return html`<select-combo id="sortBy" class="sortByField" icon-right="none"></select-combo>`;
    }

    configureSelect(field, options, value = this.sortFilter?.getValue() || this.list?.getSortDefault(), config = {}) {
        field.listen('onChange', this.onSelectChange);
        field.addConfig({
            icon: this.getProperty('sort-icon'),
            renderValue: this.renderSelectValue,
            ...config
        });
        options && field.setOptions(options);
        this.sortButton = this.renderSortButton();
        field.inputMask.addRhs('sortButton', this.sortButton);
        field.setValue(value);
    }

    renderSelectValue(option) {
        const icon = option?.getAttribute('icon') || this.getProperty('iconSort');
        const optionContent = option?.querySelector('.fieldOption__content')?.innerText || option?.innerText;
        const optionLabel = option?.getProperty('label') || optionContent || this.i18n('lblNoSelection');
        return html`
            <arpa-icon>${icon}</arpa-icon>
            ${this.i18n('lblSortBy')}
            <span className="selectComboInput__title"> ${optionLabel} </span>
        `;
    }

    getTemplateVars() {
        return {};
    }

    // #endregion

    onSelectChange(value) {
        this.sortFilter.setValue(value);
        const newURL = editURL(Context.Router.getRoute(), {
            [this.list.getParamName('sortBy')]: value,
            [this.list.getParamName('page')]: 1
        });
        window.history.pushState({}, '', newURL);
        this.listResource.fetch();
        // Context.Router.go(newURL);
    }
}

customElements.define('list-sort', ListSort);

export default ListSort;
