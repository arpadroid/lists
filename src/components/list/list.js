/**
 * @typedef {import('../listItem/listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('../../../../types').AbstractContentInterface} AbstractContentInterface
 */

import { ListResource } from '@arpadroid/resources';
import { ArpaElement } from '@arpadroid/ui';
import ListItem from '../listItem/listItem.js';
import { I18nTool } from '@arpadroid/i18n';
import { mergeObjects, getScrollableParent, isInView } from '@arpadroid/tools';
import { sanitizeSearchInput, render, renderNode, renderAttr } from '@arpadroid/tools';

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
            fixPager: false,
            hasFilters: false,
            hasMiniSearch: true,
            hasPager: true,
            hasSearch: false,
            hasSelection: false,
            hasSort: false,
            hasStickyFilters: false,
            hasViews: false,
            isCollapsed: true,
            itemComponent: ListItem,
            noItemsContent: html`<i18n-text key="modules.list.txtNoItemsFound"></i18n-text>`,
            noItemsIcon: 'info',
            resetScrollOnLoad: false,
            showResultsText: true,
            sortDefault: null,
            sortOptions: [],
            stickyControls: false,
            template: List.template,
            preProcessItem: undefined,
            renderMode: 'full',
            title: ''
            // filtersClass: ListFilters,
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

    mapItem(callback) {
        this.listResource?.mapItem(callback);
    }

    preProcessNode(callback) {
        this.listResource?.setPreProcessNode(callback);
    }

    hasAllControls() {
        return this.hasProperty('all-controls');
    }

    hasFilters() {
        return this.hasAllControls() || this.hasProperty('has-filters');
    }

    /**
     * Whether the list has search.
     * @returns {boolean}
     */
    hasSearch() {
        return this.hasAllControls() || this.hasProperty('has-search');
    }

    hasViews() {
        return this.hasAllControls() || this.hasProperty('has-views');
    }

    hasMultiSelect() {
        return this.hasAllControls() || this.hasProperty('has-selection');
    }

    /**
     * Whether the list has sort.
     * @returns {boolean}
     */
    hasSort() {
        return this.hasAllControls() || this.hasProperty('has-sort');
    }

    getSortOptions() {
        return this.getProperty('sort-options');
    }

    getSortDefault() {
        return this.getProperty('sort-default');
    }

    async setSortOptions(options, defaultValue = null) {
        this._config.sortOptions = options;
        this._config.sortDefault = defaultValue;
        const listSort = this.controls?.search?.listSort;
        const sortField = listSort?.selectField;
        sortField?.setOptions(options, defaultValue);
    }

    hasStickyControls() {
        return this.hasProperty('sticky-controls');
    }

    /**
     * Whether the list has pager.
     * @returns {boolean}
     */
    hasPager() {
        return this.hasAllControls() || Boolean(this.hasProperty('has-pager'));
    }

    /**
     * Items API.
     */

    getItems() {
        return this?.listResource.getItems();
    }

    getChildren() {
        return this.itemsNode?.children ?? [];
    }

    // #region ITEM CRUD

    /**
     * Adds an item to the list.
     * @param {ListItemInterface} item
     * @returns {ListItem}
     */
    addItem(item) {
        return this?.listResource?.addItem(item);
    }

    addItems(items) {
        this.listResource?.addItems(items);
    }

    async addItemNode(item, unshift = false) {
        await this.onReady();
        if (unshift) {
            this.itemsNode?.prepend(item);
        } else {
            this.itemsNode?.appendChild(item);
        }
    }

    setItems(items) {
        this.listResource?.setItems(items);
    }

    async addItemNodes(items) {
        if (!items?.length) {
            return;
        }
        await this.onReady();
        this.itemsNode?.append(...items);
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

    // #endregion

    getTitle() {
        return this.getProperty('title');
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
    }

    // #endregion

    //////////////////
    // #region EVENTS
    /////////////////

    onResourceAddItems(items = []) {
        const itemNodes = items.map(config => this.createItem(config, this?.listResource?.getRawItem(config?.id)));
        this.addItemNodes(itemNodes);
    }

    async onResourceSetItems(items = []) {
        await this.onReady();
        if (this.itemsNode) {
            this.itemsNode.innerHTML = '';
        }
        this.onResourceAddItems(items);
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
    // #region RENDER
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
            <list-controls slot="controls">
                ${this.hasFilters() ? html`<list-filters slot="list-filters"></list-filters>` : ''}
            </list-controls>
            <div class="arpaList__body">
                <div class="arpaList__bodyMain">{heading} {items} {pager}</div>
                {aside}
            </div>
        `;
    }

    renderTitle(title = this.getTitle()) {
        return render(title, html`<h2 class="arpaList__title">${title}</h2>`);
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

    renderPager() {
        const totalPages = this.listResource.getTotalPages();
        const currentPage = this.listResource?.getCurrentPage();
        const urlParam = this.listResource?.pageFilter?.getUrlName();
        if (!this.hasPager()) {
            return '';
        }
        return html`
            <arpa-pager
                id="${this.id}-listPager"
                total-pages="${totalPages}"
                current-page="${currentPage}"
                url-param="${urlParam}"
            ></arpa-pager>
        `;
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

    getInitialItems() {
        const { itemComponent } = this._config;
        return this._childNodes.filter(node => node instanceof itemComponent) || [];
    }

    // #endregion

    /**
     * Sets the list items and deletes existing ones.
     * @param {ListItemInterface[]} items
     */
    setList(items) {
        this.listResource.setItems(items);
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
        this._onSearch = this._onSearch.bind(this);
        super._initialize();
        this._initializeListResource();
        this._initializeSelections();
    }

    getDefaultView() {
        return this.getProperty('default-view');
    }

    _initializeSelections() {
        // if (this.listResource?.hasSelection()) {
        //     this.listSelection = new ListSelection(this._id + '-selections', {
        //         context: this._getContext()
        //     });
        //     this.addControl({ id: 'selectionsControl', content: this.listSelection.render() });
        // }
    }

    _initializeFilters() {
        const { filtersClass, hasFilters } = this._config;
        if (hasFilters && !this.filters) {
            this.filters = new filtersClass('listFilters', {
                listResource: this.listResource,
                listComponent: this
            });
            this.filtersMenu = this.initializeFiltersMenu();
            this.addControl({ id: 'filtersControl', content: this.filtersMenu });
        }
    }

    initializeFiltersMenu() {
        // return new IconMenu(this._id + '-filtersMenu', {
        //     icon: 'filter_alt',
        //     tooltip: 'Filters',
        //     className: 'list__filtersMenu',
        //     context: this._getContext(),
        //     closeOnClick: false,
        //     navConfig: {
        //         tagName: 'div',
        //         className: 'listComponent__filtersWrapper',
        //         layout: {
        //             nodeComponent: AbstractComponent,
        //             childrenTagName: 'div',
        //             tagName: 'div',
        //             childrenAttributes: { tabindex: 1 }
        //         }
        //     },
        //     inputComboConfig: { closeOnClick: false },
        //     links: [{ content: this.filters, tagName: '' }]
        // });
    }

    _initializeListResource() {
        /** @type {ListResource} */
        this.listResource = this.getResource();
        if (this.listResource) {
            this.preloader = renderNode(html`<circular-preloader></circular-preloader>`);
            this.listResource.listen('PAYLOAD', () => {
                this._initializeList();
            });
            this._handleItems();
            this._handlePreloading();
            const url = this.getProperty('url');
            if (url) {
                this.listResource.setUrl(url);
            }
        }
    }

    getResource() {
        return this.listResource ?? this._config.listResource ?? new ListResource({ id: this._config.id });
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
        // this.pagerNode = this?.pagerComponent.set(
        //     this.listResource.getCurrentPage(),
        //     this.listResource.getTotalPages()
        // );
        // // if (this._config.fixPager) {
        // //     NodePosition.absoluteFix(this.pagerNode, this.bodyMainNode);
        // // }
        // if (this?.listResource) {
        //     this.setList(this.listResource.items);
        // }
    }

    /**
     * SEARCH.
     */

    _initializeSearch() {
        this.searchInput = this._config?.searchInput;
        if (this.hasSearch() && this.controlsComponent && !this.isSearchInitialized) {
            this.isSearchInitialized = true;
            this.listSearch = this.controlsComponent.getComponent('ListSearch');
            this.searchInput = this.listSearch?.searchField?.inputNode;
        }
        if (this.searchInput) {
            this.layout.initializeSearch(this.searchInput, {
                onSearch: this._onSearch
            });
        }
    }

    /**
     * Handles search results.
     * @param {HTMLElement[]} matches
     * @param {HTMLElement[]} nonMatches
     */
    _onSearch(matches, nonMatches) {
        if (matches.length) {
            matches.forEach(match => this._handleSearchMatch(match));
        }
        nonMatches.forEach(nonMatch => this._resetSearchNode(nonMatch));
    }

    /**
     * Returns the nodes within the list element where search is allowed'.
     * @param {HTMLElement} node
     * @returns {HTMLElement[]}
     */
    _getSearchNodes(node) {
        return Array.from(node.querySelectorAll(this._config.selectors.searchNodes));
    }

    /**
     * Resets node to its original content.
     * @param {HTMLElement} node
     */
    _resetSearchNode(node) {
        const nodes = this._getSearchNodes(node);
        nodes.forEach(node => {
            if (node.originalContent) {
                node.innerHTML = node.originalContent;
            }
        });
    }

    /**
     * Hilights the search match in the node.
     * @param {HTMLElement} node
     */
    _handleSearchMatch(node) {
        const nodes = this._getSearchNodes(node);
        nodes.forEach(node => {
            node.originalContent = node.originalContent ?? node.innerHTML;
            let content = node.originalContent;
            const value = sanitizeSearchInput(this.searchInput?.value);
            if (value.length > 2) {
                // eslint-disable-next-line security/detect-non-literal-regexp
                content = node.originalContent.replace(new RegExp(value, 'gi'), match => {
                    return `<mark class="searchHighlight">${match}</mark>`;
                });
            }
            node.innerHTML = content;
        });
    }
}

customElements.define('arpa-list', List);

export default List;
