import { ArpaElementConfigType } from '@arpadroid/ui/dist/@types/components/arpaElement/arpaElement.types';

export type ListInfoConfigType = ArpaElementConfigType & {
    hasPrevNext?: boolean;
    hasRefresh?: boolean;
};
