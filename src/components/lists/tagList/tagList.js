/**
 * @typedef {import('./tagItem/tagItem.js').TagItemConfigType} TagItemConfigType
 * @typedef {import('../../list/list.types').ListConfigType} ListConfigType
 * @typedef {import('./tagList.types.js').TagListConfigType} TagListConfigType
 */
import { defineCustomElement, dummyListener, dummySignal, mergeObjects, observerMixin } from '@arpadroid/tools';
import List from '../../list/list.js';
import TagItem from './tagItem/tagItem.js';

const html = String.raw;
class TagList extends List {
    /** @type {TagListConfigType} */ // @ts-ignore
    _config = this._config;

    /**
     * Creates an instance of TagList.
     * @param {TagListConfigType} config
     */
    constructor(config) {
        super(config);
        this.signal = dummySignal;
        this.on = dummyListener;
        observerMixin(this);
    }

    /**
     * Returns the defaultConfig.
     * @returns {TagListConfigType}
     */
    getDefaultConfig() {
        /** @type {TagListConfigType} */
        const config = mergeObjects(super.getDefaultConfig(), {
            className: 'tagList',
            renderMode: 'minimal',
            hasResource: false,
            itemComponent: TagItem,
            itemTag: 'tag-item',
            noItemsContent: html`<i18n-text key="components.tagList.txtNoTags"></i18n-text>`,
            attributes: {
                role: 'list'
            }
        });
        if (typeof config.onDelete === 'function') {
            this.on('delete_tag', config.onDelete);
        }
        return config;
    }

    /**
     * Sends a signal when a tag is deleted.
     * @param {TagItem} tag
     */
    onDeleteTag(tag) {
        this.signal('delete_tag', tag);
    }

    /** @type {(item: TagItemConfigType) => Promise<void>} */ // @ts-ignore
    addItem = this.addItem;
    /** @type {(items: TagItemConfigType[]) => Promise<void>} */ // @ts-ignore
    setItems = this.setItems;
    /** @type {(item: TagItemConfigType) => Promise<void>} */ // @ts-ignore
    removeItem = this.removeItem;
}

defineCustomElement('tag-list', TagList);

export default TagList;
