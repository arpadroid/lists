/**
 * @typedef {import('./tagItem/tagItem.js').TagItemConfigType} TagItemConfigType
 */
import { mergeObjects } from '@arpadroid/tools';
import List from '../../list/list.js';
import TagItem from './tagItem/tagItem.js';

const html = String.raw;
class TagList extends List {
    /** @type {(item: TagItemConfigType) => Promise<void>} */ // @ts-ignore
    addItem = this.addItem;
    /** @type {(items: TagItemConfigType[]) => Promise<void>} */ // @ts-ignore
    setItems = this.setItems;
    /** @type {(item: TagItemConfigType) => Promise<void>} */ // @ts-ignore
    removeItem = this.removeItem;
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            className: 'tagList',
            renderMode: 'minimal',
            hasResource: false,
            itemComponent: TagItem,
            itemTag: 'tag-item',
            noItemsContent: html`<i18n-text key="components.tagList.txtNoTags"></i18n-text>`
        });
    }
}

customElements.define('tag-list', TagList);

export default TagList;
