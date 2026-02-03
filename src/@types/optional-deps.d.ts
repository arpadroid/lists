/**
 * Re-export actual types from installed packages.
 * 
 * This file ensures TypeScript can resolve types from @arpadroid peer dependencies
 * by re-exporting from the actual packages' compiled type definitions.
 * 
 * Note: Cannot use `export *` to re-export default exports, so each class
 * must be explicitly listed. However, type-only exports can use wildcard syntax.
 */

declare module '@arpadroid/messages' {
    export { default as Messages } from '@arpadroid/messages/dist/@types/components/messages/messages.js';
    export { default as Message } from '@arpadroid/messages/dist/@types/components/message/message.js';
}

declare module '@arpadroid/forms' {
    export { default as FormComponent } from '@arpadroid/forms/dist/@types/components/form/form.js';
    export { default as Field } from '@arpadroid/forms/dist/@types/components/field/field.js';
    export { default as SelectCombo } from '@arpadroid/forms/dist/@types/components/selectCombo/selectCombo.js';
    export { default as NumberField } from '@arpadroid/forms/dist/@types/components/numberField/numberField.js';
    export { default as SearchField } from '@arpadroid/forms/dist/@types/components/searchField/searchField.js';
    export type { FieldOptionConfigType, FormSubmitType } from '@arpadroid/forms/dist/@types/types.compiled.js';
}

declare module '@arpadroid/navigation' {
    export { default as IconMenu } from '@arpadroid/navigation/dist/@types/components/iconMenu/iconMenu.js';
    export { default as NavList } from '@arpadroid/navigation/dist/@types/components/navList/navList.js';
    export { default as NavLink } from '@arpadroid/navigation/dist/@types/components/navLink/navLink.js';
    export type { NavLinkConfigType, SelectedCallbackPayloadType } from '@arpadroid/navigation/dist/@types/types.compiled.js';
}
