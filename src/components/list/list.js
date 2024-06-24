/**
 * @typedef {import('../listItem/listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('./listInterface.js').ListInterface} ListInterface
 * @typedef {import('@arpadroid/application/src/resources/listResource/listResource')} ListResource
 * @typedef {import('../../../../types').AbstractContentInterface} AbstractContentInterface
 */

import { ArpaElement } from '@arpadroid/ui';
import ListItem from '../listItem/listItem.js';
import { ListResource } from '@arpadroid/application';
import { I18nTool } from '@arpadroid/i18n';
import { mergeObjects, getScrollableParent, isInView } from '@arpadroid/tools';
import { sanitizeSearchInput, render, renderNode, renderAttr } from '@arpadroid/tools';

const html = String.raw;
class List extends ArpaElement {
    isSearchInitialized = false;

    /////////////////////////
    // #region INITIALIZATION
    //////////////////////////

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

    /**
     * Sets the heading.
     * @param {AbstractContentInterface} heading
     */
    setHeading(heading) {
        this._config.heading = heading;
        if (this.headingComponent) {
            this.headingNode = this.headingComponent.setContent(heading);
        }
    }

    setPreProcessItem(callback) {
        this.listResource?.setPreProcessItem(callback);
    }

    preProcessNode(callback) {
        this.listResource?.setPreProcessNode(callback);
    }

    /**
     * Returns the heading.
     * @returns {import('../list-item/listItem.js').AbstractContentInterface}
     */
    getHeading() {
        return this._config.heading;
    }

    getListNode() {
        return this.layout.getRootNode()?.node;
    }

    hasAllControls() {
        return this.hasProperty('all-controls');
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
        return this.hasAllControls() || this.hasProperty('has-multiSelect');
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

    setSortOptions(options, defaultValue = null) {
        this._config.sortOptions = options;
        this._config.sortDefault = defaultValue;
        if (this.sortField) {
            this.sortField.setOptions(options, defaultValue);
        }
    }

    hasStickyControls() {
        return this.hasProperty('sticky-controls');
    }

    /**
     * Whether the list has pager.
     * @returns {boolean}
     */
    hasPager() {
        return Boolean(this.listResource?.getTotalPages() > 1 && this.hasProperty('has-pager'));
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
        await this.onReady();
        this.itemsNode?.append(...items);
    }

    getTitle() {
        return this.getProperty('title');
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
        // this.listResource.listen('UPDATE_ITEM', payload => this.layout.updateNode(payload));
    }

    // #endregion

    //////////////////
    // #region EVENTS
    /////////////////

    onResourceAddItems(items = []) {
        const itemNodes = items.map(payload => this.createItem(payload));
        this.addItemNodes(itemNodes);
    }

    async onResourceSetItems(items = []) {
        await this.onReady();
        this.itemsNode.innerHTML = '';
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
            // search: this.controlsComponent?.getControl('searchControl')?.render(),
            // views: this.controlsComponent?.getControl('viewsControl')?.render(),
            // filters: this.controlsComponent?.getControl('filtersControl')?.render(),
            // preloader: this.preloaderNode,
            items: this.renderItems(),
            heading: this.renderHeading(),
            noItemsIcon: this.getProperty('no-items-icon'),
            noItemsContent: this.getProperty('no-items-content'),
            pager: this.renderPager()
        };
    }

    // renderNoItemsContent() {
    //     const content = ;
    //     return render(content, content);
    // }

    render() {
        const renderMode = this.getRenderMode();
        const template = renderMode === 'minimal' ? this.getMinimalTemplate() : this.renderFullTemplate();
        this.innerHTML = I18nTool.processTemplate(template, this.getTemplateVars());
    }

    getMinimalTemplate() {
        return html`{items}`;
    }

    renderFullTemplate() {
        return html`
            ${this.renderTitle()}
            <list-controls></list-controls>
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
        const totalPages = this.listResource?.getTotalPages();
        const currentPage = this.listResource?.getCurrentPage();
        const urlParam = this.listResource?.pageFilter?.getUrlName();
        return render(
            this.hasPager(),
            html`
                <arpa-pager
                    total-pages="${totalPages}"
                    current-page="${currentPage}"
                    url-param="${urlParam}"
                ></arpa-pager>
            `
        );
    }

    renderNoItemsContent(items = this.listResource.getItems()) {
        const notItemsContent = this.getProperty('no-items-content');
        return render(
            notItemsContent && !items?.length,
            I18nTool.processTemplate(
                html`
                    <div class="arpaList__noItems">
                        <arpa-icon>{noItemsIcon}</arpa-icon>
                        <div class="arpaList__noItemsText">{noItemsContent}</div>
                    </div>
                `,
                this.getTemplateVars()
            )
        );
    }

    _canShowPreloader() {
        return Boolean(this.preloaderNode && this.isLoading);
    }

    // _render() {
    //     const node = super._render();
    //     node?.classList?.add('listComponent');
    //     if (this._canShowPreloader()) {
    //         node.appendChild(this.preloaderNode);
    //     }
    //     this.bodyNode = this.renderBody();
    //     node.insertBefore(this.bodyNode, node.firstChild);
    //     this.controlsNode = this.rendeControls();
    //     if (this.controlsNode) {
    //         node.insertBefore(this.controlsNode, node.firstChild);
    //     }
    //     this.renderControls();
    //     this.pagerNode = this.renderPager();
    //     if (this.pagerNode) {
    //         this.bodyMainNode.appendChild(this.pagerNode);
    //     }
    //     this._initializeFilters();
    //     const { title } = this._config;
    //     if (title) {
    //         this.titleNode = document.createElement('h2');
    //         this.titleNode.className = 'list__title';
    //         this.titleNode.textContent = title;
    //         node.prepend(this.titleNode);
    //     }
    //     return node;
    // }

    renderControls() {
        this._initializeSearch();
    }

    rendeControls() {
        return this.controlsComponent.render();
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    async update(items = this.getItems()) {
        await this.onReady();
        requestAnimationFrame(() => {
            if (!items?.length) {
                this.noItemsNode = this.noItemsNode || renderNode(this.renderNoItemsContent());
                if (this.noItemsNode) {
                    this.bodyMainNode?.appendChild(this.noItemsNode);
                }
            } else {
                this.noItemsNode?.remove();
            }
        });
    }

    _onConnected() {
        const renderMode = this.getProperty('render-mode');
        this.classList.add('arpaList');
        this.bodyMainNode = this.querySelector('.arpaList__bodyMain');
        this.bodyMainNode?.append(...this._childNodes);
        this.itemsNode = renderMode === 'minimal' ? this : this.querySelector('.arpaList__items');
        this.controlsNode = this.querySelector('list-controls');
        this.noItemsNode = this.querySelector('.arpaList__noItems');
        this.addItemNodes(this.getInitialItems());
    }

    getInitialItems() {
        const { itemComponent } = this._config;
        return this._childNodes.filter(node => node instanceof itemComponent) || [];
    }

    // #endregion

    // /**
    //  * Sets the list items and deletes existing ones.
    //  * @param {LayoutNodeInterface[]} items
    //  */
    // setList(items) {
    //     this.layout.setNodes(items);
    // }

    // /**
    //  * Removes an item by index.
    //  * @param {number} index
    //  * @returns {LayoutNode}
    //  */
    // removeItemIndex(index) {
    //     return this.layout.deleteNodeIndex(index);
    // }

    // /**
    //  * Adds a control.
    //  * @param {LayoutNodeInterface} control
    //  * @param {boolean} unshift
    //  * @returns {LayoutNodeInterface}
    //  */
    // addControl(control, unshift = false) {
    //     const existing = control?.id ? this._controls[control.id] : null;
    //     if (existing) {
    //         return existing;
    //     }
    //     const node = this.controlsComponent.layout.addNode(control, unshift);
    //     if (control.id) {
    //         this._controls[control.id] = node;
    //     }
    //     return node;
    // }
    /**
     * Scrolls list to the top.
     */
    resetScroll() {
        const { resetScrollOnLoad } = this._config;
        const scrollable = getScrollableParent(this.node);
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

    _initializeProperties() {
        super._initializeProperties();
        this._controls = {};
        /** @type {ListResource} */
        this.listResource = this.listResource || this._config?.listResource;
    }

    _initialize() {
        this._onSearch = this._onSearch.bind(this);
        this._initializeHeading();
        super._initialize();
        this._initializeListResource();
        this._initializeControls();
        this._initializeViews();
        this._initializeSelections();
    }

    _initializeHeading() {
        // this.headingComponent = new ListHeading(this._id + '-heading', {
        //     content: this._config.heading,
        //     context: this._getContext()
        // });
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

    _initializeViews() {
        // if (this._config.hasViews) {
        //     this.viewsComponent = new ListViews(this._id + '-views', this._getContext());
        //     this.addControl({ id: 'viewsControl', content: this.viewsComponent.render() });
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

    _initializeControls() {
        // this.controlsComponent = new ListControls(this._id + 'controls', {
        //     context: this._getContext()
        // });
    }

    _initializeListResource() {
        this.listResource = this.getResource();
        if (this.listResource) {
            // this.preloader = new CircularPreloader(this._id + '-preloader');
            this.listResource.listen('PAYLOAD', () => {
                this._initalizeList();
            });
            this._handleItems();
            // this._handlePreloading();
        }
    }

    getResource() {
        return this.listResource ?? this._config.listResource ?? new ListResource({ id: this._config.id });
    }

    setListResource(listResource) {
        this.listResource = listResource;
    }

    _handlePreloading() {
        this.preloaderNode = this.preloader.render();
        this.listResource.listen('FETCH', () => {
            this.isLoading = true;
            if (this.isLoading && this._hasRendered) {
                this.node.appendChild(this.preloaderNode);
            }
        });

        this.listResource.listen('READY', () => {
            this.isLoading = false;
            if (this.preloaderNode.parentNode) {
                this.preloaderNode.parentNode.removeChild(this.preloaderNode);
            }
        });
    }

    _initalizeList() {
        // this.resetScroll();
        // this.pagerNode = this?.pagerComponent.set(
        //     this.listResource.getCurrentPage(),
        //     this.listResource.getTotalPages()
        // );
        // // if (this._config.fixPager) {
        // //     NodePosition.absoluteFix(this.pagerNode, this.bodyMainNode);
        // // }
        // this.renderNoItemsContent();
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
