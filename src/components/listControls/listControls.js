import { ArpaElement } from '@arpadroid/ui';
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
            template: html`{search}{multiSelect}{views}`
        };
    }

    getTemplateVars() {
        return {
            search: this.renderSearch(),
            views: this.renderViews(),
            multiSelect: this.renderMultiSelect()
        };
    }

    renderMultiSelect() {
        return this.list?.hasMultiSelect() ? html`<list-multi-select></list-multi-select>` : '';
    }

    renderViews() {
        return this.list?.hasViews() ? html`<list-views></list-views>` : '';
    }

    renderSearch() {
        const canRender = this.list?.hasSearch() || this.list?.hasSort();
        return canRender ? html`<list-search></list-search>` : '';
    }

    _onConnected() {
        super._onConnected();
        this.search = this.querySelector('list-search');
        this.views = this.querySelector('list-views');
        this.multiSelect = this.querySelector('list-multi-select');
        // super.postRender();
        // const { hasStickyControls } = this._config;
        // if (hasStickyControls) {
        //     if (!this.stickyControls) {
        //         this.stickyControls = new Sticky(this.node, {});
        //     } else {
        //         this.stickyControls.node = this.node;
        //     }
        // }
    }
}

customElements.define('list-controls', ListControls);

export default ListControls;
