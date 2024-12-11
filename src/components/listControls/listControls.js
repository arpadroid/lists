import { ArpaElement } from '@arpadroid/ui';
import { appendNodes, attrString, ucFirst } from '@arpadroid/tools';

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
            controls: this.list?.getControls()
        };
    }

    hasControl(control) {
        return this.getControls().includes(control);
    }

    getControls() {
        return this.getArrayProperty('controls');
    }

    render() {
        const controls = this.getControls();
        let content = '';
        controls?.forEach(control => {
            const fnName = `render${ucFirst(control)}`;
            const fn = this[fnName]?.bind(this.list);
            if (this.hasControl(control) && typeof fn === 'function') {
                content += fn();
            }
        });

        if (controls?.length) {
            this.innerHTML = content || '';
        }
    }

    renderSort() {
        return html`<list-sort
            ${attrString({
                'lbl-sort-asc': this.getProperty('lbl-sort-asc'),
                'lbl-sort-desc': this.getProperty('lbl-sort-desc'),
                'lbl-no-selection': this.getProperty('lbl-no-selection'),
                'lbl-sorted-by': this.getProperty('lbl-sorted-by')
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
        this.search = this.querySelector('list-search');
        this.views = this.querySelector('list-views');
        this.multiSelect = this.querySelector('list-multi-select');
        appendNodes(this, this._childNodes);
    }
}

customElements.define('list-controls', ListControls);

export default ListControls;
