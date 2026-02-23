import { BaseFieldOptionConfigType } from '../../@types/base.types';
import { ArpaElementConfigType } from '@arpadroid/ui';
export type MultiSelectConfigType = ArpaElementConfigType & {
    icon?: string;
    tooltip?: string;
    actions?: BaseFieldOptionConfigType[];
};
