import { SelectOption } from '@arpadroid/forms';
import { mergeObjects } from '@arpadroid/tools';
// const html = String.raw;
class BatchOperation extends SelectOption {
    initializeProperties() {
        super.initializeProperties();
    }
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            className: 'comboBox__item'
        });
    }

    render() {
        super.render();
    }
}

customElements.define('batch-operation', BatchOperation);

export default BatchOperation;
