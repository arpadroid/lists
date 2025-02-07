// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { FieldOptionConfigType } from '@arpadroid/forms';
import { ArpaElementConfigType } from '@arpadroid/ui/src/components/arpaElement/arpaElement.types';
export type MultiSelectConfigType = ArpaElementConfigType & {
    icon?: string;
    tooltip?: string;

    actions?: FieldOptionConfigType[];
};
