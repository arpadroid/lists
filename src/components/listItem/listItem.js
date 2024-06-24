/* eslint-disable indent */
/**
 * @typedef {import('./listItemInterface').ListItemInterface} ListItemInterface
 * @typedef {import('../../resources/listResource.js').default} ListResource
 * @typedef {import('../../contexts/listFilter.js').default} ListFilter
 * @typedef {import('../list/list.js').default} List
 * @typedef {import('../../../../components/abstract-content/abstractContentInterface').AbstractContentInterface} AbstractContentInterface
 * @typedef {import('@arpadroid/ui').IconMenu} IconMenu
 * @typedef {import('../../../../components/tag/tagInterface.js').TagInterface} TagInterface
 */

import { ArpaElement } from '@arpadroid/ui';
import { render, renderNode } from '@arpadroid/tools';

const html = String.raw;
class ListItem extends ArpaElement {
    constructor(config = {}, payload, map) {
        super(config);
        this.payload = payload;
        this.map = map;
    }

    /**
     * Gets the default config for the component.
     * @returns {ListItemInterface}
     */
    getDefaultConfig() {
        return {
            lazyLoad: false,
            selectedClass: 'listItem--selected',
            truncateContent: 0,
            wrapperComponent: 'div',
            rhsContent: '',
            role: 'listitem',
            imageConfig: {
                showPreloader: true
            }
        };
    }

    getTagName() {
        return 'list-item';
    }

    removeItem() {
        if (this.listResource) {
            this.listResource.removeItem({ id: this.getId() });
        } else {
            this.remove();
        }
    }

    hasSelection() {
        return (
            this.listResource?.hasSelection() ??
            this.hasAttribute('has-selection') ??
            this.getProperty('has-selection')
        );
    }

    setSelected() {
        // const item = this.listResource?.getItem(this._config.id);
        // if (this.checkbox.checked) {
        //     this.listResource.selectItem(item);
        //     this.node.classList.add(this._config.selectedClass);
        // } else {
        //     this.listResource.deselectItem(item);
        //     this.node.classList.remove(this._config.selectedClass);
        // }
    }

    getId() {
        return this.payload?.id || this.getProperty('id');
    }

    getPayload() {
        return this.payload ?? this._config;
    }

    getTitle() {
        return this.getProperty('title');
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

    getIcon() {
        return this.getProperty('icon');
    }

    getIconRight() {
        return this.getProperty('icon-right');
    }

    getImage() {
        return this.getProperty('image');
    }

    getImageAlt() {
        return this.getProperty('image-alt');
    }

    setAction(action) {
        if (typeof action !== 'function') {
            throw new Error('Action must be a function');
        }
        this._config.action = action;
    }

    render() {
        this.classList.add('listItem');
        if (this._config.role) {
            this.setAttribute('role', this._config.role);
        }
        this.link = this.getProperty('link');
        if (!this.link && this.hasAttribute('link')) {
            this.removeAttribute('link');
        }
        const href = this.link ? `href="${this.link}"` : '';
        const wrapperComponent = href ? 'a' : this.getWrapperComponent();
        const template = html`
            <${wrapperComponent} ${href} class="listItem__main ${render(this.link, 'listItem__link')}">
                <arpa-icon class="listItem__icon">{icon}</arpa-icon>
                ${this.renderImage()}
                <div class="listItem__contentWrapper">
                    ${this.renderTitleContainer()} ${this.renderTags()} ${this.renderContent()}
                </div>
                <arpa-icon class="listItem__iconRight">{iconRight}</arpa-icon>
            </${wrapperComponent}>
            ${this.renderRhs()}
        `;
        const content = this.renderTemplate(template);
        this.innerHTML = content;
    }

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

    renderRhs(content = this._config.rhsContent) {
        const nav = this.renderNav();
        const checkbox = this.renderCheckbox();
        return render(
            nav || checkbox || content,
            html`<div class="listItem__rhs">${checkbox}${nav}${content}</div>`
        );
    }

    renderCheckbox() {
        if (!this.hasSelection()) {
            return '';
        }
        const { id, isSelected = this.listResource?.isSelected(this) } = this._config;
        const htmlId = `listItem__checkbox-${id}`;
        const checked = render(isSelected, 'checked');
        return html`
            <label class="listItem__checkboxContainer" for="${htmlId}">
                <input class="listItem__checkbox arpaCheckbox" type="checkbox" id="${htmlId}" ${checked} />
            </label>
        `;
    }

    renderTitleContainer(title = this.getTitle(), subTitle = this.getSubTitle()) {
        return render(
            title || subTitle,
            html`
                <div class="listItem__titleWrapper">
                    ${this.renderTitle()}
                    ${render(subTitle, html`<span class="listItem__subTitle">${subTitle}</span>`)}
                </div>
            `
        );
    }

    renderTitle(title = this.getTitle()) {
        if (!title) {
            return '';
        }
        const titleLink = this.getTitleLink();
        const titleClass = 'listItem__title';
        return titleLink
            ? html` <a href="${titleLink}" class="${titleClass}">${this.renderTitleContent()}</a>`
            : html`<span class="${titleClass}">${this.renderTitleContent()}</span>`;
    }

    renderTitleContent() {
        return html`<arpa-icon>{titleIcon}</arpa-icon>{title}`;
    }

    renderImage(image = this.getImage(), alt = this.getImageAlt()) {
        return render(image, html`<arpa-image src="${image}" alt="${alt}"></arpa-image>`);
    }

    getTemplateVars() {
        return {
            icon: this.getProperty('icon'),
            iconRight: this.getProperty('icon-right'),
            titleIcon: this.getProperty('title-icon'),
            title: this.getTitle(),
            subTitle: this.getSubTitle()
        };
    }

    renderContent() {
        const truncate = this.getProperty('truncate-content');
        const content = this.getContent();
        return render(
            content,
            html`<truncate-text max-length="${truncate}" class="listItem__content">${content}</truncate-text>`
        );
    }

    setContent(content) {
        this._config.content = content;
        if (this.contentNode) {
            if (typeof this.contentNode.setContent === 'function') {
                this.contentNode.setContent(content);
                return;
            }
            this.contentNode.innerHTML = content;
        }
    }

    getContent() {
        return this._content || this._config?.content;
    }

    renderSubTitle() {
        const subTitle = this.getProperty('sub-title');
        return render(subTitle, html`<span class="listItem__subTitle">${subTitle}</span>`);
    }

    renderNav() {
        return '';
    }

    renderTags() {
        return '';
    }

    async _onConnected() {
        this._initializeProperties();
        this._initializeNodes();
        await this._initializeItem();
    }

    _initializeItem() {}

    _initializeProperties() {
        this.list = this.closest('.arpaList');
        this.listResource = this.list?.listResource;
    }

    _initializeNodes() {
        this.mainNode = this.querySelector('.listItem__main');
        this.checkbox = this.querySelector('.listItem__checkbox');
    }

    async _onInitialized() {
        await this.onReady();
        this._initializeContent();
        if (this.checkbox && this.hasSelection()) {
            this.checkbox.addEventListener('change', () => this.setSelected());
            this.setSelected();
        }
        const { action } = this._config;
        const doAction = event => action(event, this);
        if (this.mainNode && typeof action === 'function') {
            this.mainNode.removeEventListener('click', doAction);
            this.mainNode.addEventListener('click', doAction);
        }
        const payload = {
            id: this.getId(),
            ...this.getPayload()
        };
        if (this.isConnected) {
            this.listResource?.registerItem(payload, this);
        }
    }

    _initializeContent() {
        this.contentNode = this.querySelector('.listItem__content');
        if (!this.contentNode) {
            return;
        }
        const content = this.getContent();
        if (content) {
            this.contentNode.textContent = content;
        } else if (this._childNodes?.length) {
            this.contentNode.append(...this._childNodes);
        }
        const i18n = this.getProperty('i18n');
        if (i18n) {
            this.i18nNode = this.i18nNode ?? renderNode(html`<i18n-text key="${i18n}"></i18n-text>`);
            this.contentNode?.appendChild(this.i18nNode);
        }
    }
}

customElements.define(ListItem.prototype.getTagName(), ListItem);

//     _initializeProperties() {
//         /** @type {List} */
//         this.listComponent = this?.layout?.getComponent();
//         /** @type {ListResource} */
//         this.listResource = this.listComponent?.listResource;
//         super._initializeProperties();
//         this._initializeView();
//         const { selectedClass } = this._config;
//         if (this.listResource?.hasSelection()) {
//             this.listResource.listen('ITEM-SELECTED-' + this._config.id, () => {
//                 this.checkbox.checked = true;
//                 this.node.classList.add(selectedClass);
//             });
//             this.listResource.listen('ITEM-DESELECTED-' + this._config.id, () => {
//                 this.checkbox.checked = false;
//                 this.node.classList.remove(selectedClass);
//             });
//         }
//     }

//     /**
//      * Initializes the list view.
//      */
//     _initializeView() {
//         /** @type {ListFilter} */
//         this.viewsFilter = this.listResource?.filters?.views;
//         this.view = this.viewsFilter?.getValue();
//         this.viewsFilter?.listen('value', view => {
//             this.view = view;
//             if (this.node?.isConnected) {
//                 this.update();
//             }
//         });
//     }

//     render() {
//         this.node = super.render();
//         this.setViewClass();
//         this.contentContainer = this.renderContentContainer();
//         this.contentContainer.append(...this.node.childNodes);
//         this.node.appendChild(this.contentContainer);
//         this.appendChildrenNode();
//         this.icon = this.renderIcon();
//         if (this.icon) {
//             this.node.prepend(this.icon);
//         }
//         this.iconRight = this.renderIconRight();
//         if (this.iconRight) {
//             this.node.appendChild(this.iconRight);
//         }
//         this.renderCheckbox();
//         this.renderNav();
//         if (this.hasChildren()) {
//             this.childrenNode.classList.add('listItem__children');
//             this.itemWrapperNode = document.createElement('div');
//             this.itemWrapperNode.classList.add('listItem__itemWrapper');
//             this.itemWrapperNode.append(...this.node.childNodes);
//             this.node.appendChild(this.itemWrapperNode);
//             this.appendChildrenNode();
//             this.node.classList.add('listItem--hasChildren');
//         }

//         return this.node;
//     }

//     renderCheckbox() {
//         if (this.listResource?.hasSelection()) {
//             const id = 'listItem__checkbox-' + this._config.id;
//             this.checkboxContainer = document.createElement('label');
//             this.checkboxContainer.setAttribute('for', id);
//             this.checkboxContainer.classList.add('listItem__checkboxContainer');
//             this.checkbox = document.createElement('input');
//             this.checkbox.type = 'checkbox';
//             this.checkbox.id = id;
//             this.checkbox.classList.add('listItem__checkbox');
//             this.checkbox.addEventListener('change', () => {
//                 this.setSelected();
//             });
//             this.checkbox.checked = this.listResource.isSelected(this._config);
//             this.setSelected();
//             this.checkboxContainer.appendChild(this.checkbox);
//             this.node.appendChild(this.checkboxContainer);
//         }
//     }

//     /**
//      * Sets the view class for the list item.
//      */
//     setViewClass() {
//         if (this.view) {
//             this.node.classList.add('listItem--' + this.view);
//             if (this.view === 'grid-compact') {
//                 this.node.classList.add('listItem--grid');
//             }
//         }
//     }

//     initializeImage() {
//         this?.imageComponent?.initializeImage();
//     }

//     /**
//      * Called when the image has loaded.
//      * @param {Event} event
//      */
//     _onImageLoaded(event) {
//         if (this._config.onImageLoaded) {
//             this._config.onImageLoaded(event, this);
//         }
//     }

//     /**
//      * Called when the image has failed to load.
//      * @param {Event} event
//      */
//     _onImageError(event) {
//         if (this._config.onImageError) {
//             this._config.onImageError(event, this);
//         }
//     }

//     /**
//      * Renders the image container.
//      * @returns {HTMLElement | undefined}
//      */
//     renderImageContainer() {
//         const { image, imageConfig = {} } = this._config;
//         if (typeof image !== 'undefined') {
//             this.imageComponent = new ImageComponent(image, {
//                 className: 'listItem__imageContainer',
//                 onLoad: event => this._onImageLoaded(event),
//                 onError: event => this._onImageError(event),
//                 highResSrc: this._config.highResImage,
//                 caption: this._config?.name,
//                 ...imageConfig
//             });
//             this.imageNode = this.imageComponent.render();
//             this.image = this.imageComponent.image;
//             return this.imageNode;
//         }
//     }

//      * Renders the subtitle.
//      * @returns {HTMLElement | undefined}
//      */
//     renderSubTitle() {
//         const { subTitle, tags } = this._config;
//         if (subTitle || tags) {
//             const node = document.createElement('span');
//             const content = new AbstractContent(subTitle).render();
//             node.appendChild(content);
//             node.classList.add('listItem__subTitle');
//             this.tagsNode = this.renderTags();
//             if (this.tagsNode) {
//                 node.appendChild(this.tagsNode);
//             }
//             return node;
//         }
//     }

//     renderTags(tags = this._config.tags ?? []) {
//         /** @type {Tag[]} tagInstances */
//         this.tagInstances = [];
//         /** @type {TagInterface[]} tags */
//         this.tags = tags;
//         const node = document.createElement('div');
//         node.classList.add('listItem__tags');
//         this.tags.forEach(tag => {
//             if (!tag?.text) {
//                 return;
//             }
//             const tagInstance = new Tag(tag.id, {
//                 ...tag,
//                 tooltipPosition: ''
//             });
//             this.tagInstances.push(tagInstance);
//             const tagNode = tagInstance.render();
//             node.appendChild(tagNode);
//         });
//         return node;
//     }

//     /**
//      * Preloads the icon menu because of import dependency error.
//      * @returns {IconMenu}
//      */
//     async getIconMenu() {
//         if (this.IconMenu) {
//             return this.IconMenu;
//         }
//         this.IconMenu = (await import('../../../navigation/components/iconMenu/iconMenu.js')).default;
//         return this.IconMenu;
//     }

//     /**
//      * Renders the navigation for the list item.
//      */
//     async renderNav() {
//         const nav = this._config.nav;
//         if (nav) {
//             const navStub = document.createElement('span');
//             this.node.appendChild(navStub);
//             const IconMenu = await this.getIconMenu();
//             this.navComponent = new IconMenu('nav', nav);
//             this.navNode = this.navComponent.render();
//             this.navNode.classList.add('listItem__nav');
//             navStub.parentNode.replaceChild(this.navNode, navStub);
//         }
//     }

//     /**
//      * Deletes the list item.
//      */
//     delete() {
//         const component = this?.layout?.getComponent();
//         /** @type {ListResource} */
//         const list = component?.listResource;
//         if (!list) {
//             super.delete();
//         } else {
//             list.removeItem(this._config);
//         }
//     }
// }

export default ListItem;
