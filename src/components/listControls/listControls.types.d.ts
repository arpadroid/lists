import { ArpaElementConfigType } from '@arpadroid/ui';

export type ListControlsConfigType = ArpaElementConfigType & {
    hasStickyControls?: boolean;
    controls?: string[];
};
