/**
 * @typedef {import('./listControls.types').ListControlsConfigType} ListControlsConfigType
 * @typedef {import('../list/list').default} List
 * @typedef {import('../listSearch/listSearch').default} ListSearch
 * @typedef {import('../listViews/listViews').default} ListViews
 */
import { ArpaElement } from '@arpadroid/ui';
import { appendNodes, attrString, ucFirst, camelToDashed, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class ListControls extends ArpaElement {
    /** @type {ListControlsConfigType} */ // @ts-ignore
    _config = this._config;

    /**
     * Returns the list component.
     * @returns {List | null}
     */
    getList() {
        return this.closest('arpa-list, .arpaList');
    }

    /**
     * Initializes the properties.
     * @returns {boolean}
     */
    initializeProperties() {
        this.list = this.getList();
        this.listResource = this.list?.listResource;
        super.initializeProperties();
        return true;
    }

    /**
     * Returns the default config.
     * @returns {ListControlsConfigType}
     */
    getDefaultConfig() {
        return {
            className: 'listControls',
            hasStickyControls: this.list?.hasStickyControls(),
            controls: this.list?.getControls()
        };
    }

    /**
     * Checks if the control exists.
     * @param {string} control
     * @returns {boolean}
     */
    hasControl(control) {
        return Boolean(this.getControls()?.includes(control));
    }

    /**
     * Returns the controls.
     * @returns {string[]}
     */
    getControls() {
        return /** @type {string[]} */ (this.getArrayProperty('controls') || []);
    }

    render() {
        const controls = this.getControls();
        let content = '';
        controls?.forEach(control => {
            const fnName = `render${ucFirst(control)}`;
            if (this.hasControl(control)) {
                // @ts-ignore
                const fn = this[fnName];
                const tagName = `gallery-${camelToDashed(control)}`;
                if (fn) {
                    content += fn.call(this);
                } else {
                    content += html`<${tagName}></${tagName}>`;
                }
            }
        });

        if (controls?.length) {
            this.innerHTML = content || '';
        }
    }

    /**
     * Renders the sort component.
     * @param {List | null} list
     * @returns {string}
     */
    renderSort(list = this.getList()) {
        return html`<list-sort
            ${attrString({
                'lbl-sort-asc': list?.getProperty('lbl-sort-asc'),
                'lbl-sort-desc': list?.getProperty('lbl-sort-desc'),
                'lbl-no-selection': list?.getProperty('lbl-no-selection'),
                'lbl-sorted-by': list?.getProperty('lbl-sorted-by')
            })}
        ></list-sort>`;
    }

    renderMultiselect() {
        return html`<list-multi-select></list-multi-select>`;
    }

    renderViews() {
        return html`<list-views></list-views>`;
    }

    renderSearch() {
        return html`<list-search></list-search>`;
    }

    renderFilters() {
        return html`<list-filters></list-filters>`;
    }

    _onConnected() {
        super._onConnected();
        /** @type {ListSearch | null} */
        this.search = this.querySelector('list-search');
        /** @type {ListViews | null} */
        this.views = this.querySelector('list-views');
        this.multiSelect = this.querySelector('list-multi-select');
        appendNodes(this, this._childNodes);
    }
}

defineCustomElement('list-controls', ListControls);

export default ListControls;
