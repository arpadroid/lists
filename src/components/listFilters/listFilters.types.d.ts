import { ArpaElementConfigType } from "@arpadroid/ui/dist/@types/components/arpaElement/arpaElement.types";

export type ListFiltersConfigType = ArpaElementConfigType & {
    filters?: string[];
    onSubmit?: (value: string) => void;
    perPageOptions?: number[];
    buttonLabel?: string;
    icon?: string;
    label?: string;
};

export type ListFiltersSubmitPayloadType = {
    page?: number;
    perPage?: number;
};