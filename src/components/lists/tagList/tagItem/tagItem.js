/** @typedef {import('./tagInterface').TagInterface} TagInterface */

import { render, renderNode, appendNodes } from '@arpadroid/tools';
import { I18nTool } from '@arpadroid/i18n';
import ListItem from '../../../listItem/listItem.js';

const html = String.raw;
class TagItem extends ListItem {
    /**
     * Returns the defaultConfig.
     * @returns {TagInterface}
     */
    getDefaultConfig() {
        this._onDelete = this._onDelete.bind(this);
        return {
            className: 'tagItem',
            tooltip: '',
            tooltipPosition: 'top',
            template: html`
                <arpa-icon size="mini">{icon}</arpa-icon>
                <div class="tag__text">{text}</div>
                <arpa-tooltip>{tooltip}</arpa-tooltip>
            `
        };
    }

    render() {
        const tooltip = this.getProperty('tooltip');
        const tooltipPosition = this.getProperty('tooltip-position');
        const text = this.getProperty('text') || this.getProperty('label');
        const template = html`
            <arpa-icon>{icon}</arpa-icon>
            <div class="tag__text">${text}</div>
            ${render(tooltip, html`<arpa-tooltip position="${tooltipPosition}">${tooltip}</arpa-tooltip>`)}
        `;
        const content = I18nTool.processTemplate(template, this.getTemplateVars());
        this.innerHTML = content;
        this.initializeDeleteButton();
        this.textNode = this.querySelector('.tag__text');
        appendNodes(this.textNode, this._childNodes);
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

    getValue() {
        return this.getProperty('value') ?? this.getText();
    }

    getText() {
        return this.getProperty('text') ?? this.textNode?.textContent ?? '';
    }

    hasOnDelete() {
        return this.hasAttribute('has-delete') || typeof this._config.onDelete === 'function';
    }

    initializeDeleteButton() {
        if (this.hasOnDelete()) {
            this.deleteButton = renderNode(this.renderDeleteButton());
            this.appendChild(this.deleteButton);
            this.deleteButton.removeEventListener('click', this._onDelete);
            this.deleteButton.addEventListener('click', this._onDelete);
        }
    }

    getPayload() {
        return {
            id: this.getId(),
            value: this.getValue(),
            text: this.getProperty('text')
        };
    }

    getId() {
        return this.getProperty('id');
    }

    _onDelete() {
        const { onDelete } = this._config;
        if (typeof onDelete === 'function') {
            onDelete(this);
        }
    }
}

customElements.define('tag-item', TagItem);

export default TagItem;
