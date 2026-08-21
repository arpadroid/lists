/**
 * @typedef {import('@arpadroid/ui').IconButton} IconButton
 * @typedef {import('./tagItem.types').TagItemConfigType} TagItemConfigType
 * @typedef {import('../tagList.js').default} TagList
 */

import { defineCustomElement, mergeObjects, listen } from '@arpadroid/tools';
import ListItem from '../../../listItem/listItem.js';

const html = String.raw;
class TagItem extends ListItem {
    /** @type {TagItemConfigType} */
    _config = this._config;
    /** @type {TagList} */
    list = this.list;
    /**
     * Returns the defaultConfig.
     * @returns {TagItemConfigType}
     */
    getDefaultConfig() {
        this._onDelete = this._onDelete.bind(this);
        /** @type {TagItemConfigType} */
        const config = {
            classNames: ['tagItem', 'tag'],
            attributeList: ['value'],
            listSelector: 'tag-list',
            tooltipPosition: 'top',
            attributes: {
                role: 'listitem'
            }
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    getValue() {
        return this.getProp('value') ?? this.getText();
    }

    getText() {
        return this.getProp('text') ?? this.nodes.text?.textContent ?? '';
    }

    hasOnDelete() {
        return this.hasAttribute('has-delete') || typeof this._config.onDelete === 'function';
    }

    $renderTemplate() {
        return html`
            <arpa-icon>{icon}</arpa-icon>
            <arpa-node name="text" class="tag__text" is-content></arpa-node>
            <arpa-node name="tooltip" tag="arpa-tooltip" position="{tooltipPosition}"></arpa-node>
            <arpa-node
                name="deleteButton"
                tag="icon-button"
                class="tag__delete iconButton--mini"
                label="Delete tag"
                aria-label="Delete tag"
                icon="delete"
                tooltip-position="left"
                can-render="hasOnDelete()"
            ></arpa-node>
        `;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.initializeDeleteButton();
        return true;
    }

    initializeDeleteButton() {
        if (this.hasOnDelete()) {
            const deleteBtnComponent = /** @type {IconButton | undefined} */ (this.nodes.deleteButton);
            deleteBtnComponent?.promise.then(() => {
                listen(deleteBtnComponent, 'click', this._onDelete);
            });
        }
    }

    /**
     * Calls the onDelete function from the config.
     * @param {Event} event
     * @returns {Promise<boolean| undefined>}
     */
    async _onDelete(event) {
        const { onDelete } = this._config;
        /** @type {boolean | Promise<boolean>} */
        let rv = true;
        typeof onDelete === 'function' && (rv = onDelete(this, event));
        rv instanceof Promise && (await rv);
        rv !== false && this.remove();
        this.list?.onDeleteTag(this);
        return rv;
    }
}

defineCustomElement('tag-item', TagItem);

export default TagItem;
