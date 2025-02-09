import { ArpaElementConfigType } from '@arpadroid/ui';

export type ListControlsConfigType = ArpaElementConfigType & {
    hasStickControls?: boolean;
    controls?: string[];
};
