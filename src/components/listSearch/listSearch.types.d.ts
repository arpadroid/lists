import { ArpaElementConfigType } from '@arpadroid/ui';

export type ListSearchConfigType = ArpaElementConfigType & {
    hasMiniSearch?: boolean;
    searchSelector?: string;
    onSubmit?: (value: string) => void;
};
