/**
 * @typedef {import('../listItem/listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('../../../../types').AbstractContentInterface} AbstractContentInterface
 * @typedef {import('@arpadroid/ui').Pager} Pager
 */

import { ListResource } from '@arpadroid/resources';
import { ArpaElement } from '@arpadroid/ui';
import ListItem from '../listItem/listItem.js';
import { I18nTool } from '@arpadroid/i18n';
import { mergeObjects, getScrollableParent, isInView, editURL } from '@arpadroid/tools';
import { render, renderNode, renderAttr } from '@arpadroid/tools';
import { Context } from '@arpadroid/application';

const html = String.raw;
class List extends ArpaElement {
    isSearchInitialized = false;

    /////////////////////////
    // #region INITIALIZATION
    //////////////////////////

    _preInitialize() {
        this.itemTemplate = this.querySelector(':scope > template[template-id="list-item-template"]');
        this.itemTemplate?.remove();
    }

    setConfig(config = {}) {
        config.id = config.id || this.id;
        if (!config.id) {
            throw new Error('List component must have an id.');
        }
        return super.setConfig(config);
    }

    /**
     * Returns the default configuration for this component.
     * @returns {ListInterface}
     */
    getDefaultConfig() {
        this.onResourceAddItem = this.onResourceAddItem.bind(this);
        this.onResourceRemoveItem = this.onResourceRemoveItem.bind(this);
        this.onResourceRemoveItems = this.onResourceRemoveItems.bind(this);
        this.onResourceItemsUpdated = this.onResourceItemsUpdated.bind(this);
        this.onResourceSetItems = this.onResourceSetItems.bind(this);
        this.onResourceAddItems = this.onResourceAddItems.bind(this);
        return mergeObjects(super.getDefaultConfig(), {
            allControls: false,
            defaultView: 'list',
            filterNamespace: '',
            hasControls: true,
            hasFilters: false,
            hasFixedPager: false,
            hasFixedPager: true,
            hasInfo: false,
            hasMiniSearch: true,
            hasPager: true,
            hasSearch: false,
            hasSelection: false,
            hasSort: false,
            hasStickyFilters: false,
            hasViews: false,
            isCollapsed: true,
            itemComponent: ListItem,
            itemsPerPage: 50,
            noItemsContent: html`<i18n-text key="modules.list.txtNoItemsFound"></i18n-text>`,
            noItemsIcon: 'info',
            pageParam: 'page',
            perPageParam: 'perPage',
            preProcessItem: undefined,
            renderMode: 'full',
            resetScrollOnLoad: false,
            searchParam: 'search',
            showResultsText: true,
            sortByParam: 'sortBy',
            sortDefault: null,
            sortDirParam: 'sortDir',
            sortOptions: [],
            stickyControls: false,
            template: List.template,
            title: ''
            // selectors: {
            //     searchNodes: '.listItem__titleText, .listItem__subTitle'
            // }
        });
    }

    // #endregion

    // #region ACCESSORS

    getId() {
        return this._config.id;
    }

    getRenderMode() {
        return this.getProperty('render-mode');
    }

    getTitle() {
        return this.getProperty('title');
    }

    getSortOptions() {
        return this.getProperty('sort-options');
    }

    getInitialItems() {
        const { itemComponent } = this._config;
        return this._childNodes.filter(node => node instanceof itemComponent) || [];
    }

    getSortDefault() {
        return this.getProperty('sort-default');
    }

    hasAllControls() {
        return this.hasProperty('all-controls');
    }

    hasFilters() {
        return this.hasAllControls() || this.hasProperty('has-filters');
    }

    hasControls() {
        return this.hasAllControls() || this.hasProperty('has-controls') || this.hasSlot('controls');
    }

    hasFixedPager() {
        return this.hasProperty('has-fixed-pager');
    }

    hasInfo() {
        return this.hasAllControls() || this.hasProperty('has-info');
    }

    hasSearch() {
        return this.hasAllControls() || this.hasProperty('has-search');
    }

    hasViews() {
        return this.hasAllControls() || this.hasProperty('has-views');
    }

    hasMultiSelect() {
        return this.hasAllControls() || this.hasProperty('has-selection');
    }
    hasPager() {
        return this.hasAllControls() || Boolean(this.hasProperty('has-pager'));
    }

    hasSort() {
        return this.hasAllControls() || this.hasProperty('has-sort');
    }

    hasStickyControls() {
        return this.hasProperty('sticky-controls');
    }

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

    mapItem(callback) {
        this.listResource?.mapItem(callback);
    }

    preProcessNode(callback) {
        this.listResource?.setPreProcessNode(callback);
    }

    /**
     * Adds an item to the list.
     * @param {ListItemInterface} item
     * @returns {ListItem}
     */
    addItem(item) {
        return this?.listResource?.addItem(item);
    }

    getItems() {
        return this?.listResource.getItems();
    }

    addItems(items) {
        this.listResource?.addItems(items);
    }

    setItems(items) {
        this.listResource?.setItems(items);
    }

    removeItem(item) {
        return this?.listResource?.removeItem(item);
    }

    removeItems(items) {
        this.listResource?.removeItems(items);
    }

    createItem(config = {}, payload = {}, mapping = {}) {
        const { itemComponent } = this._config;
        return new itemComponent(config, payload, mapping);
    }

    _handleItems() {
        this.listResource.listen('ADD_ITEM', this.onResourceAddItem);
        this.listResource.listen('ADD_ITEMS', this.onResourceAddItems);
        this.listResource.listen('REMOVE_ITEMS', this.onResourceRemoveItems);
        this.listResource.listen('REMOVE_ITEM', this.onResourceRemoveItem);
        this.listResource.listen('ITEMS_UPDATED', this.onResourceItemsUpdated);
        this.listResource.listen('SET_ITEMS', this.onResourceSetItems);
        this.listResource.listen('ITEMS', this.onResourceSetItems);
        this.listResource.listen('UPDATE_ITEM', payload => this.layout.updateNode(payload));
        this.listResource.listen(
            'FETCH',
            () => (this.fetchPromise = new Promise(resolve => (this.resolveFetch = resolve)))
        );
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

    // #endregion

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

    // #endregion

    //////////////////////////////////
    // #region Resource Handlers
    //////////////////////////////////

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
        const item = this.itemsNode.children[index];
        item?.remove();
    }

    // #endregion

    //////////////////
    // #region Render
    /////////////////

    getTemplateVars() {
        return {
            aside: this.renderAside(),
            id: this._config.id,
            title: this.getProperty('title'),
            items: this.renderItems(),
            heading: this.renderHeading(),
            noItemsIcon: this.getProperty('no-items-icon'),
            noItemsContent: this.getProperty('no-items-content'),
            pager: this.renderPager()
        };
    }

    render() {
        const renderMode = this.getRenderMode();
        const template = renderMode === 'minimal' ? this.renderMinimal() : this.renderFull();
        this.innerHTML = I18nTool.processTemplate(template, this.getTemplateVars());
    }

    renderMinimal() {
        return html`{items}`;
    }

    renderFull() {
        return html`
            ${this.renderTitle()}
            ${this.hasControls()
                ? html`<list-controls slot="controls">
                      ${this.hasFilters() ? html`<list-filters></list-filters>` : ''}
                  </list-controls>`
                : ''}

            <div class="arpaList__body">
                <div class="arpaList__bodyMain">
                    ${this.hasInfo() ? html`<list-info></list-info>` : ''} {heading} {items} {pager}
                </div>
                {aside}
            </div>
        `;
    }

    renderTitle(title = this.getTitle()) {
        return title ? html`<h2 class="arpaList__title">${title}</h2>` : '';
    }

    renderHeading() {
        const headingText = this.getProperty('heading');
        return render(headingText, html`<div class="arpaList__header">${headingText}</div>`);
    }

    renderItems() {
        if (this.getRenderMode() === 'minimal') {
            return '';
        }
        const ariaLabel = I18nTool.processTemplate(this.getProperty('heading'), {}, 'text');
        return html` <div class="arpaList__items" role="list" ${renderAttr('aria-label', ariaLabel)}></div> `;
    }

    renderAside() {
        return html`<div class="arpaList__aside" slot="aside"></div>`;
    }

    renderNoItemsContent(items = this.listResource.getItems()) {
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
    // #region PAGER
    //////////////////

    renderPager() {
        return this.hasPager()
            ? html`
                  <arpa-pager
                      id="${this.id}-listPager"
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
    // #region LIFECYCLE
    /////////////////////

    async update() {
        await this.promise;
        if (!this.getItems()?.length) {
            this.noItemsNode = this.noItemsNode || renderNode(this.renderNoItemsContent());
            this.noItemsNode && this.bodyMainNode?.appendChild(this.noItemsNode);
        } else {
            this.noItemsNode?.remove();
        }
    }

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

    // #endregion

    /**
     * INITIALIZATION.
     */

    _getContext() {
        return {
            listComponent: this,
            listResource: this.listResource
        };
    }

    _initialize() {
        super._initialize();
        this._initializeListResource();
    }

    getDefaultView() {
        return this.getProperty('default-view');
    }

    _initializeListResource() {
        /** @type {ListResource} */
        this.listResource = this.getResource();
        if (this.listResource) {
            this.preloader = renderNode(html`<circular-preloader></circular-preloader>`);
            this.listResource.listen('PAYLOAD', () => this._initializeList());
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
            new ListResource({
                id: this._config.id,
                pageParam: this.getParamName('page'),
                searchParam: this.getParamName('search'),
                perPageParam: this.getParamName('perPage'),
                sortByParam: this.getParamName('sortBy'),
                sortDirParam: this.getParamName('sortDir'),
                itemsPerPage: this.getProperty('items-per-page')
            })
        );
    }

    getParamName($param) {
        const namespace = this.getProperty('filter-namespace');
        return namespace + this.getProperty(`${$param}-param`);
    }

    setListResource(listResource) {
        /** @type {ListResource} */
        this.listResource = listResource;
    }

    async _handlePreloading() {
        await this.promise;
        this.listResource.listen('FETCH', () => {
            this.isLoading = true;
            if (this.isLoading && this._hasRendered) {
                this.appendChild(this.preloader);
            }
        });

        this.listResource.listen('READY', () => {
            this.isLoading = false;
            if (this.preloader.parentNode) {
                this.preloader.parentNode.removeChild(this.preloader);
            }
        });
    }

    _initializeList() {
        this.resetScroll();
        this._initializePager();
    }
}

customElements.define('arpa-list', List);

export default List;
