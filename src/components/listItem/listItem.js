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

import { ArpaElement, applyTemplate } from '@arpadroid/ui';
import { render, classNames, attrString, listen, dashedToCamel } from '@arpadroid/tools';
import { getViewportWidth, getViewportHeight, defineCustomElement } from '@arpadroid/tools';
import ListItemViews from './listItem.views.js';

const html = String.raw;
class ListItem extends ArpaElement {
    /** @type {ListItemConfigType} */
    _config = this._config;
    /////////////////////
    // #region Setup
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
        this.bind('_onImageLoaded', '_onImageError', 'setSelected');
        this.bind('_onViewChange', '_onSelected', '_onDeselected', '_doAction');
        /** @type {ListItemConfigType} */
        const conf = {
            lazyLoad: false,
            selectedClass: 'listItem--selected',
            truncateContent: 0,
            wrapperComponent: 'div',
            rhsContent: '',
            className: 'listItem',
            role: 'listitem',
            listSelector: 'arpa-list',
            lazyLoadImage: false,
            hasImageThumbnail: false,
            imageSize: undefined,
            titleTag: 'span',
            defaultImageSize: 'list',
            zoneResolverSelector: '[zone="{zoneName}"]:not(nav-list [zone="{zoneName}"])',
            imageSizes: {
                small: { width: 50, height: 50 },
                list_compact: { width: 40, height: 40 },
                list: { width: 110, height: 110 },
                grid_compact: { width: 180, height: 180 },
                grid: { width: 320, height: 320 },
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

    initializeProperties() {
        super.initializeProperties();
        this.grabList();
        const id = this.getId();
        if (typeof this.list?.hasControl === 'function' && this.list?.hasControl('multiselect')) {
            this.listResource?.on(`item_selected_${id}`, this._onSelected, this._unsubscribes);
            this.listResource?.on(`item_deselected_${id}`, this._onDeselected, this._unsubscribes);
        }
        // !this.listResource && typeof this.list?.preProcessNode === 'function' && this.list?.preProcessNode(this);

        /** @type {ListFilter} */
        this.viewsFilter = this.listResource?.filters?.views;

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
    // #endregion Setup
    /////////////////////////////

    /////////////////////////////
    // #region Get
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

    // #endregion Get

    /////////////////////////////
    // #region Has
    /////////////////////////////

    hasNav() {
        return Boolean(this._config.nav);
    }

    hasSelection() {
        return (
            (typeof this.list?.hasControl === 'function' && this.list?.hasControl('multiselect')) ??
            this.getProperty('has-selection')
        );
    }

    // #endregion Has

    /////////////////////////////
    // #region Set
    /////////////////////////////

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
     * Sets the title for the list item.
     * @param {string | HTMLElement} title - The title to set.
     */
    setTitle(title) {
        this.payload && (this.payload.title = title);
        if (this.titleNode) {
            if (title instanceof HTMLElement) {
                this.titleNode.innerHTML = '';
                this.titleNode.appendChild(title);
            } else if (typeof title === 'string') {
                this.titleNode.textContent = title;
            }
        }
    }

    /**
     * Sets the image for the list item.
     * @param {string} src - The image source URL.
     */
    setImage(src) {
        this.imageURL = src;
        if (this.image) {
            this.image.setSource(src);
        }
    }

    // #endregion Set

    /////////////////////////////
    // #region Rendering
    /////////////////////////////

    async _initializeTemplates() {
        this._initializeListTemplate();
        super._initializeTemplates();
    }

    async _initializeListTemplate() {
        const list = this.grabList();
        if (typeof list?.getItemTemplate !== 'function') return;
        const itemTemplate = list?.getItemTemplate();
        if (!(itemTemplate instanceof HTMLTemplateElement)) return;
        applyTemplate(this, itemTemplate, {
            contentMode: 'add',
            applyAttributes: true
        });
    }

    getTemplateVars() {
        return {
            ...this.getPayload(),
            checkbox: this.renderCheckbox(),
            children: this.renderContent(),
            contentWrapper: this.renderContentWrapper(),
            icon: this.renderIcon(),
            iconRight: this.renderIconRight(),
            image: this.renderImage(),
            nav: this.renderNav(),
            rhs: this.renderRhs(),
            subTitle: this.renderSubTitle(),
            tags: this.renderTags(),
            title: this.renderTitle(),
            titleContainer: this.renderTitleContainer(),
            titleContent: this.renderTitleContent(),
            wrapperAttributes: attrString(this.getWrapperAttrs()),
            wrapperComponent: this.getWrapperComponent(),
            wrapper: '<{wrapperComponent} {wrapperAttributes}>',
            '/wrapper': '</{wrapperComponent}>'
        };
    }

    _preRender() {
        this.imageURL = this.getProperty('image');
        const { role } = this._config;
        role && this.setAttribute('role', role);
        this.link = this.getLink();
        this.removeAttribute('link');
    }

    _onConnected() {
        super._onConnected();
        this.viewsFilter && this._initializeView();
    }

    /**
     * Returns the template for the list item.
     * @returns {string}
     */
    _getTemplate() {
        return this.getViewTemplate();
    }

    /**
     * Returns the view configuration for the list item.
     * @param {string} viewId
     * @returns {import('./listItem.types').ListItemViewConfigType}
     */
    getViewConfig(viewId = this.getView()) {
        const viewKey = dashedToCamel(viewId);
        const viewConfig = ListItemViews[viewKey] || ListItemViews[viewId];
        return viewConfig;
    }

    getView() {
        return (typeof this.list?.getView === 'function' && this.list?.getView()) || this.view || 'list';
    }

    getViewTemplate(viewId = this.getView()) {
        return this.getViewConfig(viewId)?.template || this.list?.getViewTemplate(viewId)?.innerHTML || '';
    }

    renderContentWrapper() {
        return html`<div class="listItem__contentWrapper">{innerContent}</div>`;
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

    renderContentHeader() {
        const titleContainer = this.renderTitleContainer();
        const tags = this.renderTags();
        return titleContainer || tags ? html`<div class="listItem__contentHeader">{titleContainer}{tags}</div>` : '';
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
        return html`<div class="listItem__titleWrapper">{title}{subTitle}</div>`;
    }

    renderTitle() {
        if (!this.hasContent('title')) return '';
        const titleLink = this.getTitleLink();
        const titleClass = 'listItem__title';
        const titleTag = this.getProperty('title-tag') || 'span';
        const content = this.renderTitleContent();
        return titleLink
            ? html`<a href="${titleLink}" class="${titleClass}" zone="title">${content}</a>`
            : html`<${titleTag} class="${titleClass}" zone="title">${content}</${titleTag}>`;
    }

    renderTitleContent(content = this.getTitle(), icon = this.renderTitleIcon()) {
        return html`${icon}${content || ''}`;
    }

    renderTitleIcon(icon = this.getProperty('title-icon')) {
        return (icon && html`<arpa-icon class="listItem__titleIcon">${icon}</arpa-icon>`) || '';
    }

    renderSubTitle() {
        const subTitle = this.getSubTitle() || '';
        return this.hasContent('sub-title') && subTitle
            ? html`<span class="listItem__subTitle" zone="subtitle">${subTitle}</span>`
            : '';
    }

    //#endregion Render Title

    /////////////////////////////
    // #region Render Tags
    ////////////////////////////
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

    //#region Render Rhs

    renderRhs(content = this._config.rhsContent) {
        const nav = this.renderNav();
        const checkbox = this.renderCheckbox();
        return this.hasZone('rhs') || nav || checkbox || content
            ? html`<div class="listItem__rhs" zone="rhs">${checkbox}${nav}${content}</div>`
            : '';
    }

    // #endregion Render Rhs

    //#region Render Checkbox

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

    //#endregion Render Checkbox

    /**
     * Renders the image for the list item.
     * @param {string} image - The image URL.
     * @returns {string} - The rendered image as a string.
     */
    renderImage(image = this.getImage()) {
        if (!image) return '';
        return html`<arpa-image ${attrString(this.getImageAttributes())}></arpa-image>`;
    }

    getImageAttributes() {
        const totalItems = this.list?.getItemCount();
        const lazyLoad = this.getLazyLoad();
        const isAuto = lazyLoad === 'auto' && (totalItems || 0) > 100;
        /** @type {Record<string, unknown>} */
        const attr = {
            'has-thumbnail': this.getProperty('has-image-thumbnail'),
            'lazy-load': lazyLoad || isAuto,
            'has-native-lazy': this.getProperty('has-native-lazy') || isAuto,
            'preview-controls': this.getProperty('preview-controls'),
            'has-preview': this.getProperty('image-preview'),
            'preview-title': this.getProperty('image-preview-title'),
            'image-position': this.getProperty('image-position'),
            alt: this.getImageAlt(),
            class: 'listItem__image',
            src: this.getImage()
        };

        const isAdaptive = this.getProperty('image-size') === 'adaptive';
        const dimensions = this.getImageDimensions(false);
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
        const view = this.list?.getView() || this.view || 'list';
        if (width || height) return { width, height };
        const sizeName = this.list?.hasControl('views') && view?.replace(/-/g, '_');
        const defaultSize = this.getProperty('default-image-size');
        let rv = (sizeName && imageSizes[sizeName]) || imageSizes[defaultSize];
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
        if (truncate) {
            return html`<truncate-text
                ${attrString({
                    maxLength: truncate,
                    hasReadMoreButton: this.hasProperty('truncate-button'),
                    zone: 'content',
                    class: 'listItem__content'
                })}
            >
                ${content}
            </truncate-text>`;
        }
        return html`<div class="listItem__content" zone="content">${content}</div>`;
    }
    /////////////////////////////
    //#endregion RENDERING
    /////////////////////////////

    /////////////////////////////
    // #region LIFECYCLE
    /////////////////////////////

    async _initializeNodes() {
        /** @type {HTMLElement | null} */
        this.button = this.querySelector('button.listItem__main');
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
        this.setViewClass();
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
        const val = String(this.viewsFilter?.getValue() || 'list');
        /** @type {string} */
        this.view = val;
        this.viewsFilter?.on('value', this._onViewChange);
    }

    /**
     * Called when the view changes.
     * @param {string} view
     */
    _onViewChange(view) {
        if (this.view !== view) {
            this.view = view;
            this?.isConnected && this.reRender();
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
    // #region Events
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
    // #endregion Events
    /////////////////////////////

    /////////////////////////////
    // #region Actions
    /////////////////////////////

    /**
     * Deletes the list item.
     * @returns {Promise<void>}
     */
    async delete() {
        return this.listResource ? this.listResource.removeItem({ id: this.getId() }) : this.remove();
    }
    /////////////////////////////
    // #endregion Actions
    /////////////////////////////
}

defineCustomElement(ListItem.prototype.getTagName(), ListItem);

export default ListItem;
