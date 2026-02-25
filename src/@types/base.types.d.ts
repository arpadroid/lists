import { ListItemConfigType } from '../components/listItem/listItem.types';
import { ArpaElementConfigType } from '@arpadroid/ui';
import type { Router } from '@arpadroid/services';

/**
 * Base type for navigation link configuration.
 * This is the lists-side base that @arpadroid/navigation extends into NavLinkConfigType.
 */
export type BaseLinkConfigType = ListItemConfigType & {
    url?: string;
    action?: () => void;
    selected?: boolean;
    handlerAttributes?: Record<string, string | number | boolean>;
    router?: Router;
    divider?: string;
};

/**
 * Base type for navigation list configuration.
 * This is the lists-side base that @arpadroid/navigation extends into NavListConfigType.
 */
export type BaseNavListConfigType = {
    variant?: 'horizontal' | 'vertical' | 'default';
    divider?: string;
    links?: BaseLinkConfigType[];
};

/**
 * Base type for field option configuration.
 * This is the lists-side base that @arpadroid/forms extends into FieldOptionConfigType.
 */
export type BaseFieldOptionConfigType = ArpaElementConfigType & {
    label?: string;
    subTitle?: string;
    value?: string;
    disabled?: boolean;
    selected?: boolean;
    hidden?: boolean;
    tooltip?: string;
    icon?: string;
    iconLeft?: string;
    template?: string;
    className?: string;
    content?: string;
    onChange?: (checked: boolean, payload: any) => void;
    action?: (...args: unknown[]) => void;
};
