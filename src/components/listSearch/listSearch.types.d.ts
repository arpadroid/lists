import { ArpaElementConfigType } from '@arpadroid/ui/dist/@types/components/arpaElement/arpaElement.types';

export type ListSearchConfigType = ArpaElementConfigType & {
    hasMiniSearch?: boolean;
    searchSelector?: string;
    onSubmit?: (value: string) => void;
};
