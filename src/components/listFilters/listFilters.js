/**
 * @typedef {import('@arpadroid/resources/src').ListResource} ListResource
 * @typedef {import('../list/list.js').default} List
 */
import { mergeObjects, attrString } from '@arpadroid/tools';
import { ArpaElement } from '@arpadroid/ui';

const html = String.raw;
class ListFilters extends ArpaElement {
    // #region INITIALIZATION
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'filter_list'
        });
    }
    async render() {
        const props = this.getProperties('icon', 'label');
        this.innerHTML = html`<icon-menu ${attrString(props)}></icon-menu>`;
        this.menuNode = this.querySelector('icon-menu');
        await customElements.whenDefined('icon-menu');
        await this.menuNode.promise;
        const itemsNode = this.menuNode?.navigation?.itemsNode;
        itemsNode?.setAttribute('slot', 'list-filters');
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        return true;
    }

    // #endregion

    // #region ACCESSORS

    // #endregion
}

customElements.define('list-filters', ListFilters);

export default ListFilters;
