export type BatchOperationConfigType = {
    value: string;
    label: string;
    action: (ids: string[]) => void;
};