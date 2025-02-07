import { ArpaElementConfigType } from '@arpadroid/ui/dist/@types/components/arpaElement/arpaElement.types';

export type ListSortConfigType = ArpaElementConfigType & {
    iconAsc?: string;
    iconDesc?: string;
    iconSort?: string;
    paramAsc?: string;
    paramDesc?: string;
};
