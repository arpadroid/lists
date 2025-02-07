import { ArpaElementConfigType } from "@arpadroid/ui/dist/@types/components/arpaElement/arpaElement.types";

export type ListControlsConfigType = ArpaElementConfigType & {
    hasStickControls?: boolean;
    controls?: string[];
}