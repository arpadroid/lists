import { ArpaElement } from '@arpadroid/ui';
import { appendNodes, attrString } from '@arpadroid/tools';
// import Sticky from '../../../../components/sticky/sticky.js';

const html = String.raw;
class ListControls extends ArpaElement {
    initializeProperties() {
        this.list = this.closest('.arpaList, arpa-list');
        this.listResource = this.list?.listResource;
        super.initializeProperties();
    }

    getDefaultConfig() {
        return {
            className: 'listControls',
            hasStickyControls: this.list?.hasStickyControls(),
            template: html`{search}{sort}{views}{multiSelect}`
        };
    }

    getTemplateVars() {
        return {
            search: this.renderSearch(),
            views: this.renderViews(),
            multiSelect: this.renderMultiSelect(),
            sort: this.renderSort()
        };
    }

    renderSort() {
        if (!this.list?.hasSort()) return '';
        return html`<list-sort
            ${attrString({
                'lbl-sort-asc': this.list.getProperty('lbl-sort-asc'),
                'lbl-sort-desc': this.list.getProperty('lbl-sort-desc'),
                'lbl-no-selection': this.list.getProperty('lbl-no-selection'),
                'lbl-sorted-by': this.list.getProperty('lbl-sorted-by')
            })}
        ></list-sort>`;
    }

    renderMultiSelect() {
        return this.list?.hasMultiSelect() ? html`<list-multi-select></list-multi-select>` : '';
    }

    renderViews() {
        return this.list?.hasViews() ? html`<list-views></list-views>` : '';
    }

    renderSearch() {
        return this.list?.hasSearch() ? html`<list-search></list-search>` : '';
    }

    _onConnected() {
        super._onConnected();
        this.search = this.querySelector('list-search');
        this.views = this.querySelector('list-views');
        this.multiSelect = this.querySelector('list-multi-select');
        appendNodes(this, this._childNodes);
    }
}

customElements.define('list-controls', ListControls);

export default ListControls;
