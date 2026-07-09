/**
 * @typedef {import('@arpadroid/ui').ArpaElementContentNodeType} ArpaElementContentNodeType
 * @typedef {import('./listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('@arpadroid/resources').ListResource} ListResource
 * @typedef {import('@arpadroid/resources').ListFilter} ListFilter
 * @typedef {import('@arpadroid/ui').Image} ArpaImage
 * @typedef {import('./listItem.types').ListItemImageSizeType} ListItemImageSizeType
 * @typedef {import('../lists/tagList/tagItem/tagItem.types').TagItemConfigType} TagItemConfigType
 */

import { ArpaElement, applyTemplate } from '@arpadroid/ui';
import { listen, $attr, mergeObjects } from '@arpadroid/tools';
import { getViewportWidth, getViewportHeight, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class ListItem extends ArpaElement {
    /** @type {Set<(event: Event) => void>} */
    actions = new Set();
    /** @type {ListItemConfigType} */
    _config = this._config;

    /**
     * Creates a new list item.
     * @param {ListItemConfigType} config - The configuration for the list item.
     * @param {Record<string, unknown>} payload - The payload for the list item.
     * @param {Record<string, unknown>} map - The map for the list item.
     */
    constructor(config = {}, payload, map) {
        super(config);
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
        this.bind('setSelected');
        this.bind('_doAction', 'getImageAttributes');
        /** @type {ListItemConfigType} */
        const conf = {
            lazyLoad: false,
            selectedClass: 'listItem--selected',
            className: 'listItem',
            listSelector: 'arpa-list',
            lazyLoadImage: false,
            handleContent: true,
            hasImageThumbnail: false,
            imageSize: undefined,
            attributes: { role: 'listitem' },
            titleTag: 'span',
            truncateButton: true,
            zoneResolverSelector: '[zone="{zoneName}"]:not(nav-list [zone="{zoneName}"])',
            imageSizes: {
                small: { width: 50, height: 50 },
                list_compact: { width: 40, height: 40 },
                list: { width: 110, height: 'auto' },
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
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $initializeProperties() {
        super.$initializeProperties();
        this.grabList();
        !this.listResource && typeof this.list?.preProcessNode === 'function' && this.list?.preProcessNode(this);

        return true;
    }

    grabList() {
        if (this.list) return this.list;
        const listSelector = this.getProp('list-selector');
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
    // #endregion Setup

    /////////////////////////////
    // #region Get
    /////////////////////////////

    getContent() {
        return this._content || this._config?.content || '';
    }

    getId() {
        return this.payload?.id || this.getProp('id');
    }

    getImage() {
        const image = this.getProp('image');
        if (image === 'undefined') return '';
        return image;
    }

    getImageAlt() {
        return this.getProp('image-alt');
    }

    getLink() {
        return this.getProp('link');
    }

    getLabelText(label = this.getProp('label')) {
        return label || this.getLabelNode()?.textContent?.trim();
    }

    getTagName() {
        return 'list-item';
    }

    getSelectedClass() {
        return this.getProp('selected-class');
    }

    getLabelNode() {
        return this.nodes.title || this.getContentNode();
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
        if (this.link) return 'a';
        if (this.hasActions()) return 'arpa-button';
        return this.getProp('wrapperComponent') || 'div';
    }

    // #endregion Get

    /////////////////////////////
    // #region Set
    /////////////////////////////

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
     * Sets the image for the list item.
     * @param {string} src - The image source URL.
     */
    setImage(src) {
        this.imageURL = src;
        this.image?.setSource(src);
    }

    // #endregion Set

    /////////////////////////////
    // #region Rendering
    /////////////////////////////

    async _initializeTemplates() {
        super._initializeTemplates();
        this._initializeListTemplate();
    }

    async _initializeListTemplate() {
        const itemTemplate = this._getItemTemplate();
        itemTemplate && applyTemplate(this, itemTemplate, this.getPayload());
    }

    getTemplateVars() {
        return {
            id: this.getId()
        };
    }

    getTitleTag() {
        return (this.getProp('titleLink') && 'a') || this.getProp('titleTag') || 'span';
    }

    _preRender() {
        this.imageURL = this.getProp('image');
        const { role } = this._config;
        role && this.setAttribute('role', role);
        this.link = this.getLink();
    }

    isSelected() {
        return this.listResource?.isSelected(this.getPayload()) ?? this.getProp('isSelected');
    }

    canRenderRhs() {
        return (
            this.hasProp('rhs') || this.hasProp('checkbox') || this.hasProp('nav') || this.listResource?.hasSelection()
        );
    }

    getLinkClass() {
        return this.getProp('link') ? 'listItem__link' : '';
    }

    /**
     * Returns the template for the list item.
     * @returns {string}
     */
    $renderTemplate() {
        const { tags = [] } = this._config;
        return html`
            <arpa-node name="main" tag="${this.getWrapperComponent()}" href="{link}" class="{getLinkClass()}">
                <arpa-node name="icon" tag="arpa-icon"></arpa-node>
                <arpa-node
                    tag="arpa-image"
                    name="image"
                    has-image-thumbnail="{hasImageThumbnail}"
                    has-preview="{imagePreview}"
                    preview-title="{imagePreviewTitle}"
                    preview-controls="{previewControls}"
                    image-position="{imagePosition}"
                    src="{getImage()}"
                    ${$attr(this.getImageAttributes())}
                ></arpa-node>

                <div class="listItem__contentWrapper">
                    <arpa-node name="contentHeader" can-render="title || subtitle">
                        <arpa-node name="titleWrapper" href="{titleLink}" tag="${this.getTitleTag()}">
                            <arpa-node name="titleIcon" tag="arpa-icon"></arpa-node>
                            <arpa-node name="title"></arpa-node>
                        </arpa-node>

                        <arpa-node tag="span" name="subtitle"></arpa-node>
                    </arpa-node>

                    <arpa-node
                        name="content"
                        can-render
                        is-content
                        tag="${this.getProp('truncateContent') ? 'truncate-text' : 'div'}"
                        max-length="{truncateContent}"
                        has-button="{truncateButton}"
                    ></arpa-node>

                    ${tags?.length
                        ? html`<arpa-node name="tags" tag="tag-list" id="item-{id}-tagList" variant="compact">
                              ${tags?.map(
                                  ({ icon, label }) =>
                                      html`<tag-item class="listItem__tag" text="${label}" icon="${icon}"></tag-item>`
                              )}
                          </arpa-node>`
                        : ''}
                </div>
                <arpa-node tag="arpa-icon" name="iconRight"></arpa-node>
            </arpa-node>

            <arpa-node name="rhs" can-render="canRenderRhs()">
                <arpa-node tag="label" name="checkboxContainer" for="listitem__checkbox-{id}" can-render="hasSelection">
                    <input
                        class="listItem__checkbox arpaCheckbox"
                        type="checkbox"
                        id="listitem__checkbox-{id}"
                        checked="{isSelected()}"
                    />
                </arpa-node>
                <arpa-node tag="icon-menu" name="nav" id="{id}-nav"></arpa-node>
            </arpa-node>
        `;
    }

    _getItemTemplate() {
        const list = this.grabList();
        return typeof list?.getItemTemplate === 'function' && list?.getItemTemplate();
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

    getImageAttributes() {
        this.grabList();
        const totalItems = typeof this.list?.getItemCount === 'function' ? this.list?.getItemCount() : 0;
        const lazyLoad = this.getLazyLoad();
        const isAuto = lazyLoad === 'auto' && (totalItems || 0) > 100;
        /** @type {Record<string, unknown>} */
        const attr = {
            'lazy-load': lazyLoad || isAuto,
            'has-native-lazy': this.getProp('has-native-lazy') || isAuto,
            alt: this.getImageAlt(),
            src: this.getImage()
        };

        const isAdaptive = this.getProp('imageSize') === 'adaptive';
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
        return typeof this.list?.getLazyLoadImages === 'function'
            ? this.list?.getLazyLoadImages()
            : this.getProp('lazy-load-image');
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

    getImageSizes() {
        return this._config.imageSizes || { list: { width: 100 } };
    }

    /**
     * Returns the image dimensions for the list item.
     * @param {boolean} memoized - Indicates whether to use the memoized dimensions.
     * @returns {ListItemImageSizeType}
     */
    _getImageDimensions(memoized) {
        if (memoized && this.list?.itemImageDimensions) return this.list.itemImageDimensions;
        const imageSizes = this.getImageSizes();
        const size = this.getProp('imageSize');

        if (Array.isArray(imageSizes) && imageSizes[size]) {
            if (typeof imageSizes[size] === 'function') return imageSizes[size]();
            return imageSizes[size];
        }
        const width = this.getProp('imageWidth') || size;
        const height = this.getProp('imageHeight');
        if (width || height) return { width, height };

        const defaultSize = this.getProp('defaultImageSize');
        let rv = imageSizes[defaultSize];
        if (typeof rv === 'function') rv = rv();

        return rv;
    }

    hasActions() {
        return typeof this._config?.action === 'function' || this.actions?.size > 0;
    }

    //#endregion RENDERING

    /////////////////////////////
    // #region LIFECYCLE
    /////////////////////////////

    async $initializeNodes() {
        /** @type {HTMLElement | null} */
        this.button = this.querySelector('button.listItem__main');
        this.mainNode = this.nodes.main;
        this.checkbox = /** @type {HTMLInputElement} */ (this.querySelector('.listItem__checkbox'));

        this.image = /** @type {ArpaImage | null} */ (this.nodes.image);
        this.image?.addConfig({
            onLoad: this.$onImageLoaded,
            onError: this.$onImageError
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

    $onComplete() {
        this.removeAttribute('link');
        this._attachOnClick();
    }

    _attachOnClick() {
        if (this.hasActions() && this.nodes.main) {
            listen(this.nodes.main, 'click', this._doAction);
        }
    }

    /**
     * Performs the action for the list item.
     * @param {Event} event - The event that triggered the action.
     * @returns {void}
     */
    _doAction(event) {
        const { action } = this._config;
        if (typeof action === 'function') {
            action(event, this);
        }
        for (const act of this.actions) {
            act(event);
        }
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
        this.listResource?.registerItem({ id: this.getId(), ...this.getPayload() }, this);
    }

    // #endregion LIFECYCLE

    /**
     * Called when the image has loaded.
     * @param {Event} event
     */
    $onImageLoaded(event) {
        this._config?.onImageLoaded?.(event, this);
    }

    /**
     * Called when the image has failed to load.
     * @param {Event} event
     */
    $onImageError(event) {
        this._config?.onImageError?.(event, this);
    }

    /**
     * Deletes the list item.
     * @returns {Promise<void>}
     */
    async delete() {
        return this.listResource ? this.listResource.removeItem({ id: this.getId() }) : this.remove();
    }
}

defineCustomElement(ListItem.prototype.getTagName(), ListItem);

export default ListItem;
