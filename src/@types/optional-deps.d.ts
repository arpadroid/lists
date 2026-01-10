/**
 * Stub type declarations for optional peer dependencies.
 * These modules may not be available during build due to circular dependencies.
 */

declare module '@arpadroid/messages' {
    export type Messages = any;
    export type Message = any;
}

declare module '@arpadroid/forms' {
    export type FormComponent = any;
    export type Field = any;
    export type SelectCombo = any;
    export type NumberField = any;
    export type SearchField = any;
    export type FieldOptionConfigType = any;
    export type FormSubmitType = any;
}

declare module '@arpadroid/navigation' {
    export type IconMenu = any;
    export type NavList = any;
    export type NavLink = any;
    export type NavLinkConfigType = any;
    export type SelectedCallbackPayloadType = any;
}
