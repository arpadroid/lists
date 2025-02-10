import { FieldOptionConfigType } from '@arpadroid/forms';
import { ArpaElementConfigType } from '@arpadroid/ui';
export type MultiSelectConfigType = ArpaElementConfigType & {
    icon?: string;
    tooltip?: string;
    actions?: FieldOptionConfigType[];
};
