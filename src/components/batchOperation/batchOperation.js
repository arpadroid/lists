import { ArpaFragment } from '@arpadroid/ui';

const html = String.raw;
class BatchOperation extends ArpaFragment {
    constructor() {
        super();
        this.innerHTML = html`<select-option class="comboBox__item" ${this.getAttributes()}>
            ${this.innerHTML}
        </select-option>`;
        this.node = this.querySelector('select-option');
        this.node.append(...this._childNodes);
    }
}

customElements.define('batch-operation', BatchOperation);

export default BatchOperation;
