/**
 * @typedef {import('./listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/ui').Image} ArpaImage
 * @typedef {import('@arpadroid/navigation').NavList} NavList
 * @typedef {import('./listItem.types').ListItemImageSizeType} ListItemImageSizeType
 * @typedef {import('../lists/tagList/tagItem/tagItem.types').TagItemConfigType} TagItemConfigType
 */

import { ArpaElement } from '@arpadroid/ui';
import { render, classNames, attrString, listen } from '@arpadroid/tools';
import { getViewportWidth, getViewportHeight, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class ListItem extends ArpaElement {
    /** @type {ListItemConfigType} */
    _config = this._config;
    /////////////////////
    // #region INIT
    /////////////////////

    /**
     * Creates a new list item.
     * @param {ListItemConfigType} config - The configuration for the list item.
     * @param {Record<string, unknown>} payload - The payload for the list item.
     * @param {Record<string, unknown>} map - The map for the list item.
     */
    constructor(config = {}, payload, map) {
        super(config);
        /** @type {boolean} */
        this.isGrid = this.isGrid || false;
        this.payload = payload;
        this.map = map;
        if (this.hasAttribute('title')) {
            this._config.title = this.getAttribute('title') || '';
            this.removeAttribute('title');
        }
    }

    /**
     * Gets the default config for the component.
     * @returns {ListItemConfigType}
     */
    getDefaultConfig() {
        this.bind(
            '_onImageLoaded',
            '_onImageError',
            'setSelected',
            '_onViewChange',
            '_onSelected',
            '_onDeselected',
            '_doAction'
        );
        /** @type {ListItemConfigType} */
        const conf = {
            lazyLoad: false,
            selectedClass: 'listItem--selected',
            truncateContent: 0,
            wrapperComponent: 'div',
            rhsContent: '',
            role: 'listitem',
            listSelector: '.arpaList',
            lazyLoadImage: false,
            imageSize: undefined,
            titleTag: 'span',
            defaultImageSize: 'list',
            imageSizes: {
                small: { width: 50, height: 50 },
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
        };
        return super.getDefaultConfig(conf);
    }

    _initializeTemplate() {
        this.grabList();
        super._initializeTemplate(this.getTemplateNode());
    }

    initializeProperties() {
        super.initializeProperties();
        this.grabList();
        const id = this.getId();
        if (typeof this.list?.hasControl === 'function' && this.list?.hasControl('multiselect')) {
            this.listResource?.on(`item_selected_${id}`, this._onSelected, this._unsubscribes);
            this.listResource?.on(`item_deselected_${id}`, this._onDeselected, this._unsubscribes);
        }
        !this.listResource && typeof this.list?.preProcessNode === 'function' && this.list?.preProcessNode(this);

        /** @type {ListFilter} */
        this.viewsFilter = this.listResource?.filters?.views;
        this.viewsFilter && this._initializeView();
        return true;
    }

    grabList() {
        if (this.list) return this.list;
        const listSelector = this.getProperty('list-selector');
        /** @type {List} */
        this.list = this._config?.list || this.closest(listSelector);
        /** @type {ListResource} */
        this.listResource = this.list?.listResource;
        return this.list;
    }

    _onSelected() {
        this.checkbox && (this.checkbox.checked = true);
        this.classList.add(this.getSelectedClass());
    }

    _onDeselected() {
        this.checkbox && (this.checkbox.checked = false);
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
        const image = this.getProperty('image');
        if (image === 'undefined') return '';
        return image;
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
     * @returns {Record<string, unknown>}
     */
    getPayload() {
        return this.payload ?? this._config;
    }

    hasNav() {
        return Boolean(this._config.nav);
    }

    hasSelection() {
        return (
            (typeof this.list?.hasControl === 'function' && this.list?.hasControl('multiselect')) ??
            this.getProperty('has-selection')
        );
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

    /**
     * Sets the action for the list item.
     * @param {ListItemConfigType['action']} action
     * @throws {Error} - If the action is not a function.
     */
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
     * @param {Event} [event]
     */
    setSelected(event) {
        const checkbox = /** @type {HTMLInputElement} */ (event?.target);
        const checked = checkbox?.checked ?? this.checkbox?.checked;
        if (checked) {
            this.listResource?.selectItem(this.getPayload());
            this.classList.add(this.getSelectedClass());
        } else {
            this.listResource?.deselectItem(this.getPayload());
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
    // #region Rendering
    /////////////////////////////

    /**
     * Returns the template node for the list item.
     * The template attributes and content are applied to the list item when it is rendered.
     * @returns {HTMLTemplateElement | undefined}
     */
    getTemplateNode() {
        return /** @type {HTMLTemplateElement} */ (this.list?.itemTemplate?.cloneNode(true));
    }

    getTemplateVars() {
        return {
            ...this.getPayload(),
            icon: this.renderIcon(),
            iconRight: this.renderIconRight(),
            titleIcon: this.renderTitleIcon(),
            title: this.getTitle(),
            renderTitleIcon: this.renderTitleIcon(),
            subTitle: this.getSubTitle(),
            image: this.renderImage(),
            wrapperComponent: this.getWrapperComponent(),
            wrapperAttributes: attrString(this.getWrapperAttrs()),
            rhs: this.renderRhs(),
            content: this.renderContentWrapper()
        };
    }

    async render() {
        this.classList.add('listItem');
        this.imageURL = this.getProperty('image');
        const { role } = this._config;
        role && this.setAttribute('role', role);
        this.link = this.getLink();
        this.removeAttribute('link');
        const content = this.renderTemplate(this._getTemplate());
        this.innerHTML = content;
        this.button = this.querySelector('button.listItem__main');
        this.setViewClass();
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
    _getTemplate(isGrid = this.isGrid) {
        return html`
            <{wrapperComponent} {wrapperAttributes}>
                {icon}
                ${(!isGrid && '{image}') || ''}
                {content}
                {iconRight}
            </{wrapperComponent}>
            {rhs}
        `;
    }

    renderContentWrapper(isGrid = this.isGrid) {
        const innerContent = /** @type {string} */ (this.renderInnerContent(isGrid) || this.hasZone('content'));
        const hasInnerContent = innerContent && innerContent?.trim()?.length;
        return (hasInnerContent && html`<div class="listItem__contentWrapper">${innerContent}</div>`) || '';
    }

    /**
     * Returns the attributes for the list item wrapper.
     * @returns {Record<string, any>}
     */
    getWrapperAttrs() {
        return {
            href: this.link,
            class: classNames('listItem__main', { listItem__link: this.link })
        };
    }

    renderIcon() {
        const icon = this.getIcon();
        return icon ? html`<arpa-icon class="listItem__icon">${icon}</arpa-icon>` : '';
    }

    renderIconRight() {
        const icon = this.getIconRight();
        return icon ? html`<arpa-icon class="listItem__iconRight">${icon}</arpa-icon>` : '';
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

    /**
     * Returns whether the list item has content.
     * @param {string} property - The property to check for content.
     * @returns {boolean}
     */
    hasContent(property) {
        if (this.payload?.[property]) return true;
        return super.hasContent(property);
    }

    async initializeNav() {
        /** @type {NavList | null} */
        this.navNode = /** @type {NavList | null} */ (this.querySelector('.listItem__nav'));
        await customElements.whenDefined('icon-menu'); // @ts-ignore
        this._config.nav && this.navNode?.setConfig(this._config.nav);
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
        const titleTag = this.getProperty('title-tag') || 'span';
        return titleLink
            ? html`<a href="${titleLink}" class="${titleClass}" zone="title">${this.renderTitleContent()}</a>`
            : html`<${titleTag} class="${titleClass}" zone="title">${this.renderTitleContent()}</${titleTag}>`;
    }

    renderTitleContent() {
        return html`{titleIcon}{title}`;
    }
    renderTitleIcon() {
        const titleIcon = this.getProperty('title-icon');
        return (titleIcon && html`<arpa-icon class="listItem__titleIcon">${titleIcon}</arpa-icon>`) || '';
    }

    renderSubTitle() {
        return this.hasContent('subtitle')
            ? html`<span class="listItem__subTitle" zone="subtitle">${this.getSubTitle() || ''}</span>`
            : '';
    }

    //#endregion Render Title

    //#region Render Tags

    /**
     * Renders the tags for the list item.
     * @returns {string} - The rendered tags as a string.
     */
    renderTags() {
        const { tags = [] } = this._config;
        if (!tags?.length && !this.hasZone('tags')) return '';
        const tagsHTML = tags?.map(tag => this.renderTag(tag)) || '';
        return html`<tag-list id="item-${this.getId()}-tagList" variant="compact" class="listItem__tags" zone="tags">
            ${tagsHTML}
        </tag-list>`;
    }

    /**
     * Renders a tag for the list item.
     * @param {TagItemConfigType} tag
     * @returns {string} - The rendered tag as a string.
     */
    renderTag(tag) {
        return html`<tag-item class="listItem__tag" text="${tag.label}" icon="${tag.icon}"></tag-item>`;
    }

    // #endregion Render Tags

    renderRhs(content = this._config.rhsContent) {
        const nav = this.renderNav();
        const checkbox = this.renderCheckbox();
        return this.hasZone('rhs') || nav || checkbox || content
            ? html`<div class="listItem__rhs" zone="rhs">${checkbox}${nav}${content}</div>`
            : '';
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
            alt="${alt}"
            class="listItem__image"
            src="${image}"
        ></arpa-image>`;
    }

    getImageAttributes() {
        const totalItems = this.list?.getItemCount();
        const lazyLoad = this.getLazyLoad();
        const isAuto = lazyLoad === 'auto' && (totalItems || 0) > 100;
        /** @type {Record<string, unknown>} */
        const attr = {
            'lazy-load': lazyLoad || isAuto,
            'has-native-lazy': this.getProperty('has-native-lazy') || isAuto,
            'preview-controls': this.getProperty('preview-controls'),
            'has-preview': this.getProperty('image-preview'),
            'preview-title': this.getProperty('image-preview-title'),
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

    /**
     * Returns the image dimensions for the list item.
     * @param {boolean} memoized - Indicates whether to use the memoized dimensions.
     * @returns {ListItemImageSizeType}
     */
    getImageDimensions(memoized = true) {
        (!memoized || !this.imageDimensions) && (this.imageDimensions = this._getImageDimensions(memoized));
        this.list && (this.list.itemImageDimensions = this.imageDimensions);
        return this.imageDimensions;
    }

    /**
     * Returns the image dimensions for the list item.
     * @param {boolean} memoized - Indicates whether to use the memoized dimensions.
     * @returns {ListItemImageSizeType}
     */
    _getImageDimensions(memoized) {
        if (memoized && this.list?.itemImageDimensions) return this.list.itemImageDimensions;
        const { imageSizes = { list: { width: 100 } } } = this._config;
        const size = this.getProperty('image-size');

        if (Array.isArray(imageSizes) && imageSizes[size]) {
            if (typeof imageSizes[size] === 'function') return imageSizes[size]();
            return imageSizes[size];
        }
        const width = this.getProperty('image-width') || size;
        const height = this.getProperty('image-height');

        if (width || height) return { width, height };
        const sizeName = /** @type {string} */ (this.view?.replace(/-/g, '_'));
        const defaultSize = this.getProperty('default-image-size');
        let rv = imageSizes[sizeName] || imageSizes[defaultSize];
        if (typeof rv === 'function') rv = rv();
        return rv;
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
        return html`<truncate-text max-length="${truncate}" class="listItem__content" zone="content">
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
        /** @type {HTMLElement | null} */
        this.mainNode = this.querySelector('.listItem__main');
        this.checkbox = /** @type {HTMLInputElement} */ (this.querySelector('.listItem__checkbox'));
        this.checkboxContainer = this.querySelector('.listItem__checkboxContainer');
        this.rhs = this.querySelector('.listItem__rhs');
        /** @type {ArpaImage | null} */
        this.image = this.querySelector('.listItem__image');
        this.contentHeaderNode = this.querySelector('.listItem__contentHeader');
        this.contentNode = this.querySelector('.listItem__content');
        this.titleNode = this.querySelector('.listItem__title');
        this.contentWrapperNode = this.querySelector('.listItem__contentWrapper');
        this.hasNav() && this.initializeNav();
        this.image?.addConfig({
            onLoad: this._onImageLoaded,
            onError: this._onImageError
        });
        this._initializeItem();
        return true;
    }

    /**
     * Initializes event listeners and actions for the list item.
     */
    async _initializeItem() {
        if (this.itemInitialized) return;
        if (this.checkbox) {
            listen(this.checkbox, 'change', this.setSelected);
            this.setSelected();
        }
        
        this.itemInitialized = true;
    }

    _onComplete() {
        this._attachOnClick();
    }

    _attachOnClick() {
        if (this.mainNode && typeof this._config?.action === 'function') {
            listen(this.mainNode, 'click', this._doAction);
        }
    }

    /**
     * Performs the action for the list item.
     * @param {Event} event - The event that triggered the action.
     * @returns {unknown} - The result of the action.
     */
    _doAction(event) {
        const { action } = this._config;
        return typeof action === 'function' && action(event, this);
    }

    /**
     * Initializes the view filter.
     * An item can have a view filter that changes the view of the list: grid, list, compact etc...
     */
    _initializeView() {
        /** @type {string} */
        this.view = /** @type {string} */ (this.viewsFilter?.getValue() || 'list');
        this.isGrid = this._isGrid();
        this.viewsFilter?.on('value', this._onViewChange, this._unsubscribes);
    }

    _isGrid() {
        return this.view?.indexOf('grid') === 0;
    }

    /**
     * Called when the view changes.
     * @param {string} view
     */
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
                ? this.titleNode?.parentNode instanceof HTMLElement && this.titleNode?.parentNode?.after(this.image)
                : targetParentNode?.prepend(this.image);
        }
    }

    updateImageSize() {
        const { width, height } = this.getImageDimensions(false);
        this.image?.setSize(Number(width), Number(height));
    }

    /**
     * Once the item is rendered, it registers itself with the list resource.
     */
    async _onRenderComplete() {
        await super._onRenderComplete();
        this.isConnected && this.register();
    }

    register() {
        this.grabList();
        const payload = { id: this.getId(), ...this.getPayload() };
        this.listResource?.registerItem(payload, this);
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
        typeof onImageError === 'function' && onImageError(event, this);
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
    async delete() {
        return this.listResource ? this.listResource.removeItem({ id: this.getId() }) : this.remove();
    }
    /////////////////////////////
    // #endregion ACTIONS
    /////////////////////////////
}

defineCustomElement(ListItem.prototype.getTagName(), ListItem);

export default ListItem;
