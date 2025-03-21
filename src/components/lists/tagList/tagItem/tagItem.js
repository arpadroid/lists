/**
 * @typedef {import('./tagItem.types').TagItemConfigType} TagItemConfigType
 * @typedef {import('../tagList.js').default} TagList
 */

import { render, renderNode, appendNodes, processTemplate, defineCustomElement } from '@arpadroid/tools';
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
        return {
            className: 'tagItem',
            listSelector: 'tag-list',
            tooltip: '',
            tooltipPosition: 'top',
            attributes: {
                role: 'listitem'
            }
        };
    }

    getId() {
        return this.getProperty('id');
    }

    getValue() {
        return this.getProperty('value') ?? this.getText();
    }

    getText() {
        return this.getProperty('text') ?? this.textNode?.textContent ?? '';
    }

    hasOnDelete() {
        return this.hasAttribute('has-delete') || typeof this._config.onDelete === 'function';
    }

    getPayload() {
        return {
            id: this.getId(),
            value: this.getValue(),
            text: this.getProperty('text')
        };
    }

    async render() {
        const tooltip = this.getProperty('tooltip');
        const tooltipPosition = this.getProperty('tooltip-position');
        const text = this.getProperty('text') || this.getProperty('label') || '';
        const template = html`
            <arpa-icon>{icon}</arpa-icon>
            <div class="tag__text">${text}</div>
            ${render(tooltip, html`<arpa-tooltip position="${tooltipPosition}">${tooltip}</arpa-tooltip>`)}
        `;
        const content = processTemplate(template, this.getTemplateVars());
        this.innerHTML = content;
        this.initializeDeleteButton();
        this.textNode = this.querySelector('.tag__text');
        this.textNode && appendNodes(this.textNode, this._childNodes);
        this.classList.add('tag');
        if (this._config.value) {
            this.setAttribute('value', this._config.value);
        }
    }

    renderDeleteButton() {
        return html`<icon-button
            class="tag__delete iconButton--mini"
            label="Delete tag"
            aria-label="Delete tag"
            icon="delete"
            tooltip-position="left"
        ></icon-button>`;
    }

    initializeDeleteButton() {
        if (this.hasOnDelete()) {
            this.deleteButton = renderNode(this.renderDeleteButton());
            this.appendChild(this.deleteButton);
            this.deleteButton.removeEventListener('click', this._onDelete);
            this.deleteButton.addEventListener('click', this._onDelete);
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
