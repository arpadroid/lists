import { mergeObjects } from '@arpadroid/tools';
import List from '../../list/list.js';
import TagItem from './tagItem/tagItem.js';

const html = String.raw;
class TagList extends List {

    _initialize() {
        super._initialize();
        this.classList.add('tagList');   
    }

    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            className: 'tagList',
            renderMode: 'minimal',
            hasResource: false,
            itemComponent: TagItem,
            noItemsContent: html`<i18n-text key="components.tagList.txtNoTags"></i18n-text>`
        });
    }
}

customElements.define('tag-list', TagList);

export default TagList;
