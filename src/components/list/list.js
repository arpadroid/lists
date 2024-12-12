/**
 * @typedef {import('../listItem/listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('../../../../types').AbstractContentInterface} AbstractContentInterface
 * @typedef {import('@arpadroid/ui').Pager} Pager
 * @typedef {import('@arpadroid/resources/dist/arpadroid-resources.js').ListResource} ListResource
 */

import { I18nTool } from '@arpadroid/i18n';
import { Context } from '@arpadroid/application';
import { ArpaElement } from '@arpadroid/ui';
import { ListResource, getResource } from '@arpadroid/resources';
import ListControls from '../listControls/listControls.js';
import { mergeObjects, editURL, appendNodes, processTemplate } from '@arpadroid/tools';
import { renderNode, renderAttr, attrString, bind, ucFirst } from '@arpadroid/tools';
import ListItem from '../listItem/listItem.js';

const html = String.raw;
class List extends ArpaElement {
    isSearchInitialized = false;

    /////////////////////////
    // #region Initialization
    //////////////////////////

    _preInitialize() {
        bind(this, 'onResourceAddItem', 'onResourceRemoveItem', 'onResourceRemoveItems', '_initializeList');
        bind(this, 'onResourceItemsUpdated', 'onResourceSetItems', 'onResourceAddItems', 'onResourceFetch');
        bind(this, 'onTransitionOut');
        this.itemTemplate = this.getItemTemplate();
        this.itemTemplate?.remove();
    }

    getItemTemplate() {
        return this.itemTemplate || this.querySelector(':scope > template[template-id="list-item-template"]');
    }

    _initialize() {
        this._initializeListResource();
        this.classList.add('arpaList');
    }

    _initializeListResource() {
        /** @type {ListResource} */
        this.listResource = this.getResource();
        if (this.listResource) {
            this.listResource.on('payload', this._initializeList);
            this._handleItems();
            this._handlePreloading();
            const url = this.getProperty('url');
            if (url) {
                this.listResource.setUrl(url);
                this.removeAttribute('url');
            }
        }
    }

    getResource() {
        return (
            this.listResource ??
            this._config.listResource ??
            ((this.hasResource() && this.instantiateResource()) || undefined)
        );
    }

    getParamName($param) {
        const namespace = this.getProperty('param-namespace');
        return namespace + this.getProperty(`${$param}-param`);
    }

    instantiateResource(id = this.getId()) {
        return (
            getResource(id) ||
            new ListResource({
                id,
                pageParam: this.getParamName('page'),
                searchParam: this.getParamName('search'),
                perPageParam: this.getParamName('perPage'),
                sortByParam: this.getParamName('sortBy'),
                sortDirParam: this.getParamName('sortDir'),
                itemsPerPage: this.getProperty('items-per-page'),
                mapItemId: this._config.mapItemId,
                listComponent: this,
                url: this.getProperty('url')
            })
        );
    }

    _initializeList() {
        this.resetScroll();
        this._initializePager();
    }

    /**
     * Sets the configuration for the component.
     * @param {ListInterface} config
     * @returns {ListInterface}
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

    /**
     * Returns the default configuration for this component.
     * @param {ListInterface} config
     * @returns {ListInterface}
     */
    getDefaultConfig(config = {}) {
        return mergeObjects(
            super.getDefaultConfig({
                allControls: false,
                canCollapse: false,
                defaultView: 'list',
                paramNamespace: '',
                hasControls: undefined,
                hasInfo: false,
                hasMiniSearch: true,
                hasPager: false,
                hasResource: false,
                hasSelection: false,
                hasPreloader: true,
                hasItemsTransition: false,
                hasStickyFilters: false,
                controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
                isCollapsed: false,
                itemComponent: ListItem,
                items: [],
                itemsPerPage: 50,
                itemTag: 'list-item',
                lazyLoadImages: 'auto',
                noItemsContent: html`<i18n-text key="lists.list.txtNoItemsFound"></i18n-text>`,
                noItemsIcon: 'info',
                pageParam: 'page',
                perPageParam: 'perPage',
                renderMode: 'full',
                resetScrollOnLoad: false,
                searchParam: 'search',
                showResultsText: true,
                sortByParam: 'sortBy',
                sortDefault: undefined,
                sortDirParam: 'sortDir',
                mapItemId: undefined,
                sortOptions: [],
                template: List.template,
                title: ''
            }),
            config
        );
    }

    // #endregion

    /////////////////////////
    // #region has
    /////////////////////////

    /**
     * Returns true if the list has any controls enabled.
     * @returns {boolean}
     */
    hasControls() {
        return this._config.hasControls !== false && (this.hasZone('controls') || !this.hasHeaderControls());
    }

    hasPreloader() {
        return this.hasProperty('has-preloader');
    }

    hasControl(control) {
        return this.getControls()?.includes(control);
    }

    getControls() {
        return this.getArrayProperty('controls');
    }

    /**
     * Returns true if all list controls are enabled.
     * @returns {boolean}
     */
    hasAllControls() {
        return this.hasProperty('all-controls');
    }

    /**
     * True if the list has any footer content.
     * @returns {boolean}
     */
    hasFooter() {
        return this.hasProperty('has-footer') || this.hasZone('footer') || this.hasPager();
    }

    /**
     * Returns true if the list has an info component which displays information about the list and item range.
     * It also contains additional list controls.
     * @returns {boolean}
     */
    hasInfo() {
        return this.hasProperty('has-info');
    }

    /**
     * Returns true if the list has a search component.
     * @returns {boolean}
     */
    hasSearch() {
        return this._config.controls?.includes('search');
    }

    /**
     * Returns true if the list has a multi-select component for batch item operations.
     * @returns {boolean}
     */
    hasMultiSelect() {
        return this.hasProperty('has-selection');
    }

    /**
     * Returns true if the list has a pager component.
     * @returns {boolean}
     */
    hasPager() {
        return this.hasResource() || this.hasProperty('has-pager');
    }

    /**
     * Returns true if the list has a resource.
     * The list resource manages the list items, pagination and filtering.
     * @returns {boolean}
     */
    hasResource() {
        return this.hasProperty('url') || this.hasProperty('has-resource');
    }

    /**
     * Returns true if the list has sticky controls and pagination.
     * @returns {boolean}
     */
    hasStickyControls() {
        return this.hasProperty('sticky-controls');
    }

    hasNoItemsContent() {
        return Boolean(this.getNoItemsContent() || this.hasZone('no-items'));
    }

    // #endregion

    /////////////////////////////
    // #region get
    /////////////////////////////

    /**
     * Returns the component id.
     * @returns {string}
     */
    getId() {
        return this.getProperty('id');
    }

    getDefaultView() {
        return this.getProperty('default-view');
    }

    getItemCount() {
        return this.getItems()?.length;
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
     * Returns the different options by which the list items can be sorted.
     * @returns {Record<string,unknown>[]}
     * @todo - Implement FieldOptionInterface as return type.
     * Have to sort out the forms library types first.
     */
    getSortOptions() {
        return this.getProperty('sort-options');
    }

    /**
     * Gets the list items that are initially added to the DOM.
     * @returns {ListItem[]}
     */
    getInitialItems() {
        const itemTagName = this.getProperty('item-tag');
        return (
            this._childNodes.filter(node => {
                return node?.tagName?.toLowerCase() === itemTagName;
            }) || []
        );
    }

    getNoItemsContent() {
        return this.getProperty('no-items-content');
    }

    /**
     * Returns the default sort option value.
     * @returns {string}
     */
    getSortDefault() {
        return this.getProperty('sort-default');
    }

    getChildren() {
        return this.itemsNode?.children ?? [];
    }

    getLazyLoadImages() {
        return this.getProperty('lazy-load-images');
    }

    //////////////////////
    // #endregion get
    /////////////////////

    /////////////////////////
    // #region set
    /////////////////////////

    /**
     * Sets the sort options for the list.
     * @param {Record<string,unknown>[]} options
     * @param {string} defaultValue
     * @todo - Implement FieldOptionInterface as parameter type.
     */
    async setSortOptions(options, defaultValue = null) {
        this._config.sortOptions = options;
        this._config.sortDefault = defaultValue;
        const listSort = this.controls?.search?.listSort;
        const sortField = listSort?.selectField;
        sortField?.setOptions(options, defaultValue);
    }

    /**
     * Scrolls list to the top.
     */
    resetScroll() {
        const { resetScrollOnLoad } = this._config;
        resetScrollOnLoad && this.node?.scrollIntoView({});
    }

    /////////////////////////
    // #endregion set
    /////////////////////////

    ////////////////////////
    // #region Resource API
    ///////////////////////

    /**
     * Sets the list items and deletes existing ones.
     * @param {ListItemInterface[]} items
     */
    setList(items) {
        this.listResource.setItems(items);
    }

    setListResource(listResource) {
        /** @type {ListResource} */
        this.listResource = listResource;
    }

    /**
     * Preprocess a list item node.
     * @param {(node: ListItem) => void} callback
     */
    setPreProcessNode(callback) {
        if (this.listResource) {
            this.listResource?.setPreProcessNode(callback);
        } else {
            this._config.preProcessNode = callback;
        }
    }

    preProcessNode(node) {
        const { preProcessNode } = this._config;
        return typeof preProcessNode === 'function' && preProcessNode(node);
    }

    /**
     * Adds an item to the list.
     * @param {ListItemInterface} item
     * @returns {ListItem | ListItemInterface}
     */
    addItem(item) {
        return this.listResource ? this.listResource.addItem(item) : this.appendChild(this.createItem(item));
    }

    async addItemNode(item, unshift = false, container = this.itemsNode) {
        unshift ? container?.prepend(item) : container?.appendChild(item);
    }

    /**
     * Adds items to the list.
     * @param {ListItemInterface[]} itemsPayload
     * @returns {ListItem[] | ListItemInterface[] | void}
     */
    addItems(itemsPayload) {
        if (this.listResource) return this.listResource?.addItems(itemsPayload);
        if (this.itemsNode) {
            return appendNodes(
                this.itemsNode,
                itemsPayload.map(item => this.createItem(item))
            );
        } else {
            this._config.items = this._config.items.concat(itemsPayload);
        }
    }

    /**
     * Adds item nodes to the list.
     * @param {HTMLElement[]} items
     */
    async addItemNodes(items) {
        const container = this.itemsNode || this;
        appendNodes(container, items);
    }

    /**
     * Handles the addition of a list item from the list resource.
     * @param {ListItemInterface[]} items
     * @param {number} batchSize
     */
    addItemsBatched(items = [], batchSize = 36) {
        const totalItems = items.length;
        let currentIndex = 0;
        const processBatch = () => {
            const batch = items.slice(currentIndex, currentIndex + batchSize);
            const itemNodes = batch.map(config => this.createItem(config));
            this.addItemNodes(itemNodes);
            currentIndex += batchSize;
            currentIndex < totalItems && setTimeout(processBatch);
        };
        processBatch();
    }

    /**
     * Transitions new items into the list.
     * @param {ListItemInterface[]} items
     * @returns {void}
     */
    transitionNewItems(items) {
        const container = this.getItemsContainer();
        if (!container?.children?.length) return this.addItemsBatched(items);

        const newWrapper = renderNode(this.renderItemsWrapper());
        if (!newWrapper) return this.addItemsBatched(items);
        newWrapper.classList.add('arpaList__items--transitioning');
        this.itemsNode = newWrapper;
        this.oldWrapper = container;

        const newItems = items.map(item => this.createItem(item));
        appendNodes(newWrapper, newItems);
        container.after(newWrapper);

        container.addEventListener('transitionend', this.onTransitionOut);
        container.classList.add('arpaList--itemsOut');

        setTimeout(() => newWrapper.classList.add('arpaList--itemsIn'), 5);
    }

    onTransitionOut(event) {
        if (event.target === this.oldWrapper) {
            event.target.removeEventListener('transitionend', this.onTransitionOut);
            this.oldWrapper.style.display = 'none';
            this.oldWrapper.remove();
            this.oldWrapper = null;
            this.itemsNode.classList.remove('arpaList--itemsIn', 'arpaList__items--transitioning');
        }
    }

    /**
     * Creates a list item via class instantiation.
     * @param {ListItemInterface | ListItem} config
     * @param {Record<string,unknown>} payload
     * @param {Record<string,unknown>} mapping
     * @returns {ListItem}
     */
    createItem(config = {}, payload = this.getDefaultItemPayload(config.id), mapping = {}) {
        const { itemComponent } = this._config;
        const item = new itemComponent(config, payload, mapping);
        !this.listResource && this.preProcessNode(item);
        return item;
    }

    getDefaultItemPayload(itemId) {
        return this?.listResource?.getRawItem(itemId) ?? {};
    }

    /**
     * Returns the list items.
     * @returns {ListItemInterface[]}
     */
    getItems() {
        return this.listResource?.getItems() ?? this._config.items;
    }

    getItemsContainer() {
        return this.itemsNode || this;
    }

    /**
     * Returns the list item nodes.
     * @returns {HTMLElement[]}
     */
    getItemNodes() {
        return Array.from((this.itemsNode || this)?.children);
    }

    /**
     * Maps a list item.
     * @param {(item: Record<string, unknown>) => ListItemInterface} callback
     */
    mapItem(callback) {
        this.listResource?.mapItem(callback);
    }

    /**
     * Removes an item from the list.
     * @param {ListItemInterface} item
     * @returns {ListItem}
     */
    removeItem(item) {
        return this?.listResource?.removeItem(item);
    }

    /**
     * Removes items from the list.
     * @param {ListItemInterface[]} items
     */
    removeItems(items) {
        this.listResource?.removeItems(items);
    }

    /**
     * Sets the list items.
     * @param {ListItemInterface[]} items
     */
    async setItems(items) {
        if (!items?.length) {
            return;
        }
        if (this.listResource) {
            this.listResource?.setItems(items);
        } else {
            this._config.items = items;
            this._hasRendered && this.renderItems(items);
        }
    }

    // #endregion Resource API

    /////////////////////////////
    // #region Resource Handlers
    /////////////////////////////

    /**
     * Handles the list items through the list resource events.
     */
    _handleItems() {
        this.listResource.on('add_item', this.onResourceAddItem);
        this.listResource.on('add_items', this.onResourceAddItems);
        this.listResource.on('remove_items', this.onResourceRemoveItems);
        this.listResource.on('remove_item', this.onResourceRemoveItem);
        this.listResource.on('items_updated', this.onResourceItemsUpdated);
        // this.listResource.on('set_items', this.onResourceSetItems);
        this.listResource.on('items', this.onResourceSetItems);
        this.listResource.on('update_item', payload => payload?.node?.reRender());
        this.listResource.on('fetch', this.onResourceFetch);
    }

    onResourceFetch() {
        this.fetchPromise = new Promise(resolve => (this.resolveFetch = resolve));
    }

    /**
     * Handles the addition of a list item from the list resource.
     * @param {ListItemInterface[]} items
     */
    onResourceAddItems(items = []) {
        this.addItemsBatched(items);
    }

    async onResourceSetItems(items = []) {
        this.updatePager();
        const hasItemsTransition = this.hasProperty('has-items-transition');
        if (hasItemsTransition) {
            this.transitionNewItems(items);
        } else {
            this.itemsNode && (this.itemsNode.innerHTML = '');
            this.addItemsBatched(items);
        }

        this.resolveFetch?.();
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
     * @param {ListItemInterface} payload
     * @param {boolean} unshift
     */
    onResourceAddItem(payload, unshift = false) {
        const node = this.createItem(payload);
        this.addItemNode(node, unshift);
    }

    /**
     * Handles the removal of a list item from the list resource.
     * @param {ListItemInterface} payload
     * @param {number} index
     */
    onResourceRemoveItem(payload, index) {
        const item = this.itemsNode?.children[index];
        item?.remove();
    }

    // #endregion

    /////////////////////////
    // #region RENDER
    ////////////////////////

    getTemplateVars() {
        return {
            aside: this.renderAside(),
            controls: this.renderControls(),
            headerControls: this.renderHeaderControls(),
            footer: this.renderFooter(),
            heading: this.renderHeading(),
            id: this.getId(),
            info: this.renderInfo(),
            items: this.renderItemsWrapper(),
            noItemsContent: this.getNoItemsContent(),
            noItemsIcon: this.getProperty('no-items-icon'),
            pager: this.renderPager(),
            title: this.renderTitle(),
            preloader: this.renderPreloader()
        };
    }

    render() {
        if (this.hasAttribute('title')) {
            this._config.title = this.getAttribute('title');
            this.removeAttribute('title');
        }
        const renderMode = this.getRenderMode();
        const template = renderMode === 'minimal' ? this.renderMinimal() : this.renderFull();
        this.innerHTML = processTemplate(template, this.getTemplateVars());
        this.bodyMainNode = this.querySelector('.arpaList__bodyMain');
        this.itemsNode = renderMode === 'minimal' ? this : this.querySelector('.arpaList__items');
        appendNodes(this.itemsNode, this._childNodes);
        this.renderItems();
        appendNodes(this.itemsNode, this.getInitialItems());
    }

    renderPreloader() {
        return this.hasPreloader() ? html`<circular-preloader class="arpaList__preloader"></circular-preloader>` : '';
    }

    /**
     * Renders the list items.
     * @param {ListItemInterface[]} items
     * @param {HTMLElement} container
     */
    renderItems(items = this.getItems(), container = this.itemsNode) {
        appendNodes(
            container,
            items.map(item => this.createItem(item))
        );
    }

    /**
     * Renders a list with all components.
     * @returns {string}
     */
    renderFull() {
        return html`
            <div class="arpaList__header">{title}{headerControls}</div>
            {controls} {info}
            <div class="arpaList__body">
                <div class="arpaList__bodyMain">{heading}{items}{preloader}</div>
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

    renderInfo() {
        if (!this.hasInfo()) return '';
        return html`<list-info
            zone="list-info"
            ${attrString({
                'txt-all-results': this.getProperty('txt-all-results'),
                'txt-search-results': this.getProperty('txt-search-results'),
                'txt-no-results': this.getProperty('txt-no-results')
            })}
        ></list-info>`;
    }

    hasHeaderControls() {
        return this.getControls()?.length === 1;
    }

    renderHeaderControls() {
        if (!this.hasHeaderControls()) return '';
        const control = this.getArrayProperty('controls')[0];
        const fn = `render${ucFirst(control)}`;
        if (typeof ListControls.prototype[fn] === 'function') return ListControls.prototype[fn]();
    }

    renderControls() {
        if (!this.hasControls()) return '';
        const controls = this.getArrayProperty('controls');
        return html`<list-controls zone="controls" controls="${controls.toString()}"></list-controls>`;
    }

    renderTitle(title = this.getTitle()) {
        if (!title && !this.hasZone('title')) return '';
        return html`<h2 class="arpaList__title" zone="title">${title}</h2>`;
    }

    renderHeading() {
        const headingText = this.getProperty('heading');
        if (!headingText) return '';
        return html`<div class="arpaList__heading">${headingText}</div>`;
    }

    renderItemsWrapper() {
        if (this.getRenderMode() === 'minimal') return '';
        const ariaLabel = I18nTool.processTemplate(this.getProperty('heading'), {}, 'text');
        return html`<div class="arpaList__items" role="list" ${renderAttr('aria-label', ariaLabel)}></div>`;
    }

    renderItem(config) {
        const component = this.getProperty('item-tag');
        return html`<${component} ${attrString(config)}></${component}>`;
    }

    renderAside() {
        return html`<div class="arpaList__aside" zone="aside"></div>`;
    }

    renderFooter() {
        return this.hasFooter() ? html`<div class="arpaList__footer">${this.renderPager()}</div>` : '';
    }

    renderNoItemsContent(items = this.getItems()) {
        if (!this.hasNoItemsContent() || !items?.length) return '';
        return html`<div class="arpaList__noItems">
            <arpa-icon>${this.getProperty('no-items-icon')}</arpa-icon>
            <div class="arpaList__noItemsText">${this.getNoItemsContent()}</div>
        </div>`;
    }

    //////////////////////////////
    // #endregion RENDER
    //////////////////////////////

    ////////////////////////////
    // #region Pager
    ////////////////////////////

    renderPager() {
        if (!this.hasPager() || !this.hasResource()) return '';
        return html`<arpa-pager
            id="${this.id}-listPager"
            class="arpaList__pager"
            total-pages="${this.listResource?.getTotalPages()}"
            current-page="${this.listResource?.getCurrentPage()}"
            url-param="${this.getParamName('page')}"
        ></arpa-pager>`;
    }

    /**
     * Updates the pager.
     * @param {Pager} node
     */
    updatePager(node = this.querySelector('arpa-pager')) {
        node?.setPager(this.listResource?.getCurrentPage(), this.listResource?.getTotalPages());
    }

    _initializePager() {
        this.pagerNode = this.querySelector('arpa-pager');
        this.pagerNode?.onChange(({ page }) => {
            const newURL = editURL(window.location.href, { [this.getParamName('page')]: page });
            Context.Router.go(newURL);
        });
    }
    ////////////////////////////
    // #endregion Pager
    ////////////////////////////

    /////////////////////////
    // #region Lifecycle
    /////////////////////////

    _initializeNodes() {
        this.controls = this.querySelector('list-controls');
        this.noItemsNode = this.querySelector('.arpaList__noItems');
        this.preloader = this.querySelector('.arpaList__preloader');
    }

    update() {
        this.onRenderReady(() => {
            if (!this.getItems()?.length && !this.isLoading) {
                this.noItemsNode = this.noItemsNode || renderNode(this.renderNoItemsContent());
                this.noItemsNode && this.bodyMainNode?.appendChild(this.noItemsNode);
            } else if (this.noItemsNode?.isConnected) {
                this.noItemsNode?.remove();
            }
        });
    }

    _handlePreloading() {
        this.listResource?.on('fetch', async () => {
            this.isLoading = true;
            this.classList.add('arpaList--loading');
        });

        this.listResource?.on('ready', () => {
            this.classList.remove('arpaList--loading');
            this.isLoading = false;
        });
    }

    _onDestroy() {
        this?.listResource?.destroy();
    }
    /////////////////////////
    // #endregion Lifecycle
    /////////////////////////
}

customElements.define('arpa-list', List);

export default List;
