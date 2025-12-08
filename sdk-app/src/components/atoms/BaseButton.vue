<script setup lang="ts">
/**
 * Base Button Component
 *
 * A versatile button component with primary, secondary, and text variants.
 * Supports icons (including arrow icon) and multiple sizes.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'text'
export type ButtonSize = 'sm' | 'md'
export type ButtonIcon = 'arrow' | 'none'
export type ButtonType = 'button' | 'submit' | 'reset'

interface Props {
  /** Visual variant of the button */
  variant?: ButtonVariant
  /** Size variant */
  size?: ButtonSize
  /** Icon to display (currently supports 'arrow') */
  icon?: ButtonIcon
  /** Whether the button is disabled */
  disabled?: boolean
  /** HTML button type attribute */
  type?: ButtonType
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  icon: 'none',
  disabled: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="[
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="base-button__content">
      <slot />

      <!-- Arrow Icon -->
      <svg
        v-if="icon === 'arrow'"
        class="base-button__icon"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3.33337 8H12.6667"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.66663 4L12.6666 8L8.66663 12"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </button>
</template>

<style scoped lang="scss">
$primary-blue: #3B5EFF;
$primary-blue-hover: #2D4FE6;
$primary-blue-active: #2443CC;
$text-white: #FFFFFF;
$text-blue: #3B5EFF;
$border-blue: #3B5EFF;
$disabled-bg: #E5E7EB;
$disabled-text: #9CA3AF;

.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  white-space: nowrap;
  border: 2px solid transparent;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba($primary-blue, 0.3);
  }

  // Size variants
  &--sm {
    padding: 6px 12px;
    font-size: 13px;
    line-height: 1.4;
    border-radius: 6px;

    .base-button__icon {
      width: 14px;
      height: 14px;
      margin-left: 4px;
    }
  }

  &--md {
    padding: 10px 20px;
    font-size: 14px;
    line-height: 1.5;
    border-radius: 8px;

    .base-button__icon {
      width: 16px;
      height: 16px;
      margin-left: 6px;
    }
  }

  // Variant styles
  &--primary {
    background: $primary-blue;
    color: $text-white;
    border-color: $primary-blue;

    &:hover:not(:disabled) {
      background: $primary-blue-hover;
      border-color: $primary-blue-hover;
    }

    &:active:not(:disabled) {
      background: $primary-blue-active;
      border-color: $primary-blue-active;
    }
  }

  &--secondary {
    background: $text-white;
    color: $text-blue;
    border-color: $border-blue;

    &:hover:not(:disabled) {
      background: rgba($primary-blue, 0.05);
    }

    &:active:not(:disabled) {
      background: rgba($primary-blue, 0.1);
    }
  }

  &--text {
    background: transparent;
    color: $text-blue;
    border-color: transparent;
    padding-left: 8px;
    padding-right: 8px;

    &:hover:not(:disabled) {
      background: rgba($primary-blue, 0.05);
    }

    &:active:not(:disabled) {
      background: rgba($primary-blue, 0.1);
    }
  }

  // Disabled state
  &--disabled,
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--primary.base-button--disabled,
  &--primary:disabled {
    background: $disabled-bg;
    border-color: $disabled-bg;
    color: $disabled-text;
    opacity: 1;
  }

  &--secondary.base-button--disabled,
  &--secondary:disabled {
    border-color: $disabled-bg;
    color: $disabled-text;
    opacity: 1;
  }

  &--text.base-button--disabled,
  &--text:disabled {
    color: $disabled-text;
    opacity: 1;
  }
}

.base-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.base-button__icon {
  flex-shrink: 0;
}
</style>
