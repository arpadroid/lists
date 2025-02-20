import { ArpaFragment } from '@arpadroid/ui';
import { appendNodes, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class BatchOperation extends ArpaFragment {
    constructor() {
        super();
        this.innerHTML = html`<select-option class="comboBox__item" ${this.getAttributes()}>
            ${this.innerHTML}
        </select-option>`;
        this.node = this.querySelector('select-option');
        this.node && appendNodes(this.node, this._childNodes);
    }
}

defineCustomElement('batch-operation', BatchOperation);

export default BatchOperation;
