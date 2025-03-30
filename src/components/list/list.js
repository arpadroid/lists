/**
 * @typedef {import('./list.types').ListConfigType} ListConfigType
 * @typedef {import('../listItem/listItem.types').ListItemConfigType} ListItemConfigType
 * @typedef {import('@arpadroid/resources').ListResourceItemType} ListResourceItemType
 * @typedef {import('@arpadroid/ui').Pager} Pager
 * @typedef {import('@arpadroid/services').Router} Router
 * @typedef {import('../listItem/listItem.types').ListItemImageSizeType} ListItemImageSizeType
 * @typedef {import('../listSort/listSort.js').default} ListSort
 * @typedef {import('@arpadroid/forms').FieldOptionConfigType} FieldOptionConfigType
 */

import { ArpaElement } from '@arpadroid/ui';
import { ListResource, getResource } from '@arpadroid/resources';
import ListControls from '../listControls/listControls.js';
import { mergeObjects, appendNodes, processTemplate, editURL, defineCustomElement } from '@arpadroid/tools';
import { renderNode, renderAttr, attrString, bind, ucFirst } from '@arpadroid/tools';
import ListItem from '../listItem/listItem.js';
import { getService } from '@arpadroid/context';

const html = String.raw;

class List extends ArpaElement {
    /** @type {ListConfigType} */
    _config = this._config;
    isSearchInitialized = false;

    /////////////////////////
    // #region Initialization
    //////////////////////////

    _preInitialize() {
        /** @type {ListItemImageSizeType} */
        this.itemImageDimensions = this.itemImageDimensions;
        bind(this, 'onResourceAddItem', 'onResourceRemoveItem', 'onResourceRemoveItems', '_initializeList');
        bind(this, 'onResourceItemsUpdated', 'onResourceSetItems', 'onResourceAddItems', 'onResourceFetch');
        bind(this, 'onTransitionOut');
        /** @type {HTMLTemplateElement | null} */
        this.itemTemplate = this.getItemTemplate();
        this.itemTemplate?.remove();
    }

    /**
     * Returns the list item template.
     * @returns {HTMLTemplateElement | null}
     */
    getItemTemplate() {
        return this.itemTemplate || this.querySelector(':scope > template[template-id="list-item-template"]');
    }

    _initialize() {
        this._initializeListResource();
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
                mapItemId: this._config?.mapItemId,
                itemIdMap: this.getProperty('item-id-map'),
                listComponent: this,
                url: this.getProperty('url'),
                router: this.router
            })
        );
    }

    _initializeList() {
        this.resetScroll();
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
        if (this.hasResource()) {
            /** @type {Router} */
            this.router = this.getRouter();
        }
        return this._config;
    }

    _initializeZoneSelector() {
        const itemTag = this._config?.itemTag || 'list-item';
        !this._config?.zoneSelector && (this._config.zoneSelector = `zone:not(${itemTag} zone)`);
    }

    /**
     * Returns the default configuration for this component.
     * @param {ListConfigType} config
     * @returns {ListConfigType}
     */
    getDefaultConfig(config = {}) {
        const conf = {
            canCollapse: false,
            className: 'arpaList',
            defaultView: 'list',
            paramNamespace: '',
            hasControls: undefined,
            hasInfo: false,
            hasMiniSearch: true,
            hasPager: false,
            hasResource: false,
            hasPreloader: true,
            hasItemsTransition: false,
            controls: ['search', 'sort', 'views', 'multiselect', 'filters'],
            imageSize: 'list',
            isCollapsed: false,
            itemComponent: ListItem,
            items: [],
            itemsPerPage: 50,
            itemTag: 'list-item',
            itemIdMap: 'id',
            lazyLoadImages: 'auto',
            noItemsContent: html`<i18n-text key="lists.list.txtNoItemsFound"></i18n-text>`,
            noItemsIcon: 'info',
            pageParam: 'page',
            perPageParam: 'perPage',
            renderMode: 'full',
            resetScrollOnLoad: false,
            router: undefined,
            searchParam: 'search',
            showResultsText: true,
            sortByParam: 'sortBy',
            sortDefault: undefined,
            sortDirParam: 'sortDir',
            tagName: 'arpa-list',
            mapItemId: undefined,
            sortOptions: [],
            // template: List.template,
            title: ''
        };
        return mergeObjects(super.getDefaultConfig(conf), config);
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

    /**
     * Returns true if the list has a specific control.
     * @param {string} control
     * @returns {boolean}
     */
    hasControl(control) {
        if (this.getRenderMode() === 'minimal') return false;
        return this.getControls()?.includes(control);
    }

    /**
     * Returns the list of controls assigned to the list.
     * @returns {string[]}
     */
    getControls() {
        const arr = this.getArrayProperty('controls');
        return Array.isArray(arr) ? arr : [];
    }

    /**
     * True if the list has any footer content.
     * @returns {boolean}
     */
    hasFooter() {
        return Boolean(this.hasProperty('has-footer') || this.hasZone('footer') || this.hasPager());
    }

    /**
     * Returns true if the list has an info component which displays information about the list and item range.
     * It also contains additional list controls.
     * @returns {boolean}
     */
    hasInfo() {
        return Boolean(this.hasProperty('has-info'));
    }

    /**
     * Returns true if the list has a pager component.
     * @returns {boolean}
     */
    hasPager() {
        return Boolean(this.hasResource() || this.hasProperty('has-pager'));
    }

    /**
     * Returns true if the list has a resource.
     * The list resource manages the list items, pagination and filtering.
     * @returns {boolean}
     */
    hasResource() {
        return Boolean(this.hasProperty('url') || this.hasProperty('has-resource'));
    }

    /**
     * Returns true if the list has sticky controls and pagination.
     * @returns {boolean}
     */
    hasStickyControls() {
        return Boolean(this.hasProperty('sticky-controls'));
    }

    hasNoItemsContent() {
        return Boolean(this.getNoItemsContent() || this.hasZone('no-items'));
    }

    // #endregion

    /////////////////////////////
    // #region get
    /////////////////////////////

    /**
     * Returns the router service.
     * @returns {Router}
     */
    getRouter() {
        return /** @type {Router} */ (this._config?.router || getService('router'));
    }

    getViewFilter() {
        return this.listResource?.getViewFilter({
            defaultValue: this.getDefaultView()
        });
    }

    /**
     * Sets the view for the list.
     * @param {string} view
     */
    setView(view) {
        this.getViewFilter()?.setValue(view);
    }

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
     * Returns the different options by which the list items can be sorted.
     * @returns {FieldOptionConfigType[]}
     * Have to sort out the forms library types first.
     */
    getSortOptions() {
        return this.getProperty('sort-options');
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
     * @param {FieldOptionConfigType[]} options
     * @param {string} defaultValue
     */
    async setSortOptions(options, defaultValue) {
        this._config.sortOptions = options;
        this._config.sortDefault = defaultValue;
        /** @type {ListSort | undefined} */
        // const listSort = /** @type {ListSort | undefined} */ (this.controls?.search?.listSort);
        // const sortField = listSort?.sortByMenu;
        // sortField?.setOptions(options, defaultValue);
    }

    /**
     * Scrolls list to the top.
     */
    resetScroll() {
        const { resetScrollOnLoad } = this._config;
        resetScrollOnLoad && this?.scrollIntoView({});
    }

    /////////////////////////
    // #endregion set
    /////////////////////////

    ////////////////////////
    // #region Resource API
    ///////////////////////

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
     * @param {HTMLElement[]} items
     */
    async addItemNodes(items) {
        const container = this.itemsNode || this;
        appendNodes(container, items);
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
            const itemNodes = batch.map(config => this.createItem(config));
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
        this.listResource?.on('add_item', this.onResourceAddItem);
        this.listResource?.on('add_items', this.onResourceAddItems);
        this.listResource?.on('remove_items', this.onResourceRemoveItems);
        this.listResource?.on('remove_item', this.onResourceRemoveItem);
        this.listResource?.on('items_updated', this.onResourceItemsUpdated);
        this.listResource?.on('items', this.onResourceSetItems);
        this.listResource?.on('update_item', (/** @type {ListResourceItemType} */ payload) =>
            payload?.node?.reRender()
        );
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
        this.itemsNode = (renderMode === 'minimal' ? this : this.querySelector('.arpaList__items')) || this;
        this.itemsNode && appendNodes(this.itemsNode, this._childNodes);
        this.renderItems();
        const initialItems = this._initializeItems();
        this.itemsNode && appendNodes(this.itemsNode, initialItems);
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

        return initialItems;
    }

    renderPreloader() {
        return this.hasPreloader() ? html`<circular-preloader class="arpaList__preloader"></circular-preloader>` : '';
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
        /** @type {string[]} */
        const controls = /** @type {string[]} */ (this.getArrayProperty('controls') || []);
        const control = controls?.[0];
        if (!control) return '';
        const fn = /** @type {keyof ListControls.prototype} */ (`render${ucFirst(control)}`);
        const method = /** @type {((...args: any[]) => string) | undefined} */ (ListControls.prototype[fn]);
        if (typeof method === 'function') return method(this);
        return '';
    }

    renderControls(config = {}) {
        /** @type {Record<string, unknown>} */
        const {
            tagName = 'list-controls',
            controls = this.getArrayProperty('controls'),
            className = 'arpaList__controls'
        } = config;
        if (!this.hasControls()) return '';
        return html`<${tagName} zone="controls" class="${className}" controls="${controls?.toString()}"></${tagName}>`;
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
        const ariaLabel = processTemplate(this.getProperty('heading'), {});
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

    renderAside() {
        if (!this.hasContent('aside')) return '';
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
        this.pagerNode?.onChange((/** @type {import('@arpadroid/ui').PagerCallbackPayloadType} */ payload) => {
            const { page } = payload;
            const newURL = editURL(window.location.href, { [this.getParamName('page')]: String(page) });
            this.router?.go(newURL);
        });
    }
    ////////////////////////////
    // #endregion Pager
    ////////////////////////////

    /////////////////////////
    // #region Lifecycle
    /////////////////////////

    async _initializeNodes() {
        /** @type {ListControls | null} */
        this.controls = this.querySelector('list-controls');
        this.noItemsNode = this.querySelector('.arpaList__noItems');
        this.preloader = this.querySelector('.arpaList__preloader');
        return true;
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

defineCustomElement('arpa-list', List);

export default List;
