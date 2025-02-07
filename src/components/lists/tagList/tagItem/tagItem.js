/** @typedef {import('./tagItem.types').TagItemConfigType} TagItemConfigType */

import { render, renderNode, appendNodes, processTemplate } from '@arpadroid/tools';
import ListItem from '../../../listItem/listItem.js';

const html = String.raw;
class TagItem extends ListItem {
    /** @type {TagItemConfigType} */ // @ts-ignore
    _config = this._config;
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
            tooltipPosition: 'top'
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
        const text = this.getProperty('text') || this.getProperty('label');
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
        return html`<button
            is="icon-button"
            class="tag__delete iconButton--mini"
            label="Delete"
            icon="delete"
            tooltip-position="left"
        ></button>`;
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
     */
    _onDelete(event) {
        const { onDelete } = this._config;
        if (typeof onDelete === 'function') {
            onDelete(this, event);
        }
    }
}

customElements.define('tag-item', TagItem);

export default TagItem;
