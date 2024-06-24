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
            template: html`{search}{views}{multiSelect}`
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
        return this.list?.hasSearch() ? html`<list-search></list-search>` : '';
    }

    postRender() {
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
