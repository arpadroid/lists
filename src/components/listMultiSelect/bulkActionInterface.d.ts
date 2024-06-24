import { AbstractContentInterface } from '../../../../components/abstract-component/abstractComponent';
import { SelectOptionInterface } from '../../../form/components/fields/selectField/components/selectOption/selectOptionInterface';

export interface BulkActionInterface extends SelectOptionInterface {
    value?: string;
    content?: AbstractContentInterface;
    action: (ids: string[]) => void;
    actionContent?: AbstractContentInterface;
}
