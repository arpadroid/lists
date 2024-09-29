/**
 * @typedef {import('../listItem/listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('../../../../types').AbstractContentInterface} AbstractContentInterface
 * @typedef {import('@arpadroid/ui').Pager} Pager
 */

import { I18nTool } from '@arpadroid/i18n';
import { Context } from '@arpadroid/application';
import { ArpaElement } from '@arpadroid/ui';
import { ListResource, getResource } from '@arpadroid/resources';
import { mergeObjects, getScrollableParent, isInView, editURL } from '@arpadroid/tools';
import { render, renderNode, renderAttr, mapHTML, attrString } from '@arpadroid/tools';
import ListItem from '../listItem/listItem.js';

const html = String.raw;
class List extends ArpaElement {
    isSearchInitialized = false;

    /////////////////////////
    // #region Initialization
    //////////////////////////

    _preInitialize() {
        this.onResourceAddItem = this.onResourceAddItem.bind(this);
        this.onResourceRemoveItem = this.onResourceRemoveItem.bind(this);
        this.onResourceRemoveItems = this.onResourceRemoveItems.bind(this);
        this.onResourceItemsUpdated = this.onResourceItemsUpdated.bind(this);
        this.onResourceSetItems = this.onResourceSetItems.bind(this);
        this.onResourceAddItems = this.onResourceAddItems.bind(this);
        this.onResourceFetch = this.onResourceFetch.bind(this);
        this.itemTemplate = this.querySelector(':scope > template[template-id="list-item-template"]');
        this.itemTemplate?.remove();
    }

    _initialize() {
        super._initialize();
        this._initializeListResource();
    }

    _initializeListResource() {
        /** @type {ListResource} */
        this.listResource = this.getResource();
        if (this.listResource) {
            this.preloader = renderNode(html`<circular-preloader></circular-preloader>`);
            this.listResource.on('payload', () => this._initializeList());
            this._handleItems();
            this._handlePreloading();
            const url = this.getProperty('url');
            url && this.listResource.setUrl(url);
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
                mapItemId: this._config.mapItemId
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
        return super.setConfig(config);
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
                hasControls: false,
                hasFilters: false,
                hasInfo: false,
                hasMiniSearch: true,
                hasPager: false,
                hasResource: false,
                hasSearch: false,
                hasSelection: false,
                hasSort: false,
                hasStickyFilters: false,
                hasViews: false,
                isCollapsed: false,
                itemComponent: ListItem,
                items: [],
                itemsPerPage: 50,
                itemTag: 'list-item',
                noItemsContent: html`<i18n-text key="modules.list.txtNoItemsFound"></i18n-text>`,
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
                // selectors: {
                //     searchNodes: '.listItem__titleText, .listItem__subTitle'
                // }
            }),
            config
        );
    }

    // #endregion

    /////////////////////
    // #region Accessors
    /////////////////////

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
        const { itemComponent } = this._config;
        return this._childNodes.filter(node => node instanceof itemComponent) || [];
    }

    /**
     * Returns the default sort option value.
     * @returns {string}
     */
    getSortDefault() {
        return this.getProperty('sort-default');
    }

    /**
     * Returns true if the list has any controls enabled.
     * @returns {boolean}
     */
    hasControls() {
        return this.hasAllControls() || this.hasProperty('has-controls') || this.hasZone('controls');
    }

    /**
     * Returns true if all list controls are enabled.
     * @returns {boolean}
     */
    hasAllControls() {
        return this.hasProperty('all-controls');
    }

    /**
     * Returns true if the list has a filters panel enabled.
     * @returns {boolean}
     */
    hasFilters() {
        return this.hasAllControls() || this.hasProperty('has-filters');
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
        return this.hasAllControls() || this.hasProperty('has-info');
    }

    /**
     * Returns true if the list has a search component.
     * @returns {boolean}
     */
    hasSearch() {
        return this.hasAllControls() || this.hasProperty('has-search');
    }

    /**
     * Returns true if the list has a views component.
     * @returns {boolean}
     */
    hasViews() {
        return this.hasAllControls() || this.hasProperty('has-views');
    }

    /**
     * Returns true if the list has a multi-select component for batch item operations.
     * @returns {boolean}
     */
    hasMultiSelect() {
        return this.hasAllControls() || this.hasProperty('has-selection');
    }

    /**
     * Returns true if the list has a pager component.
     * @returns {boolean}
     */
    hasPager() {
        return this.hasAllControls() || this.hasProperty('has-pager');
    }

    /**
     * Returns true if the list has a resource.
     * The list resource manages the list items, pagination and filtering.
     * @returns {boolean}
     */
    hasResource() {
        return this.hasAllControls() || this.hasProperty('has-resource');
    }

    /**
     * Returns true if the list has a sort component.
     * @returns {boolean}
     */
    hasSort() {
        return this.hasAllControls() || this.hasProperty('has-sort');
    }

    /**
     * Returns true if the list has sticky controls and pagination.
     * @returns {boolean}
     */
    hasStickyControls() {
        return this.hasProperty('sticky-controls');
    }

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

    getChildren() {
        return this.itemsNode?.children ?? [];
    }

    /**
     * Scrolls list to the top.
     */
    resetScroll() {
        const { resetScrollOnLoad } = this._config;
        const scrollable = getScrollableParent(this);
        if (scrollable?.scrollTop > 0 && resetScrollOnLoad && !isInView(this.node)) {
            // this.node.style.scrollMarginTop = Context.UIService.uiType === 'mobile' ? '60px' : '20px';
            this.node?.scrollIntoView({});
        }
    }

    async addItemNode(item, unshift = false) {
        await this.onReady();
        if (unshift) {
            this.itemsNode?.prepend(item);
        } else {
            this.itemsNode?.appendChild(item);
        }
    }

    async addItemNodes(items) {
        if (!items?.length) {
            return;
        }
        await this.onReady();
        this.itemsNode?.append(...items);
    }

    // #endregion ACCESSORS

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
        return preProcessNode && preProcessNode(node);
    }

    /**
     * Adds an item to the list.
     * @param {ListItemInterface} item
     * @returns {ListItem | ListItemInterface}
     */
    addItem(item) {
        return this.listResource ? this.listResource.addItem(item) : this.appendChild(this.createItem(item));
    }

    /**
     * Adds items to the list.
     * @param {ListItemInterface[]} items
     */
    addItems(items) {
        this.listResource?.addItems(items);
        !this.listResource && items.forEach(item => this.addItem(item));
    }

    /**
     * Creates a list item via class instantiation.
     * @param {ListItemInterface} config
     * @param {Record<string,unknown>} payload
     * @param {Record<string,unknown>} mapping
     * @returns {ListItem}
     */
    createItem(config = {}, payload = {}, mapping = {}) {
        const { itemComponent } = this._config;
        return new itemComponent(config, payload, mapping);
    }

    /**
     * Returns the list items.
     * @returns {ListItemInterface[]}
     */
    getItems() {
        return this.listResource?.getItems() ?? this._config.items;
    }

    getItemNodes() {
        return Array.from(this.itemsNode?.children);
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
            await this.promise;
            if (this.itemsNode) {
                this.itemsNode.innerHTML = mapHTML(items, item => this.renderItem(item));
            }
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
        this.listResource.on('set_items', this.onResourceSetItems);
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
        const itemNodes = items.map(config => this.createItem(config, this?.listResource?.getRawItem(config?.id)));
        this.addItemNodes(itemNodes);
    }

    async onResourceSetItems(items = []) {
        this.updatePager();
        await this.onReady();
        this.itemsNode && (this.itemsNode.innerHTML = '');
        this.onResourceAddItems(items);
        setTimeout(() => this.resolveFetch?.(), 20);
    }

    onResourceItemsUpdated() {
        this.update();
    }

    onResourceRemoveItems() {
        if (this.itemsNode) {
            this.itemsNode.innerHTML = '';
        }
    }

    onResourceAddItem(payload, unshift = false) {
        const node = this.createItem(payload);
        this.addItemNode(node, unshift);
    }

    onResourceRemoveItem(payload, index) {
        const item = this.itemsNode?.children[index];
        item?.remove();
    }

    // #endregion

    //////////////////
    // #region Render
    /////////////////

    getTemplateVars() {
        return {
            aside: this.renderAside(),
            id: this.getId(),
            controls: this.renderControls(),
            title: this.renderTitle(),
            items: this.renderItems(),
            heading: this.renderHeading(),
            noItemsIcon: this.getProperty('no-items-icon'),
            noItemsContent: this.getProperty('no-items-content'),
            pager: this.renderPager(),
            footer: this.renderFooter(),
            info: this.renderInfo()
        };
    }

    render() {
        const renderMode = this.getRenderMode();
        const template = renderMode === 'minimal' ? this.renderMinimal() : this.renderFull();
        this.innerHTML = I18nTool.processTemplate(template, this.getTemplateVars());
    }

    /**
     * Renders a list with all components.
     * @returns {string}
     */
    renderFull() {
        return html`
            {title} {controls}
            <div class="arpaList__body">
                <div class="arpaList__bodyMain">{info} {heading} {items}</div>
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
        return this.hasInfo()
            ? html`<list-info zone="list-info"
                  ${attrString({
                      'txt-all-results': this.getProperty('txt-all-results')
                  })}
              ></list-info>`
            : '';
    }

    renderControls() {
        return this.hasControls()
            ? html`<list-controls zone="controls">
                  ${this.hasFilters() ? html`<list-filters></list-filters>` : ''}
              </list-controls>`
            : '';
    }

    renderTitle(title = this.getTitle()) {
        return title || this.hasZone('title') ? html`<h2 class="arpaList__title" zone="title">${title}</h2>` : '';
    }

    renderHeading() {
        const headingText = this.getProperty('heading');
        return render(headingText, html`<div class="arpaList__header">${headingText}</div>`);
    }

    renderItems(items = this.getItems()) {
        if (this.getRenderMode() === 'minimal') {
            return '';
        }
        const ariaLabel = I18nTool.processTemplate(this.getProperty('heading'), {}, 'text');
        const itemsHTML = mapHTML(items, item => this.renderItem(item) || '');
        return html`<div class="arpaList__items" role="list" ${renderAttr('aria-label', ariaLabel)}>${itemsHTML}</div>`;
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
        const notItemsContent = this.getProperty('no-items-content');
        if (!items?.length || !notItemsContent) {
            return '';
        }
        return I18nTool.processTemplate(
            html`
                <div class="arpaList__noItems">
                    <arpa-icon>{noItemsIcon}</arpa-icon>
                    <div class="arpaList__noItemsText">{noItemsContent}</div>
                </div>
            `,
            this.getTemplateVars()
        );
    }

    _canShowPreloader() {
        return Boolean(this.preloaderNode && this.isLoading);
    }

    // #endregion

    ///////////////////
    // #region Render Pager
    //////////////////

    renderPager() {
        return this.hasPager() && this.hasResource()
            ? html`
                  <arpa-pager
                      id="${this.id}-listPager"
                      class="arpaList__pager"
                      total-pages="${this.listResource?.getTotalPages()}"
                      current-page="${this.listResource?.getCurrentPage()}"
                      url-param="${this.getParamName('page')}"
                  ></arpa-pager>
              `
            : '';
    }

    /**
     * Updates the pager.
     * @param {Pager} node
     */
    async updatePager(node = this.querySelector('arpa-pager')) {
        node?.setPager(this.listResource?.getCurrentPage(), this.listResource?.getTotalPages());
    }

    _initializePager() {
        this.pagerNode = this.querySelector('arpa-pager');
        this.pagerNode?.onChange(({ page }) => {
            const newURL = editURL(window.location.href, { [this.getParamName('page')]: page });
            Context.Router.go(newURL);
        });
    }

    // #endregion

    /////////////////////
    // #region Lifecycle
    /////////////////////

    _onConnected() {
        const renderMode = this.getProperty('render-mode');
        this.classList.add('arpaList');
        this.bodyMainNode = this.querySelector('.arpaList__bodyMain');
        this.bodyMainNode?.append(...this._childNodes);
        this.itemsNode = renderMode === 'minimal' ? this : this.querySelector('.arpaList__items');
        this.controls = this.querySelector('list-controls');
        this.noItemsNode = this.querySelector('.arpaList__noItems');
        this.addItemNodes(this.getInitialItems());
    }

    async update() {
        await this.promise;
        if (!this.getItems()?.length) {
            this.noItemsNode = this.noItemsNode || renderNode(this.renderNoItemsContent());
            this.noItemsNode && this.bodyMainNode?.appendChild(this.noItemsNode);
        } else {
            this.noItemsNode?.remove();
        }
    }

    async _handlePreloading() {
        await this.promise;
        this.listResource?.on('fetch', () => {
            this.isLoading = true;
            this.isLoading && this._hasRendered && this.appendChild(this.preloader);
        });

        this.listResource?.on('ready', () => {
            this.isLoading = false;
            this.preloader?.remove();
        });
    }

    _onDestroy() {
        this.listResource?.destroy();
    }

    // #endregion
}

customElements.define('arpa-list', List);

export default List;
