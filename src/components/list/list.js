/**
 * @typedef {import('@arpadroid/resources').ListResourceItemType} ListResourceItemType
 * @typedef {import('@arpadroid/ui').Pager} Pager
 * @typedef {import('@arpadroid/ui').ArpaElementTemplateType} ArpaElementTemplateType
 * @typedef {import('./list.types').ListConfigType} ListConfigType
 * @typedef {import('../listItem/listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('../listItem/listItem.types').ListItemImageSizeType} ListItemImageSizeType
 */

import { ArpaElement } from '@arpadroid/ui';
import { ListResource, getResource } from '@arpadroid/resources';
import { mergeObjects, appendNodes, defineCustomElement } from '@arpadroid/tools';
import { renderNode, renderAttr, attrString, bind } from '@arpadroid/tools';
import { processTemplate } from '@arpadroid/ui';
import ListItem from '../listItem/listItem.js';

const html = String.raw;

class List extends ArpaElement {
    /** @type {ListConfigType} */
    _config = this._config;
    isSearchInitialized = false;
    /** @type {ListItemImageSizeType} */
    itemImageDimensions;
    // isLoading = false;

    ///////////////////////////
    // #region Initialization
    //////////////////////////

    _preInitialize() {
        bind(this, 'onResourceAddItem', 'onResourceRemoveItem', 'onResourceRemoveItems', '_initializeList');
        bind(this, 'onResourceItemsUpdated', 'onResourceSetItems', 'onResourceAddItems', 'onResourceFetch');
        bind(this, 'onTransitionOut', 'onPagerChange');
    }

    _initialize() {
        this._initializeListResource();
        this.isLoading = false;
    }

    /**
     * Returns the parent list component from a given element.
     * @param {Element} element
     * @returns {List | null}
     */
    static getList(element) {
        return element.closest('.arpaList, arpa-list, arpa-gallery, list-manager');
    }

    _initializeListResource() {
        /** @type {ListResource} */
        this.listResource = this.getResource();
        if (!this.listResource) return;
        this.listResource.on('payload', this._initializeList);
        this._handleItems();
        this._handlePreloading();
        const url = this.getProperty('url');
        if (url) {
            this.listResource.setUrl(url);
            this.removeAttribute('url');
        }
    }

    /**
     * Returns the list resource.
     * @returns {ListResource | undefined}
     */
    getResource() {
        const resource =
            this.listResource ?? this._config.listResource ?? (this.hasResource() && this.instantiateResource());
        return resource instanceof ListResource ? resource : undefined;
    }

    /**
     * Returns the parameter name for a given parameter.
     * @param {string} param
     * @returns {string}
     */
    getParamName(param) {
        const namespace = this.getProperty('param-namespace');
        return namespace + this.getProperty(`${param}-param`);
    }

    instantiateResource(id = this.getId(), userConfig = {}) {
        const resource = getResource(id);
        if (resource) return resource;
        const config = mergeObjects(
            {
                id,
                pageParam: this.getParamName('page'),
                searchParam: this.getParamName('search'),
                perPageParam: this.getParamName('perPage'),
                sortByParam: this.getParamName('sortBy'),
                sortDirParam: this.getParamName('sortDir'),
                itemsPerPage: this.getProperty('items-per-page'),
                mapItemId: this._config?.mapItemId,
                itemIdMap: this.getProperty('item-id-map'),
                listComponent: this,
                url: this.getProperty('url')
            },
            userConfig
        );
        return new ListResource(config);
    }

    _initializeList() {
        this._initializePager();
    }

    /**
     * Sets the configuration for the component.
     * @param {ListConfigType} config
     * @returns {ListConfigType}
     * @throws {Error} If the component has no id.
     */
    setConfig(config = {}) {
        config.id = config.id || this.id;
        if (!config.id) {
            throw new Error('List component must have an id.');
        }
        super.setConfig(config);
        this._initializeZoneSelector();
        return this._config;
    }

    _initializeZoneSelector() {
        const itemTag = this._config?.itemTag || 'list-item';
        !this._config?.zoneSelector && (this._config.zoneSelector = `zone:not(${itemTag} zone)`);
    }

    getTemplateChildren() {
        return {
            heading: {},
            titleWrapper: { tag: 'h2', hasZone: false, content: '{titleIcon}{title}' },
            title: { tag: 'span' },
            titleIcon: { tag: 'arpa-icon' },
            aside: {},
            footer: { content: '{pager}' },
            preloader: { tag: 'circular-preloader', canRender: 'has-preloader' },
            noItems: { content: '{noItemsIcon}{noItemsText}', canRender: true },
            noItemsIcon: { tag: 'arpa-icon' },
            noItemsText: { content: () => this.getNoItemsContent() }
        };
    }

    /**
     * Returns the default configuration for this component.
     * @param {ListConfigType} config
     * @returns {ListConfigType}
     */
    getDefaultConfig(config = {}) {
        /** @type {ListConfigType} */
        const conf = {
            canCollapse: false,
            className: 'arpaList',
            hasItemsTransition: false,
            hasPager: true,
            hasPreloader: true,
            hasResource: false,
            imageSize: 'list',
            isCollapsed: false,
            itemComponent: ListItem,
            itemIdMap: 'id',
            items: [],
            itemsPerPage: 50,
            itemTag: 'list-item',
            lazyLoadImages: 'auto',
            mapItemId: undefined,
            maxPagerNodes: 7,
            noItemsContent: html`<i18n-text key="lists.list.txtNoItemsFound"></i18n-text>`,
            noItemsIcon: 'info',
            pageParam: 'page',
            paramNamespace: '',
            perPageParam: 'perPage',
            renderMode: 'full',
            resetScrollOnLoad: true,
            searchParam: 'search',
            showResultsText: true,
            tagName: 'arpa-list',
            templateTypes: ['content', 'list-item'],
            title: '',
            templateChildren: this.getTemplateChildren()
        };
        return mergeObjects(super.getDefaultConfig(conf), config);
    }

    // #endregion

    ////////////////
    // #region Has
    ////////////////

    /**
     * Returns true if the list has a pager component.
     * @returns {boolean}
     */
    hasPager() {
        return Boolean(this.hasResource() && this.hasProperty('has-pager'));
    }

    /**
     * Returns true if the list has a resource.
     * The list resource manages the list items, pagination and filtering.
     * @returns {boolean}
     */
    hasResource() {
        return Boolean(this.hasProperty('url') || this.hasProperty('has-resource'));
    }

    // #endregion

    /////////////////
    // #region Get
    /////////////////

    /**
     * Returns the list item template.
     * @returns {ArpaElementTemplateType | null}
     */
    getItemTemplate() {
        return this.templates['list-item'];
    }

    /**
     * Returns the component id.
     * @returns {string}
     */
    getId() {
        return this.getProperty('id');
    }

    getItemCount() {
        return Number(this.getItems()?.length) || this.getItemNodes()?.length || 0;
    }

    /**
     * Returns the render mode.
     * @returns {string}
     */
    getRenderMode() {
        return this.getProperty('render-mode');
    }

    /**
     * The main text to be displayed.
     * @returns {string}
     */
    getTitle() {
        return this.getProperty('title');
    }

    /**
     * Gets the list items that are initially added to the DOM.
     * @returns {(ListItem | Node | HTMLElement)[]}
     */
    getInitialItems() {
        const itemTagName = this.getProperty('item-tag');
        return (
            this._childNodes?.filter(node => {
                return node instanceof Element && node.tagName?.toLowerCase() === itemTagName;
            }) || []
        );
    }

    getNoItemsContent() {
        return this.getProperty('no-items-content');
    }

    getChildren() {
        return this.itemsNode?.children ?? [];
    }

    getLazyLoadImages() {
        return this.getProperty('lazy-load-images');
    }

    // #endregion get

    /////////////////
    // #region Set
    ////////////////

    /**
     * Scrolls list to the top.
     */
    resetScroll() {
        this.hasProperty('resetScrollOnLoad') && this.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // #endregion set

    //////////////////////////
    // #region Resource API
    /////////////////////////

    /**
     * Sets the list items and deletes existing ones.
     * @param {ListItemConfigType[]} items
     */
    setList(items) {
        this.listResource?.setItems(items);
    }

    /**
     * Sets the list resource.
     * @param {ListResource} listResource
     */
    setListResource(listResource) {
        this.listResource = listResource;
    }

    /**
     * Preprocess a list item node.
     * @param {ListConfigType['preProcessNode']} callback
     */
    setPreProcessNode(callback) {
        if (this.listResource) {
            // @ts-ignore
            callback && this.listResource?.setPreProcessNode(callback);
        } else {
            this._config.preProcessNode = callback;
        }
    }

    /**
     * Preprocess a list item node.
     * @param {ListItem | undefined} node
     * @returns {ListItem | HTMLElement | undefined}
     */
    preProcessNode(node) {
        const { preProcessNode } = this._config;
        return (typeof preProcessNode === 'function' && preProcessNode(node)) || undefined;
    }

    /**
     * Adds an item to the list.
     * @param {ListItemConfigType} item
     * @returns { ListItem | ListResourceItemType | Record<string, any>}
     */
    addItem(item) {
        return this.listResource ? this.listResource.addItem(item) : this.appendChild(this.createItem(item));
    }

    /**
     * Adds an item to the list.
     * @param {ListItem | HTMLElement} item
     * @param {boolean} unshift
     * @param {HTMLElement} [container]
     */
    async addItemNode(item, unshift = false, container = this.itemsNode) {
        unshift ? container?.prepend(item) : container?.appendChild(item);
    }

    /**
     * Adds items to the list.
     * @param {ListItemConfigType[]} itemsPayload
     * @returns {ListItem[] | ListItemConfigType[] | void}
     */
    addItems(itemsPayload) {
        if (this.listResource) return this.listResource?.addItems(itemsPayload);
        if (this.itemsNode) {
            return appendNodes(
                this.itemsNode,
                itemsPayload.map(item => this.createItem(item))
            );
        } else {
            this._config.items = this._config?.items?.concat(itemsPayload);
        }
    }

    /**
     * Adds item nodes to the list.
     * @param {ListItem[]} items
     * @param {boolean} preProcess
     */
    async addItemNodes(items, preProcess = true) {
        this.onRenderReady(() => {
            preProcess && items.forEach(item => this?.preProcessNode(item));
            const container = this.itemsNode || this;
            appendNodes(container, items);
        });
    }

    /**
     * Handles the addition of a list item from the list resource.
     * @param {ListItemConfigType[]} items
     * @param {number} batchSize
     */
    addItemsBatched(items = [], batchSize = 36) {
        const totalItems = items.length;
        let currentIndex = 0;
        const processBatch = () => {
            const batch = items.slice(currentIndex, currentIndex + batchSize);
            const itemNodes = /** @type {ListItem[]} */ (batch.map(config => this.createItem(config)));
            this.addItemNodes(itemNodes);
            currentIndex += batchSize;
            currentIndex < totalItems && setTimeout(processBatch);
        };
        processBatch();
    }

    /**
     * Transitions new items into the list.
     * @param {ListItemConfigType[]} items
     * @returns {void}
     */
    transitionNewItems(items) {
        const container = this.getItemsContainer();
        if (!container?.children?.length) return this.addItemsBatched(items);
        const newWrapper = renderNode(this.renderItemsWrapper());
        if (!newWrapper) return this.addItemsBatched(items);
        newWrapper.classList.add('arpaList__items--transitioning');
        /** @type {HTMLElement} */
        this.itemsNode = newWrapper;
        /** @type {HTMLElement | null} */
        this.oldWrapper = container;
        this.oldWrapper.classList.add('arpaList__items--out');
        const newItems = items.map(item => this.createItem(item));
        appendNodes(newWrapper, newItems);
        container.after(newWrapper);
        container.addEventListener('transitionend', this.onTransitionOut);
        container.classList.add('arpaList--itemsOut');
        newWrapper.classList.add('arpaList--itemsIn');
    }

    /**
     * Handles the transition out of the old items wrapper.
     * @param {TransitionEvent} event
     */
    onTransitionOut(event) {
        if (event && event.target === this.oldWrapper && event.target instanceof HTMLElement) {
            event.target?.removeEventListener('transitionend', this.onTransitionOut);
            if (this.oldWrapper) {
                this.oldWrapper.style.display = 'none';
                this.oldWrapper.remove();
            }
            this.oldWrapper = null;
            this.itemsNode?.classList.remove('arpaList--itemsIn', 'arpaList__items--transitioning');
        }
    }

    /**
     * Creates a list item via class instantiation.
     * @param {ListItemConfigType} config
     * @param {Record<string,unknown>} payload
     * @param {Record<string,unknown>} mapping
     * @returns {ListItem | HTMLElement}
     * @throws {Error} If the list item component is not defined.
     */
    createItem(config = {}, payload = this.getDefaultItemPayload(config.id || ''), mapping = {}) {
        if (payload.node instanceof HTMLElement) {
            return payload.node;
        }
        const itemComponent = this._config?.itemComponent;
        if (!itemComponent) {
            throw new Error('List item component not defined.');
        }
        const item = new itemComponent(this.getDefaultItemConfig(config), payload, mapping);
        !this.listResource && this.preProcessNode(item);
        return item;
    }

    /**
     * Returns the default configuration for a list item.
     * @param {ListItemConfigType} config
     * @returns {ListItemConfigType}
     */
    getDefaultItemConfig(config = {}) {
        const renderMode = this.getRenderMode();
        renderMode === 'minimal' && (config.renderMode = 'minimal');
        return config;
    }

    /**
     * Returns the default payload for a list item.
     * @param {string} itemId
     * @returns {Record<string,unknown>}
     */
    getDefaultItemPayload(itemId) {
        return this?.listResource?.getRawItem(itemId) ?? {};
    }

    /**
     * Returns the list items.
     * @returns {ListItemConfigType[]}
     */
    getItems() {
        return (
            this.listResource?.getItems().map((/** @type {ListResourceItemType} */ item) => ({
                ...item,
                id: item.id?.toString()
            })) ??
            this._config.items ??
            []
        );
    }

    getItemsContainer() {
        return this.itemsNode || this;
    }

    /**
     * Returns the list item nodes.
     * @returns {Element[] | null | undefined}
     */
    getItemNodes() {
        return Array.from((this.itemsNode || this)?.children);
    }

    /**
     * Maps a list item.
     * @param {(item: Record<string, unknown>) => ListItemConfigType} callback
     */
    mapItem(callback) {
        this.listResource?.mapItem(callback);
    }

    /**
     * Removes an item from the list.
     * @param {ListItemConfigType} item
     */
    removeItem(item) {
        this?.listResource?.removeItem(item);
    }

    /**
     * Removes items from the list.
     * @param {boolean} sendUpdate
     */
    removeItems(sendUpdate = true) {
        this.listResource?.removeItems(sendUpdate);
    }

    /**
     * Sets the list items.
     * @param {ListItemConfigType[]} items
     * @param {boolean} sendUpdate
     */
    async setItems(items, sendUpdate = false) {
        if (!items?.length) return;
        if (this.listResource) {
            this.listResource?.setItems(items, sendUpdate);
        } else {
            this._config.items = items;
            this._hasRendered && this.renderItems(items);
        }
    }

    // #endregion Resource API

    ///////////////////////////////
    // #region Resource Handlers
    ///////////////////////////////

    /**
     * Handles the list items through the list resource events.
     */
    _handleItems() {
        this.listResource?.on('add_item', this.onResourceAddItem);
        this.listResource?.on('add_items', this.onResourceAddItems);
        this.listResource?.on('remove_items', this.onResourceRemoveItems);
        this.listResource?.on('remove_item', this.onResourceRemoveItem);
        this.listResource?.on('items_updated', this.onResourceItemsUpdated);
        this.listResource?.on('items', this.onResourceSetItems);
        this.listResource?.on('update_item', (/** @type {ListResourceItemType} */ payload) => {
            if (payload?.node?.reRender) {
                payload.node.reRender();
            }
        });
        this.listResource?.on('fetch', this.onResourceFetch);
    }

    onResourceFetch() {
        this.fetchPromise = new Promise(resolve => (this.resolveFetch = resolve));
    }

    /**
     * Handles the addition of a list item from the list resource.
     * @param {ListItemConfigType[]} items
     */
    onResourceAddItems(items = []) {
        this.addItemsBatched(items);
    }

    /**
     * Handles the setting of list items from the list resource.
     * @param {ListItemConfigType[]} items
     */
    async onResourceSetItems(items = []) {
        this.updatePager();
        const hasItemsTransition = this.hasProperty('has-items-transition');
        if (hasItemsTransition) {
            const oldItems = document.querySelectorAll('.arpaList__items--out');
            oldItems.forEach(element => element.remove());
            this.transitionNewItems(items);
        } else {
            this.itemsNode && (this.itemsNode.innerHTML = '');
            this.addItemsBatched(items);
        }
        this.resolveFetch?.(true);
    }

    onResourceItemsUpdated() {
        this.update();
    }

    /**
     * Handles the removal of all list items from the list resource.
     */
    onResourceRemoveItems() {
        this.itemsNode && (this.itemsNode.innerHTML = '');
    }

    /**
     * Handles the addition of a list item from the list resource.
     * @param {ListItemConfigType} payload
     * @param {boolean} unshift
     */
    onResourceAddItem(payload, unshift = false) {
        const node = this.createItem(payload);
        this.addItemNode(node, unshift);
    }

    /**
     * Handles the removal of a list item from the list resource.
     * @param {ListItemConfigType} payload
     * @param {number} index
     */
    onResourceRemoveItem(payload, index) {
        const item = this.itemsNode?.children[index];
        item?.remove();
    }

    // #endregion

    ///////////////////
    // #region Render
    ///////////////////

    getTemplateVars() {
        return {
            pager: this.renderPager(),
            id: this.getId(),
            items: this.renderItemsWrapper()
        };
    }

    _preRender() {
        super._preRender();
        if (this.hasAttribute('title')) {
            this._config.title = this.getAttribute('title');
            this.removeAttribute('title');
        }
    }

    _getTemplate() {
        return this.getRenderMode() === 'minimal' ? this.renderMinimal() : this.renderFull();
    }

    render() {
        super.render();
        this.bodyMainNode = this.querySelector('.arpaList__bodyMain');
        this.itemsNode = (this.getRenderMode() === 'minimal' ? this : this.querySelector('.arpaList__items')) || this;
        this.itemsNode && appendNodes(this.itemsNode, this._childNodes);
        this.renderItems();
        if (this.itemsNode.innerHTML.trim() === '') {
            this.itemsNode.innerHTML = '';
        }
        const initialItems = this._initializeItems();
        this.itemsNode && appendNodes(this.itemsNode, initialItems);
    }

    async _initializeNodes() {
        this._childNodes?.forEach(item => {
            if (item instanceof HTMLElement && item?.tagName?.toLowerCase() === this._config?.itemTag) {
                this.preProcessNode(/** @type {ListItem} */ (item));
            }
        });

        this.noItemsNode = this.querySelector('.arpaList__noItems');
        this.preloader = this.querySelector('.arpaList__preloader');
        this._handleNoItems();
        return true;
    }

    async _handleNoItems() {
        if (this.listResource?.promise) {
            await this.listResource.promise;
        }
        requestAnimationFrame(() => {
            if (!this.getItemCount() && !this.isLoading) {
                this.noItemsNode = this.noItemsNode || renderNode(this.renderChild('noItems'));
                this.bodyMainNode?.appendChild(this.noItemsNode);
            } else if (this.noItemsNode?.isConnected) {
                this.noItemsNode?.remove();
            }
        });
    }

    _initializeItems() {
        /** @type {(ListItem | Node | HTMLElement)[]} */
        this.initialItems = this.getInitialItems() || [];
        const initialItems = this.initialItems;
        const isStatic = this.listResource?.isStatic();
        const resource = this.listResource;
        const perPage = this?.listResource?.getPerPage();

        if (isStatic && perPage && perPage < this.initialItems.length) {
            /** @type {Record<string, unknown>[]} */
            const payload = [];
            this.initialItems.forEach((item, index) => {
                item instanceof HTMLElement && item.remove();
                payload.push({
                    node: item, // @ts-ignore
                    id: item?.id || 'item-' + index
                });
            });
            resource?.setItems(payload);
            return [];
        }

        return initialItems.filter(item => item.parentNode !== this.itemsNode);
    }

    /**
     * Renders the list items.
     * @param {ListItemConfigType[]} items
     * @param {HTMLElement} [container]
     */
    renderItems(items = this.getItems(), container = this.itemsNode) {
        if (!(container instanceof HTMLElement)) {
            console.warn('No items container found.');
            return;
        }
        const $items = items.filter((/** @type {ListResourceItemType} */ item) => {
            return !item?.node?.isConnected;
        });
        appendNodes(
            container,
            $items.map(item => this.createItem(item))
        );
    }

    /**
     * Renders a list with all components.
     * @returns {string}
     */
    renderFull() {
        return html`
            <div class="arpaList__header" zone="header">
                <div class="arpaList__headerTop">{titleWrapper}{headerControls}</div>
            </div>
            {controls} {info} {messages}
            <div class="arpaList__body" zone="body">
                <div class="arpaList__bodyMain">{heading}{items}</div>
                {aside}
            </div>
            {footer}
        `;
    }

    /**
     * Renders a minimal list.
     * @returns {string}
     */
    renderMinimal() {
        return html`{items}`;
    }

    renderItemsWrapper() {
        if (this.getRenderMode() === 'minimal') return '';
        const ariaLabel = processTemplate(this.getProperty('heading'), {}, this);
        return html`<div class="arpaList__items" role="list" ${renderAttr('aria-label', ariaLabel)}></div>`;
    }

    /**
     * Renders a list item.
     * @param {ListItemConfigType} config
     * @returns {string}
     */
    renderItem(config) {
        const component = this.getProperty('item-tag');
        return html`<${component} ${attrString(config)}></${component}>`;
    }

    // #endregion Render

    ////////////////////////////
    // #region Pager
    ////////////////////////////

    renderPager() {
        if (!this.hasPager() || !this.hasResource()) return '';
        return html`<arpa-pager
            id="${this.id}-listPager"
            class="arpaList__pager"
            max-nodes="${this.getProperty('max-pager-nodes')}"
            total-pages="${this.listResource?.getTotalPages()}"
            current-page="${this.listResource?.getCurrentPage()}"
            url-param="${this.getParamName('page')}"
        ></arpa-pager>`;
    }

    /**
     * Updates the pager.
     * @param {Pager | null} node
     */
    updatePager(node = this.querySelector('arpa-pager')) {
        const currentPage = this.listResource?.getCurrentPage() || 1;
        const totalPages = this.listResource?.getTotalPages() || 1;
        node?.setPager(currentPage, totalPages);
    }

    _initializePager() {
        /** @type {Pager | null} */
        this.pagerNode = this.querySelector('arpa-pager');
        this.pagerNode?.onChange(this.onPagerChange);
    }

    /**
     * Handles the pager change event.
     * @param {import('@arpadroid/ui').PagerCallbackPayloadType} _payload
     */
    onPagerChange(_payload) {
        this.resetScroll();
    }

    // #endregion Pager

    /////////////////////////
    // #region Lifecycle
    /////////////////////////

    _handlePreloading() {
        const hasPreloader = this.hasProperty('has-preloader');
        if (!hasPreloader) return;
        this.listResource?.on('fetch', async () => {
            this.isLoading = true;
            this.preloader = this.preloader || renderNode(this.renderChild('preloader'));
            this.classList.add('arpaList--loading');
            if (this.preloader?.isConnected) return;
            this.preloader && this.bodyMainNode?.appendChild(this.preloader);
        });

        this.listResource?.on('ready', () => {
            this.preloader?.isConnected && this.preloader.remove();
            this.classList.remove('arpaList--loading');
            this.isLoading = false;
        });
    }

    _onDestroy() {
        this?.listResource?.destroy();
    }
    // #endregion Lifecycle
}

defineCustomElement('arpa-list', List);

export default List;
