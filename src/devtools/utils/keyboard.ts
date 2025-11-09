/**
 * Keyboard utility functions for layout-independent keyboard handling.
 * 
 * These functions use logical key values (event.key) instead of physical key codes
 * (event.code or event.keyCode), making keyboard shortcuts work correctly on
 * Dvorak, AZERTY, and other non-QWERTY keyboard layouts.
 */

/**
 * Type for keyboard event - compatible with React and native DOM events
 */
export type KeyboardEventLike = {
    key: string;
    code?: string;
    keyCode?: number;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    preventDefault?: () => void;
    stopPropagation?: () => void;
};

/**
 * Modifier keys state
 */
export interface ModifierKeys {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}

/**
 * Keyboard shortcut definition
 */
export interface Shortcut {
    key: string; // Logical key (e.g., 'Enter', 'Escape', 'n', 'c')
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
}

/**
 * Check if the Enter key was pressed (using logical key value)
 * Works on all keyboard layouts (QWERTY, Dvorak, AZERTY, etc.)
 */
export function isEnterKey(event: KeyboardEventLike): boolean {
    return event.key === 'Enter';
}

/**
 * Check if the Escape key was pressed (using logical key value)
 */
export function isEscapeKey(event: KeyboardEventLike): boolean {
    return event.key === 'Escape';
}

/**
 * Check if the Tab key was pressed (using logical key value)
 */
export function isTabKey(event: KeyboardEventLike): boolean {
    return event.key === 'Tab';
}

/**
 * Check if the Backspace key was pressed (using logical key value)
 */
export function isBackspaceKey(event: KeyboardEventLike): boolean {
    return event.key === 'Backspace';
}

/**
 * Check if the Delete key was pressed (using logical key value)
 */
export function isDeleteKey(event: KeyboardEventLike): boolean {
    return event.key === 'Delete';
}

/**
 * Get modifier keys state from keyboard event
 */
export function getModifierKeys(event: KeyboardEventLike): ModifierKeys {
    return {
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        meta: event.metaKey,
    };
}

/**
 * Check if no modifier keys are pressed
 */
export function hasNoModifiers(event: KeyboardEventLike): boolean {
    return !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
}

/**
 * Check if only Shift modifier is pressed
 */
export function hasOnlyShift(event: KeyboardEventLike): boolean {
    return event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
}

/**
 * Check if Ctrl (or Cmd on macOS) is pressed
 * Handles platform differences: Ctrl on Windows/Linux, Cmd on macOS
 */
export function isCtrlOrCmd(event: KeyboardEventLike): boolean {
    // On macOS, metaKey is Cmd. On Windows/Linux, ctrlKey is Ctrl.
    // For cross-platform compatibility, check both but typically:
    // - macOS: use metaKey (Cmd)
    // - Windows/Linux: use ctrlKey (Ctrl)
    // This function returns true if either is pressed for maximum compatibility
    return event.ctrlKey || event.metaKey;
}

/**
 * Check if a keyboard event matches a shortcut definition
 * Uses logical keys for layout-independent matching
 */
export function matchesShortcut(event: KeyboardEventLike, shortcut: Shortcut): boolean {
    // Check if the key matches
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
        return false;
    }

    // Check modifier keys (default to false if not specified)
    const shiftMatch = shortcut.shift === undefined ? !event.shiftKey : shortcut.shift === event.shiftKey;
    const ctrlMatch = shortcut.ctrl === undefined ? !event.ctrlKey : shortcut.ctrl === event.ctrlKey;
    const altMatch = shortcut.alt === undefined ? !event.altKey : shortcut.alt === event.altKey;
    const metaMatch = shortcut.meta === undefined ? !event.metaKey : shortcut.meta === event.metaKey;

    return shiftMatch && ctrlMatch && altMatch && metaMatch;
}

/**
 * Check if event matches Ctrl/Cmd + key shortcut (cross-platform)
 * Handles platform differences: Ctrl on Windows/Linux, Cmd on macOS
 */
export function matchesCtrlOrCmdShortcut(event: KeyboardEventLike, key: string): boolean {
    const isCtrlOrCmdPressed = isCtrlOrCmd(event);
    const keyMatches = event.key.toLowerCase() === key.toLowerCase();
    const noOtherModifiers = !event.shiftKey && !event.altKey;
    
    // On macOS, if metaKey is pressed, ctrlKey should not be
    // On Windows/Linux, if ctrlKey is pressed, metaKey should not be
    // For simplicity, we allow either but require no other modifiers
    return isCtrlOrCmdPressed && keyMatches && noOtherModifiers;
}

/**
 * Normalize key value for comparison (lowercase, handle special cases)
 */
export function normalizeKey(key: string): string {
    return key.toLowerCase();
}

/**
 * Check if Enter key is pressed without any modifiers
 * Common pattern for submitting forms
 */
export function isEnterWithoutModifiers(event: KeyboardEventLike): boolean {
    return isEnterKey(event) && hasNoModifiers(event);
}

/**
 * Check if Enter key is pressed with only Shift modifier
 * Common pattern for line breaks in multiline inputs
 */
export function isShiftEnter(event: KeyboardEventLike): boolean {
    return isEnterKey(event) && hasOnlyShift(event);
}
