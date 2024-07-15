/* eslint-disable indent */
/**
 * @typedef {import('./listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('../../resources/listResource/listResource.js').default} ListResource
 * @typedef {import('../../resources/listResource/listFilter.js').default} ListFilter
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../../../../components/tag/tagInterface.js').TagInterface} TagInterface
 */

import { ArpaElement } from '@arpadroid/ui';
import { render } from '@arpadroid/tools';

const html = String.raw;
class ListItem extends ArpaElement {
    // #region INITIALIZATION
    
    _bindings = ['_onImageLoaded', '_onImageError', 'setSelected'];

    constructor(config = {}, payload, map) {
        super(config);
        this.payload = payload;
        this.map = map;
    }

    /**
     * Gets the default config for the component.
     * @returns {ListItemInterface}
     */
    getDefaultConfig() {
        return super.getDefaultConfig({
            lazyLoad: false,
            selectedClass: 'listItem--selected',
            truncateContent: 0,
            wrapperComponent: 'div',
            rhsContent: '',
            role: 'listitem',
            imageConfig: {
                showPreloader: true
            }
        });
    }

    // #endregion

    // #region ACCESSORS

    getTagName() {
        return 'list-item';
    }

    removeItem() {
        if (this.listResource) {
            this.listResource.removeItem({ id: this.getId() });
        } else {
            this.remove();
        }
    }

    hasSelection() {
        return this.list?.hasMultiSelect() ?? this.getProperty('has-selection');
    }

    hasNav() {
        return Boolean(this._config.nav);
    }

    getContent() {
        return this._content || this._config?.content;
    }

    setContent(content) {
        if (!this.contentNode) {
            return;
        }
        if (typeof content === 'string') {
            this.contentNode.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentNode.innerHTML = '';
            this.contentNode.appendChild(content);
        }
    }

    getSelectedClass() {
        return this.getProperty('selected-class');
    }

    getId() {
        return this.payload?.id || this.getProperty('id');
    }

    getPayload() {
        return this.payload ?? this._config;
    }

    getTitle() {
        return this.getProperty('title');
    }

    getSubTitle() {
        return this.getProperty('sub-title');
    }

    getTitleLink() {
        const titleLink = this.getProperty('title-link');
        if (titleLink) {
            this.titleLink = titleLink;
            this.removeAttribute('title-link');
        }
        return this.titleLink;
    }

    getIcon() {
        return this.getProperty('icon');
    }

    getIconRight() {
        return this.getProperty('icon-right');
    }

    getImage() {
        return this.getProperty('image');
    }

    getImageAlt() {
        return this.getProperty('image-alt');
    }

    setAction(action) {
        if (typeof action !== 'function') {
            throw new Error('Action must be a function');
        }
        this._config.action = action;
    }

    setViewClass() {
        if (this.view) {
            this.classList.add('listItem--' + this.view);
            if (this.view === 'grid-compact') {
                this.classList.add('listItem--grid');
            }
        }
    }

    setSelected() {
        if (this.checkbox.checked) {
            this.listResource?.selectItem(this.getPayload());
            this.classList.add(this.getSelectedClass());
        } else {
            this.listResource.deselectItem(this.getPayload());
            this.classList.remove(this.getSelectedClass());
        }
    }

    // #endregion

    // #region RENDERING

    render() {
        const { role, action } = this._config;
        this.classList.add('listItem');
        role && this.setAttribute('role', role);
        this.link = this.getProperty('link');
        this.removeAttribute('link');
        const content = this.renderTemplate(this.getTemplate());
        this.innerHTML = content;
        this.button = this.querySelector('button.listItem__main');
        this.initializeNav();
        this.setViewClass();
        action && this.button?.addEventListener('click', event => action(event, this));
        // if (this.hasChildren()) {
        // this.childrenNode.classList.add('listItem__children');
        // this.itemWrapperNode = document.createElement('div');
        // this.itemWrapperNode.classList.add('listItem__itemWrapper');
        // this.itemWrapperNode.append(...this.node.childNodes);
        // this.node.appendChild(this.itemWrapperNode);
        // this.appendChildrenNode();
        // this.node.classList.add('listItem--hasChildren');
        // }
    }

    getTemplate() {
        const href = this.link ? `href="${this.link}"` : '';
        const wrapperComponent = href ? 'a' : this.getWrapperComponent();
        return html`
            <${wrapperComponent} ${href} class="listItem__main ${render(this.link, 'listItem__link')}">
                <arpa-icon class="listItem__icon">{icon}</arpa-icon>
                ${this.renderImage()}
                <div class="listItem__contentWrapper">
                    ${this.renderTitleContainer()} 
                    ${this.renderTags()} 
                    ${this.renderContent()}
                </div>
                <arpa-icon class="listItem__iconRight">{iconRight}</arpa-icon>
            </${wrapperComponent}>
            ${this.renderRhs()}
        `;
    }

    getTemplateVars() {
        return {
            icon: this.getProperty('icon'),
            iconRight: this.getProperty('icon-right'),
            titleIcon: this.getProperty('title-icon'),
            title: this.getTitle(),
            subTitle: this.getSubTitle()
        };
    }

    async initializeNav() {
        this.navNode = this.querySelector('.listItem__nav');
        if (this.navNode) {
            await customElements.whenDefined('icon-menu');
            this.navNode.setConfig(this._config.nav);
        }
    }

    renderTags() {
        const { tags } = this._config;
        if (!tags?.length) {
            return '';
        }
        return html`
            <tag-list id="item-${this.getId()}-tagList" variant="compact" class="listItem__tags">
                ${tags.map(tag => this.renderTag(tag))}
            </tag-list>
        `;
    }

    renderTag(tag) {
        return html`<tag-item class="listItem__tag" text="${tag.label}" icon="${tag.icon}"></tag-item>`;
    }

    getWrapperComponent() {
        const { action } = this._config;
        if (this.link) {
            return 'a';
        }
        if (typeof action === 'function') {
            return 'button';
        }
        return this.getProperty('wrapper-component');
    }

    renderRhs(content = this._config.rhsContent) {
        const nav = this.renderNav();
        const checkbox = this.renderCheckbox();
        return render(nav || checkbox || content, html`<div class="listItem__rhs">${checkbox}${nav}${content}</div>`);
    }

    renderCheckbox() {
        if (!this.hasSelection()) {
            return '';
        }
        const props = this.getProperties('id', 'is-selected');
        const { id = '', isSelected = this.listResource?.isSelected(this.getPayload()) } = props;
        const checkboxId = id?.toString() ?? id ?? '';
        const htmlId = `listItem__checkbox-${checkboxId}`;
        const checked = render(isSelected, 'checked');
        return html`
            <label class="listItem__checkboxContainer" for="${htmlId}">
                <input class="listItem__checkbox arpaCheckbox" type="checkbox" id="${htmlId}" ${checked} />
            </label>
        `;
    }

    renderTitleContainer(title = this.getTitle(), subTitle = this.getSubTitle()) {
        return render(
            title || subTitle,
            html`
                <div class="listItem__titleWrapper">
                    ${this.renderTitle()} ${render(subTitle, html`<span class="listItem__subTitle">${subTitle}</span>`)}
                </div>
            `
        );
    }

    renderTitle(title = this.getTitle()) {
        if (!title) {
            return '';
        }
        const titleLink = this.getTitleLink();
        const titleClass = 'listItem__title';
        return titleLink
            ? html` <a href="${titleLink}" class="${titleClass}">${this.renderTitleContent()}</a>`
            : html`<span class="${titleClass}">${this.renderTitleContent()}</span>`;
    }

    renderTitleContent() {
        return html`<arpa-icon>{titleIcon}</arpa-icon>{title}`;
    }

    renderImage(image = this.getImage(), alt = this.getImageAlt()) {
        return render(image, html`<arpa-image class="listItem__image" src="${image}" alt="${alt}"></arpa-image>`);
    }

    renderSubTitle() {
        const subTitle = this.getProperty('sub-title');
        return render(subTitle, html`<span class="listItem__subTitle">${subTitle}</span>`);
    }

    renderNav() {
        return this.hasNav() ? html`<icon-menu class="listItem__nav"></icon-menu>` : '';
    }

    renderContent() {
        const truncate = this.getProperty('truncate-content');
        const content = this.getContent();
        return render(
            content,
            html`
                <truncate-text max-length="${truncate}" class="listItem__content">
                    ${content}
                </truncate-text>
            `
        );
    }

    // #endregion

    // #region EVENTS

    /**
     * Called when the image has loaded.
     * @param {Event} event
     */
    _onImageLoaded(event) {
        const { onImageLoaded } = this._config;
        typeof onImageLoaded === 'function' && onImageLoaded(event, this);
    }

    /**
     * Called when the image has failed to load.
     * @param {Event} event
     */
    _onImageError(event) {
        const { onImageError } = this._config;
        typeof onImageError === 'function' && this._config?.onImageError(event, this);
    }

    // #endregion

    // #region LIFECYCLE

    async _onConnected() {
        this._initializeNodes();
        await this._initializeItem();
    }

    async _initializeNodes() {
        this.mainNode = this.querySelector('.listItem__main');
        this.checkbox = this.querySelector('.listItem__checkbox');
        this.imageNode = this.querySelector('.listItem__image');
        this.contentNode = this.querySelector('.listItem__content');
        await customElements.whenDefined('arpa-image');
        this.imageNode?.addConfig({
            onLoad: event => this._onImageLoaded(event),
            onError: event => this._onImageError(event)
        });
    }

    async _initializeItem() {
        if (this.checkbox && this.hasSelection()) {
            this.checkbox.removeEventListener('change', this.setSelected);
            this.checkbox.addEventListener('change', this.setSelected);
            this.setSelected();
        }
        const { action } = this._config;
        const doAction = event => action(event, this);
        if (this.mainNode && typeof action === 'function') {
            this.mainNode.removeEventListener('click', doAction);
            this.mainNode.addEventListener('click', doAction);
        }
    }

    initializeProperties() {
        super.initializeProperties();
        /** @type {List} */
        this.list = this.closest('.arpaList');
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        const selectedClass = this.getProperty('selected-class');
        this._initializeView();
        const id = this.getId();
        if (this.list?.hasMultiSelect()) {
            this.listResource.listen(`ITEM-SELECTED-${id}`, () => {
                this.checkbox.checked = true;
                this.classList.add(selectedClass);
            });
            this.listResource.listen(`ITEM-DESELECTED-${id}`, () => {
                this.checkbox.checked = false;
                this.classList.remove(selectedClass);
            });
        }
    }

    _initializeView() {
        /** @type {ListFilter} */
        this.viewsFilter = this.listResource?.filters?.views;
        this.view = this.viewsFilter?.getValue();
        this.viewsFilter?.listen('value', view => {
            this.view = view;
            this.node?.isConnected && this.reRender();
        });
    }

    _onRenderComplete() {
        super._onRenderComplete();
        if (this.isConnected) {
            const payload = { id: this.getId(), ...this.getPayload() };
            this.listResource?.registerItem(payload, this);
        }
    }
    // #endregion

    // #region ACTIONS

    /**
     * Deletes the list item.
     * @returns {Promise<void>}
     */
    delete() {
        return this.listResource ? this.listResource.removeItem(this._config) : this.remove();
    }

    // #endregion
}

customElements.define(ListItem.prototype.getTagName(), ListItem);

export default ListItem;
