export type BatchOperationType = {
    value: string;
    label: string;
    action: (ids: string[]) => void;
};