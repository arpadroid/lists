/**
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/forms').Field} Field
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 * @typedef {import('../list/list.js').default} List
 */
import { ArpaElement } from '@arpadroid/ui';
import { attrString, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class MultiSelect extends ArpaElement {
    // #region INITIALIZATION

    _preInitialize() {
        this.i18nKey = 'lists.multiSelect';
        /** @type {List | null} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource | undefined} */
        this.resource = this.list?.listResource;
    }

    getDefaultConfig() {
        return super.getDefaultConfig({
            className: 'listMultiSelect',
            icon: 'check_box_outline_blank',
            actions: this.list?._config?.actions,
            tooltip: this.getText('txtNoItemsSelected')
        });
    }

    initializeProperties() {
        super.initializeProperties();
        this.resource?.on('selection_change', () => this.update());
        return true;
    }

    // #endregion

    // #region GETTERS

    getIcon() {
        return this.resource?.hasSelections() ? this.getSelectedIcon() : 'filter_none';
    }

    getSelectedIcon() {
        const count = Number(this.resource?.getSelectedCount());
        if (count > 9) return 'filter_9_plus';
        return 'filter_' + String(count);
    }

    getTooltip() {
        const count = String(this?.resource?.getSelectedCount() || '');
        return count ? this.i18n('txtItemsSelected', { count }) : this.i18n('txtNoItemsSelected');
    }

    getInfoNode() {
        if (this.infoNode?.isConnected) {
            return this.infoNode;
        }
        this.infoNode = this.querySelector('.listMultiSelect__infoMessage');
        return this.infoNode;
    }

    // #endregion

    // #region RENDERING

    _getTemplate() {
        const menuProps = this.getProperties('icon');
        const formId = this.list?.id + '-multiSelectForm';
        return html`<icon-menu
            class="listMultiSelect__nav"
            nav-class="listMultiSelect__combo"
            button-label="${this.i18nText('txtBatchOperations')}"
            ${attrString(menuProps)}
        >
            <zone name="tooltip-content"> ${this.getTooltip()} </zone>
            <arpa-form id="${formId}" class="listMultiSelect__form" variant="compact" has-submit="false">
                <zone name="form-title"> ${this.i18n('txtBatchOperations')} </zone>
                <zone name="messages">
                    <info-message id="info-message" class="listMultiSelect__infoMessage">
                        ${this.getTooltip()}
                    </info-message>
                </zone>
                <checkbox-field id="toggleAll" value="select-all" icon="select_all">
                    <zone name="checkbox-label"> ${this.i18n('txtSelectAll')} </zone>
                </checkbox-field>
                <checkbox-field id="selectFilter" icon="filter_alt">
                    <zone name="checkbox-label"> ${this.i18n('txtShowSelectedOnly')} </zone>
                </checkbox-field>
                <select-combo
                    id="actions"
                    placeholder="${this.getText('txtSelectAction')}"
                    icon="layers"
                    option-component="batch-operation"
                ></select-combo>
            </arpa-form>
        </icon-menu>`;
    }

    // #endregion

    // #region LIFECYCLE

    async _initializeNodes() {
        await super._initializeNodes();
        /** @type {FormComponent | null} */
        this.form = this.querySelector('.listMultiSelect__form');
        this.messages = this.querySelector('arpa-messages');
        /** @type {IconMenu | null} */
        this.menu = this.querySelector('.listMultiSelect__nav');
        this._initializeActions();
        this._initializeToggle();
        this._initializeSelectionFilter();
        return true;
    }

    _initializeSelectionFilter() {
        this.selectedFilterField = this.form?.getField('selectFilter');
        this.selectedFilterField?.on('change', (/** @type {boolean} */ checked) => {
            const action = checked ? 'filterBySelections' : 'fetch';
            this.resource?.[action]();
        });
    }

    _initializeToggle() {
        this.toggleAllField = this.form?.getField('toggleAll');
        this.toggleAllField?.on('change', (/** @type {boolean} */ checked) => this.resource?.setSelections(checked));
    }

    /**
     * Initializes the actions field.
     * @param {SelectCombo} [actionsField]
     * @returns {Promise<void>}
     */
    async _initializeActions(actionsField = /** @type {SelectCombo} */ (this.form?.getField('actions'))) {
        /** @type {SelectCombo | undefined} */
        this.actionsField = actionsField;
        await actionsField?.promise;
        actionsField?.optionsNode?.setAttribute('zone', 'batch-operations');
        actionsField?.on(
            'change',
            async (/** @type {unknown} */ value, /** @type {Field} */ field, /** @type {Event} */ event) => {
                const option = actionsField.getSelectedOption();
                const action = option?.getAction();
                if (typeof action === 'function') {
                    action(this.resource?.getSelectedItems(), this.renderItemList());
                }
                // this.actionsField.removeSelectedOption();
                event.stopImmediatePropagation();
            }
        );
    }

    // #endregion

    // #region UPDATE

    update() {
        this.updateMenu();
        this.updateDisabledState();
        this.updateClassNames();
        this.updateMessage();
    }

    updateMenu() {
        this.menu?.setTooltip(this.getTooltip());
        this.menu?.setIcon(this.getIcon());
    }

    updateClassNames() {
        const action = this.resource?.hasSelections() ? 'add' : 'remove';
        this.classList[action]('listMultiSelect--active');
    }

    updateDisabledState() {
        const items = this.resource?.getSelectedItems();
        const fn = items?.length ? 'enable' : 'disable';
        this.actionsField?.[fn]();
        this.selectedFilterField?.[fn]();
    }

    updateMessage() {
        const msg = this.form?.messages?.resource?.getById('info-message');
        msg?.node?.setContent(this.getTooltip());
    }

    // #endregion

    // renderItemsSelected() {
    //     const node = document.createElement('div');
    //     node.classList.add('listSelection__itemsSelected');
    //     node.textContent = this.getTooltip();
    //     return node;
    // }

    // renderItemList() {
    //     const wrapper = document.createElement('div');
    //     wrapper.classList.add('listSelection__itemList');
    //     const button = document.createElement('button');
    //     button.textContent = 'show items';
    //     button.type = 'button';
    //     button.classList.add('button--link');
    //     wrapper.appendChild(button);
    //     this.listNode = document.createElement('ol');
    //     this.listNode.style.display = 'none';
    //     wrapper.appendChild(this.listNode);

    //     const items = this.resource.getSelectedItems();
    //     items.forEach(item => {
    //         const node = document.createElement('li');
    //         node.innerText = item.title;
    //         this.listNode.appendChild(node);
    //     });

    //     button.addEventListener('click', () => {
    //         if (this.listNode.style.display === 'none') {
    //             this.listNode.style.display = '';
    //             button.textContent = 'hide items';
    //         } else {
    //             this.listNode.style.display = 'none';
    //             button.textContent = 'show items';
    //         }
    //     });

    //     return wrapper;
    // }

    renderItemList() {
        return '';
    }
}

defineCustomElement('list-multi-select', MultiSelect);

export default MultiSelect;
