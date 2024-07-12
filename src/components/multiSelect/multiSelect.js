/**
 * @typedef {import('@arpadroid/forms').SelectCombo} SelectCombo
 * @typedef {import('@arpadroid/forms').FormComponent} FormComponent
 * @typedef {import('@arpadroid/lists').ListResource} ListResource
 * @typedef {import('@arpadroid/navigation').IconMenu} IconMenu
 */
import { ArpaElement } from '@arpadroid/ui';
import { attrString } from '@arpadroid/tools';

const html = String.raw;
class MultiSelect extends ArpaElement {
    // #region INITIALIZATION

    getDefaultConfig() {
        this.i18nKey = 'modules.list.multiSelect';
        this.list = this.closest('.arpaList');
        this.listResource = this.list?.listResource;
        return super.getDefaultConfig({
            className: 'listMultiSelect',
            icon: 'check_box_outline_blank',
            actions: this.list._config.actions,
            tooltip: this.getText('txtSelections')
        });
    }

    initializeProperties() {
        super.initializeProperties();
        this.listResource.listen('SELECTION_CHANGE', () => this.update());
    }

    // #endregion

    // #region GETTERS

    getIcon() {
        return this.listResource?.hasSelections() ? 'check_box' : 'check_box_outline_blank';
    }

    getTooltip() {
        const count = this?.listResource?.getSelectedCount();
        return count ? this.i18n('txtItemsSelected', { count }) : this.i18n('txtNoItemsSelected');
    }

    // #endregion

    // #region RENDERING

    async render() {
        const menuProps = this.getProperties('icon', 'tooltip');
        const formId = this.list.id + '-form';
        this.innerHTML = html`
            <icon-menu class="listMultiSelect__nav" close-on-click="false" ${attrString(menuProps)}>
                <slot name="menu-tooltip"> ${this.i18n('txtNoItemsSelected')} </slot>
                <form id="${formId}" class="listMultiSelect__form" is="arpa-form" variant="compact" has-submit-button="false">
                    <slot name="title"> ${this.i18n('txtBatchOperations')} </slot>
                    <slot name="messages">
                        <info-message class="listMultiSelect__infoMessage"> ${this.i18n('txtNoItemsSelected')} </info-message>
                    </slot>
                    <checkbox-field id="toggleAll" value="select-all" icon="select_all">
                        <slot name="checkbox-label"> ${this.i18n('txtSelectAll')} </slot>
                    </checkbox-field>
                    <checkbox-field id="selectFilter" icon="filter_alt">
                        <slot name="checkbox-label"> ${this.i18n('txtShowSelectedOnly')} </slot>
                    </checkbox-field>
                    <select-combo
                        id="actions"
                        placeholder="${this.getText('txtSelectAction')}"
                        icon="layers"
                        option-component="batch-operation"
                    ></select-combo>
                </form>
            </icon-menu>
        `;
    }

    // #endregion

    // #region LIFECYCLE

    async _onConnected() {
        await customElements.whenDefined('arpa-form', 'icon-menu');
        /** @type {FormComponent} */
        this.form = this.querySelector('.listMultiSelect__form');
        this.messageResource = this.form.messages?.resource;
        /** @type {IconMenu} */
        this.menu = this.querySelector('.listMultiSelect__nav');
        this._initializeActions();
        this._initializeToggle();
        this._initializeSelectionFilter();
    }

    async _onComplete() {
        this.infoMessage = this.querySelector('.listMultiSelect__infoMessage');
    }

    _initializeSelectionFilter() {
        this.selectedFilterField = this.form.getField('selectFilter');
        this.selectedFilterField?.listen('onChange', checked => {
            if (checked) {
                this.listResource?.filterBySelections();
            } else {
                this.listResource?.fetch();
            }
        });
    }

    _initializeToggle() {
        this.toggleAllField = this.form.getField('toggleAll');
        this.toggleAllField?.listen('onChange', checked => this.listResource.setSelections(checked));
    }

    async _initializeActions() {
        /** @type {SelectCombo} */
        this.actionsField = this.form.getField('actions');
        await this.actionsField.onReady();
        this.actionsField.optionsNode.setAttribute('slot', 'batch-operations');
        // eslint-disable-next-line no-unused-vars
        this.actionsField.listen('onChange', async (value, field, event) => {
            const option = this.actionsField.getSelectedOption();
            if (typeof option.action === 'function') {
                // option.action(this.listResource.getSelectedItems(), this.renderItemList());
            }
            // this.actionsField.removeSelectedOption();
            // event.stopImmediatePropagation();
        });
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
        this.menu.setTooltip(this.getTooltip());
        this.menu.setIcon(this.getIcon());
    }

    updateClassNames() {
        if (this.listResource?.hasSelections()) {
            this.classList.add('listMultiSelect--active');
        } else {
            this.classList.remove('listMultiSelect--active');
        }
    }

    updateDisabledState() {
        const items = this.listResource.getSelectedItems();
        if (items.length) {
            this.selectedFilterField.enable();
            this.actionsField.enable();
        } else {
            this.selectedFilterField.disable();
            this.actionsField.disable();
        }
    }

    updateMessage() {
        // this.messageResource.deleteMessages();
        // this.messageResource.info(this.getTooltip());
        if (this.infoMessage) {
            this.infoMessage.innerHTML = this.getTooltip();
        }
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

    //     const items = this.listResource.getSelectedItems();
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
}

customElements.define('list-multi-select', MultiSelect);

export default MultiSelect;
