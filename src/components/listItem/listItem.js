/**
 * @typedef {import('./listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/resources/src').ListResource} ListResource
 * @typedef {import('@arpadroid/resources/src').ListFilter} ListFilter
 */

import { ArpaElement } from '@arpadroid/ui';
import { render, classNames, attrString, getViewportWidth, getViewportHeight } from '@arpadroid/tools';

const html = String.raw;
class ListItem extends ArpaElement {
    /////////////////////
    // #region INIT
    /////////////////////

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
        this.bind('_onImageLoaded', '_onImageError', 'setSelected', '_onViewChange', '_onSelected', '_onDeselected', '_doAction');
        return super.getDefaultConfig({
            lazyLoad: false,
            selectedClass: 'listItem--selected',
            truncateContent: 0,
            wrapperComponent: 'div',
            rhsContent: '',
            role: 'listitem',
            listSelector: '.arpaList',
            lazyLoadImage: false,
            imageSize: undefined,
            imageSizes: {
                list_compact: { width: 40, height: 40 },
                list: { width: 80, height: 80 },
                grid_compact: { width: 180, height: 180 },
                grid: { width: 350, height: 350 },
                grid_large: { width: 480, height: 480 },
                thumbnail: { height: 110, width: 'auto' },
                thumbnail_vertical: { height: 'auto', width: 110 },
                // Calculate the full screen width and height inside a function to avoid layout thrashing.
                full_screen: () => ({ width: getViewportWidth(), height: getViewportHeight() })
            },
            imageConfig: {
                showPreloader: true
            }
        });
    }

    _initializeTemplate() {
        this.grabList();
        super._initializeTemplate(this.getTemplateNode());
    }

    initializeProperties() {
        super.initializeProperties();
        this.grabList();
        const id = this.getId();
        if (typeof this.list?.hasMultiSelect === 'function' && this.list?.hasMultiSelect()) {
            this.listResource.on(`item_selected_${id}`, this._onSelected, this._unsubscribes);
            this.listResource.on(`item_deselected_${id}`, this._onDeselected, this._unsubscribes);
        }
        !this.listResource && typeof this.list?.preProcessNode === 'function' && this.list?.preProcessNode(this);

        /** @type {ListFilter} */
        this.viewsFilter = this.listResource?.filters?.views;
        this.viewsFilter && this._initializeView();
        return true;
    }

    grabList() {
        if (this.list) return this.list;
        /** @type {List} */
        this.list = this._config?.list || this.closest(this.getProperty('list-selector'));
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        return this.list;
    }

    _onSelected() {
        this.checkbox.checked = true;
        this.classList.add(this.getSelectedClass());
    }

    _onDeselected() {
        this.checkbox.checked = false;
        this.classList.remove(this.getSelectedClass());
    }
    /////////////////////////////
    // #endregion INIT
    /////////////////////////////

    /////////////////////////////
    // #region ACCESSORS
    /////////////////////////////

    getContent() {
        return this._content || this._config?.content || '';
    }

    getId() {
        return this.payload?.id || this.getProperty('id');
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

    getLink() {
        return this.getProperty('link');
    }

    getLabelText(label = this.getProperty('label')) {
        return label || this.getLabelNode()?.textContent?.trim();
    }

    getTemplateContent(template = this._config.template) {
        return super.getTemplateContent(template, this.getPayload());
    }

    getTagName() {
        return 'list-item';
    }

    getSelectedClass() {
        return this.getProperty('selected-class');
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

    getTitle() {
        return this.getProperty('title');
    }

    getContentNode() {
        return this.contentNode || this.contentWrapperNode || this.mainNode || this;
    }

    getLabelNode() {
        return this.titleNode || this.getContentNode();
    }

    /**
     * Returns the payload for the list item.
     * Each item has a unique payload. When using the listResource, the payload may be what is returned from the server.
     * Otherwise, it is the config object.
     * @returns {Record<string, unknown> | unknown}
     */
    getPayload() {
        return this.payload ?? this._config;
    }

    hasNav() {
        return Boolean(this._config.nav);
    }

    hasSelection() {
        const fn = this.list?.hasMultiSelect;
        return (typeof fn === 'function' && fn.call(this.list)) ?? this.getProperty('has-selection');
    }

    /**
     * Sets the content of the list item.
     * @param {string | HTMLElement} content
     */
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

    setAction(action) {
        if (typeof action !== 'function') {
            throw new Error('Action must be a function');
        }
        this._config.action = action;
    }

    setViewClass(view = this.view) {
        view && this.classList.add('listItem--' + view);
    }

    /**
     * Sets the selected state of the list item.
     * @param {Event} event
     */
    setSelected(event) {
        const checked = event?.target?.checked ?? this.checkbox?.checked;
        if (checked) {
            this.listResource?.selectItem(this.getPayload());
            this.classList.add(this.getSelectedClass());
        } else {
            this.listResource.deselectItem(this.getPayload());
            this.classList.remove(this.getSelectedClass());
        }
    }

    /**
     * Returns the wrapper tag for the list item.
     * @returns {string}
     */
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
    /////////////////////////////
    // #endregion
    /////////////////////////////

    /////////////////////////////
    // #region RENDERING
    /////////////////////////////

    /**
     * Returns the template node for the list item.
     * The template attributes and content are applied to the list item when it is rendered.
     * @returns {HTMLTemplateElement | undefined}
     */
    getTemplateNode() {
        return this.list?.itemTemplate?.cloneNode(true);
    }

    getTemplateVars() {
        return {
            ...this.getPayload(),
            icon: this.getIcon(),
            iconRight: this.getIconRight(),
            titleIcon: this.getProperty('title-icon'),
            title: this.getTitle(),
            subTitle: this.getSubTitle(),
            image: this.renderImage()
        };
    }

    async render() {
        this.classList.add('listItem');
        this.imageURL = this.getProperty('image');
        const { role, action } = this._config;
        role && this.setAttribute('role', role);
        this.link = this.getLink();
        this.removeAttribute('link');
        const content = this.renderTemplate(this.getTemplate());
        this.innerHTML = content;
        this.button = this.querySelector('button.listItem__main');
        this.setViewClass();
        action && this.button?.addEventListener('click', event => action(event, this));
        /**
         * @todo Add support for nested list items.
         */
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

    /**
     * Returns the template for the list item.
     * @param {boolean} isGrid - Indicates whether the list item is in grid view.
     * @returns {string}
     */
    getTemplate(isGrid = this.isGrid) {
        const wrapperComponent = this.getWrapperComponent();
        const icon = this.getIcon();
        const iconRight = this.getIconRight();
        const innerContent = this.renderInnerContent(isGrid) || this.hasZone('content');
        const hasInnerContent = innerContent && innerContent?.trim()?.length;
        return html`
            <${wrapperComponent} ${this.getWrapperAttrs()}>
                ${icon ? html`<arpa-icon class="listItem__icon">${icon}</arpa-icon>` : ''}
                ${!isGrid ? this.renderImage() : ''}
                ${hasInnerContent ? html`<div class="listItem__contentWrapper">${innerContent}</div>` : ''}
                ${iconRight ? html`<arpa-icon class="listItem__iconRight">${iconRight}</arpa-icon>` : ''}
            </${wrapperComponent}>
            ${this.renderRhs()}
        `;
    }

    getWrapperAttrs() {
        return attrString({
            href: this.ling,
            class: classNames('listItem__main', { listItem__link: this.link })
        });
    }

    renderInnerContent(isGrid = this.isGrid) {
        const image = isGrid ? this.renderImage() : '';
        const titleContainer = this.renderTitleContainer();
        const tags = this.renderTags();
        const contentHeader =
            image || titleContainer || tags
                ? html`<div class="listItem__contentHeader">${titleContainer}${image}${tags}</div>`
                : '';
        return html`${contentHeader}${this.renderContent()}`;
    }

    hasContent(property) {
        if (this.payload?.[property]) return true;
        return super.hasContent(property);
    }

    async initializeNav() {
        this.navNode = this.querySelector('.listItem__nav');
        await customElements.whenDefined('icon-menu');
        this.navNode?.setConfig(this._config.nav);
    }

    //#region Render Title

    renderTitleContainer(subTitle = this.getSubTitle()) {
        if (!this.hasContent('title') && !subTitle) return '';
        return html`<div class="listItem__titleWrapper">${this.renderTitle()} ${this.renderSubTitle()}</div>`;
    }

    renderTitle() {
        if (!this.hasContent('title')) return '';
        const titleLink = this.getTitleLink();
        const titleClass = 'listItem__title';
        return titleLink
            ? html` <a href="${titleLink}" class="${titleClass}" zone="title">${this.renderTitleContent()}</a>`
            : html`<span class="${titleClass}" zone="title">${this.renderTitleContent()}</span>`;
    }

    renderTitleContent() {
        return html`<arpa-icon>{titleIcon}</arpa-icon>{title}`;
    }

    renderSubTitle() {
        return this.hasContent('subtitle')
            ? html`<span class="listItem__subTitle" zone="subtitle">${this.getSubTitle() || ''}</span>`
            : '';
    }

    //#endregion Render Title

    //#region Render Tags

    renderTags() {
        const { tags = [] } = this._config;
        if (!tags?.length && !this.hasZone('tags')) return '';
        return html`<tag-list id="item-${this.getId()}-tagList" variant="compact" class="listItem__tags" zone="tags">
            ${tags?.map(tag => this.renderTag(tag)) || ''}
        </tag-list>`;
    }

    renderTag(tag) {
        return html`<tag-item class="listItem__tag" text="${tag.label}" icon="${tag.icon}"></tag-item>`;
    }

    // #endregion Render Tags

    renderRhs(content = this._config.rhsContent) {
        const nav = this.renderNav();
        const checkbox = this.renderCheckbox();
        return nav || checkbox || content ? html`<div class="listItem__rhs">${checkbox}${nav}${content}</div>` : '';
    }

    renderCheckbox() {
        if (!this.hasSelection()) return '';
        const props = this.getProperties('id', 'is-selected');
        const { id = '', isSelected = this.listResource?.isSelected(this.getPayload()) } = props;
        const checkboxId = id?.toString() ?? id ?? '';
        const htmlId = `listItem__checkbox-${checkboxId}`;
        const checked = render(isSelected, 'checked');
        return html`<label class="listItem__checkboxContainer" for="${htmlId}">
            <input class="listItem__checkbox arpaCheckbox" type="checkbox" id="${htmlId}" ${checked} />
        </label>`;
    }

    /**
     * Renders the image for the list item.
     * @param {string} image - The image URL.
     * @param {string} alt
     * @returns {string} - The rendered image as a string.
     */
    renderImage(image = this.getImage(), alt = this.getImageAlt()) {
        if (!image) return '';
        return html`<arpa-image
            ${attrString(this.getImageAttributes())}
            class="listItem__image"
            src="${image}"
            alt="${alt}"
        ></arpa-image>`;
    }

    getImageAttributes() {
        const totalItems = this.list?.getItemCount();
        const lazyLoad = this.getLazyLoad();
        const isAuto = lazyLoad === 'auto' && totalItems > 100;
        const attr = {
            'lazy-load': lazyLoad || isAuto,
            'has-native-lazy': this.getProperty('has-native-lazy') || isAuto
        };

        const isAdaptive = this.getProperty('image-size') === 'adaptive';
        const dimensions = this.getImageDimensions(true);
        const width = isAdaptive ? 'adaptive' : dimensions?.width;
        const height = dimensions?.height;
        width && width !== 'auto' && (!height || height === width) && (attr.size = width);
        if (width === 'auto' && dimensions.height) {
            attr.height = dimensions.height;
            attr.width = 'auto';
        } else if (height === 'auto' && dimensions.width) {
            attr.width = dimensions.width;
            attr.height = 'auto';
        }
        return attr;
    }

    getLazyLoad() {
        return this.list?.getLazyLoadImages() ?? this.getProperty('lazy-load-image');
    }

    getImageDimensions(memoized = true) {
        (!memoized || !this.imageDimensions) && (this.imageDimensions = this._getImageDimensions(memoized));
        this.list && (this.list.itemImageDimensions = this.imageDimensions);
        return this.imageDimensions;
    }

    _getImageDimensions(memoized) {
        if (memoized && this.list?.itemImageDimensions) return this.list.itemImageDimensions;
        const { imageSizes = { list: { width: 100 } } } = this._config;
        const size = this.getProperty('image-size');

        if (imageSizes[size]) {
            if (typeof imageSizes[size] === 'function') return imageSizes[size]();
            return imageSizes[size];
        }
        const width = this.getProperty('image-width') || size;
        const height = this.getProperty('image-height');
        if (width || height) return { width, height };
        return imageSizes[this.view?.replace(/-/g, '_')] || imageSizes.list;
    }

    // #region Render Nav

    renderNav() {
        if (!this.hasNav() && !this.hasZone('item-nav')) return '';
        return html`<icon-menu id="${this.getId()}" class="listItem__nav" zone="item-nav"></icon-menu>`;
    }

    // #endregion Render Nav

    renderContent(truncate = this.getProperty('truncate-content'), content = this.getContent()?.trim() || '') {
        if (!this.hasZone('content') && !content) return '';
        if (!truncate) return html`<div class="listItem__content" zone="content">${content}</div>`;
        return html`<truncate-text has-button max-length="${truncate}" class="listItem__content" zone="content">
            ${content}
        </truncate-text>`;
    }
    /////////////////////////////
    //#endregion RENDERING
    /////////////////////////////

    /////////////////////////////
    // #region LIFECYCLE
    /////////////////////////////

    async _initializeNodes() {
        this.mainNode = this.querySelector('.listItem__main');
        this.checkbox = this.querySelector('.listItem__checkbox');
        this.checkboxContainer = this.querySelector('.listItem__checkboxContainer');
        this.rhs = this.querySelector('.listItem__rhs');
        this.image = this.querySelector('.listItem__image');
        this.contentHeaderNode = this.querySelector('.listItem__contentHeader');
        this.contentNode = this.querySelector('.listItem__content');
        this.titleNode = this.querySelector('.listItem__title');
        this.contentWrapperNode = this.querySelector('.listItem__contentWrapper');
        this.hasNav() && this.initializeNav();
        this.image?.addConfig({
            onLoad: event => this._onImageLoaded(event),
            onError: event => this._onImageError(event)
        });
        this._initializeItem();
    }

    /**
     * Initializes event listeners and actions for the list item.
     */
    async _initializeItem() {
        if (this.itemInitialized) return;
        if (this.checkbox) {
            this.checkbox.removeEventListener('change', this.setSelected);
            this.checkbox.addEventListener('change', this.setSelected);
            this.setSelected();
        }
        if (this.mainNode && typeof action === 'function') {
            this.mainNode.removeEventListener('click', this._doAction);
            this.mainNode.addEventListener('click', this._doAction);
        }
        this.itemInitialized = true;
    }

    _doAction(event) {
        const { action } = this._config;
        return action(event, this);
    }

    /**
     * Initializes the view filter.
     * An item can have a view filter that changes the view of the list: grid, list, compact etc...
     */
    _initializeView() {
        this.view = this.viewsFilter?.getValue();
        this.isGrid = this._isGrid();
        this.viewsFilter?.on('value', this._onViewChange, this._unsubscribes);
    }

    _isGrid() {
        return this.view?.indexOf('grid') === 0;
    }

    _onViewChange(view) {
        if (this.view !== view) {
            this.view = view;
            this.isGrid = this._isGrid();
            this?.isConnected && this._update();
        }
    }

    _update() {
        this.checkboxContainer && this.updateCheckbox();
        this._hasRendered && this.updateImage();
        this.image && this.updateImageSize();
    }

    updateCheckbox(container = this.checkboxContainer) {
        if (!container) return;
        this.view === 'list-compact'
            ? container.parentNode !== this.mainNode && this.mainNode?.prepend(container)
            : container.parentNode !== this.rhs && this.rhs?.prepend(container);
    }

    updateImage() {
        if (!this.image) return;
        const targetParentNode = this.isGrid ? this.titleNode || this.contentWrapperNode : this.mainNode;
        if (this.image.parentNode !== targetParentNode) {
            this.isGrid && this.titleNode
                ? this.titleNode.parentNode.after(this.image)
                : targetParentNode.prepend(this.image);
        }
    }

    updateImageSize() {
        const { width, height } = this.getImageDimensions(false);
        this.image?.setSize(width, height);
    }

    /**
     * Once the item is rendered, it registers itself with the list resource.
     */
    _onRenderComplete() {
        super._onRenderComplete();
        if (this.isConnected) {
            const payload = { id: this.getId(), ...this.getPayload() };
            this.listResource?.registerItem(payload, this);
        }
    }
    /////////////////////////////
    // #endregion LIFECYCLE
    /////////////////////////////

    /////////////////////////////
    // #region EVENTS
    /////////////////////////////

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
    /////////////////////////////
    // #endregion EVENTS
    /////////////////////////////

    /////////////////////////////
    // #region ACTIONS
    /////////////////////////////

    /**
     * Deletes the list item.
     * @returns {Promise<void>}
     */
    delete() {
        return this.listResource ? this.listResource.removeItem({ id: this.getId() }) : this.remove();
    }
    /////////////////////////////
    // #endregion ACTIONS
    /////////////////////////////
}

customElements.define(ListItem.prototype.getTagName(), ListItem);

export default ListItem;
