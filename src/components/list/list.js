/**
 * @typedef {import('@arpadroid/resources').ListResourceItemType} ListResourceItemType
 * @typedef {import('@arpadroid/ui').Pager} Pager
 * @typedef {import('@arpadroid/ui').ArpaElementTemplateType} ArpaElementTemplateType
 * @typedef {import('./list.types').ListConfigType} ListConfigType
 * @typedef {import('../listItem/listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('../listItem/listItem.types').ListItemImageSizeType} ListItemImageSizeType
 */

import { ArpaElement, getTemplateAttributes } from '@arpadroid/ui';
import { ListResource, getResource } from '@arpadroid/resources';
import { mergeObjects, appendNodes, defineCustomElement } from '@arpadroid/tools';
import { renderNode, attrString, bind, attr } from '@arpadroid/tools';
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

    $preInitialize() {
        bind(this, 'onResourceAddItem', 'onResourceRemoveItem', 'onResourceRemoveItems', '_initializeList');
        bind(this, 'onResourceItemsUpdated', 'onResourceSetItems', 'onResourceAddItems', 'onResourceFetch');
        bind(this, 'onTransitionOut', 'onPagerChange');
    }

    $initialize() {
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
        const url = this.getProp('url');
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
        const namespace = this.getProp('paramNamespace');
        return namespace + this.getProp(`${param}Param`);
    }

    instantiateResource(id = this.getProp('id'), userConfig = {}) {
        const resource = getResource(id);
        if (resource) return resource;
        const config = mergeObjects(
            {
                id,
                controls: [],
                pageParam: this.getParamName('page'),
                searchParam: this.getParamName('search'),
                perPageParam: this.getParamName('perPage'),
                sortByParam: this.getParamName('sortBy'),
                sortDirParam: this.getParamName('sortDir'),
                itemsPerPage: this.getProp('itemsPerPage'),
                mapItemId: this._config?.mapItemId,
                itemIdMap: this.getProp('itemIdMap'),
                listComponent: this,
                url: this.getProp('url')
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
        return this._config;
    }

    getNodesConfig() {
        return {
            preloader: { tag: 'circular-spinner', canRender: 'has-preloader' }
        };
    }

    /**
     * Returns the default configuration for this component.
     * @returns {ListConfigType}
     */
    getDefaultConfig() {
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
            nodesConfig: this.getNodesConfig()
        };
        return mergeObjects(super.getDefaultConfig(), conf);
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
        return Boolean(this.hasResource() && this.hasProp('hasPager'));
    }

    /**
     * Returns true if the list has a resource.
     * The list resource manages the list items, pagination and filtering.
     * @returns {boolean}
     */
    hasResource() {
        return Boolean(this.hasProp('url') || this.hasProp('has-resource'));
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

    getItemCount() {
        const items = this.getItems();
        const nodes = this.getItemNodes();
        return items?.length || nodes?.length || 0;
    }

    /**
     * Returns the render mode.
     * @returns {string}
     */
    getRenderMode() {
        return this.getProp('render-mode');
    }

    /**
     * Returns the content node.
     * @returns {HTMLElement}
     */
    getContentNode() {
        return /** @type {HTMLElement} */ (this.getRenderMode() === 'minimal' ? this : this.nodes.items);
    }

    getLazyLoadImages() {
        return this.getProp('lazy-load-images');
    }

    // #endregion get

    /////////////////
    // #region Set
    ////////////////

    /**
     * Scrolls list to the top.
     */
    resetScroll() {
        this.hasProp('resetScrollOnLoad') && this.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            // @ts-ignore --- IGNORE ---
            callback && this.listResource?.setPreProcessNode(callback);
        } else {
            this._config.preProcessNode = callback;
        }
    }

    /**
     * Preprocess a list item node.
     * @param {ListItem | undefined} node
     * @returns {ListResourceItemType | undefined}
     */
    preProcessNode(node) {
        if (!node) return;
        const itemTemplate = this.getItemTemplate();
        const itemAttributes = itemTemplate && getTemplateAttributes(itemTemplate);
        itemAttributes && attr(node, itemAttributes, false);
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
     * @param {import('@arpadroid/ui').ArpaElementContentNodeType} [container]
     */
    async addItemNode(item, unshift = false, container = this.nodes.items || this) {
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
            const container = this.getContentNode() || this;
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
        const container = /** @type {HTMLElement | null} */ (this.getContentNode());
        if (!container?.children?.length) return this.addItemsBatched(items);
        const newWrapper = /** @type {HTMLElement } */ (this.renderNode('items'));
        if (!newWrapper) return this.addItemsBatched(items);
        newWrapper.classList?.add('arpaList__items--transitioning');
        /** @type {HTMLElement} */
        this.itemsNode = newWrapper;
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

    /**
     * Returns the list item nodes.
     * @returns {Element[] | null | undefined}
     */
    getItemNodes() {
        return Array.from((this.nodes.items || this.getContentNode() || this)?.children);
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
     * @returns {Promise<boolean | void>}
     */
    async setItems(items, sendUpdate = false) {
        await this.promise;
        if (!items?.length) return;
        if (this.listResource) {
            await this.listResource?.setItems(items, sendUpdate);
        } else {
            this.renderItems(items);
        }
        return true;
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
        this.listResource?.on('update_item', payload => payload?.node?.reRender?.());
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
        const hasItemsTransition = this.hasProp('has-items-transition');
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

    _preRender() {
        super._preRender();
        if (this.hasAttribute('title')) {
            this._config.title = this.getAttribute('title');
            this.removeAttribute('title');
        }
    }

    $renderTemplate() {
        if (this.getRenderMode() === 'minimal') {
            return '{items}';
        }
        return html`
            <arpa-node name="header">
                <arpa-node name="headerTop">
                    <arpa-node name="titleWrapper" tag="h2" has-zone="false" can-render="titleIcon || title">
                        <arpa-node name="titleIcon" tag="arpa-icon"></arpa-node>
                        <arpa-node name="title" tag="span"></arpa-node>
                    </arpa-node>
                    {headerControls}
                </arpa-node>
            </arpa-node>
            <arpa-node name="body">
                <arpa-node name="bodyMain">
                    <arpa-node name="heading"></arpa-node>
                    <arpa-node name="items" role="list" aria-label="{heading}" must-render is-content></arpa-node>
                    <arpa-node name="noItems" defer="shouldRenderNoItems">
                        <arpa-node name="noItemsIcon" tag="arpa-icon"></arpa-node>
                        <arpa-node name="noItemsContent" tag="span"></arpa-node>
                    </arpa-node>
                    <!-- <arpa-node name="preloader" tag="circular-spinner" can-render="hasPreloader"> </arpa-node> -->
                </arpa-node>
                <arpa-node name="aside"></arpa-node>
            </arpa-node>
            <arpa-node name="footer" can-render="hasPager()">
                <arpa-node
                    name="pager"
                    tag="arpa-pager"
                    can-render="hasPager()"
                    id="${this.id}-listPager"
                    has-arrow-controls
                    max-nodes="${this.getProp('max-pager-nodes')}"
                    total-pages="${this.listResource?.getTotalPages()}"
                    current-page="${this.listResource?.getCurrentPage()}"
                    url-param="${this.getParamName('page')}"
                ></arpa-node>
            </arpa-node>
        `;
    }

    async shouldRenderNoItems() {
        return this.getItemCount() < 1;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.bodyMainNode = this.nodes.bodyMain;
        const renderMode = this.getRenderMode();
        const isMinimal = renderMode === 'minimal';
        this.itemsNode = /** @type {HTMLElement} */ (isMinimal ? this : this.nodes.items || this);
        this.noItemsNode = this.nodes.noItems;
        this.preloader = this.querySelector('.arpaList__preloader');
        this._handlePreloading();
        return true;
    }

    /**
     * Renders the list items.
     * @param {ListItemConfigType[]} items
     * @param {import('@arpadroid/ui').ArpaElementContentNodeType} [container]
     */
    renderItems(items = this.getItems(), container = this.nodes.items || this) {
        appendNodes(
            container,
            items.filter(item => !item?.node?.isConnected).map(item => this.createItem(item))
        );
    }

    /**
     * Renders a list item.
     * @param {ListItemConfigType} config
     * @returns {string}
     */
    renderItem(config) {
        const component = this.getProp('item-tag');
        return html`<${component} ${attrString(config)}></${component}>`;
    }

    // #endregion Render

    ////////////////////////////
    // #region Pager
    ////////////////////////////

    /**
     * Updates the pager.
     * @param {Pager | null} node
     */
    updatePager(node = this.querySelector('arpa-pager')) {
        const currentPage = this.listResource?.getCurrentPage() || 1;
        const totalPages = this.listResource?.getTotalPages() || 1;
        node?.setPager(currentPage, totalPages);
    }

    /**
     * @param {number} page - The page number to navigate to.
     */
    setPage(page) {
        this.listResource?.goToPage(Number(page));
    }

    _initializePager() {
        /** @type {Pager | null} */
        this.pagerNode = this.querySelector('arpa-pager');
        this.pagerNode?.onChange(this.onPagerChange);
    }

    /**
     * Handles the pager change event.
     * @param {import('@arpadroid/ui').PagerCallbackPayloadType} payload
     */
    onPagerChange(payload) {
        if (payload.page) {
            this.resetScroll();
            this.listResource?.goToPage(Number(payload.page));
        }
    }

    // #endregion Pager

    /////////////////////////
    // #region Lifecycle
    /////////////////////////

    _handlePreloading() {
        const hasPreloader = this.hasProp('hasPreloader');
        if (!hasPreloader) return;
        this.listResource?.on('fetch', async () => {
            this.isLoading = true;
            this.preloader = this.nodes.preloader || renderNode(this.renderChild('preloader'));
            this.classList.add('arpaList--loading');
            if (this.preloader?.isConnected) return;
            this.preloader && this.bodyMainNode?.appendChild(this.preloader);
        });
        this.listResource?.on('ready', async () => {
            this.nodes.preloader?.isConnected && this.nodes.preloader.remove();
            this.classList.remove('arpaList--loading');
            this.isLoading = false;
        });
    }

    $onDestroy() {
        this?.listResource?.destroy();
    }
    // #endregion Lifecycle
}

defineCustomElement('arpa-list', List);

export default List;
