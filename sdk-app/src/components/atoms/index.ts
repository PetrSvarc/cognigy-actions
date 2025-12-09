/**
 * Atom Components
 *
 * Atomic design pattern - smallest, reusable UI components.
 * These are the building blocks for larger molecules and organisms.
 */

// Components
export { default as Avatar } from './Avatar.vue'
export { default as TypingIndicator } from './TypingIndicator.vue'
export { default as BaseButton } from './BaseButton.vue'

// Types
export type { AvatarType, AvatarSize, AvatarStatus } from './Avatar.vue'
export type { TypingIndicatorSize } from './TypingIndicator.vue'
export type { ButtonVariant, ButtonSize, ButtonIcon, ButtonType } from './BaseButton.vue'
